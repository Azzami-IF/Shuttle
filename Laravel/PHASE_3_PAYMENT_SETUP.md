# Phase 3 Payment System - Setup & Installation Guide

## Prerequisites

- Laravel 10+ with Sanctum authentication
- PHP 8.1+
- Composer
- Stripe Account (get free at https://stripe.com)
- MySQL/PostgreSQL database

## Step-by-Step Installation

### 1. Install Stripe PHP Library

```bash
cd Laravel
composer require stripe/stripe-php
```

### 2. Get Stripe API Keys

1. Visit [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API Keys**
3. Copy your test keys (start with `pk_test_` and `sk_test_`)
4. Save them for the next step

### 3. Configure Environment Variables

Edit `Laravel/.env`:

```env
# Add these lines to your .env file
STRIPE_PUBLIC_KEY=pk_test_your_public_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_placeholder_for_now

# Mail Configuration (for sending invoices)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_username
MAIL_PASSWORD=your_mailtrap_password
MAIL_FROM_ADDRESS=payments@shuttle.local
MAIL_FROM_NAME="Shuttle Payments"
```

**Note**: Use Mailtrap or Mailgun for testing. In production, use your email service provider.

### 4. Run Database Migrations

```bash
php artisan migrate
```

This creates two tables:
- `payments` - Stores payment information
- `invoices` - Stores invoice records

Verify tables created:
```bash
php artisan tinker
>>> DB::table('payments')->getTable()
>>> DB::table('invoices')->getTable()
```

### 5. Update Routes

The payment routes have already been added to `routes/api.php`. Verify they are present:

```bash
php artisan route:list | grep payment
php artisan route:list | grep invoice
php artisan route:list | grep refund
php artisan route:list | grep webhook
```

Expected output should show:
- `POST /api/payments/create-intent/{bookingId}`
- `POST /api/payments/confirm/{bookingId}`
- `GET /api/payments/status/{bookingId}`
- `GET /api/invoices`
- `GET /api/invoices/{invoiceId}`
- `POST /api/invoices/{invoiceId}/send-email`
- `POST /api/refunds/request/{bookingId}`
- `GET /api/refunds/status/{bookingId}`
- `POST /api/webhooks/stripe`

### 6. Configure Stripe Webhook

#### Local Development (Using Stripe CLI)

1. **Install Stripe CLI** from https://stripe.com/docs/stripe-cli
2. **Login to Stripe**: 
   ```bash
   stripe login
   ```
3. **Start Webhook Forwarding**:
   ```bash
   stripe listen --forward-to http://localhost:8000/api/webhooks/stripe
   ```
4. **Copy Webhook Secret** from the output (starts with `whsec_`)
5. **Update `.env`**:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

#### Production Deployment

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **Webhooks**
3. Click **Add Endpoint**
4. Enter your production URL: `https://your-domain.com/api/webhooks/stripe`
5. Select Events:
   - ✓ `payment_intent.succeeded`
   - ✓ `payment_intent.payment_failed`
   - ✓ `charge.refunded`
6. Click **Add Endpoint**
7. Copy the **Signing Secret** (Webhook Secret)
8. Update production `.env` with the secret

### 7. Test the Setup

#### Test Database Connection

```bash
php artisan tinker
>>> \App\Models\Payment::count()
>>> \App\Models\Invoice::count()
```

#### Test Stripe Configuration

```bash
php artisan tinker
>>> config('stripe.secret_key')
>>> config('stripe.public_key')
>>> Stripe\Stripe::setApiKey(config('stripe.secret_key'))
```

#### Test Mail Configuration

```bash
php artisan tinker
>>> Mail::raw('Test email', function($m) { $m->to('test@example.com'); })
```

#### Test API Endpoints

1. **Get Authentication Token** (assuming you have user ID 1):
   ```bash
   curl -X POST http://localhost:8000/api/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"password"}'
   ```

2. **Create Payment Intent** (use token from above):
   ```bash
   curl -X POST http://localhost:8000/api/payments/create-intent/1 \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json"
   ```

3. **Expected Response**:
   ```json
   {
     "client_secret": "pi_1234567890_secret_...",
     "payment_intent_id": "pi_1234567890..."
   }
   ```

### 8. Frontend Integration (Optional)

To complete payments on the frontend, use Stripe.js:

```html
<!-- In your HTML template -->
<script src="https://js.stripe.com/v3/"></script>

<div id="card-element"></div>
<button id="pay-button">Pay Now</button>

<script>
  const stripe = Stripe('<?php echo config("stripe.public_key"); ?>');
  const elements = stripe.elements();
  const cardElement = elements.create('card');
  cardElement.mount('#card-element');

  document.getElementById('pay-button').addEventListener('click', async () => {
    const { setupIntent, error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement
      }
    });

    if (error) {
      console.error(error);
    } else {
      console.log('Payment successful:', setupIntent);
      // Call /api/payments/confirm/{bookingId} endpoint
    }
  });
</script>
```

## Testing Payment Flow

### Complete Test Scenario

1. **Create a Booking**:
   ```bash
   curl -X POST http://localhost:8000/api/bookings \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "schedule_id": 1,
       "seat_id": 1
     }'
   ```

2. **Create Payment Intent**:
   ```bash
   curl -X POST http://localhost:8000/api/payments/create-intent/BOOKING_ID \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Simulate Stripe Payment** (in another terminal with Stripe CLI):
   ```bash
   stripe trigger payment_intent.succeeded --override payment_intent:amount=5000
   ```

4. **Confirm Payment**:
   ```bash
   curl -X POST http://localhost:8000/api/payments/confirm/BOOKING_ID \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"payment_intent_id": "pi_XXXXX"}'
   ```

5. **Verify Invoice Created**:
   ```bash
   curl -X GET http://localhost:8000/api/invoices \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

6. **Send Invoice Email**:
   ```bash
   curl -X POST http://localhost:8000/api/invoices/1/send-email \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

7. **Request Refund**:
   ```bash
   curl -X POST http://localhost:8000/api/refunds/request/BOOKING_ID \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

### Using Stripe Test Cards

For testing, use these card numbers with any future expiry and any CVC:

| Card Type | Number | Status |
|-----------|--------|--------|
| Visa | 4242 4242 4242 4242 | Success |
| Visa (debit) | 4000 0566 5566 5556 | Success |
| Mastercard | 5555 5555 5555 4444 | Success |
| Amex | 3782 822463 10005 | Success |
| Decline | 4000 0000 0000 0002 | Declined |
| 3D Secure | 4000 0025 0000 3155 | Requires 3D Secure |

## Production Deployment Checklist

- [ ] Update `.env` with production Stripe **live** keys
- [ ] Configure webhook endpoint in Stripe Dashboard
- [ ] Update `MAIL_MAILER` to production email service
- [ ] Run `php artisan migrate --force` on production
- [ ] Test payment flow with live keys
- [ ] Monitor webhook deliveries in Stripe Dashboard
- [ ] Set up error alerts/logging
- [ ] Review security settings
- [ ] Configure SSL certificate
- [ ] Backup database before going live

## Troubleshooting

### Payment Intent Creation Fails

**Symptom**: `Payment intent creation failed: Invalid API Key provided`

**Solution**:
1. Verify `STRIPE_SECRET_KEY` in `.env`
2. Check key starts with `sk_test_` or `sk_live_`
3. Test: `php artisan tinker` → `Stripe\Stripe::setApiKey(config('stripe.secret_key'))`

### Webhook Not Receiving Events

**Symptom**: Payment succeeded on Stripe but booking status not updated

**Solution**:
1. Check webhook is forwarding: `stripe logs` (with Stripe CLI running)
2. Verify webhook secret: `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
3. Check Laravel logs: `tail -f Laravel/storage/logs/laravel.log`
4. Ensure endpoint is publicly accessible

### Invoice Email Not Sending

**Symptom**: `sendInvoiceEmail()` returns false

**Solution**:
1. Check mail configuration in `.env`
2. Verify `MAIL_FROM_ADDRESS` is set
3. Test mail: `php artisan tinker` → `Mail::raw('test', fn($m) => $m->to('test@test.com'))`
4. Check Laravel logs for mail errors

### Database Migration Error

**Symptom**: `Table already exists` or foreign key errors

**Solution**:
1. Check if tables exist: `php artisan migrate:status`
2. Roll back: `php artisan migrate:rollback`
3. Verify foreign key tables exist (bookings, users, etc.)
4. Run again: `php artisan migrate`

### Refund Processing Failed

**Symptom**: Refund request returns error

**Solution**:
1. Verify booking status is `booked`
2. Check payment exists for booking: `curl http://localhost:8000/api/payments/status/BOOKING_ID`
3. Verify charge is refundable in Stripe Dashboard
4. Check refund amount doesn't exceed original payment

## Performance Optimization

### Caching Payment Status

Add caching to `getPaymentStatus()`:

```php
public static function getPaymentStatus($paymentIntentId)
{
    return Cache::remember('payment_' . $paymentIntentId, 300, function () use ($paymentIntentId) {
        Stripe::setApiKey(config('stripe.secret_key'));
        return PaymentIntent::retrieve($paymentIntentId);
    });
}
```

### Rate Limiting

Adjust throttle in `routes/api.php`:
- Payment operations: 60 per minute (current)
- Increase for high-traffic: `throttle:300,1`
- Decrease for protection: `throttle:30,1`

### Database Indexing

Indexes already configured on:
- `payments.status`
- `invoices.status`
- `invoices.user_id`

## Support & Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Laravel Documentation**: https://laravel.com/docs
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Stripe CLI**: https://stripe.com/docs/stripe-cli
- **Issue Reporting**: Check `Laravel/storage/logs/laravel.log`

## Next Steps

1. Install Stripe library: `composer require stripe/stripe-php`
2. Configure Stripe keys in `.env`
3. Run migrations: `php artisan migrate`
4. Set up webhook with Stripe CLI
5. Test with test cards and Stripe CLI events
6. Deploy to production with live keys

Happy payment processing! 🚀
