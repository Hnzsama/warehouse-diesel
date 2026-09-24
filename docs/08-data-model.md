# 08. Data Model & Database Schema — Gudang Diesel Truk Medan

## 1. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    CATEGORIES ||--o{ ITEMS : "classifies"
    UNITS ||--o{ ITEMS : "measures"
    SUPPLIERS ||--o{ INCOMING_ITEMS : "supplies"
    SUPPLIERS ||--o{ OUTGOING_ITEMS : "references"
    ITEMS ||--o{ INCOMING_ITEMS : "received_in"
    ITEMS ||--o{ OUTGOING_ITEMS : "issued_in"
    ITEMS ||--o{ STOCK_ADJUSTMENTS : "adjusted_in"
    USERS ||--o{ TRANSACTION_EDIT_LOGS : "logs"

    CATEGORIES {
        bigint id PK
        string name
        string slug UK
        timestamp deleted_at
    }

    UNITS {
        bigint id PK
        string name
        string symbol
        timestamp deleted_at
    }

    SUPPLIERS {
        bigint id PK
        string name
        string phone
        text address
        timestamp deleted_at
    }

    ITEMS {
        bigint id PK
        string code UK
        string name
        bigint category_id FK
        bigint unit_id FK
        string rack_location
        integer stock
        integer min_stock
        timestamp deleted_at
    }

    INCOMING_ITEMS {
        bigint id PK
        bigint item_id FK
        bigint supplier_id FK
        integer quantity
        date transaction_date
        string invoice_number
        string invoice_image
        timestamp deleted_at
    }

    OUTGOING_ITEMS {
        bigint id PK
        bigint item_id FK
        bigint supplier_id FK
        integer quantity
        date transaction_date
        string recipient
        text notes
        timestamp deleted_at
    }

    STOCK_ADJUSTMENTS {
        bigint id PK
        bigint item_id FK
        integer system_stock
        integer physical_stock
        integer difference
        text reason
        timestamp created_at
    }
```

---

## 2. Table Specifications

### 2.1 `items` (Master Sparepart)
| Column Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BigIncrements | Primary Key | ID Item Sparepart |
| `code` | String | Unique, Not Null | Kode Unik Sparepart (cth: `SPR-001`) |
| `name` | String | Not Null | Nama Suku Cadang |
| `category_id` | ForeignId | Constrained `categories` | ID Kategori Barang |
| `unit_id` | ForeignId | Constrained `units` | ID Satuan Unit |
| `rack_location` | String | Nullable | Lokasi Rak Penyimpanan (cth: `Rak A-02`) |
| `stock` | Integer | Default `0` | Sisa Stok Fisik Real-time |
| `min_stock` | Integer | Default `5` | Ambang Batas Minimum Safety Stock |
| `deleted_at` | Timestamp | Nullable | **Soft Delete** |

### 2.2 `incoming_items` (Transaksi Barang Masuk)
| Column Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BigIncrements | Primary Key | ID Transaksi Masuk |
| `item_id` | ForeignId | Constrained `items` | Barang yang Diterima |
| `supplier_id` | ForeignId | Constrained `suppliers` | Supplier Penyedia |
| `quantity` | Integer | Not Null | Jumlah Unit Diterima |
| `transaction_date` | Date | Not Null | Tanggal Transaksi Masuk |
| `invoice_number` | String | Nullable | Nomor Faktur / Surat Jalan |
| `invoice_image` | String | Nullable | Path Foto Bukti Faktur |
| `deleted_at` | Timestamp | Nullable | **Soft Delete** |

### 2.3 `outgoing_items` (Transaksi Barang Keluar)
| Column Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BigIncrements | Primary Key | ID Transaksi Keluar |
| `item_id` | ForeignId | Constrained `items` | Barang yang Dikeluarkan |
| `quantity` | Integer | Not Null | Jumlah Unit Dikeluarkan |
| `transaction_date` | Date | Not Null | Tanggal Pengeluaran |
| `recipient` | String | Nullable | Penerima (Mekanik / No. Truk) |
| `notes` | Text | Nullable | Catatan Peruntukan Barang |
| `deleted_at` | Timestamp | Nullable | **Soft Delete** |

### 2.4 `stock_adjustments` (Stock Opname)
| Column Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BigIncrements | Primary Key | ID Stock Opname |
| `item_id` | ForeignId | Constrained `items` | Barang yang Disesuaikan |
| `system_stock` | Integer | Not Null | Jumlah Stok Menurut Sistem |
| `physical_stock` | Integer | Not Null | Jumlah Stok Fisik Hasil Opname |
| `difference` | Integer | Not Null | Selisih ($Physical - System$) |
| `reason` | Text | Nullable | Alasan Adjustment (Rusak/Hilang) |
