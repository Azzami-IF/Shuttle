# Phase 3 Notifications - Quick Reference

## Quick Start (5 minutes)

### 1. Environment Setup
```bash
# Copy .env variables
MAIL_FROM_ADDRESS=noreply@shuttle.app
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
FCM_API_KEY=your_fcm_key
```

### 2. Database Migration
```bash
php artisan migrate
```

### 3. Start Queue Worker
```bash
php artisan queue:listen
```

### 4. Basic Usage
```php
use App\Services\NotificationService;

// Send booking confirmation
NotificationService::notifyBookingConfirmation($booking);

// Send cancellation
NotificationService::notifyBookingCancellation($booking);

// Send custom notification
NotificationService::send(
    $user->id,
    'Your message',
    ['email', 'sms', 'push'],
    ['subject' => 'Title']
);
```

---

## File Quick Reference

| File | Purpose |
|------|---------|
| `app/Services/NotificationService.php` | Main notification handler |
| `app/Jobs/SendEmailNotification.php` | Email queue job |
| `app/Jobs/SendSMSNotification.php` | SMS queue job |
| `app/Jobs/SendPushNotification.php` | Push queue job |
| `app/Models/Notification.php` | Database model |
| `config/notifications.php` | Configuration |
| `resources/views/emails/` | Email templates |

---

## API Endpoints

### Send Notification to User
```http
POST /api/users/{id}/notify
Authorization: Bearer {token}

{
  "message": "Your booking is confirmed",
  "channels": ["email", "sms"],
  "subject": "Booking Confirmation"
}
```

### Get User Notifications
```http
GET /api/users/{id}/notifications
Authorization: Bearer {token}
```

### Mark as Read
```http
PATCH /api/notifications/{id}/read
Authorization: Bearer {token}
```

---

## Environment Variables

```env
# Email
MAIL_FROM_ADDRESS=noreply@shuttle.app
MAIL_FROM_NAME=Shuttle

# SMS (Twilio)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Push (Firebase)
FCM_API_KEY=AIza...

# Queue
QUEUE_DRIVER=database
```

---

## Common Tasks

### Test Email
```bash
php artisan tinker
$user = User::first();
Mail::to($user->email)->send(new App\Mail\NotificationMail('Test', 'emails.notification', []));
```

### Test SMS
```bash
php artisan tinker
$job = new App\Jobs\SendSMSNotification(1, 'Test message', '+1234567890');
$job->handle();
```

### Check Notification Status
```bash
php artisan tinker
Notification::where('channel', 'email')->where('status', 'sent')->count();
```

### Retry Failed Notifications
```bash
php artisan queue:retry all
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Notifications not sending | Verify queue:listen is running |
| SMS fails | Check Twilio credentials in .env |
| Push doesn't arrive | Verify FCM token in database |
| Email not delivered | Check MAIL_FROM_ADDRESS and template |

---

## Key Classes

### NotificationService (Main API)
```php
// Constants
NotificationService::CHANNEL_EMAIL
NotificationService::CHANNEL_SMS
NotificationService::CHANNEL_PUSH

// Methods
send($userId, $message, $channels, $data)
notifyBookingConfirmation($booking)
notifyBookingCancellation($booking)
notifyTripUpdate($booking, $message)
```

### Notification Model
```php
// Relationships
$notification->user()

// Attributes
$notification->channel    // 'email', 'sms', 'push'
$notification->status     // 'pending', 'sent', 'failed', 'read'
$notification->recipient  // Email, phone, or token
```

---

## Integration Points

### In BookingController
```php
public function store(Request $request) {
    $booking = Booking::create($validated);
    NotificationService::notifyBookingConfirmation($booking);
    return response()->json($booking);
}
```

### In Ionic App
```javascript
// Register FCM token when user logs in
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
const token = await FirebaseMessaging.getToken();
await apiClient.post('/api/users/me/fcm-token', { fcm_token: token });
```

---

## Database Queries

```php
// Get all notifications for user
User::find($id)->notifications;

// Get sent notifications
Notification::where('status', 'sent')->get();

// Get failed notifications from last 24 hours
Notification::where('status', 'failed')
    ->where('created_at', '>', now()->subDay())
    ->get();

// Get notifications by channel
Notification::where('channel', 'email')->get();

// Statistics
Notification::selectRaw('channel, count(*) as count, 
    sum(case when status="sent" then 1 else 0 end) as sent')
    ->groupBy('channel')
    ->get();
```

---

## Monitoring

### Check Queue Status
```bash
php artisan queue:failed
```

### View Recent Logs
```bash
tail -100 storage/logs/laravel.log | grep -i notif
```

### Monitor Worker
```bash
ps aux | grep queue:work
```

---

## Security Notes

1. Always validate phone numbers before SMS
2. Keep credentials in .env (never commit)
3. Rotate FCM keys monthly
4. Test with non-production accounts first
5. Log failed notifications for audit

---

## Version Info

- Laravel: 11.x
- PHP: 8.2+
- Queue: Database-driven
- Status: Complete & Ready for Production

---

For detailed documentation, see `PHASE_3_NOTIFICATIONS_COMPLETE.md`
