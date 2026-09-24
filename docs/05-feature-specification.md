# 05. Feature Specification — Gudang Diesel Truk Medan

## 1. Modul Operational Admin Gudang

### 1.1 Master Data Sparepart & Referensi
- **F-MST-01 Management Sparepart:** Pendataan kode suku cadang unik (cth: `SPR-001`), nama barang, lokasi rak penyimpanan, stok awal, dan stok minimum.
- **F-MST-02 Management Kategori & Satuan Unit:** Pengelompokan jenis sparepart (Mesin, Filter, Oli) dan satuan barang (Pcs, Set, Unit, Dus).
- **F-MST-03 Management Supplier:** Pendataan supplier penyedia suku cadang lengkap dengan alamat dan nomor kontak.

### 1.2 Transaksi Mutasi Barang
- **F-TRX-01 Transaksi Barang Masuk (Restock):** Input tanggal penerimaan, supplier, jumlah barang masuk, nomor faktur/surat jalan, dan bukti foto invoice. Stok barang bertambah otomatis (*Auto-increment*).
- **F-TRX-02 Transaksi Barang Keluar (Pengeluaran):** Input tanggal pengeluaran, jumlah barang keluar, penerima (mekanik/nomor truk), dan catatan. Stok barang berkurang otomatis (*Auto-decrement*).
- **F-TRX-03 Proteksi Stok Minus:** Sistem me-reject transaksi barang keluar jika jumlah keluar melebihi sisa stok item yang tersedia.

### 1.3 Stock Opname (Penyesuaian Stok)
- **F-OPN-01 Penyesuaian Stok Rusak/Hilang:** Input jumlah persediaan fisik riil hasil pengecekan gudang, catatan selisih, dan alasan adjustment. Sistem memperbarui stok sistem agar 100% konsisten dengan fisik.

---

## 2. Modul Manajerial & Supervision Pemilik (Owner)

### 2.1 Dashboard Monitoring & Safety Stock Alert
- **F-DSH-01 Indicator Cards:** Menampilkan total item sparepart, total unit barang, total transaksi masuk, dan total transaksi keluar.
- **F-DSH-02 Area Chart Mutasi:** Grafik tren barang masuk vs barang keluar bulanan menggunakan `recharts`.
- **F-DSH-03 Safety Stock Alert:** Peringatan visual warna kuning/merah untuk item barang yang sisa stoknya $\le$ stok minimum (`min_stock`).

### 2.2 Management Akun Pengguna & Laporan
- **F-USR-01 User Management:** Menginput, memperbarui, dan menghapus akses akun pengguna/admin gudang (`/users`).
- **F-REP-01 Instant PDF & Excel Export:** Mengunduh laporan rekapitulasi persediaan dan mutasi barang per rentang tanggal dalam format PDF (DomPDF) dan Excel (PhpSpreadsheet).
