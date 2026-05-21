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
        $query = Booking::with(['user', 'schedule', 'seat']);

        if ($user->role !== 'admin') {
            $query->where('user_id', $user->id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->whereHas('schedule', function ($q) use ($search) {
                $q->where('origin', 'like', "%{$search}%")
                  ->orWhere('destination', 'like', "%{$search}%");
            });
        }

        return response()->json($query->get());
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
                'status' => 'pending_payment',
                'payment_code' => 'QR' . strtoupper(bin2hex(random_bytes(4))),
            ]);

            // We lock the seat immediately to prevent others from picking it while payment is pending
            $seat->update(['status' => 'booked']);

            return response()->json($booking->load(['schedule', 'seat']), 201);
        });
    }

    public function confirmPayment(Booking $booking)
    {
        if ($booking->status !== 'pending_payment') {
            return response()->json(['message' => 'Booking is not in pending payment status'], 422);
        }

        $booking->update(['status' => 'booked']);

        return response()->json(['message' => 'Payment confirmed', 'booking' => $booking]);
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
