# SHUTTLE APP - QUICK FIX GUIDE (Session 5)
**Status**: 3 Issues Identified - Ready to Fix  
**Estimated Time**: 2-3 hours total

---

## 🚨 CRITICAL - FIX IMMEDIATELY

### 1. Invalid Login Not Rejected (SECURITY)

**Problem**: `POST /api/login` accepts invalid credentials  
**File**: `Laravel/app/Http/Controllers/AuthController.php`  
**Test Command**:
```powershell
$base = 'http://127.0.0.1:8000/api'
$login = @{ email='invalid@test.com'; password='wrong' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "$base/login" -Body $login -ContentType 'application/json'
```
**Expected**: 401 Unauthorized  
**Actual**: 200 OK (WRONG!)

**Fix Approach**:
1. Check if user exists in database
2. Verify password matches using Hash::check()
3. Return 401 if either fails
4. Add rate limiting to prevent brute force

---

### 2. Trip Start Endpoint Fails (422 Error)

**Problem**: `POST /api/trips/{id}/start` returns 422  
**File**: `Laravel/app/Http/Controllers/TripController.php`  
**Test Command**:
```powershell
# After successful status update
$tripId = 3
$startBody = @{} | ConvertTo-Json
$token = 'DRIVER_TOKEN_HERE'
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Method Post -Uri "$base/trips/$tripId/start" `
  -Headers $headers -Body $startBody -ContentType 'application/json'
```
**Expected**: 200 OK with started_at timestamp  
**Actual**: 422 Unprocessable Content

**Fix Approach**:
1. Check trip validation rules
2. Verify started_at field is nullable
3. Check if start() method needs parameters
4. Test with various trip states

**Check These Methods**:
- `TripController::start()`
- `Trip::update()`
- Trip model fillable/guarded properties

---

## 🟡 MODERATE - FIX FOR TESTING

### 3. Create Customer Test User

**Problem**: Customer login fails - user not found  
**Database**: SQLite (Laravel\database\database.sqlite)  
**Test Command**:
```powershell
$base = 'http://127.0.0.1:8000/api'
$login = @{ 
    email = 'test@example.com'
    password = 'Password123!'
} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "$base/login" -Body $login -ContentType 'application/json'
```
**Expected**: 200 OK with token and customer role  
**Actual**: Error "You cannot call a method on a null"

**Option A - Create via Seeder**:
```php
// database/seeders/UserSeeder.php
DB::table('users')->insert([
    'name' => 'Test Customer',
    'email' => 'test@example.com',
    'password' => Hash::make('Password123!'),
    'phone' => '081234567890',
    'address' => 'Test Address',
    'role' => 'customer',
    'email_verified_at' => now(),
    'created_at' => now(),
    'updated_at' => now(),
]);
```

Then run:
```bash
php artisan db:seed
```

**Option B - Direct SQL**:
```sql
INSERT INTO users (name, email, password, phone, address, role, email_verified_at, created_at, updated_at)
VALUES (
    'Test Customer',
    'test@example.com',
    '$2y$12$Wc...',  -- Hash of Password123!
    '081234567890',
    'Test Address',
    'customer',
    DATETIME('now'),
    DATETIME('now'),
    DATETIME('now')
);
```

**Generate Hash**:
```php
php artisan tinker
> Hash::make('Password123!')
```

---

## ✅ VALIDATION TEST SUITE

### After Each Fix - Run These Tests

**Test 1: Admin Login & Dashboard**
```powershell
$base = 'http://127.0.0.1:8000/api'
$admin = @{ email='admin@shuttle.com'; password='Password123!' } | ConvertTo-Json
$resp = Invoke-RestMethod -Method Post -Uri "$base/login" -Body $admin -ContentType 'application/json'
$token = $resp.token
$headers = @{ Authorization = "Bearer $token" }
$stats = Invoke-RestMethod -Method Get -Uri "$base/admin/dashboard/stats" -Headers $headers
Write-Host "Admin Dashboard: $($stats.total_vehicles) vehicles, $($stats.total_bookings) bookings"
```

**Test 2: Driver Login & Trip Update**
```powershell
$driver = @{ email='driver.test@example.com'; password='Password123!' } | ConvertTo-Json
$resp = Invoke-RestMethod -Method Post -Uri "$base/login" -Body $driver -ContentType 'application/json'
$token = $resp.token
$headers = @{ Authorization = "Bearer $token" }
$trips = Invoke-RestMethod -Method Get -Uri "$base/trips" -Headers $headers
$tripId = $trips[0].id
$status = @{ status='boarding' } | ConvertTo-Json
$updated = Invoke-RestMethod -Method Post -Uri "$base/trips/$tripId/status" -Headers $headers `
  -Body $status -ContentType 'application/json'
Write-Host "Trip Status Updated: $($updated.status)"
```

**Test 3: Customer Login**
```powershell
$customer = @{ email='test@example.com'; password='Password123!' } | ConvertTo-Json
$resp = Invoke-RestMethod -Method Post -Uri "$base/login" -Body $customer -ContentType 'application/json'
Write-Host "Customer Login: Token=$($resp.token.Substring(0,20))... Role=$($resp.user.role)"
```

**Test 4: Invalid Login (Should Fail)**
```powershell
$invalid = @{ email='invalid@test.com'; password='wrong' } | ConvertTo-Json
try {
    Invoke-RestMethod -Method Post -Uri "$base/login" -Body $invalid -ContentType 'application/json'
    Write-Host "❌ FAILED: Invalid login was accepted!"
} catch {
    Write-Host "✅ PASS: Invalid login rejected with $($_.Exception.Response.StatusCode.Value)"
}
```

---

## 📋 DEBUGGING CHECKLIST

### For Invalid Login Issue
- [ ] Check if `AuthController::login()` method exists
- [ ] Verify email/password validation logic
- [ ] Check if passwords are being hashed correctly
- [ ] Look for try-catch blocks swallowing errors
- [ ] Verify authentication provider configuration
- [ ] Check for default test credentials being hardcoded
- [ ] Review middleware that might bypass auth

**Debug Command**:
```php
// In AuthController::login()
Log::info('Login attempt', ['email' => $request->email]);
$user = User::where('email', $request->email)->first();
Log::info('User found', ['exists' => $user ? 'yes' : 'no']);
```

### For Trip Start Issue
- [ ] Check trip state validation (must be on-going?)
- [ ] Verify started_at field is nullable/nullable datetime
- [ ] Look for required validator rules
- [ ] Check Trip model for fillable properties
- [ ] Verify start() method doesn't expect parameters

**Debug Command**:
```php
// In TripController::start()
$trip = Trip::find($id);
Log::info('Trip state', $trip->toArray());
$validator = Validator::make([], $trip->rules());  // Check rules
```

---

## 🎯 QUICK COMMAND REFERENCE

**Start Laravel Dev Server**:
```bash
php artisan serve --host 127.0.0.1 --port 8000
```

**Check Database Connection**:
```php
php artisan tinker
> DB::connection()->getPdo();
> User::count();
> User::where('role', 'customer')->first();
```

**View Recent Errors**:
```bash
tail -n 50 Laravel/storage/logs/laravel.log
```

**Clear Application Cache**:
```bash
php artisan cache:clear
php artisan view:clear
php artisan config:clear
```

**Reset Database** (if needed):
```bash
php artisan migrate:fresh --seed
```

---

## 🔍 FILES TO CHECK

| Issue | File | Method/Function |
|-------|------|-----------------|
| Invalid login | `app/Http/Controllers/AuthController.php` | `login()` |
| Invalid login | `app/Models/User.php` | Check provider |
| Trip start fail | `app/Http/Controllers/TripController.php` | `start()` |
| Trip start fail | `app/Models/Trip.php` | Validation rules |
| Customer missing | `database/seeders/` | Check seeders |
| Notifications 404 | `routes/api.php` | Check routes |

---

## 📈 SUCCESS CRITERIA

**Fix #1 - Invalid Login**: ✅ When POST with invalid credentials returns 401  
**Fix #2 - Trip Start**: ✅ When POST /api/trips/3/start returns 200 OK  
**Fix #3 - Customer User**: ✅ When POST login with test@example.com returns token  

**All Passing**: Ready for production! ✅

---

## 🚀 DEPLOYMENT STEPS

1. Apply all 3 fixes locally
2. Run full test suite (above)
3. Verify all tests pass (4/4 required)
4. Commit to git: `git commit -m "Session 5: Fix auth, trip start, and test user"`
5. Push to main: `git push origin main`
6. Deploy to production
7. Run smoke tests in production
8. Update status to "Production Ready"

**Estimated time**: 2-3 hours ⏱️

---

**Guide Version**: 1.0  
**Last Updated**: May 24, 2026  
**Status**: Ready for Implementation
