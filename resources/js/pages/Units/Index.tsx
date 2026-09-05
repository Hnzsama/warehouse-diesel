import { Head, router, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Plus, Trash2 } from 'lucide-react';
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

type Unit = {
    id: number;
    name: string;
    short_name: string;
    items_count?: number;
};

type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
};

type UnitsIndexProps = {
    units: PaginatedData<Unit>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Satuan Barang', href: '/units' },
];

export default function UnitsIndex({ units }: UnitsIndexProps) {
    const { auth, flash } = usePage<SharedData>().props;
    const user = auth.user;
    const isOwner = Boolean(
        user.is_pemilik ||
        user.roles?.some((r: any) => (typeof r === 'string' ? r === 'pemilik' : r?.name === 'pemilik'))
    );

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

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
        name: '',
        short_name: '',
    });

    const openCreateModal = () => {
        setEditingUnit(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (unit: Unit) => {
        setEditingUnit(unit);
        clearErrors();
        setData({ name: unit.name, short_name: unit.short_name });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUnit) {
            put(`/units/${editingUnit.id}`, {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            post('/units', {
                onSuccess: () => setIsModalOpen(false),
            });
        }
    };

    const handleDelete = (unit: Unit) => {
        setConfirmState({
            open: true,
            title: 'Hapus Satuan Barang',
            description: `Apakah Anda yakin ingin menghapus satuan "${unit.name}"?`,
            confirmText: 'Hapus Satuan',
            variant: 'destructive',
            icon: 'trash',
            onConfirm: () => {
                destroy(`/units/${unit.id}`, {
                    onSuccess: () => setConfirmState((prev) => ({ ...prev, open: false })),
                });
            },
        });
    };

    return (
        <TooltipProvider>
            <Head title="Satuan Barang Sparepart" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                        <span className="text-sm font-medium">{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <span className="text-sm font-medium">{flash.error}</span>
                    </div>
                )}

                {/* Header Title & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Satuan Barang
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Kelola unit/satuan kuantitas barang (misal: Pcs, Set, Pail, Unit, Botol). Klik baris untuk mengedit data.
                        </p>
                    </div>

                    {!isOwner && (
                        <Button onClick={openCreateModal} className="gap-2 shadow-sm cursor-pointer">
                            <Plus className="h-4 w-4" />
                            <span>Tambah Satuan</span>
                        </Button>
                    )}
                </div>

                {/* Units Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead>Nama Satuan</TableHead>
                                    <TableHead>Singkatan</TableHead>
                                    <TableHead className="text-center">Jumlah Sparepart</TableHead>
                                    {!isOwner && <TableHead className="text-center">Hapus</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {units.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={isOwner ? 3 : 4} className="py-8 text-center text-xs text-muted-foreground">
                                            Belum ada data satuan barang.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    units.data.map((unit) => (
                                        <TableRow
                                            key={unit.id}
                                            onClick={() => (!isOwner ? openEditModal(unit) : undefined)}
                                            className={`transition-colors group ${!isOwner ? 'cursor-pointer hover:bg-muted/70' : ''}`}
                                            title={!isOwner ? 'Klik untuk mengedit satuan ini' : undefined}
                                        >
                                            <TableCell className="font-bold text-foreground group-hover:text-primary transition-colors">{unit.name}</TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">{unit.short_name}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline" className="whitespace-nowrap bg-muted/60 text-muted-foreground border-border font-medium">
                                                    {unit.items_count ?? 0} Item
                                                </Badge>
                                            </TableCell>
                                            {!isOwner && (
                                                <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDelete(unit)}
                                                                className="h-8 w-8 text-destructive hover:bg-destructive/15 cursor-pointer"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Hapus Satuan</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                        {/* Pagination */}
                        <Pagination links={units.links} total={units.total} currentPageDataCount={units.data.length} />
                    </CardContent>
                </Card>
            </div>

            {/* Modal Dialog Form */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingUnit ? 'Edit Satuan Barang' : 'Tambah Satuan Baru'}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 pt-2 w-full min-w-0 max-w-full box-border">
                        <div>
                            <Label htmlFor="unit_name">Nama Satuan *</Label>
                            <Input
                                id="unit_name"
                                placeholder="Contoh: Piece / Paket"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1"
                            />
                            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
                        </div>

                        <div>
                            <Label htmlFor="short_name">Singkatan Teks *</Label>
                            <Input
                                id="short_name"
                                placeholder="Contoh: pcs / set / pl"
                                value={data.short_name}
                                onChange={(e) => setData('short_name', e.target.value)}
                                className="mt-1 font-mono"
                            />
                            {errors.short_name && <p className="mt-1 text-xs text-destructive">{errors.short_name}</p>}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="cursor-pointer">
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="cursor-pointer">
                                {processing ? 'Menyimpan...' : 'Simpan Satuan'}
                            </Button>
                        </div>
                    </form>
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

UnitsIndex.layout = {
    breadcrumbs: breadcrumbs,
};
