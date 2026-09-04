<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\IncomingItem;
use App\Models\Item;
use App\Models\OutgoingItem;
use App\Models\StockAdjustment;
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
            $user = $request->user();
            $isAdminOrOwner = $user->hasAnyRole(['admin', 'pemilik']);
            $isStaf = $user->hasRole('staf_operasional');
            $isQc = $user->hasRole('admin_qc');

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

            // Incoming & Outgoing counts
            $incomingCount = (int) IncomingItem::whereBetween('date', [$startDateTime, $endDateTime])->sum('quantity');
            $outgoingCount = (int) OutgoingItem::whereBetween('date', [$startDateTime, $endDateTime])->sum('quantity');

            // User-scoped incoming & outgoing counts (for staff)
            $myIncomingCount = (int) IncomingItem::where('user_id', $user->id)
                ->whereBetween('date', [$startDateTime, $endDateTime])
                ->sum('quantity');
            $myOutgoingCount = (int) OutgoingItem::where('user_id', $user->id)
                ->whereBetween('date', [$startDateTime, $endDateTime])
                ->sum('quantity');

            // Stock adjustments counts (for QC & Admin)
            $totalAdjustmentsCount = (int) StockAdjustment::whereBetween('date', [$startDateTime, $endDateTime])->count();
            $myAdjustmentsCount = (int) StockAdjustment::where('user_id', $user->id)
                ->whereBetween('date', [$startDateTime, $endDateTime])
                ->count();
            $damagedCount = (int) StockAdjustment::where('reason', 'damaged')
                ->whereBetween('date', [$startDateTime, $endDateTime])
                ->sum('quantity');
            $lostCount = (int) StockAdjustment::where('reason', 'lost')
                ->whereBetween('date', [$startDateTime, $endDateTime])
                ->sum('quantity');
            $opnameDiffCount = (int) StockAdjustment::where('reason', 'opname_difference')
                ->whereBetween('date', [$startDateTime, $endDateTime])
                ->sum('quantity');

            // Low stock warning items
            $lowStockItems = Item::with(['category', 'unit'])
                ->whereColumn('stock', '<=', 'min_stock')
                ->orderBy('stock', 'asc')
                ->get();

            // Recent Incoming items
            $incomingQuery = IncomingItem::with(['item.unit', 'user']);
            if ($isStaf) {
                $incomingQuery->where('user_id', $user->id);
            }
            $recentIncoming = $incomingQuery->latest('date')->latest('id')->take(5)->get();

            // Recent Outgoing items
            $outgoingQuery = OutgoingItem::with(['item.unit', 'user']);
            if ($isStaf) {
                $outgoingQuery->where('user_id', $user->id);
            }
            $recentOutgoing = $outgoingQuery->latest('date')->latest('id')->take(5)->get();

            // Recent Stock Adjustments
            $adjustmentQuery = StockAdjustment::with(['item.unit', 'user']);
            if ($isQc) {
                $adjustmentQuery->where('user_id', $user->id);
            }
            $recentAdjustments = $adjustmentQuery->latest('date')->latest('id')->take(5)->get();

            // Chart data calculation
            $chartStartDate = ($period === 'today') ? now()->subDays(6)->toDateString() : $startDate;
            $chartEndDate = $endDate;

            $chartStartDateTime = $chartStartDate.' 00:00:00';
            $chartEndDateTime = $chartEndDate.' 23:59:59';

            $incomingChartQuery = IncomingItem::whereBetween('date', [$chartStartDateTime, $chartEndDateTime]);
            if ($isStaf) {
                $incomingChartQuery->where('user_id', $user->id);
            }
            $incomingByDate = $incomingChartQuery
                ->selectRaw('DATE(date) as date_key, SUM(quantity) as total')
                ->groupBy('date_key')
                ->pluck('total', 'date_key');

            $outgoingChartQuery = OutgoingItem::whereBetween('date', [$chartStartDateTime, $chartEndDateTime]);
            if ($isStaf) {
                $outgoingChartQuery->where('user_id', $user->id);
            }
            $outgoingByDate = $outgoingChartQuery
                ->selectRaw('DATE(date) as date_key, SUM(quantity) as total')
                ->groupBy('date_key')
                ->pluck('total', 'date_key');

            $adjustmentChartQuery = StockAdjustment::whereBetween('date', [$chartStartDateTime, $chartEndDateTime]);
            if ($isQc) {
                $adjustmentChartQuery->where('user_id', $user->id);
            }
            $adjustmentsByDate = $adjustmentChartQuery
                ->selectRaw('DATE(date) as date_key, COUNT(id) as total')
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
                    'adjustments' => (int) ($adjustmentsByDate[$dStr] ?? 0),
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
                'myIncomingCount' => $myIncomingCount,
                'myOutgoingCount' => $myOutgoingCount,
                'totalAdjustmentsCount' => $totalAdjustmentsCount,
                'myAdjustmentsCount' => $myAdjustmentsCount,
                'damagedCount' => $damagedCount,
                'lostCount' => $lostCount,
                'opnameDiffCount' => $opnameDiffCount,
                'totalCategories' => $totalCategories,
                'totalUnits' => $totalUnits,
                'lowStockItems' => $lowStockItems,
                'recentIncoming' => $recentIncoming,
                'recentOutgoing' => $recentOutgoing,
                'recentAdjustments' => $recentAdjustments,
                'chartData' => $chartData,
            ]);
        } catch (Throwable $e) {
            Log::error('Error loading dashboard stats: '.$e->getMessage(), ['trace' => $e->getTraceAsString()]);
            throw $e;
        }
    }
}
