# Ambatu Bus - Sistem Pemesanan & Pelacakan Shuttle

Ambatu Bus adalah solusi manajemen shuttle komprehensif yang menghadirkan aplikasi mobile *high-fidelity* untuk pelanggan dan pengemudi, dipadukan dengan dashboard administrasi berbasis web yang kokoh. Proyek ini dibangun dengan fokus pada "Serene Transit"—memberikan pengalaman perjalanan yang tenang, andal, dan modern.

## 🌿 Filosofi Desain: Serene Transit
Sistem ini menggunakan estetika yang terinspirasi dari alam (nada "Forest Green" dan "Sage") dengan UI **Glassmorphism** modern. Fokus utamanya adalah pada kejelasan, kemudahan penggunaan, dan stabilitas visual, memastikan pengguna dapat memesan dan melacak perjalanan mereka tanpa stres.

## 🚀 Stack Teknologi

### Backend (API & Admin)
- **Framework:** Laravel 11
- **Database:** SQLite (Pengembangan Lokal)
- **Autentikasi:** Laravel Sanctum (Berbasis Token untuk Mobile, Berbasis Sesi untuk Web)
- **Styling:** Tailwind CSS (Admin Dashboard)
- **Grafik:** Chart.js

### Aplikasi Mobile
- **Framework:** Ionic Framework (Angular)
- **Desain:** SCSS Kustom dengan Variabel CSS (Sistem Desain)
- **Ikon:** Material Symbols & Google Fonts (Hanken Grotesk)
- **Peta:** Leaflet.js dengan OpenStreetMap

## ✨ Fitur Utama

### 📱 Aplikasi Mobile (Pelanggan & Pengemudi)
- **Onboarding:** Pengenalan halus terhadap nilai-utama aplikasi.
- **Smart Booking:** Pemilihan kursi interaktif (peta kursi 2-2) dengan ketersediaan real-time.
- **Pembayaran QRIS:** Alur pembayaran terintegrasi dengan timer hitung mundur 15 menit dan pembuatan kode QR unik.
- **Pelacakan Live:** Pergerakan shuttle secara real-time di peta interaktif menggunakan Leaflet.
- **Dashboard Berbasis Peran:** 
  - **Pelanggan:** Cari jadwal, kelola pemesanan, dan lihat saldo AmbatuPay.
  - **Pengemudi:** Kelola tugas perjalanan, perbarui lokasi GPS, dan mulai/selesaikan perjalanan.

### 💻 Dashboard Admin (Web)
- **Ringkasan Operasional:** Statistik real-time dan grafik tren pemesanan 7 hari terakhir.
- **Manajemen Data Master:** CRUD penuh (Buat, Baca, Perbarui, Hapus) untuk Kendaraan dan Jadwal.
- **Manajemen Pengguna:** Pantau dan kelola akun pengemudi serta pelanggan.
- **Monitoring Langsung:** Lacak semua perjalanan aktif dan aktivitas pemesanan terbaru di satu tempat.

## 🛠️ Instalasi & Setup

### Prasyarat
- PHP 8.2+
- Node.js & NPM
- Composer
- Ionic CLI (`npm install -g @ionic/cli`)

### Setup Backend (Laravel)
1. Masuk ke direktori `Laravel`:
   ```bash
   cd Laravel
   ```
2. Instal dependensi:
   ```bash
   composer install
   ```
3. Setup lingkungan:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
4. Jalankan migrasi dan seeder:
   ```bash
   php artisan migrate:fresh --seed
   ```
5. Jalankan server:
   ```bash
   php artisan serve
   ```

### Setup Mobile (Ionic)
1. Masuk ke direktori `IONIC`:
   ```bash
   cd IONIC
   ```
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Jalankan aplikasi:
   ```bash
   ionic serve
   ```

## 🔐 Kredensial (Demo)
Gunakan akun berikut untuk menjelajahi sistem (Kata sandi: `password`):
- **Admin:** `admin@shuttle.com`
- **Customer:** `alice@gmail.com`
- **Driver:** `driver1@shuttle.com`

---
Dibuat dengan ❤️ untuk pengalaman transit yang lebih baik.
