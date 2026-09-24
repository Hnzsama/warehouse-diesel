# 03. Aktor & Hak Akses Pengguna (Role-Based Access Control)

---

## Matriks Hak Akses (RBAC)

| Akses Modul | Admin Gudang (Operational) | Pemilik / Owner (Managerial) | Keterangan & Proteksi |
| :--- | :---: | :---: | :--- |
| **Master Data Sparepart, Kategori, Satuan, Supplier** | Full CRUD | Read-Only (View) | Owner tidak boleh mengubah master data operasional |
| **Transaksi Barang Masuk** | Input & Edit | Read-Only (View) | Auto-increment stok saat transaksi disimpan |
| **Transaksi Barang Keluar** | Input & Edit | Read-Only (View) | Dilengkapi Proteksi Stok Minus |
| **Stock Opname / Penyesuaian** | Input & Adjust | Read-Only (View) | Dokumentasi selisih stok rusak/hilang |
| **Kelola Akun Pengguna (`/users`)** | Full Access | Full Access | Pemilik & Admin dapat mengelola akun staf |
| **Dashboard & Safety Stock Alert** | View | View | Statistik real-time & grafik mutasi |
| **Laporan Persediaan (PDF, Excel, Print)** | View & Export | View & Export | Ekspor instan per periode tanggal |
