# Phase 3 Payment System - Quick Reference Guide

## 🚀 Installation (5 Minutes)

```bash
# 1. Install Stripe
composer require stripe/stripe-php

# 2. Add to .env
STRIPE_PUBLIC_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here

# 3. Run migrations
php artisan migrate

# 4. Setup webhook (in another terminal)
stripe login
stripe listen --forward-to http://localhost:8000/api/webhooks/stripe

# 5. Copy webhook secret from output to .env
```

---

## 📋 File Structure

```
Laravel/
├── app/
│   ├── Http/Controllers/
│   │   ├── PaymentController.php      ← Payment endpoints
│   │   ├── InvoiceController.php      ← Invoice endpoints
│   │   └── RefundController.php       ← Refund endpoints
│   ├── Services/
│   │   ├── PaymentService.php         ← Stripe operations
│   │   └── InvoiceService.php         ← Invoice management
│   ├── Models/
│   │   ├── Payment.php                ← Payment model
│   │   └── Invoice.php                ← Invoice model
│   ├── Mail/
│   │   └── InvoiceMail.php            ← Invoice email
│   └── config/
│       └── stripe.php                 ← Stripe config
├── database/migrations/
│   ├── 2024_01_01_000001_create_payments_table.php
│   └── 2024_01_01_000002_create_invoices_table.php
├── resources/views/emails/
│   └── invoice.blade.php              ← Invoice template
├── routes/
│   └── api.php                        ← Payment routes
└── PHASE_3_PAYMENT_*.md               ← Documentation
```

---

## 🔌 API Endpoints

### Payment Flow
```
1. Create Intent
   POST /api/payments/create-intent/{bookingId}
   → Returns: client_secret, payment_intent_id

2. Process on Frontend
   Use Stripe.js with client_secret

3. Confirm Payment
   POST /api/payments/confirm/{bookingId}
   Body: {payment_intent_id}
   → Updates booking to "booked"
   → Auto-generates invoice

4. Check Status
   GET /api/payments/status/{bookingId}
   → Returns: payment status, amount, dates
```

### Invoice Flow
```
1. List Invoices
   GET /api/invoices
   → Paginated list of user invoices

2. Get Details
   GET /api/invoices/{invoiceId}
   → Full invoice with relationships

3. Send Email
   POST /api/invoices/{invoiceId}/send-email
   → Queues invoice to user

4. Admin Mark Paid
   POST /api/admin/invoices/{invoiceId}/mark-paid
   → Sets status to "paid"
```

### Refund Flow
```
1. Request Refund
   POST /api/refunds/request/{bookingId}
   → Refunds payment
   → Updates booking to "cancelled"

2. Check Status
   GET /api/refunds/status/{bookingId}
   → Shows refund timestamp
```

---

## 🧪 Quick Test Scenarios

### Scenario 1: Complete Payment (2 minutes)

```bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password"
  }' | jq -r '.token')

# Create intent
RESPONSE=$(curl -s -X POST http://localhost:8000/api/payments/create-intent/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

INTENT_ID=$(echo $RESPONSE | jq -r '.payment_intent_id')
echo "Payment Intent: $INTENT_ID"

# Trigger webhook (in another terminal)
stripe trigger payment_intent.succeeded

# Confirm payment
curl -X POST http://localhost:8000/api/payments/confirm/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"payment_intent_id\": \"$INTENT_ID\"}"

# Check invoice was created
curl -X GET http://localhost:8000/api/invoices \
  -H "Authorization: Bearer $TOKEN"
```

### Scenario 2: Refund (1 minute)

```bash
# Request refund
curl -X POST http://localhost:8000/api/refunds/request/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Check refund status
curl -X GET http://localhost:8000/api/refunds/status/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Scenario 3: Send Invoice Email (30 seconds)

```bash
# Get invoice ID
INVOICE_ID=$(curl -s -X GET http://localhost:8000/api/invoices \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data[0].id')

# Send email
curl -X POST http://localhost:8000/api/invoices/$INVOICE_ID/send-email \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

---

## 🎯 Common Commands

```bash
# Check routes
php artisan route:list | grep -E "payment|invoice|refund"

# Test Stripe config
php artisan tinker
>>> config('stripe.secret_key')
>>> Stripe\Stripe::setApiKey(config('stripe.secret_key'))

# Run migrations
php artisan migrate

# Rollback migrations
php artisan migrate:rollback

# Test mail
php artisan tinker
>>> Mail::raw('test', fn($m) => $m->to('test@test.com'))

# Clear logs
rm Laravel/storage/logs/laravel.log

# Tail logs
tail -f Laravel/storage/logs/laravel.log

# Monitor Stripe CLI
stripe logs

# Trigger test event
stripe trigger payment_intent.succeeded
```

---

## 🔑 Environment Variables Needed

```env
# Stripe Keys (get from https://dashboard.stripe.com/apikeys)
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Mail Configuration (for invoice emails)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io (or your provider)
MAIL_PORT=2525
MAIL_USERNAME=...
MAIL_PASSWORD=...
MAIL_FROM_ADDRESS=payments@shuttle.local
MAIL_FROM_NAME="Shuttle Payments"
```

---

## 🧠 Database Tables

### Payments Table
| Column | Type | Notes |
|--------|------|-------|
| id | bigint | Primary key |
| booking_id | bigint | Foreign key to bookings |
| stripe_payment_intent_id | string | Unique, from Stripe |
| amount | decimal | In cents/smallest unit |
| currency | string | ISO code (usd, eur, etc) |
| status | enum | pending\|completed\|refunded\|failed |
| paid_at | timestamp | When payment succeeded |
| refunded_at | timestamp | When refund was processed |

### Invoices Table
| Column | Type | Notes |
|--------|------|-------|
| id | bigint | Primary key |
| booking_id | bigint | Foreign key to bookings |
| user_id | bigint | Foreign key to users |
| invoice_number | string | Unique (INV-YYYYMM-xxxxx) |
| amount | decimal | Invoice amount |
| status | enum | issued\|sent\|paid\|cancelled |
| issued_at | timestamp | When generated |
| paid_at | timestamp | When marked paid |
| emailed_at | timestamp | When emailed |

---

## ⚠️ Common Issues

### "Invalid API Key provided"
```bash
# Check .env has correct key
grep STRIPE_SECRET_KEY .env

# Test in Artisan
php artisan tinker
>>> config('stripe.secret_key')
```

### "Webhook not processing"
```bash
# Check CLI is running
stripe logs

# Verify webhook secret
grep STRIPE_WEBHOOK_SECRET .env

# Restart CLI
stripe listen --forward-to http://localhost:8000/api/webhooks/stripe
```

### "Email not sending"
```bash
# Check mail config
grep MAIL_ .env

# Test mail
php artisan tinker
>>> Mail::raw('test', fn($m) => $m->to('test@test.com'))

# Check logs
tail -f Laravel/storage/logs/laravel.log
```

### "Refund failed"
```bash
# Check booking status
php artisan tinker
>>> \App\Models\Booking::find(1)->status

# Booking must be "booked" to refund
# Check Stripe dashboard for charge refundability
```

---

## 📊 API Response Examples

### Create Intent (200 OK)
```json
{
  "client_secret": "pi_1234567890_secret_...",
  "payment_intent_id": "pi_1234567890..."
}
```

### Confirm Payment (200 OK)
```json
{
  "message": "Payment confirmed",
  "booking": {
    "id": 1,
    "status": "booked",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### Get Payment Status (200 OK)
```json
{
  "booking_id": 1,
  "booking_status": "booked",
  "payment": {
    "status": "succeeded",
    "amount": 50000,
    "currency": "usd",
    "paid_at": "2024-01-15T10:35:00Z"
  }
}
```

### Error Response (400 Bad Request)
```json
{
  "message": "Booking cannot be refunded (current status: pending)"
}
```

---

## 🔐 Test Card Numbers

| Card | Number | Status |
|------|--------|--------|
| Visa | 4242 4242 4242 4242 | Success |
| Mastercard | 5555 5555 5555 4444 | Success |
| Decline | 4000 0000 0000 0002 | Declined |
| 3D Secure | 4000 0025 0000 3155 | 3D Secure |

**Use any future expiry and any 3-digit CVC**

---

## 📚 Documentation Files

| File | Purpose | Size |
|------|---------|------|
| PHASE_3_PAYMENT_SYSTEM_DOCS.md | Complete system guide | 13.4 KB |
| PHASE_3_PAYMENT_SETUP.md | Installation & setup | 10.7 KB |
| PHASE_3_PAYMENT_API_REFERENCE.md | API endpoints reference | 15.4 KB |
| PHASE_3_PAYMENT_COMPLETION_REPORT.md | Completion summary | 16.7 KB |

---

## ✅ Implementation Checklist

### Before Testing
- [ ] Installed stripe/stripe-php
- [ ] Added Stripe keys to .env
- [ ] Ran migrations
- [ ] Started Stripe CLI webhook listener

### Testing
- [ ] Created booking
- [ ] Created payment intent
- [ ] Processed payment
- [ ] Confirmed payment
- [ ] Verified invoice created
- [ ] Tested refund
- [ ] Checked all status endpoints

### Production
- [ ] Switched to live Stripe keys
- [ ] Configured production webhook in Stripe
- [ ] Tested with live keys
- [ ] Set up error monitoring
- [ ] Backed up database
- [ ] Deployed to production

---

## 🎯 Quick Stats

| Metric | Count |
|--------|-------|
| Files Created | 14 |
| Lines of Code | 1,200+ |
| API Endpoints | 9 |
| Database Tables | 2 |
| Services | 2 |
| Controllers | 3 |
| Models | 2 |
| Documentation | 39.5 KB |
| Complete? | ✅ YES |

---

## 🚀 Deployment Steps

1. **Prepare Production**
   ```bash
   composer require stripe/stripe-php
   ```

2. **Configure Environment**
   ```bash
   # Update .env with LIVE Stripe keys
   STRIPE_PUBLIC_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   ```

3. **Setup Database**
   ```bash
   php artisan migrate --force
   ```

4. **Configure Webhook**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add: https://your-domain.com/api/webhooks/stripe
   - Copy signing secret to .env

5. **Test**
   - Use production test cards
   - Verify webhook delivery
   - Check invoice emails

6. **Monitor**
   - Watch Stripe dashboard
   - Monitor Laravel logs
   - Track payment events

---

## 💬 Getting Help

1. **Check Documentation**
   - PHASE_3_PAYMENT_SYSTEM_DOCS.md (architecture)
   - PHASE_3_PAYMENT_SETUP.md (setup)
   - PHASE_3_PAYMENT_API_REFERENCE.md (API)

2. **Check Logs**
   ```bash
   tail -f Laravel/storage/logs/laravel.log
   ```

3. **Test Configuration**
   ```bash
   php artisan tinker
   >>> config('stripe.secret_key')
   >>> \App\Models\Payment::count()
   ```

4. **Monitor Stripe**
   - Stripe Dashboard: https://dashboard.stripe.com
   - Check Events, Webhooks, Logs

5. **Review Code**
   - Controllers: `app/Http/Controllers/`
   - Services: `app/Services/`
   - Models: `app/Models/`

---

**Last Updated**: January 2024
**Status**: ✅ Complete and Ready for Testing

Happy payment processing! 💳
