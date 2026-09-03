import os
import subprocess

html_content = """<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Penjelasan Alur Kerja Sistem Gudang Diesel</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 8mm 10mm 8mm 10mm;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            margin: 0;
            padding: 0;
            font-size: 10px;
            line-height: 1.38;
        }

        .header-banner {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: #ffffff;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .badge-pill {
            display: inline-block;
            background-color: #3b82f6;
            color: #ffffff;
            font-size: 8.5px;
            font-weight: 700;
            padding: 2px 7px;
            border-radius: 20px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 3px;
        }

        .header-title {
            font-size: 16px;
            font-weight: 800;
            margin: 0 0 2px 0;
            letter-spacing: -0.3px;
        }

        .header-subtitle {
            font-size: 9.5px;
            color: #94a3b8;
            margin: 0;
        }

        .card {
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 9px 12px;
            margin-bottom: 8px;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
            page-break-inside: avoid;
        }

        .section-header {
            font-size: 11.5px;
            font-weight: 700;
            color: #0f172a;
            margin-top: 0;
            margin-bottom: 6px;
            padding-bottom: 3px;
            border-bottom: 1px solid #f1f5f9;
        }

        .section-num {
            color: #2563eb;
            font-weight: 800;
            margin-right: 4px;
        }

        .info-grid {
            display: grid;
            grid-template-columns: 110px 1fr;
            row-gap: 4px;
            column-gap: 8px;
        }

        .info-label {
            font-weight: 600;
            color: #64748b;
        }

        .info-value {
            color: #0f172a;
        }

        table.custom-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 3px;
            font-size: 9.5px;
        }

        table.custom-table th {
            background-color: #f1f5f9;
            color: #475569;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 8.5px;
            letter-spacing: 0.4px;
            padding: 4px 7px;
            border-bottom: 2px solid #e2e8f0;
            text-align: left;
        }

        table.custom-table td {
            padding: 4px 7px;
            border-bottom: 1px solid #e2e8f0;
            color: #334155;
            vertical-align: top;
        }

        .tag-admin {
            display: inline-block;
            background-color: #dbeafe;
            color: #1e40af;
            font-size: 8.5px;
            font-weight: 700;
            padding: 1px 5px;
            border-radius: 3px;
            margin-right: 3px;
        }

        .tag-pemilik {
            display: inline-block;
            background-color: #fef3c7;
            color: #92400e;
            font-size: 8.5px;
            font-weight: 700;
            padding: 1px 5px;
            border-radius: 3px;
        }

        .flow-container {
            display: flex;
            flex-direction: column;
            gap: 5px;
            margin-top: 3px;
        }

        .flow-step {
            background-color: #f8fafc;
            border-left: 3px solid #3b82f6;
            border-radius: 4px;
            padding: 5px 8px;
            display: flex;
            align-items: flex-start;
            gap: 6px;
        }

        .flow-step.amber {
            border-left-color: #f59e0b;
        }

        .flow-step.emerald {
            border-left-color: #10b981;
        }

        .flow-step-num {
            background-color: #3b82f6;
            color: #ffffff;
            font-size: 8.5px;
            font-weight: 800;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            margin-top: 1px;
        }

        .flow-step.amber .flow-step-num {
            background-color: #f59e0b;
        }

        .flow-step.emerald .flow-step-num {
            background-color: #10b981;
        }

        .flow-step-text {
            font-size: 9.5px;
            color: #334155;
        }

        .flow-step-title {
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 1px;
        }

        .status-box {
            background-color: #ecfdf5;
            border: 1px solid #a7f3d0;
            border-left: 4px solid #10b981;
            border-radius: 6px;
            padding: 8px 12px;
            margin-top: 5px;
            page-break-inside: avoid;
        }

        .status-title {
            font-weight: 700;
            color: #065f46;
            font-size: 10.5px;
            margin-bottom: 2px;
        }

        .status-desc {
            color: #047857;
            font-size: 9.5px;
        }

        .footer-note {
            text-align: right;
            font-size: 8.5px;
            color: #94a3b8;
            margin-top: 6px;
        }

        .grid-2col {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
        }

        .module-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 5px;
            padding: 6px 8px;
        }

        .module-title {
            font-weight: 700;
            color: #0f172a;
            font-size: 10px;
            margin-bottom: 2px;
        }

        .module-desc {
            font-size: 9px;
            color: #64748b;
        }
    </style>
</head>
<body>

    <!-- Header Banner Card -->
    <div class="header-banner">
        <div class="badge-pill">Panduan Lengkap & Explainer Sistem</div>
        <div class="header-title">Sistem Informasi Manajemen Persediaan Stok Barang</div>
        <div class="header-subtitle">Studi Kasus: Gudang Diesel Truk Medan &bull; Penjelasan Detail Komponen Teknologi, RBAC, Kredensial Akses User & Alur Kerja</div>
    </div>

    <!-- Section 01 -->
    <div class="card">
        <div class="section-header">
            <span class="section-num">01</span> Karakteristik & Architecture Stack Teknologi
        </div>
        <div class="info-grid">
            <div class="info-label">Nama Aplikasi</div>
            <div class="info-value"><strong>Gudang Diesel</strong> (Sistem Informasi Persediaan Suku Cadang Diesel Truk Medan)</div>

            <div class="info-label">Backend (Mesin)</div>
            <div class="info-value"><strong>Laravel 12 (PHP 8.5)</strong> &mdash; Otak pemroses logika database, kalkulasi stok, dan proteksi backend.</div>

            <div class="info-label">Frontend (Layar)</div>
            <div class="info-value"><strong>React 19 + Tailwind CSS</strong> &mdash; Penyaji tampilan visual, tombol interaktif, tabel data, dan badge stok.</div>

            <div class="info-label">Jembatan (Bridge)</div>
            <div class="info-value"><strong>Inertia.js v3</strong> &mdash; Menghubungkan Laravel ke React sehingga navigasi instan tanpa reload layar putih.</div>

            <div class="info-label">Keamanan Auth</div>
            <div class="info-value"><strong>Laravel Fortify + Spatie RBAC</strong> &mdash; Satpam digital pengelola login dan pembatas hak akses peran.</div>
        </div>
    </div>

    <!-- Section 02: KREDENSIAL AKSES USER -->
    <div class="card">
        <div class="section-header">
            <span class="section-num">02</span> Daftar Akses Login Pengguna (Default User Credentials)
        </div>
        <table class="custom-table">
            <thead>
                <tr>
                    <th style="width: 18%;">Peran / Hak Akses</th>
                    <th style="width: 25%;">Nama Pengguna</th>
                    <th style="width: 32%;">Email Login</th>
                    <th style="width: 15%;">Password</th>
                    <th style="width: 10%;">Akses</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><span class="tag-pemilik">Pemilik (Owner)</span></td>
                    <td><strong>Bapak Hartono</strong></td>
                    <td><code>pemilik@gudangdiesel.com</code></td>
                    <td><code>password</code></td>
                    <td>Overview / Owner</td>
                </tr>
                <tr>
                    <td><span class="tag-admin">Admin Gudang</span></td>
                    <td><strong>Admin Gudang Utama</strong></td>
                    <td><code>admin@gudangdiesel.com</code></td>
                    <td><code>password</code></td>
                    <td>Full Operasional</td>
                </tr>
                <tr>
                    <td><span class="tag-admin">Admin Gudang</span></td>
                    <td>Budi Santoso (Shift Pagi)</td>
                    <td><code>budi.admin@gudangdiesel.com</code></td>
                    <td><code>password</code></td>
                    <td>Operasional Staf</td>
                </tr>
                <tr>
                    <td><span class="tag-admin">Admin Gudang</span></td>
                    <td>Agus Setiawan (Shift Siang)</td>
                    <td><code>agus.admin@gudangdiesel.com</code></td>
                    <td><code>password</code></td>
                    <td>Operasional Staf</td>
                </tr>
                <tr>
                    <td><span class="tag-admin">Admin Gudang</span></td>
                    <td>Rudi Hermawan (Stock Opname)</td>
                    <td><code>rudi.admin@gudangdiesel.com</code></td>
                    <td><code>password</code></td>
                    <td>Operasional Staf</td>
                </tr>
                <tr>
                    <td><span class="tag-admin">Admin Gudang</span></td>
                    <td>Dewi Lestari (Logistik)</td>
                    <td><code>dewi.admin@gudangdiesel.com</code></td>
                    <td><code>password</code></td>
                    <td>Operasional Staf</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Section 03 -->
    <div class="card">
        <div class="section-header">
            <span class="section-num">03</span> Glosarium & Penjelasan Istilah Teknis (Untuk Orang Awam)
        </div>
        <table class="custom-table">
            <thead>
                <tr>
                    <th style="width: 22%;">Istilah Teknis</th>
                    <th style="width: 33%;">Arti Sederhana (Bahasa Awam)</th>
                    <th style="width: 45%;">Fungsi & Penerapan di Gudang Diesel</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Laravel Fortify</strong></td>
                    <td>Satpam Digital / Penjaga Pintu Masuk</td>
                    <td>Mesin pengelola login yang mencocokkan email/password secara terenkripsi dan mengunci akses jika salah.</td>
                </tr>
                <tr>
                    <td><strong>Spatie RBAC</strong></td>
                    <td>Sistem Kartu Akses Ruangan Berdasarkan Peran</td>
                    <td>Membagi hak akses pengguna menjadi Admin Gudang (Operator) dan Pemilik Gudang (Owner).</td>
                </tr>
                <tr>
                    <td><strong>Session Stateful Auth</strong></td>
                    <td>Stempel Tangan / Gelang Tiket Sesi Login</td>
                    <td>Menyimpan tiket login sementara di browser agar pengguna tidak perlu mengisi password berulang-ulang.</td>
                </tr>
                <tr>
                    <td><strong>Stok Minimum (min_stock)</strong></td>
                    <td>Batas Aman Paling Sedikit di Rak</td>
                    <td>Jika sisa stok menyentuh angka minimum, sistem menyalakan highlight <strong>Merah (Stok Kritis)</strong> agar onderdil di-order ulang.</td>
                </tr>
                <tr>
                    <td><strong>Auto-Increment / Decrement</strong></td>
                    <td>Kalkulasi Stok Instan Otomatis</td>
                    <td>Stok bertambah otomatis saat <em>Barang Masuk</em> dan berkurang otomatis saat <em>Barang Keluar</em> tanpa kalkulator.</td>
                </tr>
                <tr>
                    <td><strong>Proteksi Stok Minus</strong></td>
                    <td>Sistem Pencegah Stok Teoritis Minus</td>
                    <td>Menolak input <em>Barang Keluar</em> jika jumlah pengeluaran yang diminta melebihi sisa stok fisik di gudang.</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Section 04 -->
    <div class="card">
        <div class="section-header">
            <span class="section-num">04</span> Matriks Hak Akses Peran Pengguna (Spatie RBAC)
        </div>
        <table class="custom-table">
            <thead>
                <tr>
                    <th style="width: 25%;">Modul / Fitur</th>
                    <th style="width: 20%;">Aktor Peran</th>
                    <th style="width: 55%;">Penjelasan Aturan Akses & Wewenang</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Dashboard Monitoring & Area Chart</strong></td>
                    <td><span class="tag-admin">Admin</span> <span class="tag-pemilik">Pemilik</span></td>
                    <td>Melihat grafik & statistik real-time: Total Jenis Sparepart, Barang Masuk, Barang Keluar, Alert Stok Kritis, & Filter Periode.</td>
                </tr>
                <tr>
                    <td><strong>Master Data Sparepart</strong></td>
                    <td><span class="tag-admin">Admin</span></td>
                    <td>Kelola penuh (CRUD) suku cadang: kode barang, nama, kategori, satuan, stok awal, min_stock, & lokasi rak.</td>
                </tr>
                <tr>
                    <td><strong>Kategori & Satuan</strong></td>
                    <td><span class="tag-admin">Admin</span></td>
                    <td>Pencatatan master kategori (Filter, Rem, Mesin) dan satuan ukuran (pcs, set, galon, unit).</td>
                </tr>
                <tr>
                    <td><strong>Transaksi Barang Masuk</strong></td>
                    <td><span class="tag-admin">Admin</span></td>
                    <td>Input penerimaan pasokan dari supplier. Otomatis menambah jumlah sisa stok barang di rak.</td>
                </tr>
                <tr>
                    <td><strong>Transaksi Barang Keluar</strong></td>
                    <td><span class="tag-admin">Admin</span></td>
                    <td>Input pengeluaran sparepart untuk armada truk. Otomatis memotong sisa stok dengan validasi stok mencukupi.</td>
                </tr>
                <tr>
                    <td><strong>Laporan Persediaan, PDF & Excel</strong></td>
                    <td><span class="tag-admin">Admin</span> <span class="tag-pemilik">Pemilik</span></td>
                    <td>Rekapitulasi stok akhir, barang masuk, & keluar dengan filter rentang tanggal serta cetak PDF & Export Excel + Chart.</td>
                </tr>
                <tr>
                    <td><strong>Kelola Admin Gudang</strong></td>
                    <td><span class="tag-admin">Admin</span> <span class="tag-pemilik">Pemilik</span></td>
                    <td>Manajemen akun staf Admin Gudang (tambah, edit, hapus). Akun Pemilik disembunyikan dari daftar demi keamanan.</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Section 05 -->
    <div class="card">
        <div class="section-header">
            <span class="section-num">05</span> Alur Transaksi Persediaan (Step-by-Step)
        </div>

        <div style="font-weight: 700; color: #0f172a; margin-bottom: 3px; font-size: 10.5px;">5.1 Alur Transaksi Barang Masuk (Penambahan Stok)</div>
        <div class="flow-container" style="margin-bottom: 8px;">
            <div class="flow-step emerald">
                <div class="flow-step-num">1</div>
                <div class="flow-step-text">
                    <div class="flow-step-title">Penerimaan & Input Form Nota</div>
                    Admin menerima fisik suku cadang dari supplier ➔ Buka menu <strong>Barang Masuk</strong> ➔ Input No. Nota (misal: <code>IN-20260903-001</code>), Tanggal, Supplier, & Catatan.
                </div>
            </div>
            <div class="flow-step emerald">
                <div class="flow-step-num">2</div>
                <div class="flow-step-text">
                    <div class="flow-step-title">Pemilihan Sparepart & Jumlah</div>
                    Pilih nama sparepart dari dropdown autokomplit dan masukkan jumlah kuantitas barang yang diterima (misal: 20 pcs).
                </div>
            </div>
            <div class="flow-step emerald">
                <div class="flow-step-num">3</div>
                <div class="flow-step-text">
                    <div class="flow-step-title">Auto-Increment Stok Database</div>
                    Sistem menyimpan nota dan mengeksekusi kalkulasi otomatis: <code>stok_baru = stok_lama + kuantitas_masuk</code>.
                </div>
            </div>
        </div>

        <div style="font-weight: 700; color: #0f172a; margin-bottom: 3px; font-size: 10.5px;">5.2 Alur Transaksi Barang Keluar (Pengurangan Stok & Validasi)</div>
        <div class="flow-container">
            <div class="flow-step amber">
                <div class="flow-step-num">1</div>
                <div class="flow-step-text">
                    <div class="flow-step-title">Permintaan Pengambilan & Input Form Bon</div>
                    Mekanik meminta onderdil ➔ Admin membuka menu <strong>Barang Keluar</strong> ➔ Input No. Bon (misal: <code>OUT-20260903-001</code>), Tanggal, Truk Penerima, & Catatan.
                </div>
            </div>
            <div class="flow-step amber">
                <div class="flow-step-num">2</div>
                <div class="flow-step-text">
                    <div class="flow-step-title">Pemeriksaan Ketersediaan Stok</div>
                    Sistem mengecek sisa stok. Jika <code>jumlah_keluar > sisa_stok</code>, transaksi <strong>DITOLAK</strong> dengan pesan error <em>"Jumlah pengeluaran melebihi sisa stok yang ada"</em>.
                </div>
            </div>
            <div class="flow-step amber">
                <div class="flow-step-num">3</div>
                <div class="flow-step-text">
                    <div class="flow-step-title">Auto-Decrement Stok Database</div>
                    Jika stok mencukupi (<code>jumlah_keluar &le; sisa_stok</code>), transaksi disimpan dan stok dipotong otomatis: <code>stok_baru = stok_lama - kuantitas_keluar</code>.
                </div>
            </div>
        </div>
    </div>

    <!-- Section 06 -->
    <div class="card">
        <div class="section-header">
            <span class="section-num">06</span> Keamanan Proteksi Aplikasi Gudang
        </div>
        <div class="grid-2col">
            <div class="module-card">
                <div class="module-title">🚫 Nonaktifkan Sign Up Terbuka</div>
                <div class="module-desc">Fitur pendaftaran publik dinonaktifkan. Akun Admin Gudang baru hanya bisa dibuat oleh Pemilik Gudang dari dalam aplikasi demi mencegah pihak luar membuat akun.</div>
            </div>
            <div class="module-card">
                <div class="module-title">🔒 Nonaktifkan Lupa Password Publik</div>
                <div class="module-desc">Rute reset password publik dinonaktifkan untuk mencegah peretasan via email. Pembuatan dan pergantian kata sandi dikendalikan penuh secara internal.</div>
            </div>
        </div>
    </div>

    <!-- Status Callout Box -->
    <div class="status-box">
        <div class="status-title">Status Dokumentasi & Integrasi Sistem</div>
        <div class="status-desc">
            Seluruh komponen arsitektur, data kredensial login user, manajemen hak akses RBAC, satpam autentikasi Fortify, transaksi persediaan barang masuk/keluar, alert stok kritis real-time, hingga cetak laporan PDF & Export Excel + Chart telah 100% di-update dan terintegrasi secara sempurna pada aplikasi Gudang Diesel.
        </div>
    </div>

    <div class="footer-note">
        Dokumen Resmi Penjelasan Lengkap Alur Sistem Gudang Diesel &bull; Dicetak Otomatis Sistem
    </div>

</body>
</html>
"""

html_path = "/tmp/penjelasan_alur_sistem.html"
pdf_path = "/home/akuma/projects/warehouse_diesel/docs/Penjelasan_Alur_Sistem_Gudang_Diesel.pdf"
pdf_ringkasan_path = "/home/akuma/projects/warehouse_diesel/docs/Ringkasan_Analisis_Sistem_Gudang_Diesel.pdf"

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print("HTML generated at:", html_path)

cmd = [
    "google-chrome",
    "--headless",
    "--disable-gpu",
    "--no-sandbox",
    "--no-pdf-header-footer",
    f"--print-to-pdf={pdf_path}",
    html_path
]

res = subprocess.run(cmd, capture_output=True, text=True)
print("Chrome returncode:", res.returncode)

if os.path.exists(pdf_path):
    print("Successfully generated PDF at:", pdf_path, f"({os.path.getsize(pdf_path)} bytes)")
    with open(pdf_path, "rb") as rf:
        pdf_bytes = rf.read()
    with open(pdf_ringkasan_path, "wb") as wf:
        wf.write(pdf_bytes)
    print("Updated Ringkasan_Analisis_Sistem_Gudang_Diesel.pdf successfully!")
else:
    print("Error generating PDF:", res.stderr)
