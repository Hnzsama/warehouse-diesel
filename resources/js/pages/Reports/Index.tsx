import { Head, router, usePage } from '@inertiajs/react';
import { FileSpreadsheet, FileText, Filter, Printer } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { SharedData } from '@/types/auth';
import type { BreadcrumbItem } from '@/types';

type ReportProps = {
    reportType: 'stock' | 'incoming' | 'outgoing';
    period?: string;
    startDate: string;
    endDate: string;
    reportData: any[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Laporan Persediaan', href: '/reports' },
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

export default function ReportsIndex({ reportType, period = 'monthly', startDate, endDate, reportData }: ReportProps) {
    const { auth } = usePage<SharedData>().props;

    const [type, setType] = useState(reportType);
    const [selectedPeriod, setSelectedPeriod] = useState<string>(period);
    const [start, setStart] = useState(startDate);
    const [end, setEnd] = useState(endDate);

    const handlePeriodChange = (p: string) => {
        setSelectedPeriod(p);
        router.get('/reports', { report_type: type, period: p, start_date: start, end_date: end });
    };

    const handleTypeChange = (newType: 'stock' | 'incoming' | 'outgoing') => {
        setType(newType);
        router.get('/reports', { report_type: newType, period: selectedPeriod, start_date: start, end_date: end });
    };

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/reports', { report_type: type, period: selectedPeriod, start_date: start, end_date: end });
    };

    const handlePrint = () => {
        const url = `/reports/print?report_type=${reportType}&period=${selectedPeriod}&start_date=${startDate}&end_date=${endDate}`;
        window.open(url, '_blank');
    };

    return (
        <>
            <Head title="Laporan Persediaan Barang" />

            <div className="flex flex-1 flex-col gap-5 p-3 sm:p-4 md:p-6 w-full max-w-full overflow-hidden">
                {/* Header & Print Action */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
                            <span>Laporan Persediaan Gudang</span>
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Rekapitulasi data stok barang, transaksi masuk, dan transaksi keluar untuk pengawasan dan pertanggungjawaban.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button onClick={handlePrint} className="w-full sm:w-auto gap-2 shadow-sm cursor-pointer justify-center">
                            <Printer className="h-4 w-4" />
                            <span>Cetak Laporan / Export PDF</span>
                        </Button>
                        <Button asChild variant="outline" className="w-full sm:w-auto gap-2 shadow-sm cursor-pointer justify-center border-emerald-500/30 hover:border-emerald-500 text-emerald-600 dark:text-emerald-400">
                            <a href={`/reports/export-excel?period=${selectedPeriod}&start_date=${start}&end_date=${end}`} target="_blank" rel="noopener noreferrer">
                                <FileSpreadsheet className="h-4 w-4" />
                                <span>Export Excel + Chart</span>
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Filter Controls */}
                <Card>
                    <CardContent className="p-3 sm:p-4">
                        <form onSubmit={handleFilter} className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
                            <div>
                                <Label htmlFor="rpt_type" className="mb-1 block">
                                    Jenis Laporan
                                </Label>
                                <Select value={type} onValueChange={(val) => handleTypeChange(val as any)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Pilih jenis laporan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="stock">Laporan Status Stok Akhir</SelectItem>
                                        <SelectItem value="incoming">Laporan Transaksi Barang Masuk</SelectItem>
                                        <SelectItem value="outgoing">Laporan Transaksi Barang Keluar</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="rpt_period" className="mb-1 block">
                                    Periode Waktu
                                </Label>
                                <Select value={selectedPeriod} onValueChange={(val) => handlePeriodChange(val)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Pilih periode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="today">Harian (Hari Ini)</SelectItem>
                                        <SelectItem value="weekly">Mingguan (7 Hari Terakhir)</SelectItem>
                                        <SelectItem value="monthly">Bulanan (Bulan Ini)</SelectItem>
                                        <SelectItem value="custom">Pilih Rentang Tanggal...</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedPeriod === 'custom' && (
                                <>
                                    <div>
                                        <Label htmlFor="start_d" className="mb-1 block">
                                            Tanggal Mulai
                                        </Label>
                                        <DatePicker
                                            value={start}
                                            onChange={setStart}
                                            placeholder="Tgl Mulai..."
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="end_d" className="mb-1 block">
                                            Tanggal Selesai
                                        </Label>
                                        <DatePicker
                                            value={end}
                                            onChange={setEnd}
                                            placeholder="Tgl Selesai..."
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex items-end sm:col-span-1">
                                <Button type="submit" variant="secondary" className="w-full gap-1.5 cursor-pointer justify-center">
                                    <Filter className="h-4 w-4" />
                                    <span>Tampilkan Laporan</span>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Printable Preview Container */}
                <Card className="overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                        <div className="border-b border-border pb-4 mb-6 text-center">
                            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-foreground uppercase">
                                GUDANG DIESEL TRUK MEDAN (SINAR DIESEL TRUCK)
                            </h2>
                            <p className="text-xs text-muted-foreground mt-1">
                                JMPR+3F4, Pulo Brayan Bengkel, Kec. Medan Timur, Kota Medan, Sumatera Utara 20221
                            </p>
                            <div className="mt-3 inline-block rounded-md bg-muted px-3 py-1 text-xs font-bold text-foreground">
                                {reportType === 'stock' && 'LAPORAN REKAPITULASI STOK BARANG'}
                                {reportType === 'incoming' && `LAPORAN TRANSAKSI BARANG MASUK (${formatDate(startDate)} s/d ${formatDate(endDate)})`}
                                {reportType === 'outgoing' && `LAPORAN TRANSAKSI BARANG KELUAR (${formatDate(startDate)} s/d ${formatDate(endDate)})`}
                            </div>
                        </div>

                        {/* Stock Table */}
                        {reportType === 'stock' && (
                            <div className="overflow-x-auto w-full">
                                <table className="w-full text-left text-sm text-foreground min-w-[650px]">
                                    <thead className="bg-muted text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3">No</th>
                                            <th className="px-4 py-3">Kode Barang</th>
                                            <th className="px-4 py-3">Nama Sparepart</th>
                                            <th className="px-4 py-3">Kategori</th>
                                            <th className="px-4 py-3 text-center">Sisa Stok</th>
                                            <th className="px-4 py-3 text-center">Stok Min</th>
                                            <th className="px-4 py-3">Lokasi Rak</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {reportData.map((item, i) => (
                                            <tr key={item.id} className="hover:bg-muted/50">
                                                <td className="px-4 py-3 text-xs text-muted-foreground">{i + 1}</td>
                                                <td className="px-4 py-3 font-mono font-bold">{item.item_code}</td>
                                                <td className="px-4 py-3 font-medium">{item.name}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{item.category?.name}</td>
                                                <td className="px-4 py-3 text-center font-bold">
                                                     {item.stock <= item.min_stock ? (
                                                         <Badge variant="destructive" className="font-bold whitespace-nowrap bg-red-600 text-white dark:bg-red-600 dark:text-white px-2 py-0.5 shadow-xs">
                                                             {item.stock} {item.unit?.short_name}
                                                         </Badge>
                                                     ) : (
                                                         <span className="text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">
                                                             {item.stock} {item.unit?.short_name}
                                                         </span>
                                                     )}
                                                 </td>
                                                <td className="px-4 py-3 text-center text-muted-foreground">{item.min_stock} {item.unit?.short_name}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{item.rack_location || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Incoming Transactions Table */}
                        {reportType === 'incoming' && (
                            <div className="overflow-x-auto w-full">
                                <table className="w-full text-left text-sm text-foreground min-w-[700px]">
                                    <thead className="bg-muted text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3">No</th>
                                            <th className="px-4 py-3">No. Nota</th>
                                            <th className="px-4 py-3">Tanggal</th>
                                            <th className="px-4 py-3">Nama Sparepart</th>
                                            <th className="px-4 py-3 text-center">Jumlah Masuk</th>
                                            <th className="px-4 py-3">Supplier</th>
                                            <th className="px-4 py-3">Operator</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {reportData.map((tx, i) => (
                                            <tr key={tx.id} className="hover:bg-muted/50">
                                                <td className="px-4 py-3 text-xs text-muted-foreground">{i + 1}</td>
                                                <td className="px-4 py-3 font-mono font-bold">{tx.reference_no}</td>
                                                <td className="px-4 py-3 font-medium whitespace-nowrap">{formatDate(tx.date)}</td>
                                                <td className="px-4 py-3 font-medium">
                                                    {tx.item?.name || 'Item Terhapus'}
                                                    {tx.item?.deleted_at && <span className="ml-1.5 text-xs text-red-500 font-normal">(Item Terhapus)</span>}
                                                </td>
                                                <td className="px-4 py-3 text-center font-bold text-emerald-500 dark:text-emerald-400 whitespace-nowrap">+{tx.quantity} {tx.item?.unit?.short_name}</td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {typeof tx.supplier === 'object' && tx.supplier ? tx.supplier.name : (tx.supplier || '-')}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">{tx.user?.name}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Outgoing Transactions Table */}
                        {reportType === 'outgoing' && (
                            <div className="overflow-x-auto w-full">
                                <table className="w-full text-left text-sm text-foreground min-w-[700px]">
                                    <thead className="bg-muted text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3">No</th>
                                            <th className="px-4 py-3">No. Bon</th>
                                            <th className="px-4 py-3">Tanggal</th>
                                            <th className="px-4 py-3">Nama Sparepart</th>
                                            <th className="px-4 py-3 text-center">Jumlah Keluar</th>
                                            <th className="px-4 py-3">Penerima / Truk</th>
                                            <th className="px-4 py-3">Operator</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {reportData.map((tx, i) => (
                                            <tr key={tx.id} className="hover:bg-muted/50">
                                                <td className="px-4 py-3 text-xs text-muted-foreground">{i + 1}</td>
                                                <td className="px-4 py-3 font-mono font-bold">{tx.reference_no}</td>
                                                <td className="px-4 py-3 font-medium whitespace-nowrap">{formatDate(tx.date)}</td>
                                                <td className="px-4 py-3 font-medium">
                                                    {tx.item?.name || 'Item Terhapus'}
                                                    {tx.item?.deleted_at && <span className="ml-1.5 text-xs text-red-500 font-normal">(Item Terhapus)</span>}
                                                </td>
                                                <td className="px-4 py-3 text-center font-bold text-amber-500 dark:text-amber-400 whitespace-nowrap">-{tx.quantity} {tx.item?.unit?.short_name}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{tx.recipient || '-'}</td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">{tx.user?.name}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ReportsIndex.layout = {
    breadcrumbs: breadcrumbs,
};
