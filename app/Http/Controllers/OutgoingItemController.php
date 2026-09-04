<?php

namespace App\Http\Controllers;

use App\Helpers\ImageHelper;
use App\Helpers\ReferenceNumberGenerator;
use App\Models\Item;
use App\Models\OutgoingItem;
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

class OutgoingItemController extends Controller
{
    /**
     * Display a listing of outgoing item transactions.
     */
    public function index(Request $request): Response
    {
        try {
            $search = $request->input('search');
            $startDate = $request->input('start_date');
            $endDate = $request->input('end_date');
            $userId = $request->input('user_id');

            $query = OutgoingItem::with(['item.category', 'item.unit', 'supplier', 'user.roles', 'editLogs.user.roles']);

            if (! $request->user()->hasAnyRole(['admin', 'pemilik'])) {
                $query->where('user_id', $request->user()->id);
            } elseif ($userId) {
                $query->where('user_id', $userId);
            }

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('reference_no', 'like', "%{$search}%")
                        ->orWhere('recipient', 'like', "%{$search}%")
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

            $outgoingItems = $query->latest('date')->latest('id')->paginate(10)->withQueryString();

            $items = Item::with(['category', 'unit'])->orderBy('name')->get();
            $suppliers = Supplier::orderBy('name')->get();
            $users = User::with('roles')->orderBy('name')->get();

            return Inertia::render('OutgoingItems/Index', [
                'outgoingItems' => $outgoingItems,
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
            Log::error('Error loading outgoing items list: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Store a newly created outgoing item transaction and decrease item stock.
     */
    public function store(Request $request): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'reference_no' => ['required', 'string', 'max:50', 'unique:outgoing_items,reference_no'],
                'item_id' => ['required', 'exists:items,id'],
                'supplier_id' => ['nullable', 'exists:suppliers,id'],
                'quantity' => ['required', 'integer', 'min:1'],
                'date' => ['required', 'date'],
                'recipient' => ['nullable', 'string', 'max:100'],
                'notes' => ['nullable', 'string'],
                'invoice_image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
            ]);

            if (empty($validated['reference_no'])) {
                $validated['reference_no'] = ReferenceNumberGenerator::generateOutgoingRef();
            }

            if ($request->hasFile('invoice_image')) {
                $path = ImageHelper::compressAndStore($request->file('invoice_image'), 'receipts');
                $validated['invoice_image'] = $path;
            }

            DB::transaction(function () use ($validated, $request) {
                $item = Item::where('id', $validated['item_id'])->lockForUpdate()->firstOrFail();

                if ($validated['quantity'] > $item->stock) {
                    throw ValidationException::withMessages([
                        'quantity' => "Jumlah barang keluar ({$validated['quantity']}) melebihi sisa stok yang tersedia ({$item->stock}).",
                    ]);
                }

                $outgoingItem = OutgoingItem::create([
                    ...$validated,
                    'user_id' => $request->user()->id,
                ]);

                // Decrement item stock automatically
                $item->decrement('stock', $outgoingItem->quantity);
            });

            return redirect()->back()->with('success', 'Transaksi barang keluar berhasil dicatat & stok berkurang.');
        } catch (ValidationException $e) {
            throw $e;
        } catch (Throwable $e) {
            Log::error('Error storing outgoing item transaction: '.$e->getMessage());

            return redirect()->back()->with('error', 'Gagal mencatat transaksi barang keluar: '.$e->getMessage());
        }
    }

    /**
     * Update the specified outgoing item transaction and reconcile stock.
     */
    public function update(Request $request, OutgoingItem $outgoingItem): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'reference_no' => ['required', 'string', 'max:50', 'unique:outgoing_items,reference_no,'.$outgoingItem->id],
                'item_id' => ['required', 'exists:items,id'],
                'supplier_id' => ['nullable', 'exists:suppliers,id'],
                'quantity' => ['required', 'integer', 'min:1'],
                'date' => ['required', 'date'],
                'recipient' => ['nullable', 'string', 'max:100'],
                'notes' => ['nullable', 'string'],
                'invoice_image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
            ]);

            if ($request->hasFile('invoice_image')) {
                if ($outgoingItem->invoice_image) {
                    Storage::disk('public')->delete($outgoingItem->invoice_image);
                }
                $path = ImageHelper::compressAndStore($request->file('invoice_image'), 'receipts');
                $validated['invoice_image'] = $path;
            } else {
                unset($validated['invoice_image']);
            }

            DB::transaction(function () use ($outgoingItem, $validated, $request) {
                // 1. Revert previous stock deduction on original item
                $oldItem = Item::where('id', $outgoingItem->item_id)->lockForUpdate()->firstOrFail();
                $oldItem->increment('stock', $outgoingItem->quantity);

                // 2. Check if new item has enough stock
                $newItem = $outgoingItem->item_id == $validated['item_id']
                    ? $oldItem
                    : Item::where('id', $validated['item_id'])->lockForUpdate()->firstOrFail();

                if ($validated['quantity'] > $newItem->stock) {
                    throw ValidationException::withMessages([
                        'quantity' => "Jumlah barang keluar ({$validated['quantity']}) melebihi sisa stok yang tersedia ({$newItem->stock}).",
                    ]);
                }

                $newItem->decrement('stock', $validated['quantity']);

                // 3. Update outgoing item transaction
                $outgoingItem->update($validated);

                // 4. Record edit audit log entry
                $outgoingItem->editLogs()->create([
                    'user_id' => $request->user()->id,
                    'notes' => 'Diperbarui oleh '.$request->user()->name,
                ]);
            });

            return redirect()->back()->with('success', 'Transaksi barang keluar berhasil diperbarui & stok disesuaikan.');
        } catch (ValidationException $e) {
            throw $e;
        } catch (Throwable $e) {
            Log::error('Error updating outgoing item transaction: '.$e->getMessage());

            return redirect()->back()->with('error', 'Gagal memperbarui transaksi barang keluar: '.$e->getMessage());
        }
    }

    /**
     * Remove the specified outgoing item transaction and restore stock.
     */
    public function destroy(OutgoingItem $outgoingItem): RedirectResponse
    {
        try {
            DB::transaction(function () use ($outgoingItem) {
                $item = Item::where('id', $outgoingItem->item_id)->lockForUpdate()->firstOrFail();

                if ($outgoingItem->invoice_image) {
                    Storage::disk('public')->delete($outgoingItem->invoice_image);
                }

                $item->increment('stock', $outgoingItem->quantity);
                $outgoingItem->delete();
            });

            return redirect()->back()->with('success', 'Transaksi barang keluar berhasil dihapus & stok dikembalikan.');
        } catch (ValidationException $e) {
            throw $e;
        } catch (Throwable $e) {
            Log::error('Error deleting outgoing item transaction: '.$e->getMessage());

            return redirect()->back()->with('error', 'Gagal menghapus transaksi barang keluar: '.$e->getMessage());
        }
    }
}
