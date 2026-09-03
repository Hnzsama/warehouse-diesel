<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\IncomingItem;
use App\Models\Item;
use App\Models\OutgoingItem;
use App\Models\Unit;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class DashboardController extends Controller
{
    /**
     * Display the warehouse inventory dashboard.
     */
    public function index(Request $request): Response
    {
        try {
            $period = $request->input('period', 'today'); // 'today', 'weekly', 'monthly', 'custom'
            $startDateInput = $request->input('start_date');
            $endDateInput = $request->input('end_date');

            if ($period === 'today') {
                $startDate = now()->toDateString();
                $endDate = now()->toDateString();
            } elseif ($period === 'weekly') {
                $startDate = now()->subDays(6)->toDateString();
                $endDate = now()->toDateString();
            } elseif ($period === 'monthly') {
                $startDate = now()->startOfMonth()->toDateString();
                $endDate = now()->toDateString();
            } else {
                $startDate = $startDateInput ?: '2026-07-01';
                $endDate = $endDateInput ?: now()->toDateString();
            }

            $startDateTime = $startDate.' 00:00:00';
            $endDateTime = $endDate.' 23:59:59';

            $totalItems = Item::count();
            $totalCategories = Category::count();
            $totalUnits = Unit::count();

            $incomingCount = (int) IncomingItem::whereBetween('date', [$startDateTime, $endDateTime])->sum('quantity');
            $outgoingCount = (int) OutgoingItem::whereBetween('date', [$startDateTime, $endDateTime])->sum('quantity');

            $lowStockItems = Item::with(['category', 'unit'])
                ->whereColumn('stock', '<=', 'min_stock')
                ->orderBy('stock', 'asc')
                ->get();

            $recentIncoming = IncomingItem::with(['item.unit', 'user'])
                ->latest('date')
                ->latest('id')
                ->take(5)
                ->get();

            $recentOutgoing = OutgoingItem::with(['item.unit', 'user'])
                ->latest('date')
                ->latest('id')
                ->take(5)
                ->get();

            $chartStartDate = ($period === 'today') ? now()->subDays(6)->toDateString() : $startDate;
            $chartEndDate = $endDate;

            $chartStartDateTime = $chartStartDate.' 00:00:00';
            $chartEndDateTime = $chartEndDate.' 23:59:59';

            $incomingByDate = IncomingItem::whereBetween('date', [$chartStartDateTime, $chartEndDateTime])
                ->selectRaw('DATE(date) as date_key, SUM(quantity) as total')
                ->groupBy('date_key')
                ->pluck('total', 'date_key');

            $outgoingByDate = OutgoingItem::whereBetween('date', [$chartStartDateTime, $chartEndDateTime])
                ->selectRaw('DATE(date) as date_key, SUM(quantity) as total')
                ->groupBy('date_key')
                ->pluck('total', 'date_key');

            $chartData = [];
            $currentDate = Carbon::parse($chartStartDate);
            $endDateObj = Carbon::parse($chartEndDate);

            while ($currentDate->lte($endDateObj)) {
                $dStr = $currentDate->toDateString();
                $chartData[] = [
                    'date' => $currentDate->format('d M'),
                    'full_date' => $dStr,
                    'incoming' => (int) ($incomingByDate[$dStr] ?? 0),
                    'outgoing' => (int) ($outgoingByDate[$dStr] ?? 0),
                ];
                $currentDate->addDay();
            }

            return Inertia::render('dashboard', [
                'period' => $period,
                'startDate' => $startDate,
                'endDate' => $endDate,
                'totalItems' => $totalItems,
                'lowStockCount' => $lowStockItems->count(),
                'todayIncomingCount' => $incomingCount,
                'todayOutgoingCount' => $outgoingCount,
                'totalCategories' => $totalCategories,
                'totalUnits' => $totalUnits,
                'lowStockItems' => $lowStockItems,
                'recentIncoming' => $recentIncoming,
                'recentOutgoing' => $recentOutgoing,
                'chartData' => $chartData,
            ]);
        } catch (Throwable $e) {
            Log::error('Error loading dashboard stats: '.$e->getMessage(), ['trace' => $e->getTraceAsString()]);
            throw $e;
        }
    }
}
