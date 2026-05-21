<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Models\Trip;
use Illuminate\Http\Request;

class TrackingController extends Controller
{
    public function update(Request $request, Trip $trip)
    {
        $user = $request->user();
        if ($user->role !== 'driver' || $trip->schedule->driver_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($trip->status !== 'on-going') {
            return response()->json(['message' => 'Trip not in progress'], 422);
        }

        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $location = Location::create([
            'trip_id' => $trip->id,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
        ]);

        return response()->json($location, 201);
    }

    public function latest(Trip $trip)
    {
        $location = $trip->locations()->latest()->first();
        return response()->json($location);
    }

    public function history(Trip $trip)
    {
        return response()->json($trip->locations()->orderBy('created_at', 'asc')->get());
    }
}
