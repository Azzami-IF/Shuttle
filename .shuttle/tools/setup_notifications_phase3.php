<?php
/**
 * Phase 3 Notifications Setup Script
 * Creates all necessary files and directories for the notification system
 */

$baseDir = dirname(__FILE__);
$appDir = $baseDir . '/app';
$resourcesDir = $baseDir . '/resources/views';
$configDir = $baseDir . '/config';
$dbDir = $baseDir . '/database/migrations';

// Create directories if they don't exist
$dirs = [
    $appDir . '/Services',
    $appDir . '/Jobs',
    $appDir . '/Mail',
    $resourcesDir . '/emails',
    $dbDir,
];

foreach ($dirs as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
        echo "Created directory: $dir\n";
    }
}

// 1. Create NotificationService.php
$notificationServiceContent = <<<'PHP'
<?php

namespace App\Services;

use Illuminate\Support\Facades\Queue;
use Exception;

class NotificationService
{
    public const CHANNEL_EMAIL = 'email';
    public const CHANNEL_SMS = 'sms';
    public const CHANNEL_PUSH = 'push';

    /**
     * Send notification through multiple channels
     */
    public static function send($userId, $message, $channels = ['email'], $data = [])
    {
        foreach ($channels as $channel) {
            try {
                match ($channel) {
                    self::CHANNEL_EMAIL => self::sendEmail($userId, $message, $data),
                    self::CHANNEL_SMS => self::sendSMS($userId, $message, $data),
                    self::CHANNEL_PUSH => self::sendPush($userId, $message, $data),
                    default => null
                };
            } catch (Exception $e) {
                \Log::error("Notification failed for {$channel}: " . $e->getMessage());
            }
        }
    }

    /**
     * Send email notification
     */
    private static function sendEmail($userId, $message, $data = [])
    {
        Queue::push(new \App\Jobs\SendEmailNotification(
            $userId,
            $data['subject'] ?? 'Notification',
            $data['view'] ?? 'emails.notification',
            $data
        ));
    }

    /**
     * Send SMS notification
     */
    private static function sendSMS($userId, $message, $data = [])
    {
        $user = \App\Models\User::find($userId);
        if ($user && $user->phone) {
            Queue::push(new \App\Jobs\SendSMSNotification(
                $userId,
                $message,
                $user->phone
            ));
        }
    }

    /**
     * Send push notification
     */
    private static function sendPush($userId, $message, $data = [])
    {
        Queue::push(new \App\Jobs\SendPushNotification(
            $userId,
            $data['title'] ?? 'Notification',
            $message,
            $data
        ));
    }

    /**
     * Send booking confirmation notification
     */
    public static function notifyBookingConfirmation($booking)
    {
        $user = $booking->user;
        $channels = ['email'];

        if ($user->phone) {
            $channels[] = 'sms';
        }

        self::send($user->id, 'Your booking has been confirmed!', $channels, [
            'subject' => 'Booking Confirmation',
            'view' => 'emails.booking-confirmation',
            'title' => 'Booking Confirmed',
            'booking' => $booking,
        ]);
    }

    /**
     * Send booking cancellation notification
     */
    public static function notifyBookingCancellation($booking)
    {
        $user = $booking->user;
        $channels = ['email'];

        if ($user->phone) {
            $channels[] = 'sms';
        }

        self::send($user->id, 'Your booking has been cancelled.', $channels, [
            'subject' => 'Booking Cancellation',
            'view' => 'emails.booking-cancellation',
            'title' => 'Booking Cancelled',
            'booking' => $booking,
        ]);
    }

    /**
     * Send trip update notification
     */
    public static function notifyTripUpdate($booking, $updateMessage)
    {
        $user = $booking->user;
        $channels = ['email'];

        if ($user->phone) {
            $channels[] = 'sms';
        }

        self::send($user->id, $updateMessage, $channels, [
            'subject' => 'Trip Update',
            'view' => 'emails.trip-update',
            'title' => 'Trip Update',
            'message' => $updateMessage,
            'booking' => $booking,
        ]);
    }
}
PHP;

file_put_contents($appDir . '/Services/NotificationService.php', $notificationServiceContent);
echo "Created: app/Services/NotificationService.php\n";

// 2. Create Notification Model
$notificationModelContent = <<<'PHP'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'user_id', 'type', 'channel', 'recipient',
        'subject', 'body', 'data', 'status', 'sent_at'
    ];

    protected $casts = [
        'data' => 'json',
        'sent_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
PHP;

file_put_contents($appDir . '/Models/Notification.php', $notificationModelContent);
echo "Created: app/Models/Notification.php\n";

// 3. Create config/notifications.php
$configContent = <<<'PHP'
<?php

return [
    'email_from' => env('MAIL_FROM_ADDRESS', 'noreply@shuttle.app'),
    'sms_provider' => env('SMS_PROVIDER', 'twilio'),
    'twilio_sid' => env('TWILIO_ACCOUNT_SID'),
    'twilio_token' => env('TWILIO_AUTH_TOKEN'),
    'twilio_phone' => env('TWILIO_PHONE_NUMBER'),
    'push_provider' => env('PUSH_PROVIDER', 'fcm'),
    'fcm_api_key' => env('FCM_API_KEY'),
    'queue' => env('QUEUE_DRIVER', 'database'),
];
PHP;

file_put_contents($configDir . '/notifications.php', $configContent);
echo "Created: config/notifications.php\n";

// 4. Create SendEmailNotification Job
$emailJobContent = <<<'PHP'
<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use App\Models\User;
use App\Models\Notification;

class SendEmailNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public $userId,
        public $subject,
        public $viewName,
        public $data = []
    ) {}

    public function handle()
    {
        $user = User::find($this->userId);
        if (!$user) return;

        try {
            Mail::to($user->email)
                ->send(new \App\Mail\NotificationMail(
                    $this->subject,
                    $this->viewName,
                    $this->data
                ));

            Notification::create([
                'user_id' => $this->userId,
                'type' => $this->data['type'] ?? 'generic',
                'channel' => 'email',
                'recipient' => $user->email,
                'subject' => $this->subject,
                'body' => $this->data['message'] ?? '',
                'data' => $this->data,
                'status' => 'sent',
                'sent_at' => now(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Email notification failed: ' . $e->getMessage());
            Notification::create([
                'user_id' => $this->userId,
                'type' => $this->data['type'] ?? 'generic',
                'channel' => 'email',
                'recipient' => $user->email,
                'subject' => $this->subject,
                'status' => 'failed',
            ]);
        }
    }
}
PHP;

file_put_contents($appDir . '/Jobs/SendEmailNotification.php', $emailJobContent);
echo "Created: app/Jobs/SendEmailNotification.php\n";

// 5. Create SendSMSNotification Job
$smsJobContent = <<<'PHP'
<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Twilio\Rest\Client;
use App\Models\Notification;

class SendSMSNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public $userId,
        public $message,
        public $phone
    ) {}

    public function handle()
    {
        try {
            $sid = config('notifications.twilio_sid');
            $token = config('notifications.twilio_token');
            $fromPhone = config('notifications.twilio_phone');

            if (!$sid || !$token || !$fromPhone) {
                throw new \Exception('Twilio credentials not configured');
            }

            $twilio = new Client($sid, $token);
            $twilio->messages->create($this->phone, [
                'from' => $fromPhone,
                'body' => $this->message
            ]);

            Notification::create([
                'user_id' => $this->userId,
                'channel' => 'sms',
                'recipient' => $this->phone,
                'body' => $this->message,
                'status' => 'sent',
                'sent_at' => now(),
            ]);
        } catch (\Exception $e) {
            \Log::error('SMS notification failed: ' . $e->getMessage());
            Notification::create([
                'user_id' => $this->userId,
                'channel' => 'sms',
                'recipient' => $this->phone,
                'body' => $this->message,
                'status' => 'failed',
            ]);
        }
    }
}
PHP;

file_put_contents($appDir . '/Jobs/SendSMSNotification.php', $smsJobContent);
echo "Created: app/Jobs/SendSMSNotification.php\n";

// 6. Create SendPushNotification Job
$pushJobContent = <<<'PHP'
<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use GuzzleHttp\Client;
use App\Models\User;
use App\Models\Notification;

class SendPushNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public $userId,
        public $title,
        public $body,
        public $data = []
    ) {}

    public function handle()
    {
        try {
            $user = User::find($this->userId);
            if (!$user || !$user->fcm_token) return;

            $apiKey = config('notifications.fcm_api_key');
            if (!$apiKey) {
                throw new \Exception('FCM API key not configured');
            }

            $client = new Client();
            $response = $client->post('https://fcm.googleapis.com/fcm/send', [
                'headers' => [
                    'Authorization' => 'key=' . $apiKey,
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'to' => $user->fcm_token,
                    'notification' => [
                        'title' => $this->title,
                        'body' => $this->body,
                    ],
                    'data' => $this->data,
                ]
            ]);

            Notification::create([
                'user_id' => $this->userId,
                'channel' => 'push',
                'recipient' => $user->fcm_token,
                'subject' => $this->title,
                'body' => $this->body,
                'data' => $this->data,
                'status' => 'sent',
                'sent_at' => now(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Push notification failed: ' . $e->getMessage());
            Notification::create([
                'user_id' => $this->userId,
                'channel' => 'push',
                'subject' => $this->title,
                'body' => $this->body,
                'status' => 'failed',
            ]);
        }
    }
}
PHP;

file_put_contents($appDir . '/Jobs/SendPushNotification.php', $pushJobContent);
echo "Created: app/Jobs/SendPushNotification.php\n";

// 7. Create NotificationMail Mailable
$mailableContent = <<<'PHP'
<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public $subject,
        public $viewName,
        public $data = []
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: $this->viewName,
            with: $this->data,
        );
    }
}
PHP;

file_put_contents($appDir . '/Mail/NotificationMail.php', $mailableContent);
echo "Created: app/Mail/NotificationMail.php\n";

// 8. Create BookingConfirmationMail
$bookingMailContent = <<<'PHP'
<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookingConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Booking $booking) {}

    public function envelope(): Envelope
    {
        $origin = $this->booking->schedule->origin ?? 'Origin';
        $destination = $this->booking->schedule->destination ?? 'Destination';
        
        return new Envelope(
            subject: "Booking Confirmation - $origin to $destination",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.booking-confirmation',
            with: [
                'booking' => $this->booking,
                'schedule' => $this->booking->schedule,
            ],
        );
    }
}
PHP;

file_put_contents($appDir . '/Mail/BookingConfirmationMail.php', $bookingMailContent);
echo "Created: app/Mail/BookingConfirmationMail.php\n";

echo "\n✓ All files created successfully!\n";
?>
