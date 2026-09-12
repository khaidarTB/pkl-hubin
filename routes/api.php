<?php

use App\Http\Controllers\AIController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\JournalController;
use App\Http\Controllers\MonitoringController;
use App\Http\Controllers\VisitController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/students', [MonitoringController::class, 'index']);
    Route::get('/students/{id}', [MonitoringController::class, 'show']);

    Route::get('/attendance', [AttendanceController::class, 'index']);
    Route::post('/attendance', [AttendanceController::class, 'geoCheckIn']);

    Route::get('/journals', [JournalController::class, 'index']);
    Route::post('/journals', [JournalController::class, 'store']);
    Route::put('/journals/{id}/approve', [JournalController::class, 'approve']);
    Route::put('/journals/{id}/revision', [JournalController::class, 'revision']);
});

/*
|--------------------------------------------------------------------------
| NEXA AI + AI-assisted endpoints (session authenticated)
|--------------------------------------------------------------------------
|
| PKLConnect uses cookie/session auth for its SPA. These routes run under
| the `web` middleware group so the same-origin frontend can call them
| with CSRF protection while keeping the /api/* paths.
|
*/

Route::middleware(['web', 'auth'])->group(function () {
    // Rate limited per user (see AppServiceProvider) to control cost & abuse.
    Route::middleware('throttle:ai')->group(function () {
        Route::post('/ai/chat', [AIController::class, 'chat']);
        Route::get('/ai/insights', [AIController::class, 'insightsApi']);
    });

    // Visit creation after explicit user confirmation (spec #17).
    Route::post('/visits', [VisitController::class, 'storeApi'])->middleware('throttle:20,1');
});
