<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    /**
     * Advanced search endpoint for schedules.
     * Supports complex filtering, pagination, and sorting.
     */
    public function schedules(Request $request)
    {
        $validated = $request->validate([
            'origin' => 'nullable|string',
            'destination' => 'nullable|string',
            'date' => 'nullable|date',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'time_from' => 'nullable|date_format:H:i:s',
            'time_to' => 'nullable|date_format:H:i:s',
            'price_min' => 'nullable|integer|min:0',
            'price_max' => 'nullable|integer|min:0',
            'available_seats_min' => 'nullable|integer|min:1',
            'vehicle_type' => 'nullable|string',
            'driver_id' => 'nullable|exists:users,id',
            'available_only' => 'nullable|boolean',
            'sort_by' => 'nullable|in:departure_time,price,available_seats',
            'sort_order' => 'nullable|in:asc,desc',
            'per_page' => 'nullable|integer|min:1|max:100',
            'page' => 'nullable|integer|min:1',
        ]);

        $query = Schedule::with(['vehicle', 'driver', 'seats', 'bookings', 'trip']);

        // Search filters
        if (!empty($validated['origin'])) {
            $query->where('origin', 'like', "%{$validated['origin']}%");
        }

        if (!empty($validated['destination'])) {
            $query->where('destination', 'like', "%{$validated['destination']}%");
        }

        if (!empty($validated['date'])) {
            $query->whereDate('departure_time', $validated['date']);
        } elseif (!empty($validated['date_from']) || !empty($validated['date_to'])) {
            if (!empty($validated['date_from'])) {
                $query->whereDate('departure_time', '>=', $validated['date_from']);
            }
            if (!empty($validated['date_to'])) {
                $query->whereDate('departure_time', '<=', $validated['date_to']);
            }
        }

        // Time range filter
        if (!empty($validated['time_from'])) {
            $query->where(DB::raw('TIME(departure_time)'), '>=', $validated['time_from']);
        }
        if (!empty($validated['time_to'])) {
            $query->where(DB::raw('TIME(departure_time)'), '<=', $validated['time_to']);
        }

        // Price range filter
        if (!empty($validated['price_min']) || !empty($validated['price_max'])) {
            $query->whereHas('vehicle', function ($q) use ($validated) {
                if (!empty($validated['price_min'])) {
                    $q->where('rate_per_seat', '>=', $validated['price_min']);
                }
                if (!empty($validated['price_max'])) {
                    $q->where('rate_per_seat', '<=', $validated['price_max']);
                }
            });
        }

        // Vehicle type filter
        if (!empty($validated['vehicle_type'])) {
            $query->whereHas('vehicle', function ($q) use ($validated) {
                $q->where('type', $validated['vehicle_type']);
            });
        }

        // Driver filter
        if (!empty($validated['driver_id'])) {
            $query->where('driver_id', $validated['driver_id']);
        }

        // Only upcoming schedules
        $query->where('departure_time', '>', now());

        // Available seats filter
        if ($validated['available_only'] ?? false) {
            $query->whereHas('seats', function ($q) {
                $q->where('status', 'available');
            });
        }

        if (!empty($validated['available_seats_min'])) {
            $query->withCount('seats as available_count', function ($q) {
                $q->where('status', 'available');
            })->havingRaw('available_count >= ?', [$validated['available_seats_min']]);
        }

        // Sorting
        $sortBy = $validated['sort_by'] ?? 'departure_time';
        $sortOrder = $validated['sort_order'] ?? 'asc';

        switch ($sortBy) {
            case 'price':
                $query->join('vehicles', 'schedules.vehicle_id', '=', 'vehicles.id')
                      ->orderBy('vehicles.rate_per_seat', $sortOrder)
                      ->select('schedules.*');
                break;
            case 'available_seats':
                $query->withCount('seats as available_count', function ($q) {
                    $q->where('status', 'available');
                })->orderBy('available_count', $sortOrder);
                break;
            case 'departure_time':
            default:
                $query->orderBy('departure_time', $sortOrder);
                break;
        }

        $perPage = (int) ($validated['per_page'] ?? 15);
        $perPage = min($perPage, 100);

        $results = $query->paginate($perPage);

        // Add computed fields to each schedule
        $results->getCollection()->transform(function ($schedule) {
            return [
                'id' => $schedule->id,
                'origin' => $schedule->origin,
                'destination' => $schedule->destination,
                'departure_time' => $schedule->departure_time,
                'vehicle' => [
                    'id' => $schedule->vehicle->id,
                    'name' => $schedule->vehicle->name,
                    'type' => $schedule->vehicle->type,
                    'plate_number' => $schedule->vehicle->plate_number,
                    'capacity' => $schedule->vehicle->capacity,
                    'rate_per_seat' => $schedule->vehicle->rate_per_seat,
                ],
                'driver' => [
                    'id' => $schedule->driver->id,
                    'name' => $schedule->driver->name,
                    'email' => $schedule->driver->email,
                    'phone' => $schedule->driver->phone,
                ],
                'total_seats' => $schedule->vehicle->capacity,
                'available_seats' => $schedule->seats->where('status', 'available')->count(),
                'booked_seats' => $schedule->bookings->where('status', 'booked')->count(),
                'trip_status' => $schedule->trip?->status ?? 'scheduled',
            ];
        });

        return response()->json($results);
    }

    /**
     * Get suggestions for origin/destination autocomplete.
     */
    public function suggestions(Request $request)
    {
        $validated = $request->validate([
            'query' => 'required|string|min:2',
            'type' => 'required|in:origin,destination',
        ]);

        $field = $validated['type'];
        $query = $validated['query'];

        $suggestions = Schedule::distinct()
            ->select($field)
            ->where($field, 'like', "%$query%")
            ->limit(10)
            ->pluck($field);

        return response()->json(['suggestions' => $suggestions]);
    }

    /**
     * Get popular routes based on bookings.
     */
    public function popularRoutes(Request $request)
    {
        $limit = $request->get('limit', 10);
        $days = $request->get('days', 30);

        $routes = Schedule::select('origin', 'destination', DB::raw('COUNT(*) as booking_count'))
            ->join('bookings', 'schedules.id', '=', 'bookings.schedule_id')
            ->where('bookings.created_at', '>=', now()->subDays($days))
            ->groupBy('origin', 'destination')
            ->orderByDesc('booking_count')
            ->limit($limit)
            ->get();

        return response()->json(['routes' => $routes]);
    }

    /**
     * Get schedules by category/filters for quick filtering UI.
     */
    public function categories()
    {
        $now = now();

        return response()->json([
            'time_periods' => [
                ['label' => 'Early Morning', 'value' => 'early', 'time_from' => '00:00:00', 'time_to' => '06:00:00'],
                ['label' => 'Morning', 'value' => 'morning', 'time_from' => '06:00:00', 'time_to' => '12:00:00'],
                ['label' => 'Afternoon', 'value' => 'afternoon', 'time_from' => '12:00:00', 'time_to' => '18:00:00'],
                ['label' => 'Evening', 'value' => 'evening', 'time_from' => '18:00:00', 'time_to' => '23:59:59'],
            ],
            'price_ranges' => [
                ['label' => 'Budget', 'value' => 'budget', 'min' => 0, 'max' => 50000],
                ['label' => 'Standard', 'value' => 'standard', 'min' => 50000, 'max' => 100000],
                ['label' => 'Premium', 'value' => 'premium', 'min' => 100000, 'max' => 999999],
            ],
            'vehicle_types' => Schedule::join('vehicles', 'schedules.vehicle_id', '=', 'vehicles.id')
                ->distinct()
                ->pluck('vehicles.type')
                ->map(fn($type) => ['label' => ucfirst($type), 'value' => $type])
                ->values(),
        ]);
    }
}
