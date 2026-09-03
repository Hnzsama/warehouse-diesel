# Dokumentasi Sistem Informasi Manajemen Stok Barang (Gudang Diesel Truk Medan)

Dokumentasi ini disusun berdasarkan analisis komprehensif terhadap dokumen **Proposal Skripsi Jojor Maruba Hutabarat (NIM: 22100052)** dari ITB Indonesia Deli Serdang dan **Ringkasan Analisis Sistem Gudang Diesel Truk Medan**.

 Seluruh berkas panduan pengerjaan sistem terbagi menjadi 4 modul dokumen utama:

---

## 📚 Daftar Berkas Dokumentasi

### 1. [01. Analisis Kebutuhan Sistem](file:///home/akuma/projects/warehouse_diesel/docs/01_ANALISIS_KEBUTUHAN_SISTEM.md)
* Identitas proposal skripsi & latar belakang objek penelitian (Gudang Diesel Truk Medan / Sinar Diesel Truck).
* Analisis permasalahan operasional gudang manual vs sistem terkomputerisasi.
* Batasan sistem (*In-Scope* vs *Out-of-Scope*).
* Aturan bisnis (*Business Rules*), seperti kalkulasi stok otomatis, pembatasan stok negatif, dan indikator stok minimum.

### 2. [02. Arsitektur dan Alur Kerja Sistem](file:///home/akuma/projects/warehouse_diesel/docs/02_ARSITEKTUR_DAN_ALUR_KERJA.md)
* Matriks hak akses pengguna (Role Matrix: **Admin** vs **Pemilik**).
* Diagram interaksi Use Case System.
* Spesifikasi rincian 6 modul fungsional utama (Autentikasi, Master Sparepart, Barang Masuk, Barang Keluar, Dashboard Monitoring, Laporan Persediaan).
* Flowchart alur transaksi barang masuk dan barang keluar.

### 3. [03. Desain Database dan Data Dummy Sparepart](file:///home/akuma/projects/warehouse_diesel/docs/03_DESAIN_DATABASE_DAN_DATA_DUMMY.md)
* ERD Conceptual & struktur relasi antar tabel (`users`, `categories`, `units`, `items`, `incoming_items`, `outgoing_items`).
* Spesifikasi skema tabel database (Primary key, foreign key, constraint, tipe data).
* **20 Data Dummy Sparepart Diesel Truk** siap pakai untuk seeder (lengkap dengan kode barang, kategori, satuan, lokasi rak, stok awal, dan stok minimum).

### 4. [04. Rencana Implementasi & Roadmap Pengerjaan](file:///home/akuma/projects/warehouse_diesel/docs/04_RENCANA_IMPLEMENTASI_FITUR.md)
* Tahapan alur metode Prototype (Requirement Gathering, Quick Design, Prototype Construction, User Evaluation, Final Testing & Deployment).
* Rincian Sprint Pengerjaan (Sprint 1 s/d Sprint 5).
* Matriks Route HTTP & Controller Plan (Routing & Role Access).
* Kriteria Keberhasilan Sistem (*Acceptance Criteria*).

---

> **Lokasi File Sumber:**  
> - `docs/proposal skripsi jojorhutabarat(22100052)( revisi).docx`  
> - `docs/Ringkasan_Analisis_Sistem_Gudang_Diesel.pdf`  
