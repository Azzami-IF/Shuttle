# Phase 3: Payment System Implementation

## Overview

The Phase 3 Payment System provides a complete payment processing solution using Stripe, including payment intent creation, confirmation, refund processing, and invoice generation.

## Components

### 1. **Stripe Integration Service** (`PaymentService.php`)

Core service for handling all Stripe operations:

#### Key Methods:

- **`createPaymentIntent($bookingId, $amount, $currency = 'usd')`**
  - Creates a new Stripe Payment Intent
  - Converts amount to cents
  - Records payment in local database
  - Returns `client_secret` and `payment_intent_id`

- **`confirmPayment($paymentIntentId)`**
  - Verifies payment succeeded with Stripe
  - Updates local payment record with `paid_at` timestamp
  - Returns boolean success status

- **`refundPayment($paymentIntentId, $amount = null)`**
  - Processes full or partial refund
  - Updates payment status to `refunded`
  - Records refund timestamp
  - Returns refund object from Stripe

- **`getPaymentStatus($paymentIntentId)`**
  - Retrieves current payment status from Stripe
  - Compares with local database status
  - Useful for syncing and auditing

### 2. **Payment Controller** (`PaymentController.php`)

Handles all payment API endpoints:

#### Endpoints:

- **POST `/api/payments/create-intent/{bookingId}`**
  - Creates payment intent for a booking
  - Requires authentication & booking ownership
  - Returns: `client_secret`, `payment_intent_id`

- **POST `/api/payments/confirm/{bookingId}`**
  - Confirms payment after Stripe processing
  - Updates booking status to `booked`
  - Auto-generates invoice
  - Returns: Confirmed booking details

- **GET `/api/payments/status/{bookingId}`**
  - Gets payment status
  - Returns: Payment intent status, amount, currency, timestamps

- **POST `/api/webhooks/stripe`** (Public)
  - Webhook endpoint for Stripe events
  - Handles: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
  - No authentication required

### 3. **Invoice Service** (`InvoiceService.php`)

Manages invoice generation and delivery:

#### Key Methods:

- **`generateInvoice($bookingId)`**
  - Creates invoice record for booking
  - Generates unique invoice number: `INV-YYYYMM-00001`
  - Associates with user and booking
  - Returns: Invoice instance

- **`sendInvoiceEmail($invoiceId)`**
  - Queues invoice email to user
  - Updates `emailed_at` timestamp
  - Uses Laravel Mail with Mailable template

- **`markAsPaid($invoiceId)`**
  - Sets invoice status to `paid`
  - Records payment timestamp
  - Admin only operation

- **`getInvoiceDetails($invoiceId)`**
  - Retrieves full invoice with relationships
  - Includes: booking, user, schedule, seat information

### 4. **Invoice Controller** (`InvoiceController.php`)

Handles invoice API endpoints:

#### Endpoints:

- **GET `/api/invoices/{invoiceId}`**
  - Get single invoice details
  - User can view own invoices, admin can view all
  - Returns: Full invoice object with related data

- **GET `/api/invoices`**
  - Get user's invoices (paginated, 15 per page)
  - Sorted by issued_at descending
  - Returns: Paginated invoice list

- **POST `/api/invoices/{invoiceId}/send-email`**
  - Resend invoice email to user
  - Admin or invoice owner only
  - Returns: Success message

- **POST `/api/admin/invoices/{invoiceId}/mark-paid`** (Admin only)
  - Manually mark invoice as paid
  - Records payment timestamp
  - Returns: Updated invoice

### 5. **Refund Controller** (`RefundController.php`)

Handles refund requests and status:

#### Endpoints:

- **POST `/api/refunds/request/{bookingId}`**
  - Request refund for booked booking
  - Only booking owner or admin can request
  - Booking must be in `booked` status
  - Updates booking to `cancelled`
  - Returns: Booking and payment status

- **GET `/api/refunds/status/{bookingId}`**
  - Get refund status for booking
  - Shows: booking status, payment status, refund timestamp
  - User can check own, admin can check all

### 6. **Payment Model** (`Payment.php`)

Database model for payment records:

#### Fields:
- `booking_id` - Foreign key to bookings
- `stripe_payment_intent_id` - Stripe's unique identifier
- `amount` - Payment amount (decimal)
- `currency` - ISO currency code (default: usd)
- `status` - pending|completed|refunded|failed
- `paid_at` - Timestamp of payment completion
- `refunded_at` - Timestamp of refund (if applicable)

### 7. **Invoice Model** (`Invoice.php`)

Database model for invoice records:

#### Fields:
- `booking_id` - Foreign key to bookings
- `user_id` - Foreign key to users
- `invoice_number` - Unique invoice identifier (INV-YYYYMM-00001)
- `amount` - Invoice amount (decimal)
- `status` - issued|sent|paid|cancelled
- `issued_at` - When invoice was generated
- `paid_at` - When payment was received
- `emailed_at` - When invoice was emailed

### 8. **Email Template** (`invoice.blade.php`)

Professional HTML email template featuring:
- Company branding (Shuttle)
- Invoice details and dates
- Customer billing information
- Item listing with amounts
- Payment summary and total
- Payment instructions (if unpaid)
- Payment confirmation (if paid)

## Database Migrations

Two migrations are provided:

### `2024_01_01_000001_create_payments_table.php`
Creates the payments table with proper indexing and foreign keys.

### `2024_01_01_000002_create_invoices_table.php`
Creates the invoices table with relationships and status tracking.

### Running Migrations:
```bash
php artisan migrate
```

## Configuration

### Environment Variables (`.env`)

```env
# Stripe Keys
STRIPE_PUBLIC_KEY=pk_test_51234567890...
STRIPE_SECRET_KEY=sk_test_1234567890...
STRIPE_WEBHOOK_SECRET=whsec_1234567890...
```

### Configuration File (`config/stripe.php`)

```php
return [
    'public_key' => env('STRIPE_PUBLIC_KEY'),
    'secret_key' => env('STRIPE_SECRET_KEY'),
    'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
];
```

## API Usage Examples

### 1. Create Payment Intent

```bash
curl -X POST http://localhost:8000/api/payments/create-intent/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

Response:
```json
{
  "client_secret": "pi_1234567890_secret_...",
  "payment_intent_id": "pi_1234567890..."
}
```

### 2. Confirm Payment

```bash
curl -X POST http://localhost:8000/api/payments/confirm/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"payment_intent_id": "pi_1234567890..."}'
```

Response:
```json
{
  "message": "Payment confirmed",
  "booking": {
    "id": 1,
    "status": "booked",
    ...
  }
}
```

### 3. Get Payment Status

```bash
curl -X GET http://localhost:8000/api/payments/status/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "booking_id": 1,
  "booking_status": "booked",
  "payment": {
    "payment_intent_id": "pi_1234567890...",
    "status": "succeeded",
    "amount": 50000,
    "currency": "usd",
    "db_status": "completed",
    "paid_at": "2024-01-15T10:30:00Z",
    "refunded_at": null
  }
}
```

### 4. Get Invoices

```bash
curl -X GET http://localhost:8000/api/invoices \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "data": [
    {
      "id": 1,
      "invoice_number": "INV-202401-00001",
      "amount": "50000.00",
      "status": "issued",
      "issued_at": "2024-01-15T10:30:00Z",
      "paid_at": null,
      "emailed_at": null
    }
  ],
  "pagination": {...}
}
```

### 5. Request Refund

```bash
curl -X POST http://localhost:8000/api/refunds/request/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "message": "Refund processed successfully",
  "booking": {
    "id": 1,
    "status": "cancelled"
  },
  "payment_status": "refunded"
}
```

### 6. Get Refund Status

```bash
curl -X GET http://localhost:8000/api/refunds/status/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "booking_id": 1,
  "status": "cancelled",
  "payment_status": "refunded",
  "paid_at": "2024-01-15T10:30:00Z",
  "refunded_at": "2024-01-16T12:00:00Z"
}
```

### 7. Send Invoice Email

```bash
curl -X POST http://localhost:8000/api/invoices/1/send-email \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "message": "Invoice emailed successfully"
}
```

## Webhook Setup

### Configure Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
3. Select Events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy Webhook Secret to `.env` as `STRIPE_WEBHOOK_SECRET`

### Test Webhook Locally

Use Stripe CLI:
```bash
stripe listen --forward-to localhost:8000/api/webhooks/stripe
stripe trigger payment_intent.succeeded
```

## Payment Flow Diagram

```
User Booking
    ↓
Create Payment Intent
    ↓ [Returns client_secret]
Frontend Payment Collection (Stripe.js)
    ↓ [User completes payment on Stripe]
Stripe Process & Send Event
    ↓
Webhook Handler Processes Event
    ↓
Confirm Payment (Frontend calls API)
    ↓
Mark Booking as Booked
    ↓
Generate Invoice
    ↓
Send Invoice Email
    ↓
Complete
```

## Refund Flow

```
Booked Booking
    ↓
Request Refund
    ↓ [Validate: booking owner or admin]
Process Refund via Stripe
    ↓
Update Payment Status → refunded
    ↓
Update Booking Status → cancelled
    ↓
Log Refund Event
    ↓
Complete
```

## Error Handling

All endpoints include comprehensive error handling:

- **400**: Bad Request (validation errors, payment failures)
- **403**: Unauthorized (user permission issues)
- **404**: Not Found (booking/payment/invoice not found)
- **500**: Server Error (Stripe API errors logged)

Errors return JSON:
```json
{
  "message": "Error description"
}
```

## Security Considerations

1. **Payment Intent Validation**: Always verify payment intent status with Stripe
2. **Webhook Verification**: Signature verified before processing
3. **User Authorization**: All endpoints verify user owns the resource
4. **Admin Only**: Sensitive operations (mark paid) admin-only
5. **Stripe Keys**: Never exposed in frontend, always server-side
6. **Logging**: All payment operations logged for audit trail

## Testing

### Unit Tests Example

```php
// Test payment intent creation
$response = $this->post('/api/payments/create-intent/1', [], [
    'Authorization' => 'Bearer ' . $token
]);

$this->assertArrayHasKey('client_secret', $response->json());
$this->assertArrayHasKey('payment_intent_id', $response->json());
```

### Integration Tests Example

```php
// Test complete payment flow
$booking = Booking::factory()->create();

// Create intent
$intent = $this->createPaymentIntent($booking->id);

// Confirm payment
$response = $this->post("/api/payments/confirm/{$booking->id}", [
    'payment_intent_id' => $intent['payment_intent_id']
]);

$booking->refresh();
$this->assertEquals('booked', $booking->status);
```

## Troubleshooting

### Issue: "Payment intent creation failed"
- Check Stripe API keys in `.env`
- Verify keys match your Stripe account
- Check Stripe API rate limits

### Issue: "Webhook not processing"
- Verify webhook secret matches `.env`
- Check Stripe webhook delivery logs
- Ensure endpoint is publicly accessible
- Test with Stripe CLI: `stripe trigger payment_intent.succeeded`

### Issue: "Invoice not sending"
- Check mail configuration in `.env`
- Verify `MAIL_FROM_ADDRESS` is set
- Check Laravel logs for mail errors
- Test mail with `php artisan tinker`: `Mail::raw('test', function($m) { $m->to('test@test.com'); })`

### Issue: "Refund failed"
- Verify payment was successfully completed
- Check charge has refund capability (check Stripe dashboard)
- Verify refund amount doesn't exceed payment amount
- Check Stripe API rate limits

## Phase 3 Completion Checklist

- ✅ Stripe Payment Service
- ✅ Payment Model & Database Migration
- ✅ Payment Controller & API Endpoints
- ✅ Invoice Service & Model
- ✅ Invoice Controller & API Endpoints
- ✅ Refund Controller & API Endpoints
- ✅ Invoice Email Template
- ✅ Configuration Management
- ✅ Webhook Handling
- ✅ Error Handling & Logging
- ✅ API Route Integration
- ✅ Comprehensive Documentation

## Next Steps

1. **Run migrations**: `php artisan migrate`
2. **Set Stripe keys** in `.env` (get from Stripe Dashboard)
3. **Configure webhook** in Stripe Dashboard
4. **Test payment flow** with Stripe test keys
5. **Deploy to production** with live Stripe keys
6. **Monitor webhook delivery** in Stripe Dashboard
7. **Track payments** in admin dashboard

## Related Documentation

- [Stripe Payment Intent Docs](https://stripe.com/docs/payments/payment-intents)
- [Stripe Webhook Docs](https://stripe.com/docs/webhooks)
- [Stripe Refund Docs](https://stripe.com/docs/refunds)
- [Laravel Mail Docs](https://laravel.com/docs/mail)
- [Laravel API Resource Docs](https://laravel.com/docs/eloquent-resources)
