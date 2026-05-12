<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Vehicle;
use App\Models\Schedule;
use App\Models\Seat;
use App\Models\Trip;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Admin
        User::create([
            'name' => 'Admin System',
            'email' => 'admin@shuttle.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Drivers
        $driver1 = User::create([
            'name' => 'John Driver',
            'email' => 'driver1@shuttle.com',
            'password' => Hash::make('password'),
            'role' => 'driver',
        ]);

        // Customers
        User::create([
            'name' => 'Alice Customer',
            'email' => 'alice@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
        ]);

        // Vehicles
        $bus1 = Vehicle::create([
            'name' => 'Ambatu Express 01',
            'license_plate' => 'B 1234 ABC',
            'capacity' => 12,
        ]);

        // Schedule
        $schedule = Schedule::create([
            'vehicle_id' => $bus1->id,
            'driver_id' => $driver1->id,
            'origin' => 'Jakarta',
            'destination' => 'Bandung',
            'departure_time' => now()->addHours(2),
        ]);

        // Seats for schedule
        for ($i = 1; $i <= $bus1->capacity; $i++) {
            Seat::create([
                'schedule_id' => $schedule->id,
                'seat_number' => (string)$i,
                'status' => 'available',
            ]);
        }

        // Trip for schedule
        Trip::create([
            'schedule_id' => $schedule->id,
            'status' => 'scheduled',
        ]);
    }
}
