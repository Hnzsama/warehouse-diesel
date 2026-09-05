<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class SupplierController extends Controller
{
    /**
     * Display a listing of suppliers.
     */
    public function index(Request $request): Response
    {
        try {
            $search = $request->input('search');

            $query = Supplier::withCount(['incomingItems', 'outgoingItems']);

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            }

            $suppliers = $query->orderBy('name')->paginate(10)->withQueryString();

            return Inertia::render('Suppliers/Index', [
                'suppliers' => $suppliers,
                'filters' => [
                    'search' => $search,
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('Error loading suppliers list: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Store a newly created supplier.
     */
    public function store(Request $request): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'code' => ['nullable', 'string', 'max:50', 'unique:suppliers,code'],
                'name' => ['required', 'string', 'max:150'],
                'phone' => ['nullable', 'string', 'max:30'],
                'email' => ['nullable', 'email', 'max:100'],
                'address' => ['nullable', 'string'],
                'notes' => ['nullable', 'string'],
            ]);

            if (empty($validated['code'])) {
                $latest = Supplier::latest('id')->first();
                $nextId = ($latest?->id ?? 0) + 1;
                $validated['code'] = 'SUP-'.str_pad((string) $nextId, 3, '0', STR_PAD_LEFT);
            }

            DB::transaction(function () use ($validated) {
                Supplier::create($validated);
            });

            return redirect()->back()->with('success', 'Supplier berhasil ditambahkan.');
        } catch (ValidationException $e) {
            throw $e;
        } catch (Throwable $e) {
            Log::error('Error storing supplier: '.$e->getMessage());

            return redirect()->back()->with('error', 'Gagal menambahkan supplier: '.$e->getMessage());
        }
    }

    /**
     * Update the specified supplier.
     */
    public function update(Request $request, Supplier $supplier): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'code' => ['required', 'string', 'max:50', Rule::unique('suppliers', 'code')->ignore($supplier->id)],
                'name' => ['required', 'string', 'max:150'],
                'phone' => ['nullable', 'string', 'max:30'],
                'email' => ['nullable', 'email', 'max:100'],
                'address' => ['nullable', 'string'],
                'notes' => ['nullable', 'string'],
            ]);

            DB::transaction(function () use ($supplier, $validated) {
                $supplier->update($validated);
            });

            return redirect()->back()->with('success', 'Supplier berhasil diperbarui.');
        } catch (ValidationException $e) {
            throw $e;
        } catch (Throwable $e) {
            Log::error('Error updating supplier: '.$e->getMessage());

            return redirect()->back()->with('error', 'Gagal memperbarui supplier: '.$e->getMessage());
        }
    }

    /**
     * Remove the specified supplier.
     */
    public function destroy(Supplier $supplier): RedirectResponse
    {
        try {
            DB::transaction(function () use ($supplier) {
                $supplier->delete();
            });

            return redirect()->back()->with('success', 'Supplier berhasil dihapus.');
        } catch (Throwable $e) {
            Log::error('Error deleting supplier: '.$e->getMessage());

            return redirect()->back()->with('error', 'Gagal menghapus supplier: '.$e->getMessage());
        }
    }

    /**
     * Export PDF report for Suppliers list.
     */
    public function exportPdf(Request $request): HttpResponse
    {
        try {
            $suppliers = Supplier::orderBy('name')->get();

            $pdf = Pdf::loadView('reports.suppliers_pdf', [
                'suppliers' => $suppliers,
                'printedAt' => now()->translatedFormat('d F Y H:i'),
                'userName' => $request->user()?->name ?? 'Admin',
            ])->setPaper('a4', 'portrait');

            $filename = 'Master_Data_Supplier_'.now()->format('Ymd_His').'.pdf';

            return $pdf->download($filename);
        } catch (Throwable $e) {
            Log::error('Error exporting Supplier PDF: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Export professional XLSX report for Suppliers list.
     */
    public function exportExcel(Request $request): StreamedResponse
    {
        try {
            $spreadsheet = new Spreadsheet;
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle('Data Supplier');
            $sheet->setShowGridLines(true);

            // Title Banner
            $sheet->mergeCells('A1:F1');
            $sheet->setCellValue('A1', 'MASTER DATA SUPPLIER & PEMASOK GUDANG DIESEL');
            $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(13)->setColor(new Color(Color::COLOR_WHITE));
            $sheet->getStyle('A1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('0F172A');
            $sheet->getRowDimension(1)->setRowHeight(28);

            $sheet->fromArray(['Kode Supplier', 'Nama Supplier', 'No. Telepon', 'Email', 'Alamat', 'Catatan'], null, 'A3');
            $sheet->getStyle('A3:F3')->getFont()->setBold(true)->setColor(new Color(Color::COLOR_WHITE));
            $sheet->getStyle('A3:F3')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('1E293B');

            $suppliers = Supplier::orderBy('name')->get();
            $r = 4;
            foreach ($suppliers as $s) {
                $sheet->setCellValue('A'.$r, $s->code);
                $sheet->setCellValue('B'.$r, $s->name);
                $sheet->setCellValue('C'.$r, $s->phone ?? '-');
                $sheet->setCellValue('D'.$r, $s->email ?? '-');
                $sheet->setCellValue('E'.$r, $s->address ?? '-');
                $sheet->setCellValue('F'.$r, $s->notes ?? '-');
                $r++;
            }

            foreach (['A', 'B', 'C', 'D', 'E', 'F'] as $col) {
                $sheet->getColumnDimension($col)->setAutoSize(true);
            }

            $fileName = 'Master_Data_Supplier_'.now()->format('Ymd_His').'.xlsx';

            return response()->streamDownload(function () use ($spreadsheet) {
                $writer = new Xlsx($spreadsheet);
                $writer->save('php://output');
            }, $fileName, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Cache-Control' => 'max-age=0',
            ]);
        } catch (Throwable $e) {
            Log::error('Error exporting Supplier Excel: '.$e->getMessage());
            throw $e;
        }
    }
}
