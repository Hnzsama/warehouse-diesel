# Warehouse Diesel - Sistem Manajemen Inventaris Gudang

Aplikasi Sistem Informasi Manajemen Inventaris & Persediaan Suku Cadang Gudang Diesel (*Warehouse Inventory Management System*) berbasis **Laravel 12**, **Inertia.js v3**, **React**, dan **Tailwind CSS**.

---

## 🛠️ Fitur Utama Sistem

- **Dashboard Monitoring**: Visualisasi statistik stok, item kritis (*low stock*), dan grafik tren persediaan barang.
- **Master Data Sparepart**: Manajemen data suku cadang, kategori barang, dan satuan barang.
- **Transaksi Stok**:
  - **Barang Masuk**: Input penerimaan stok dengan detail tanggal-jam, nota opsional, dan audit trail.
  - **Barang Keluar**: Pencatatan pengeluaran stok untuk perawatan armada/truk/pelanggan.
  - **Penyesuaian Stok (Stock Opname)**: Pencatatan resmi fisik opname untuk barang rusak, hilang, atau selisih stok.
- **Keamanan & Integritas Data**:
  - **Soft Deletes**: Pengaman data agar terarsip aman saat dihapus.
  - **Edit Audit Log**: Pelacakan riwayat pengeditan transaksi beserta identitas operator.
  - **Kompresi WebP**: Pengompresan foto bukti nota ke format `.webp` secara otomatis.
  - **Auto Reference Generator**: Penomoran nota otomatis server-side (`IN-YYYYMMDD-XXX`, `OUT-YYYYMMDD-XXX`, `ADJ-YYYYMMDD-XXX`).
- **Laporan & Ekspor**: Laporan persediaan barang dengan fitur cetak PDF dan ekspor berkas Excel (`.xlsx`).

---

## 💻 Persyaratan Sistem

- PHP >= 8.2 (dengan ekstensi `gd`, `pdo_mysql`, `mbstring`, `fileinfo`)
- MySQL >= 8.0 / MariaDB >= 10.4
- Node.js >= 18.x & NPM >= 9.x
- Composer >= 2.x

---

## 🚀 Panduan Instalasi & Setup

1. **Clone Repositori**:
   ```bash
   git clone https://github.com/Hnzsama/warehouse-diesel.git
   cd warehouse-diesel
   ```

2. **Instal Dependensi PHP & Node.js**:
   ```bash
   composer install
   npm install
   ```

3. **Konfigurasi Environment**:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   Atur koneksi basis data MySQL di file `.env`:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=warehouse_diesel
   DB_USERNAME=root
   DB_PASSWORD=
   ```

4. **Migrasi Database & Seeder**:
   ```bash
   php artisan migrate --seed
   ```

5. **Link Storage untuk Berkas Berbagi**:
   ```bash
   php artisan storage:link
   ```

6. **Jalankan Dev Server**:
   ```bash
   npm run dev
   # Dalam terminal terpisah:
   php artisan serve
   ```
