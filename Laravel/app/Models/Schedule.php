<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Schedule extends Model
{
    protected $fillable = [
        'vehicle_id',
        'driver_id',
        'origin',
        'destination',
        'departure_time'
    ];

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function seats(): HasMany
    {
        return $this->hasMany(Seat::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function trip(): HasOne
    {
        return $this->hasOne(Trip::class);
    }

    // ====== SCOPES FOR FILTERING ======

    /**
     * Scope: Filter schedules with available seats.
     */
    public function scopeWithAvailableSeats($query, $minCount = 1)
    {
        return $query->withCount('seats as available_seats_count', function ($q) {
            $q->where('status', 'available');
        })->having('available_seats_count', '>=', $minCount);
    }

    /**
     * Scope: Filter by departure time range.
     */
    public function scopeDateRange($query, $from, $to)
    {
        return $query->whereBetween('departure_time', [
            \Carbon\Carbon::parse($from)->startOfDay(),
            \Carbon\Carbon::parse($to)->endOfDay(),
        ]);
    }

    /**
     * Scope: Filter by price range.
     */
    public function scopePriceRange($query, $min, $max)
    {
        return $query->whereHas('vehicle', function ($q) use ($min, $max) {
            $q->whereBetween('rate_per_seat', [$min, $max]);
        });
    }

    /**
     * Scope: Filter by route (origin and destination).
     */
    public function scopeByRoute($query, $origin, $destination)
    {
        return $query->where('origin', 'like', "%$origin%")
                     ->where('destination', 'like', "%$destination%");
    }

    /**
     * Scope: Only upcoming schedules.
     */
    public function scopeUpcoming($query)
    {
        return $query->where('departure_time', '>', now());
    }

    /**
     * Scope: Only past schedules.
     */
    public function scopePast($query)
    {
        return $query->where('departure_time', '<', now());
    }
}
