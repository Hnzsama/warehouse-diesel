import { Link } from '@inertiajs/react';

type PaginationProps = {
    links: { url: string | null; label: string; active: boolean }[];
    total?: number;
    currentPageDataCount?: number;
};

export default function Pagination({ links, total, currentPageDataCount }: PaginationProps) {
    if (!links || links.length <= 3) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border px-4 py-3 gap-3">
            {typeof total !== 'undefined' && typeof currentPageDataCount !== 'undefined' ? (
                <span className="text-xs text-muted-foreground text-center sm:text-left">
                    Menampilkan {currentPageDataCount} dari {total} data
                </span>
            ) : (
                <div />
            )}

            <div className="flex flex-wrap items-center justify-center gap-1">
                {links.map((link, idx) => {
                    if (!link.url) {
                        return (
                            <span
                                key={idx}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className="h-8 px-3 py-1 text-xs rounded-md border border-border bg-muted/30 text-muted-foreground opacity-50 pointer-events-none flex items-center justify-center min-w-[32px] select-none"
                            />
                        );
                    }
                    return (
                        <Link
                            key={idx}
                            href={link.url}
                            preserveState
                            preserveScroll
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            className={`h-8 px-3 py-1 text-xs rounded-md border transition-colors flex items-center justify-center min-w-[32px] font-medium ${
                                link.active
                                    ? 'bg-primary text-primary-foreground border-primary shadow-xs font-bold'
                                    : 'bg-card text-foreground border-border hover:bg-muted/80'
                            }`}
                        />
                    );
                })}
            </div>
        </div>
    );
}
