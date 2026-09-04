<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Item;
use App\Models\Unit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ItemController extends Controller
{
    /**
     * Display a listing of sparepart items.
     */
    public function index(Request $request): Response
    {
        try {
            $search = $request->input('search');
            $categoryId = $request->input('category_id');
            $unitId = $request->input('unit_id');
            $stockStatus = $request->input('stock_status');
            $trashed = $request->input('trashed');

            $query = Item::with(['category', 'unit'])->withCount(['incomingItems', 'outgoingItems']);

            if ($trashed === 'only') {
                $query->onlyTrashed();
            } elseif ($trashed === 'with') {
                $query->withTrashed();
            }

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('item_code', 'like', "%{$search}%")
                        ->orWhere('rack_location', 'like', "%{$search}%");
                });
            }

            if ($categoryId) {
                $query->where('category_id', $categoryId);
            }

            if ($unitId) {
                $query->where('unit_id', $unitId);
            }

            if ($stockStatus === 'low') {
                $query->whereColumn('stock', '<=', 'min_stock');
            }

            $items = $query->orderBy('name', 'asc')->paginate(10)->withQueryString();

            return Inertia::render('Items/Index', [
                'items' => $items,
                'categories' => Category::orderBy('name')->get(),
                'units' => Unit::orderBy('name')->get(),
                'filters' => [
                    'search' => $search,
                    'category_id' => $categoryId,
                    'unit_id' => $unitId,
                    'stock_status' => $stockStatus,
                    'trashed' => $trashed,
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('Error loading items list: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Store a newly created sparepart item.
     */
    public function store(Request $request): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'item_code' => ['required', 'string', 'max:50', 'unique:items,item_code'],
                'name' => ['required', 'string', 'max:150'],
                'category_id' => ['required', 'exists:categories,id'],
                'unit_id' => ['required', 'exists:units,id'],
                'stock' => ['required', 'integer', 'min:0'],
                'min_stock' => ['required', 'integer', 'min:0'],
                'rack_location' => ['nullable', 'string', 'max:50'],
            ]);

            DB::transaction(function () use ($validated) {
                Item::create($validated);
            });

            return redirect()->back()->with('success', 'Data sparepart berhasil ditambahkan.');
        } catch (ValidationException $e) {
            throw $e;
        } catch (Throwable $e) {
            Log::error('Error storing item: '.$e->getMessage());

            return redirect()->back()->with('error', 'Gagal menambahkan data sparepart: '.$e->getMessage());
        }
    }

    /**
     * Update the specified sparepart item.
     */
    public function update(Request $request, Item $item): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'item_code' => ['required', 'string', 'max:50', Rule::unique('items', 'item_code')->ignore($item->id)],
                'name' => ['required', 'string', 'max:150'],
                'category_id' => ['required', 'exists:categories,id'],
                'unit_id' => ['required', 'exists:units,id'],
                'stock' => ['required', 'integer', 'min:0'],
                'min_stock' => ['required', 'integer', 'min:0'],
                'rack_location' => ['nullable', 'string', 'max:50'],
            ]);

            // Lock manual stock override if item already has incoming/outgoing transactions
            $hasTransactions = $item->incomingItems()->exists() || $item->outgoingItems()->exists();
            if ($hasTransactions) {
                $validated['stock'] = $item->stock;
            }

            DB::transaction(function () use ($item, $validated) {
                $item->update($validated);
            });

            return redirect()->back()->with('success', 'Data sparepart berhasil diperbarui.');
        } catch (ValidationException $e) {
            throw $e;
        } catch (Throwable $e) {
            Log::error('Error updating item: '.$e->getMessage());

            return redirect()->back()->with('error', 'Gagal memperbarui data sparepart: '.$e->getMessage());
        }
    }

    /**
     * Remove the specified sparepart item (Soft Delete).
     */
    public function destroy(Item $item): RedirectResponse
    {
        try {
            DB::transaction(function () use ($item) {
                $item->delete();
            });

            return redirect()->back()->with('success', 'Data sparepart berhasil dihapus (Soft Delete).');
        } catch (Throwable $e) {
            Log::error('Error deleting item: '.$e->getMessage());

            return redirect()->back()->with('error', 'Gagal menghapus data sparepart: '.$e->getMessage());
        }
    }

    /**
     * Restore the specified soft-deleted sparepart item.
     */
    public function restore(int $id): RedirectResponse
    {
        try {
            $item = Item::onlyTrashed()->findOrFail($id);
            $item->restore();

            return redirect()->back()->with('success', "Data sparepart '{$item->name}' berhasil dipulihkan (restore).");
        } catch (Throwable $e) {
            Log::error('Error restoring item: '.$e->getMessage());

            return redirect()->back()->with('error', 'Gagal memulihkan data sparepart: '.$e->getMessage());
        }
    }
}
