<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::prefix('admin')->group(function () {
    Route::get('/', [\App\Http\Controllers\AdminController::class, 'dashboard'])->name('admin.dashboard');

    // Vehicles
    Route::get('/vehicles', [\App\Http\Controllers\AdminController::class, 'vehicles'])->name('admin.vehicles');
    Route::get('/vehicles/create', [\App\Http\Controllers\AdminController::class, 'createVehicle'])->name('admin.vehicles.create');
    Route::post('/vehicles', [\App\Http\Controllers\AdminController::class, 'storeVehicle'])->name('admin.vehicles.store');
    Route::get('/vehicles/{vehicle}/edit', [\App\Http\Controllers\AdminController::class, 'editVehicle'])->name('admin.vehicles.edit');
    Route::put('/vehicles/{vehicle}', [\App\Http\Controllers\AdminController::class, 'updateVehicle'])->name('admin.vehicles.update');
    Route::delete('/vehicles/{vehicle}', [\App\Http\Controllers\AdminController::class, 'deleteVehicle'])->name('admin.vehicles.delete');

    // Schedules
    Route::get('/schedules', [\App\Http\Controllers\AdminController::class, 'schedules'])->name('admin.schedules');
    Route::get('/schedules/create', [\App\Http\Controllers\AdminController::class, 'createSchedule'])->name('admin.schedules.create');
    Route::post('/schedules', [\App\Http\Controllers\AdminController::class, 'storeSchedule'])->name('admin.schedules.store');
    Route::delete('/schedules/{schedule}', [\App\Http\Controllers\AdminController::class, 'deleteSchedule'])->name('admin.schedules.delete');

    // Drivers/Users
    Route::get('/users', [\App\Http\Controllers\AdminController::class, 'users'])->name('admin.users');
});
