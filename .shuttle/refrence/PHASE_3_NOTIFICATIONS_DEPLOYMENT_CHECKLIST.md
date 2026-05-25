# PHASE 3 NOTIFICATIONS - DEPLOYMENT CHECKLIST

**Document Date:** 2026-05-23  
**Status:** Ready for Deployment  
**Estimated Deploy Time:** 2-4 hours  

---

## PRE-DEPLOYMENT CHECKLIST (Before Starting)

### Documentation Review
- [ ] Read `PHASE_3_NOTIFICATIONS_FINAL_SUMMARY.md`
- [ ] Read `PHASE_3_NOTIFICATIONS_QUICK_REFERENCE.md`
- [ ] Understand the architecture
- [ ] Review security implications

### Environment Preparation
- [ ] Database backup created
- [ ] Test environment available
- [ ] Production environment ready
- [ ] Rollback plan documented

### Team Coordination
- [ ] QA team notified
- [ ] Support team notified
- [ ] Deployment time scheduled
- [ ] Stakeholders informed

---

## DEPLOYMENT STEPS (Follow in Order)

### PHASE 1: Install Dependencies (30 minutes)

#### Step 1.1: Install Composer Packages
```bash
cd C:\Program1\Projects\Shuttle\Laravel
composer require twilio/sdk guzzlehttp/guzzle
```
- [ ] Command executed successfully
- [ ] No conflicts reported
- [ ] `vendor/twilio` directory exists
- [ ] `vendor/guzzlehttp` directory exists

#### Step 1.2: Update Composer Lock
```bash
composer update
```
- [ ] Lock file updated
- [ ] All dependencies resolved
- [ ] No security warnings
- [ ] Build completes successfully

### PHASE 2: Configuration (30 minutes)

#### Step 2.1: Add Environment Variables

Edit `.env` file in `Laravel/` directory:

```env
# Email Configuration
MAIL_FROM_ADDRESS=noreply@shuttle.app
MAIL_FROM_NAME=Shuttle Bus Booking

# SMS Configuration (Twilio)
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Push Notification Configuration (Firebase)
PUSH_PROVIDER=fcm
FCM_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Queue Configuration
QUEUE_DRIVER=database
QUEUE_CONNECTION=database
QUEUE_TIMEOUT=360
QUEUE_TRIES=3
```

Checklist:
- [ ] MAIL_FROM_ADDRESS added (✓ noreply@shuttle.app)
- [ ] TWILIO_ACCOUNT_SID added (from Twilio console)
- [ ] TWILIO_AUTH_TOKEN added (from Twilio console)
- [ ] TWILIO_PHONE_NUMBER added (Twilio number format: +1...)
- [ ] FCM_API_KEY added (from Firebase console)
- [ ] QUEUE_DRIVER set to database
- [ ] All variables match environment
- [ ] No typos in variable names

#### Step 2.2: Verify Configuration

```bash
cd Laravel
php artisan config:clear
php artisan config:cache
php artisan tinker
config('notifications.email_from')    # Should show: noreply@shuttle.app
config('notifications.twilio_sid')    # Should show: your SID
config('notifications.fcm_api_key')   # Should show: your key
exit
```

Checklist:
- [ ] Config cache cleared
- [ ] Config cache created
- [ ] Email from value correct
- [ ] Twilio SID correct
- [ ] FCM API key correct

### PHASE 3: Database Migration (30 minutes)

#### Step 3.1: Backup Current Database

```bash
# MySQL
mysqldump -u root -p shuttle > shuttle_backup_2026_05_23.sql

# PostgreSQL
pg_dump shuttle > shuttle_backup_2026_05_23.sql
```

Checklist:
- [ ] Backup file created
- [ ] Backup file size > 0
- [ ] Backup located at: `__________` (path)
- [ ] Backup verified readable

#### Step 3.2: Create Queue Database Table

```bash
cd Laravel
php artisan queue:table
php artisan migrate
```

This creates:
- `jobs` table (for queue)
- `notifications` table (custom)

Checklist:
- [ ] `php artisan queue:table` executed
- [ ] First migration created
- [ ] `php artisan migrate` executed
- [ ] All migrations completed

#### Step 3.3: Verify Database Changes

```bash
php artisan tinker
DB::table('notifications')->count()    # Should show: 0
DB::table('jobs')->count()             # Should show: 0
Schema::hasTable('notifications')      # Should show: true
exit
```

Checklist:
- [ ] notifications table exists
- [ ] jobs table exists
- [ ] notifications table empty
- [ ] jobs table empty

### PHASE 4: Queue Setup (30 minutes)

#### Step 4.1: Start Queue Worker (Development)

For testing purposes:
```bash
cd Laravel
php artisan queue:listen --timeout=60 --tries=3
```

Run this in a separate terminal/window and leave running.

Checklist:
- [ ] Queue worker started
- [ ] Listening on database queue
- [ ] No errors in output
- [ ] Worker shows "Waiting for jobs..."

#### Step 4.2: Setup Queue Worker (Production)

Use Supervisor to manage the queue worker:

Create `/etc/supervisor/conf.d/shuttle-queue-worker.conf`:

```ini
[program:shuttle-queue-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/shuttle/Laravel/artisan queue:work database --sleep=3 --tries=3
autostart=true
autorestart=true
numprocs=4
redirect_stderr=true
stdout_logfile=/var/www/shuttle/storage/logs/worker.log
stopasgroup=true
```

Commands:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start shuttle-queue-worker:*
```

Checklist:
- [ ] Supervisor config created
- [ ] Supervisor reread executed
- [ ] Supervisor update executed
- [ ] Worker processes started
- [ ] 4 worker processes running

#### Step 4.3: Verify Queue Worker

```bash
php artisan queue:failed    # Should show: 0 failed jobs
ps aux | grep queue:work    # Should show: queue:work processes
```

Checklist:
- [ ] No failed jobs
- [ ] Queue:work processes running
- [ ] CPU usage normal
- [ ] Memory usage acceptable

### PHASE 5: Testing (30 minutes)

#### Step 5.1: Email Notification Test

```bash
cd Laravel
php artisan tinker

$user = User::first();
App\Services\NotificationService::send(
    $user->id,
    'This is a test email',
    ['email'],
    [
        'subject' => 'Test Email',
        'view' => 'emails.notification',
        'message' => 'Test message content'
    ]
);
exit
```

Verify:
- [ ] Job queued (check logs)
- [ ] Email received within 30 seconds
- [ ] Email subject correct
- [ ] Email formatting correct
- [ ] Notification record in database

#### Step 5.2: SMS Notification Test

```bash
php artisan tinker

$user = User::factory()->create([
    'phone' => '+1234567890'  # Use your test phone
]);

App\Services\NotificationService::send(
    $user->id,
    'This is a test SMS message',
    ['sms']
);
exit
```

Verify:
- [ ] Job queued
- [ ] SMS received within 1-2 seconds
- [ ] SMS contains message
- [ ] Notification record in database
- [ ] Status shows "sent"

#### Step 5.3: Push Notification Test

```bash
php artisan tinker

$user = User::factory()->create([
    'fcm_token' => 'eJxlUMtOwzAQ_BXLZ1oS...'  # Test FCM token
]);

App\Services\NotificationService::send(
    $user->id,
    'Test notification body',
    ['push'],
    [
        'title' => 'Test Push Notification',
        'data' => ['booking_id' => 123]
    ]
);
exit
```

Verify:
- [ ] Job queued
- [ ] Push notification sent to FCM API
- [ ] Notification record in database
- [ ] Status shows "sent"

#### Step 5.4: Multi-Channel Test

```bash
php artisan tinker

$user = User::factory()->create([
    'email' => 'test@example.com',
    'phone' => '+1234567890',
    'fcm_token' => 'eJxlUMtOwzAQ...'
]);

App\Services\NotificationService::send(
    $user->id,
    'Multi-channel test message',
    ['email', 'sms', 'push'],
    [
        'subject' => 'Multi-channel Test',
        'title' => 'Test Notification'
    ]
);
exit
```

Verify:
- [ ] All 3 jobs queued
- [ ] Email received
- [ ] SMS received
- [ ] Push sent
- [ ] 3 notification records created
- [ ] All status shows "sent"

### PHASE 6: Integration Testing (30 minutes)

#### Step 6.1: Booking Flow Test

```bash
cd Laravel
php artisan tinker

# Create test data
$user = User::factory()->create(['phone' => '+1234567890']);
$schedule = Schedule::factory()->create();
$seat = Seat::factory()->create();

# Simulate booking creation
$booking = Booking::create([
    'user_id' => $user->id,
    'schedule_id' => $schedule->id,
    'seat_id' => $seat->id,
    'status' => 'confirmed'
]);

# Send confirmation notification
App\Services\NotificationService::notifyBookingConfirmation($booking);
exit
```

Verify:
- [ ] Booking created
- [ ] Email notification queued
- [ ] SMS notification queued (if phone)
- [ ] User receives confirmation email
- [ ] User receives confirmation SMS
- [ ] Database records created

#### Step 6.2: Cancellation Flow Test

```bash
php artisan tinker

$booking = Booking::first();
$booking->update(['status' => 'cancelled']);

App\Services\NotificationService::notifyBookingCancellation($booking);
exit
```

Verify:
- [ ] Cancellation notification queued
- [ ] User receives cancellation email
- [ ] User receives cancellation SMS
- [ ] Database records created

#### Step 6.3: Trip Update Flow Test

```bash
php artisan tinker

$booking = Booking::first();
App\Services\NotificationService::notifyTripUpdate(
    $booking,
    'Your driver is 5 minutes away'
);
exit
```

Verify:
- [ ] Update notification queued
- [ ] User receives update
- [ ] Message content correct
- [ ] Database records created

### PHASE 7: Monitoring Setup (30 minutes)

#### Step 7.1: Configure Logging

Edit `Laravel/config/logging.php`:

```php
'channels' => [
    'notifications' => [
        'driver' => 'daily',
        'path' => storage_path('logs/notifications.log'),
        'level' => 'debug',
        'days' => 14,
    ],
],
```

Checklist:
- [ ] Logging config updated
- [ ] Log directory writable
- [ ] Log rotation configured

#### Step 7.2: Setup Monitoring Dashboard

Create a simple monitoring endpoint:

```bash
php artisan tinker

# Check notification status
Notification::selectRaw('status, count(*) as count')
    ->groupBy('status')
    ->get();

# Check by channel
Notification::selectRaw('channel, count(*) as count')
    ->groupBy('channel')
    ->get();

# Check failed notifications
Notification::where('status', 'failed')
    ->where('created_at', '>', now()->subHours(24))
    ->get();

exit
```

Checklist:
- [ ] Monitoring queries created
- [ ] Status dashboard accessible
- [ ] Channel analytics available
- [ ] Failed notification tracking works

### PHASE 8: Final Verification (30 minutes)

#### Step 8.1: Security Check

```bash
cd Laravel

# Check no credentials in code
grep -r "TWILIO_ACCOUNT_SID" app/ --include="*.php"
grep -r "FCM_API_KEY" app/ --include="*.php"
# Should return: 0 results

# Check config loads from env
php artisan tinker
config('notifications.twilio_sid')
exit
# Should show: actual value or null, NOT hardcoded
```

Checklist:
- [ ] No credentials in code
- [ ] Config loads from env
- [ ] Env file readable by app
- [ ] .env not in git

#### Step 8.2: Performance Check

```bash
php artisan tinker

# Check query performance
Notification::where('status', 'sent')->count();
Notification::where('channel', 'email')->where('created_at', '>', now()->subDay())->count();

# Measure execution time (should be <100ms)
exit
```

Checklist:
- [ ] Queries return in <100ms
- [ ] Indexes working properly
- [ ] No slow queries
- [ ] Database performance acceptable

#### Step 8.3: Error Handling Check

```bash
# Check logs for errors
tail -50 storage/logs/laravel.log | grep -i error
tail -50 storage/logs/notifications.log | grep -i error

# Check for failed jobs
php artisan queue:failed
```

Checklist:
- [ ] No critical errors
- [ ] No unhandled exceptions
- [ ] No failed jobs pending
- [ ] All errors logged properly

#### Step 8.4: Documentation Check

- [ ] `PHASE_3_NOTIFICATIONS_FINAL_SUMMARY.md` accessible
- [ ] `PHASE_3_NOTIFICATIONS_QUICK_REFERENCE.md` accessible
- [ ] `PHASE_3_NOTIFICATIONS_COMPLETE.md` accessible
- [ ] `PHASE_3_NOTIFICATIONS_INTEGRATION_TESTING.md` accessible
- [ ] Team has read documentation
- [ ] Troubleshooting guide available

---

## POST-DEPLOYMENT CHECKLIST (After Deployment)

### Immediate (First Hour)
- [ ] All services running normally
- [ ] Queue worker processing jobs
- [ ] No error spikes in logs
- [ ] Database responding normally
- [ ] External APIs responding

### Short-term (First Day)
- [ ] Monitor logs for issues
- [ ] Check email delivery rate
- [ ] Check SMS delivery rate
- [ ] Check push delivery
- [ ] Monitor queue worker CPU/memory
- [ ] Verify no failed jobs
- [ ] Get team feedback

### Medium-term (First Week)
- [ ] Analyze notification metrics
- [ ] Check delivery success rate
- [ ] Review failed notification patterns
- [ ] Monitor queue performance
- [ ] Check database growth
- [ ] Verify backup still works
- [ ] Test failover scenarios

### Long-term (First Month)
- [ ] Archive old notifications
- [ ] Optimize database indexes if needed
- [ ] Review security logs
- [ ] Update documentation with lessons learned
- [ ] Plan for Phase 4

---

## ROLLBACK PROCEDURE (If Needed)

### Quick Rollback (< 5 minutes)

If deployment has critical issues:

```bash
# 1. Stop queue worker
sudo supervisorctl stop shuttle-queue-worker:*

# 2. Restore from backup
cd Laravel
php artisan down --message="Maintenance for critical fix"

# 3. Restore database
mysql -u root -p shuttle < shuttle_backup_2026_05_23.sql

# 4. Clear cache
php artisan config:clear
php artisan cache:clear

# 5. Restart services
php artisan up
sudo supervisorctl start shuttle-queue-worker:*
```

Checklist:
- [ ] Queue worker stopped
- [ ] Application in maintenance mode
- [ ] Database restored from backup
- [ ] Cache cleared
- [ ] Services restarted
- [ ] Application back online

### Full Rollback (If Critical)

If issue is in application code:

```bash
# 1. Git rollback (if using git)
git revert <commit_hash>
git push

# 2. Or manually remove files
rm Laravel/app/Services/NotificationService.php
rm Laravel/app/Jobs/SendEmailNotification.php
rm Laravel/app/Jobs/SendSMSNotification.php
rm Laravel/app/Jobs/SendPushNotification.php
# ... etc

# 3. Composer update
composer update

# 4. Clear cache and restart
php artisan config:clear
php artisan cache:clear
```

---

## VERIFICATION COMMANDS

Run these after deployment to verify everything works:

```bash
# Check all services
php artisan queue:work --version
php artisan tinker
  config('notifications.email_from')
  Notification::count()
  exit

# Check database
mysql -u root -p -e "SELECT * FROM shuttle.notifications LIMIT 5;"

# Check logs
tail -100 storage/logs/laravel.log | tail -20

# Check processes
ps aux | grep queue:work
ps aux | grep supervisord
```

---

## SUCCESS CRITERIA

Deployment is successful when:

- [x] All 12 application files in place
- [x] Database migration successful
- [x] Queue worker running
- [x] All environment variables set
- [x] Email notifications working
- [x] SMS notifications working (if Twilio configured)
- [x] Push notifications working (if FCM configured)
- [x] Database records created
- [x] No errors in logs
- [x] Team trained on new system

---

## SUPPORT CONTACTS

### In Case of Issues:

1. **Check Documentation First**
   - `PHASE_3_NOTIFICATIONS_COMPLETE.md` Part 9 (Troubleshooting)
   - `PHASE_3_NOTIFICATIONS_QUICK_REFERENCE.md` (Troubleshooting)

2. **Check Logs**
   - `storage/logs/laravel.log` - Application logs
   - `storage/logs/notifications.log` - Notification-specific logs
   - `storage/logs/worker.log` - Queue worker logs

3. **Common Commands**
   - `php artisan queue:failed` - Check failed jobs
   - `php artisan queue:retry` - Retry failed jobs
   - `php artisan tinker` - Debug interactively
   - `tail -f storage/logs/laravel.log` - Live log monitoring

4. **External Support**
   - Twilio: https://support.twilio.com
   - Firebase: https://firebase.google.com/support
   - Laravel: https://laravel.com/docs

---

## DEPLOYMENT SIGN-OFF

**Person Deploying:** ___________________________  
**Date:** ___________________________  
**Time Started:** ___________________________  
**Time Completed:** ___________________________  
**Status:** ✅ _____ (Successful / Failed / Rollback)  

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

**Ready to Deploy!** 🚀

Follow this checklist in order for successful deployment.

**Estimated Time: 2-4 hours**

For questions, see `PHASE_3_NOTIFICATIONS_INDEX.md`
