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
    // Dashboard (Admin & Pemilik)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Master Data Sparepart & Reference (Admin & Pemilik View, Admin CRUD)
    Route::resource('items', ItemController::class)->except(['create', 'edit', 'show']);
    Route::resource('categories', CategoryController::class)->except(['create', 'edit', 'show']);
    Route::resource('units', UnitController::class)->except(['create', 'edit', 'show']);

    // User / Admin Management (Admin Only)
    Route::resource('users', UserController::class)->except(['create', 'edit', 'show']);

    // Inventory Transactions (Admin)
    Route::resource('incoming-items', IncomingItemController::class)->except(['create', 'edit', 'show']);
    Route::resource('outgoing-items', OutgoingItemController::class)->except(['create', 'edit', 'show']);
    Route::resource('stock-adjustments', StockAdjustmentController::class)->only(['index', 'store', 'destroy']);

    // Reports (Admin & Pemilik)
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/print', [ReportController::class, 'print'])->name('reports.print');
    Route::get('/reports/export-excel', [ReportController::class, 'exportExcel'])->name('reports.export-excel');
});

require __DIR__.'/settings.php';
