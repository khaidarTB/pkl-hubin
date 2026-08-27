<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Document;
use App\Models\DocumentTemplate;
use App\Models\DocumentVerification;
use App\Models\Notification;
use Carbon\Carbon;
use Illuminate\Support\Str;

class DocumentController extends Controller
{
    /**
     * Cryptographically secure, unguessable, non-sequential verification token.
     */
    private function generateSecureToken(): string
    {
        do {
            $token = 'PKL-' . Str::upper(Str::random(12));
        } while (DocumentVerification::where('verification_token', $token)->exists());

        return $token;
    }

    /**
     * Verification ID derived from the document identity (e.g. PKL-2026-082-001).
     * Unique per document, never a raw database ID exposed alone.
     */
    private function makeVerificationCode(Document $doc): string
    {
        $code = 'PKL-' . Carbon::now()->format('Y') . '-082-' . str_pad((string) $doc->id, 3, '0', STR_PAD_LEFT);

        while (DocumentVerification::where('verification_code', $code)->exists()) {
            $code .= '-' . Str::upper(Str::random(2));
        }

        return $code;
    }

    /**
     * Ensure every document carries its QR Code Document Verification record.
     */
    private function ensureVerification(Document $doc): DocumentVerification
    {
        if ($doc->verification) {
            return $doc->verification;
        }

        return DocumentVerification::create([
            'document_id' => $doc->id,
            'verification_code' => $this->makeVerificationCode($doc),
            'verification_token' => $this->generateSecureToken(),
            'document_type' => $doc->type ?? 'surat_tugas',
            'document_number' => $doc->document_number ?? 'PKL/SMK-TB/' . Carbon::now()->format('m') . '/' . Carbon::now()->format('Y'),
            'status' => 'VALID',
        ]);
    }

    // List all generated documents & templates
    public function index(Request $request): Response
    {
        $documents = Document::with(['template', 'visit.student.user', 'creator', 'verification'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Self-heal: ensure all existing documents have verification records
        foreach ($documents as $doc) {
            if (!$doc->verification) {
                $this->ensureVerification($doc);
                $doc->load('verification');
            }
        }

        $templates = DocumentTemplate::with('uploader')->get();

        return Inertia::render('Document/Index', [
            'documents' => $documents,
            'templates' => $templates,
        ]);
    }

    // Preview specific document
    public function show($id): Response
    {
        $document = Document::with(['template', 'visit.student.user', 'visit.teacher', 'visit.company', 'creator', 'verification'])
            ->findOrFail($id);

        if (!$document->verification) {
            $this->ensureVerification($document);
            $document->load('verification');
        }

        // QR Code berisi identitas dokumen + penanda tangan + URL verifikasi ber-token.
        $verifyUrl = url('/verify/' . $document->verification->verification_token);

        return Inertia::render('Document/Preview', [
            'document' => $document,
            'verification_url' => $verifyUrl,
            'qr_payload' => $document->verification->buildQrPayload(),
        ]);
    }

    // STEP 1-9: Generate official document + Document Verification identity
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'document_type' => 'required|string',
            'nama_guru' => 'required|string|max:255',
            'nip' => 'nullable|string',
            'nama_siswa' => 'required|string|max:255',
            'nis' => 'nullable|string',
            'kelas' => 'nullable|string',
            'nama_industri' => 'required|string|max:255',
            'alamat_industri' => 'nullable|string',
            'tanggal_kunjungan' => 'required|date',
            'tujuan_kunjungan' => 'nullable|string',
        ]);

        $now = Carbon::now();
        $seq = str_pad((string) (Document::count() + 1), 3, '0', STR_PAD_LEFT);
        $docNum = "PKL/SMK-TB/{$now->format('m')}/{$now->format('Y')}";

        // STEP 1-2: Create document from official school template placeholders.
        $doc = Document::create([
            'template_id' => 1,
            'document_number' => $docNum,
            'title' => $validated['title'],
            'type' => $validated['document_type'],
            'status' => 'final', // Surat resmi langsung terbit dengan identitas verifikasi
            'data' => [
                'nomor_surat' => $docNum,
                'nama_guru' => $validated['nama_guru'],
                'nip' => $validated['nip'] ?? '19750812 200212 2 001',
                'nama_siswa' => $validated['nama_siswa'],
                'nis' => $validated['nis'] ?? '222310452',
                'kelas' => $validated['kelas'] ?? 'XII RPL 1',
                'nama_industri' => $validated['nama_industri'],
                'alamat_industri' => $validated['alamat_industri'] ?? 'Jakarta',
                'tanggal_kunjungan' => Carbon::parse($validated['tanggal_kunjungan'])->translatedFormat('d F Y'),
                'tujuan_kunjungan' => $validated['tujuan_kunjungan'] ?? 'Monitoring Praktik Kerja Lapangan (PKL)',
            ],
            'created_by' => $request->user()->id,
        ]);

        // STEP 3-5: Document Number, Verification ID & Secure Verification Token.
        $verificationCode = $this->makeVerificationCode($doc);

        // STEP 6: Register QR verification identity (QR berisi URL /verify/{token}).
        DocumentVerification::create([
            'document_id' => $doc->id,
            'verification_code' => $verificationCode,
            'verification_token' => $this->generateSecureToken(),
            'document_type' => $doc->type,
            'document_number' => $docNum,
            'status' => 'VALID',
        ]);

        // Autofill placeholder {{verification_id}} ke template.
        $doc->update([
            'data' => array_merge($doc->data, ['verification_id' => $verificationCode]),
        ]);

        Notification::create([
            'user_id' => $request->user()->id,
            'title' => '🛡️ Verification ID Diterbitkan',
            'message' => "Dokumen \"{$doc->title}\" ({$docNum}) terbit dengan Verification ID: {$verificationCode}.",
            'type' => 'success',
            'icon' => 'ShieldCheck',
            'link' => "/dokumen/{$doc->id}",
        ]);

        // STEP 7-9: QR ditempatkan pada template surat → PDF dapat di-download/cetak.
        return redirect()
            ->route('dokumen.show', $doc->id)
            ->with('success', "Surat Tugas Resmi berhasil diterbitkan dengan Verification ID {$verificationCode}.");
    }

    // Upload template (Admin)
    public function storeTemplate(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|string',
        ]);

        DocumentTemplate::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'file_path' => 'templates/custom_official_template.docx',
            'placeholders' => [
                'nomor_surat', 'nama_guru', 'nip', 'nama_siswa', 'nis', 'kelas',
                'nama_industri', 'alamat_industri', 'tanggal_kunjungan', 'tujuan_kunjungan',
                'verification_id', 'verification_qr',
            ],
            'uploaded_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Template surat resmi sekolah berhasil dikonfigurasi!');
    }
}
