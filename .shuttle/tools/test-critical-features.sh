#!/bin/bash

# SHUTTLE APPLICATION - COMPREHENSIVE TEST SCRIPT
# Tests all critical features end-to-end

BASE_URL="http://localhost:8000/api"
ADMIN_TOKEN=""
DRIVER_TOKEN=""
CUSTOMER_TOKEN=""
BOOKING_ID=1
TRIP_ID=1

echo "🚀 SHUTTLE CRITICAL FEATURES TEST SCRIPT"
echo "=========================================="

# 1. AUTHENTICATE USERS
echo ""
echo "📝 Step 1: Authenticating users..."

# Customer login
CUSTOMER_LOGIN=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@gmail.com","password":"password"}')

CUSTOMER_TOKEN=$(echo $CUSTOMER_LOGIN | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "✅ Customer token: ${CUSTOMER_TOKEN:0:20}..."

# Driver login
DRIVER_LOGIN=$(curl -s -X POST "$BASE_URL/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"driver1@shuttle.com","password":"password"}')

DRIVER_TOKEN=$(echo $DRIVER_LOGIN | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "✅ Driver token: ${DRIVER_TOKEN:0:20}..."

# Admin login
ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@shuttle.com","password":"password"}')

ADMIN_TOKEN=$(echo $ADMIN_LOGIN | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "✅ Admin token: ${ADMIN_TOKEN:0:20}..."

# 2. GET CURRENT BOOKING
echo ""
echo "📋 Step 2: Getting booking details..."
curl -s -X GET "$BASE_URL/bookings/$BOOKING_ID" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" | jq '.'

# 3. TEST PAYMENT CONFIRMATION
echo ""
echo "💳 Step 3: Testing payment confirmation flow..."
echo "Confirming payment for booking $BOOKING_ID..."

PAYMENT_CONFIRM=$(curl -s -X POST "$BASE_URL/bookings/$BOOKING_ID/confirm-payment" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}')

echo "$PAYMENT_CONFIRM" | jq '.'

# 4. GET TRIP
echo ""
echo "🚌 Step 4: Getting trip details..."
TRIP_RESPONSE=$(curl -s -X GET "$BASE_URL/trips/$TRIP_ID" \
  -H "Authorization: Bearer $DRIVER_TOKEN")

echo "$TRIP_RESPONSE" | jq '.'

# 5. TEST TRIP START
echo ""
echo "▶️  Step 5: Testing trip start operation..."
TRIP_START=$(curl -s -X POST "$BASE_URL/trips/$TRIP_ID/start" \
  -H "Authorization: Bearer $DRIVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}')

echo "$TRIP_START" | jq '.'

# 6. TEST LOCATION UPDATE
echo ""
echo "📍 Step 6: Testing location update..."
LOCATION_UPDATE=$(curl -s -X POST "$BASE_URL/trips/$TRIP_ID/location" \
  -H "Authorization: Bearer $DRIVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"latitude":-6.3090,"longitude":106.8824}')

echo "$LOCATION_UPDATE" | jq '.'

# 7. TEST GET LATEST LOCATION
echo ""
echo "🗺️  Step 7: Getting latest location..."
LATEST_LOCATION=$(curl -s -X GET "$BASE_URL/trips/$TRIP_ID/latest-location" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN")

echo "$LATEST_LOCATION" | jq '.'

# 8. TEST TRIP COMPLETE
echo ""
echo "✅ Step 8: Testing trip completion..."
TRIP_COMPLETE=$(curl -s -X POST "$BASE_URL/trips/$TRIP_ID/complete" \
  -H "Authorization: Bearer $DRIVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}')

echo "$TRIP_COMPLETE" | jq '.'

# 9. VERIFY BOOKINGS STATUS
echo ""
echo "🎫 Step 9: Verifying final booking status..."
curl -s -X GET "$BASE_URL/bookings/$BOOKING_ID" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" | jq '.status'

# 10. CHECK LOGS
echo ""
echo "📊 Step 10: Checking application logs for notifications..."
tail -20 c:\Program1\Projects\Shuttle\Laravel\storage\logs\laravel.log

echo ""
echo "=========================================="
echo "✅ TEST COMPLETE!"
echo "=========================================="
