## 1. Sistem Penjadwalan Otomatis (Recurring Schedules)
* **Kebutuhan:** Admin harus bisa membuat jadwal shuttle dengan konsep pengulangan (misal: Setiap Jam, Setiap Hari, atau Hari Tertentu dalam Seminggu) untuk rute asal-tujuan yang sama secara otomatis, bukan manual satu per satu.
* **Tugas AI:** 
  * Buat skema migrasi database tambahan di Laravel untuk menyimpan rule pengulangan (`recurrence_pattern`, `start_date`, `end_date`, `start_time`).
  * Buat Logic Service di Laravel atau Task Scheduling (`app/Console/Kernel.php`) untuk me-generate jadwal harian secara otomatis berdasarkan rule tersebut.

## 2. Pengkategorian, Filter, dan Searchbar (List Shuttle)
* **Kebutuhan:** Pengguna di aplikasi mobile membutuhkan kemudahan mencari jadwal shuttle yang dinamis.
* **Tugas AI:**
  * Buat komponen Searchbar dan Filter (berdasarkan Waktu Keberangkatan, Rentang Harga, dan Ketersediaan Kursi) di halaman List Jadwal Ionic (Angular).
  * Buat API Endpoint di Laravel yang mendukung query parameter untuk pencarian dan filter tersebut (menggunakan Eloquent Scope atau Query Builder).

## 3. Perubahan & Optimalisasi Metode Pembayaran
* **Kebutuhan:** Mengubah alur pembayaran QRIS yang sudah ada agar lebih robust, aman, dan menyertakan sistem callback/webhook (simulasi) jika pembayaran sukses sebelum timer 15 menit habis.
* **Tugas AI:**
  * Buat state management di Ionic untuk menangani countdown timer 15 menit agar tidak reset ketika aplikasi ditarik ke background atau halaman di-refresh.
  * Buat endpoint update status pembayaran di Laravel beserta logic untuk mengubah status kursi dari "booked" menjadi "paid" atau otomatis "canceled" jika waktu habis.

  ## 4. Sistem Pengaturan (Settings) & Mode Gelap/Terang (Light/Dark Mode)
* **Kebutuhan:** Aplikasi mobile kekurangan menu pengaturan dan opsi tema (Dark Mode) yang tetap mempertahankan estetika "Serene Transit".
* **Tugas AI:**
  * Rancang halaman Pengaturan di Ionic (Edit Profil, Ubah Password, Hubungi Kami).
  * Implementasikan fitur toggle Light/Dark Mode memanfaatkan variabel CSS Ionic (`theme/variables.scss`) dengan palet warna "Serene Transit" (Forest Green & Sage versi gelap). Pastikan preferensi tersimpan di local storage.

  ## 5. Sistem Notifikasi (Push & In-App Notification)
* **Kebutuhan:** Pengguna memerlukan notifikasi saat tiket berhasil dipesan, pengingat 1 jam sebelum keberangkatan, dan jika ada perubahan jadwal dari admin.
* **Tugas AI:**
  * Rancang arsitektur notifikasi (menggunakan database notification di Laravel untuk In-App, dan rekomendasikan plugin Ionic/Capacitor yang cocok untuk Push Notification seperti Firebase Cloud Messaging).
  * Berikan contoh implementasi pengiriman notifikasi dari sisi backend ke mobile.

## 6. Optimalisasi Ionic Lifecycle & Responsive UI/UX Mobile
* **Kebutuhan:** Aplikasi masih terasa kaku, transisi halaman kurang mulus, data tidak ter-refresh otomatis saat berpindah halaman, dan beberapa layout pecah di layar kecil.
* **Tugas AI:**
  * Berikan panduan implementasi Ionic Lifecycle (`ionViewWillEnter`, `ionViewWillLeave`) di Angular untuk memastikan pembaruan data real-time (seperti status tiket dan lokasi shuttle).
  * Berikan tips CSS/SCSS (Media Queries/Ionic Grid) agar UI Glassmorphism tetap compatible dan responsif di berbagai ukuran layar smartphone Android/iOS.