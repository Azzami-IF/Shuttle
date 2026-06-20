# Shuttle System — Ringkasan dan Panduan

Dokumen ini menjelaskan struktur proyek, persyaratan lingkungan, dan langkah-langkah dasar untuk menyiapkan lingkungan pengembangan lokal. Proyek terdiri dari dua komponen utama: antarmuka pengguna berbasis Ionic (aplikasi mobile dan dashboard) dan layanan backend berbasis Laravel (API dan administrasi).

## Struktur Singkat Proyek
- `IONIC/` — Sumber kode aplikasi berbasis Ionic (terdiri dari beberapa aplikasi klien seperti DriverpunGo dan KemanapunGo).
- `Laravel/` — Sumber kode backend (API, administrasi, dan logika bisnis).

## Persyaratan Sistem
- PHP 8.2 atau lebih baru
- Composer
- Node.js dan npm (direkomendasikan versi LTS)
- Ionic CLI (`npm install -g @ionic/cli`) untuk menjalankan aplikasi Ionic

## Konfigurasi Lingkungan
- Semua aplikasi Ionic pada proyek ini dikonfigurasi untuk mengakses API pada alamat localhost. Pastikan layanan backend Laravel berjalan pada `http://localhost:8000` atau sesuaikan `src/environments/environment.ts` pada masing-masing aplikasi Ionic.

## Langkah Instalasi Singkat

### Backend (Laravel)
1. Buka terminal, masuk ke direktori backend:

```bash
cd Laravel
```

2. Instal dependensi PHP:

```bash
composer install
```

3. Siapkan berkas lingkungan dan kunci aplikasi:

```bash
copy .env.example .env    # Windows
php artisan key:generate
```

4. Jalankan migrasi (opsional untuk development):

```bash
php artisan migrate --seed
```

5. Jalankan server pengembangan:

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

Catatan: Panel administrasi dapat diakses melalui path `/admin` (mis. http://localhost:8000/admin) setelah server berjalan dan akun admin dibuat.

### Aplikasi Ionic (DriverpunGo & KemanapunGo)
1. Masuk ke masing-masing direktori aplikasi:

```bash
cd IONIC/DriverpunGo
# atau
cd IONIC/KemanapunGo
```

2. Instal dependensi Node:

```bash
npm install
```

3. Jalankan aplikasi untuk pengembangan:

```bash
ionic serve
```

Catatan: File `src/environments/environment.ts` dan `src/environments/environment.prod.ts` telah dikonfigurasi untuk menunjuk ke `http://localhost:8000/api`.

## Pemulihan Dependensi
- Untuk mengembalikan dependensi production/dev, jalankan `composer install` pada direktori `Laravel` dan `npm install` pada setiap aplikasi di `IONIC/`.

## Catatan Keamanan dan Operasional
- Jangan simpan credential sensitif di repositori. Gunakan file `.env` lokal dan kebijakan penyimpanan aman.
- Untuk produksi, pastikan API berjalan menggunakan HTTPS dan atur variabel lingkungan `apiUrl` pada file produksi sesuai domain yang terverifikasi.

## Kontak dan Dukungan
- Untuk pertanyaan teknis atau masalah pengembangan, gunakan saluran komunikasi proyek (issue tracker atau dokumentasi internal).

---

## Kredensial Demo

Untuk memudahkan pengujian, database development dapat diisi dengan akun demo melalui seeder bawaan. Akun yang tersedia setelah menjalankan `php artisan db:seed` atau `php artisan migrate --seed` adalah:

- **Admin**: `admin@shuttle.com` / `password`
- **Customer (contoh)**: `alice@gmail.com` / `password`
- **Driver (contoh)**: `driver1@shuttle.com` / `password`

Catatan:
- Seeder juga akan membuat beberapa akun customer dan driver tambahan (`bob@gmail.com`, `driver2@shuttle.com`, dll.) untuk kebutuhan pengujian.
- Jika Anda menggunakan database baru, jalankan:

```bash
cd Laravel
php artisan migrate --seed
```

atau jika database sudah ada tetapi ingin menambahkan akun demo saja:

```bash
cd Laravel
php artisan db:seed
```

Setelah seeder dijalankan, gunakan kredensial di atas untuk login pada aplikasi Ionic (DriverpunGo / KemanapunGo) atau antarmuka admin.
