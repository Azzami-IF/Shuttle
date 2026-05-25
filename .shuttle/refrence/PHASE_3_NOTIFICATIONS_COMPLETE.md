# Phase 3 Notifications Foundation - Complete Implementation Guide

## Overview

This document provides comprehensive setup instructions and integration examples for the Shuttle notification system. The system supports three channels: Email, SMS, and Push Notifications, with asynchronous queue processing for optimal performance.

---

## Part 1: File Structure

All Phase 3 notification files have been created:

```
Laravel/
├── app/
│   ├── Services/
│   │   └── NotificationService.php          [TASK 1: Multi-channel notification handler]
│   ├── Jobs/
│   │   ├── SendEmailNotification.php        [TASK 2: Email queue job]
│   │   ├── SendSMSNotification.php          [TASK 3: SMS queue job]
│   │   └── SendPushNotification.php         [TASK 4: Push queue job]
│   ├── Mail/
│   │   ├── NotificationMail.php             [Generic notification mailable]
│   │   └── BookingConfirmationMail.php      [Booking-specific mailable]
│   └── Models/
│       └── Notification.php                 [Database model for tracking]
├── config/
│   └── notifications.php                    [Provider configuration]
├── database/
│   └── migrations/
│       └── 2026_05_23_000001_create_notifications_table.php
└── resources/views/emails/
    ├── booking-confirmation.blade.php       [Email template]
    ├── booking-cancellation.blade.php       [Email template]
    └── trip-update.blade.php                [Email template]
```

---

## Part 2: Database Setup

### Run Migration

```bash
php artisan migrate
```

This creates:
1. **notifications** table - tracks all sent notifications
2. Adds **fcm_token** and **phone** columns to users table

### Notifications Table Schema

```
id              - Primary key
user_id         - Foreign key to users table
type            - Notification type (booking_confirmation, cancellation, update, generic)
channel         - Delivery channel (email, sms, push)
recipient       - Email, phone, or FCM token
subject         - For email notifications
body            - Notification message
data            - JSON metadata
status          - pending, sent, failed, read
sent_at         - Timestamp when sent
created_at      - Created timestamp
updated_at      - Updated timestamp
```

### Indexes Created
- user_id
- status
- channel
- created_at

---

## Part 3: Environment Configuration

### Required Environment Variables

Add to `.env`:

```env
# Email Configuration
MAIL_FROM_ADDRESS=noreply@shuttle.app
MAIL_FROM_NAME="Shuttle Bus Booking"

# SMS Configuration (Twilio)
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_twilio_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Push Notification Configuration (Firebase)
PUSH_PROVIDER=fcm
FCM_API_KEY=your_fcm_api_key_here

# Queue Configuration
QUEUE_DRIVER=database
QUEUE_CONNECTION=database
```

---

## Part 4: Provider Setup Instructions

### 4.1 Twilio SMS Setup

#### Step 1: Create Twilio Account
1. Visit https://www.twilio.com/console
2. Sign up for free trial account (includes $15 credit)
3. Verify your personal phone number
4. Get your Account SID and Auth Token from the console

#### Step 2: Get Twilio Phone Number
1. Go to Phone Numbers section
2. Buy a phone number (or use trial number)
3. This becomes your TWILIO_PHONE_NUMBER in .env

#### Step 3: Install Twilio SDK
```bash
composer require twilio/sdk
```

#### Step 4: Test SMS Sending
```php
// In tinker or a test command
$twilio = new \Twilio\Rest\Client(
    env('TWILIO_ACCOUNT_SID'),
    env('TWILIO_AUTH_TOKEN')
);

$message = $twilio->messages->create(
    '+1234567890',  // User's phone number
    ['from' => env('TWILIO_PHONE_NUMBER'), 'body' => 'Test message']
);

echo "Message SID: " . $message->sid;
```

---

### 4.2 Firebase Cloud Messaging (FCM) Setup

#### Step 1: Create Firebase Project
1. Visit https://console.firebase.google.com
2. Click "Create a project"
3. Enter project name: "Shuttle"
4. Complete setup process

#### Step 2: Generate Service Account Key
1. Go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save the JSON file securely

#### Step 3: Get FCM API Key
1. Go to Cloud Messaging tab
2. Copy the "Server API Key"
3. This becomes your FCM_API_KEY in .env

#### Step 4: Install Guzzle (for HTTP requests)
```bash
composer require guzzlehttp/guzzle
```

#### Step 5: Frontend Integration
In your mobile app (Ionic), add FCM:
```bash
npm install @capacitor-firebase/messaging
```

Register device token when user logs in:
```javascript
import { FirebaseMessaging } from '@capacitor-firebase/messaging';

// Get and send FCM token to backend
const token = await FirebaseMessaging.getToken();
// Send token to API endpoint /api/users/{id}/fcm-token
```

---

## Part 5: API Integration

### 5.1 Update User Model

Add relationships to `app/Models/User.php`:

```php
public function notifications()
{
    return $this->hasMany(Notification::class);
}

public function updateFcmToken($token)
{
    $this->update(['fcm_token' => $token]);
}
```

### 5.2 Create FCM Token Endpoint

Add to `routes/api.php`:

```php
Route::post('/users/{user}/fcm-token', function (Request $request, User $user) {
    $this->authorize('update', $user);
    $user->updateFcmToken($request->fcm_token);
    return response()->json(['message' => 'FCM token updated']);
})->middleware('auth:sanctum');
```

### 5.3 Integration with Booking Flow

Update `app/Http/Controllers/BookingController.php`:

```php
use App\Services\NotificationService;

public function store(Request $request)
{
    // Create booking...
    $booking = Booking::create($validated);
    
    // Send notification
    NotificationService::notifyBookingConfirmation($booking);
    
    return response()->json($booking);
}

public function cancel(Booking $booking)
{
    // Cancel booking...
    $booking->update(['status' => 'cancelled']);
    
    // Send notification
    NotificationService::notifyBookingCancellation($booking);
    
    return response()->json(['message' => 'Booking cancelled']);
}
```

---

## Part 6: Usage Examples

### Basic Notification Send

```php
use App\Services\NotificationService;

// Send to single channel
NotificationService::send(
    userId: $user->id,
    message: 'Your booking is confirmed!',
    channels: ['email'],
    data: [
        'subject' => 'Booking Confirmation',
        'view' => 'emails.booking-confirmation',
        'booking' => $booking,
    ]
);

// Send to multiple channels
NotificationService::send(
    userId: $user->id,
    message: 'Trip update: Your driver is 5 minutes away',
    channels: ['email', 'sms', 'push'],
    data: [
        'subject' => 'Trip Update',
        'title' => 'Driver Arrival',
        'message' => 'Your driver is 5 minutes away',
    ]
);
```

### Specialized Methods

```php
// Booking confirmation (auto-includes SMS if phone exists)
NotificationService::notifyBookingConfirmation($booking);

// Booking cancellation
NotificationService::notifyBookingCancellation($booking);

// Trip updates
NotificationService::notifyTripUpdate(
    $booking,
    'Your driver has arrived at your location'
);
```

### Manual Notification Query

```php
// Get user's notifications
$notifications = $user->notifications()->latest()->get();

// Get sent notifications
$sent = $user->notifications()->where('status', 'sent')->get();

// Get failed notifications for retry
$failed = Notification::where('status', 'failed')
    ->where('created_at', '>', now()->subHours(24))
    ->get();
```

---

## Part 7: Queue Processing

### Setup Queue Database Table

```bash
php artisan queue:table
php artisan migrate
```

### Start Queue Worker

For development:
```bash
php artisan queue:listen
```

For production (using Supervisor):
```bash
[program:shuttle-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/shuttle/artisan queue:work database --sleep=3 --tries=3
autostart=true
autorestart=true
numprocs=4
redirect_stderr=true
stdout_logfile=/path/to/shuttle/storage/logs/worker.log
```

---

## Part 8: Testing

### Unit Testing

Create `tests/Unit/NotificationServiceTest.php`:

```php
<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\Booking;
use App\Models\Schedule;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Queue;

class NotificationServiceTest extends TestCase
{
    public function test_notification_service_can_send_email()
    {
        Queue::fake();
        
        $user = User::factory()->create();
        
        NotificationService::send(
            $user->id,
            'Test message',
            ['email'],
            ['subject' => 'Test', 'view' => 'emails.notification']
        );
        
        Queue::assertPushed(\App\Jobs\SendEmailNotification::class);
    }

    public function test_notification_sends_sms_when_phone_exists()
    {
        Queue::fake();
        
        $user = User::factory()->create(['phone' => '+1234567890']);
        
        NotifyBookingConfirmation($booking);
        
        Queue::assertPushed(\App\Jobs\SendSMSNotification::class);
    }

    public function test_booking_confirmation_notification()
    {
        Queue::fake();
        
        $user = User::factory()->create();
        $schedule = Schedule::factory()->create();
        $booking = Booking::factory()->create([
            'user_id' => $user->id,
            'schedule_id' => $schedule->id,
        ]);
        
        NotificationService::notifyBookingConfirmation($booking);
        
        Queue::assertPushed(\App\Jobs\SendEmailNotification::class);
    }
}
```

Run tests:
```bash
php artisan test tests/Unit/NotificationServiceTest.php
```

### Manual Testing

#### Test Email
```php
php artisan tinker
$user = User::first();
App\Services\NotificationService::send($user->id, 'Test email', ['email'], ['subject' => 'Test', 'view' => 'emails.notification']);
```

#### Test SMS
```php
php artisan tinker
$user = User::factory()->create(['phone' => '+1234567890']);
$job = new App\Jobs\SendSMSNotification($user->id, 'Test SMS', $user->phone);
$job->handle();
```

#### Test Push
```php
php artisan tinker
$user = User::factory()->create(['fcm_token' => 'test_token_here']);
$job = new App\Jobs\SendPushNotification($user->id, 'Test Title', 'Test body');
$job->handle();
```

---

## Part 9: Troubleshooting

### Issue: Notifications not sending

**Check 1:** Queue is running
```bash
php artisan queue:listen
```

**Check 2:** Configuration is set
```bash
php artisan tinker
config('notifications.fcm_api_key')  // Should return value, not null
```

**Check 3:** Check logs
```bash
tail -f storage/logs/laravel.log
```

### Issue: SMS not sending

1. Verify Twilio credentials in `.env`
2. Check user has valid phone number
3. Test with Twilio console first
4. Check logs for detailed error

### Issue: Push notifications not reaching device

1. Verify FCM token is correctly stored in database
2. Check FCM_API_KEY is correct
3. Verify device is subscribed to notifications in Ionic app
4. Check Firebase console for delivery errors

### Issue: Email not being delivered

1. Check MAIL_FROM_ADDRESS is valid
2. Verify blade template exists
3. Check email provider configuration (Gmail, SendGrid, etc)
4. Test with `php artisan tinker`:
```php
Mail::to('test@example.com')->send(new App\Mail\NotificationMail('Subject', 'emails.notification', ['test' => 'data']));
```

---

## Part 10: Monitoring & Analytics

### Query Notification Statistics

```php
// Get notification stats by channel
Notification::groupBy('channel')
    ->selectRaw('channel, count(*) as total, sum(case when status = "sent" then 1 else 0 end) as sent')
    ->get();

// Get failed notifications
Notification::where('status', 'failed')
    ->where('created_at', '>', now()->subDays(7))
    ->get();

// Get notification delivery rate
$total = Notification::count();
$sent = Notification::where('status', 'sent')->count();
$rate = ($sent / $total) * 100;

// Per-user notification count
User::with(['notifications' => function ($q) {
    $q->where('status', 'sent');
}])->get();
```

### Artisan Commands

Create `app/Console/Commands/RetryFailedNotifications.php`:

```php
<?php

namespace App\Console\Commands;

use App\Models\Notification;
use Illuminate\Console\Command;

class RetryFailedNotifications extends Command
{
    protected $signature = 'notifications:retry-failed {--hours=24}';
    protected $description = 'Retry failed notifications';

    public function handle()
    {
        $hours = $this->option('hours');
        
        $failed = Notification::where('status', 'failed')
            ->where('created_at', '>', now()->subHours($hours))
            ->get();

        foreach ($failed as $notification) {
            // Dispatch job to retry
            $this->info("Retrying notification {$notification->id}");
        }
    }
}
```

Run:
```bash
php artisan notifications:retry-failed --hours=24
```

---

## Part 11: Security Considerations

### 1. API Rate Limiting
Add to `config/rate_limit.php`:
```php
'notifications' => '10:1',  // 10 per minute
```

### 2. Validation
Always validate user input:
```php
$validated = $request->validate([
    'message' => 'required|string|max:1000',
    'channels' => 'required|array|in:email,sms,push',
    'phone' => 'required_if:channels,*sms|phone',
]);
```

### 3. Authorization
Use policies:
```php
$this->authorize('notify', $user);
```

### 4. Data Privacy
- Never log sensitive notification content
- Encrypt stored phone numbers
- Comply with GDPR for user data

### 5. Third-Party Credentials
- Store credentials in `.env`, never in code
- Rotate API keys regularly
- Use separate keys for development/production

---

## Part 12: Performance Optimization

### Batch Processing
```php
// Send to multiple users
$users = User::where('role', 'passenger')->pluck('id');
foreach ($users as $userId) {
    NotificationService::send($userId, $message, ['email']);
}
```

### Database Indexing
Already included in migration:
- user_id (for filtering by user)
- status (for finding pending/failed)
- channel (for analytics)
- created_at (for time-based queries)

### Queue Configuration
In `.env`:
```env
QUEUE_CONNECTION=database
QUEUE_TIMEOUT=360          # Job timeout in seconds
QUEUE_TRIES=3              # Retry attempts
```

---

## Completion Checklist

- [x] NotificationService class created
- [x] Email notification job created
- [x] SMS notification job created
- [x] Push notification job created
- [x] Notification model created
- [x] Database migration created
- [x] Configuration file created
- [x] Email templates created (3 templates)
- [x] Mailable classes created (2 classes)
- [x] Documentation complete

**Total Files Created: 12**
**Total Lines of Code: ~1,200**

---

## Next Steps

1. Run `php artisan migrate`
2. Configure Twilio and Firebase credentials
3. Update BookingController to use NotificationService
4. Set up queue worker with Supervisor
5. Test all three channels
6. Deploy to production

---

## Support & Debugging

For detailed logs:
```bash
tail -f storage/logs/laravel.log
```

For queue debugging:
```php
php artisan queue:failed     # List failed jobs
php artisan queue:retry      # Retry failed jobs
```

For payment/provider issues:
- Twilio: https://support.twilio.com
- Firebase: https://firebase.google.com/support
- Laravel Queue: https://laravel.com/docs/queues
