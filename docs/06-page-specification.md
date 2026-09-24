# 06. Page Specification — Gudang Diesel Truk Medan

Dokumen ini mendeskripsikan seluruh halaman React SPA pada aplikasi beserta komponen, Inertia routes, dan fungsinya.

---

## 1. Dashboard Monitoring (`/dashboard`)
* **Route Component:** `resources/js/pages/dashboard.tsx`
* **Elemen UI:** Indicator Cards (Total Item, Total Unit, Mutasi Masuk/Keluar), Area Chart (`recharts`) Mutasi Barang, Tabel Safety Stock Alert (`min_stock`), Ringkasan Aktivitas Terakhir.

## 2. Master Data Sparepart (`/items`)
* **Route Component:** `resources/js/pages/Items/Index.tsx`
* **Elemen UI:** Data Table Sparepart (Kode, Nama, Lokasi Rak, Satuan, Kategori, Stok Sisa, Minimum Stok, Status Safety Stock), Modal Tambah/Edit Item, Filter Kategori & Rak, Action Soft Delete & Restore.

## 3. Master Data Kategori, Satuan & Supplier (`/categories`, `/units`, `/suppliers`)
* **Route Component:** `resources/js/pages/Categories/Index.tsx`, `Units/Index.tsx`, `Suppliers/Index.tsx`
* **Elemen UI:** Data Table Kategori, Satuan Unit, dan Supplier, Form Modal CRUD, Action Soft Delete.

## 4. Transaksi Barang Masuk (`/incoming-items`)
* **Route Component:** `resources/js/pages/IncomingItems/Index.tsx`
* **Elemen UI:** Form Modal Input Barang Masuk (Select Item, Select Supplier, Jumlah, Tanggal, No. Invoice, Foto Faktur), Data Table Mutasi Masuk, Auto-increment Stok.

## 5. Transaksi Barang Keluar (`/outgoing-items`)
* **Route Component:** `resources/js/pages/OutgoingItems/Index.tsx`
* **Elemen UI:** Form Modal Input Barang Keluar (Select Item, Jumlah, Tanggal, Penerima Mekanik/Truk, Catatan), Proteksi Stok Minus Real-time, Data Table Mutasi Keluar, Auto-decrement Stok.

## 6. Stock Opname / Penyesuaian Stok (`/stock-adjustments`)
* **Route Component:** `resources/js/pages/StockAdjustments/Index.tsx`
* **Elemen UI:** Form Modal Adjust (Select Item, Stok Sistem, Input Stok Fisik, Hitung Selisih Otomatis, Catatan Alasan), Audit Log Penyesuaian Stok.

## 7. Kelola Pengguna / User Management (`/users`)
* **Route Component:** `resources/js/pages/Users/Index.tsx`
* **Elemen UI:** Data Table User & Role Badge (Admin / Pemilik), Modal Tambah/Edit User, Dialog Hapus User (Pemilik & Admin Access).

## 8. Laporan Persediaan & Mutasi (`/reports`)
* **Route Component:** `resources/js/pages/Reports/Index.tsx`
* **Elemen UI:** Filter Rentang Tanggal & Kategori, Preview Tabel Laporan, Tombol Cetak (Print Layout), Tombol Download PDF (DomPDF), Tombol Download Excel (PhpSpreadsheet).
