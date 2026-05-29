<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Seat;
use App\Models\Payment;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PaymentWebhookService
{
    /**
     * Process payment success callback
     */
    public static function handlePaymentSuccess(int $bookingId, string $paymentIntentId): bool
    {
        try {
            return DB::transaction(function () use ($bookingId, $paymentIntentId) {
                $booking = Booking::with('seat')->lockForUpdate()->find($bookingId);

                if (!$booking) {
                    Log::warning("Booking not found: $bookingId");
                    return false;
                }

                // Check if already processed
                if ($booking->status === 'completed') {
                    Log::warning("Booking already completed: $bookingId");
                    return true;
                }

                // Update booking status to paid
                $booking->update([
                    'status' => 'booked',
                    'payment_confirmed_at' => now(),
                ]);

                // Update seat status to booked
                if ($booking->seat) {
                    $booking->seat->update(['status' => 'booked']);
                }

                // Update or create payment record
                Payment::updateOrCreate(
                    ['booking_id' => $bookingId],
                    [
                        'stripe_payment_intent_id' => $paymentIntentId,
                        'status' => 'completed',
                        'paid_at' => now(),
                    ]
                );

                // Generate invoice
                try {
                    InvoiceService::generateInvoice($bookingId);
                } catch (\Exception $e) {
                    Log::warning("Invoice generation failed: " . $e->getMessage());
                }

                Log::info("Payment success processed for booking: $bookingId");

                return true;
            });
        } catch (\Exception $e) {
            Log::error("Payment success handling failed: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Process payment failure callback
     */
    public static function handlePaymentFailed(int $bookingId, string $paymentIntentId, string $errorMessage = ''): bool
    {
        try {
            return DB::transaction(function () use ($bookingId, $paymentIntentId, $errorMessage) {
                $booking = Booking::lockForUpdate()->find($bookingId);

                if (!$booking) {
                    return false;
                }

                // Only process if still pending
                if ($booking->status !== 'pending_payment') {
                    return false;
                }

                // Update payment record with failure
                Payment::updateOrCreate(
                    ['booking_id' => $bookingId],
                    [
                        'stripe_payment_intent_id' => $paymentIntentId,
                        'status' => 'failed',
                        'error_message' => $errorMessage,
                        'failed_at' => now(),
                    ]
                );

                Log::warning("Payment failed for booking $bookingId: $errorMessage");

                return true;
            });
        } catch (\Exception $e) {
            Log::error("Payment failure handling failed: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Process payment timeout/expiration (15-minute timeout)
     */
    public static function handlePaymentTimeout(int $bookingId): bool
    {
        try {
            return DB::transaction(function () use ($bookingId) {
                $booking = Booking::with('seat')->lockForUpdate()->find($bookingId);

                if (!$booking) {
                    return false;
                }

                // Only process if still pending
                if ($booking->status !== 'pending_payment') {
                    return false;
                }

                // Release the seat
                if ($booking->seat) {
                    $booking->seat->update(['status' => 'available']);
                }

                // Cancel booking
                $booking->update([
                    'status' => 'cancelled',
                    'cancelled_at' => now(),
                    'cancellation_reason' => 'Payment timeout (15 minutes)',
                ]);

                // Update payment record
                Payment::updateOrCreate(
                    ['booking_id' => $bookingId],
                    [
                        'status' => 'expired',
                        'expired_at' => now(),
                    ]
                );

                Log::info("Payment timeout processed for booking: $bookingId");

                return true;
            });
        } catch (\Exception $e) {
            Log::error("Payment timeout handling failed: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Process refund callback
     */
    public static function handleRefund(int $bookingId, float $refundAmount): bool
    {
        try {
            return DB::transaction(function () use ($bookingId, $refundAmount) {
                $booking = Booking::with('seat')->lockForUpdate()->find($bookingId);

                if (!$booking) {
                    return false;
                }

                // Release the seat
                if ($booking->seat) {
                    $booking->seat->update(['status' => 'available']);
                }

                // Update booking status
                $booking->update([
                    'status' => 'cancelled',
                    'refunded_amount' => $refundAmount,
                    'refunded_at' => now(),
                ]);

                // Update payment record
                $payment = Payment::where('booking_id', $bookingId)->first();
                if ($payment) {
                    $payment->update([
                        'status' => 'refunded',
                        'refunded_amount' => $refundAmount,
                        'refunded_at' => now(),
                    ]);
                }

                Log::info("Refund processed for booking $bookingId: Rp " . number_format($refundAmount));

                return true;
            });
        } catch (\Exception $e) {
            Log::error("Refund handling failed: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Cleanup expired pending payments (scheduled job)
     * This should be run periodically via Laravel scheduler
     */
    public static function cleanupExpiredPayments(): int
    {
        try {
            $expiredTime = now()->subMinutes(15);

            $expiredBookings = Booking::where('status', 'pending_payment')
                ->where('created_at', '<', $expiredTime)
                ->get();

            $count = 0;
            foreach ($expiredBookings as $booking) {
                if (self::handlePaymentTimeout($booking->id)) {
                    $count++;
                }
            }

            Log::info("Cleaned up $count expired payments");

            return $count;
        } catch (\Exception $e) {
            Log::error("Cleanup expired payments failed: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get payment status for mobile app polling
     */
    public static function getPaymentStatus(int $bookingId): array
    {
        try {
            $booking = Booking::with('payment')->find($bookingId);

            if (!$booking) {
                return [
                    'status' => 'not_found',
                    'message' => 'Booking not found',
                ];
            }

            $payment = $booking->payment;
            $createdAt = $booking->created_at->getTimestamp() * 1000; // Convert to milliseconds
            $expiresAt = $booking->created_at->addMinutes(15)->getTimestamp() * 1000;
            $now = now()->getTimestamp() * 1000;
            $timeRemaining = max(0, $expiresAt - $now);

            return [
                'booking_id' => $booking->id,
                'booking_status' => $booking->status,
                'payment_status' => $payment?->status ?? 'pending',
                'amount' => $booking->amount ?? 0,
                'currency' => 'IDR',
                'created_at' => $createdAt,
                'expires_at' => $expiresAt,
                'time_remaining' => $timeRemaining,
                'is_expired' => $timeRemaining <= 0,
                'error_message' => $payment?->error_message,
            ];
        } catch (\Exception $e) {
            Log::error("Get payment status failed: " . $e->getMessage());
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
            ];
        }
    }
}
