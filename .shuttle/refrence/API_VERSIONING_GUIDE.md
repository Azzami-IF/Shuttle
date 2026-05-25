# API VERSIONING STRATEGY & GUIDE

**Status**: ✅ COMPLETE  
**Date**: 2026-05-23  
**Impact**: Zero breaking changes, smooth API evolution

---

## Overview

API versioning enables smooth evolution of the Shuttle API without breaking existing clients. This document outlines the strategy, implementation, and migration guidelines.

---

## Versioning Strategy

### Version Numbering
- **Format**: Semantic versioning (MAJOR.MINOR)
- **Example**: 1.0, 1.1, 2.0

### Version Support Lifecycle
```
Version 1.0
├─ Status: CURRENT (Active Development)
├─ Support: Indefinite
└─ Breaking Changes: None

Version 1.1
├─ Status: DEPRECATED
├─ Support Until: 2026-12-31
├─ Breaking Changes: None (backwards compatible)
└─ Migration Path: Automatic header transformation

Version 2.0
├─ Status: DEPRECATED  
├─ Support Until: 2026-12-31
├─ Breaking Changes: Yes (field renames)
└─ Migration Path: Explicit request transformation
```

---

## How to Use API Versions

### Method 1: Accept Header (Recommended)
```http
GET /api/bookings/123 HTTP/1.1
Accept: application/vnd.shuttle.v1.1+json
```

### Method 2: X-API-Version Header
```http
GET /api/bookings/123 HTTP/1.1
X-API-Version: 1.1
```

### Method 3: Query Parameter
```http
GET /api/bookings/123?api_version=1.1
```

### Default Behavior
If no version specified, defaults to **v1.0** (most stable).

---

## Version-Specific Changes

### Version 1.0 (Current)
**Fields**:
- `user_id` (passenger)
- `car_id` (vehicle)
- `origin` (pickup location)
- `destination` (dropoff location)
- `booking_time` (scheduled departure)

**Example**:
```json
{
  "id": "booking_123",
  "user_id": "user_456",
  "car_id": "vehicle_789",
  "origin": "123 Main St",
  "destination": "456 Oak Ave",
  "booking_time": "2026-05-23 14:00:00"
}
```

### Version 1.1 (Deprecated but supported)
**New Features** (backwards compatible):
- Nested driver information
- Enhanced metadata
- Improved error messages

**Example**:
```json
{
  "id": "booking_123",
  "user_id": "user_456",
  "vehicle": {
    "id": "vehicle_789",
    "type": "sedan",
    "plate": "ABC-123"
  },
  "origin": "123 Main St",
  "destination": "456 Oak Ave",
  "booking_time": "2026-05-23 14:00:00",
  "metadata": {
    "created_at": "2026-05-23T14:00:00Z",
    "source": "mobile_app"
  }
}
```

### Version 2.0 (Deprecated but supported)
**Breaking Changes** (requires transformation):
- `user_id` → `passenger_id`
- `car_id` → `vehicle_id`
- `origin` → `origin_location`
- `destination` → `destination_location`
- `booking_time` → `scheduled_at`

**Example**:
```json
{
  "id": "booking_123",
  "passenger_id": "user_456",
  "vehicle_id": "vehicle_789",
  "origin_location": "123 Main St",
  "destination_location": "456 Oak Ave",
  "scheduled_at": "2026-05-23T14:00:00Z"
}
```

---

## Response Headers

All API responses include version information:

```http
HTTP/1.1 200 OK
X-API-Version: 1.0
X-API-Version-Status: current
Content-Type: application/json
```

### Deprecated Version Headers

For deprecated versions:

```http
HTTP/1.1 200 OK
X-API-Version: 1.1
X-API-Version-Status: deprecated
Deprecation: true
Sunset: 2026-12-31
Link: <https://docs.shuttle.com/api/migration>; rel="deprecation"
```

---

## Migration Guide

### From v1.0 to v1.1

**Automatic Transformation**: The middleware automatically handles transformations.

1. Update Accept header:
   ```javascript
   // Before
   fetch('/api/bookings', {
     headers: { 'Accept': 'application/json' }
   })

   // After
   fetch('/api/bookings', {
     headers: { 'Accept': 'application/vnd.shuttle.v1.1+json' }
   })
   ```

2. No code changes needed - responses are automatically transformed

### From v1.x to v2.0

**Manual Transformation Required**: Field names changed.

1. Update field mappings in your code:
   ```javascript
   // Before (v1.0)
   const booking = {
     user_id: 123,
     car_id: 456,
     origin: 'Main St',
     destination: 'Oak Ave'
   }

   // After (v2.0)
   const booking = {
     passenger_id: 123,
     vehicle_id: 456,
     origin_location: 'Main St',
     destination_location: 'Oak Ave'
   }
   ```

2. Update Accept header:
   ```javascript
   fetch('/api/bookings', {
     method: 'POST',
     headers: { 'Accept': 'application/vnd.shuttle.v2.0+json' },
     body: JSON.stringify(booking)
   })
   ```

3. Update response parsing:
   ```javascript
   // Handle new field names
   const booking = response.data;
   console.log(booking.passenger_id);  // Instead of user_id
   console.log(booking.vehicle_id);    // Instead of car_id
   ```

---

## Client SDK Support

### Supported SDKs

- **JavaScript**: `shuttle-sdk-js@2.0.0+`
- **Python**: `shuttle-sdk-py@2.0.0+`
- **PHP**: `shuttle-sdk-php@2.0.0+`
- **Java**: `shuttle-sdk-java@2.0.0+`

### SDK Version Detection

```javascript
const sdk = new ShuttleSDK({
  apiVersion: '1.1',  // Explicitly set version
  autoDetect: true    // Auto-detect and update
});
```

---

## Deprecation Timeline

### v1.1
- **Deprecation Date**: 2026-05-23
- **Sunset Date**: 2026-12-31
- **Days Remaining**: 221 days
- **Action Required**: Migrate to v2.0 or stay on v1.0

### v2.0
- **Deprecation Date**: 2026-05-23
- **Sunset Date**: 2026-12-31
- **Days Remaining**: 221 days
- **Action Required**: New development should use latest stable version

---

## Best Practices

### For API Consumers

1. **Always specify a version**
   ```javascript
   headers: { 'Accept': 'application/vnd.shuttle.v1.0+json' }
   ```

2. **Monitor deprecation warnings**
   ```javascript
   if (response.headers['Deprecation'] === 'true') {
     console.warn('This API version is deprecated');
     console.warn('Sunset date: ' + response.headers['Sunset']);
   }
   ```

3. **Plan migrations early**
   - Subscribe to API change notifications
   - Test with new versions before sunset
   - Update in stages, not at last minute

4. **Use semantic versioning**
   - Don't hardcode version numbers
   - Use version constraints: `~1.0` (allows 1.x.x)
   - Regularly update to latest compatible version

### For API Providers

1. **Maintain backwards compatibility**
   - Deprecated versions still work
   - Gradual phase-out (6+ months)
   - Clear migration guides

2. **Clear communication**
   - Deprecation headers in responses
   - Email notifications to API users
   - Blog posts and documentation updates

3. **Ample sunset period**
   - Minimum 6 months notice
   - Extended support on request
   - Multiple migration paths

---

## Testing API Versions

### Test Against All Versions

```bash
# Test v1.0 (default)
curl https://api.shuttle.com/api/bookings

# Test v1.1
curl -H "X-API-Version: 1.1" https://api.shuttle.com/api/bookings

# Test v2.0
curl -H "Accept: application/vnd.shuttle.v2.0+json" \
     https://api.shuttle.com/api/bookings
```

### Automated Version Testing

```php
class ApiVersionTest extends TestCase
{
    public function test_all_versions_supported()
    {
        $versions = ['1.0', '1.1', '2.0'];

        foreach ($versions as $version) {
            $response = $this->withHeaders([
                'X-API-Version' => $version
            ])->get('/api/bookings');

            $this->assertEquals(200, $response->status());
        }
    }

    public function test_response_headers_present()
    {
        $response = $this->get('/api/bookings');
        
        $this->assertNotNull($response->header('X-API-Version'));
        $this->assertNotNull($response->header('X-API-Version-Status'));
    }
}
```

---

## Monitoring & Alerts

### Track Version Usage

```sql
SELECT 
  api_version,
  COUNT(*) as requests,
  DATE_FORMAT(created_at, '%Y-%m-%d') as date
FROM api_logs
GROUP BY api_version, DATE_FORMAT(created_at, '%Y-%m-%d')
ORDER BY date DESC
```

### Alert When Old Versions Stop Working

Set up monitoring to alert when:
- Old version error rate exceeds 5%
- Deprecation warning not acknowledged after 30 days
- Sunset date approaching and migration not started

---

## FAQ

**Q: What happens after a version sunsets?**
A: Requests using sunset versions receive HTTP 410 Gone. Clients must migrate to a supported version.

**Q: Can I use multiple versions simultaneously?**
A: No, each request must use a single version. Use the version mechanism to test new versions independently.

**Q: How long will v1.0 be supported?**
A: v1.0 (current version) has indefinite support. We won't deprecate it without 6+ months notice.

**Q: What if my client doesn't support header modification?**
A: Use the query parameter method: `?api_version=1.0`

**Q: Can I request custom version support?**
A: Contact API support at api-support@shuttle.com for enterprise arrangements.

---

## Implementation Details

### Middleware Location
```
Laravel/app/Http/ApiVersionMiddleware.php
```

### Routes Registration
```php
Route::middleware(['api', 'api_version'])
    ->prefix('api')
    ->group(function () {
        // All API routes automatically versioned
    });
```

### Configuration
```php
// config/api.php
return [
    'default_version' => '1.0',
    'supported_versions' => ['1.0', '1.1', '2.0'],
    'deprecated_versions' => ['1.1', '2.0'],
    'sunset_date' => '2026-12-31',
];
```

---

## Summary

✅ **API versioning implemented**  
✅ **Zero breaking changes supported**  
✅ **Backwards compatibility middleware**  
✅ **Clear migration paths**  
✅ **Comprehensive documentation**  

**Status**: Ready for production deployment
