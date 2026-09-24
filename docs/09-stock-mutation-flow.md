# 09. Stock Mutation Flow & Transaction Logic

## 1. Formulas Mutasi Stok Atomik

Setiap transaksi barang masuk dan keluar dihitung secara atomik pada database Eloquent transaction:

$$\text{Stok Akhir} = \text{Stok Awal} + \text{Barang Masuk} - \text{Barang Keluar}$$

---

## 2. Transaksi Barang Masuk (Auto-increment)
- **Input:** Tanggal, Item, Supplier, Jumlah Masuk, No. Faktur.
- **Efek Stok:** `Item::increment('stock', $quantity)`

---

## 3. Transaksi Barang Keluar (Auto-decrement & Proteksi Stok Minus)
- **Input:** Tanggal, Item, Jumlah Keluar, Penerima.
- **Validasi Rule:**
```php
if ($quantity > $item->stock) {
    return back()->withErrors(['quantity' => 'Jumlah barang keluar melebihi stok sisa!']);
}
```
- **Efek Stok:** `Item::decrement('stock', $quantity)`
