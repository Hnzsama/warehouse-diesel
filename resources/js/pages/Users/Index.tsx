import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Plus,
    Search,
    Shield,
    Trash2,
    UserCheck,
    UserPlus,
} from 'lucide-react';
import { useState } from 'react';
import Pagination from '@/components/pagination';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { useInitials } from '@/hooks/use-initials';
import type { SharedData } from '@/types/auth';
import type { BreadcrumbItem } from '@/types';

type Role = { id: number; name: string };

type UserItem = {
    id: number;
    name: string;
    email: string;
    avatar_url?: string;
    created_at: string;
    roles?: Role[];
};

type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
};

type UsersIndexProps = {
    users: PaginatedData<UserItem>;
    roles: Role[];
    filters: {
        search?: string;
        role?: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Manajemen Pengguna', href: '/users' },
];

export default function UsersIndex({ users, roles, filters }: UsersIndexProps) {
    const { auth, flash } = usePage<SharedData>().props;
    const currentUser = auth.user;
    const getInitials = useInitials();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);

    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || '');

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'admin',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/users', { search, role: roleFilter }, { preserveState: true });
    };

    const openCreateModal = () => {
        setEditingUser(null);
        reset();
        setData({
            name: '',
            email: '',
            password: '',
            role: 'admin',
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (u: UserItem) => {
        setEditingUser(u);
        clearErrors();
        const primaryRole = u.roles && u.roles.length > 0 ? u.roles[0].name : 'admin';
        setData({
            name: u.name,
            email: u.email,
            password: '',
            role: primaryRole,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            put(`/users/${editingUser.id}`, {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            post('/users', {
                onSuccess: () => setIsModalOpen(false),
            });
        }
    };

    const handleDelete = (u: UserItem) => {
        if (u.id === currentUser.id) {
            alert('Anda tidak bisa menghapus akun Anda sendiri.');
            return;
        }
        if (confirm(`Apakah Anda yakin ingin menghapus akses pengguna "${u.name}"?`)) {
            destroy(`/users/${u.id}`);
        }
    };

    return (
        <>
            <Head title="Manajemen Admin Gudang & Pengguna" />

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

                {/* Page Title & Action */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
                            <span>Manajemen Pengguna</span>
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Kelola staf Admin Gudang baru dan otorisasi akses pengguna sistem. Klik baris untuk mengedit.
                        </p>
                    </div>

                    <Button onClick={openCreateModal} className="w-full sm:w-auto gap-2 shadow-sm cursor-pointer justify-center">
                        <UserPlus className="h-4 w-4" />
                        <span>+ Tambah Admin Gudang Baru</span>
                    </Button>
                </div>

                {/* Filter Bar */}
                <Card>
                    <CardContent className="p-3 sm:p-4">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Cari nama / email admin..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 w-full"
                                />
                            </div>
                            <Button type="submit" variant="secondary" className="cursor-pointer">
                                Cari
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Data Table */}
                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto w-full">
                            <Table className="w-full min-w-[600px]">
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="min-w-[150px]">Nama Pengguna</TableHead>
                                        <TableHead className="min-w-[180px]">Alamat Email</TableHead>
                                        <TableHead className="text-center min-w-[120px]">Peran Akses</TableHead>
                                        <TableHead className="text-center w-[80px]">Hapus</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="py-8 text-center text-xs text-muted-foreground">
                                                Tidak ada data pengguna ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        users.data.map((u) => {
                                            const isAdminRole = u.roles?.some((r) => r.name === 'admin');
                                            const isSelf = u.id === currentUser.id;
                                            return (
                                                <TableRow
                                                    key={u.id}
                                                    onClick={() => openEditModal(u)}
                                                    className="cursor-pointer hover:bg-muted/70 transition-colors group"
                                                    title="Klik untuk mengedit pengguna ini"
                                                >
                                                    <TableCell className="font-bold text-foreground group-hover:text-primary transition-colors py-2.5">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-9 w-9 overflow-hidden rounded-full border border-border/60 shrink-0 shadow-2xs">
                                                                <AvatarImage src={u.avatar_url} alt={u.name} />
                                                                <AvatarFallback className="bg-neutral-200 text-black dark:bg-neutral-800 dark:text-white font-bold text-xs">
                                                                    {getInitials(u.name)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-wrap items-center gap-1.5">
                                                                <span>{u.name}</span>
                                                                {isSelf && (
                                                                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-primary/10 text-primary border-primary/30">
                                                                        Akun Anda
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs text-muted-foreground break-all">{u.email}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge
                                                            variant="outline"
                                                            className={`gap-1 whitespace-nowrap ${
                                                                isAdminRole
                                                                    ? 'bg-primary/10 text-primary border-primary/20 font-medium'
                                                                    : 'bg-muted/60 text-muted-foreground border-border font-normal'
                                                            }`}
                                                        >
                                                            <Shield className="h-3 w-3" />
                                                            <span>{isAdminRole ? 'Admin Gudang' : 'Pemilik (Owner)'}</span>
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                                        {!isSelf ? (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDelete(u)}
                                                                className="h-8 w-8 text-destructive hover:bg-destructive/15 cursor-pointer"
                                                                title="Hapus Akses Pengguna"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">-</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        {/* Pagination */}
                        <Pagination links={users.links} total={users.total} currentPageDataCount={users.data.length} />
                    </CardContent>
                </Card>
            </div>

            {/* Modal Dialog Form */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md max-w-[95vw] rounded-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <UserCheck className="h-5 w-5 text-primary" />
                            <span>{editingUser ? 'Edit Data Pengguna' : 'Tambah Admin Gudang Baru'}</span>
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 pt-2 w-full min-w-0 max-w-full box-border">
                        <div>
                            <Label htmlFor="usr_name">Nama Lengkap *</Label>
                            <Input
                                id="usr_name"
                                placeholder="Contoh: Budi Santoso"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1"
                            />
                            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
                        </div>

                        <div>
                            <Label htmlFor="usr_email">Alamat Email *</Label>
                            <Input
                                id="usr_email"
                                type="email"
                                placeholder="budi@gudangdiesel.com"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="mt-1 font-mono"
                            />
                            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
                        </div>

                        <div>
                            <Label htmlFor="usr_password">
                                Kata Sandi {editingUser ? '(Kosongkan jika tidak diganti)' : '*'}
                            </Label>
                            <Input
                                id="usr_password"
                                type="password"
                                placeholder="••••••••"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="mt-1"
                            />
                            {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
                        </div>

                        <div>
                            <Label className="mb-1 block">Peran Akses Sistem *</Label>
                            <div className="flex items-center gap-2 rounded-md border border-border bg-muted p-2.5 text-xs text-foreground font-medium">
                                <Shield className="h-4 w-4 text-primary shrink-0" />
                                <span>Admin Gudang (Akses Penuh Operator Gudang)</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="cursor-pointer flex-1 sm:flex-initial">
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="cursor-pointer flex-1 sm:flex-initial">
                                {processing ? 'Menyimpan...' : 'Simpan Pengguna'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: breadcrumbs,
};
