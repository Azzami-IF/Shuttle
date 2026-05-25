# 🚀 QUICK START GUIDE - SHUTTLE SERVERS

## 📌 START SERVERS (Quick Commands)

### Terminal 1 - Frontend (Ionic)
```powershell
cd c:\Program1\Projects\Shuttle\IONIC
npm run ng -- serve --open=false
```
✅ **Access at:** http://localhost:55459

### Terminal 2 - Backend (Laravel)
```powershell
cd c:\Program1\Projects\Shuttle\Laravel
php artisan serve
```
✅ **Access at:** http://localhost:8000

---

## 🔗 IMPORTANT URLS

| Service | URL | Port |
|---------|-----|------|
| Frontend App | http://localhost:55459 | 55459 |
| Backend API | http://localhost:8000 | 8000 |
| Laravel Home | http://localhost:8000 | 8000 |
| API Docs | Routes in `/Laravel/routes/api.php` | 8000 |

---

## 📱 APP NAVIGATION

| Page | Route | Purpose |
|------|-------|---------|
| Onboarding | `/#/onboarding` | Welcome screen |
| Login | `/#/login` | User/Driver login |
| Register | `/#/register` | New account registration |
| Dashboard | `/#/dashboard` | User dashboard |
| Driver Dashboard | `/#/driver-dashboard` | Driver interface |
| Admin Login | N/A | Via API endpoint |

---

## 🔐 API QUICK REFERENCE

### Public Endpoints (No Auth)
```bash
POST /api/register          # Register new user
POST /api/login            # User login
POST /api/admin/login      # Admin login
```

### Protected Endpoints (Requires Token)
```bash
GET    /api/schedules       # List schedules
GET    /api/bookings        # List bookings
POST   /api/bookings        # Create booking
GET    /api/trips           # List trips
POST   /api/trips/{id}/start # Start trip
```

### Admin Endpoints
```bash
GET    /api/admin/users                # List users
GET    /api/admin/drivers             # List drivers
GET    /api/admin/bookings            # List bookings
GET    /api/admin/dashboard/stats     # Dashboard stats
```

---

## ⚙️ TROUBLESHOOTING

### "Scripts disabled" Error
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
```

### "Port already in use" Error
- System will ask for alternate port (click Y)
- Or kill process: `netstat -ano | findstr :4200`

### Dependencies Missing
```powershell
cd c:\Program1\Projects\Shuttle\IONIC
npm install --legacy-peer-deps
```

### API 401 Unauthorized
✅ This is **normal** - API requires authentication token

### External Images Not Loading
✅ **CSP Policy Issue** - Non-critical, app still works

---

## 📊 STATUS CHECK

✅ **Both servers running?**
- Frontend: http://localhost:55459 → Should load
- Backend: http://localhost:8000 → Should load

✅ **API responding?**
- Try login at http://localhost:55459/#/login

✅ **Forms working?**
- Fill in email/password and click "Masuk"

---

## 📝 TEST CREDENTIALS

None currently in system. To create test user:

1. Go to http://localhost:55459/#/register
2. Fill in form:
   - Name: Your Name
   - Email: test@example.com
   - Phone: 08123456789
   - Password: password123
3. Click "Daftar" (Register)
4. Then login with those credentials

---

## 📁 PROJECT STRUCTURE

```
c:\Program1\Projects\Shuttle\
├── IONIC/              # Frontend (Angular/Ionic)
│   ├── src/           # Source code
│   ├── node_modules/  # Dependencies
│   └── package.json   # Scripts
│
├── Laravel/           # Backend (PHP/Laravel)
│   ├── app/          # Application code
│   ├── routes/       # API routes
│   ├── .env          # Configuration
│   └── composer.json # Dependencies
│
└── docs/             # Documentation
```

---

## 💾 DATABASE

Configured in: `Laravel/.env`

Default setup uses SQLite or PostgreSQL (depends on .env config)

To check: `cat c:\Program1\Projects\Shuttle\Laravel\.env | findstr DB_`

---

## 🆘 EMERGENCY STOP

**Kill Frontend:**
```powershell
# Ctrl+C in Terminal 1
```

**Kill Backend:**
```powershell
# Ctrl+C in Terminal 2
```

**Kill by Port (if needed):**
```powershell
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

---

## 📞 QUICK HELP

- **Frontend won't load?** → Check port 55459 is accessible
- **API returning 401?** → That's correct, it requires auth
- **Errors in console?** → Check browser DevTools (F12)
- **Backend down?** → Check Terminal 2 for error messages
- **Can't start servers?** → Run execution policy command first

---

## ✅ VERIFICATION CHECKLIST

Before starting work:
- [ ] Terminal 1: Frontend server running
- [ ] Terminal 2: Backend server running
- [ ] Can access http://localhost:55459
- [ ] Can access http://localhost:8000
- [ ] No errors in browser console (F12)
- [ ] No errors in terminal windows

---

**Last Updated:** May 23, 2026  
**Version:** 1.0  
**Status:** ✅ OPERATIONAL
