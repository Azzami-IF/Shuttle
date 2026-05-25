# Phase 3 Payment System - API Reference

## Base URL
```
http://localhost:8000/api
```

## Authentication
All payment endpoints (except webhooks) require Bearer token authentication:

```
Authorization: Bearer YOUR_SANCTUM_TOKEN
```

---

## Payment Endpoints

### Create Payment Intent

**Endpoint**: `POST /payments/create-intent/{bookingId}`

**Authentication**: Required (User must own booking)

**Description**: Creates a Stripe Payment Intent for a booking. Returns client secret for frontend payment processing.

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| bookingId | integer | ID of the booking to create payment for |

**Request Body**: None

**Success Response** (200):
```json
{
  "client_secret": "pi_1234567890_secret_abc123xyz",
  "payment_intent_id": "pi_1234567890xyz"
}
```

**Error Responses**:
- `400`: Invalid booking ID or payment already exists
- `403`: Unauthorized (not booking owner)
- `404`: Booking not found

**Example**:
```bash
curl -X POST http://localhost:8000/api/payments/create-intent/42 \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..." \
  -H "Content-Type: application/json"
```

---

### Confirm Payment

**Endpoint**: `POST /payments/confirm/{bookingId}`

**Authentication**: Required (User must own booking)

**Description**: Confirms a Stripe payment and marks booking as booked. Auto-generates invoice.

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| bookingId | integer | ID of the booking |

**Request Body**:
```json
{
  "payment_intent_id": "pi_1234567890xyz"
}
```

**Required Fields**:
- `payment_intent_id` (string) - The payment intent ID from Stripe

**Success Response** (200):
```json
{
  "message": "Payment confirmed",
  "booking": {
    "id": 42,
    "user_id": 1,
    "schedule_id": 5,
    "seat_id": 12,
    "status": "booked",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:35:00Z"
  }
}
```

**Error Responses**:
- `400`: Payment not completed or validation error
- `403`: Unauthorized
- `404`: Booking not found

**Example**:
```bash
curl -X POST http://localhost:8000/api/payments/confirm/42 \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"payment_intent_id": "pi_1234567890xyz"}'
```

---

### Get Payment Status

**Endpoint**: `GET /payments/status/{bookingId}`

**Authentication**: Required (User must own booking or be admin)

**Description**: Retrieves current payment status for a booking from Stripe and local database.

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| bookingId | integer | ID of the booking |

**Query Parameters**: None

**Success Response** (200):
```json
{
  "booking_id": 42,
  "booking_status": "booked",
  "payment": {
    "payment_intent_id": "pi_1234567890xyz",
    "status": "succeeded",
    "amount": 50000,
    "currency": "usd",
    "db_status": "completed",
    "paid_at": "2024-01-15T10:35:00Z",
    "refunded_at": null
  }
}
```

**Error Responses**:
- `400`: Payment retrieval failed
- `403`: Unauthorized
- `404`: Payment not found

**Example**:
```bash
curl -X GET http://localhost:8000/api/payments/status/42 \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
```

---

## Invoice Endpoints

### Get User Invoices (Paginated)

**Endpoint**: `GET /invoices`

**Authentication**: Required

**Description**: Retrieves all invoices for authenticated user with pagination.

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| per_page | integer | 15 | Items per page |

**Success Response** (200):
```json
{
  "data": [
    {
      "id": 1,
      "booking_id": 42,
      "user_id": 1,
      "invoice_number": "INV-202401-00001",
      "amount": "50000.00",
      "status": "issued",
      "issued_at": "2024-01-15T10:35:00Z",
      "paid_at": null,
      "emailed_at": null,
      "created_at": "2024-01-15T10:35:00Z",
      "updated_at": "2024-01-15T10:35:00Z"
    }
  ],
  "links": {
    "first": "http://localhost:8000/api/invoices?page=1",
    "last": "http://localhost:8000/api/invoices?page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "per_page": 15,
    "to": 1,
    "total": 1
  }
}
```

**Error Responses**:
- `400`: Retrieval error

**Example**:
```bash
curl -X GET "http://localhost:8000/api/invoices?page=1&per_page=10" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
```

---

### Get Invoice Details

**Endpoint**: `GET /invoices/{invoiceId}`

**Authentication**: Required (User can view own, admin can view all)

**Description**: Retrieves detailed information for a specific invoice.

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| invoiceId | integer | ID of the invoice |

**Success Response** (200):
```json
{
  "id": 1,
  "booking_id": 42,
  "user_id": 1,
  "invoice_number": "INV-202401-00001",
  "amount": "50000.00",
  "status": "issued",
  "issued_at": "2024-01-15T10:35:00Z",
  "paid_at": null,
  "emailed_at": null,
  "created_at": "2024-01-15T10:35:00Z",
  "updated_at": "2024-01-15T10:35:00Z",
  "booking": {
    "id": 42,
    "user_id": 1,
    "schedule_id": 5,
    "status": "booked",
    "schedule": {
      "id": 5,
      "route": "New York to Boston",
      "price": "50000.00",
      "departure_time": "2024-01-20T08:00:00Z"
    }
  },
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

**Error Responses**:
- `403`: Unauthorized
- `404`: Invoice not found

**Example**:
```bash
curl -X GET http://localhost:8000/api/invoices/1 \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
```

---

### Send Invoice Email

**Endpoint**: `POST /invoices/{invoiceId}/send-email`

**Authentication**: Required (User can send own, admin can send any)

**Description**: Sends invoice via email to the invoice owner.

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| invoiceId | integer | ID of the invoice |

**Request Body**: None

**Success Response** (200):
```json
{
  "message": "Invoice emailed successfully"
}
```

**Error Responses**:
- `400`: Email sending failed
- `403`: Unauthorized
- `404`: Invoice not found

**Example**:
```bash
curl -X POST http://localhost:8000/api/invoices/1/send-email \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..." \
  -H "Content-Type: application/json"
```

---

### Mark Invoice as Paid (Admin Only)

**Endpoint**: `POST /admin/invoices/{invoiceId}/mark-paid`

**Authentication**: Required (Admin only)

**Description**: Manually marks an invoice as paid (admin function).

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| invoiceId | integer | ID of the invoice |

**Request Body**: None

**Success Response** (200):
```json
{
  "message": "Invoice marked as paid",
  "invoice": {
    "id": 1,
    "invoice_number": "INV-202401-00001",
    "amount": "50000.00",
    "status": "paid",
    "issued_at": "2024-01-15T10:35:00Z",
    "paid_at": "2024-01-15T10:40:00Z",
    "updated_at": "2024-01-15T10:40:00Z"
  }
}
```

**Error Responses**:
- `400`: Operation failed
- `403`: Unauthorized (admin only)
- `404`: Invoice not found

**Example**:
```bash
curl -X POST http://localhost:8000/api/admin/invoices/1/mark-paid \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Refund Endpoints

### Request Refund

**Endpoint**: `POST /refunds/request/{bookingId}`

**Authentication**: Required (User must own booking or be admin)

**Description**: Processes a refund for a booked booking. Updates booking status to cancelled.

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| bookingId | integer | ID of the booking |

**Request Body**: None

**Success Response** (200):
```json
{
  "message": "Refund processed successfully",
  "booking": {
    "id": 42,
    "user_id": 1,
    "status": "cancelled",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:45:00Z"
  },
  "payment_status": "refunded"
}
```

**Error Responses**:
- `400`: Booking cannot be refunded (already cancelled), no payment found
- `403`: Unauthorized
- `404`: Booking not found

**Example**:
```bash
curl -X POST http://localhost:8000/api/refunds/request/42 \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..." \
  -H "Content-Type: application/json"
```

---

### Get Refund Status

**Endpoint**: `GET /refunds/status/{bookingId}`

**Authentication**: Required (User can check own, admin can check any)

**Description**: Retrieves refund status for a booking.

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| bookingId | integer | ID of the booking |

**Success Response** (200):
```json
{
  "booking_id": 42,
  "status": "cancelled",
  "payment_status": "refunded",
  "paid_at": "2024-01-15T10:35:00Z",
  "refunded_at": "2024-01-15T10:45:00Z"
}
```

**Error Responses**:
- `400`: Retrieval error
- `403`: Unauthorized
- `404`: Booking not found

**Example**:
```bash
curl -X GET http://localhost:8000/api/refunds/status/42 \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
```

---

## Webhook Endpoint

### Stripe Webhook Handler

**Endpoint**: `POST /webhooks/stripe`

**Authentication**: Not required (Signature verified)

**Description**: Receives and processes Stripe webhook events.

**Headers Required**:
```
Content-Type: application/json
Stripe-Signature: t=timestamp,v1=signature_hash
```

**Webhook Events Handled**:
- `payment_intent.succeeded` - Updates booking status to booked
- `payment_intent.payment_failed` - Logs failure
- `charge.refunded` - Logs refund

**Success Response** (200):
```
Webhook received
```

**Error Responses**:
- `400`: Invalid payload or signature
- `400`: Webhook error (logged)

**Example** (using Stripe CLI):
```bash
stripe listen --forward-to http://localhost:8000/api/webhooks/stripe
stripe trigger payment_intent.succeeded
```

---

## Status Codes Reference

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid data, validation error, payment failed |
| 403 | Forbidden | Unauthorized, insufficient permissions |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Stripe API error, database error |

---

## Error Response Format

All error responses follow this format:

```json
{
  "message": "Error description here"
}
```

**Examples**:
```json
{"message": "Unauthorized"}
{"message": "Booking cannot be refunded (current status: pending)"}
{"message": "Payment not completed"}
{"message": "No payment found for this booking"}
```

---

## Rate Limiting

Payment endpoints are rate limited as follows:

| Endpoint Type | Rate Limit | Window |
|---------------|-----------|--------|
| Payment Endpoints | 60 requests | 1 minute |
| Invoice Endpoints | 60 requests | 1 minute |
| Refund Endpoints | 60 requests | 1 minute |

Rate limit headers included in responses:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1705329600
```

---

## Payment Flow Examples

### Complete Payment Flow

1. **Create Payment Intent**
   ```bash
   POST /payments/create-intent/42
   Response: { client_secret, payment_intent_id }
   ```

2. **Process Payment on Frontend** (using Stripe.js)
   - User enters card details
   - Frontend calls `stripe.confirmCardPayment(clientSecret)`
   - Stripe processes payment

3. **Confirm Payment**
   ```bash
   POST /payments/confirm/42
   Body: { payment_intent_id }
   Response: { message: "Payment confirmed", booking }
   ```

4. **Check Invoice**
   ```bash
   GET /invoices
   Response: [{ id, invoice_number, status, amount, ... }]
   ```

5. **Send Invoice Email**
   ```bash
   POST /invoices/1/send-email
   Response: { message: "Invoice emailed successfully" }
   ```

### Refund Flow

1. **Check Payment Status**
   ```bash
   GET /payments/status/42
   Response: { payment_status: "completed" }
   ```

2. **Request Refund**
   ```bash
   POST /refunds/request/42
   Response: { booking: { status: "cancelled" }, payment_status: "refunded" }
   ```

3. **Check Refund Status**
   ```bash
   GET /refunds/status/42
   Response: { status: "cancelled", payment_status: "refunded", refunded_at }
   ```

---

## Testing Stripe Test Cards

| Card Number | Type | Result |
|-------------|------|--------|
| 4242 4242 4242 4242 | Visa | Succeeds |
| 5555 5555 5555 4444 | Mastercard | Succeeds |
| 3782 822463 10005 | American Express | Succeeds |
| 4000 0000 0000 0002 | Visa | Declines |
| 4000 0025 0000 3155 | Visa | 3D Secure Required |

**For all test cards, use**:
- Any future expiration date
- Any 3-digit CVC
- Any postal code

---

## Authentication Example

```bash
# Get token (from login endpoint)
TOKEN=$(curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password"
  }' | jq -r '.token')

# Use token in payment request
curl -X POST http://localhost:8000/api/payments/create-intent/42 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

---

## Troubleshooting Common Errors

### "Unauthorized"
- Check token is valid and not expired
- Verify user owns the resource
- Ensure token included in `Authorization: Bearer` header

### "Booking cannot be refunded"
- Check booking status is `booked`
- Cannot refund pending, cancelled, or completed bookings
- Use `GET /refunds/status/{bookingId}` to check current status

### "No payment found"
- Payment hasn't been created yet
- Call `POST /payments/create-intent/{bookingId}` first
- Verify booking exists

### "Payment not completed"
- Stripe hasn't processed the payment yet
- Check `GET /payments/status/{bookingId}` for current status
- Wait for webhook to process if recently submitted
- Check Stripe dashboard for transaction status

---

## Performance Tips

1. **Cache payment status** - Don't check immediately after creation
2. **Batch operations** - Combine multiple API calls when possible
3. **Use webhooks** - Let Stripe notify you instead of polling
4. **Paginate invoices** - Don't load all invoices at once
5. **Monitor rate limits** - Check remaining requests in headers

---

## Support

For issues, check:
1. Laravel logs: `Laravel/storage/logs/laravel.log`
2. Stripe dashboard: https://dashboard.stripe.com
3. Stripe documentation: https://stripe.com/docs
4. Status codes and error messages above

Last updated: January 2024
