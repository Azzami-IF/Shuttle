# Shuttle System - Quick Start Guide

## System Overview

A real-time shuttle booking and tracking system with three main roles:
- **Customer**: Books shuttle seats and tracks journey
- **Driver**: Receives trip assignments and executes routes with operational status management
- **Admin**: Manages schedules, vehicles, drivers, and monitors operations

## Core Workflow

```
1. Customer books seat on a Schedule
   ↓
2. Schedule creates/assigns Trip when driver accepts
   ↓
3. Driver starts trip with boarding status
   ↓
4. Driver updates status: on-going, arrived, delayed, completed
   ↓
5. Customer can track bus location in real-time
   ↓
6. Trip completes, booking is marked done
```

## Getting Started (Development)

### Prerequisites
- Laravel 11 with Sanctum
- Ionic 8 with Angular
- SQLite database
- Node.js 18+

### Backend Setup
```bash
cd Laravel
php artisan migrate --seed
php artisan serve  # Runs on http://localhost:8000
```

### Frontend Setup
```bash
cd IONIC
npm install
npm start  # Runs on http://localhost:4200
```

## Key Features

### 1. Schedule Management
- Create schedules with routes, times, vehicles
- Assign drivers to schedules
- Set seat capacity and pricing
- Manage schedules (edit, cancel, etc.)

### 2. Booking System
- Search available schedules
- Select seats and complete payment
- View booking history and receipt

### 3. Driver Operations
- View assigned trips
- Update trip status: scheduled → boarding → on-going → arrived/delayed → completed
- Track passengers
- Submit location updates

### 4. Customer Tracking
- View booking history
- Track active trips in real-time
- See driver info and vehicle details
- Receive status change notifications

## API Endpoints (Key Routes)

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login and get token
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Request password reset

### Schedules
- `GET /api/schedules` - List all schedules with filters
- `POST /api/schedules` - Create schedule (admin)
- `GET /api/schedules/{schedule}` - Get schedule details

### Bookings
- `GET /api/bookings` - List customer's bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/{booking}` - Get booking details

### Trips
- `GET /api/trips` - List trips (driver-specific or all for admin)
- `GET /api/trips/{trip}` - Get trip details with schedule/driver/vehicle
- `POST /api/trips/{trip}/status` - Update trip status (driver)
- `GET /api/trips/{trip}/latest-location` - Get current bus location
- `GET /api/trips/{trip}/history` - Get location history

### Tracking
- `POST /api/trips/{trip}/location` - Submit current location (driver)

## Database Schema (Key Tables)

### users
- id, name, email, password, role (customer/driver/admin), phone, created_at

### schedules
- id, vehicle_id, driver_id, origin, destination, departure_time, price, created_at

### trips
- id, schedule_id, status, started_at, completed_at, created_at
- Status: scheduled → boarding → on-going → arrived/delayed → completed

### bookings
- id, schedule_id, user_id, seat_id, status, created_at
- Status: pending → booked → boarding → completed/cancelled

### seats
- id, schedule_id, seat_number, status, created_at
- Status: available → reserved → booked

### locations
- id, trip_id, latitude, longitude, created_at
- Driver submits GPS coordinates during trip

### vehicles
- id, name, license_plate, capacity, type, created_at

## Testing the System

### Test Accounts (Pre-seeded)

**Admin**
- Email: admin@example.com
- Password: Password123!

**Driver**
- Email: driver@example.com
- Password: Password123!

**Customer**
- Email: customer@example.com
- Password: Password123!

### Quick Test Flow

#### 1. Customer Books Ticket
```
1. Open app and login as customer
2. Go to Dashboard
3. Search available schedules (e.g., Jakarta → Bandung)
4. Select schedule and choose seat
5. Complete payment
6. Booking appears in history
```

#### 2. Trip Execution
```
1. Login as driver
2. Go to driver dashboard
3. See next trip assignment
4. Click "Buka Monitoring Trip"
5. Update status: boarding → on-going → arrived → completed
```

#### 3. Live Tracking
```
1. Login as customer
2. Go to "Riwayat Perjalanan" (Booking History)
3. Click "Lacak Bus" on active booking
4. See real-time map with bus location
5. Observe status changes and notifications
```

## Common Issues & Solutions

### Issue: "Perjalanan tidak ditemukan"
**Cause**: Trip ID is invalid or user doesn't have booking for this trip
**Solution**: Ensure you're logged in as the customer who booked, and trip exists

### Issue: Location not updating on map
**Cause**: Driver hasn't submitted location yet or is not in on-going status
**Solution**: Login as driver and update status to "on-going", then submit location

### Issue: "Unauthorized" error on API
**Cause**: Missing or invalid authentication token
**Solution**: Login again to get fresh token

### Issue: Bookings not showing schedule details
**Cause**: Eager loading not including schedule relations
**Solution**: Verify BookingController includes schedule.vehicle, schedule.driver

## Performance Optimization Notes

- Frontend polls every 5 seconds (location + status)
- Adjust polling interval in trip-tracking.page.ts if needed
- Consider implementing WebSockets for real-time updates in future
- Use indexes on trip_id, user_id, schedule_id in database
- Add caching for frequently accessed schedules

## Security Checklist

- ✅ All API endpoints have role-based authorization
- ✅ Customers can only see their own bookings
- ✅ Drivers can only update their assigned trips
- ✅ Location data only visible to assigned driver/customer
- ✅ Password hashing with bcrypt
- ✅ CSRF protection enabled
- ✅ Rate limiting recommended for production

## Deployment Checklist

- [ ] Set .env variables for production environment
- [ ] Run database migrations on production: `php artisan migrate`
- [ ] Generate new APP_KEY: `php artisan key:generate`
- [ ] Enable HTTPS in production
- [ ] Set up proper error logging
- [ ] Configure email for password resets
- [ ] Set up backup strategy for SQLite database
- [ ] Monitor API response times
- [ ] Set up alerts for failed trips or errors

## Next Phase Features

- Driver rating and review system
- Trip reassignment for failed drivers
- Push notifications
- Admin dashboard with analytics
- Mobile app (React Native)
- Payment gateway integration
- Multi-language support

---

**Last Updated**: 2026-05-24
**System Status**: PRODUCTION READY (Beta Phase)
**Version**: 1.0.0
