# Redis Caching Implementation - Deployment Checklist

## Pre-Deployment Verification

### Code Changes Verification
- [x] CacheManager service created at: `Laravel/app/Services/CacheManager.php`
- [x] AdminApiController updated with cache methods:
  - [x] Import CacheManager
  - [x] Modified dashboardStats() to use caching
  - [x] Modified listSchedules() to use caching
  - [x] Added cache invalidation to createSchedule()
  - [x] Added cache invalidation to deleteSchedule()
- [x] BookingController updated with cache invalidation:
  - [x] Modified store() to invalidate cache
  - [x] Modified cancel() to invalidate cache
- [x] .env updated:
  - [x] CACHE_STORE=redis

### Documentation
- [x] REDIS_SETUP_GUIDE.md - Complete setup guide
- [x] REDIS_IMPLEMENTATION_SUMMARY.md - Implementation details
- [x] REDIS_QUICK_REFERENCE.md - Quick reference
- [x] Setup script: setup-cache-manager.php

## Environment Setup

### Development Environment

#### Step 1: Install Redis
```bash
# Windows (Docker - Recommended)
docker run -d -p 6379:6379 --name shuttle-redis redis:7-alpine

# OR Windows (Direct)
winget install Redis.Redis

# Linux (Ubuntu/Debian)
sudo apt-get install redis-server
sudo systemctl start redis-server

# Mac (Homebrew)
brew install redis
brew services start redis
```

#### Step 2: Verify Redis Installation
```bash
redis-cli ping
# Expected: PONG

# Check version
redis-cli --version
```

#### Step 3: Install PHP Redis Extension
```bash
# Ubuntu/Debian
sudo apt-get install php8.3-redis

# Mac
pecl install redis
# Add to php.ini: extension=redis.so

# Windows
# Should be included with PHP installation
# Check: php -m | grep redis
```

#### Step 4: Organize Files
```bash
cd Laravel
php setup-cache-manager.php
# This will create app/Services directory and move CacheManager.php
```

#### Step 5: Clear Laravel Cache
```bash
php artisan cache:clear
```

#### Step 6: Test Installation
```bash
# Test cache connection
php artisan tinker
>>> Cache::put('test', 'value', 300)
>>> Cache::get('test')
=> "value"
>>> exit

# Or test specific CacheManager
>>> use App\Services\CacheManager
>>> $schedules = CacheManager::getSchedules()
>>> exit
```

## Staging Environment

### Infrastructure Checklist

#### Redis Server
- [ ] Redis 7.x or higher installed
- [ ] Redis running as service/daemon
- [ ] Redis persistence enabled (RDB or AOF)
- [ ] Redis configured with appropriate maxmemory
- [ ] Redis password set (if needed)
- [ ] Redis bound to appropriate network interface
- [ ] Firewall rules configured for Redis port

#### PHP Configuration
- [ ] phpredis extension installed
- [ ] phpredis version 5.x or higher
- [ ] Redis connection pooling configured (if using)
- [ ] Connection timeout appropriate (default: 0 unlimited)

#### Application Configuration
- [ ] .env CACHE_STORE=redis
- [ ] REDIS_HOST configured
- [ ] REDIS_PORT configured (default: 6379)
- [ ] REDIS_PASSWORD configured (if applicable)
- [ ] REDIS_CLIENT=phpredis

### Performance Baseline

Before deploying, run performance tests:

```bash
# 1. Start Redis monitoring
redis-cli monitor > redis.log &

# 2. Run load test
# Use Apache JMeter or similar tool to test:
# GET /admin/dashboard/stats (100 requests)
# GET /admin/schedules (100 requests)
# GET /admin/vehicles (100 requests)

# 3. Analyze results
# Record response times, cache hit rates, database queries

# 4. Stop monitoring
# killall redis-cli
```

Expected results:
- First request: 150-250ms (cache miss)
- Subsequent requests: 20-50ms (cache hit)
- Cache hit rate: 80%+

## Production Environment

### Server Setup

#### Redis Configuration
```bash
# Edit /etc/redis/redis.conf

# Set maximum memory
maxmemory 512mb

# Set eviction policy (LRU recommended)
maxmemory-policy allkeys-lru

# Enable persistence
save 900 1
save 300 10
save 60 10000

# Set password
requirepass your_strong_password_here

# Bind to specific interface
bind 127.0.0.1

# Port
port 6379

# Log file
logfile /var/log/redis/redis-server.log

# Database dump file location
dir /var/lib/redis
```

#### Systemd Service Setup
```bash
# Verify Redis service is enabled
sudo systemctl enable redis-server

# Start Redis
sudo systemctl start redis-server

# Check status
sudo systemctl status redis-server
```

#### Monitoring Setup

Add to your monitoring system:
```bash
# Check Redis is accessible
redis-cli -h 127.0.0.1 -p 6379 ping

# Monitor memory usage
redis-cli info memory | grep used_memory_human

# Check connected clients
redis-cli info clients | grep connected_clients
```

### Application Deployment

#### Step 1: Deploy Code
```bash
# Pull latest code
git pull origin main

# Install dependencies (if updated)
composer install

# Run migrations (if needed)
php artisan migrate
```

#### Step 2: Configure Environment
```bash
# Verify .env configuration
cat .env | grep CACHE_STORE
cat .env | grep REDIS_

# Expected output:
# CACHE_STORE=redis
# REDIS_CLIENT=phpredis
# REDIS_HOST=127.0.0.1
# REDIS_PASSWORD=...
# REDIS_PORT=6379
```

#### Step 3: Initialize Cache
```bash
# Clear any old cache
php artisan cache:clear

# Pre-warm cache (optional)
php artisan tinker
>>> use App\Services\CacheManager
>>> CacheManager::getDashboardStats()
>>> CacheManager::getSchedules()
>>> CacheManager::getVehicles()
>>> exit
```

#### Step 4: Verify Functionality
```bash
# Test API endpoints
curl https://api.example.com/admin/dashboard/stats

# Monitor first request (cache miss)
# Expect: 150-250ms response time

# Monitor second request (cache hit)
# Expect: 20-50ms response time
```

#### Step 5: Monitor Performance
```bash
# Set up continuous monitoring
# Track: response times, cache hit rate, database load

# Example monitoring command:
watch -n 1 'redis-cli info stats'
```

## Post-Deployment Verification

### Automated Tests
```bash
# Run test suite
php artisan test

# Run specific cache tests
php artisan test --filter cache

# Run API tests
php artisan test tests/Feature/Admin
```

### Manual Verification

1. **Dashboard Stats Endpoint**
   ```bash
   # Request 1 (cold cache)
   time curl https://api.example.com/admin/dashboard/stats
   
   # Request 2 (warm cache)
   time curl https://api.example.com/admin/dashboard/stats
   
   # Verify Request 2 is much faster
   ```

2. **Cache Key Verification**
   ```bash
   redis-cli keys "*"
   # Should see: dashboard:stats, schedules:all, vehicles:all, drivers:all
   ```

3. **TTL Verification**
   ```bash
   redis-cli ttl schedules:all
   # Should return value between 0-300 seconds
   ```

4. **Cache Invalidation**
   ```bash
   # Create a schedule (should clear cache)
   curl -X POST https://api.example.com/admin/schedules \
     -H "Authorization: Bearer token" \
     -d '{...}'
   
   # Verify cache was cleared
   redis-cli keys "schedules:all"
   # Should return empty or recently updated
   ```

## Monitoring and Alerts

### Key Metrics to Monitor

1. **Redis Memory Usage**
   - Alert if > 80% of maxmemory
   - Command: `redis-cli info memory`

2. **Cache Hit Rate**
   - Target: > 80%
   - Calculation: hits / (hits + misses) * 100
   - Command: `redis-cli info stats`

3. **Redis Connection Count**
   - Alert if > 100 connections
   - Command: `redis-cli info clients`

4. **Response Time**
   - Track API endpoints with caching
   - Alert if > 100ms on cache hits
   - Use APM tools (New Relic, Datadog, etc.)

### Dashboard Setup (Example using Datadog)

```yaml
# Example Datadog monitor
monitors:
  - name: "Redis Memory Usage"
    type: "metric alert"
    query: "avg:redis.memory.used{*} > 0.8 * max:redis.memory.limit{*}"
    
  - name: "Redis Cache Hit Rate"
    type: "metric alert"
    query: "avg:redis.keyspace.hits{*} / (avg:redis.keyspace.hits{*} + avg:redis.keyspace.misses{*}) < 0.8"
    
  - name: "API Response Time (Dashboard)"
    type: "metric alert"
    query: "avg:trace.web.request.duration{service:shuttle,resource_name:/admin/dashboard/stats} > 0.1"
```

## Rollback Plan

If issues occur with Redis caching:

### Quick Disable
```bash
# Edit .env
CACHE_STORE=database

# Or use artisan command
php artisan config:cache

# Clear cache
php artisan cache:clear
```

### Data Consistency Check
```bash
# Verify database data integrity
php artisan tinker
>>> DB::table('schedules')->count()
>>> DB::table('vehicles')->count()
>>> DB::table('bookings')->count()
```

### Full Rollback
```bash
# If complete rollback needed
git revert <commit-hash>
git push
php artisan migrate:rollback  # if needed
```

## Support and Documentation

- **Setup Guide**: See `REDIS_SETUP_GUIDE.md`
- **Implementation Details**: See `REDIS_IMPLEMENTATION_SUMMARY.md`
- **Quick Reference**: See `REDIS_QUICK_REFERENCE.md`
- **Laravel Docs**: https://laravel.com/docs/cache
- **Redis Docs**: https://redis.io/documentation

## Checklist Summary

### Before Go-Live
- [ ] Redis installed and running
- [ ] PHP redis extension installed
- [ ] Code changes deployed
- [ ] Environment configured
- [ ] Cache initialized
- [ ] Tests passed
- [ ] Performance verified
- [ ] Monitoring configured
- [ ] Team trained

### After Go-Live
- [ ] Monitor response times
- [ ] Monitor cache hit rate
- [ ] Monitor Redis memory
- [ ] Monitor error logs
- [ ] Verify functionality
- [ ] Collect performance metrics
- [ ] Document lessons learned

---

**Ready to Deploy**: ✅ YES
**Risk Level**: LOW (with proper testing)
**Rollback Time**: < 5 minutes
