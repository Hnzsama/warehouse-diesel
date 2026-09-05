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

type Category = {
    id: number;
    name: string;
    slug: string;
    items_count?: number;
};

type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
};

type CategoriesIndexProps = {
    categories: PaginatedData<Category>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Kategori Barang', href: '/categories' },
];

export default function CategoriesIndex({ categories }: CategoriesIndexProps) {
    const { flash } = usePage<SharedData>().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

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
    });

    const openCreateModal = () => {
        setEditingCategory(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        clearErrors();
        setData({ name: category.name });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            put(`/categories/${editingCategory.id}`, {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            post('/categories', {
                onSuccess: () => setIsModalOpen(false),
            });
        }
    };

    const handleDelete = (category: Category) => {
        setConfirmState({
            open: true,
            title: 'Hapus Kategori Sparepart',
            description: `Apakah Anda yakin ingin menghapus kategori "${category.name}"?`,
            confirmText: 'Hapus Kategori',
            variant: 'destructive',
            icon: 'trash',
            onConfirm: () => {
                destroy(`/categories/${category.id}`, {
                    onSuccess: () => setConfirmState((prev) => ({ ...prev, open: false })),
                });
            },
        });
    };

    return (
        <TooltipProvider>
            <Head title="Kategori Sparepart Diesel" />

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
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                            Kategori Sparepart
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Kelola kelompok pengelompokan suku cadang mesin dan peralatan diesel truk. Klik baris untuk mengedit data.
                        </p>
                    </div>

                    <Button onClick={openCreateModal} className="w-full sm:w-auto gap-2 shadow-sm cursor-pointer justify-center">
                        <Plus className="h-4 w-4" />
                        <span>Tambah Kategori</span>
                    </Button>
                </div>

                {/* Categories Table */}
                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto w-full">
                            <Table className="w-full min-w-[500px]">
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead>Nama Kategori</TableHead>
                                        <TableHead>Slug System</TableHead>
                                        <TableHead className="text-center">Jumlah Sparepart</TableHead>
                                        <TableHead className="text-center w-[60px]">Hapus</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categories.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="py-8 text-center text-xs text-muted-foreground">
                                                Belum ada data kategori.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        categories.data.map((cat) => (
                                            <TableRow
                                                key={cat.id}
                                                onClick={() => openEditModal(cat)}
                                                className="cursor-pointer hover:bg-muted/70 transition-colors group"
                                                title="Klik untuk mengedit kategori ini"
                                            >
                                                <TableCell className="font-bold text-foreground group-hover:text-primary transition-colors">{cat.name}</TableCell>
                                                <TableCell className="font-mono text-xs text-muted-foreground">{cat.slug}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline" className="whitespace-nowrap bg-muted/60 text-muted-foreground border-border font-medium">
                                                        {cat.items_count ?? 0} Item
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDelete(cat)}
                                                                className="h-8 w-8 text-destructive hover:bg-destructive/15 cursor-pointer"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Hapus Kategori</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        {/* Pagination */}
                        <Pagination links={categories.links} total={categories.total} currentPageDataCount={categories.data.length} />
                    </CardContent>
                </Card>
            </div>

            {/* Modal Dialog Form */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md max-w-[95vw] rounded-lg">
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg">{editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 pt-2 w-full min-w-0 max-w-full box-border">
                        <div>
                            <Label htmlFor="cat_name">Nama Kategori *</Label>
                            <Input
                                id="cat_name"
                                placeholder="Contoh: System Bahan Bakar"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1"
                            />
                            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="cursor-pointer flex-1 sm:flex-initial">
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="cursor-pointer flex-1 sm:flex-initial">
                                {processing ? 'Menyimpan...' : 'Simpan Kategori'}
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

CategoriesIndex.layout = {
    breadcrumbs: breadcrumbs,
};
