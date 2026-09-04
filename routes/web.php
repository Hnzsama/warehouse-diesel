<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\IncomingItemController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\OutgoingItemController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\StockAdjustmentController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('dashboard');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard (Semua Peran / Role)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Transaksi Barang Masuk & Keluar (Admin, Pemilik, & Staf Operasional)
    Route::middleware(['role:admin|pemilik|staf_operasional'])->group(function () {
        Route::resource('incoming-items', IncomingItemController::class)->except(['create', 'edit', 'show']);
        Route::resource('outgoing-items', OutgoingItemController::class)->except(['create', 'edit', 'show']);
    });

    // Penyesuaian Stok & Cek Barang Rusak (Admin, Pemilik, & Admin QC)
    Route::middleware(['role:admin|pemilik|admin_qc'])->group(function () {
        Route::resource('stock-adjustments', StockAdjustmentController::class)->only(['index', 'store', 'destroy']);
    });

    // Master Data Sparepart (Admin Utama, Pemilik, & Admin QC)
    Route::middleware(['role:admin|pemilik|admin_qc'])->group(function () {
        Route::resource('items', ItemController::class)->except(['create', 'edit', 'show']);
    });

    // Kategori, Satuan, & Pengguna (Admin Utama & Pemilik)
    Route::middleware(['role:admin|pemilik'])->group(function () {
        Route::resource('categories', CategoryController::class)->except(['create', 'edit', 'show']);
        Route::resource('units', UnitController::class)->except(['create', 'edit', 'show']);
        Route::resource('users', UserController::class)->except(['create', 'edit', 'show']);
    });

    // Laporan Persediaan (Admin Utama & Pemilik)
    Route::middleware(['role:admin|pemilik'])->group(function () {
        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/print', [ReportController::class, 'print'])->name('reports.print');
        Route::get('/reports/export-excel', [ReportController::class, 'exportExcel'])->name('reports.export-excel');
    });
});

require __DIR__.'/settings.php';
