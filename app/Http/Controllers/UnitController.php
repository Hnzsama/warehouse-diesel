<?php

namespace App\Http\Controllers;

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

class UnitController extends Controller
{
    /**
     * Display a listing of units.
     */
    public function index(): Response
    {
        try {
            $units = Unit::withCount('items')->orderBy('name')->paginate(10)->withQueryString();

            return Inertia::render('Units/Index', [
                'units' => $units,
            ]);
        } catch (Throwable $e) {
            Log::error('Error loading units list: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Store a newly created unit.
     */
    public function store(Request $request): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:50', 'unique:units,name'],
                'short_name' => ['required', 'string', 'max:20'],
            ]);

            DB::transaction(function () use ($validated) {
                Unit::create($validated);
            });

            return redirect()->back()->with('success', 'Satuan barang berhasil ditambahkan.');
        } catch (ValidationException $e) {
            throw $e;
        } catch (Throwable $e) {
            Log::error('Error storing unit: '.$e->getMessage());

            return redirect()->back()->with('error', 'Gagal menambahkan satuan barang: '.$e->getMessage());
        }
    }

    /**
     * Update the specified unit.
     */
    public function update(Request $request, Unit $unit): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:50', Rule::unique('units', 'name')->ignore($unit->id)],
                'short_name' => ['required', 'string', 'max:20'],
            ]);

            DB::transaction(function () use ($unit, $validated) {
                $unit->update($validated);
            });

            return redirect()->back()->with('success', 'Satuan barang berhasil diperbarui.');
        } catch (ValidationException $e) {
            throw $e;
        } catch (Throwable $e) {
            Log::error('Error updating unit: '.$e->getMessage());

            return redirect()->back()->with('error', 'Gagal memperbarui satuan barang: '.$e->getMessage());
        }
    }

    /**
     * Remove the specified unit.
     */
    public function destroy(Unit $unit): RedirectResponse
    {
        try {
            DB::transaction(function () use ($unit) {
                $unit->delete();
            });

            return redirect()->back()->with('success', 'Satuan barang berhasil dihapus.');
        } catch (Throwable $e) {
            Log::error('Error deleting unit: '.$e->getMessage());

            return redirect()->back()->with('error', 'Gagal menghapus satuan barang: '.$e->getMessage());
        }
    }
}
