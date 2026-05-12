<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\Schedule;
use App\Models\Booking;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Http\Request;

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

        return view('admin.dashboard', compact('stats', 'recent_bookings', 'active_trips'));
    }
}
