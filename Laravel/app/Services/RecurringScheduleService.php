<?php

namespace App\Services;

use App\Models\RecurringSchedule;
use App\Models\Schedule;
use App\Models\Seat;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class RecurringScheduleService
{
    /**
     * Generate schedules from all active recurring rules.
     */
    public function generateSchedules(): array
    {
        $recurringSchedules = RecurringSchedule::needProcessing()->get();
        $generatedCount = 0;
        $errors = [];

        foreach ($recurringSchedules as $recurring) {
            try {
                $generatedCount += $this->generateSchedulesForRule($recurring);
            } catch (\Exception $e) {
                Log::error("Failed to generate schedules for recurring rule {$recurring->id}: " . $e->getMessage());
                $errors[] = [
                    'recurring_id' => $recurring->id,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return [
            'generated' => $generatedCount,
            'errors' => $errors,
        ];
    }

    /**
     * Generate schedules for a specific recurring rule.
     */
    public function generateSchedulesForRule(RecurringSchedule $recurring, $daysAhead = 7): int
    {
        $occurrences = $recurring->getNextOccurrences($daysAhead);
        $created = 0;

        foreach ($occurrences as $datetime) {
            // Check if schedule already exists for this time
            $existingSchedule = Schedule::where('vehicle_id', $recurring->vehicle_id)
                ->where('recurring_schedule_id', $recurring->id)
                ->where('departure_time', $datetime)
                ->first();

            if (!$existingSchedule) {
                $schedule = $this->createScheduleFromRecurring($recurring, $datetime);
                if ($schedule) {
                    $created++;
                }
            }
        }

        // Update last_generated_at timestamp
        $recurring->update(['last_generated_at' => now()]);

        return $created;
    }

    /**
     * Create a single schedule from a recurring rule.
     */
    public function createScheduleFromRecurring(RecurringSchedule $recurring, Carbon $datetime): ?Schedule
    {
        try {
            $schedule = Schedule::create([
                'vehicle_id' => $recurring->vehicle_id,
                'driver_id' => $recurring->driver_id,
                'origin' => $recurring->origin,
                'destination' => $recurring->destination,
                'departure_time' => $datetime,
                'recurring_schedule_id' => $recurring->id,
            ]);

            // Create seats for this schedule based on vehicle capacity
            $this->createSeatsForSchedule($schedule, $recurring->vehicle);

            // Create trip record for this schedule
            if ($schedule) {
                \App\Models\Trip::create([
                    'schedule_id' => $schedule->id,
                    'status' => 'scheduled',
                ]);
            }

            return $schedule;
        } catch (\Exception $e) {
            Log::error("Failed to create schedule from recurring rule: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Create seats for a schedule based on vehicle capacity.
     */
    protected function createSeatsForSchedule(Schedule $schedule, $vehicle): void
    {
        // Assuming 2-column bus with variable rows
        $seatsPerRow = 2;
        $rows = $vehicle->capacity / $seatsPerRow;
        $seatLabels = ['A', 'B', 'C', 'D'];

        for ($row = 1; $row <= $rows; $row++) {
            for ($col = 0; $col < $seatsPerRow; $col++) {
                $seatNumber = ($row - 1) * $seatsPerRow + ($col + 1);
                $seatLabel = $row . $seatLabels[$col];

                Seat::create([
                    'schedule_id' => $schedule->id,
                    'seat_number' => $seatNumber,
                    'seat_label' => $seatLabel,
                    'status' => 'available',
                ]);
            }
        }
    }

    /**
     * Create a recurring schedule rule.
     */
    public function createRecurringSchedule(array $data): RecurringSchedule
    {
        // Validate data
        $this->validateRecurringData($data);

        $recurring = RecurringSchedule::create($data);

        // Immediately generate initial schedules
        $this->generateSchedulesForRule($recurring);

        return $recurring;
    }

    /**
     * Update a recurring schedule rule.
     */
    public function updateRecurringSchedule(RecurringSchedule $recurring, array $data): RecurringSchedule
    {
        $this->validateRecurringData($data);
        $recurring->update($data);
        return $recurring;
    }

    /**
     * Pause a recurring schedule (stop generating new schedules).
     */
    public function pauseRecurringSchedule(RecurringSchedule $recurring): RecurringSchedule
    {
        $recurring->update(['status' => 'paused']);
        return $recurring;
    }

    /**
     * Resume a paused recurring schedule.
     */
    public function resumeRecurringSchedule(RecurringSchedule $recurring): RecurringSchedule
    {
        $recurring->update(['status' => 'active', 'last_generated_at' => null]);
        return $recurring;
    }

    /**
     * Delete a recurring schedule and optionally its generated schedules.
     */
    public function deleteRecurringSchedule(RecurringSchedule $recurring, $deleteSchedules = false): bool
    {
        if ($deleteSchedules) {
            // Delete all schedules generated from this recurring rule
            $recurring->schedules()->delete();
        }

        return $recurring->delete();
    }

    /**
     * Validate recurring schedule data.
     */
    protected function validateRecurringData(array $data): void
    {
        // Validate required fields
        if (!isset($data['vehicle_id'], $data['driver_id'], $data['origin'], $data['destination'], $data['start_time'], $data['start_date'])) {
            throw new \InvalidArgumentException('Missing required fields for recurring schedule');
        }

        // Validate dates
        $startDate = Carbon::parse($data['start_date']);
        if (isset($data['end_date'])) {
            $endDate = Carbon::parse($data['end_date']);
            if ($endDate->isBefore($startDate)) {
                throw new \InvalidArgumentException('End date must be after start date');
            }
        }

        // Validate recurrence pattern
        $validPatterns = ['hourly', 'daily', 'weekly', 'monthly', 'custom'];
        if (isset($data['recurrence_pattern']) && !in_array($data['recurrence_pattern'], $validPatterns)) {
            throw new \InvalidArgumentException('Invalid recurrence pattern');
        }

        // Validate days_of_week for weekly pattern
        if ($data['recurrence_pattern'] === 'weekly' && isset($data['days_of_week'])) {
            $days = explode(',', $data['days_of_week']);
            foreach ($days as $day) {
                if (!in_array((int)$day, [0, 1, 2, 3, 4, 5, 6])) {
                    throw new \InvalidArgumentException('Invalid day of week');
                }
            }
        }
    }
}
