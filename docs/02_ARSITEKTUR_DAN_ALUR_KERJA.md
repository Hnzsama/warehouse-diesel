# 02. Arsitektur dan Alur Kerja Sistem

> **Sistem Informasi Manajemen Stok Barang — Gudang Diesel Truk Medan**

---

## 1. Matriks Akses Pengguna (User Access Matrix)

Sistem menggunakan kontrol akses berbasis peran (*Role-Based Access Control / RBAC*) dengan 2 aktor utama:

| Modul / Fitur | Aktor: Admin Gudang | Aktor: Pemilik (Owner) | Keterangan |
| :--- | :---: | :---: | :--- |
| **Login & Auth** | ✅ Akses | ✅ Akses | Keamanan autentikasi berbasis sesi |
| **Dashboard Monitoring** | ✅ Akses Full | ✅ Akses Overview | Ringkasan stok, alert stok minimum |
| **Master Data Barang** | ✅ CRUD | ❌ Tidak Ada | Olah data sparepart, kategori, & satuan |
| **Transaksi Barang Masuk** | ✅ Input / Edit | ❌ Tidak Ada | Penambahan stok barang dari supplier |
| **Transaksi Barang Keluar** | ✅ Input / Edit | ❌ Tidak Ada | Pengurangan stok barang untuk pemakaian |
| **Laporan Persediaan** | ✅ Lihat & Cetak | ✅ Lihat & Cetak | Rekap barang masuk/keluar & status stok |
| **Kelola Pengguna** | ✅ (Super Admin) | ❌ Read Only | Pengelolaan akun pengguna sistem |

---

## 2. Diagram Interaksi Aktor (Use Case System)

```
                       +-----------------------------------+
                       | SISTEM INFORMASI STOK BARANG DIESEL|
                       +-----------------------------------+
                                         |
   +--------------------+                |                +--------------------+
   |       ADMIN        |                |                |      PEMILIK       |
   +--------------------+                |                +--------------------+
   | - Login / Logout   |--------------->|<---------------| - Login / Logout   |
   | - Kelola Barang    |--------------->|                |                    |
   | - Barang Masuk     |--------------->|                |                    |
   | - Barang Keluar    |--------------->|                |                    |
   | - Monitoring Stok  |--------------->|<---------------| - Monitoring Stok  |
   | - Cetak Laporan    |--------------->|<---------------| - Cetak Laporan    |
   +--------------------+                |                +--------------------+
```

---

## 3. Spesifikasi Modul Fungsional

### Modul 1: Autentikasi Pengguna
* **Tujuan:** Mengamankan sistem dan membatasi hak akses pengguna.
* **Fitur:**
  * Halaman Login dengan Email/Username dan Password.
  * Proteksi route berbasis middleware `role:admin` dan `role:pemilik`.
  * Fitur Logout dan manajemen sesi pengguna.

### Modul 2: Master Data Sparepart (Barang)
* **Tujuan:** Mengelola data master suku cadang diesel truk.
* **Elemen Data:** Kode Barang, Nama Sparepart, Kategori, Satuan, Stok Awal, Stok Minimum, Keterangan.
* **Fitur Utama:**
  * Form Tambah, Edit, dan Hapus Data Barang.
  * Live Search & Filter berdasarkan Kategori dan Satuan.
  * Peringatan jika Kode Barang ganda.

### Modul 3: Transaksi Barang Masuk
* **Tujuan:** Mencatat setiap penerimaan stok barang dari pemasok/pembelian gudang.
* **Elemen Data:** Nomor Referensi/Nota Masuk, Tanggal Masuk, Pilihan Barang, Jumlah Masuk, Pemasok/Catatan, Operator (Admin).
* **Efek Sistem:** Secara otomatis menambah `stok` pada tabel master barang.

### Modul 4: Transaksi Barang Keluar
* **Tujuan:** Mencatat pengeluaran sparepart dari gudang untuk keperluan armada/pelanggan.
* **Elemen Data:** Nomor Referensi/Nota Keluar, Tanggal Keluar, Pilihan Barang, Jumlah Keluar, Tujuan/Unit Truk, Catatan, Operator (Admin).
* **Efek Sistem:** Secara otomatis mengurangi `stok` pada tabel master barang.
* **Validasi:** Sistem mencegah input jika `jumlah_keluar > sisa_stok`.

### Modul 5: Monitoring Stok & Dashboard Real-time
* **Tujuan:** Menyajikan visualisasi kondisi persediaan gudang secara instant.
* **Metrik Utama:**
  * Total Jenis Sparepart.
  * Total Item Barang Masuk (Bulan Ini).
  * Total Item Barang Keluar (Bulan Ini).
  * Jumlah Barang Kritis (Stok $\le$ Stok Minimum).
* **Fitur Visual:** Tabel barang dengan highlight badge warna (Kritis = Merah, Aman = Hijau).

### Modul 6: Laporan Persediaan & Export PDF
* **Tujuan:** Memfasilitasi rekapitulasi data persediaan untuk pertanggungjawaban dan pengawasan.
* **Jenis Laporan:**
  1. Laporan Stok Barang (Status Akhir).
  2. Laporan Barang Masuk (Periode Tanggal Awal - Tanggal Akhir).
  3. Laporan Barang Keluar (Periode Tanggal Awal - Tanggal Akhir).
* **Format Output:** Preview Cetak Web & Export File PDF.

---

## 4. Flowchart Alur Transaksi Utama

### 4.1 Alur Transaksi Barang Masuk
```
[Start] ──> [Input Nota & Tanggal] ──> [Pilih Sparepart] ──> [Input Jumlah Masuk]
                                                                    │
[Tampilkan Pesan Sukses] <── [Update Stok (Stok = Stok + Jumlah)] <──┘
```

### 4.2 Alur Transaksi Barang Keluar
```
[Start] ──> [Pilih Sparepart] ──> [Input Jumlah Keluar]
                                         │
                                 [Cek Stok Awal]
                                         │
                        ┌────────────────┴────────────────┐
                        ▼                                 ▼
             (Jumlah > Stok Available?)         (Jumlah <= Stok Available?)
                        │                                 │
                 [YA: Tolak & Alert]             [TIDAK: Potong Stok]
                                                          │
                                                [Simpan Transaksi]
                                                          │
                                                [Tampilkan Sukses]
```
