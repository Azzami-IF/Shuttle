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
        self::releaseExpiredBookings();
        $user = $request->user();
        $query = Booking::with(['user', 'schedule.trip', 'schedule.vehicle', 'schedule.driver', 'seat']);

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

        if ($request->has('schedule_id')) {
            $query->where('schedule_id', $request->get('schedule_id'));
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

            $schedule = Schedule::with('trip')->find($request->schedule_id);
            if (!$schedule) {
                throw ValidationException::withMessages(['schedule_id' => 'Schedule not found']);
            }

            // Exclude past departure times
            if (\Carbon\Carbon::parse($schedule->departure_time)->isPast()) {
                throw ValidationException::withMessages(['schedule_id' => 'Cannot book seats for a past departure schedule']);
            }

            // Exclude active or completed trips
            if ($schedule->trip && $schedule->trip->status !== 'scheduled') {
                throw ValidationException::withMessages(['schedule_id' => 'Cannot book seats for a trip that has already departed or completed']);
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

            // Invalidate related caches
            \App\Services\CacheManager::invalidateBookingCache($booking->schedule_id);

            return response()->json($booking->load(['schedule', 'seat']), 201);
        });
    }

    public function confirmPayment(Request $request, Booking $booking)
    {
        if ($request->user()->id !== $booking->user_id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($booking->status !== 'pending_payment') {
            return response()->json(['message' => 'Booking is not in pending payment status'], 422);
        }

        $booking->update(['status' => 'booked']);
        
        // Dispatch event to trigger notifications and invoice generation
        event(new \App\Events\PaymentConfirmed($booking->load(['schedule', 'seat', 'user'])));

        return response()->json(['message' => 'Payment confirmed', 'booking' => $booking->load(['schedule', 'seat'])]);
    }

    public function show(Request $request, Booking $booking)
    {
        if ($request->user()->id !== $booking->user_id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($booking->load(['user', 'schedule', 'seat']));
    }

    public function cancel(Request $request, Booking $booking)
    {
        if ($request->user()->id !== $booking->user_id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($booking->status !== 'booked' && $booking->status !== 'pending_payment') {
            return response()->json(['message' => 'Cannot cancel booking in current status'], 422);
        }

        return DB::transaction(function () use ($booking) {
            $booking->update(['status' => 'cancelled']);
            $booking->seat->update(['status' => 'available']);

            // Invalidate related caches
            \App\Services\CacheManager::invalidateBookingCache($booking->schedule_id);

            return response()->json(['message' => 'Booking cancelled successfully']);
        });
    }

    public static function releaseExpiredBookings()
    {
        $expiredBookings = Booking::where('status', 'pending_payment')
            ->where('created_at', '<', now()->subMinutes(15))
            ->get();

        foreach ($expiredBookings as $booking) {
            DB::transaction(function () use ($booking) {
                $booking->update(['status' => 'cancelled']);
                if ($booking->seat) {
                    $booking->seat->update(['status' => 'available']);
                }
            });
        }
    }
}
