<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
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
}
