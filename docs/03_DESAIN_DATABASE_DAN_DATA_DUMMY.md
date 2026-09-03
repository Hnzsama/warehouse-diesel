# 03. Desain Database dan Data Dummy Sparepart

> **Sistem Informasi Manajemen Stok Barang — Gudang Diesel Truk Medan**

---

## 1. Struktur Relasi Tabel Database (ERD Conceptual)

Database dirancang dengan struktur terintegrasi dan ternormalisasi untuk menjamin integritas data transaksi stok barang gudang.

```
+------------------+         +------------------+         +------------------+
|    categories    |         |      items       |         |      units       |
+------------------+         +------------------+         +------------------+
| id (PK)          |<--------| category_id (FK) |         | id (PK)          |
| code             |         | unit_id (FK)     |-------->| code             |
| name             |         | id (PK)          |         | name             |
| description      |         | item_code (UQ)   |         +------------------+
+------------------+         | name             |
                             | stock            |
                             | min_stock        |
                             | location         |
                             +------------------+
                                  ^        ^
                                  |        |
        +-------------------------+        +-------------------------+
        |                                                            |
+----------------------+                                    +----------------------+
|    incoming_items    |                                    |    outgoing_items    |
+----------------------+                                    +----------------------+
| id (PK)              |                                    | id (PK)              |
| reference_no         |                                    | reference_no         |
| item_id (FK)         |                                    | item_id (FK)         |
| quantity             |                                    | quantity             |
| date                 |                                    | date                 |
| supplier             |                                    | recipient / unit     |
| user_id (FK)         |                                    | user_id (FK)         |
+----------------------+                                    +----------------------+
```

---

## 2. Spesifikasi Skema Tabel (Database Schema)

### 2.1 Tabel `users`
Menyimpan akun pengguna sistem (Admin & Pemilik).

| Field | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BigInt | Primary Key, Auto Increment | ID Pengguna |
| `name` | Varchar(100) | Not Null | Nama Lengkap |
| `email` | Varchar(100) | Unique, Not Null | Email login |
| `password` | Varchar(255) | Not Null | Hashed password |
| `role` | Enum | 'admin', 'pemilik' | Peran pengguna |
| `created_at` | Timestamp | Nullable | Tanggal pembuat |
| `updated_at` | Timestamp | Nullable | Tanggal update |

### 2.2 Tabel `categories`
Menyimpan kategori kelompok suku cadang diesel truk.

| Field | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BigInt | Primary Key, Auto Increment | ID Kategori |
| `name` | Varchar(100) | Not Null | Nama Kategori (misal: Mesin, Rem, Elektrik) |
| `slug` | Varchar(100) | Unique, Not Null | Slug URL |

### 2.3 Tabel `units`
Menyimpan satuan barang.

| Field | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BigInt | Primary Key, Auto Increment | ID Satuan |
| `name` | Varchar(50) | Not Null | Nama Satuan (Pcs, Set, Pail, Botol, Unit) |
| `short_name` | Varchar(20) | Not Null | Singkatan (pcs, set, pl, btl, unit) |

### 2.4 Tabel `items` (Sparepart Master)
Menyimpan katalog master suku cadang diesel truk.

| Field | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BigInt | Primary Key, Auto Increment | ID Item |
| `item_code` | Varchar(50) | Unique, Not Null | Kode Sparepart (contoh: `SPR-DSL-001`) |
| `name` | Varchar(150) | Not Null | Nama suku cadang |
| `category_id` | BigInt | Foreign Key (`categories.id`) | Relasi Kategori |
| `unit_id` | BigInt | Foreign Key (`units.id`) | Relasi Satuan |
| `stock` | Integer | Default(0), Signed | Jumlah stok saat ini |
| `min_stock` | Integer | Default(5) | Ambang batas stok minimum |
| `rack_location` | Varchar(50) | Nullable | Lokasi rak simpan (misal: `Rak A-02`) |

### 2.5 Tabel `incoming_items` (Barang Masuk)
Catatan transaksi penerimaan stok barang baru.

| Field | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BigInt | Primary Key, Auto Increment | ID Transaksi |
| `reference_no` | Varchar(50) | Unique, Not Null | Nomor Surat Jalan / Nota Masuk |
| `item_id` | BigInt | Foreign Key (`items.id`) | Relasi Item Barang |
| `quantity` | Integer | Not Null, > 0 | Jumlah barang masuk |
| `date` | Date | Not Null | Tanggal penerimaan |
| `supplier` | Varchar(100) | Nullable | Nama Distributor/Supplier |
| `notes` | Text | Nullable | Catatan tambahan |
| `user_id` | BigInt | Foreign Key (`users.id`) | Admin pencatat |

### 2.6 Tabel `outgoing_items` (Barang Keluar)
Catatan transaksi pengeluaran stok barang.

| Field | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BigInt | Primary Key, Auto Increment | ID Transaksi |
| `reference_no` | Varchar(50) | Unique, Not Null | Nomor Bon Pengeluaran |
| `item_id` | BigInt | Foreign Key (`items.id`) | Relasi Item Barang |
| `quantity` | Integer | Not Null, > 0 | Jumlah barang keluar |
| `date` | Date | Not Null | Tanggal pengeluaran |
| `recipient` | Varchar(100) | Nullable | Unit Truk / Mekanik penerima |
| `notes` | Text | Nullable | Peruntukan/Keterangan |
| `user_id` | BigInt | Foreign Key (`users.id`) | Admin pencatat |

---

## 3. Data Dummy 20 Sparepart Diesel Truk

Berikut adalah 20 data sampel suku cadang diesel truk yang siap dimasukkan ke dalam seeder database (*database seeder*) untuk pengujian sistem:

| No | Kode Barang | Nama Sparepart Diesel Truk | Kategori | Satuan | Stok Awal | Stok Min | Lokasi Rak |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | `FLT-DSL-001` | Filter Oli Canter / Fuso Hino | Filter | Pcs | 45 | 10 | Rak A-01 |
| 2 | `FLT-DSL-002` | Filter Solar Bawah Canter FE71 | Filter | Pcs | 30 | 8 | Rak A-02 |
| 3 | `FLT-DSL-003` | Filter Udara Outer Hino 500 FM | Filter | Set | 12 | 5 | Rak A-03 |
| 4 | `INJ-DSL-004` | Nozzle Injector Diesel Canter | System Bahan Bakar | Pcs | 16 | 4 | Rak B-01 |
| 5 | `PST-DSL-005` | Piston Kit Standard Hino Duty | Komponen Mesin | Set | 8 | 2 | Rak B-02 |
| 6 | `PKG-DSL-006` | Packing Cylinder Head Fuso 220 | Komponen Mesin | Set | 15 | 3 | Rak B-03 |
| 7 | `KMP-DSL-007` | Kampas Rem Depan Canter HDX | Sistem Pengereman | Set | 24 | 6 | Rak C-01 |
| 8 | `KMP-DSL-008` | Kampas Rem Belakang Hino FM260 | Sistem Pengereman | Set | 18 | 6 | Rak C-02 |
| 9 | `DYN-DSL-009` | Dynamo Starter 24V Fuso Fighter | Elektrikal | Unit | 5 | 2 | Rak D-01 |
| 10 | `ALT-DSL-010` | Alternator Asser 24V Hino 500 | Elektrikal | Unit | 4 | 2 | Rak D-02 |
| 11 | `WTR-DSL-011` | Water Pump Assy Canter PS125 | Sistem Pendingin | Pcs | 9 | 3 | Rak E-01 |
| 12 | `TRB-DSL-012` | Turbocharger Assy Hino FM 260TI | Turbo & Exhaust | Unit | 3 | 1 | Rak E-02 |
| 13 | `RNG-DSL-013` | Ring Piston Standard Canter PS110 | Komponen Mesin | Set | 10 | 2 | Rak B-04 |
| 14 | `MTL-DSL-014` | Metal Jalan Standard Fuso Ganjo | Komponen Mesin | Set | 7 | 2 | Rak B-05 |
| 15 | `MTL-DSL-015` | Metal Duduk Standard Hino Duty | Komponen Mesin | Set | 6 | 2 | Rak B-06 |
| 16 | `CRS-DSL-016` | Cross Joint Kopling Fuso FM517 | Transmisi & Propeller | Pcs | 22 | 5 | Rak F-01 |
| 17 | `SPG-DSL-017` | Per Daun Utama Belakang Canter | Subspensi & Chassis | Pcs | 14 | 4 | Area Lantai 1 |
| 18 | `BLT-DSL-018` | Baut Roda Belakang Kiri Hino 500 | Chasis & Bolt | Pcs | 80 | 20 | Rak G-01 |
| 19 | `OIL-DSL-019` | Oli Mesin Diesel SAE 15W-40 20L | Pelumas | Pail | 18 | 5 | Area Palet A |
| 20 | `BEL-DSL-020` | Tali Kipas / Fan Belt Hino 500 | Sabuk Mesin | Pcs | 35 | 8 | Rak H-01 |
