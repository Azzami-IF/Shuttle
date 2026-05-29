<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\Seat;
use App\Models\Vehicle;
use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Http\Controllers\BookingController;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        BookingController::releaseExpiredBookings();
        $query = Schedule::with(['vehicle', 'driver', 'seats', 'bookings']);

        // Search by origin
        if ($request->has('origin') && $request->get('origin')) {
            $query->where('origin', 'like', "%{$request->get('origin')}%");
        }

        // Search by destination
        if ($request->has('destination') && $request->get('destination')) {
            $query->where('destination', 'like', "%{$request->get('destination')}%");
        }

        // Filter by date
        if ($request->has('date') && $request->get('date')) {
            $query->whereDate('departure_time', $request->get('date'));
        }

        // Filter by date range
        if ($request->has('date_from') && $request->get('date_from')) {
            $query->whereDate('departure_time', '>=', $request->get('date_from'));
        }
        if ($request->has('date_to') && $request->get('date_to')) {
            $query->whereDate('departure_time', '<=', $request->get('date_to'));
        }

        // Filter by time range (departure time)
        if ($request->has('time_from') && $request->get('time_from')) {
            $timeFrom = \Carbon\Carbon::parse($request->get('time_from'))->format('H:i:s');
            $query->where(DB::raw('TIME(departure_time)'), '>=', $timeFrom);
        }
        if ($request->has('time_to') && $request->get('time_to')) {
            $timeTo = \Carbon\Carbon::parse($request->get('time_to'))->format('H:i:s');
            $query->where(DB::raw('TIME(departure_time)'), '<=', $timeTo);
        }

        // Filter by available seats
        if ($request->has('min_available_seats')) {
            $minSeats = (int) $request->get('min_available_seats');
            $query->whereHas('seats', function ($q) {
                $q->where('status', 'available');
            }, '>=', $minSeats);
        }

        // Filter by price range (from vehicle rate)
        if ($request->has('price_min') || $request->has('price_max')) {
            $query->whereHas('vehicle', function ($q) use ($request) {
                if ($request->has('price_min')) {
                    $q->where('rate_per_seat', '>=', (int) $request->get('price_min'));
                }
                if ($request->has('price_max')) {
                    $q->where('rate_per_seat', '<=', (int) $request->get('price_max'));
                }
            });
        }

        // Filter by vehicle type
        if ($request->has('vehicle_type') && $request->get('vehicle_type')) {
            $query->whereHas('vehicle', function ($q) use ($request) {
                $q->where('type', $request->get('vehicle_type'));
            });
        }

        // Filter by driver
        if ($request->has('driver_id')) {
            $query->where('driver_id', $request->get('driver_id'));
        }

        // Filter only schedules with available seats
        if ($request->boolean('available_only', false)) {
            $query->whereHas('seats', function ($q) {
                $q->where('status', 'available');
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'departure_time');
        $sortOrder = $request->get('sort_order', 'asc');
        $validSortFields = ['departure_time', 'created_at', 'origin', 'destination'];
        
        if (in_array($sortBy, $validSortFields)) {
            $query->orderBy($sortBy, in_array($sortOrder, ['asc', 'desc']) ? $sortOrder : 'asc');
        }

        // Pagination
        $perPage = (int) $request->get('per_page', 15);
        $perPage = $perPage > 100 ? 100 : $perPage;

        return response()->json($query->paginate($perPage));
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
