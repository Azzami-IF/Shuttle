KemanapunGo (Ionic)
-------------------

Ringkasan
--------

Aplikasi pelanggan Ionic untuk Shuttle.

Persyaratan
-----------
- Node 16+
- npm atau pnpm
- Ionic CLI (opsional): `npm install -g @ionic/cli`

Instalasi & Menjalankan (pengembangan)
--------------------------------------
1. Instal dependensi:

   npm install

2. Pastikan API backend berjalan di `http://localhost:8000`

3. Jalankan aplikasi:

   npx ionic serve --port 8101

Konfigurasi lingkungan
----------------------
- File lingkungan: `src/environments/environment.ts` dan `src/environments/environment.prod.ts`
- `environment.apiUrl` harus menunjuk ke `http://localhost:8000/api` pada pengaturan lokal.

Catatan CSP
-----------
Jika Anda mengalami masalah koneksi, periksa `src/index.html` untuk pengaturan `Content-Security-Policy` (connect-src) dan pastikan `http://localhost:8000` diizinkan.

Build Produksi
--------------
   npm run build
   npx cap sync

Demo Kredensial
---------------
- Customer demo: `customer@example.com` / `password`

Useful npm scripts
------------------
- `npm start`    : starts Ionic dev server (alias to `ionic serve`)
- `npm run build`: production build

Continuous Integration
----------------------
Tidak ada CI workflow terdeteksi; tambahkan GitHub Actions jika Anda ingin build/test otomatis.
