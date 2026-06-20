<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Vehicle;
use App\Models\Schedule;
use App\Models\Seat;
use App\Models\Trip;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Disable foreign keys and truncate transactional tables
        Schema::disableForeignKeyConstraints();
        DB::table('locations')->truncate();
        DB::table('trips')->truncate();
        DB::table('bookings')->truncate();
        DB::table('seats')->truncate();
        DB::table('schedules')->truncate();
        Schema::enableForeignKeyConstraints();

        // Admin
        User::updateOrCreate(
            ['email' => 'admin@shuttle.com'],
            [
                'name' => 'Admin System',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );

        // Customers
        User::updateOrCreate(
            ['email' => 'alice@gmail.com'],
            [
                'name' => 'Alice Customer',
                'password' => Hash::make('password'),
                'role' => 'customer',
            ]
        );

        // Drivers (ambil yang ada di database atau buat jika kosong)
        $drivers = User::where('role', 'driver')->get();
        if ($drivers->isEmpty()) {
            $driversData = [
                ['email' => 'driver1@shuttle.com', 'name' => 'Ahmad Driver'],
                ['email' => 'driver2@shuttle.com', 'name' => 'Budiman Driver'],
                ['email' => 'driver3@shuttle.com', 'name' => 'Cecep Driver'],
                ['email' => 'driver4@shuttle.com', 'name' => 'Dani Driver'],
                ['email' => 'driver5@shuttle.com', 'name' => 'Eka Driver'],
            ];
            foreach ($driversData as $d) {
                User::updateOrCreate(
                    ['email' => $d['email']],
                    [
                        'name' => $d['name'],
                        'password' => Hash::make('password'),
                        'role' => 'driver',
                    ]
                );
            }
            $drivers = User::where('role', 'driver')->get();
        }

        // Vehicles (ambil yang ada di database atau buat jika kosong)
        $vehicles = Vehicle::all();
        if ($vehicles->isEmpty()) {
            $vehiclesData = [
                ['license_plate' => 'B 1234 ABC', 'name' => 'Kemanapun Express 01', 'capacity' => 12],
                ['license_plate' => 'D 5678 XYZ', 'name' => 'Kemanapun Express 02', 'capacity' => 12],
                ['license_plate' => 'F 9012 EFG', 'name' => 'Kemanapun Express 03', 'capacity' => 10],
                ['license_plate' => 'T 3456 HIJ', 'name' => 'Kemanapun Express 04', 'capacity' => 10],
                ['license_plate' => 'Z 7890 KLM', 'name' => 'Kemanapun Express 05', 'capacity' => 8],
            ];
            foreach ($vehiclesData as $v) {
                Vehicle::updateOrCreate(
                    ['license_plate' => $v['license_plate']],
                    [
                        'name' => $v['name'],
                        'capacity' => $v['capacity'],
                    ]
                );
            }
            $vehicles = Vehicle::all();
        }

        // Route templates to generate
        $routesList = [
            ['origin' => 'Jakarta', 'destination' => 'Bandung', 'price' => 120000, 'hours' => 2],
            ['origin' => 'Bandung', 'destination' => 'Jakarta', 'price' => 120000, 'hours' => 4],
            ['origin' => 'Bekasi', 'destination' => 'Bandung', 'price' => 110000, 'hours' => 6],
            ['origin' => 'Bogor', 'destination' => 'Bandung', 'price' => 130000, 'hours' => 8],
            ['origin' => 'Depok', 'destination' => 'Bandung', 'price' => 125000, 'hours' => 10],
            ['origin' => 'Karawang', 'destination' => 'Bandung', 'price' => 95000, 'hours' => 12],
            ['origin' => 'Bandung', 'destination' => 'Cirebon', 'price' => 100000, 'hours' => 14],
        ];

        // Konversi collection ke array agar mudah di-index secara berputar
        $driversArray = $drivers->all();
        $vehiclesArray = $vehicles->all();

        foreach ($routesList as $index => $r) {
            $vehicle = $vehiclesArray[$index % count($vehiclesArray)];
            $driver = $driversArray[$index % count($driversArray)];
            
            $schedule = Schedule::create([
                'vehicle_id' => $vehicle->id,
                'driver_id' => $driver->id,
                'origin' => $r['origin'],
                'destination' => $r['destination'],
                'departure_time' => now()->addHours($r['hours']),
                'price' => $r['price']
            ]);

            // Seats for schedule
            for ($i = 1; $i <= $vehicle->capacity; $i++) {
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
}
