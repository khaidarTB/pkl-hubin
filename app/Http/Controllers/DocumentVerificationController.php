<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\DocumentVerification;
use App\Models\DocumentVerificationLog;
use Carbon\Carbon;
use Illuminate\Support\Str;

class DocumentVerificationController extends Controller
{
    /**
     * PUBLIC ROUTE: QR Code Document Verification via secure token scan.
     * Route: GET /verify/{token}
     */
    public function verify(Request $request, string $token): Response
    {
        $verification = DocumentVerification::where('verification_token', $token)
            ->with([
                'document.creator',
                'document.visit.teacher',
                'document.visit.student.user',
                'document.visit.company',
            ])
            ->first();

        // INVALID: unknown token — do not log (no record to attach), show generic error.
        if (!$verification) {
            return Inertia::render('Verify/Show', [
                'status' => 'INVALID',
                'verification' => null,
                'last_verified' => null,
            ]);
        }

        // Catat verification attempt (security requirement).
        $log = DocumentVerificationLog::create([
            'document_verification_id' => $verification->id,
            'verified_at' => Carbon::now(),
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->header('User-Agent'), 0, 500),
        ]);

        $lastVerified = $verification->logs()
            ->where('id', '!=', $log->id)
            ->orderBy('verified_at', 'desc')
            ->first();

        $verification->loadCount('logs');

        return Inertia::render('Verify/Show', [
            // Dokumen revoked: sembunyikan detail isi surat, cukup status + identitas verifikasi.
            'status' => $verification->status,
            'verification' => $this->sanitizeForPublic($verification, $verification->status === 'REVOKED'),
            'last_verified' => $lastVerified
                ? $lastVerified->verified_at->translatedFormat('d F Y, H:i') . ' WIB'
                : null,
        ]);
    }

    /**
     * Strip sensitive/internal fields before sending to the public verify page.
     */
    private function sanitizeForPublic(DocumentVerification $verification, bool $revoked): array
    {
        $doc = $verification->document;
        $data = $doc?->data ?? [];

        $payload = [
            'id' => $verification->id,
            'verification_code' => $verification->verification_code,
            'document_number' => $verification->document_number,
            'document_type' => $verification->document_type,
            'status' => $verification->status,
            'verified_at' => $verification->verified_at?->toISOString(),
            'revoked_at' => $verification->revoked_at?->toISOString(),
            'created_at' => $verification->created_at?->toISOString(),
            'logs_count' => $verification->logs_count ?? null,
        ];

        if ($revoked) {
            // Jangan expose data sensitif ketika dokumen sudah revoked.
            return $payload;
        }

        $payload['document'] = [
            'title' => $doc?->title,
            'data' => [
                'nama_guru' => $data['nama_guru'] ?? null,
                'nip' => $data['nip'] ?? null,
                'nama_siswa' => $data['nama_siswa'] ?? null,
                'kelas' => $data['kelas'] ?? null,
                'nama_industri' => $data['nama_industri'] ?? null,
                'alamat_industri' => $data['alamat_industri'] ?? null,
                'tanggal_kunjungan' => $data['tanggal_kunjungan'] ?? null,
                'tujuan_kunjungan' => $data['tujuan_kunjungan'] ?? null,
            ],
        ];

        return $payload;
    }

    /**
     * ADMIN ROUTE: Document Verification dashboard.
     * Route: GET /admin/verifikasi-dokumen
     */
    public function adminIndex(Request $request): Response
    {
        $statusFilter = $request->query('status', 'ALL');
        $search = trim((string) $request->query('search', ''));

        $query = DocumentVerification::query()
            ->with(['document:id,title,type,status,data,document_number,created_by'])
            ->withCount('logs');

        if ($statusFilter !== 'ALL' && in_array($statusFilter, ['VALID', 'REVOKED', 'EXPIRED'])) {
            $query->where('status', $statusFilter);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('verification_code', 'like', "%{$search}%")
                  ->orWhere('document_number', 'like', "%{$search}%")
                  ->orWhereHas('document', fn ($docQ) => $docQ->where('title', 'like', "%{$search}%"));
            });
        }

        $verifications = $query->orderBy('created_at', 'desc')->get()->map(
            fn (DocumentVerification $v) => $this->presentAdminRow($v)
        );

        $stats = [
            'total' => DocumentVerification::count(),
            'valid' => DocumentVerification::where('status', 'VALID')->count(),
            'revoked' => DocumentVerification::where('status', 'REVOKED')->count(),
            'expired' => DocumentVerification::where('status', 'EXPIRED')->count(),
            'scans' => DocumentVerificationLog::count(),
        ];

        return Inertia::render('Admin/DocumentVerification/Index', [
            'verifications' => $verifications,
            'stats' => $stats,
            'filters' => [
                'status' => $statusFilter,
                'search' => $search,
            ],
        ]);
    }

    /**
     * ADMIN ROUTE: Document detail (preview PDF, QR Code, verification count, audit trail).
     * Route: GET /admin/verifikasi-dokumen/{id}
     */
    public function adminShow(int $id): Response
    {
        $verification = DocumentVerification::with([
            'document.creator',
            'document.template',
            'document.visit.teacher',
            'document.visit.student.user',
            'document.visit.company',
        ])
            ->withCount('logs')
            ->findOrFail($id);

        $logs = $verification->logs()
            ->orderBy('verified_at', 'desc')
            ->take(20)
            ->get(['id', 'verified_at', 'ip_address']);

        return Inertia::render('Admin/DocumentVerification/Detail', [
            'verification' => array_merge($this->presentAdminRow($verification), [
                // Token hanya dikirim ke Admin Hubin untuk render ulang QR Code.
                'verification_token' => $verification->verification_token,
                'qr_payload' => $verification->buildQrPayload(),
                'document' => [
                    'id' => $verification->document?->id,
                    'title' => $verification->document?->title,
                    'type' => $verification->document?->type,
                    'status' => $verification->document?->status,
                    'generated_file_path' => $verification->document?->generated_file_path,
                    'data' => $verification->document?->data ?? [],
                    'creator_name' => $verification->document?->creator?->name,
                    'template_name' => $verification->document?->template?->name,
                ],
                'recent_logs' => $logs->map(fn ($log) => [
                    'id' => $log->id,
                    'verified_at' => $log->verified_at?->toISOString(),
                    'ip_address' => $log->ip_address,
                ]),
            ]),
        ]);
    }

    /**
     * ADMIN ROUTE: Revoke a document's verification status.
     * Route: POST /admin/verifikasi-dokumen/{id}/revoke
     */
    public function revoke(Request $request, int $id)
    {
        $verification = DocumentVerification::findOrFail($id);

        $verification->update([
            'status' => 'REVOKED',
            'revoked_at' => Carbon::now(),
        ]);

        if ($verification->document && $verification->document->status !== 'revoked') {
            $verification->document->update(['status' => 'revoked']);
        }

        return back()->with('success', "Dokumen {$verification->verification_code} telah dicabut dan tidak berlaku lagi.");
    }

    /**
     * ADMIN ROUTE: Regenerate QR token (old token is deactivated automatically).
     * Identity (Verification ID) stays the same; status is preserved.
     * Route: POST /admin/verifikasi-dokumen/{id}/regenerate-qr
     */
    public function regenerateQr(Request $request, int $id)
    {
        $verification = DocumentVerification::findOrFail($id);

        $verification->update([
            'verification_token' => $this->generateSecureToken(),
        ]);

        return back()->with(
            'success',
            "QR Code baru berhasil diregenerasi untuk {$verification->verification_code}. Token lama otomatis dinonaktifkan."
        );
    }

    /**
     * Cryptographically secure, unguessable, non-sequential token.
     */
    private function generateSecureToken(): string
    {
        do {
            $token = 'PKL-' . Str::upper(Str::random(12));
        } while (DocumentVerification::where('verification_token', $token)->exists());

        return $token;
    }

    private function presentAdminRow(DocumentVerification $v): array
    {
        return [
            'id' => $v->id,
            'document_id' => $v->document_id,
            'verification_code' => $v->verification_code,
            'document_type' => $v->document_type,
            'document_number' => $v->document_number,
            'status' => $v->status,
            'issued_at' => $v->created_at?->toISOString(),
            'verified_at' => $v->verified_at?->toISOString(),
            'revoked_at' => $v->revoked_at?->toISOString(),
            'verification_count' => $v->logs_count ?? 0,
            'document_title' => $v->document?->title,
        ];
    }
}
