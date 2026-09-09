<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GeoCheckinRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isSiswa() ?? false;
    }

    /**
     * Hanya koordinat mentah dari browser GPS yang diterima.
     * Jarak, status, dan waktu TIDAK pernah diterima dari frontend.
     */
    public function rules(): array
    {
        return [
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'accuracy' => ['required', 'numeric', 'min:0', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'latitude.required' => 'Koordinat latitude tidak ditemukan.',
            'latitude.between' => 'Koordinat latitude tidak valid.',
            'longitude.required' => 'Koordinat longitude tidak ditemukan.',
            'longitude.between' => 'Koordinat longitude tidak valid.',
            'accuracy.required' => 'Akurasi GPS tidak ditemukan.',
            'accuracy.max' => 'Akurasi GPS terlalu tidak akurat.',
        ];
    }
}