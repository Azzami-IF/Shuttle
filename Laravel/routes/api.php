<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Vehicle Management (Admin only usually, but open for demo)
    Route::apiResource('vehicles', \App\Http\Controllers\VehicleController::class);

    // Schedule Management
    Route::get('schedules', [\App\Http\Controllers\ScheduleController::class, 'index']);
    Route::post('schedules', [\App\Http\Controllers\ScheduleController::class, 'store']);
    Route::get('schedules/{schedule}', [\App\Http\Controllers\ScheduleController::class, 'show']);
    Route::get('schedules/{schedule}/seats', [\App\Http\Controllers\ScheduleController::class, 'seats']);

    // Booking System
    Route::get('bookings', [\App\Http\Controllers\BookingController::class, 'index']);
    Route::post('bookings', [\App\Http\Controllers\BookingController::class, 'store']);
    Route::get('bookings/{booking}', [\App\Http\Controllers\BookingController::class, 'show']);
    Route::post('bookings/{booking}/cancel', [\App\Http\Controllers\BookingController::class, 'cancel']);

    // Trip Management
    Route::get('trips', [\App\Http\Controllers\TripController::class, 'index']);
    Route::get('trips/{trip}', [\App\Http\Controllers\TripController::class, 'show']);
    Route::post('trips/{trip}/start', [\App\Http\Controllers\TripController::class, 'start']);
    Route::post('trips/{trip}/complete', [\App\Http\Controllers\TripController::class, 'complete']);

    // Tracking
    Route::post('trips/{trip}/location', [\App\Http\Controllers\TrackingController::class, 'update']);
    Route::get('trips/{trip}/latest-location', [\App\Http\Controllers\TrackingController::class, 'latest']);
    Route::get('trips/{trip}/location-history', [\App\Http\Controllers\TrackingController::class, 'history']);
});
