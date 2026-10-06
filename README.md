# Dasbor Manajemen Terapi Pelangi Lazuardi

![Pelangi Lazuardi Logo](https://storage.googleapis.com/aai-web-samples/pelangi-lazuardi-logo-shield.png)

**Admin & Siswa Terapi Pelangi Lazuardi** adalah dasbor absensi digital komprehensif untuk kegiatan terapi tumbuh kembang anak di Pelangi Lazuardi. Aplikasi ini dirancang untuk mempermudah administrasi, pemantauan, dan pelaporan bagi admin, terapis, dan orang tua siswa.

Meliputi manajemen jadwal, pelacakan kehadiran real-time, pembuatan laporan asesmen detail, manajemen keuangan, dan penagihan otomatis untuk sesi Terapi Okupasi, Terapi Wicara, Fisioterapi, dan Remedial.

---

## ✨ Fitur Utama

- **Dasbor Intuitif:** Statistik kehadiran, tinjauan mingguan, dan akses cepat ke fungsi utama.
- **Sistem Login Berbasis Peran:** Tampilan dan fitur yang disesuaikan untuk **Admin**, **Terapis**, dan **Siswa** (Orang Tua).
- **Manajemen Data Komprehensif:** Kelola data anak, terapis, dan jenis terapi dengan mudah. CRUD penuh untuk semua entitas data.
- **Penjadwalan Fleksibel:** Atur jadwal sesi rutin dan harian untuk setiap anak dengan terapis yang ditugaskan.
- **Pelacakan Kehadiran Real-time:** Update status kehadiran (Hadir, Absen, Menunggu) dengan sekali klik pada dasbor utama.
- **Laporan Asesmen Detail:** Formulir digital canggih untuk membuat laporan Terapi Okupasi dan Terapi Wicara, dengan fitur pratinjau dan cetak ke PDF yang profesional.
- **Manajemen Keuangan & Penagihan:**
  - Laporan pemasukan & pengeluaran tahunan dengan visualisasi grafik.
  - Pembuatan faktur bulanan otomatis per siswa berdasarkan sesi yang dihadiri.
  - Cetak laporan ringkasan tagihan untuk seluruh siswa.
- **Kustomisasi Tampilan:** Pengaturan untuk mengganti tema warna, logo aplikasi, dan gradasi latar belakang sesuai preferensi.
- **Upload Data Massal:** Impor data siswa baru dengan mudah menggunakan template file CSV.

---

## 👩‍💻 Peran Pengguna & Hak Akses

Aplikasi ini memiliki tiga peran pengguna utama:

1.  **Admin:**
    - Akses penuh ke semua fitur.
    - Mengelola data master (anak, terapis, jenis terapi).
    - Mengelola akun dan kredensial login untuk semua pengguna.
    - Mengakses semua laporan keuangan dan penagihan.
    - Mengonfigurasi pengaturan sistem (tema, logo, jam operasional).

2.  **Terapis:**
    - Melihat dasbor dengan data siswa yang relevan.
    - Mengakses jadwal siswa yang ditanganinya.
    - Mengisi dan mengelola laporan asesmen perkembangan siswa.
    - Melihat rekap kehadiran siswa yang terkait.

3.  **Siswa (Orang Tua):**
    - Melihat dasbor personal anak.
    - Mengecek jadwal terapi anak.
    - Melihat riwayat kehadiran dan laporan asesmen yang telah selesai.
    - Mengakses dan mengunduh tagihan bulanan.

---

## 🚀 Panduan Instalasi & Menjalankan Proyek

Untuk menjalankan proyek ini di lingkungan pengembangan lokal, ikuti langkah-langkah berikut.

### Prasyarat

-   Node.js (versi 18.x atau lebih tinggi)
-   npm atau yarn

### Instalasi

1.  **Clone repositori (atau unduh file proyek):**
    ```bash
    git clone https://example.com/pelangi-lazuardi-dashboard.git
    cd pelangi-lazuardi-dashboard
    ```

2.  **Instal dependensi:**
    Gunakan `npm` atau `yarn` untuk menginstal semua paket yang dibutuhkan.
    ```bash
    npm install
    # atau
    yarn install
    ```

3.  **Konfigurasi Variabel Lingkungan:**
    Aplikasi ini mungkin memerlukan variabel lingkungan, seperti `API_KEY` untuk layanan eksternal. Pastikan file `.env` sudah dikonfigurasi dengan benar di root proyek.
    ```
    # .env.example
    API_KEY="YOUR_GEMINI_API_KEY_HERE"
    ```

4.  **Jalankan Server Pengembangan:**
    Perintah ini akan memulai server pengembangan lokal (biasanya di `http://localhost:5173`).
    ```bash
    npm run dev
    # atau
    yarn dev
    ```

5.  **Buka di Browser:**
    Buka browser Anda dan navigasikan ke `http://localhost:5173` (atau port yang ditampilkan di terminal).

---

## 🛠️ Teknologi yang Digunakan

-   **Frontend:** React.js, TypeScript
-   **Styling:** TailwindCSS
-   **Grafik & Visualisasi Data:** Recharts
-   **Struktur Proyek:** Dikonfigurasi untuk dijalankan dengan Vite

---

## 📁 Struktur File

Struktur file utama proyek diatur sebagai berikut untuk keterbacaan dan skalabilitas:

```
/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── icons/           # Komponen ikon SVG
│   │   ├── AttendanceTable.tsx
│   │   ├── ChildManagementPage.tsx
│   │   ├── DashboardStats.tsx
│   │   ├── LoginPage.tsx
│   │   ├── ReportsPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── ... (komponen lainnya)
│   ├── App.tsx             # Komponen utama aplikasi & state management
│   ├── index.tsx           # Titik masuk aplikasi React
│   └── types.ts            # Definisi tipe TypeScript global
├── .gitignore
├── index.html              # Template HTML utama
├── package.json
├── README.md               # Dokumentasi ini
└── tailwind.config.js      # Konfigurasi TailwindCSS
```
