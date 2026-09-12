<?php

use App\Http\Controllers\Admin\PklPeriodController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\AIController;
use App\Http\Controllers\AssessmentAspectController;
use App\Http\Controllers\AssessmentController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AttendanceSettingsController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\DocumentVerificationController;
use App\Http\Controllers\JournalController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\MonitoringController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PklApplicationController;
use App\Http\Controllers\PlacementController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\VisitController;
use App\Http\Controllers\WhatsAppController;
use Illuminate\Support\Facades\Route;

// Public Routes
Route::get('/', [LandingController::class, 'index'])->name('landing');
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// PUBLIC DIGITAL DOCUMENT VERIFICATION ROUTE (Scan QR Code)
Route::get('/verify/{token}', [DocumentVerificationController::class, 'verify'])
    ->middleware('throttle:60,1')
    ->name('document.verify');

// Authenticated Routes
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Siswa PKL Application Workflow
    Route::get('/pkl/pendaftaran', [PklApplicationController::class, 'pendaftaran'])->name('pkl.pendaftaran');
    Route::post('/pkl/pendaftaran', [PklApplicationController::class, 'store'])->name('pkl.pendaftaran.store');
    Route::get('/pkl/status', [PklApplicationController::class, 'status'])->name('pkl.status');
    Route::get('/pkl/file/{id}', [PklApplicationController::class, 'showFile'])->name('pkl.file');

    // Admin Application Management
    Route::get('/admin/pengajuan', [PklApplicationController::class, 'adminIndex'])->name('admin.pengajuan.index');
    Route::post('/admin/pengajuan/{id}/approve', [PklApplicationController::class, 'approve'])->name('admin.pengajuan.approve');
    Route::post('/admin/pengajuan/{id}/revision', [PklApplicationController::class, 'revision'])->name('admin.pengajuan.revision');
    Route::post('/admin/pengajuan/{id}/reject', [PklApplicationController::class, 'reject'])->name('admin.pengajuan.reject');

    // Admin Placement Management
    Route::get('/admin/penempatan', [PlacementController::class, 'index'])->name('admin.penempatan.index');
    Route::post('/admin/penempatan', [PlacementController::class, 'store'])->name('admin.penempatan.store');
    Route::put('/admin/penempatan/{id}', [PlacementController::class, 'update'])->name('admin.penempatan.update');
    Route::put('/admin/penempatan/{id}/quick-status', [PlacementController::class, 'quickStatus'])->name('admin.penempatan.quick-status');
    Route::delete('/admin/penempatan/{id}', [PlacementController::class, 'destroy'])->name('admin.penempatan.destroy');

    // Admin Company Partner Management
    Route::get('/admin/perusahaan', [CompanyController::class, 'index'])->name('admin.perusahaan.index');
    Route::post('/admin/perusahaan', [CompanyController::class, 'store'])->name('admin.perusahaan.store');
    Route::put('/admin/perusahaan/{id}', [CompanyController::class, 'update'])->name('admin.perusahaan.update');
    Route::delete('/admin/perusahaan/{id}', [CompanyController::class, 'destroy'])->name('admin.perusahaan.destroy');

    // Visit Management (Guru & Admin)
    Route::get('/kunjungan', [VisitController::class, 'index'])->name('kunjungan.index');
    Route::post('/kunjungan', [VisitController::class, 'store'])->name('kunjungan.store');
    Route::post('/kunjungan/{id}/laporan', [VisitController::class, 'storeReport'])->name('kunjungan.laporan');

    // Document Generation & QR Code Document Verification
    Route::get('/dokumen', [DocumentController::class, 'index'])->name('dokumen.index');
    Route::post('/dokumen', [DocumentController::class, 'store'])->name('dokumen.store');
    Route::get('/dokumen/{id}', [DocumentController::class, 'show'])->name('dokumen.show');
    Route::post('/admin/template-dokumen', [DocumentController::class, 'storeTemplate'])->name('admin.template.store');

    // Admin Routes
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/verifikasi-dokumen', [DocumentVerificationController::class, 'adminIndex'])->name('admin.verification.index');
        Route::get('/admin/verifikasi-dokumen/{id}', [DocumentVerificationController::class, 'adminShow'])->name('admin.verification.show');
        Route::post('/admin/verifikasi-dokumen/{id}/revoke', [DocumentVerificationController::class, 'revoke'])->name('admin.verification.revoke');
        Route::post('/admin/verifikasi-dokumen/{id}/regenerate-qr', [DocumentVerificationController::class, 'regenerateQr'])->name('admin.verification.regenerate');

        // Admin User Management (Guru)
        Route::get('/admin/guru', [UserController::class, 'index'])->name('admin.guru.index');
        Route::post('/admin/guru', [UserController::class, 'store'])->name('admin.guru.store');
        Route::delete('/admin/guru/{user}', [UserController::class, 'destroy'])->name('admin.guru.destroy');

        // Admin Assessment Aspect Configuration (Aspek & Nilai Minimum)
        Route::get('/admin/aspek-nilai', [AssessmentAspectController::class, 'index'])->name('admin.aspek.index');
        Route::post('/admin/aspek-nilai', [AssessmentAspectController::class, 'store'])->name('admin.aspek.store');
        Route::put('/admin/aspek-nilai/{aspect}', [AssessmentAspectController::class, 'update'])->name('admin.aspek.update');
        Route::delete('/admin/aspek-nilai/{aspect}', [AssessmentAspectController::class, 'destroy'])->name('admin.aspek.destroy');

        // Admin Student Management (Siswa)
        Route::get('/admin/siswa', [UserController::class, 'studentsIndex'])->name('admin.siswa.index');
        Route::post('/admin/siswa', [UserController::class, 'storeStudent'])->name('admin.siswa.store');
        Route::put('/admin/siswa/{student}', [UserController::class, 'updateStudent'])->name('admin.siswa.update');
        Route::delete('/admin/siswa/{student}', [UserController::class, 'destroyStudent'])->name('admin.siswa.destroy');

        // Admin PKL Periods
        Route::get('/admin/periode', [PklPeriodController::class, 'index'])->name('admin.periode.index');
        Route::post('/admin/periode', [PklPeriodController::class, 'store'])->name('admin.periode.store');
        Route::put('/admin/periode/{id}', [PklPeriodController::class, 'update'])->name('admin.periode.update');
        Route::delete('/admin/periode/{id}', [PklPeriodController::class, 'destroy'])->name('admin.periode.destroy');

        // Admin Attendance Settings (Batas Akurasi GPS)
        Route::get('/admin/pengaturan-absensi', [AttendanceSettingsController::class, 'index'])->name('admin.attendance-settings.index');
        Route::put('/admin/pengaturan-absensi', [AttendanceSettingsController::class, 'update'])->name('admin.attendance-settings.update');
    });

    // Attendance
    Route::get('/absensi', [AttendanceController::class, 'index'])->name('absensi.index');
    Route::post('/absensi/geo-checkin', [AttendanceController::class, 'geoCheckIn'])->name('absensi.geo-checkin');
    Route::get('/absensi/{attendance}', [AttendanceController::class, 'show'])->name('absensi.show');
    Route::post('/absensi/checkout', [AttendanceController::class, 'geoCheckOut'])->name('absensi.checkout');

    // E-Journal
    Route::get('/jurnal', [JournalController::class, 'index'])->name('journals.index');
    Route::get('/jurnal/download', [JournalController::class, 'download'])->name('journals.download');
    Route::post('/jurnal', [JournalController::class, 'store'])->name('journals.store');
    Route::put('/jurnal/{id}', [JournalController::class, 'update'])->name('journals.update');
    Route::put('/jurnal/{id}/approve', [JournalController::class, 'approve'])->name('journals.approve');
    Route::put('/jurnal/{id}/revision', [JournalController::class, 'revision'])->name('journals.revision');

    // Assessment
    Route::get('/penilaian', [AssessmentController::class, 'index'])->name('assessments.index');
    Route::post('/penilaian', [AssessmentController::class, 'store'])->name('assessments.store');
    Route::delete('/penilaian/{id}', [AssessmentController::class, 'destroy'])->name('assessments.destroy');

    // Monitoring & Student Detail
    Route::get('/monitoring', [MonitoringController::class, 'index'])->name('monitoring.index');
    Route::get('/monitoring/siswa/{id}', [MonitoringController::class, 'show'])->name('monitoring.show');

    // Reports
    Route::get('/laporan', [ReportController::class, 'index'])->name('reports.index');
    Route::post('/laporan/export-excel', [ReportController::class, 'exportExcel'])->name('reports.export-excel');
    Route::post('/laporan/export-pdf', [ReportController::class, 'exportPdf'])->name('reports.export-pdf');

    // Notifications
    Route::get('/notifikasi', [NotificationController::class, 'index'])->name('notifications.index');

    // WhatsApp Gateway Status
    Route::get('/whatsapp', [WhatsAppController::class, 'index'])->name('whatsapp.index');
    Route::post('/whatsapp/test', [WhatsAppController::class, 'sendTest'])->name('whatsapp.test');

    // AI Insights Page
    Route::get('/ai/insights', [AIController::class, 'insights'])->name('ai.insights');

    // NEXA AI Assistant Page
    Route::get('/ai-assistant', [AIController::class, 'assistant'])->name('ai.assistant');
});
