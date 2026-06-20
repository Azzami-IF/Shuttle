<?php

namespace App\Listeners;

use App\Events\TripCompleted;
use App\Models\Booking;
use App\Models\Schedule;
use App\Models\Seat;
use Illuminate\Support\Facades\Log;

class AutoBookReturnTripForBots
{
    /**
     * Handle the event.
     */
    public function handle(TripCompleted $event): void
    {
        try {
            $trip = $event->trip;
            $schedule = $trip->schedule;

            if (!$schedule) {
                return;
            }

            // Bots we want to auto-book return trips for
            $botEmails = [
                'alice@gmail.com',
                'bob@gmail.com',
                'charlie@gmail.com',
                'david@gmail.com',
                'eva@gmail.com'
            ];

            // Get all bookings for this completed trip that belong to these bots
            $bookings = $schedule->bookings()
                ->where('status', 'completed')
                ->whereHas('user', function ($q) use ($botEmails) {
                    $q->whereIn('email', $botEmails);
                })
                ->with('user')
                ->get();

            if ($bookings->isEmpty()) {
                Log::info("AutoBookReturnTripForBots: No bot passengers found on completed Trip #{$trip->id}.");
                return;
            }

            Log::info("AutoBookReturnTripForBots: Processing auto-return booking for " . $bookings->count() . " bots.");

            // Completed route origin and destination
            $completedOrigin = $schedule->origin;
            $completedDestination = $schedule->destination;

            foreach ($bookings as $booking) {
                $bot = $booking->user;

                // Find a future return trip: e.g. Bandung -> Jakarta (if completed was Jakarta -> Bandung)
                $returnSchedule = Schedule::where('origin', $completedDestination)
                    ->where('destination', $completedOrigin)
                    ->where('departure_time', '>', now())
                    ->whereHas('seats', function ($q) {
                        $q->where('status', 'available');
                    })
                    ->with(['seats' => function ($q) {
                        $q->where('status', 'available');
                    }])
                    ->orderBy('departure_time', 'asc')
                    ->first();

                // Fallback: If no return schedule is found, find any upcoming schedule that has available seats
                if (!$returnSchedule) {
                    $returnSchedule = Schedule::where('departure_time', '>', now())
                        ->whereHas('seats', function ($q) {
                            $q->where('status', 'available');
                        })
                        ->with(['seats' => function ($q) {
                            $q->where('status', 'available');
                        }])
                        ->orderBy('departure_time', 'asc')
                        ->first();
                }

                if ($returnSchedule) {
                    // Pick the first available seat
                    $seat = $returnSchedule->seats->first();

                    if ($seat) {
                        // Generate a dummy payment code and unique code
                        $paymentCode = 'TRF' . strtoupper(bin2hex(random_bytes(4)));
                        $uniqueCode = rand(100, 999);

                        // Book the return seat for the bot customer
                        $newBooking = Booking::create([
                            'user_id' => $bot->id,
                            'schedule_id' => $returnSchedule->id,
                            'seat_id' => $seat->id,
                            'status' => 'booked', // Immediately booked/confirmed
                            'payment_code' => $paymentCode,
                            'unique_code' => $uniqueCode,
                        ]);

                        // Set the seat status to booked
                        $seat->update(['status' => 'booked']);

                        Log::info("AutoBookReturnTripForBots: Auto-booked Bot [{$bot->email}] on return Schedule #{$returnSchedule->id} ({$returnSchedule->origin} -> {$returnSchedule->destination}) at seat [{$seat->seat_number}].");
                    }
                } else {
                    Log::warning("AutoBookReturnTripForBots: No upcoming schedule found with available seats for Bot [{$bot->email}].");
                }
            }
        } catch (\Exception $e) {
            Log::error("AutoBookReturnTripForBots failed: " . $e->getMessage());
        }
    }
}
