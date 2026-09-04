import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowDownLeft,
    ArrowUpRight,
    Boxes,
    Calendar,
    CheckCircle2,
    FileSpreadsheet,
    FileText,
    Filter,
    PackageMinus,
    PackagePlus,
    SlidersHorizontal,
    TrendingUp,
    Wrench,
} from 'lucide-react';
import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import { DatePicker } from '@/components/ui/date-picker';
import type { SharedData } from '@/types/auth';
import type { BreadcrumbItem } from '@/types';

type DashboardProps = {
    period?: string;
    startDate?: string;
    endDate?: string;
    totalItems: number;
    lowStockCount: number;
    todayIncomingCount: number;
    todayOutgoingCount: number;
    myIncomingCount?: number;
    myOutgoingCount?: number;
    totalAdjustmentsCount?: number;
    myAdjustmentsCount?: number;
    damagedCount?: number;
    lostCount?: number;
    opnameDiffCount?: number;
    totalCategories: number;
    totalUnits: number;
    recentIncoming: any[];
    recentOutgoing: any[];
    recentAdjustments?: any[];
    lowStockItems: any[];
    chartData?: any[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const cleanStr = String(dateStr).split('T')[0];
    const parts = cleanStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [year, month, day] = parts;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const mIdx = parseInt(month, 10) - 1;
    return `${day} ${months[mIdx] || month} ${year}`;
};

const chartConfig = {
    incoming: {
        label: 'Barang Masuk (+)',
        color: '#10b981',
    },
    outgoing: {
        label: 'Barang Keluar (-)',
        color: '#f59e0b',
    },
    adjustments: {
        label: 'Penyesuaian Stok',
        color: '#a855f7',
    },
} satisfies ChartConfig;

export default function Dashboard({
    period = 'today',
    startDate = '2026-07-01',
    endDate = '2026-09-03',
    totalItems,
    lowStockCount,
    todayIncomingCount,
    todayOutgoingCount,
    myIncomingCount = 0,
    myOutgoingCount = 0,
    totalAdjustmentsCount = 0,
    myAdjustmentsCount = 0,
    damagedCount = 0,
    lostCount = 0,
    opnameDiffCount = 0,
    totalCategories,
    totalUnits,
    recentIncoming = [],
    recentOutgoing = [],
    recentAdjustments = [],
    lowStockItems = [],
    chartData = [],
}: DashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    const isAdmin = Boolean(
        user.is_admin ||
        user.roles?.some((r: any) => (typeof r === 'string' ? r === 'admin' : r?.name === 'admin'))
    );
    const isOwner = Boolean(
        user.is_pemilik ||
        user.roles?.some((r: any) => (typeof r === 'string' ? r === 'pemilik' : r?.name === 'pemilik'))
    );
    const isStaf = Boolean(
        user.is_staf ||
        user.roles?.some((r: any) => (typeof r === 'string' ? r === 'staf_operasional' : r?.name === 'staf_operasional'))
    );
    const isQc = Boolean(
        user.is_qc ||
        user.roles?.some((r: any) => (typeof r === 'string' ? r === 'admin_qc' : r?.name === 'admin_qc'))
    );

    const [customStart, setCustomStart] = useState(startDate);
    const [customEnd, setCustomEnd] = useState(endDate);

    const getPeriodLabel = (p: string) => {
        switch (p) {
            case 'weekly':
                return '7 Hari Terakhir';
            case 'monthly':
                return 'Bulan Ini';
            case 'range':
                return `${formatDate(startDate)} - ${formatDate(endDate)}`;
            case 'custom':
                return 'Semua Data';
            default:
                return 'Hari Ini';
        }
    };

    const handleCustomFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/dashboard', { period: 'range', start_date: customStart, end_date: customEnd }, { preserveState: true });
    };

    const excelExportUrl = `/reports/export-excel?period=${period}&start_date=${startDate || ''}&end_date=${endDate || ''}`;

    const roleBadgeText = user.role_label || (isAdmin ? 'Admin Utama' : isOwner ? 'Pemilik (Owner)' : isStaf ? 'Staf Operasional' : isQc ? 'Admin QC' : 'Pengguna');

    return (
        <>
            <Head title={`Dashboard Monitoring Stok - ${roleBadgeText}`} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header Welcome Banner Card */}
                <Card className="relative overflow-hidden border border-border bg-card shadow-sm">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
                    <CardContent className="p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[11px] font-medium border-border text-muted-foreground bg-muted/40">
                                        Peran Sistem: <span className="font-bold text-foreground ml-1">{roleBadgeText}</span>
                                    </Badge>
                                </div>
                                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                    Selamat Datang, {user.name} 👋
                                </h1>
                                <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                                    {isStaf && 'Panel Pencatatan Transaksi Barang Masuk dan Barang Keluar Gudang Diesel Truk Medan.'}
                                    {isQc && 'Panel Monitoring Kualitas Stok, Pemeriksaan Barang Rusak & Penyesuaian Opname Gudang.'}
                                    {(isAdmin || isOwner) && 'Panel Ringkasan & Monitoring Keseluruhan Stok Gudang Diesel Truk Medan.'}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5">
                                {isOwner ? (
                                    <>
                                        <Button asChild size="sm" className="gap-2 shadow-sm cursor-pointer bg-blue-600 hover:bg-blue-700 text-white">
                                            <Link href="/reports">
                                                <FileText className="h-4 w-4" />
                                                <span>Laporan Persediaan</span>
                                            </Link>
                                        </Button>
                                        <Button asChild variant="outline" size="sm" className="gap-2 cursor-pointer border-emerald-500/30 hover:border-emerald-500 text-emerald-600 dark:text-emerald-400">
                                            <a href={excelExportUrl} target="_blank" rel="noopener noreferrer">
                                                <FileSpreadsheet className="h-4 w-4" />
                                                <span>Export Excel</span>
                                            </a>
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        {(isAdmin || isStaf) && (
                                            <Button asChild size="sm" className="gap-2 shadow-sm cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white">
                                                <Link href="/incoming-items">
                                                    <PackagePlus className="h-4 w-4" />
                                                    <span>Barang Masuk</span>
                                                </Link>
                                            </Button>
                                        )}
                                        {(isAdmin || isStaf) && (
                                            <Button asChild size="sm" variant="outline" className="gap-2 shadow-sm cursor-pointer border-amber-500/30 text-amber-600 dark:text-amber-400 hover:border-amber-500">
                                                <Link href="/outgoing-items">
                                                    <PackageMinus className="h-4 w-4" />
                                                    <span>Barang Keluar</span>
                                                </Link>
                                            </Button>
                                        )}
                                        {(isAdmin || isQc) && (
                                            <Button asChild size="sm" variant="outline" className="gap-2 shadow-sm cursor-pointer border-purple-500/30 text-purple-600 dark:text-purple-400 hover:border-purple-500">
                                                <Link href="/stock-adjustments">
                                                    <SlidersHorizontal className="h-4 w-4" />
                                                    <span>Penyesuaian Stok</span>
                                                </Link>
                                            </Button>
                                        )}
                                        {isAdmin && (
                                            <Button asChild variant="outline" size="sm" className="gap-2 cursor-pointer border-blue-500/30 hover:border-blue-500 text-blue-600 dark:text-blue-400">
                                                <a href={excelExportUrl} target="_blank" rel="noopener noreferrer">
                                                    <FileSpreadsheet className="h-4 w-4" />
                                                    <span>Export Excel</span>
                                                </a>
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Period Filter Bar */}
                <Card className="border border-border bg-card shadow-xs">
                    <CardContent className="p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
                                <Calendar className="h-4 w-4 text-primary shrink-0" />
                                <span>Filter Periode Ringkasan</span>
                            </div>
                            <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                <span>Status Filter:</span>
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold px-2.5 py-0.5">
                                    {getPeriodLabel(period)}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <Button
                                    size="sm"
                                    variant={period === 'today' ? 'default' : 'outline'}
                                    onClick={() => router.get('/dashboard', { period: 'today' }, { preserveState: true })}
                                    className="h-8 text-xs px-3 cursor-pointer"
                                >
                                    Hari Ini
                                </Button>
                                <Button
                                    size="sm"
                                    variant={period === 'weekly' ? 'default' : 'outline'}
                                    onClick={() => router.get('/dashboard', { period: 'weekly' }, { preserveState: true })}
                                    className="h-8 text-xs px-3 cursor-pointer"
                                >
                                    7 Hari Terakhir
                                </Button>
                                <Button
                                    size="sm"
                                    variant={period === 'monthly' ? 'default' : 'outline'}
                                    onClick={() => router.get('/dashboard', { period: 'monthly' }, { preserveState: true })}
                                    className="h-8 text-xs px-3 cursor-pointer"
                                >
                                    Bulan Ini
                                </Button>
                                <Button
                                    size="sm"
                                    variant={period === 'custom' ? 'default' : 'outline'}
                                    onClick={() => router.get('/dashboard', { period: 'custom' }, { preserveState: true })}
                                    className="h-8 text-xs px-3 cursor-pointer"
                                >
                                    Semua Data
                                </Button>
                            </div>

                            <form onSubmit={handleCustomFilter} className="flex flex-wrap items-center gap-2">
                                <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">Rentang Tanggal:</span>
                                <div className="min-w-[145px] sm:w-38">
                                    <DatePicker value={customStart} onChange={setCustomStart} placeholder="Tgl Mulai..." />
                                </div>
                                <span className="text-xs text-muted-foreground">-</span>
                                <div className="min-w-[145px] sm:w-38">
                                    <DatePicker value={customEnd} onChange={setCustomEnd} placeholder="Tgl Selesai..." />
                                </div>
                                <Button type="submit" size="sm" variant="secondary" className="h-8 text-xs px-3 gap-1.5 cursor-pointer font-semibold">
                                    <Filter className="h-3.5 w-3.5" />
                                    <span>Terapkan</span>
                                </Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>

                {/* Metric Summary Cards per Role */}
                {isStaf ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Masuk (Input Saya)
                                </CardTitle>
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                    <ArrowDownLeft className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">
                                    +{myIncomingCount}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Total barang masuk yang Anda catat</p>
                            </CardContent>
                        </Card>

                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Keluar (Input Saya)
                                </CardTitle>
                                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                                    <ArrowUpRight className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-amber-500 dark:text-amber-400">
                                    -{myOutgoingCount}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Total barang keluar yang Anda catat</p>
                            </CardContent>
                        </Card>

                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Total Masuk (Gudang)
                                </CardTitle>
                                <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                                    <PackagePlus className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-foreground">
                                    +{todayIncomingCount}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Total seluruh barang masuk ({getPeriodLabel(period)})</p>
                            </CardContent>
                        </Card>

                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Total Keluar (Gudang)
                                </CardTitle>
                                <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                                    <PackageMinus className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-foreground">
                                    -{todayOutgoingCount}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Total seluruh barang keluar ({getPeriodLabel(period)})</p>
                            </CardContent>
                        </Card>
                    </div>
                ) : isQc ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Total Sparepart Dipantau
                                </CardTitle>
                                <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                                    <Boxes className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-foreground">{totalItems}</div>
                                <p className="text-xs text-muted-foreground mt-1">Seluruh jenis suku cadang di gudang</p>
                            </CardContent>
                        </Card>

                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Stok Kritis (&le; Min)
                                </CardTitle>
                                <div className={`p-2 rounded-lg ${lowStockCount > 0 ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                                    <AlertTriangle className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-baseline gap-2">
                                    <div className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-destructive dark:text-red-400' : 'text-foreground'}`}>
                                        {lowStockCount}
                                    </div>
                                    {lowStockCount > 0 && (
                                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">Perlu Reorder</Badge>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Barang mendekati atau di bawah batas min</p>
                            </CardContent>
                        </Card>

                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Barang Rusak / Hilang
                                </CardTitle>
                                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                                    <Wrench className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {damagedCount + lostCount}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{damagedCount} Rusak &bull; {lostCount} Hilang</p>
                            </CardContent>
                        </Card>

                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Penyesuaian Saya
                                </CardTitle>
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                    <CheckCircle2 className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {myAdjustmentsCount}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Laporan opname/penyesuaian Anda ({getPeriodLabel(period)})</p>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    /* Admin / Pemilik Default */
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Total Jenis Sparepart
                                </CardTitle>
                                <div className="p-2 rounded-lg bg-muted/60 text-muted-foreground">
                                    <Boxes className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-foreground">{totalItems}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {totalCategories} Kategori &bull; {totalUnits} Satuan
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Stok Kritis (&le; Min)
                                </CardTitle>
                                <div className={`p-2 rounded-lg ${lowStockCount > 0 ? 'bg-destructive/10 text-destructive' : 'bg-muted/60 text-muted-foreground'}`}>
                                    <AlertTriangle className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-baseline gap-2">
                                    <div className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-destructive dark:text-red-400' : 'text-foreground'}`}>
                                        {lowStockCount}
                                    </div>
                                    {lowStockCount > 0 && (
                                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">Perlu Reorder</Badge>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Suku cadang butuh pengadaan ulang</p>
                            </CardContent>
                        </Card>

                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Barang Masuk ({getPeriodLabel(period)})
                                </CardTitle>
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                    <ArrowDownLeft className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">
                                    +{todayIncomingCount}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Penerimaan stok dari supplier</p>
                            </CardContent>
                        </Card>

                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Barang Keluar ({getPeriodLabel(period)})
                                </CardTitle>
                                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                                    <ArrowUpRight className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-amber-500 dark:text-amber-400">
                                    -{todayOutgoingCount}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Pengeluaran untuk armada truk</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Area Chart Section */}
                <Card className="border border-border bg-card shadow-sm">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-border gap-2">
                        <div>
                            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-primary" />
                                <span>Grafik Tren Aktivitas Persediaan</span>
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {isStaf && `Tren Barang Masuk vs. Barang Keluar yang Anda catat (${getPeriodLabel(period)})`}
                                {isQc && `Tren Penyesuaian Stok & Opname (${getPeriodLabel(period)})`}
                                {(isAdmin || isOwner) && `Perbandingan harian Barang Masuk vs. Barang Keluar (${getPeriodLabel(period)})`}
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {chartData.length === 0 ? (
                            <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
                                Belum ada data transaksi pada periode ini.
                            </div>
                        ) : (
                            <ChartContainer config={chartConfig} className="h-[280px] w-full">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="fillIncoming" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                                        </linearGradient>
                                        <linearGradient id="fillOutgoing" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                                        </linearGradient>
                                        <linearGradient id="fillAdjustments" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
                                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} className="text-xs text-muted-foreground" />
                                    <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs text-muted-foreground" />
                                    <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                                    {!isQc && (
                                        <Area dataKey="incoming" type="monotone" fill="url(#fillIncoming)" stroke="#10b981" strokeWidth={2} />
                                    )}
                                    {!isQc && (
                                        <Area dataKey="outgoing" type="monotone" fill="url(#fillOutgoing)" stroke="#f59e0b" strokeWidth={2} />
                                    )}
                                    {(isQc || isAdmin || isOwner) && (
                                        <Area dataKey="adjustments" type="monotone" fill="url(#fillAdjustments)" stroke="#a855f7" strokeWidth={2} />
                                    )}
                                    <ChartLegend content={<ChartLegendContent payload={[]} />} />
                                </AreaChart>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Content Grid per Role */}
                <div className={`grid gap-6 ${isQc ? 'lg:grid-cols-2' : 'lg:grid-cols-3'}`}>
                    {/* Low Stock Items (Visible to QC, Admin, Owner) */}
                    {(isQc || isAdmin || isOwner) && (
                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader className="pb-3 border-b border-border">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-destructive" />
                                        <span>Peringatan Stok Kritis</span>
                                    </CardTitle>
                                    <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                                        <Link href="/items?stock_status=low">Lihat Semua</Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {lowStockItems.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-muted-foreground">
                                        🎉 Semua stok barang dalam kondisi aman.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {lowStockItems.slice(0, 5).map((item) => (
                                            <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-muted/40 transition-colors">
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">{item.name}</p>
                                                    <p className="text-xs text-muted-foreground font-mono">
                                                        [{item.item_code}] &bull; {item.category?.name}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <Badge variant="destructive" className="font-bold bg-red-600 text-white dark:bg-red-600 dark:text-white px-2 py-0.5 shadow-xs">
                                                        {item.stock} {item.unit?.short_name}
                                                    </Badge>
                                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                                        Min: {item.min_stock}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Stock Adjustments (Visible to QC) */}
                    {isQc && (
                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader className="pb-3 border-b border-border">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                                        <SlidersHorizontal className="h-4 w-4 text-purple-500" />
                                        <span>Penyesuaian Stok Terbaru</span>
                                    </CardTitle>
                                    <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                                        <Link href="/stock-adjustments">Lihat Semua</Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {recentAdjustments.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-muted-foreground">
                                        Belum ada catatan penyesuaian stok.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {recentAdjustments.map((adj) => (
                                            <div key={adj.id} className="p-3.5 flex items-center justify-between hover:bg-muted/40 transition-colors">
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">{adj.item?.name}</p>
                                                    <p className="text-xs text-muted-foreground font-mono">
                                                        {adj.reference_no} &bull; {formatDate(adj.date)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-sm font-bold ${adj.type === 'addition' ? 'text-emerald-500' : 'text-purple-500'}`}>
                                                        {adj.type === 'addition' ? '+' : '-'}{adj.quantity} {adj.item?.unit?.short_name}
                                                    </span>
                                                    <p className="text-[10px] text-muted-foreground capitalize">
                                                        {adj.reason === 'damaged' ? 'Barang Rusak' : adj.reason === 'lost' ? 'Barang Hilang' : adj.reason === 'opname_difference' ? 'Beda Opname' : adj.reason}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Recent Incoming Transactions (Visible to Staf, Admin, Owner) */}
                    {(isStaf || isAdmin || isOwner) && (
                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader className="pb-3 border-b border-border">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                                        <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
                                        <span>Barang Masuk Terbaru</span>
                                    </CardTitle>
                                    <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                                        <Link href="/incoming-items">Lihat Semua</Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {recentIncoming.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-muted-foreground">
                                        Belum ada transaksi barang masuk.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {recentIncoming.map((tx) => (
                                            <div key={tx.id} className="p-3.5 flex items-center justify-between hover:bg-muted/40 transition-colors">
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">{tx.item?.name}</p>
                                                    <p className="text-xs text-muted-foreground font-mono">
                                                        {tx.reference_no} &bull; {formatDate(tx.date)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-sm font-bold text-emerald-500 dark:text-emerald-400">
                                                        +{tx.quantity} {tx.item?.unit?.short_name}
                                                    </span>
                                                    <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                                                        {tx.user?.name || tx.supplier || 'Supplier'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Recent Outgoing Transactions (Visible to Staf, Admin, Owner) */}
                    {(isStaf || isAdmin || isOwner) && (
                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader className="pb-3 border-b border-border">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                                        <ArrowUpRight className="h-4 w-4 text-amber-500" />
                                        <span>Barang Keluar Terbaru</span>
                                    </CardTitle>
                                    <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                                        <Link href="/outgoing-items">Lihat Semua</Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {recentOutgoing.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-muted-foreground">
                                        Belum ada transaksi barang keluar.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {recentOutgoing.map((tx) => (
                                            <div key={tx.id} className="p-3.5 flex items-center justify-between hover:bg-muted/40 transition-colors">
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">{tx.item?.name}</p>
                                                    <p className="text-xs text-muted-foreground font-mono">
                                                        {tx.reference_no} &bull; {formatDate(tx.date)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-sm font-bold text-amber-500 dark:text-amber-400">
                                                        -{tx.quantity} {tx.item?.unit?.short_name}
                                                    </span>
                                                    <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                                                        {tx.user?.name || tx.recipient || 'Truk/Mekanik'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: breadcrumbs,
};

Dashboard.layout = {
    breadcrumbs: breadcrumbs,
};
