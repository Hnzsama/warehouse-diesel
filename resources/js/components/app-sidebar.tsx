import { Link, usePage } from '@inertiajs/react';
import {
    ArrowDownLeft,
    ArrowUpRight,
    Boxes,
    FileText,
    LayoutGrid,
    Package,
    ShieldCheck,
    SlidersHorizontal,
    Tags,
    Truck,
    UserCheck,
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { dashboard } from '@/routes';
import type { SharedData } from '@/types/auth';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const { isCurrentUrl } = useCurrentUrl();
    const user = auth?.user;
    const isAdmin = Boolean(
        user?.is_admin ||
        user?.roles?.some((r: any) => (typeof r === 'string' ? r === 'admin' : r?.name === 'admin')) ||
        !user?.is_pemilik
    );
    const isOwner = Boolean(
        user?.is_pemilik ||
        user?.roles?.some((r: any) => (typeof r === 'string' ? r === 'pemilik' : r?.name === 'pemilik'))
    );

    const hasMasterAccess = true;
    const hasTransactionAccess = true;
    const hasReportAccess = true;

    const roleBadgeText = user?.role_label || (isOwner ? 'Pemilik (Owner)' : 'Admin Gudang');

    const badgeColorClass = isOwner
        ? 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400'
        : 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400';

    return (
        <Sidebar collapsible="icon" variant="inset">
            {/* Premium Branding Header */}
            <SidebarHeader className="p-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-sidebar-accent/60 transition-all rounded-xl p-2">
                            <Link href={dashboard()} prefetch className="flex items-center gap-3">
                                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-950 via-slate-900 to-red-900 text-red-500 shadow-md shadow-red-950/30 ring-1 ring-white/10 dark:from-red-600 dark:to-red-700 dark:text-white">
                                    <AppLogoIcon className="h-5 w-5 fill-current text-red-500 dark:text-white" />
                                    <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-sidebar"></span>
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1 leading-none">
                                    <span className="font-extrabold tracking-tight text-sm text-sidebar-foreground">
                                        Gudang Diesel
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase border ${badgeColorClass}`}>
                                            <ShieldCheck className="h-3 w-3 shrink-0" />
                                            <span>{roleBadgeText}</span>
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Menu Items */}
            <SidebarContent className="px-2 py-1">
                {/* Menu Utama */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground/70 px-3 mb-1">
                        Menu Utama
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={isCurrentUrl('/dashboard')}
                                tooltip="Dashboard Monitoring"
                                className="rounded-lg font-medium text-sm gap-3 px-3 py-2.5 transition-colors"
                            >
                                <Link href={dashboard()} prefetch>
                                    <LayoutGrid className="h-4 w-4" />
                                    <span>Dashboard Monitoring</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>

                {/* Master Data */}
                {hasMasterAccess && (
                    <SidebarGroup className="mt-2">
                        <SidebarGroupLabel className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground/70 px-3 mb-1">
                            Master Data
                        </SidebarGroupLabel>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl('/items')}
                                    tooltip="Data Sparepart"
                                    className="rounded-lg font-medium text-sm gap-3 px-3 py-2.5 transition-colors"
                                >
                                    <Link href="/items">
                                        <Boxes className="h-4 w-4" />
                                        <span>Data Sparepart</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl('/categories')}
                                    tooltip="Kategori Barang"
                                    className="rounded-lg font-medium text-sm gap-3 px-3 py-2.5 transition-colors"
                                >
                                    <Link href="/categories">
                                        <Tags className="h-4 w-4" />
                                        <span>Kategori Barang</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl('/units')}
                                    tooltip="Satuan Barang"
                                    className="rounded-lg font-medium text-sm gap-3 px-3 py-2.5 transition-colors"
                                >
                                    <Link href="/units">
                                        <Package className="h-4 w-4" />
                                        <span>Satuan Barang</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl('/suppliers')}
                                    tooltip="Data Supplier"
                                    className="rounded-lg font-medium text-sm gap-3 px-3 py-2.5 transition-colors"
                                >
                                    <Link href="/suppliers">
                                        <Truck className="h-4 w-4 text-sky-500" />
                                        <span>Data Supplier</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl('/users')}
                                    tooltip="Kelola Pengguna"
                                    className="rounded-lg font-medium text-sm gap-3 px-3 py-2.5 transition-colors"
                                >
                                    <Link href="/users">
                                        <UserCheck className="h-4 w-4" />
                                        <span>Kelola Pengguna</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>
                )}

                {/* Transaksi Stok */}
                {hasTransactionAccess && (
                    <SidebarGroup className="mt-2">
                        <SidebarGroupLabel className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground/70 px-3 mb-1">
                            Transaksi Stok
                        </SidebarGroupLabel>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl('/incoming-items')}
                                    tooltip="Barang Masuk"
                                    className="rounded-lg font-medium text-sm gap-3 px-3 py-2.5 transition-colors"
                                >
                                    <Link href="/incoming-items">
                                        <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
                                        <span>Barang Masuk</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl('/outgoing-items')}
                                    tooltip="Barang Keluar"
                                    className="rounded-lg font-medium text-sm gap-3 px-3 py-2.5 transition-colors"
                                >
                                    <Link href="/outgoing-items">
                                        <ArrowUpRight className="h-4 w-4 text-amber-500" />
                                        <span>Barang Keluar</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl('/stock-adjustments')}
                                    tooltip="Penyesuaian Stok (Opname)"
                                    className="rounded-lg font-medium text-sm gap-3 px-3 py-2.5 transition-colors"
                                >
                                    <Link href="/stock-adjustments">
                                        <SlidersHorizontal className="h-4 w-4 text-purple-500" />
                                        <span>Penyesuaian Stok</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>
                )}

                {/* Laporan & Monitoring */}
                {hasReportAccess && (
                    <SidebarGroup className="mt-2">
                        <SidebarGroupLabel className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground/70 px-3 mb-1">
                            Laporan & Monitoring
                        </SidebarGroupLabel>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl('/reports')}
                                    tooltip="Laporan Persediaan"
                                    className="rounded-lg font-medium text-sm gap-3 px-3 py-2.5 transition-colors"
                                >
                                    <Link href="/reports">
                                        <FileText className="h-4 w-4 text-blue-500" />
                                        <span>Laporan Persediaan</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>
                )}
            </SidebarContent>

            {/* Sidebar Footer User Info */}
            <SidebarFooter className="p-3 border-t border-sidebar-border/50">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
