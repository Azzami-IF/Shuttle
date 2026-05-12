<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Seat;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->role === 'admin') {
            return response()->json(Booking::with(['user', 'schedule', 'seat'])->get());
        }
        return response()->json(Booking::where('user_id', $user->id)->with(['schedule', 'seat'])->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
            'seat_id' => 'required|exists:seats,id',
        ]);

        return DB::transaction(function () use ($request) {
            $seat = Seat::lockForUpdate()->find($request->seat_id);

            if ($seat->schedule_id != $request->schedule_id) {
                throw ValidationException::withMessages(['seat_id' => 'Seat does not belong to this schedule']);
            }

            if ($seat->status !== 'available') {
                throw ValidationException::withMessages(['seat_id' => 'Seat already booked']);
            }

            $booking = Booking::create([
                'user_id' => $request->user()->id,
                'schedule_id' => $request->schedule_id,
                'seat_id' => $request->seat_id,
                'status' => 'booked',
            ]);

            $seat->update(['status' => 'booked']);

            return response()->json($booking->load(['schedule', 'seat']), 201);
        });
    }

    public function show(Booking $booking)
    {
        return response()->json($booking->load(['user', 'schedule', 'seat']));
    }

    public function cancel(Request $request, Booking $booking)
    {
        if ($request->user()->id !== $booking->user_id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($booking->status !== 'booked') {
            return response()->json(['message' => 'Cannot cancel booking in current status'], 422);
        }

        return DB::transaction(function () use ($booking) {
            $booking->update(['status' => 'cancelled']);
            $booking->seat->update(['status' => 'available']);

            return response()->json(['message' => 'Booking cancelled successfully']);
        });
    }
}
