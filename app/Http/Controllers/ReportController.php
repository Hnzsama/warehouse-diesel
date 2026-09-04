<?php

namespace App\Http\Controllers;

use App\Models\IncomingItem;
use App\Models\Item;
use App\Models\OutgoingItem;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Chart\Chart;
use PhpOffice\PhpSpreadsheet\Chart\DataSeries;
use PhpOffice\PhpSpreadsheet\Chart\DataSeriesValues;
use PhpOffice\PhpSpreadsheet\Chart\Legend;
use PhpOffice\PhpSpreadsheet\Chart\PlotArea;
use PhpOffice\PhpSpreadsheet\Chart\Title;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class ReportController extends Controller
{
    /**
     * Display the inventory reporting page with date range & type filters.
     */
    public function index(Request $request): Response
    {
        try {
            $reportType = $request->input('report_type', 'stock');
            $period = $request->input('period', 'monthly');
            $startDateInput = $request->input('start_date');
            $endDateInput = $request->input('end_date');

            if ($period === 'today') {
                $startDate = now()->toDateString();
                $endDate = now()->toDateString();
            } elseif ($period === 'weekly') {
                $startDate = now()->subDays(6)->toDateString();
                $endDate = now()->toDateString();
            } elseif ($period === 'monthly') {
                $startDate = now()->startOfMonth()->toDateString();
                $endDate = now()->toDateString();
            } else {
                $startDate = $startDateInput ?: '2026-07-01';
                $endDate = $endDateInput ?: now()->toDateString();
            }

            $reportData = [];

            if ($reportType === 'stock') {
                $reportData = Item::with(['category', 'unit'])
                    ->orderBy('name')
                    ->get();
            } elseif ($reportType === 'incoming') {
                $reportData = IncomingItem::with(['item.category', 'item.unit', 'user'])
                    ->whereBetween('date', [$startDate.' 00:00:00', $endDate.' 23:59:59'])
                    ->latest('date')
                    ->get();
            } elseif ($reportType === 'outgoing') {
                $reportData = OutgoingItem::with(['item.category', 'item.unit', 'user'])
                    ->whereBetween('date', [$startDate.' 00:00:00', $endDate.' 23:59:59'])
                    ->latest('date')
                    ->get();
            }

            return Inertia::render('Reports/Index', [
                'reportType' => $reportType,
                'period' => $period,
                'startDate' => $startDate,
                'endDate' => $endDate,
                'reportData' => $reportData,
            ]);
        } catch (Throwable $e) {
            Log::error('Error generating report index: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Generate & Download high quality PDF report.
     */
    public function exportPdf(Request $request): HttpResponse
    {
        try {
            $reportType = $request->input('report_type', 'stock');
            $period = $request->input('period', 'monthly');
            $startDateInput = $request->input('start_date');
            $endDateInput = $request->input('end_date');

            if ($period === 'today') {
                $startDate = now()->toDateString();
                $endDate = now()->toDateString();
            } elseif ($period === 'weekly') {
                $startDate = now()->subDays(6)->toDateString();
                $endDate = now()->toDateString();
            } elseif ($period === 'monthly') {
                $startDate = now()->startOfMonth()->toDateString();
                $endDate = now()->toDateString();
            } else {
                $startDate = $startDateInput ?: '2026-07-01';
                $endDate = $endDateInput ?: now()->toDateString();
            }

            $reportData = [];
            $reportTitle = 'Laporan Stok Persediaan';

            if ($reportType === 'stock') {
                $reportTitle = 'Laporan Stok Persediaan Sparepart';
                $reportData = Item::with(['category', 'unit'])
                    ->orderBy('name')
                    ->get();
            } elseif ($reportType === 'incoming') {
                $reportTitle = 'Laporan Transaksi Barang Masuk';
                $reportData = IncomingItem::with(['item.category', 'item.unit', 'user'])
                    ->whereBetween('date', [$startDate.' 00:00:00', $endDate.' 23:59:59'])
                    ->latest('date')
                    ->get();
            } elseif ($reportType === 'outgoing') {
                $reportTitle = 'Laporan Transaksi Barang Keluar';
                $reportData = OutgoingItem::with(['item.category', 'item.unit', 'user'])
                    ->whereBetween('date', [$startDate.' 00:00:00', $endDate.' 23:59:59'])
                    ->latest('date')
                    ->get();
            }

            $periodLabel = match ($period) {
                'today' => 'Harian (Hari Ini)',
                'weekly' => 'Mingguan (7 Hari Terakhir)',
                'monthly' => 'Bulanan (Bulan Ini)',
                default => 'Kustom Periode',
            };

            $pdf = Pdf::loadView('reports.pdf', [
                'reportType' => $reportType,
                'reportTitle' => $reportTitle,
                'periodLabel' => $periodLabel,
                'startDate' => Carbon::parse($startDate)->format('d/m/Y'),
                'endDate' => Carbon::parse($endDate)->format('d/m/Y'),
                'reportData' => $reportData,
                'printedAt' => now()->translatedFormat('d F Y H:i'),
                'userName' => $request->user()?->name ?? 'Admin',
            ])->setPaper('a4', 'portrait');

            $filename = Str::slug($reportTitle).'_'.now()->format('Ymd_His').'.pdf';

            return $pdf->download($filename);
        } catch (Throwable $e) {
            Log::error('Error generating PDF report: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Export professional, neatly styled Excel report tailored to selected report type.
     */
    public function exportExcel(Request $request): StreamedResponse
    {
        try {
            $reportType = $request->input('report_type', 'stock');
            $period = $request->input('period', 'monthly');
            $startDateInput = $request->input('start_date');
            $endDateInput = $request->input('end_date');

            if ($period === 'today') {
                $startDate = now()->toDateString();
                $endDate = now()->toDateString();
            } elseif ($period === 'weekly') {
                $startDate = now()->subDays(6)->toDateString();
                $endDate = now()->toDateString();
            } elseif ($period === 'monthly') {
                $startDate = now()->startOfMonth()->toDateString();
                $endDate = now()->toDateString();
            } else {
                $startDate = $startDateInput ?: '2026-07-01';
                $endDate = $endDateInput ?: now()->toDateString();
            }

            $spreadsheet = new Spreadsheet;

            // --- SHEET 1: RINGKASAN & GRAFIK TREN ---
            $sheet1 = $spreadsheet->getActiveSheet();
            $sheet1->setTitle('Grafik & Ringkasan');
            $sheet1->setShowGridLines(true);

            // Title Banner
            $sheet1->mergeCells('A1:D1');
            $sheet1->setCellValue('A1', 'SISTEM INFORMASI PERSEDIAAN GUDANG DIESEL');
            $sheet1->getStyle('A1')->getFont()->setBold(true)->setSize(14)->setColor(new Color(Color::COLOR_WHITE));
            $sheet1->getStyle('A1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('0F172A');
            $sheet1->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT)->setVertical(Alignment::VERTICAL_CENTER);
            $sheet1->getRowDimension(1)->setRowHeight(32);

            $sheet1->mergeCells('A2:D2');
            $sheet1->setCellValue('A2', 'Laporan Trend Transaksi Persediaan (Periode: '.$startDate.' s/d '.$endDate.')');
            $sheet1->getStyle('A2')->getFont()->setItalic(true)->setSize(10)->setColor(new Color('64748B'));

            // Data Table Headers for Chart
            $sheet1->setCellValue('A4', 'Tanggal');
            $sheet1->setCellValue('B4', 'Barang Masuk');
            $sheet1->setCellValue('C4', 'Barang Keluar');
            $sheet1->getStyle('A4:C4')->getFont()->setBold(true)->setColor(new Color(Color::COLOR_WHITE));
            $sheet1->getStyle('A4:C4')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('1E293B');

            $chartStartDate = ($period === 'today') ? now()->subDays(6)->toDateString() : $startDate;
            $chartEndDate = $endDate;

            $chartStartDateTime = $chartStartDate.' 00:00:00';
            $chartEndDateTime = $chartEndDate.' 23:59:59';

            $incomingByDate = IncomingItem::whereBetween('date', [$chartStartDateTime, $chartEndDateTime])
                ->selectRaw('DATE(date) as date_key, SUM(quantity) as total')
                ->groupBy('date_key')
                ->pluck('total', 'date_key');

            $outgoingByDate = OutgoingItem::whereBetween('date', [$chartStartDateTime, $chartEndDateTime])
                ->selectRaw('DATE(date) as date_key, SUM(quantity) as total')
                ->groupBy('date_key')
                ->pluck('total', 'date_key');

            $currentDate = Carbon::parse($chartStartDate);
            $endDateObj = Carbon::parse($chartEndDate);

            $row = 5;
            while ($currentDate->lte($endDateObj)) {
                $dStr = $currentDate->toDateString();
                $inVal = (int) ($incomingByDate[$dStr] ?? 0);
                $outVal = (int) ($outgoingByDate[$dStr] ?? 0);

                $sheet1->setCellValue('A'.$row, $currentDate->format('d/m/Y'));
                $sheet1->setCellValue('B'.$row, $inVal);
                $sheet1->setCellValue('C'.$row, $outVal);

                $currentDate->addDay();
                $row++;
            }

            $lastRow = $row - 1;

            // Total Row
            $sheet1->setCellValue('A'.$row, 'TOTAL');
            $sheet1->setCellValue('B'.$row, '=SUM(B5:B'.$lastRow.')');
            $sheet1->setCellValue('C'.$row, '=SUM(C5:C'.$lastRow.')');
            $sheet1->getStyle('A'.$row.':C'.$row)->getFont()->setBold(true);
            $sheet1->getStyle('A'.$row.':C'.$row)->getBorders()->getTop()->setBorderStyle(Border::BORDER_THIN);
            $sheet1->getStyle('A'.$row.':C'.$row)->getBorders()->getBottom()->setBorderStyle(Border::BORDER_DOUBLE);

            // Native Excel Area Chart
            if ($lastRow >= 5) {
                $dataSeriesLabels = [
                    new DataSeriesValues(DataSeriesValues::DATASERIES_TYPE_STRING, "'Grafik & Ringkasan'!\$B\$4", null, 1),
                    new DataSeriesValues(DataSeriesValues::DATASERIES_TYPE_STRING, "'Grafik & Ringkasan'!\$C\$4", null, 1),
                ];

                $xAxisTickValues = [
                    new DataSeriesValues(DataSeriesValues::DATASERIES_TYPE_STRING, "'Grafik & Ringkasan'!\$A\$5:\$A\$".$lastRow, null, $lastRow - 4),
                ];

                $dataSeriesValues = [
                    new DataSeriesValues(DataSeriesValues::DATASERIES_TYPE_NUMBER, "'Grafik & Ringkasan'!\$B\$5:\$B\$".$lastRow, null, $lastRow - 4),
                    new DataSeriesValues(DataSeriesValues::DATASERIES_TYPE_NUMBER, "'Grafik & Ringkasan'!\$C\$5:\$C\$".$lastRow, null, $lastRow - 4),
                ];

                $series = new DataSeries(
                    DataSeries::TYPE_AREACHART,
                    DataSeries::GROUPING_STANDARD,
                    range(0, count($dataSeriesValues) - 1),
                    $dataSeriesLabels,
                    $xAxisTickValues,
                    $dataSeriesValues
                );

                $plotArea = new PlotArea(null, [$series]);
                $legend = new Legend(Legend::POSITION_TOP, null, false);
                $title = new Title('Grafik Tren Transaksi Barang Masuk & Keluar');

                $chart = new Chart(
                    'chart_trend',
                    $title,
                    $legend,
                    $plotArea,
                    true,
                    DataSeries::EMPTY_AS_GAP,
                    null,
                    null
                );

                $chart->setTopLeftPosition('E4');
                $chart->setBottomRightPosition('N22');

                $sheet1->addChart($chart);
            }

            foreach (['A', 'B', 'C'] as $col) {
                $sheet1->getColumnDimension($col)->setAutoSize(true);
            }

            // --- SHEET 2: LAPORAN SESUAI REPORT TYPE ---
            $sheet2 = $spreadsheet->createSheet();
            $sheet2->setShowGridLines(true);

            if ($reportType === 'incoming') {
                $sheet2->setTitle('Barang Masuk');
                $sheet2->mergeCells('A1:F1');
                $sheet2->setCellValue('A1', 'LAPORAN TRANSAKSI BARANG MASUK');
                $sheet2->getStyle('A1')->getFont()->setBold(true)->setSize(13)->setColor(new Color(Color::COLOR_WHITE));
                $sheet2->getStyle('A1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('0F172A');
                $sheet2->getRowDimension(1)->setRowHeight(28);

                $sheet2->setCellValue('A2', 'Periode: '.$startDate.' s/d '.$endDate);
                $sheet2->getStyle('A2')->getFont()->setItalic(true)->setColor(new Color('64748B'));

                $sheet2->fromArray(['No. Referensi / Nota', 'Tanggal & Waktu', 'Kode Barang', 'Nama Sparepart', 'Jumlah Masuk', 'Supplier / Pemasok'], null, 'A4');
                $sheet2->getStyle('A4:F4')->getFont()->setBold(true)->setColor(new Color(Color::COLOR_WHITE));
                $sheet2->getStyle('A4:F4')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('1E293B');

                $incomingItems = IncomingItem::with(['item.category', 'item.unit'])
                    ->whereBetween('date', [$startDate.' 00:00:00', $endDate.' 23:59:59'])
                    ->latest('date')
                    ->get();

                $r2 = 5;
                $totIn = 0;
                foreach ($incomingItems as $tx) {
                    $totIn += $tx->quantity;
                    $sheet2->setCellValue('A'.$r2, $tx->reference_no);
                    $sheet2->setCellValue('B'.$r2, Carbon::parse($tx->date)->format('d/m/Y H:i'));
                    $sheet2->setCellValue('C'.$r2, $tx->item?->item_code ?? '-');
                    $sheet2->setCellValue('D'.$r2, $tx->item?->name ?? '-');
                    $sheet2->setCellValue('E'.$r2, $tx->quantity);
                    $sheet2->setCellValue('F'.$r2, $tx->supplier ?? '-');
                    $r2++;
                }

                $sheet2->setCellValue('A'.$r2, 'TOTAL BARANG MASUK');
                $sheet2->mergeCells('A'.$r2.':D'.$r2);
                $sheet2->setCellValue('E'.$r2, '=SUM(E5:E'.($r2 - 1).')');
                $sheet2->getStyle('A'.$r2.':F'.$r2)->getFont()->setBold(true);
                $sheet2->getStyle('A'.$r2.':F'.$r2)->getBorders()->getTop()->setBorderStyle(Border::BORDER_THIN);
                $sheet2->getStyle('A'.$r2.':F'.$r2)->getBorders()->getBottom()->setBorderStyle(Border::BORDER_DOUBLE);

                foreach (['A', 'B', 'C', 'D', 'E', 'F'] as $col) {
                    $sheet2->getColumnDimension($col)->setAutoSize(true);
                }
            } elseif ($reportType === 'outgoing') {
                $sheet2->setTitle('Barang Keluar');
                $sheet2->mergeCells('A1:F1');
                $sheet2->setCellValue('A1', 'LAPORAN TRANSAKSI BARANG KELUAR');
                $sheet2->getStyle('A1')->getFont()->setBold(true)->setSize(13)->setColor(new Color(Color::COLOR_WHITE));
                $sheet2->getStyle('A1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('0F172A');
                $sheet2->getRowDimension(1)->setRowHeight(28);

                $sheet2->setCellValue('A2', 'Periode: '.$startDate.' s/d '.$endDate);
                $sheet2->getStyle('A2')->getFont()->setItalic(true)->setColor(new Color('64748B'));

                $sheet2->fromArray(['No. Bon / Referensi', 'Tanggal & Waktu', 'Kode Barang', 'Nama Sparepart', 'Jumlah Keluar', 'Penerima / Peruntukan'], null, 'A4');
                $sheet2->getStyle('A4:F4')->getFont()->setBold(true)->setColor(new Color(Color::COLOR_WHITE));
                $sheet2->getStyle('A4:F4')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('1E293B');

                $outgoingItems = OutgoingItem::with(['item.category', 'item.unit'])
                    ->whereBetween('date', [$startDate.' 00:00:00', $endDate.' 23:59:59'])
                    ->latest('date')
                    ->get();

                $r2 = 5;
                foreach ($outgoingItems as $tx) {
                    $sheet2->setCellValue('A'.$r2, $tx->reference_no);
                    $sheet2->setCellValue('B'.$r2, Carbon::parse($tx->date)->format('d/m/Y H:i'));
                    $sheet2->setCellValue('C'.$r2, $tx->item?->item_code ?? '-');
                    $sheet2->setCellValue('D'.$r2, $tx->item?->name ?? '-');
                    $sheet2->setCellValue('E'.$r2, $tx->quantity);
                    $sheet2->setCellValue('F'.$r2, $tx->recipient ?? '-');
                    $r2++;
                }

                $sheet2->setCellValue('A'.$r2, 'TOTAL BARANG KELUAR');
                $sheet2->mergeCells('A'.$r2.':D'.$r2);
                $sheet2->setCellValue('E'.$r2, '=SUM(E5:E'.($r2 - 1).')');
                $sheet2->getStyle('A'.$r2.':F'.$r2)->getFont()->setBold(true);
                $sheet2->getStyle('A'.$r2.':F'.$r2)->getBorders()->getTop()->setBorderStyle(Border::BORDER_THIN);
                $sheet2->getStyle('A'.$r2.':F'.$r2)->getBorders()->getBottom()->setBorderStyle(Border::BORDER_DOUBLE);

                foreach (['A', 'B', 'C', 'D', 'E', 'F'] as $col) {
                    $sheet2->getColumnDimension($col)->setAutoSize(true);
                }
            } else {
                $sheet2->setTitle('Data Sparepart');
                $sheet2->mergeCells('A1:G1');
                $sheet2->setCellValue('A1', 'MASTER SPAREPART & STATUS STOK GUDANG');
                $sheet2->getStyle('A1')->getFont()->setBold(true)->setSize(13)->setColor(new Color(Color::COLOR_WHITE));
                $sheet2->getStyle('A1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('0F172A');
                $sheet2->getRowDimension(1)->setRowHeight(28);

                $sheet2->fromArray(['Kode Barang', 'Nama Sparepart', 'Kategori', 'Satuan', 'Sisa Stok', 'Stok Min', 'Status Stok'], null, 'A3');
                $sheet2->getStyle('A3:G3')->getFont()->setBold(true)->setColor(new Color(Color::COLOR_WHITE));
                $sheet2->getStyle('A3:G3')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('1E293B');

                $items = Item::with(['category', 'unit'])->orderBy('name')->get();
                $r2 = 4;
                foreach ($items as $item) {
                    $isLow = $item->stock <= $item->min_stock;
                    $sheet2->setCellValue('A'.$r2, $item->item_code);
                    $sheet2->setCellValue('B'.$r2, $item->name);
                    $sheet2->setCellValue('C'.$r2, $item->category?->name ?? '-');
                    $sheet2->setCellValue('D'.$r2, $item->unit?->name ?? '-');
                    $sheet2->setCellValue('E'.$r2, $item->stock);
                    $sheet2->setCellValue('F'.$r2, $item->min_stock);
                    $sheet2->setCellValue('G'.$r2, $isLow ? 'KRITIS' : 'AMAN');

                    if ($isLow) {
                        $sheet2->getStyle('G'.$r2)->getFont()->setBold(true)->setColor(new Color('DC2626'));
                    } else {
                        $sheet2->getStyle('G'.$r2)->getFont()->setColor(new Color('16A34A'));
                    }
                    $r2++;
                }

                foreach (['A', 'B', 'C', 'D', 'E', 'F', 'G'] as $col) {
                    $sheet2->getColumnDimension($col)->setAutoSize(true);
                }
            }

            $fileName = 'Laporan_Gudang_Diesel_'.now()->format('Ymd_His').'.xlsx';

            return response()->streamDownload(function () use ($spreadsheet) {
                $writer = new Xlsx($spreadsheet);
                $writer->setIncludeCharts(true);
                $writer->save('php://output');
            }, $fileName, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Cache-Control' => 'max-age=0',
            ]);
        } catch (Throwable $e) {
            Log::error('Error exporting Excel report: '.$e->getMessage());
            throw $e;
        }
    }
}
