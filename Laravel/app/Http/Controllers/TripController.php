<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TripController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->role === 'driver') {
            return response()->json(Trip::whereHas('schedule', function ($query) use ($user) {
                $query->where('driver_id', $user->id);
            })->with('schedule')->get());
        }
        return response()->json(Trip::with('schedule')->get());
    }

    public function start(Request $request, Trip $trip)
    {
        $user = $request->user();
        if ($user->role !== 'driver' || $trip->schedule->driver_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($trip->status !== 'scheduled') {
            return response()->json(['message' => 'Trip already started or completed'], 422);
        }

        $trip->update([
            'status' => 'on-going',
            'started_at' => now(),
        ]);

        return response()->json($trip);
    }

    public function complete(Request $request, Trip $trip)
    {
        $user = $request->user();
        if ($user->role !== 'driver' || $trip->schedule->driver_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($trip->status !== 'on-going') {
            return response()->json(['message' => 'Trip not in progress'], 422);
        }

        return DB::transaction(function () use ($trip) {
            $trip->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            // Update all bookings for this schedule to completed
            $trip->schedule->bookings()->where('status', 'booked')->update(['status' => 'completed']);

            return response()->json($trip);
        });
    }

    public function show(Trip $trip)
    {
        return response()->json($trip->load(['schedule.vehicle', 'schedule.driver', 'locations']));
    }
}
