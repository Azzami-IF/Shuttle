# QA Runbook - Ambatu Bus

Dokumen ini berisi langkah validasi minimum agar build dinilai layak untuk dev/UAT internal.

## Prasyarat

- Backend aktif di `http://localhost:8000`
- Frontend aktif di `http://localhost:4200`
- Data seed tersedia (`php artisan migrate:fresh --seed`)

## Akun Uji

Semua akun menggunakan password `password`.

- Admin: `admin@shuttle.com`
- Driver: `driver1@shuttle.com`
- Customer: `alice@gmail.com`

## Checklist Smoke Test

### Customer

- Login customer berhasil.
- Cari jadwal berfungsi.
- Booking kursi berhasil.
- Konfirmasi pembayaran berhasil.
- Riwayat booking tampil.

### Driver

- Login driver via portal driver berhasil.
- Dashboard driver tampil.
- Halaman trips/monitoring menampilkan perjalanan.

### Admin

- Login admin mengarah ke dashboard admin.
- Statistik dashboard termuat.
- Data drivers/schedules dapat dimuat.

## Endpoint Kritis yang Harus Hijau

- `POST /api/login`
- `GET /api/search/schedules`
- `GET /api/schedules/{id}`
- `POST /api/bookings`
- `POST /api/bookings/{id}/confirm-payment`
- `GET /api/bookings`
- `GET /api/trips`
- `GET /api/admin/dashboard/stats`
- `GET /api/admin/drivers`
- `GET /api/admin/schedules`

## Skrip E2E Lokal

Jalankan dari root proyek:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\e2e_booking_flow.ps1
```

Ekspektasi:

- Login sukses
- Schedule ditemukan
- Booking dibuat
- Payment terkonfirmasi
- Booking list memuat data terbaru

## Kriteria Lulus Dev/UAT Internal

- Semua smoke test role-based lulus.
- Skrip e2e booking lulus.
- Tidak ada blocker error di alur booking-payment.

Catatan: dokumen ini tidak menggantikan hardening produksi (security audit, load test, observability penuh).
