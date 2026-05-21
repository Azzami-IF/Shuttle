<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\Schedule;
use App\Models\Booking;
use App\Models\Trip;
use App\Models\User;
use App\Models\Seat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'vehicles' => Vehicle::count(),
            'schedules' => Schedule::count(),
            'bookings' => Booking::count(),
            'active_trips' => Trip::where('status', 'on-going')->count(),
            'drivers' => User::where('role', 'driver')->count(),
        ];

        $recent_bookings = Booking::with(['user', 'schedule'])->latest()->take(5)->get();
        $active_trips = Trip::with(['schedule.vehicle', 'schedule.driver'])->where('status', 'on-going')->get();

        // Chart Data: Bookings in last 7 days
        $booking_stats = Booking::select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as total'))
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $chart_data = [
            'labels' => $booking_stats->pluck('date'),
            'values' => $booking_stats->pluck('total'),
        ];

        return view('admin.dashboard', compact('stats', 'recent_bookings', 'active_trips', 'chart_data'));
    }

    // Vehicle Management
    public function vehicles(Request $request)
    {
        $query = Vehicle::query();
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('license_plate', 'like', "%{$search}%");
        }
        $vehicles = $query->get();
        return view('admin.vehicles.index', compact('vehicles'));
    }

    public function createVehicle()
    {
        return view('admin.vehicles.create');
    }

    public function storeVehicle(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'license_plate' => 'required|unique:vehicles',
            'capacity' => 'required|integer',
        ]);

        Vehicle::create($request->all());
        return redirect()->route('admin.vehicles')->with('success', 'Vehicle created successfully');
    }

    public function editVehicle(Vehicle $vehicle)
    {
        return view('admin.vehicles.edit', compact('vehicle'));
    }

    public function updateVehicle(Request $request, Vehicle $vehicle)
    {
        $request->validate([
            'name' => 'required',
            'license_plate' => 'required|unique:vehicles,license_plate,' . $vehicle->id,
            'capacity' => 'required|integer',
        ]);

        $vehicle->update($request->all());
        return redirect()->route('admin.vehicles')->with('success', 'Vehicle updated successfully');
    }

    public function deleteVehicle(Vehicle $vehicle)
    {
        $vehicle->delete();
        return redirect()->route('admin.vehicles')->with('success', 'Vehicle deleted successfully');
    }

    // Schedule Management
    public function schedules(Request $request)
    {
        $query = Schedule::with(['vehicle', 'driver']);

        if ($request->has('origin')) {
            $query->where('origin', 'like', "%{$request->get('origin')}%");
        }
        if ($request->has('destination')) {
            $query->where('destination', 'like', "%{$request->get('destination')}%");
        }

        $schedules = $query->get();
        return view('admin.schedules.index', compact('schedules'));
    }

    public function createSchedule()
    {
        $vehicles = Vehicle::all();
        $drivers = User::where('role', 'driver')->get();
        return view('admin.schedules.create', compact('vehicles', 'drivers'));
    }

    public function storeSchedule(Request $request)
    {
        $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'driver_id' => 'required|exists:users,id',
            'origin' => 'required',
            'destination' => 'required',
            'departure_time' => 'required|date',
        ]);

        DB::transaction(function () use ($request) {
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
        });

        return redirect()->route('admin.schedules')->with('success', 'Schedule created successfully');
    }

    public function deleteSchedule(Schedule $schedule)
    {
        $schedule->delete();
        return redirect()->route('admin.schedules')->with('success', 'Schedule deleted successfully');
    }

    // User/Driver Management
    public function users(Request $request)
    {
        $query = User::query();
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
        }
        $users = $query->get();
        return view('admin.users.index', compact('users'));
    }
}
