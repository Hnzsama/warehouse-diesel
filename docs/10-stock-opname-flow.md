# 10. Stock Opname & Adjustment Logic

## 1. Alur Penyesuaian Stok Rusak/Hilang

Proses Stock Opname membandingkan jumlah persediaan menurut sistem dengan pengecekan fisik di gudang:

$$\text{Selisih} = \text{Stok Fisik} - \text{Stok Sistem}$$

---

## 2. Audit Trail Adjustment
1. Admin memasukkan data `physical_stock` dan `reason` (cth: Barang Rusak / Hilang).
2. Sistem mencatat record pada tabel `stock_adjustments`.
3. Sistem memperbarui `stock` pada tabel `items` menjadi sama dengan `physical_stock`.
