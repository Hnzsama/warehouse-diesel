import { Head, router, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowDownLeft, CheckCircle2, Clock, FileSpreadsheet, FileText, Filter, History, Image as ImageIcon, Plus, Printer, Search, Trash2, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import Pagination from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import { DatePicker } from '@/components/ui/date-picker';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { SharedData } from '@/types/auth';
import type { BreadcrumbItem } from '@/types';

type UserOption = {
    id: number;
    name: string;
    roles?: { name: string }[];
    is_admin?: boolean;
    is_pemilik?: boolean;
    is_staf?: boolean;
    is_qc?: boolean;
};

type SupplierOption = {
    id: number;
    code: string;
    name: string;
};

type Item = {
    id: number;
    item_code: string;
    name: string;
    stock: number;
    deleted_at?: string | null;
    unit?: { short_name: string };
};

type EditLog = {
    id: number;
    user_id: number;
    notes: string | null;
    created_at: string;
    user?: UserOption;
};

type IncomingItem = {
    id: number;
    reference_no: string;
    date: string;
    quantity: number;
    supplier_id: number | null;
    supplier: SupplierOption | string | null;
    notes: string | null;
    invoice_image: string | null;
    invoice_image_url: string | null;
    item_id?: number;
    item?: Item;
    user?: UserOption;
    edit_logs?: EditLog[];
};

type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
};

type IncomingItemsIndexProps = {
    incomingItems: PaginatedData<IncomingItem>;
    items: Item[];
    suppliers?: SupplierOption[];
    users?: UserOption[];
    filters: {
        search?: string;
        start_date?: string;
        end_date?: string;
        user_id?: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Barang Masuk', href: '/incoming-items' },
];

const formatShortName = (name?: string | null) => {
    if (!name) return 'Admin';
    const words = name.trim().split(/\s+/);
    if (words.length <= 2) return name;
    return words.slice(0, 2).join(' ');
};

const getRoleBadge = (user?: any) => {
    if (!user) return null;
    const roles = user.roles || [];
    const isAdmin = user.is_admin || roles.some((r: any) => (typeof r === 'string' ? r === 'admin' : r?.name === 'admin'));
    const isOwner = user.is_pemilik || roles.some((r: any) => (typeof r === 'string' ? r === 'pemilik' : r?.name === 'pemilik'));
    const isStaf = user.is_staf || roles.some((r: any) => (typeof r === 'string' ? r === 'staf_operasional' : r?.name === 'staf_operasional'));
    const isQc = user.is_qc || roles.some((r: any) => (typeof r === 'string' ? r === 'admin_qc' : r?.name === 'admin_qc'));

    if (isAdmin) {
        return (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-bold bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400 whitespace-nowrap shrink-0">
                Admin
            </Badge>
        );
    }
    if (isOwner) {
        return (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-bold bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400 whitespace-nowrap shrink-0">
                Pemilik
            </Badge>
        );
    }
    if (isStaf) {
        return (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-bold bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400 whitespace-nowrap shrink-0">
                Staf Op
            </Badge>
        );
    }
    if (isQc) {
        return (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-bold bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400 whitespace-nowrap shrink-0">
                Admin QC
            </Badge>
        );
    }
    return null;
};

const getUserRoleLabel = (user?: any) => {
    if (!user) return '';
    const roles = user.roles || [];
    const isAdmin = user.is_admin || roles.some((r: any) => (typeof r === 'string' ? r === 'admin' : r?.name === 'admin'));
    const isOwner = user.is_pemilik || roles.some((r: any) => (typeof r === 'string' ? r === 'pemilik' : r?.name === 'pemilik'));
    const isStaf = user.is_staf || roles.some((r: any) => (typeof r === 'string' ? r === 'staf_operasional' : r?.name === 'staf_operasional'));
    const isQc = user.is_qc || roles.some((r: any) => (typeof r === 'string' ? r === 'admin_qc' : r?.name === 'admin_qc'));

    if (isAdmin) return 'Admin Utama';
    if (isOwner) return 'Pemilik';
    if (isStaf) return 'Staf Operasional';
    if (isQc) return 'Admin QC';
    return '';
};

const formatDateWithTime = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
};

const formatForDateTimeLocal = (dateStr: string | Date | null) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function IncomingItemsIndex({ incomingItems, items, suppliers = [], users = [], filters }: IncomingItemsIndexProps) {
    const { flash } = usePage<SharedData>().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<IncomingItem | null>(null);
    const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);

    const [search, setSearch] = useState(filters.search || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [userId, setUserId] = useState(filters.user_id || '');

    const [confirmState, setConfirmState] = useState<{
        open: boolean;
        title: string;
        description: string;
        confirmText?: string;
        variant?: 'destructive' | 'warning' | 'default' | 'emerald';
        icon?: 'archive' | 'trash' | 'warning' | 'restore';
        onConfirm: () => void;
    }>({
        open: false,
        title: '',
        description: '',
        onConfirm: () => {},
    });

    const { data, setData, post, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        reference_no: `IN-${Date.now().toString().slice(-6)}`,
        item_id: '',
        supplier_id: '',
        quantity: 1,
        date: formatForDateTimeLocal(new Date()),
        supplier: '',
        notes: '',
        invoice_image: null as File | null,
        _method: 'POST',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/incoming-items',
            { search, start_date: startDate, end_date: endDate, user_id: userId },
            { preserveState: true }
        );
    };

    const openCreateModal = () => {
        setEditingItem(null);
        reset();
        setData({
            reference_no: `IN-${Date.now().toString().slice(-6)}`,
            item_id: '',
            supplier_id: '',
            quantity: 1,
            date: formatForDateTimeLocal(new Date()),
            supplier: '',
            notes: '',
            invoice_image: null,
            _method: 'POST',
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (tx: IncomingItem) => {
        setEditingItem(tx);
        clearErrors();
        const supName = typeof tx.supplier === 'object' && tx.supplier ? tx.supplier.name : (tx.supplier || '');
        setData({
            reference_no: tx.reference_no,
            item_id: String(tx.item_id || tx.item?.id || ''),
            supplier_id: tx.supplier_id ? String(tx.supplier_id) : '',
            quantity: tx.quantity,
            date: formatForDateTimeLocal(tx.date),
            supplier: supName,
            notes: tx.notes || '',
            invoice_image: null,
            _method: 'PUT',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            post(`/incoming-items/${editingItem.id}`, {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            post('/incoming-items', {
                onSuccess: () => setIsModalOpen(false),
            });
        }
    };

    const handleDelete = (tx: IncomingItem) => {
        setConfirmState({
            open: true,
            title: 'Hapus Transaksi Barang Masuk',
            description: `Apakah Anda yakin ingin menghapus transaksi barang masuk "${tx.reference_no}"? Stok barang akan dikurangi secara otomatis.`,
            confirmText: 'Hapus Transaksi',
            variant: 'destructive',
            icon: 'trash',
            onConfirm: () => {
                destroy(`/incoming-items/${tx.id}`, {
                    onSuccess: () => setConfirmState((prev) => ({ ...prev, open: false })),
                });
            },
        });
    };

    const handleExportExcel = () => {
        const query = new URLSearchParams({
            report_type: 'incoming',
            start_date: startDate || '',
            end_date: endDate || '',
        }).toString();
        window.open(`/reports/export-excel?${query}`, '_blank');
    };

    const handleExportPdf = () => {
        const query = new URLSearchParams({
            report_type: 'incoming',
            start_date: startDate || '',
            end_date: endDate || '',
        }).toString();
        window.open(`/reports/export-pdf?${query}`, '_blank');
    };

    return (
        <TooltipProvider>
            <Head title="Transaksi Barang Masuk" />

            <div className="flex flex-1 flex-col gap-5 p-3 sm:p-4 md:p-6 w-full max-w-full overflow-hidden">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 sm:p-4 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                        <span className="text-sm font-medium">{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 sm:p-4 text-destructive">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <span className="text-sm font-medium">{flash.error}</span>
                    </div>
                )}

                {/* Header Title & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <ArrowDownLeft className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>Transaksi Barang Masuk</span>
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Pencatatan penerimaan stok suku cadang baru dengan rincian tanggal, jam, dan bukti nota opsional. Klik baris untuk mengedit.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <Button
                            variant="outline"
                            onClick={handleExportExcel}
                            className="gap-2 cursor-pointer border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                        >
                            <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Export Excel</span>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleExportPdf}
                            className="gap-2 cursor-pointer border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                        >
                            <Printer className="h-4 w-4" />
                            <span>Cetak / PDF</span>
                        </Button>
                        <Button onClick={openCreateModal} className="w-full sm:w-auto gap-2 shadow-sm cursor-pointer justify-center">
                            <Plus className="h-4 w-4" />
                            <span>Catat Barang Masuk</span>
                        </Button>
                    </div>
                </div>

                {/* Filter Bar */}
                <Card>
                    <CardContent className="p-3 sm:p-4">
                        <form onSubmit={handleSearch} className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Cari nota / supplier / barang..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 w-full"
                                />
                            </div>

                            <DatePicker
                                value={startDate}
                                onChange={setStartDate}
                                placeholder="Tgl Mulai..."
                            />

                            <DatePicker
                                value={endDate}
                                onChange={setEndDate}
                                placeholder="Tgl Selesai..."
                            />

                            <div className="w-full">
                                <Combobox
                                    options={[
                                        { value: '', label: '-- Semua Operator --' },
                                        ...users.map((u) => {
                                            const roleLabel = getUserRoleLabel(u);
                                            return {
                                                value: String(u.id),
                                                label: `${formatShortName(u.name)} ${roleLabel ? `(${roleLabel})` : ''}`,
                                            };
                                        }),
                                    ]}
                                    value={userId}
                                    onValueChange={(val) => setUserId(val)}
                                    placeholder="-- Semua Operator --"
                                    searchPlaceholder="Cari nama operator..."
                                />
                            </div>

                            <Button type="submit" variant="secondary" className="gap-1.5 cursor-pointer justify-center">
                                <Filter className="h-4 w-4" />
                                <span>Filter</span>
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-left text-sm text-foreground min-w-[800px]">
                                <thead className="bg-muted text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3.5">No. Referensi / Nota</th>
                                        <th className="px-4 py-3.5">Tanggal & Waktu</th>
                                        <th className="px-4 py-3.5">Nama Sparepart</th>
                                        <th className="px-4 py-3.5 text-center">Jumlah Masuk</th>
                                        <th className="px-4 py-3.5">Supplier / Pemasok</th>
                                        <th className="px-4 py-3.5 text-center">Bukti Nota</th>
                                        <th className="px-4 py-3.5">Operator (Input / Edit)</th>
                                        <th className="px-4 py-3.5 text-center w-[70px]">Hapus</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {incomingItems.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-8 text-center text-xs text-muted-foreground">
                                                Belum ada riwayat transaksi barang masuk.
                                            </td>
                                        </tr>
                                    ) : (
                                        incomingItems.data.map((tx) => {
                                            const lastEditLog = tx.edit_logs && tx.edit_logs.length > 0 ? tx.edit_logs[0] : null;
                                            return (
                                                <tr
                                                    key={tx.id}
                                                    onClick={() => openEditModal(tx)}
                                                    className="hover:bg-muted/60 transition-colors cursor-pointer group"
                                                    title="Klik untuk mengedit transaksi barang masuk ini"
                                                >
                                                    <td className="px-4 py-3.5 font-mono font-bold group-hover:text-primary transition-colors">{tx.reference_no}</td>
                                                    <td className="px-4 py-3.5 font-medium whitespace-nowrap text-xs text-muted-foreground">{formatDateWithTime(tx.date)}</td>
                                                    <td className="px-4 py-3.5 font-medium">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span>{tx.item?.name || 'Item Terhapus'}</span>
                                                            <span className="text-xs text-muted-foreground font-mono">({tx.item?.item_code || '-'})</span>
                                                            {tx.item?.deleted_at && (
                                                                <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] px-1.5 py-0 font-normal">
                                                                    Item Terhapus
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                                        <Badge variant="outline" className="font-bold bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20">
                                                            +{tx.quantity} {tx.item?.unit?.short_name}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-muted-foreground font-medium">
                                                        {typeof tx.supplier === 'object' && tx.supplier ? tx.supplier.name : (tx.supplier || '-')}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                        {tx.invoice_image_url ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedReceiptUrl(tx.invoice_image_url)}
                                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted hover:bg-muted/80 text-xs font-semibold text-foreground border border-border transition-colors cursor-pointer"
                                                            >
                                                                <ImageIcon className="h-3.5 w-3.5 text-emerald-500" />
                                                                <span>Lihat Nota</span>
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                                                        <div className="flex items-center gap-1.5 flex-nowrap" title={tx.user?.name || 'Admin'}>
                                                            <span className="font-semibold text-foreground whitespace-nowrap truncate max-w-[140px]">
                                                                {formatShortName(tx.user?.name)}
                                                            </span>
                                                            {getRoleBadge(tx.user)}
                                                        </div>
                                                        {lastEditLog && (
                                                            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 whitespace-nowrap" title={`Diedit terakhir oleh ${lastEditLog.user?.name} pada ${formatDateWithTime(lastEditLog.created_at)}`}>
                                                                <History className="h-3 w-3 text-amber-500 shrink-0" />
                                                                <span className="truncate max-w-[120px]">Edit: {formatShortName(lastEditLog.user?.name)}</span>
                                                                {getRoleBadge(lastEditLog.user)}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleDelete(tx)}
                                                                    className="h-8 w-8 text-destructive hover:bg-destructive/15 cursor-pointer"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Hapus Transaksi Masuk</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        <Pagination links={incomingItems.links} total={incomingItems.total} currentPageDataCount={incomingItems.data.length} />
                    </CardContent>
                </Card>
            </div>

            {/* Modal Dialog Form */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-lg max-w-[95vw] rounded-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-base sm:text-lg">
                            <ArrowDownLeft className="h-5 w-5" />
                            <span>{editingItem ? 'Edit Transaksi Barang Masuk' : 'Input Barang Masuk'}</span>
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 pt-2 w-full min-w-0 max-w-full box-border">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                            <div className="space-y-1.5">
                                <Label htmlFor="ref_no" className="text-sm font-medium leading-none block">No. Referensi / Nota *</Label>
                                <Input
                                    id="ref_no"
                                    value={data.reference_no}
                                    onChange={(e) => setData('reference_no', e.target.value)}
                                    className="font-mono h-10"
                                />
                                {errors.reference_no && <p className="text-xs text-destructive">{errors.reference_no}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="tx_datetime" className="text-sm font-medium leading-none block">Tanggal & Jam Masuk *</Label>
                                <Input
                                    id="tx_datetime"
                                    type="datetime-local"
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                    className="font-mono text-sm h-10"
                                />
                                {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="item" className="mb-1 block">Pilih Sparepart *</Label>
                            <Combobox
                                options={items.map((it) => ({
                                    value: String(it.id),
                                    label: `[${it.item_code}] ${it.name} (Stok: ${it.stock} ${it.unit?.short_name})`,
                                }))}
                                value={data.item_id}
                                onValueChange={(val) => setData('item_id', val)}
                                placeholder="-- Cari & Pilih Suku Cadang --"
                                searchPlaceholder="Ketik nama atau kode sparepart..."
                            />
                            {errors.item_id && <p className="mt-1 text-xs text-destructive">{errors.item_id}</p>}
                        </div>

                        <div>
                            <Label htmlFor="qty">Jumlah Kuantitas Masuk *</Label>
                            <Input
                                id="qty"
                                type="number"
                                min="1"
                                value={data.quantity}
                                onChange={(e) => setData('quantity', parseInt(e.target.value) || 1)}
                                className="mt-1"
                            />
                            {errors.quantity && <p className="mt-1 text-xs text-destructive">{errors.quantity}</p>}
                        </div>

                        <div>
                            <Label htmlFor="supplier_id" className="mb-1 block">Pilih Supplier / Distributor (Opsional)</Label>
                            <Combobox
                                options={suppliers.map((sup) => ({
                                    value: String(sup.id),
                                    label: `[${sup.code}] ${sup.name}`,
                                }))}
                                value={data.supplier_id}
                                onValueChange={(val) => {
                                    const found = suppliers.find((s) => String(s.id) === val);
                                    setData((prev) => ({
                                        ...prev,
                                        supplier_id: val,
                                        supplier: found ? found.name : prev.supplier,
                                    }));
                                }}
                                placeholder="-- Pilih Data Supplier --"
                                searchPlaceholder="Ketik nama atau kode supplier..."
                            />
                            {errors.supplier_id && <p className="mt-1 text-xs text-destructive">{errors.supplier_id}</p>}
                        </div>

                        <div>
                            <Label htmlFor="invoice_image">Gambar Bukti Nota / Kwitansi (Opsional)</Label>
                            <Input
                                id="invoice_image"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => setData('invoice_image', e.target.files?.[0] || null)}
                                className="mt-1 cursor-pointer"
                            />
                            {editingItem?.invoice_image_url && !data.invoice_image && (
                                <p className="mt-1.5 text-xs text-muted-foreground flex items-center gap-1">
                                    <FileText className="h-3.5 w-3.5 text-emerald-500" />
                                    <span>Bukti nota tersimpan:</span>
                                    <a
                                        href={editingItem.invoice_image_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-bold underline text-primary"
                                    >
                                        Lihat Berkas Nota
                                    </a>
                                </p>
                            )}
                            {errors.invoice_image && <p className="mt-1 text-xs text-destructive">{errors.invoice_image}</p>}
                        </div>

                        <div>
                            <Label htmlFor="notes">Catatan / Keterangan (Opsional)</Label>
                            <textarea
                                id="notes"
                                rows={2}
                                placeholder="Catatan tambahan..."
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                        </div>

                        {/* Audit Log Timeline inside Edit Modal */}
                        {editingItem && (
                            <div className="rounded-lg bg-muted/60 p-3.5 border border-border space-y-2">
                                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                                    <History className="h-3.5 w-3.5 text-amber-500" />
                                    <span>Riwayat Pengeditan & Pembuat Transaksi</span>
                                </h4>
                                <div className="space-y-1.5 text-xs">
                                    <div className="flex items-center justify-between text-muted-foreground bg-background/50 p-2 rounded border border-border/50">
                                        <span className="flex items-center gap-1">
                                            <UserIcon className="h-3 w-3 text-emerald-500" />
                                            <strong className="text-foreground">Pembuat Awal:</strong> {editingItem.user?.name || 'Admin'}
                                        </span>
                                        <span className="text-[11px] font-mono">{formatDateWithTime(editingItem.date)}</span>
                                    </div>

                                    {editingItem.edit_logs && editingItem.edit_logs.length > 0 ? (
                                        editingItem.edit_logs.map((log) => (
                                            <div key={log.id} className="flex items-center justify-between text-muted-foreground bg-background/50 p-2 rounded border border-border/50">
                                                <span className="flex items-center gap-1">
                                                    <History className="h-3 w-3 text-amber-500" />
                                                    <strong className="text-foreground">Diedit oleh:</strong> {log.user?.name || 'Pengguna'}
                                                </span>
                                                <span className="text-[11px] font-mono">{formatDateWithTime(log.created_at)}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-[11px] text-muted-foreground italic">Belum ada riwayat pengeditan sebelumnya.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="cursor-pointer flex-1 sm:flex-initial">
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="cursor-pointer flex-1 sm:flex-initial">
                                {processing ? 'Menyimpan...' : editingItem ? 'Simpan Perubahan' : 'Simpan Transaksi Masuk'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Receipt Image Lightbox Preview Modal */}
            <Dialog open={!!selectedReceiptUrl} onOpenChange={() => setSelectedReceiptUrl(null)}>
                <DialogContent className="max-w-3xl p-3 sm:p-6 bg-background/95 backdrop-blur-md rounded-xl">
                    <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-border">
                        <DialogTitle className="text-base font-bold flex items-center gap-2">
                            <ImageIcon className="h-5 w-5 text-emerald-500" />
                            <span>Bukti Nota Transaksi</span>
                        </DialogTitle>
                    </DialogHeader>
                    {selectedReceiptUrl && (
                        <div className="flex justify-center items-center py-2 bg-black/40 rounded-lg overflow-hidden max-h-[75vh]">
                            <img
                                src={selectedReceiptUrl}
                                alt="Bukti Nota Transaksi"
                                className="max-h-[70vh] w-auto max-w-full object-contain rounded"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={confirmState.open}
                onOpenChange={(open) => setConfirmState((prev) => ({ ...prev, open }))}
                title={confirmState.title}
                description={confirmState.description}
                confirmText={confirmState.confirmText}
                variant={confirmState.variant}
                icon={confirmState.icon}
                onConfirm={confirmState.onConfirm}
            />
        </TooltipProvider>
    );
}

IncomingItemsIndex.layout = {
    breadcrumbs: breadcrumbs,
};
