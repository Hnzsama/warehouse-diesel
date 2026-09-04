import { Head, router, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowDown, ArrowUp, CheckCircle2, Filter, PackageCheck, Plus, RefreshCw, Search, SlidersHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

type Item = {
    id: number;
    item_code: string;
    name: string;
    stock: number;
    deleted_at?: string | null;
    unit?: { short_name: string };
};

type StockAdjustment = {
    id: number;
    reference_no: string;
    item_id: number;
    type: 'addition' | 'reduction';
    quantity: number;
    reason: 'damaged' | 'lost' | 'opname_difference' | 'other';
    notes: string | null;
    date: string;
    item?: Item;
    user?: UserOption;
};

type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
};

type StockAdjustmentsIndexProps = {
    adjustments: PaginatedData<StockAdjustment>;
    items: Item[];
    autoRef: string;
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
    { title: 'Penyesuaian Stok (Opname)', href: '/stock-adjustments' },
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

const getReasonLabel = (reason: string) => {
    switch (reason) {
        case 'damaged':
            return { label: 'Barang Rusak', color: 'bg-red-500/10 text-red-600 border-red-500/20' };
        case 'lost':
            return { label: 'Barang Hilang', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' };
        case 'opname_difference':
            return { label: 'Selisih Opname', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
        default:
            return { label: 'Lainnya', color: 'bg-muted text-muted-foreground border-border' };
    }
};

export default function StockAdjustmentsIndex({ adjustments, items, autoRef, users = [], filters }: StockAdjustmentsIndexProps) {
    const { flash } = usePage<SharedData>().props;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [search, setSearch] = useState(filters.search || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [userId, setUserId] = useState(filters.user_id || '');

    const { data, setData, post, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        reference_no: autoRef,
        item_id: '',
        type: 'reduction' as 'addition' | 'reduction',
        quantity: 1,
        reason: 'damaged' as 'damaged' | 'lost' | 'opname_difference' | 'other',
        notes: '',
        date: formatForDateTimeLocal(new Date()),
    });

    const selectedItem = items.find((i) => String(i.id) === String(data.item_id));

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/stock-adjustments',
            { search, start_date: startDate, end_date: endDate, user_id: userId },
            { preserveState: true }
        );
    };

    const openCreateModal = () => {
        reset();
        setData({
            reference_no: autoRef,
            item_id: '',
            type: 'reduction',
            quantity: 1,
            reason: 'damaged',
            notes: '',
            date: formatForDateTimeLocal(new Date()),
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/stock-adjustments', {
            onSuccess: () => setIsModalOpen(false),
        });
    };

    const handleDelete = (adj: StockAdjustment) => {
        if (confirm(`Apakah Anda yakin ingin membatalkan penyesuaian stok "${adj.reference_no}"?\nStok barang akan dikembalikan ke kondisi sebelumnya.`)) {
            destroy(`/stock-adjustments/${adj.id}`);
        }
    };

    return (
        <>
            <Head title="Penyesuaian Stok (Opname)" />

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
                            <SlidersHorizontal className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
                            <span>Penyesuaian Stok (Stock Opname)</span>
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Pencatatan penyesuaian fisik stok suku cadang resmi akibat opname bulanan, barang rusak, atau hilang.
                        </p>
                    </div>

                    <Button onClick={openCreateModal} className="w-full sm:w-auto gap-2 shadow-sm cursor-pointer justify-center">
                        <Plus className="h-4 w-4" />
                        <span>Catat Penyesuaian Stok</span>
                    </Button>
                </div>

                {/* Filter Bar */}
                <Card>
                    <CardContent className="p-3 sm:p-4">
                        <form onSubmit={handleSearch} className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Cari no referensi / sparepart / catatan..."
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
                                <select
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                                >
                                    <option value="">-- Semua Operator --</option>
                                    {users.map((u) => {
                                        const roleLabel = getUserRoleLabel(u);
                                        return (
                                            <option key={u.id} value={u.id}>
                                                {formatShortName(u.name)} {roleLabel ? `(${roleLabel})` : ''}
                                            </option>
                                        );
                                    })}
                                </select>
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
                                        <th className="px-4 py-3.5">No. Referensi</th>
                                        <th className="px-4 py-3.5">Tanggal & Waktu</th>
                                        <th className="px-4 py-3.5">Nama Sparepart</th>
                                        <th className="px-4 py-3.5 text-center">Jenis Adjust</th>
                                        <th className="px-4 py-3.5 text-center">Alasan</th>
                                        <th className="px-4 py-3.5">Catatan</th>
                                        <th className="px-4 py-3.5">Operator</th>
                                        <th className="px-4 py-3.5 text-center w-[70px]">Batal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {adjustments.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-8 text-center text-xs text-muted-foreground">
                                                Belum ada riwayat penyesuaian stok (stock opname).
                                            </td>
                                        </tr>
                                    ) : (
                                        adjustments.data.map((adj) => {
                                            const rBadge = getReasonLabel(adj.reason);
                                            const isAdd = adj.type === 'addition';
                                            return (
                                                <tr key={adj.id} className="hover:bg-muted/60 transition-colors">
                                                    <td className="px-4 py-3.5 font-mono font-bold">{adj.reference_no}</td>
                                                    <td className="px-4 py-3.5 font-medium whitespace-nowrap text-xs text-muted-foreground">{formatDateWithTime(adj.date)}</td>
                                                    <td className="px-4 py-3.5 font-medium">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span>{adj.item?.name || 'Item Terhapus'}</span>
                                                            <span className="text-xs text-muted-foreground font-mono">({adj.item?.item_code || '-'})</span>
                                                            {adj.item?.deleted_at && (
                                                                <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] px-1.5 py-0 font-normal">
                                                                    Item Terhapus
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                                        {isAdd ? (
                                                            <Badge variant="outline" className="font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 inline-flex items-center gap-1">
                                                                <ArrowUp className="h-3 w-3" />
                                                                <span>+{adj.quantity} {adj.item?.unit?.short_name}</span>
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="font-bold bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 inline-flex items-center gap-1">
                                                                <ArrowDown className="h-3 w-3" />
                                                                <span>-{adj.quantity} {adj.item?.unit?.short_name}</span>
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                                        <Badge variant="outline" className={`font-semibold ${rBadge.color}`}>
                                                            {rBadge.label}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-muted-foreground text-xs">{adj.notes || '-'}</td>
                                                    <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                                                        <div className="flex items-center gap-1.5 flex-nowrap" title={adj.user?.name || 'Admin'}>
                                                            <span className="font-semibold text-foreground whitespace-nowrap truncate max-w-[140px]">
                                                                {formatShortName(adj.user?.name)}
                                                            </span>
                                                            {getRoleBadge(adj.user)}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(adj)}
                                                            className="h-8 w-8 text-destructive hover:bg-destructive/15 cursor-pointer"
                                                            title="Batalkan Penyesuaian Stok"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        <Pagination links={adjustments.links} total={adjustments.total} currentPageDataCount={adjustments.data.length} />
                    </CardContent>
                </Card>
            </div>

            {/* Modal Dialog Form */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-lg max-w-[95vw] rounded-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-primary text-base sm:text-lg">
                            <PackageCheck className="h-5 w-5" />
                            <span>Input Penyesuaian Stok (Stock Opname)</span>
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 pt-2 w-full min-w-0 max-w-full box-border">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                            <div className="space-y-1.5">
                                <Label htmlFor="ref_no" className="text-sm font-medium leading-none block">No. Referensi *</Label>
                                <Input
                                    id="ref_no"
                                    value={data.reference_no}
                                    onChange={(e) => setData('reference_no', e.target.value)}
                                    className="font-mono h-10"
                                />
                                {errors.reference_no && <p className="text-xs text-destructive">{errors.reference_no}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="tx_datetime" className="text-sm font-medium leading-none block">Tanggal & Jam *</Label>
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
                                    label: `[${it.item_code}] ${it.name} (Stok Saat Ini: ${it.stock} ${it.unit?.short_name})`,
                                }))}
                                value={data.item_id}
                                onValueChange={(val) => setData('item_id', val)}
                                placeholder="-- Cari & Pilih Suku Cadang --"
                                searchPlaceholder="Ketik nama atau kode sparepart..."
                            />
                            {errors.item_id && <p className="mt-1 text-xs text-destructive">{errors.item_id}</p>}
                        </div>

                        {selectedItem && (
                            <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground border border-border">
                                <span>Stok tercatat saat ini di sistem: </span>
                                <span className="font-bold text-foreground">
                                    {selectedItem.stock} {selectedItem.unit?.short_name}
                                </span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="type" className="mb-1 block">Tindakan Stok *</Label>
                                <Select value={data.type} onValueChange={(val: 'addition' | 'reduction') => setData('type', val)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Pilih Jenis" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="reduction">🔻 Pengurangan Stok (Rusak / Hilang)</SelectItem>
                                        <SelectItem value="addition">🔺 Penambahan Stok (Temuan Opname)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="reason" className="mb-1 block">Alasan Penyesuaian *</Label>
                                <Select value={data.reason} onValueChange={(val: 'damaged' | 'lost' | 'opname_difference' | 'other') => setData('reason', val)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Pilih Alasan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="damaged">🔴 Barang Rusak / Cacat</SelectItem>
                                        <SelectItem value="lost">🟠 Barang Hilang / Kurang</SelectItem>
                                        <SelectItem value="opname_difference">🔵 Selisih Stok Opname</SelectItem>
                                        <SelectItem value="other">⚪ Alasan Lainnya</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="qty">Jumlah Kuantitas Adjust *</Label>
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
                            <Label htmlFor="notes">Catatan & Keterangan Rinci *</Label>
                            <textarea
                                id="notes"
                                rows={2}
                                placeholder="Jelaskan alasan penyesuaian (misal: barang retak, hilang saat pengiriman)..."
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                            {errors.notes && <p className="mt-1 text-xs text-destructive">{errors.notes}</p>}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="cursor-pointer flex-1 sm:flex-initial">
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="cursor-pointer flex-1 sm:flex-initial">
                                {processing ? 'Menyimpan...' : 'Simpan Penyesuaian'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

StockAdjustmentsIndex.layout = {
    breadcrumbs: breadcrumbs,
};
