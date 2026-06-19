<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\Seat;
use App\Models\Vehicle;
use App\Models\Trip;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Http\Controllers\BookingController;

class ScheduleController extends Controller
{
    /**
     * Auto-generate schedules for the next 3 days if upcoming schedules are low.
     */
    public static function autoGenerateSchedulesIfNeeded()
    {
        try {
            // Count upcoming active schedules (from now onwards)
            $scheduleCount = Schedule::where('departure_time', '>=', now())->count();

            // If we have fewer than 10 upcoming schedules, generate new ones dynamically
            if ($scheduleCount < 10) {
                $vehicles = Vehicle::all();
                $drivers = User::where('role', 'driver')->get();

                if ($vehicles->isEmpty() || $drivers->isEmpty()) {
                    return;
                }

                $routes = [
                    ['origin' => 'Jakarta', 'destination' => 'Bandung', 'price' => 120000],
                    ['origin' => 'Bandung', 'destination' => 'Jakarta', 'price' => 120000],
                    ['origin' => 'Bekasi', 'destination' => 'Bandung', 'price' => 110000],
                    ['origin' => 'Bogor', 'destination' => 'Bandung', 'price' => 130000],
                    ['origin' => 'Depok', 'destination' => 'Bandung', 'price' => 125000],
                    ['origin' => 'Karawang', 'destination' => 'Bandung', 'price' => 95000],
                    ['origin' => 'Bandung', 'destination' => 'Cirebon', 'price' => 100000],
                ];

                $hours = ['07:00', '09:30', '13:00', '15:30', '19:00', '21:30'];

                // Generate for today (0), tomorrow (1), day after tomorrow (2), and the next day (3)
                for ($day = 0; $day <= 3; $day++) {
                    $date = Carbon::today()->addDays($day);

                    foreach ($routes as $index => $r) {
                        $departureHour = $hours[$index % count($hours)];
                        [$h, $m] = explode(':', $departureHour);
                        $departureTime = $date->copy()->setTime((int)$h, (int)$m, 0);

                        // Skip if the departure time has already passed (for today)
                        if ($departureTime->isPast()) {
                            continue;
                        }

                        $vehicle = $vehicles[$index % $vehicles->count()];
                        $driver = $drivers[$index % $drivers->count()];

                        // Check if schedule already exists to prevent duplication
                        $exists = Schedule::where('vehicle_id', $vehicle->id)
                            ->where('origin', $r['origin'])
                            ->where('destination', $r['destination'])
                            ->where('departure_time', $departureTime)
                            ->exists();

                        if (!$exists) {
                            DB::transaction(function () use ($vehicle, $driver, $r, $departureTime) {
                                $newSchedule = Schedule::create([
                                    'vehicle_id' => $vehicle->id,
                                    'driver_id' => $driver->id,
                                    'origin' => $r['origin'],
                                    'destination' => $r['destination'],
                                    'departure_time' => $departureTime,
                                    'price' => $r['price'],
                                ]);

                                // Create seats based on vehicle capacity
                                for ($seat = 1; $seat <= $vehicle->capacity; $seat++) {
                                    Seat::create([
                                        'schedule_id' => $newSchedule->id,
                                        'seat_number' => (string)$seat,
                                        'status' => 'available',
                                    ]);
                                }

                                // Create initial trip record
                                Trip::create([
                                    'schedule_id' => $newSchedule->id,
                                    'status' => 'scheduled',
                                ]);
                            });
                        }
                    }
                }

                // Invalidate schedules cache so changes are visible instantly
                \App\Services\CacheManager::invalidateScheduleCache();
            }
        } catch (\Exception $e) {
            \Log::error("Auto-generate schedules failed: " . $e->getMessage());
        }
    }

    public function index(Request $request)
    {
        BookingController::releaseExpiredBookings();
        self::autoGenerateSchedulesIfNeeded();
        
        $query = Schedule::with(['vehicle', 'driver', 'seats']);

        if ($request->has('origin')) {
            $query->where('origin', 'like', "%{$request->get('origin')}%");
        }

        if ($request->has('destination')) {
            $query->where('destination', 'like', "%{$request->get('destination')}%");
        }

        if ($request->has('date')) {
            // Jika filter tanggal spesifik, hanya tampilkan tanggal itu
            $query->whereDate('departure_time', $request->get('date'));
        } else {
            // Default: hanya tampilkan jadwal yang BELUM lewat (mulai dari sekarang)
            $query->where('departure_time', '>=', now());
        }

        // Urutkan dari yang paling dekat
        $query->orderBy('departure_time', 'asc');

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'driver_id' => 'required|exists:users,id',
            'origin' => 'required|string',
            'destination' => 'required|string',
            'departure_time' => 'required|date',
        ]);

        return DB::transaction(function () use ($request) {
            $schedule = Schedule::create($request->all());

            // Create seats based on vehicle capacity
            $vehicle = Vehicle::find($request->vehicle_id);
            for ($i = 1; $i <= $vehicle->capacity; $i++) {
                Seat::create([
                    'schedule_id' => $schedule->id,
                    'seat_number' => (string)$i,
                    'status' => 'available',
                ]);
            }

            // Create initial trip record
            Trip::create([
                'schedule_id' => $schedule->id,
                'status' => 'scheduled',
            ]);

            return response()->json($schedule->load('seats'), 201);
        });
    }

    public function show(Schedule $schedule)
    {
        BookingController::releaseExpiredBookings();
        return response()->json($schedule->load(['vehicle', 'driver', 'seats', 'trip']));
    }

    public function seats(Schedule $schedule)
    {
        return response()->json($schedule->seats);
    }
}
