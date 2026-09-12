<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceSettingsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/AttendanceSettings/Index', [
            'settings' => [
                'max_gps_accuracy' => (float) Setting::get('max_gps_accuracy', config('attendance.max_gps_accuracy', 50)),
            ],
            'envDefault' => (float) config('attendance.max_gps_accuracy', 50),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'max_gps_accuracy' => 'required|integer|min:10|max:5000',
        ], [
            'max_gps_accuracy.required' => 'Batas akurasi GPS wajib diisi.',
            'max_gps_accuracy.integer' => 'Batas akurasi harus berupa angka bulat.',
            'max_gps_accuracy.min' => 'Batas akurasi minimal 10 meter.',
            'max_gps_accuracy.max' => 'Batas akurasi maksimal 5000 meter.',
        ]);

        Setting::set('max_gps_accuracy', $validated['max_gps_accuracy']);

        return back()->with('success', "Batas akurasi GPS berhasil diubah menjadi {$validated['max_gps_accuracy']} m.");
    }
}