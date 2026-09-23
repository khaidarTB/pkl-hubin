<?php

namespace App\Http\Requests;

use App\Models\PklExtension;
use App\Models\Placement;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;
use Carbon\Carbon;

class StorePklExtensionRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Guru, Admin, and Industri can submit extension requests
        $user = $this->user();

        return $user && ($user->isGuru() || $user->isAdmin() || $user->isIndustri());
    }

    public function rules(): array
    {
        return [
            'placement_id' => 'required|exists:placements,id',
            'requested_start_date' => 'required|date',
            'requested_end_date' => 'required|date|after:requested_start_date',
            'reason' => 'required|string|min:10|max:2000',
            'extension_letter' => 'required|file|mimes:pdf,doc,docx|max:10240',
        ];
    }

    public function messages(): array
    {
        return [
            'placement_id.required' => 'Pilih siswa yang akan diajukan perpanjangan.',
            'placement_id.exists' => 'Data penempatan siswa tidak ditemukan.',
            'requested_start_date.required' => 'Tanggal mulai perpanjangan wajib diisi.',
            'requested_start_date.date' => 'Format tanggal mulai tidak valid.',
            'requested_end_date.required' => 'Tanggal selesai perpanjangan wajib diisi.',
            'requested_end_date.date' => 'Format tanggal selesai tidak valid.',
            'requested_end_date.after' => 'Tanggal selesai harus setelah tanggal mulai.',
            'reason.required' => 'Alasan perpanjangan wajib diisi.',
            'reason.min' => 'Alasan perpanjangan minimal 10 karakter.',
            'reason.max' => 'Alasan perpanjangan maksimal 2000 karakter.',
            'extension_letter.required' => 'Surat perpanjangan wajib diupload.',
            'extension_letter.file' => 'Surat perpanjangan harus berupa file.',
            'extension_letter.mimes' => 'Surat perpanjangan harus berformat PDF, DOC, atau DOCX.',
            'extension_letter.max' => 'Ukuran surat perpanjangan maksimal 10MB.',
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $user = $this->user();
                $placement = Placement::with('student')->find($this->placement_id);

                if (!$placement) {
                    return;
                }

                // Guru can only extend placements where they are the school supervisor
                if ($user->isGuru() && $placement->school_supervisor_id !== $user->id) {
                    $validator->errors()->add('placement_id', 'Anda tidak memiliki hak mengajukan perpanjangan untuk siswa ini.');
                    return;
                }

                // Industri can only extend placements where they are the industry supervisor
                if ($user->isIndustri() && $placement->industry_supervisor_id !== $user->id) {
                    $validator->errors()->add('placement_id', 'Anda tidak memiliki hak mengajukan perpanjangan untuk siswa ini.');
                    return;
                }

                // Placement must be active
                if (!in_array($placement->status, ['Aktif', 'Terlambat'])) {
                    $validator->errors()->add('placement_id', 'Perpanjangan hanya dapat diajukan untuk penempatan yang masih aktif.');
                    return;
                }

                $requestedStart = Carbon::parse($this->requested_start_date);
                $requestedEnd = Carbon::parse($this->requested_end_date);
                $currentEnd = Carbon::parse($placement->end_date);

                // requested_start_date must be >= current end_date (extension, not shortening)
                if ($requestedStart->lt($currentEnd)) {
                    $validator->errors()->add('requested_start_date', 'Tanggal mulai perpanjangan harus sama dengan atau setelah tanggal selesai PKL saat ini (' . $currentEnd->format('d/m/Y') . ').');
                    return;
                }

                // Gap between current end and new start should not be too large (max 7 days)
                if ($requestedStart->diffInDays($currentEnd) > 7) {
                    $validator->errors()->add('requested_start_date', 'Tanggal mulai perpanjangan terlalu jauh dari tanggal selesai PKL saat ini. Maksimal 7 hari setelah periode berakhir.');
                    return;
                }

                // Check for overlap with existing pending/approved extensions
                $hasOverlap = PklExtension::overlappingWith(
                    $placement->id,
                    $this->requested_start_date,
                    $this->requested_end_date
                )->exists();

                if ($hasOverlap) {
                    $validator->errors()->add('requested_start_date', 'Periode perpanjangan bertabrakan dengan pengajuan perpanjangan lain yang masih pending atau sudah disetujui.');
                }
            },
        ];
    }
}
