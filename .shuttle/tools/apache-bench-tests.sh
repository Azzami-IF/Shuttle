#!/bin/bash

echo "=== Load Test 1: Dashboard Stats ==="
ab -n 1000 -c 100 http://localhost:8000/api/admin/dashboard/stats

echo ""
echo "=== Load Test 2: Schedules List ==="
ab -n 1000 -c 100 http://localhost:8000/api/admin/schedules

echo ""
echo "=== Load Test 3: Bookings List ==="
ab -n 1000 -c 100 http://localhost:8000/api/admin/bookings

echo ""
echo "=== Stress Test: 10,000 requests ==="
ab -n 10000 -c 200 http://localhost:8000/api/admin/stats
