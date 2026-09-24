# 07. UI/UX Guidelines — Gudang Diesel Truk Medan

## 1. Aesthetic Principles
- **Modern Clean Dark Mode:** Menggunakan palette warna slate dark (`#0f172a`, `#0284c7`), glassmorphism cards, subtle border highlights, dan font modern **Plus Jakarta Sans** / **Inter**.
- **Visual Feedback:** State indikator yang jelas saat stok kritis (Alert Badge Kuning/Merah), loading spinner saat transaksi disimpan, dan toast notification.

## 2. Color Palette & Status Badges
- **Primary Brand:** Sky Blue / Indigo (`#0284c7`, `#6366f1`)
- **Safety Stock Normal:** Emerald Green Badge (`Stok Aman`)
- **Safety Stock Warning:** Amber / Yellow Badge (`Mendekati Minimum`)
- **Safety Stock Danger:** Rose / Red Badge (`Stok Kritis / Habis`)
- **Role Admin Gudang:** Sky Blue Badge (`Admin Gudang`)
- **Role Pemilik:** Amber Crown Badge (`Pemilik / Owner`)

## 3. Form Validation & Error Messaging
- Form transaksi barang keluar memvalidasi porsi sisa stok secara real-time dan menampilkan pesan error merah jika `jumlah > sisa_stok`.
