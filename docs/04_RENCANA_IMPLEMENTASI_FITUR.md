# 04. Rencana Implementasi Sistem & Roadmap Pengerjaan

> **Sistem Informasi Manajemen Stok Barang — Gudang Diesel Truk Medan**  
> **Metode Pengembangan:** Prototype Iterative  

---

## 1. Roadmap Tahapan Pengerjaan Metode Prototype

Sesuai metodologi pada proposal skripsi (Nugroho, 2021; Pressman & Maxim, 2022), pengembangan sistem dilaksanakan dalam 5 tahapan utama:

```
[1. Pengumpulan Kebutuhan] ──> [2. Perancangan Prototype (Quick Design)]
                                              │
                                              ▼
[4. Pengembangan (Coding)] <── [3. Evaluasi Prototype (UAT & Revision)]
            │
            ▼
[5. Pengujian & Implementasi Final]
```

### Tahap 1: Pengumpulan Kebutuhan (Completed Analysis)
* Mengidentifikasi struktur data master barang, alur transaksi barang masuk/keluar, dan format laporan persediaan (Dokumen `01_ANALISIS_KEBUTUHAN_SISTEM.md`).

### Tahap 2: Perancangan Fast Prototype & Antarmuka
* Membuat struktur database (Dokumen `03_DESAIN_DATABASE_DAN_DATA_DUMMY.md`).
* Menyusun skema navigasi UI/UX dashboard & form transaksi.

### Tahap 3: Konstruksi Prototype Sistem (Sprint Pengerjaan)
* Pengkodean backend Laravel & frontend (Inertia React / UI Components).

### Tahap 4: Evaluasi & Revisi Bersama User/Klien
* Menampilkan prototipe ke Admin & Pemilik Gudang untuk mendapatkan umpan balik langsung (apabila ada penyesuaian alur bon keluar atau kolom laporan).

### Tahap 5: Pengujian (Testing) & Deployment
* Menjalankan Automated Feature Test (Pest PHP).
* Deploy ke lingkungan pengujian (lokal / web server staging).

---

## 2. Rincian Sprint & Modul Implementasi

### Sprint 1: Setup Foundation & Autentikasi Pengguna
* [x] Inisialisasi struktur database & skema tabel (`users`, `categories`, `units`, `items`, `incoming_items`, `outgoing_items`).
* [ ] Implementasi Autentikasi (Login, Session, Middleware Role Security).
* [ ] Seeder User (Akun Admin & Akun Pemilik).

### Sprint 2: Modul Master Data Barang (Sparepart)
* [ ] Controller & Route Master Barang (`ItemController`).
* [ ] Halaman Katalog Barang (Indeks, Pencarian, Filter Kategori).
* [ ] Form Tambah & Edit Sparepart (Validasi Kode Unik, Stok Minimum).
* [ ] Database Seeder 20 Data Sparepart Diesel Truk.

### Sprint 3: Modul Transaksi Barang Masuk & Barang Keluar
* [ ] Controller Barang Masuk (`IncomingItemController`):
  * Form input kedatangan stok baru.
  * Trigger peningkatan stok barang otomatis (`item.stock += qty`).
* [ ] Controller Barang Keluar (`OutgoingItemController`):
  * Form input pengeluaran suku cadang.
  * Validasi stok cukup (`qty <= item.stock`).
  * Trigger pengurangan stok barang otomatis (`item.stock -= qty`).

### Sprint 4: Dashboard Monitoring Real-time & Modul Laporan
* [ ] Dashboard Monitoring:
  * Metric Card (Total Item, Barang Masuk Bulan Ini, Barang Keluar Bulan Ini, Alert Stok Kritis).
  * Table View Status Stok Real-time.
* [ ] Modul Laporan Persediaan:
  * Filter Laporan Berdasarkan Rentang Tanggal & Jenis Transaksi.
  * Layout Cetak Laporan Web & Export PDF.

### Sprint 5: Verification, Testing & Delivery
* [ ] Pengujian Otomatis Feature Test (Pest):
  * Test Login & Authorization (Admin vs Owner).
  * Test Kalkulasi Stok Otomatis (Barang Masuk & Keluar).
  * Test Validasi Pengeluaran Stok Melebihi Batas.
* [ ] Penyiapan Dokumentasi & Manual User.

---

## 3. Matriks Route & Controller Plan

| HTTP Method | Route URL | Controller Action | Description | Access Role |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/login` | `AuthController@showLogin` | Halaman Login | Public |
| **POST** | `/login` | `AuthController@login` | Proses Login | Public |
| **POST** | `/logout` | `AuthController@logout` | Proses Logout | Authenticated |
| **GET** | `/dashboard` | `DashboardController@index` | Dashboard Real-time Monitoring | Admin, Pemilik |
| **GET** | `/items` | `ItemController@index` | Daftar Master Sparepart | Admin |
| **POST** | `/items` | `ItemController@store` | Simpan Sparepart Baru | Admin |
| **PUT** | `/items/{id}` | `ItemController@update` | Update Sparepart | Admin |
| **DELETE** | `/items/{id}` | `ItemController@destroy` | Hapus Sparepart | Admin |
| **GET** | `/incoming-items` | `IncomingItemController@index` | Riwayat Barang Masuk | Admin |
| **POST** | `/incoming-items` | `IncomingItemController@store` | Catat Transaksi Barang Masuk | Admin |
| **GET** | `/outgoing-items` | `OutgoingItemController@index` | Riwayat Barang Keluar | Admin |
| **POST** | `/outgoing-items` | `OutgoingItemController@store` | Catat Transaksi Barang Keluar | Admin |
| **GET** | `/reports` | `ReportController@index` | Halaman Rekap Laporan | Admin, Pemilik |
| **GET** | `/reports/export-pdf` | `ReportController@exportPdf` | Cetak / Download PDF Laporan | Admin, Pemilik |

---

## 4. Kriteria Keberhasilan Sistem (Acceptance Criteria)

1. **Akurasi Stok 100%:** Selisih antara perhitungan sistem dengan transaksi masuk/keluar bernilai 0.
2. **Pencegahan Negative Stock:** Sistem tidak mengizinkan pengeluaran stok jika jumlah yang diminta melebihi stok yang tersedia.
3. **Respon Real-time:** Dashboard monitoring langsung memperbarui angka stok secara tepat tanpa memerlukan input ulang manual.
4. **Export Laporan Sesuai Kebutuhan:** Laporan persediaan dapat dicetak per periode tanggal dengan informasi lengkap (Stok Awal, Total Masuk, Total Keluar, Stok Akhir).
