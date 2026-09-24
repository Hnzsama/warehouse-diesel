# 15. Acceptance Criteria & Definition of Done

## 1. Quality Gate Overview

```mermaid
flowchart TD
    AC1[1. Auto-increment Stok Barang Masuk] --> GATE{Definition of Done}
    AC2[2. Auto-decrement Stok & Proteksi Stok Minus] --> GATE
    AC3[3. Stock Opname Adjustment Audit Log] --> GATE
    AC4[4. RBAC: User Management di Pemilik & Admin] --> GATE
    AC5[5. Dashboard Monitoring & Safety Stock Alert] --> GATE
    AC6[6. Ekspor Instan PDF & Excel + Print Layout] --> GATE
    GATE -- Pass All 48 Tests --> PASSED[PROYEK DEMO ACC / 100% COMPLETE]
```

---

## 2. Checklist Verification Criteria

- [x] Transaksi **Barang Masuk** secara otomatis menambah jumlah stok item pada database.
- [x] Transaksi **Barang Keluar** secara otomatis mengurangi jumlah stok item pada database.
- [x] Transaksi **Barang Keluar** wajib menolak pengeluaran jika jumlah keluar melebihi stok sisa (**Proteksi Stok Minus**).
- [x] **Stock Opname** dapat menyimpan selisih fisik vs sistem dan meng-update persediaan fisik riil secara atomik.
- [x] **Pemilik (Owner)** dan **Admin** dapat mengelola akun pengguna (`/users`).
- [x] **Pemilik (Owner)** dilindungi middleware dari melakukan mutasi transaksi operasional (*Read-Only Transaction*).
- [x] **Dashboard Monitoring** menampilkan total stok, mutasi barang, grafik `recharts`, dan visual badge *Safety Stock Alert* (`min_stock`).
- [x] Laporan persediaan dan mutasi dapat diekspor secara instan ke format **PDF** (`barryvdh/laravel-dompdf`) dan **Excel** (`phpoffice/phpspreadsheet`).
- [x] Seluruh skenario fungsional terverifikasi lulus **48 Pest Automated Unit & Feature Tests**.
