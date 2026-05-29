<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RecurringSchedule extends Model
{
    protected $fillable = [
        'vehicle_id',
        'driver_id',
        'origin',
        'destination',
        'recurrence_pattern',
        'days_of_week',
        'interval',
        'interval_unit',
        'start_time',
        'start_date',
        'end_date',
        'max_occurrences',
        'status',
        'last_generated_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'start_time' => 'datetime:H:i:s',
        'last_generated_at' => 'datetime',
    ];

    /**
     * Get the vehicle associated with this recurring schedule.
     */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    /**
     * Get the driver associated with this recurring schedule.
     */
    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    /**
     * Get all schedules generated from this recurring rule.
     */
    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    /**
     * Scope: Get only active recurring schedules.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope: Get recurring schedules that need to be processed.
     */
    public function scopeNeedProcessing($query)
    {
        $now = now();
        
        return $query
            ->where('status', 'active')
            ->where('start_date', '<=', $now->toDateString())
            ->where(function ($q) use ($now) {
                $q->whereNull('end_date')
                  ->orWhere('end_date', '>=', $now->toDateString());
            })
            ->where(function ($q) use ($now) {
                // Only process if last_generated_at is null or needs update
                $q->whereNull('last_generated_at')
                  ->orWhere('last_generated_at', '<', $now->subHours(1));
            });
    }

    /**
     * Get the next occurrences based on recurrence pattern.
     */
    public function getNextOccurrences($count = 7): array
    {
        $occurrences = [];
        $current = now()->toDateString() === $this->start_date->toDateString() 
            ? now() 
            : $this->start_date->copy()->setTimeFromTimeString($this->start_time);
        
        $generated = 0;
        $maxCount = $this->max_occurrences ?? ($count * 10);

        while ($generated < $count && $generated < $maxCount) {
            if ($this->end_date && $current->toDateString() > $this->end_date->toDateString()) {
                break;
            }

            if ($this->shouldGenerateSchedule($current)) {
                $occurrences[] = $current->copy();
                $generated++;
            }

            $current = $this->getNextDateTime($current);
        }

        return $occurrences;
    }

    /**
     * Determine if a schedule should be generated for the given datetime.
     */
    protected function shouldGenerateSchedule($datetime): bool
    {
        switch ($this->recurrence_pattern) {
            case 'hourly':
                return true;

            case 'daily':
                return true;

            case 'weekly':
                if (!$this->days_of_week) {
                    return true;
                }
                $dayOfWeek = $datetime->dayOfWeek; // 0 = Sunday
                $daysArray = explode(',', $this->days_of_week);
                return in_array($dayOfWeek, $daysArray);

            case 'monthly':
                // Generate on the same day of the month
                return $datetime->day === $this->start_date->day;

            case 'custom':
                return true;

            default:
                return false;
        }
    }

    /**
     * Get the next datetime based on interval.
     */
    protected function getNextDateTime($current): \Carbon\Carbon
    {
        $next = $current->copy();

        switch ($this->interval_unit) {
            case 'hour':
                $next->addHours($this->interval);
                break;
            case 'day':
                $next->addDays($this->interval);
                break;
            case 'week':
                $next->addWeeks($this->interval);
                break;
            case 'month':
                $next->addMonths($this->interval);
                break;
        }

        return $next;
    }
}
