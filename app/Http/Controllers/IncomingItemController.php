<?php

namespace App\Http\Controllers;

use App\Helpers\ImageHelper;
use App\Helpers\ReferenceNumberGenerator;
use App\Models\IncomingItem;
use App\Models\Item;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class IncomingItemController extends Controller
{
    /**
     * Display a listing of incoming item transactions.
     */
    public function index(Request $request): Response
    {
        try {
            $search = $request->input('search');
            $startDate = $request->input('start_date');
            $endDate = $request->input('end_date');
            $userId = $request->input('user_id');

            $query = IncomingItem::with(['item.category', 'item.unit', 'supplier', 'user.roles', 'editLogs.user.roles']);

            if (! $request->user()->hasAnyRole(['admin', 'pemilik'])) {
                $query->where('user_id', $request->user()->id);
            } elseif ($userId) {
                $query->where('user_id', $userId);
            }

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('reference_no', 'like', "%{$search}%")
                        ->orWhere('supplier', 'like', "%{$search}%")
                        ->orWhereHas('supplier', function ($sq) use ($search) {
                            $sq->where('name', 'like', "%{$search}%")
                                ->orWhere('code', 'like', "%{$search}%");
                        })
                        ->orWhereHas('item', function ($iq) use ($search) {
                            $iq->where('name', 'like', "%{$search}%")
                                ->orWhere('item_code', 'like', "%{$search}%");
                        });
                });
            }

            if ($startDate && $endDate) {
                $query->whereBetween('date', [$startDate, $endDate]);
            }

            $incomingItems = $query->latest('date')->latest('id')->paginate(10)->withQueryString();

            $items = Item::with(['category', 'unit'])->orderBy('name')->get();
            $suppliers = Supplier::orderBy('name')->get();
            $users = User::with('roles')->orderBy('name')->get();

            return Inertia::render('IncomingItems/Index', [
                'incomingItems' => $incomingItems,
                'items' => $items,
                'suppliers' => $suppliers,
                'users' => $users,
                'filters' => [
                    'search' => $search,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'user_id' => $userId,
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('Error loading incoming items list: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Store a newly created incoming item transaction and increase item stock.
     */
    public function store(Request $request): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'reference_no' => ['required', 'string', 'max:50', 'unique:incoming_items,reference_no'],
                'item_id' => ['required', 'exists:items,id'],
                'supplier_id' => ['nullable', 'exists:suppliers,id'],
                'quantity' => ['required', 'integer', 'min:1'],
                'date' => ['required', 'date'],
                'supplier' => ['nullable', 'string', 'max:100'],
                'notes' => ['nullable', 'string'],
                'invoice_image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
            ]);

            if (! empty($validated['supplier_id'])) {
                $supplierObj = Supplier::find($validated['supplier_id']);
                if ($supplierObj) {
                    $validated['supplier'] = $supplierObj->name;
                }
            }

            if (empty($validated['reference_no'])) {
                $validated['reference_no'] = ReferenceNumberGenerator::generateIncomingRef();
            }

            if ($request->hasFile('invoice_image')) {
                $path = ImageHelper::compressAndStore($request->file('invoice_image'), 'receipts');
                $validated['invoice_image'] = $path;
            }

            DB::transaction(function () use ($validated, $request) {
                $incomingItem = IncomingItem::create([
                    ...$validated,
                    'user_id' => $request->user()->id,
                ]);

                // Increment item stock automatically
                Item::where('id', $incomingItem->item_id)->increment('stock', $incomingItem->quantity);
            });

            return redirect()->back()->with('success', 'Transaksi barang masuk berhasil dicatat & stok bertambah.');
        } catch (ValidationException $e) {
            throw $e;
        } catch (Throwable $e) {
            Log::error('Error storing incoming item transaction: '.$e->getMessage());

            return redirect()->back()->with('error', 'Gagal mencatat transaksi barang masuk: '.$e->getMessage());
        }
    }

    /**
     * Update the specified incoming item transaction and reconcile stock.
     */
    public function update(Request $request, IncomingItem $incomingItem): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'reference_no' => ['required', 'string', 'max:50', 'unique:incoming_items,reference_no,'.$incomingItem->id],
                'item_id' => ['required', 'exists:items,id'],
                'supplier_id' => ['nullable', 'exists:suppliers,id'],
                'quantity' => ['required', 'integer', 'min:1'],
                'date' => ['required', 'date'],
                'supplier' => ['nullable', 'string', 'max:100'],
                'notes' => ['nullable', 'string'],
                'invoice_image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
            ]);

            if (! empty($validated['supplier_id'])) {
                $supplierObj = Supplier::find($validated['supplier_id']);
                if ($supplierObj) {
                    $validated['supplier'] = $supplierObj->name;
                }
            }

            if ($request->hasFile('invoice_image')) {
                if ($incomingItem->invoice_image) {
                    Storage::disk('public')->delete($incomingItem->invoice_image);
                }
                $path = ImageHelper::compressAndStore($request->file('invoice_image'), 'receipts');
                $validated['invoice_image'] = $path;
            } else {
                unset($validated['invoice_image']);
            }

            DB::transaction(function () use ($incomingItem, $validated, $request) {
                // 1. Revert previous stock increment on original item
                $oldItem = Item::where('id', $incomingItem->item_id)->lockForUpdate()->firstOrFail();
                if ($oldItem->stock < $incomingItem->quantity) {
                    throw ValidationException::withMessages([
                        'quantity' => "Tidak dapat mengubah transaksi: sisa stok barang ({$oldItem->stock}) lebih kecil dari kuantitas transaksi awal ({$incomingItem->quantity}).",
                    ]);
                }
                $oldItem->decrement('stock', $incomingItem->quantity);

                // 2. Increment stock on new/target item
                $newItem = $incomingItem->item_id == $validated['item_id']
                    ? $oldItem
                    : Item::where('id', $validated['item_id'])->lockForUpdate()->firstOrFail();

                $newItem->increment('stock', $validated['quantity']);

                // 3. Update incoming item transaction
                $incomingItem->update($validated);

                // 4. Record edit audit log entry
                $incomingItem->editLogs()->create([
                    'user_id' => $request->user()->id,
                    'notes' => 'Diperbarui oleh '.$request->user()->name,
                ]);
            });

            return redirect()->back()->with('success', 'Transaksi barang masuk berhasil diperbarui & stok disesuaikan.');
        } catch (ValidationException $e) {
            throw $e;
        } catch (Throwable $e) {
            Log::error('Error updating incoming item transaction: '.$e->getMessage());

            return redirect()->back()->with('error', 'Gagal memperbarui transaksi barang masuk: '.$e->getMessage());
        }
    }

    /**
     * Remove the specified incoming item transaction and adjust stock.
     */
    public function destroy(IncomingItem $incomingItem): RedirectResponse
    {
        try {
            DB::transaction(function () use ($incomingItem) {
                $item = Item::where('id', $incomingItem->item_id)->lockForUpdate()->firstOrFail();

                if ($item->stock < $incomingItem->quantity) {
                    throw ValidationException::withMessages([
                        'quantity' => "Tidak dapat menghapus transaksi ini: stok tersisa ({$item->stock}) lebih kecil dari kuantitas transaksi ({$incomingItem->quantity}).",
                    ]);
                }

                if ($incomingItem->invoice_image) {
                    Storage::disk('public')->delete($incomingItem->invoice_image);
                }

                $item->decrement('stock', $incomingItem->quantity);
                $incomingItem->delete();
            });

            return redirect()->back()->with('success', 'Transaksi barang masuk berhasil dihapus & stok dikurangi.');
        } catch (ValidationException $e) {
            throw $e;
        } catch (Throwable $e) {
            Log::error('Error deleting incoming item transaction: '.$e->getMessage());

            return redirect()->back()->with('error', 'Gagal menghapus transaksi barang masuk: '.$e->getMessage());
        }
    }
}
