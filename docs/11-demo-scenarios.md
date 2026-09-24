# 11. Demo Scenarios & Test Script Skripsi

## 1. Skenario 1: Transaksi Barang Masuk (Restock Supplier)
1. Login sebagai Admin (`admin@gudangdiesel.com`).
2. Masuk ke halaman **Barang Masuk** -> Klik **Tambah Barang Masuk**.
3. Pilih Sparepart (cth: Filter Oli `SPR-001`), pilih Supplier, dan ketik jumlah `10`.
4. Simpan. Verifikasi bahwa stok Filter Oli bertambah 10 unit secara otomatis.

---

## 2. Skenario 2: Transaksi Barang Keluar & Proteksi Stok Minus
1. Masuk ke halaman **Barang Keluar** -> Klik **Tambah Barang Keluar**.
2. Coba masukkan jumlah keluar melebihi stok yang ada (misal stok sisa 5, diinput 20).
3. Verifikasi bahwa sistem **menolak transaksi** dengan pesan peringatan merah.
4. Ubah jumlah menjadi 2 (valid). Simpan. Verifikasi bahwa stok sisa berkurang 2.

---

## 3. Skenario 3: Pemilik Access & Ekspor Laporan
1. Login sebagai Pemilik (`pemilik@gudangdiesel.com`).
2. Verifikasi bahwa menu mutasi operasional terkunci (*Read-Only*).
3. Masuk ke halaman **Laporan** -> Klik tombol **Download PDF** / **Excel**. Laporan terunduh instan.
