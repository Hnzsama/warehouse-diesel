<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Master Data Supplier - Gudang Diesel</title>
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
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .data-table th {
            background-color: #1e293b;
            color: #ffffff;
            font-weight: bold;
            font-size: 8.5pt;
            text-transform: uppercase;
            padding: 7px 8px;
            border: 1px solid #1e293b;
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
    </style>
</head>
<body>

    <div class="header">
        <table>
            <tr>
                <td style="width: 70%;">
                    <div class="logo-title">GUDANG DIESEL</div>
                    <div class="sub-title">MASTER DATA SUPPLIER & PEMASOK</div>
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

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 5%;" class="text-center">No</th>
                <th style="width: 15%;">Kode Supplier</th>
                <th style="width: 25%;">Nama Supplier / Perusahaan</th>
                <th style="width: 15%;">No. Telepon</th>
                <th style="width: 20%;">Email</th>
                <th style="width: 20%;">Alamat</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($suppliers as $index => $supplier)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td class="font-mono">{{ $supplier->code }}</td>
                    <td><strong>{{ $supplier->name }}</strong></td>
                    <td>{{ $supplier->phone ?? '-' }}</td>
                    <td>{{ $supplier->email ?? '-' }}</td>
                    <td>{{ $supplier->address ?? '-' }}</td>
                </tr>
            @empty
                <tr>
                    <td colSpan="6" class="text-center" style="padding: 15px; color: #64748b;">Belum ada data supplier.</td>
                </tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr class="summary-row">
                <td colspan="4" class="text-right">TOTAL SUPPLIER TERDAFTAR:</td>
                <td colspan="2" class="text-center">{{ count($suppliers) }} Mitra / Supplier</td>
            </tr>
        </tfoot>
    </table>

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
