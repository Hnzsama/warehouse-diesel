# 01. Analisis Kebutuhan Sistem Informasi Manajemen Stok Barang

> **Studi Kasus:** Gudang Diesel Truk Medan (Sinar Diesel Truck)  
> **Referensi Proposal:** Proposal Skripsi oleh Jojor Maruba Hutabarat (NIM: 22100052) — ITB Indonesia Deli Serdang  
> **Metode Pengembangan:** Prototype  

---

## 1. Identitas Proyek & Latar Belakang

### 1.1 Identitas Proposal
* **Judul Penelitian:** Pengembangan Sistem Informasi Manajemen Stok Barang Menggunakan Metode Prototype pada Gudang Diesel Truk Medan
* **Peneliti:** Jojor Maruba Hutabarat (NIM: 22100052)
* **Program Studi:** Sistem Informasi, Fakultas Sains dan Teknologi, ITB Indonesia
* **Lokasi Objek Penelitian:** Gudang Diesel Truk Medan (Sinar Diesel Truck), JMPR+3F4, Pulo Brayan Bengkel, Kec. Medan Timur, Kota Medan, Sumatera Utara 20221.

### 1.2 Latar Belakang Permasalahan
Gudang Diesel Truk Medan merupakan usaha yang bergerak dalam penyediaan suku cadang (sparepart) dan perlengkapan mesin diesel truk. Pengelolaan stok barang sebelumnya dilakukan secara manual menggunakan buku pencatatan.

Permasalahan utama yang diidentifikasi dari operasional manual meliputi:
1. **Risiko Human Error:** Kesalahan pencatatan jumlah barang masuk dan keluar pada buku besar.
2. **Lambatnya Pembaruan Stok:** Sisa stok barang baru diketahui saat pengecekan fisik (stock opname) manual, sehingga berisiko terjadi *out of stock* (stok habis) atau *overstock* (stok berlebih).
3. **Kesulitan Pencarian Data:** Proses pencarian informasi sparepart memakan waktu lama karena harus mencari lembar buku fisik secara berurutan.
4. **Penyusunan Laporan Terhambat:** Pembuatan laporan persediaan bulanan/periodik membutuhkan waktu lama untuk me-rekap data barang masuk dan keluar.

---

## 2. Rumusan Masalah, Tujuan, dan Manfaat

### 2.1 Rumusan Masalah
1. Bagaimana merancang dan membangun Sistem Informasi Manajemen Stok Barang pada Gudang Diesel Truk Medan?
2. Bagaimana menerapkan metode Prototype dalam pengembangan sistem agar sesuai dengan kebutuhan pengguna gudang?
3. Bagaimana menghasilkan sistem persediaan berbasis web yang mampu menyajikan data barang masuk, barang keluar, monitoring stok, dan laporan secara cepat, tepat, dan akurat?

### 2.2 Tujuan Pengembangan
1. Membangun Sistem Informasi Manajemen Stok Barang berbasis web untuk Gudang Diesel Truk Medan.
2. Mengimplementasikan alur pencatatan otomatis transaksi barang masuk dan keluar yang secara otomatis meng-update stok barang (*real-time update*).
3. Menyediakan dashboard monitoring persediaan serta fitur rekapitulasi laporan persediaan dalam bentuk cetak/PDF.

### 2.3 Manfaat Sistem
* **Bagi Admin Gudang:** Mempermudah pencatatan harian barang masuk/keluar serta mempercepat pencarian data sparepart.
* **Bagi Pemilik Gudang (Owner):** Memudahkan pengawasan stok barang secara *real-time* dan mempercepat pengambilan keputusan pengadaan suku cadang berdasarkan laporan persediaan.

---

## 3. Ruang Lingkup & Batasan Sistem (Scope of Work)

Untuk menjaga fokus pengembangan sistem sesuai dengan dokumen proposal skripsi dan resume analisis, berikut adalah batasan sistem yang ditetapkan:

### 3.1 Fitur yang Termasuk (In-Scope)
1. **Autentikasi & Multi-Role:** Hak akses terbatas untuk **Admin** dan **Pemilik**.
2. **Master Data Barang (Sparepart):** Pengelolaan data suku cadang (kode barang, nama barang, kategori, satuan, stok awal, stok minimum).
3. **Transaksi Barang Masuk:** Pencatatan kedatangan stok baru yang secara otomatis **menambah** jumlah stok barang.
4. **Transaksi Barang Keluar:** Pencatatan pengambilan/pengeluaran stok yang secara otomatis **memotong/mengurangi** sisa stok barang.
5. **Dashboard Monitoring Stok:** Tampilan visual real-time status sisa stok barang (lengkap dengan peringatan stok minimum/hampir habis).
6. **Laporan Persediaan:** Rekapitulasi transaksi barang masuk, barang keluar, dan posisi stok akhir dalam bentuk cetak/PDF.

### 3.2 Fitur yang Tidak Termasuk (Out-of-Scope)
1. **Modul Kasir / POS (Point of Sale):** Sistem tidak mengelola pencatatan pembayaran tunai/nontunai kasir.
2. **Transaksi Penjualan & Pembelian Komprehensif:** Tidak mencakup pembuatan invoice, utang-piutang, maupun integrasi payment gateway.
3. **E-Commerce / Pembelian Pelanggan:** Sistem bersifat **internal gudang** saja.

---

## 4. Aturan Bisnis Sistem (Business Rules)

1. **Kode Barang Unik:** Setiap suku cadang wajib memiliki kode barang yang unik (misal: `SPR-001`, `FLT-002`).
2. **Kalkulasi Stok Otomatis:**
   $$\text{Stok Akhir} = \text{Stok Awal} + \sum \text{Barang Masuk} - \sum \text{Barang Keluar}$$
3. **Validasi Pengeluaran Stok:** Barang keluar tidak boleh melebihi sisa stok yang tersedia di gudang ($\text{Jumlah Keluar} \le \text{Sisa Stok}$). Jika melebihi, sistem wajib menolak transaksi.
4. **Indikator Stok Minimum:** Jika sisa stok $\le$ stok minimum, barang akan diberi penanda khusus (alert warna merah/kuning) pada dashboard monitoring.
5. **Keamanan Hak Akses:**
   * **Admin:** Memiliki akses penuh (CRUD Data Barang, Transaksi Barang Masuk, Transaksi Barang Keluar, Cetak Laporan).
   * **Pemilik:** Akses khusus monitoring stok dan melihat/mencetak laporan persediaan (*Read-Only*).
