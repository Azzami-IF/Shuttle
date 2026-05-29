<?php

namespace App\Http\Controllers;

use App\Models\RecurringSchedule;
use App\Services\RecurringScheduleService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RecurringScheduleController extends Controller
{
    protected $recurringService;

    public function __construct(RecurringScheduleService $recurringService)
    {
        $this->recurringService = $recurringService;
    }

    /**
     * Get all recurring schedules (Admin only).
     */
    public function index(Request $request): JsonResponse
    {
        $query = RecurringSchedule::with(['vehicle', 'driver', 'schedules']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        // Filter by vehicle
        if ($request->has('vehicle_id')) {
            $query->where('vehicle_id', $request->get('vehicle_id'));
        }

        // Filter by driver
        if ($request->has('driver_id')) {
            $query->where('driver_id', $request->get('driver_id'));
        }

        $recurring = $query->paginate($request->get('per_page', 15));

        return response()->json($recurring);
    }

    /**
     * Create a new recurring schedule.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'driver_id' => 'required|exists:users,id',
            'origin' => 'required|string|max:255',
            'destination' => 'required|string|max:255',
            'recurrence_pattern' => 'required|in:hourly,daily,weekly,monthly,custom',
            'start_time' => 'required|date_format:H:i:s',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'days_of_week' => 'nullable|string', // comma-separated: 0,1,2,3,4,5,6
            'interval' => 'nullable|integer|min:1',
            'interval_unit' => 'nullable|in:hour,day,week,month',
            'max_occurrences' => 'nullable|integer|min:1',
        ]);

        try {
            $recurring = $this->recurringService->createRecurringSchedule($validated);

            return response()->json([
                'message' => 'Recurring schedule created successfully',
                'data' => $recurring->load(['vehicle', 'driver']),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create recurring schedule',
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Get a specific recurring schedule.
     */
    public function show(RecurringSchedule $recurringSchedule): JsonResponse
    {
        return response()->json(
            $recurringSchedule->load(['vehicle', 'driver', 'schedules'])
        );
    }

    /**
     * Update a recurring schedule.
     */
    public function update(Request $request, RecurringSchedule $recurringSchedule): JsonResponse
    {
        $validated = $request->validate([
            'origin' => 'sometimes|string|max:255',
            'destination' => 'sometimes|string|max:255',
            'recurrence_pattern' => 'sometimes|in:hourly,daily,weekly,monthly,custom',
            'start_time' => 'sometimes|date_format:H:i:s',
            'days_of_week' => 'nullable|string',
            'interval' => 'nullable|integer|min:1',
            'interval_unit' => 'nullable|in:hour,day,week,month',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'max_occurrences' => 'nullable|integer|min:1',
            'status' => 'sometimes|in:active,paused,completed',
        ]);

        try {
            $recurring = $this->recurringService->updateRecurringSchedule($recurringSchedule, $validated);

            return response()->json([
                'message' => 'Recurring schedule updated successfully',
                'data' => $recurring,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update recurring schedule',
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Delete a recurring schedule.
     */
    public function destroy(Request $request, RecurringSchedule $recurringSchedule): JsonResponse
    {
        $deleteSchedules = $request->boolean('delete_schedules', false);

        try {
            $this->recurringService->deleteRecurringSchedule($recurringSchedule, $deleteSchedules);

            return response()->json([
                'message' => 'Recurring schedule deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete recurring schedule',
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Pause a recurring schedule (stop generating new schedules).
     */
    public function pause(RecurringSchedule $recurringSchedule): JsonResponse
    {
        $this->recurringService->pauseRecurringSchedule($recurringSchedule);

        return response()->json([
            'message' => 'Recurring schedule paused',
            'data' => $recurringSchedule,
        ]);
    }

    /**
     * Resume a paused recurring schedule.
     */
    public function resume(RecurringSchedule $recurringSchedule): JsonResponse
    {
        $this->recurringService->resumeRecurringSchedule($recurringSchedule);

        return response()->json([
            'message' => 'Recurring schedule resumed',
            'data' => $recurringSchedule,
        ]);
    }

    /**
     * Get preview of next occurrences.
     */
    public function preview(RecurringSchedule $recurringSchedule, Request $request): JsonResponse
    {
        $count = $request->get('count', 7);
        $occurrences = $recurringSchedule->getNextOccurrences($count);

        return response()->json([
            'recurring_schedule_id' => $recurringSchedule->id,
            'next_occurrences' => $occurrences,
            'count' => count($occurrences),
        ]);
    }

    /**
     * Manually trigger schedule generation for a specific recurring rule.
     */
    public function generateNow(RecurringSchedule $recurringSchedule, Request $request): JsonResponse
    {
        $daysAhead = $request->get('days', 7);

        try {
            $generated = $this->recurringService->generateSchedulesForRule($recurringSchedule, $daysAhead);

            return response()->json([
                'message' => "Generated $generated schedules",
                'generated_count' => $generated,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to generate schedules',
                'error' => $e->getMessage(),
            ], 422);
        }
    }
}
