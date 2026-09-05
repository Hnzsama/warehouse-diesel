import { Head, router, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, Archive, CheckCircle2, FileSpreadsheet, Plus, Printer, Search, Trash2, Truck } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import Pagination from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

type Supplier = {
    id: number;
    code: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    notes: string | null;
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

type SuppliersIndexProps = {
    suppliers: PaginatedData<Supplier>;
    filters: {
        search?: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Data Supplier', href: '/suppliers' },
];

export default function SuppliersIndex({ suppliers, filters }: SuppliersIndexProps) {
    const { auth, flash } = usePage<SharedData>().props;
    const user = auth.user;
    const isOwner = Boolean(
        user.is_pemilik ||
        user.roles?.some((r: any) => (typeof r === 'string' ? r === 'pemilik' : r?.name === 'pemilik'))
    );

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
    const [search, setSearch] = useState(filters.search || '');

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

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        code: '',
        name: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
    });

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/suppliers', { search }, { preserveState: true, replace: true });
    };

    const openCreateModal = () => {
        setEditingSupplier(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        clearErrors();
        setData({
            code: supplier.code,
            name: supplier.name,
            phone: supplier.phone || '',
            email: supplier.email || '',
            address: supplier.address || '',
            notes: supplier.notes || '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSupplier) {
            put(`/suppliers/${editingSupplier.id}`, {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            post('/suppliers', {
                onSuccess: () => setIsModalOpen(false),
            });
        }
    };

    const handleDelete = (supplier: Supplier) => {
        setConfirmState({
            open: true,
            title: 'Hapus Data Supplier',
            description: `Apakah Anda yakin ingin menghapus data supplier "${supplier.name}"? Data yang dihapus tidak dapat dikembalikan.`,
            confirmText: 'Hapus Supplier',
            variant: 'destructive',
            icon: 'trash',
            onConfirm: () => {
                destroy(`/suppliers/${supplier.id}`, {
                    onSuccess: () => setConfirmState((prev) => ({ ...prev, open: false })),
                });
            },
        });
    };

    const handleExportExcel = () => {
        window.open('/suppliers/export-excel', '_blank');
    };

    const handleExportPdf = () => {
        window.open('/suppliers/export-pdf', '_blank');
    };

    return (
        <TooltipProvider>
            <Head title="Data Supplier & Distributor Sparepart" />

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
                            <Truck className="h-6 w-6 text-primary" />
                            Data Supplier & Distributor
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Kelola daftar pemasok/distributor suku cadang mesin diesel. Klik baris untuk mengedit data supplier.
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
                        {!isOwner && (
                            <Button onClick={openCreateModal} className="w-full sm:w-auto gap-2 shadow-sm cursor-pointer justify-center">
                                <Plus className="h-4 w-4" />
                                <span>Tambah Supplier Baru</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Search Bar Filter */}
                <Card className="p-3 sm:p-4">
                    <form onSubmit={handleSearchSubmit} className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari nama supplier, kode, telepon, atau email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 text-sm"
                            />
                        </div>
                        <Button type="submit" variant="secondary" className="cursor-pointer">
                            Cari
                        </Button>
                    </form>
                </Card>

                {/* Suppliers Table */}
                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto w-full">
                            <Table className="w-full min-w-[700px]">
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-[110px]">Kode</TableHead>
                                        <TableHead>Nama Supplier</TableHead>
                                        <TableHead>Kontak & Email</TableHead>
                                        <TableHead>Alamat</TableHead>
                                        <TableHead className="text-center">Riwayat Transaksi</TableHead>
                                        {!isOwner && <TableHead className="text-center w-[60px]">Aksi</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {suppliers.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={isOwner ? 5 : 6} className="py-8 text-center text-xs text-muted-foreground">
                                                Belum ada data supplier yang terdaftar.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        suppliers.data.map((sup) => (
                                            <TableRow
                                                key={sup.id}
                                                onClick={() => (isOwner ? setViewingSupplier(sup) : openEditModal(sup))}
                                                className="cursor-pointer hover:bg-muted/70 transition-colors group"
                                                title={isOwner ? 'Klik untuk melihat detail supplier' : 'Klik untuk mengedit supplier ini'}
                                            >
                                                <TableCell className="font-mono text-xs font-semibold text-primary">{sup.code}</TableCell>
                                                <TableCell className="font-bold text-foreground group-hover:text-primary transition-colors">
                                                    <div>{sup.name}</div>
                                                    {sup.notes && <div className="text-[11px] font-normal text-muted-foreground">{sup.notes}</div>}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    <div>{sup.phone || '-'}</div>
                                                    {sup.email && <div className="text-[11px] text-muted-foreground/80">{sup.email}</div>}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={sup.address || ''}>
                                                    {sup.address || '-'}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[11px]">
                                                            Masuk: {sup.incoming_items_count ?? 0}
                                                        </Badge>
                                                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[11px]">
                                                            Keluar: {sup.outgoing_items_count ?? 0}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                {!isOwner && (
                                                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleDelete(sup)}
                                                                    className="h-8 w-8 text-destructive hover:bg-destructive/15 cursor-pointer"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Hapus Supplier</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        {/* Pagination */}
                        <Pagination links={suppliers.links} total={suppliers.total} currentPageDataCount={suppliers.data.length} />
                    </CardContent>
                </Card>
            </div>

            {/* Modal Dialog Form */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-lg max-w-[95vw] rounded-lg">
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg">{editingSupplier ? 'Edit Data Supplier' : 'Tambah Supplier Baru'}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 pt-2 w-full min-w-0 max-w-full box-border">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="sup_code">Kode Supplier (Opsional)</Label>
                                <Input
                                    id="sup_code"
                                    placeholder="Otomatis (e.g. SUP-001)"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                    className="mt-1 font-mono text-xs"
                                />
                                {errors.code && <p className="mt-1 text-xs text-destructive">{errors.code}</p>}
                            </div>

                            <div>
                                <Label htmlFor="sup_name">Nama Supplier *</Label>
                                <Input
                                    id="sup_name"
                                    placeholder="Contoh: PT Kencana Diesel Parts"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1"
                                />
                                {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="sup_phone">No. Telepon / HP</Label>
                                <Input
                                    id="sup_phone"
                                    placeholder="Contoh: 061-4512098 / 0812..."
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="mt-1"
                                />
                                {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
                            </div>

                            <div>
                                <Label htmlFor="sup_email">Email Supplier</Label>
                                <Input
                                    id="sup_email"
                                    type="email"
                                    placeholder="sales@supplier.com"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="mt-1"
                                />
                                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="sup_address">Alamat Lengkap</Label>
                            <textarea
                                id="sup_address"
                                placeholder="Alamat jalan, kota, distributor..."
                                value={data.address}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('address', e.target.value)}
                                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 mt-1 resize-none"
                                rows={2}
                            />
                            {errors.address && <p className="mt-1 text-xs text-destructive">{errors.address}</p>}
                        </div>

                        <div>
                            <Label htmlFor="sup_notes">Catatan Tambahan</Label>
                            <Input
                                id="sup_notes"
                                placeholder="Contoh: Distributor sparepart resmi Hino & Canter"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                className="mt-1"
                            />
                            {errors.notes && <p className="mt-1 text-xs text-destructive">{errors.notes}</p>}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="cursor-pointer flex-1 sm:flex-initial">
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="cursor-pointer flex-1 sm:flex-initial">
                                {processing ? 'Menyimpan...' : 'Simpan Supplier'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Read-Only Detail View Modal for Owner / Monitoring */}
            <Dialog open={!!viewingSupplier} onOpenChange={() => setViewingSupplier(null)}>
                <DialogContent className="sm:max-w-md max-w-[95vw] rounded-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-primary text-base sm:text-lg font-bold">
                            <Truck className="h-5 w-5" />
                            <span>Detail Supplier & Distributor</span>
                        </DialogTitle>
                    </DialogHeader>

                    {viewingSupplier && (
                        <div className="space-y-4 pt-2 text-sm">
                            <div className="grid grid-cols-2 gap-3 bg-muted/50 p-3 rounded-lg border border-border">
                                <div>
                                    <span className="text-xs text-muted-foreground block">Kode Supplier</span>
                                    <span className="font-mono font-bold text-foreground">{viewingSupplier.code}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground block">Nama Supplier</span>
                                    <span className="font-bold text-foreground">{viewingSupplier.name}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="text-xs text-muted-foreground block">No. Telepon / HP</span>
                                    <span className="font-medium text-foreground">{viewingSupplier.phone || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground block">Email</span>
                                    <span className="font-medium text-foreground text-xs">{viewingSupplier.email || '-'}</span>
                                </div>
                            </div>

                            <div className="bg-card p-3 rounded-lg border border-border">
                                <span className="text-xs text-muted-foreground block">Alamat Lengkap</span>
                                <span className="font-medium text-foreground text-xs">{viewingSupplier.address || 'Belum diisi'}</span>
                            </div>

                            {viewingSupplier.notes && (
                                <div>
                                    <span className="text-xs text-muted-foreground block">Catatan / Keterangan</span>
                                    <p className="text-xs font-medium text-foreground bg-muted/40 p-2.5 rounded border border-border mt-1">
                                        {viewingSupplier.notes}
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center justify-end pt-3 border-t border-border">
                                <Button type="button" variant="secondary" onClick={() => setViewingSupplier(null)} className="cursor-pointer">
                                    Tutup
                                </Button>
                            </div>
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

SuppliersIndex.layout = {
    breadcrumbs: breadcrumbs,
};
