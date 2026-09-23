<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReviewPklExtensionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isAdmin();
    }

    public function rules(): array
    {
        $isReject = $this->routeIs('perpanjangan.reject');

        return [
            'review_feedback' => [
                $isReject ? 'required' : 'nullable',
                'string',
                'max:2000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'review_feedback.required' => 'Feedback/alasan penolakan wajib diisi saat menolak pengajuan.',
            'review_feedback.max' => 'Feedback maksimal 2000 karakter.',
        ];
    }
}
