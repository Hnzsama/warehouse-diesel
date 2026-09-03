<?php

namespace App\Http\Controllers;

use App\Helpers\ReferenceNumberGenerator;
use App\Models\Item;
use App\Models\StockAdjustment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class StockAdjustmentController extends Controller
{
    /**
     * Display a listing of stock adjustments.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $query = StockAdjustment::with(['item.category', 'item.unit', 'user']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('reference_no', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%")
                    ->orWhereHas('item', function ($iq) use ($search) {
                        $iq->where('name', 'like', "%{$search}%")
                            ->orWhere('item_code', 'like', "%{$search}%");
                    });
            });
        }

        if ($startDate && $endDate) {
            $query->whereBetween('date', [$startDate.' 00:00:00', $endDate.' 23:59:59']);
        }

        $adjustments = $query->latest('date')->latest('id')->paginate(10)->withQueryString();

        $items = Item::with(['category', 'unit'])->orderBy('name')->get();
        $autoRef = ReferenceNumberGenerator::generateAdjustmentRef();

        return Inertia::render('StockAdjustments/Index', [
            'adjustments' => $adjustments,
            'items' => $items,
            'autoRef' => $autoRef,
            'filters' => [
                'search' => $search,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    /**
     * Store a newly created stock adjustment and adjust item stock level.
     */
    public function store(Request $request): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'reference_no' => ['required', 'string', 'max:50', 'unique:stock_adjustments,reference_no'],
                'item_id' => ['required', 'exists:items,id'],
                'type' => ['required', 'in:addition,reduction'],
                'quantity' => ['required', 'integer', 'min:1'],
                'reason' => ['required', 'string', 'in:damaged,lost,opname_difference,other'],
                'notes' => ['nullable', 'string'],
                'date' => ['required', 'date'],
            ]);

            if (empty($validated['reference_no'])) {
                $validated['reference_no'] = ReferenceNumberGenerator::generateAdjustmentRef();
            }

            DB::transaction(function () use ($validated, $request) {
                $item = Item::where('id', $validated['item_id'])->lockForUpdate()->firstOrFail();

                if ($validated['type'] === 'reduction' && $validated['quantity'] > $item->stock) {
                    throw ValidationException::withMessages([
                        'quantity' => "Pengurangan stok ({$validated['quantity']}) melebihi sisa stok yang ada ({$item->stock}).",
                    ]);
                }

                $adjustment = StockAdjustment::create([
                    ...$validated,
                    'user_id' => $request->user()->id,
                ]);

                if ($validated['type'] === 'addition') {
                    $item->increment('stock', $validated['quantity']);
                } else {
                    $item->decrement('stock', $validated['quantity']);
                }
            });

            return redirect()->back()->with('success', 'Penyesuaian stok berhasil dicatat & stok barang telah diperbarui.');
        } catch (ValidationException $e) {
            throw $e;
        } catch (Throwable $e) {
            Log::error('Error storing stock adjustment: '.$e->getMessage());

            return redirect()->back()->with('error', 'Gagal mencatat penyesuaian stok: '.$e->getMessage());
        }
    }

    /**
     * Soft delete a stock adjustment transaction and revert stock changes.
     */
    public function destroy(StockAdjustment $stockAdjustment): RedirectResponse
    {
        try {
            DB::transaction(function () use ($stockAdjustment) {
                $item = Item::where('id', $stockAdjustment->item_id)->lockForUpdate()->firstOrFail();

                if ($stockAdjustment->type === 'addition') {
                    if ($item->stock < $stockAdjustment->quantity) {
                        throw ValidationException::withMessages([
                            'adjustment' => 'Tidak dapat membatalkan penyesuaian penambahan ini karena sisa stok tidak mencukupi.',
                        ]);
                    }
                    $item->decrement('stock', $stockAdjustment->quantity);
                } else {
                    $item->increment('stock', $stockAdjustment->quantity);
                }

                $stockAdjustment->delete();
            });

            return redirect()->back()->with('success', 'Penyesuaian stok berhasil dibatalkan dan stok dikembalikan.');
        } catch (ValidationException $e) {
            throw $e;
        } catch (Throwable $e) {
            Log::error('Error deleting stock adjustment: '.$e->getMessage());

            return redirect()->back()->with('error', 'Gagal membatalkan penyesuaian stok: '.$e->getMessage());
        }
    }
}
