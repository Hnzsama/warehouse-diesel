<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>{{ $reportTitle }} - Gudang Diesel</title>
    <style>
        @page {
            margin: 25pt 30pt 25pt 30pt;
            size: A4 portrait;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 10pt;
            color: #1e293b;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }
        .header {
            border-bottom: 2px solid #dc2626;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        .header table {
            width: 100%;
            border-collapse: collapse;
        }
        .logo-title {
            font-size: 16pt;
            font-weight: bold;
            color: #991b1b;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .sub-title {
            font-size: 11pt;
            font-weight: bold;
            color: #334155;
            margin: 2px 0 0 0;
        }
        .company-info {
            font-size: 8.5pt;
            color: #64748b;
            margin-top: 3px;
        }
        .kpi-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .kpi-card {
            background-color: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            padding: 8px 12px;
            text-align: center;
        }
        .kpi-label {
            font-size: 7.5pt;
            color: #64748b;
            text-transform: uppercase;
            font-weight: bold;
            letter-spacing: 0.5px;
        }
        .kpi-value {
            font-size: 13pt;
            font-weight: bold;
            color: #0f172a;
            margin-top: 2px;
        }
        .meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            background-color: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
        }
        .meta-table td {
            padding: 6px 10px;
            font-size: 8.5pt;
        }
        .meta-label {
            color: #475569;
            font-weight: bold;
            width: 18%;
        }
        .meta-value {
            color: #0f172a;
            font-weight: 600;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .data-table th {
            background-color: #0f172a;
            color: #ffffff;
            font-weight: bold;
            font-size: 8.5pt;
            text-transform: uppercase;
            padding: 7px 8px;
            border: 1px solid #0f172a;
            text-align: left;
        }
        .data-table td {
            padding: 6px 8px;
            border: 1px solid #cbd5e1;
            font-size: 8.5pt;
        }
        .data-table tr:nth-child(even) {
            background-color: #f8fafc;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-mono { font-family: 'Courier New', Courier, monospace; font-weight: bold; }
        .badge-red {
            color: #dc2626;
            font-weight: bold;
            background-color: #fef2f2;
            padding: 2px 5px;
            border-radius: 3px;
            border: 1px solid #fecaca;
        }
        .badge-green {
            color: #16a34a;
            font-weight: bold;
            background-color: #f0fdf4;
            padding: 2px 5px;
            border-radius: 3px;
            border: 1px solid #bbf7d0;
        }
        .badge-amber {
            color: #d97706;
            font-weight: bold;
            background-color: #fffbeb;
            padding: 2px 5px;
            border-radius: 3px;
            border: 1px solid #fde68a;
        }
        .summary-row td {
            background-color: #e2e8f0;
            font-weight: bold;
            border-top: 2px solid #94a3b8;
        }
        .footer-signatures {
            width: 100%;
            border-collapse: collapse;
            margin-top: 30px;
            page-break-inside: avoid;
        }
        .signature-box {
            text-align: center;
            width: 40%;
            vertical-align: top;
        }
        .signature-space {
            height: 50px;
        }
        .page-number {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            font-size: 8pt;
            color: #94a3b8;
            text-align: right;
        }
    </style>
</head>
<body>

    <div class="header">
        <table>
            <tr>
                <td style="width: 70%;">
                    <div class="logo-title">GUDANG DIESEL</div>
                    <div class="sub-title">{{ $reportTitle }}</div>
                    <div class="company-info">Sistem Informasi Pengelolaan Inventaris & Persediaan Suku Cadang Gudang Diesel</div>
                </td>
                <td style="width: 30%; text-align: right; vertical-align: top;">
                    <div style="font-size: 8pt; color: #64748b;">
                        <div><strong>Tanggal Cetak:</strong> {{ $printedAt }}</div>
                        <div><strong>Operator:</strong> {{ $userName }}</div>
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <table class="meta-table">
        <tr>
            <td class="meta-label">Jenis Laporan:</td>
            <td class="meta-value">{{ $reportTitle }}</td>
            <td class="meta-label">Periode Filter:</td>
            <td class="meta-value">{{ $periodLabel }} ({{ $startDate }} s/d {{ $endDate }})</td>
        </tr>
    </table>

    <table class="kpi-table">
        <tr>
            @if ($reportType === 'stock')
                <td style="width: 33.3%; padding-right: 5px;">
                    <div class="kpi-card">
                        <div class="kpi-label">Total Jenis Sparepart</div>
                        <div class="kpi-value">{{ count($reportData) }} Item</div>
                    </div>
                </td>
                <td style="width: 33.3%; padding-left: 5px; padding-right: 5px;">
                    <div class="kpi-card">
                        <div class="kpi-label">Total Sisa Stok Gudang</div>
                        <div class="kpi-value">{{ collect($reportData)->sum('stock') }} Unit</div>
                    </div>
                </td>
                <td style="width: 33.3%; padding-left: 5px;">
                    <div class="kpi-card" style="border-color: #fecaca; background-color: #fef2f2;">
                        <div class="kpi-label" style="color: #dc2626;">Stok Kritis / Minim</div>
                        <div class="kpi-value" style="color: #dc2626;">{{ collect($reportData)->filter(fn($i) => $i->stock <= $i->min_stock)->count() }} Item</div>
                    </div>
                </td>
            @elseif ($reportType === 'incoming')
                <td style="width: 50%; padding-right: 5px;">
                    <div class="kpi-card">
                        <div class="kpi-label">Total Transaksi Masuk</div>
                        <div class="kpi-value">{{ count($reportData) }} Transaksi</div>
                    </div>
                </td>
                <td style="width: 50%; padding-left: 5px;">
                    <div class="kpi-card" style="border-color: #bbf7d0; background-color: #f0fdf4;">
                        <div class="kpi-label" style="color: #16a34a;">Total Barang Masuk</div>
                        <div class="kpi-value" style="color: #16a34a;">+{{ collect($reportData)->sum('quantity') }} Qty</div>
                    </div>
                </td>
            @elseif ($reportType === 'outgoing')
                <td style="width: 50%; padding-right: 5px;">
                    <div class="kpi-card">
                        <div class="kpi-label">Total Transaksi Keluar</div>
                        <div class="kpi-value">{{ count($reportData) }} Transaksi</div>
                    </div>
                </td>
                <td style="width: 50%; padding-left: 5px;">
                    <div class="kpi-card" style="border-color: #fde68a; background-color: #fffbeb;">
                        <div class="kpi-label" style="color: #d97706;">Total Barang Keluar</div>
                        <div class="kpi-value" style="color: #d97706;">-{{ collect($reportData)->sum('quantity') }} Qty</div>
                    </div>
                </td>
            @endif
        </tr>
    </table>

    @if ($reportType === 'stock')
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 5%;" class="text-center">No</th>
                    <th style="width: 15%;">Kode Barang</th>
                    <th style="width: 35%;">Nama Sparepart</th>
                    <th style="width: 18%;">Kategori</th>
                    <th style="width: 12%;" class="text-center">Stok</th>
                    <th style="width: 15%;" class="text-center">Lokasi Rak</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($reportData as $index => $item)
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td class="font-mono">{{ $item->item_code }}</td>
                        <td><strong>{{ $item->name }}</strong></td>
                        <td>{{ $item->category?->name ?? '-' }}</td>
                        <td class="text-center">
                            @if ($item->stock <= $item->min_stock)
                                <span class="badge-red">{{ $item->stock }} {{ $item->unit?->short_name }}</span>
                            @else
                                <span class="badge-green">{{ $item->stock }} {{ $item->unit?->short_name }}</span>
                            @endif
                        </td>
                        <td class="text-center">{{ $item->rack_location ?? '-' }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colSpan="6" class="text-center" style="padding: 15px; color: #64748b;">Tidak ada data barang ditemukan.</td>
                    </tr>
                @endforelse
            </tbody>
            <tfoot>
                <tr class="summary-row">
                    <td colspan="4" class="text-right">TOTAL JENIS BARANG:</td>
                    <td class="text-center">{{ count($reportData) }} Item</td>
                    <td></td>
                </tr>
            </tfoot>
        </table>
    @elseif ($reportType === 'incoming')
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 5%;" class="text-center">No</th>
                    <th style="width: 18%;">No. Referensi / Nota</th>
                    <th style="width: 18%;">Tanggal & Waktu</th>
                    <th style="width: 25%;">Nama Sparepart</th>
                    <th style="width: 12%;" class="text-center">Jumlah</th>
                    <th style="width: 22%;">Supplier / Pemasok</th>
                </tr>
            </thead>
            <tbody>
                @php $totalQty = 0; @endphp
                @forelse ($reportData as $index => $tx)
                    @php $totalQty += $tx->quantity; @endphp
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td class="font-mono">{{ $tx->reference_no }}</td>
                        <td>{{ \Carbon\Carbon::parse($tx->date)->translatedFormat('d M Y, H:i') }} WIB</td>
                        <td>
                            <strong>{{ $tx->item?->name }}</strong>
                            <div style="font-size: 7.5pt; color: #64748b;" class="font-mono">{{ $tx->item?->item_code }}</div>
                        </td>
                        <td class="text-center">
                            <span class="badge-green">+{{ $tx->quantity }} {{ $tx->item?->unit?->short_name }}</span>
                        </td>
                        <td>{{ $tx->supplier ?? '-' }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colSpan="6" class="text-center" style="padding: 15px; color: #64748b;">Tidak ada riwayat barang masuk pada periode ini.</td>
                    </tr>
                @endforelse
            </tbody>
            <tfoot>
                <tr class="summary-row">
                    <td colspan="4" class="text-right">TOTAL BARANG MASUK:</td>
                    <td class="text-center">{{ $totalQty }} Qty</td>
                    <td></td>
                </tr>
            </tfoot>
        </table>
    @elseif ($reportType === 'outgoing')
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 5%;" class="text-center">No</th>
                    <th style="width: 18%;">No. Bon / Referensi</th>
                    <th style="width: 18%;">Tanggal & Waktu</th>
                    <th style="width: 25%;">Nama Sparepart</th>
                    <th style="width: 12%;" class="text-center">Jumlah</th>
                    <th style="width: 22%;">Penerima / Peruntukan</th>
                </tr>
            </thead>
            <tbody>
                @php $totalQty = 0; @endphp
                @forelse ($reportData as $index => $tx)
                    @php $totalQty += $tx->quantity; @endphp
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td class="font-mono">{{ $tx->reference_no }}</td>
                        <td>{{ \Carbon\Carbon::parse($tx->date)->translatedFormat('d M Y, H:i') }} WIB</td>
                        <td>
                            <strong>{{ $tx->item?->name }}</strong>
                            <div style="font-size: 7.5pt; color: #64748b;" class="font-mono">{{ $tx->item?->item_code }}</div>
                        </td>
                        <td class="text-center">
                            <span class="badge-amber">-{{ $tx->quantity }} {{ $tx->item?->unit?->short_name }}</span>
                        </td>
                        <td>{{ $tx->recipient ?? '-' }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colSpan="6" class="text-center" style="padding: 15px; color: #64748b;">Tidak ada riwayat barang keluar pada periode ini.</td>
                    </tr>
                @endforelse
            </tbody>
            <tfoot>
                <tr class="summary-row">
                    <td colspan="4" class="text-right">TOTAL BARANG KELUAR:</td>
                    <td class="text-center">{{ $totalQty }} Qty</td>
                    <td></td>
                </tr>
            </tfoot>
        </table>
    @endif

    <table class="footer-signatures">
        <tr>
            <td class="signature-box" style="float: left;">
                <div>Petugas / Operator Gudang</div>
                <div class="signature-space"></div>
                <div><strong>( {{ $userName }} )</strong></div>
            </td>
            <td style="width: 20%;"></td>
            <td class="signature-box" style="float: right;">
                <div>Mengetahui,<br>Pemilik / Manager Gudang</div>
                <div class="signature-space"></div>
                <div><strong>( ......................................... )</strong></div>
            </td>
        </tr>
    </table>

</body>
</html>
