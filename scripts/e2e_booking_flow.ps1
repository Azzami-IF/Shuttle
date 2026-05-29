# E2E booking flow script for local dev
# Usage: powershell -ExecutionPolicy Bypass -File scripts\e2e_booking_flow.ps1

$base = 'http://localhost:8000/api'
$creds = @{ email = 'alice@gmail.com'; password = 'password' } | ConvertTo-Json

try {
  Write-Output "Logging in as Alice..."
  $login = Invoke-RestMethod -Method Post -Uri "$base/login" -Body $creds -ContentType 'application/json'
  $token = $login.token
  if (-not $token) { throw "Login failed: no token" }
  $headers = @{ Authorization = "Bearer $token" }

  Write-Output "Searching schedules (Jakarta → Bandung)..."
  $search = Invoke-RestMethod -Method Get -Uri "$base/search/schedules?origin=Jakarta&destination=Bandung" -Headers $headers
  $schedules = @()
  if ($search -is [System.Array]) { $schedules = $search } elseif ($search.data) { $schedules = $search.data } elseif ($search.value) { $schedules = $search.value } else { $schedules = @() }
  if ($schedules.Count -eq 0) { throw "No schedules found" }
  $sched = $schedules[0]
  Write-Output "Selected schedule id: $($sched.id) departure: $($sched.departure_time)"

  Write-Output "Fetching schedule details (seats)..."
  $details = Invoke-RestMethod -Method Get -Uri "$base/schedules/$($sched.id)" -Headers $headers
  $seat = $details.seats | Where-Object { $_.status -eq 'available' } | Select-Object -First 1
  if (-not $seat) { throw "No available seat" }
  Write-Output "Selected seat id: $($seat.id) number: $($seat.seat_number)"

  Write-Output "Creating booking..."
  $body = @{ schedule_id = $sched.id; seat_id = $seat.id } | ConvertTo-Json
  $booking = Invoke-RestMethod -Method Post -Uri "$base/bookings" -Body $body -Headers $headers -ContentType 'application/json'
  Write-Output "Booking created id: $($booking.id) status: $($booking.status) payment_code: $($booking.payment_code)"

  Write-Output "Confirming payment (simulate)..."
  $confirm = Invoke-RestMethod -Method Post -Uri "$base/bookings/$($booking.id)/confirm-payment" -Headers $headers -ContentType 'application/json'
  Write-Output "Payment confirm response status: $($confirm.status)"

  Write-Output "Verifying booking list..."
  $bookings = Invoke-RestMethod -Method Get -Uri "$base/bookings" -Headers $headers
  Write-Output ($bookings | ConvertTo-Json -Depth 4)

  Write-Output "E2E booking flow completed successfully."
} catch {
  Write-Error "E2E script failed: $_"
  exit 1
}
