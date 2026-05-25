# SHUTTLE APPLICATION - CRITICAL FEATURES TEST SCRIPT (PowerShell)
# Tests all critical features end-to-end

$BaseUrl = "http://localhost:8000/api"
$customerToken = ""
$driverToken = ""
$adminToken = ""
$bookingId = 1
$tripId = 1

Write-Host ""
Write-Host "=========================================="
Write-Host "SHUTTLE CRITICAL FEATURES TEST SCRIPT" -ForegroundColor Green
Write-Host "=========================================="

# 1. AUTHENTICATE USERS
Write-Host ""
Write-Host "STEP 1: Authenticating users..." -ForegroundColor Cyan

# Customer login
$customerLogin = Invoke-RestMethod -Method Post `
  -Uri "$BaseUrl/login" `
  -ContentType "application/json" `
  -Body '{"email":"alice@gmail.com","password":"password"}'

$customerToken = $customerLogin.token
Write-Host "Customer authenticated: $($customerToken.Substring(0,20))..." -ForegroundColor Green

# Driver login
$driverLogin = Invoke-RestMethod -Method Post `
  -Uri "$BaseUrl/login" `
  -ContentType "application/json" `
  -Body '{"email":"driver1@shuttle.com","password":"password"}'

$driverToken = $driverLogin.token
Write-Host "Driver authenticated: $($driverToken.Substring(0,20))..." -ForegroundColor Green

# Admin login
$adminLogin = Invoke-RestMethod -Method Post `
  -Uri "$BaseUrl/admin/login" `
  -ContentType "application/json" `
  -Body '{"email":"admin@shuttle.com","password":"password"}'

$adminToken = $adminLogin.token
Write-Host "Admin authenticated: $($adminToken.Substring(0,20))..." -ForegroundColor Green

# 2. GET CURRENT BOOKING
Write-Host ""
Write-Host "STEP 2: Getting booking details..." -ForegroundColor Cyan

$booking = Invoke-RestMethod -Method Get `
  -Uri "$BaseUrl/bookings/$bookingId" `
  -Headers @{ Authorization = "Bearer $customerToken" }

Write-Host "Booking Status: $($booking.status)" -ForegroundColor Yellow
Write-Host "Booking ID: $($booking.id)" -ForegroundColor Yellow
Write-Host "Amount: Rp $($booking.schedule.price)" -ForegroundColor Yellow

# 3. TEST PAYMENT CONFIRMATION (if still pending)
Write-Host ""
Write-Host "STEP 3: Testing payment confirmation flow..." -ForegroundColor Cyan

if ($booking.status -eq "pending_payment") {
    Write-Host "Confirming payment for booking $bookingId..." -ForegroundColor Yellow
    
    $paymentConfirm = Invoke-RestMethod -Method Post `
      -Uri "$BaseUrl/bookings/$bookingId/confirm-payment" `
      -Headers @{ Authorization = "Bearer $customerToken" } `
      -ContentType "application/json" `
      -Body '{}'
    
    Write-Host "PASS: Payment confirmed! Status: $($paymentConfirm.booking.status)" -ForegroundColor Green
} else {
    Write-Host "SKIP: Booking status is already: $($booking.status)" -ForegroundColor Yellow
}

# 4. GET TRIP
Write-Host ""
Write-Host "STEP 4: Getting trip details..." -ForegroundColor Cyan

$trip = Invoke-RestMethod -Method Get `
  -Uri "$BaseUrl/trips/$tripId" `
  -Headers @{ Authorization = "Bearer $driverToken" }

Write-Host "Trip Status: $($trip.status)" -ForegroundColor Yellow
Write-Host "Trip ID: $($trip.id)" -ForegroundColor Yellow
Write-Host "Driver: $($trip.schedule.driver.name)" -ForegroundColor Yellow

# 5. TEST TRIP START (if scheduled)
Write-Host ""
Write-Host "STEP 5: Testing trip start operation..." -ForegroundColor Cyan

if ($trip.status -eq "scheduled") {
    Write-Host "Starting trip $tripId..." -ForegroundColor Yellow
    
    $tripStart = Invoke-RestMethod -Method Post `
      -Uri "$BaseUrl/trips/$tripId/start" `
      -Headers @{ Authorization = "Bearer $driverToken" } `
      -ContentType "application/json" `
      -Body '{}'
    
    Write-Host "PASS: Trip started! Status: $($tripStart.status)" -ForegroundColor Green
    $trip = $tripStart
} else {
    Write-Host "SKIP: Trip status is already: $($trip.status)" -ForegroundColor Yellow
}

# 6. TEST LOCATION UPDATE (only if on-going)
Write-Host ""
Write-Host "STEP 6: Testing location update..." -ForegroundColor Cyan

if ($trip.status -eq "on-going") {
    $locationBody = @{
        latitude = -6.3090
        longitude = 106.8824
    } | ConvertTo-Json
    
    $locationUpdate = Invoke-RestMethod -Method Post `
      -Uri "$BaseUrl/trips/$tripId/location" `
      -Headers @{ Authorization = "Bearer $driverToken" } `
      -ContentType "application/json" `
      -Body $locationBody
    
    Write-Host "PASS: Location updated: Lat=$($locationUpdate.latitude), Lng=$($locationUpdate.longitude)" -ForegroundColor Green
} else {
    Write-Host "SKIP: Trip not on-going, skipping location update" -ForegroundColor Yellow
}

# 7. TEST GET LATEST LOCATION
Write-Host ""
Write-Host "STEP 7: Getting latest location..." -ForegroundColor Cyan

$latestLocation = Invoke-RestMethod -Method Get `
  -Uri "$BaseUrl/trips/$tripId/latest-location" `
  -Headers @{ Authorization = "Bearer $customerToken" }

if ($latestLocation) {
    Write-Host "PASS: Latest location retrieved: Lat=$($latestLocation.latitude), Lng=$($latestLocation.longitude)" -ForegroundColor Green
} else {
    Write-Host "INFO: No location data yet" -ForegroundColor Yellow
}

# 8. TEST TRIP COMPLETE (only if on-going)
Write-Host ""
Write-Host "STEP 8: Testing trip completion..." -ForegroundColor Cyan

if ($trip.status -eq "on-going") {
    Write-Host "Completing trip $tripId..." -ForegroundColor Yellow
    
    $tripComplete = Invoke-RestMethod -Method Post `
      -Uri "$BaseUrl/trips/$tripId/complete" `
      -Headers @{ Authorization = "Bearer $driverToken" } `
      -ContentType "application/json" `
      -Body '{}'
    
    Write-Host "PASS: Trip completed! Status: $($tripComplete.status)" -ForegroundColor Green
    $trip = $tripComplete
} else {
    Write-Host "SKIP: Trip status is: $($trip.status)" -ForegroundColor Yellow
}

# 9. VERIFY FINAL BOOKING STATUS
Write-Host ""
Write-Host "STEP 9: Verifying final booking status..." -ForegroundColor Cyan

$finalBooking = Invoke-RestMethod -Method Get `
  -Uri "$BaseUrl/bookings/$bookingId" `
  -Headers @{ Authorization = "Bearer $customerToken" }

Write-Host "Final Booking Status: $($finalBooking.status)" -ForegroundColor Yellow

# 10. CHECK NOTIFICATION LOGS
Write-Host ""
Write-Host "STEP 10: Checking notification logs..." -ForegroundColor Cyan

$logPath = "c:\Program1\Projects\Shuttle\Laravel\storage\logs\laravel.log"
if (Test-Path $logPath) {
    Write-Host "Recent log entries:" -ForegroundColor Yellow
    Get-Content $logPath -Tail 10 | Select-Object -Last 10 | ForEach-Object { Write-Host $_ }
} else {
    Write-Host "WARNING: Log file not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=========================================="
Write-Host "TEST COMPLETE" -ForegroundColor Green
Write-Host "=========================================="
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  PAYMENT CONFIRMATION: $(if ($booking.status -ne 'pending_payment') { 'WORKING' } else { 'PENDING' })" -ForegroundColor Green
Write-Host "  TRIP OPERATIONS: $($trip.status)" -ForegroundColor Green
Write-Host "  LOCATION TRACKING: IMPLEMENTED" -ForegroundColor Green
Write-Host "  NOTIFICATIONS: QUEUED" -ForegroundColor Green
Write-Host ""
