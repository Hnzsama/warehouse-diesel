import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Archive,
    CheckCircle2,
    Eye,
    FileSpreadsheet,
    Filter,
    Pencil,
    Plus,
    Printer,
    RotateCcw,
    Search,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import Pagination from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { SharedData } from '@/types/auth';
import type { BreadcrumbItem } from '@/types';

type Category = { id: number; name: string };
type Unit = { id: number; name: string; short_name: string };

type Item = {
    id: number;
    item_code: string;
    name: string;
    category_id: number;
    unit_id: number;
    stock: number;
    min_stock: number;
    rack_location: string | null;
    deleted_at?: string | null;
    category?: Category;
    unit?: Unit;
    incoming_items_count?: number;
    outgoing_items_count?: number;
};

type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
};

type ItemsIndexProps = {
    items: PaginatedData<Item>;
    categories: Category[];
    units: Unit[];
    filters: {
        search?: string;
        category_id?: string;
        unit_id?: string;
        stock_status?: string;
        trashed?: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Master Sparepart', href: '/items' },
];

export default function ItemsIndex({ items, categories, units, filters }: ItemsIndexProps) {
    const { flash } = usePage<SharedData>().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [viewingItem, setViewingItem] = useState<Item | null>(null);

    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [unitId, setUnitId] = useState(filters.unit_id || '');
    const [stockStatus, setStockStatus] = useState(filters.stock_status || '');
    const [trashed, setTrashed] = useState(filters.trashed || '');

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        item_code: '',
        name: '',
        category_id: '',
        unit_id: '',
        stock: 0,
        min_stock: 0,
        rack_location: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/items',
            { search, category_id: categoryId, unit_id: unitId, stock_status: stockStatus, trashed },
            { preserveState: true }
        );
    };

    const handleResetFilter = () => {
        setSearch('');
        setCategoryId('');
        setUnitId('');
        setStockStatus('');
        setTrashed('');
        router.get('/items');
    };

    const openCreateModal = () => {
        setEditingItem(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (item: Item) => {
        setEditingItem(item);
        clearErrors();
        setData({
            item_code: item.item_code,
            name: item.name,
            category_id: String(item.category_id),
            unit_id: String(item.unit_id),
            stock: item.stock,
            min_stock: item.min_stock,
            rack_location: item.rack_location || '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            put(`/items/${editingItem.id}`, {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            post('/items', {
                onSuccess: () => setIsModalOpen(false),
            });
        }
    };

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

    const handleDelete = (item: Item) => {
        setConfirmState({
            open: true,
            title: 'Arsipkan Suku Cadang (Soft Delete)',
            description: `Apakah Anda yakin ingin mengarsipkan suku cadang "${item.name}"? Data barang akan disembunyikan dari daftar utama namun riwayat transaksi tetap tersimpan aman.`,
            confirmText: 'Arsipkan Barang',
            variant: 'warning',
            icon: 'archive',
            onConfirm: () => {
                destroy(`/items/${item.id}`, {
                    onSuccess: () => setConfirmState((prev) => ({ ...prev, open: false })),
                });
            },
        });
    };

    const handleRestore = (item: Item) => {
        setConfirmState({
            open: true,
            title: 'Pulihkan Suku Cadang',
            description: `Apakah Anda yakin ingin memulihkan kembali suku cadang "${item.name}" ke daftar aktif?`,
            confirmText: 'Pulihkan Barang',
            variant: 'emerald',
            icon: 'restore',
            onConfirm: () => {
                router.post(`/items/${item.id}/restore`, {}, {
                    onSuccess: () => setConfirmState((prev) => ({ ...prev, open: false })),
                });
            },
        });
    };

    const handleExportExcel = () => {
        window.open('/reports/export-excel?report_type=stock', '_blank');
    };

    return (
        <>
            <Head title="Master Sparepart Diesel Truk" />

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

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                            Master Data Sparepart
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Kelola suku cadang diesel, kategori, dan lokasi rak. Klik baris untuk melihat detail atau mengedit.
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
                            onClick={() => window.open('/reports/export-pdf?report_type=stock', '_blank')}
                            className="gap-2 cursor-pointer border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                        >
                            <Printer className="h-4 w-4" />
                            <span>Cetak / PDF</span>
                        </Button>
                        <Button onClick={openCreateModal} className="gap-2 shadow-sm cursor-pointer justify-center">
                            <Plus className="h-4 w-4" />
                            <span>Tambah Sparepart Baru</span>
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
                                    placeholder="Cari nama / kode..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 w-full"
                                />
                            </div>

                            <Combobox
                                options={[
                                    { value: 'all', label: 'Semua Kategori' },
                                    ...categories.map((c) => ({ value: String(c.id), label: c.name })),
                                ]}
                                value={categoryId || 'all'}
                                onValueChange={(val) => setCategoryId(val === 'all' ? '' : val)}
                                placeholder="Semua Kategori"
                                searchPlaceholder="Cari kategori..."
                            />

                            <Select value={unitId} onValueChange={(val) => setUnitId(val === 'all' ? '' : val)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Semua Satuan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Satuan</SelectItem>
                                    {units.map((u) => (
                                        <SelectItem key={u.id} value={String(u.id)}>{u.name} ({u.short_name})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={stockStatus} onValueChange={(val) => setStockStatus(val === 'all' ? '' : val)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Status Stok" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status Stok</SelectItem>
                                    <SelectItem value="low">Stok Kritis (&le; Min)</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={trashed} onValueChange={(val) => setTrashed(val === 'active' ? '' : val)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Filter Data Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Data Aktif Saja</SelectItem>
                                    <SelectItem value="only">Data Terhapus (Trash)</SelectItem>
                                    <SelectItem value="with">Semua (Aktif & Terhapus)</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex items-center gap-2 w-full lg:col-span-1">
                                <Button type="submit" className="flex-1 gap-1.5 cursor-pointer justify-center" variant="secondary">
                                    <Filter className="h-4 w-4" />
                                    <span>Filter</span>
                                </Button>
                                <Button type="button" variant="outline" size="icon" onClick={handleResetFilter} title="Reset" className="cursor-pointer shrink-0">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Items Table */}
                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto w-full">
                            <Table className="w-full min-w-[750px]">
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead>Kode Barang</TableHead>
                                        <TableHead>Nama Sparepart</TableHead>
                                        <TableHead>Kategori</TableHead>
                                        <TableHead className="text-center">Stok Available</TableHead>
                                        <TableHead className="text-center">Stok Minimum</TableHead>
                                        <TableHead>Lokasi Rak</TableHead>
                                        <TableHead className="text-center w-[120px]">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="py-8 text-center text-xs text-muted-foreground">
                                                Tidak ada data suku cadang ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        items.data.map((item) => {
                                            const isLow = item.stock <= item.min_stock;
                                            const isTrashed = Boolean(item.deleted_at);
                                            return (
                                                <TableRow
                                                    key={item.id}
                                                    onClick={() => setViewingItem(item)}
                                                    className={`cursor-pointer hover:bg-muted/70 transition-colors group ${isTrashed ? 'bg-red-500/5 opacity-75' : ''}`}
                                                    title="Klik untuk melihat rincian suku cadang"
                                                >
                                                    <TableCell className="font-mono font-bold group-hover:text-primary transition-colors">{item.item_code}</TableCell>
                                                    <TableCell className="font-medium">
                                                        <span>{item.name}</span>
                                                        {isTrashed && (
                                                            <Badge variant="outline" className="ml-2 border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] px-1.5 py-0">
                                                                Soft-Deleted
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">{item.category?.name || '-'}</TableCell>
                                                    <TableCell className="text-center">
                                                        {isLow ? (
                                                            <Badge variant="destructive" className="font-bold whitespace-nowrap bg-red-600 text-white dark:bg-red-600 dark:text-white px-2 py-0.5 shadow-xs">
                                                                {item.stock} {item.unit?.short_name}
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="font-semibold whitespace-nowrap bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                                                                {item.stock} {item.unit?.short_name}
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center text-muted-foreground whitespace-nowrap">
                                                        {item.min_stock} {item.unit?.short_name}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">{item.rack_location || '-'}</TableCell>
                                                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                                        <TooltipProvider>
                                                            <div className="flex items-center justify-center gap-1">
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => setViewingItem(item)}
                                                                            className="h-8 w-8 text-blue-500 hover:bg-blue-500/15 cursor-pointer"
                                                                        >
                                                                            <Eye className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>Lihat Detail Suku Cadang</TooltipContent>
                                                                </Tooltip>

                                                                {!isTrashed && (
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => openEditModal(item)}
                                                                                className="h-8 w-8 text-amber-500 hover:bg-amber-500/15 cursor-pointer"
                                                                            >
                                                                                <Pencil className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Edit Data Suku Cadang</TooltipContent>
                                                                    </Tooltip>
                                                                )}

                                                                {isTrashed ? (
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => handleRestore(item)}
                                                                                className="h-8 w-8 text-emerald-600 hover:bg-emerald-500/15 cursor-pointer"
                                                                            >
                                                                                <RotateCcw className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Pulihkan Suku Cadang</TooltipContent>
                                                                    </Tooltip>
                                                                ) : (
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => handleDelete(item)}
                                                                                className="h-8 w-8 text-amber-600 hover:bg-amber-500/15 cursor-pointer"
                                                                            >
                                                                                <Archive className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Arsipkan Suku Cadang (Soft Delete)</TooltipContent>
                                                                    </Tooltip>
                                                                )}
                                                            </div>
                                                        </TooltipProvider>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        {/* Pagination */}
                        <Pagination links={items.links} total={items.total} currentPageDataCount={items.data.length} />
                    </CardContent>
                </Card>
            </div>

            {/* Modal Dialog Form */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-lg max-w-[95vw] rounded-lg">
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg">{editingItem ? 'Edit Data Sparepart' : 'Tambah Sparepart Baru'}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 pt-2 w-full min-w-0 max-w-full box-border">
                        <div>
                            <Label htmlFor="item_code">Kode Barang *</Label>
                            <Input
                                id="item_code"
                                placeholder="Contoh: FLT-DSL-001"
                                value={data.item_code}
                                onChange={(e) => setData('item_code', e.target.value)}
                                className="mt-1 font-mono"
                            />
                            {errors.item_code && <p className="mt-1 text-xs text-destructive">{errors.item_code}</p>}
                        </div>

                        <div>
                            <Label htmlFor="name">Nama Sparepart *</Label>
                            <Input
                                id="name"
                                placeholder="Contoh: Filter Oli Canter"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1"
                            />
                            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="category" className="mb-1 block">Kategori *</Label>
                                <Combobox
                                    options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
                                    value={data.category_id}
                                    onValueChange={(val) => setData('category_id', val)}
                                    placeholder="Pilih Kategori"
                                    searchPlaceholder="Cari kategori..."
                                />
                                {errors.category_id && <p className="mt-1 text-xs text-destructive">{errors.category_id}</p>}
                            </div>

                            <div>
                                <Label htmlFor="unit" className="mb-1 block">Satuan *</Label>
                                <Select value={data.unit_id} onValueChange={(val) => setData('unit_id', val)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Pilih Satuan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {units.map((u) => (
                                            <SelectItem key={u.id} value={String(u.id)}>{u.name} ({u.short_name})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.unit_id && <p className="mt-1 text-xs text-destructive">{errors.unit_id}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="stock">Stok Awal *</Label>
                                {(() => {
                                    const hasTx = Boolean(editingItem && ((editingItem.incoming_items_count || 0) + (editingItem.outgoing_items_count || 0) > 0));
                                    return (
                                        <>
                                            <Input
                                                id="stock"
                                                type="number"
                                                min="0"
                                                disabled={hasTx}
                                                value={data.stock}
                                                onChange={(e) => setData('stock', parseInt(e.target.value) || 0)}
                                                className={`mt-1 ${hasTx ? 'opacity-60 bg-muted cursor-not-allowed' : ''}`}
                                            />
                                            {hasTx && (
                                                <p className="mt-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                                                    Stok tidak dapat diubah manual karena sudah ada riwayat transaksi.
                                                </p>
                                            )}
                                        </>
                                    );
                                })()}
                                {errors.stock && <p className="mt-1 text-xs text-destructive">{errors.stock}</p>}
                            </div>

                            <div>
                                <Label htmlFor="min_stock">Stok Minimum *</Label>
                                <Input
                                    id="min_stock"
                                    type="number"
                                    min="0"
                                    value={data.min_stock}
                                    onChange={(e) => setData('min_stock', parseInt(e.target.value) || 0)}
                                    className="mt-1"
                                />
                                {errors.min_stock && <p className="mt-1 text-xs text-destructive">{errors.min_stock}</p>}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="rack_location">Lokasi Rak Gudang (Opsional)</Label>
                            <Input
                                id="rack_location"
                                placeholder="Contoh: Rak A-01"
                                value={data.rack_location}
                                onChange={(e) => setData('rack_location', e.target.value)}
                                className="mt-1"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="cursor-pointer flex-1 sm:flex-initial">
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="cursor-pointer flex-1 sm:flex-initial">
                                {processing ? 'Menyimpan...' : 'Simpan Data'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Detail View Sparepart */}
            <Dialog open={!!viewingItem} onOpenChange={() => setViewingItem(null)}>
                <DialogContent className="sm:max-w-md max-w-[95vw] rounded-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base sm:text-lg text-primary font-bold">
                            <Eye className="h-5 w-5" />
                            <span>Rincian Suku Cadang</span>
                        </DialogTitle>
                    </DialogHeader>

                    {viewingItem && (
                        <div className="space-y-4 pt-2 text-sm">
                            <div className="grid grid-cols-2 gap-3 bg-muted/50 p-3 rounded-lg border border-border">
                                <div>
                                    <span className="text-xs text-muted-foreground block">Kode Sparepart</span>
                                    <span className="font-mono font-bold text-foreground">{viewingItem.item_code}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground block">Nama Sparepart</span>
                                    <span className="font-bold text-foreground">{viewingItem.name}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="text-xs text-muted-foreground block">Kategori</span>
                                    <span className="font-medium">{viewingItem.category?.name || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground block">Satuan</span>
                                    <span className="font-medium">{viewingItem.unit?.name} ({viewingItem.unit?.short_name})</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 bg-card p-3 rounded-lg border border-border">
                                <div>
                                    <span className="text-xs text-muted-foreground block">Stok Tersedia</span>
                                    <div className="mt-0.5">
                                        {viewingItem.stock <= viewingItem.min_stock ? (
                                            <Badge variant="destructive" className="font-bold bg-red-600 text-white">
                                                {viewingItem.stock} {viewingItem.unit?.short_name} (Kritis)
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="font-bold bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                                {viewingItem.stock} {viewingItem.unit?.short_name}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground block">Stok Minimum</span>
                                    <span className="font-semibold text-foreground">{viewingItem.min_stock} {viewingItem.unit?.short_name}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="text-xs text-muted-foreground block">Lokasi Rak</span>
                                    <span className="font-semibold text-foreground">{viewingItem.rack_location || 'Belum diatur'}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-end pt-3 border-t border-border">
                                <Button type="button" variant="secondary" onClick={() => setViewingItem(null)} className="cursor-pointer">
                                    Tutup
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Confirmation Modal */}
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
        </>
    );
}

ItemsIndex.layout = {
    breadcrumbs: breadcrumbs,
};
