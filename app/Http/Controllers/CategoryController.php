<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories.
     */
    public function index(): Response
    {
        try {
            $categories = Category::withCount('items')->orderBy('name')->paginate(10)->withQueryString();

            return Inertia::render('Categories/Index', [
                'categories' => $categories,
            ]);
        } catch (Throwable $e) {
            Log::error('Error loading categories list: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Store a newly created category.
     */
    public function store(Request $request): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:100', 'unique:categories,name'],
            ]);

            $validated['slug'] = Str::slug($validated['name']);

            DB::transaction(function () use ($validated) {
                Category::create($validated);
            });

            return redirect()->back()->with('success', 'Kategori berhasil ditambahkan.');
        } catch (ValidationException $e) {
            throw $e;
        } catch (Throwable $e) {
            Log::error('Error storing category: '.$e->getMessage());

            return redirect()->back()->with('error', 'Gagal menambahkan kategori: '.$e->getMessage());
        }
    }

    /**
     * Update the specified category.
     */
    public function update(Request $request, Category $category): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:100', Rule::unique('categories', 'name')->ignore($category->id)],
            ]);

            $validated['slug'] = Str::slug($validated['name']);

            DB::transaction(function () use ($category, $validated) {
                $category->update($validated);
            });

            return redirect()->back()->with('success', 'Kategori berhasil diperbarui.');
        } catch (ValidationException $e) {
            throw $e;
        } catch (Throwable $e) {
            Log::error('Error updating category: '.$e->getMessage());

            return redirect()->back()->with('error', 'Gagal memperbarui kategori: '.$e->getMessage());
        }
    }

    /**
     * Remove the specified category.
     */
    public function destroy(Category $category): RedirectResponse
    {
        try {
            DB::transaction(function () use ($category) {
                $category->delete();
            });

            return redirect()->back()->with('success', 'Kategori berhasil dihapus.');
        } catch (Throwable $e) {
            Log::error('Error deleting category: '.$e->getMessage());

            return redirect()->back()->with('error', 'Gagal menghapus kategori: '.$e->getMessage());
        }
    }
}
