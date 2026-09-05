<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\IncomingItemController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\OutgoingItemController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\StockAdjustmentController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('dashboard');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard (Semua Peran / Role)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Transaksi Barang Masuk (Index & Export untuk Admin, Pemilik, & Staf Operasional)
    Route::get('/incoming-items', [IncomingItemController::class, 'index'])->middleware('role:admin|pemilik|staf_operasional')->name('incoming-items.index');
    Route::middleware(['role:admin|staf_operasional'])->group(function () {
        Route::post('/incoming-items', [IncomingItemController::class, 'store'])->name('incoming-items.store');
        Route::put('/incoming-items/{incoming_item}', [IncomingItemController::class, 'update'])->name('incoming-items.update');
        Route::delete('/incoming-items/{incoming_item}', [IncomingItemController::class, 'destroy'])->name('incoming-items.destroy');
    });

    // Transaksi Barang Keluar (Index & Export untuk Admin, Pemilik, & Staf Operasional)
    Route::get('/outgoing-items', [OutgoingItemController::class, 'index'])->middleware('role:admin|pemilik|staf_operasional')->name('outgoing-items.index');
    Route::middleware(['role:admin|staf_operasional'])->group(function () {
        Route::post('/outgoing-items', [OutgoingItemController::class, 'store'])->name('outgoing-items.store');
        Route::put('/outgoing-items/{outgoing_item}', [OutgoingItemController::class, 'update'])->name('outgoing-items.update');
        Route::delete('/outgoing-items/{outgoing_item}', [OutgoingItemController::class, 'destroy'])->name('outgoing-items.destroy');
    });

    // Penyesuaian Stok (Index untuk Admin, Pemilik, & Admin QC)
    Route::get('/stock-adjustments', [StockAdjustmentController::class, 'index'])->middleware('role:admin|pemilik|admin_qc')->name('stock-adjustments.index');
    Route::middleware(['role:admin|admin_qc'])->group(function () {
        Route::post('/stock-adjustments', [StockAdjustmentController::class, 'store'])->name('stock-adjustments.store');
        Route::delete('/stock-adjustments/{stock_adjustment}', [StockAdjustmentController::class, 'destroy'])->name('stock-adjustments.destroy');
    });

    // Master Sparepart Index (Admin Utama, Pemilik, & Admin QC)
    Route::get('/items', [ItemController::class, 'index'])->middleware('role:admin|pemilik|admin_qc')->name('items.index');
    Route::middleware(['role:admin|admin_qc'])->group(function () {
        Route::post('/items', [ItemController::class, 'store'])->name('items.store');
        Route::put('/items/{item}', [ItemController::class, 'update'])->name('items.update');
        Route::delete('/items/{item}', [ItemController::class, 'destroy'])->name('items.destroy');
        Route::post('/items/{id}/restore', [ItemController::class, 'restore'])->name('items.restore');
    });

    // Master Data Tambahan: Kategori, Satuan, Supplier, & Pengguna (Index / Export untuk Admin & Pemilik)
    Route::middleware(['role:admin|pemilik'])->group(function () {
        Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
        Route::get('/units', [UnitController::class, 'index'])->name('units.index');
        Route::get('/suppliers', [SupplierController::class, 'index'])->name('suppliers.index');
        Route::get('/suppliers/export-pdf', [SupplierController::class, 'exportPdf'])->name('suppliers.export-pdf');
        Route::get('/suppliers/export-excel', [SupplierController::class, 'exportExcel'])->name('suppliers.export-excel');
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
    });

    // Master Data Mutation (Admin Utama saja)
    Route::middleware(['role:admin'])->group(function () {
        Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

        Route::post('/units', [UnitController::class, 'store'])->name('units.store');
        Route::put('/units/{unit}', [UnitController::class, 'update'])->name('units.update');
        Route::delete('/units/{unit}', [UnitController::class, 'destroy'])->name('units.destroy');

        Route::post('/suppliers', [SupplierController::class, 'store'])->name('suppliers.store');
        Route::put('/suppliers/{supplier}', [SupplierController::class, 'update'])->name('suppliers.update');
        Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy'])->name('suppliers.destroy');

        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    });

    // Laporan Persediaan (Admin Utama, Pemilik, & Admin QC)
    Route::middleware(['role:admin|pemilik|admin_qc'])->group(function () {
        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/export-pdf', [ReportController::class, 'exportPdf'])->name('reports.export-pdf');
        Route::get('/reports/print', [ReportController::class, 'exportPdf'])->name('reports.print');
        Route::get('/reports/export-excel', [ReportController::class, 'exportExcel'])->name('reports.export-excel');
    });
});

require __DIR__.'/settings.php';
