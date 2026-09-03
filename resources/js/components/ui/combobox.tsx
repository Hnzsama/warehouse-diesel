import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ComboboxOption = {
    value: string;
    label: string;
};

interface ComboboxProps {
    options: ComboboxOption[];
    value?: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    className?: string;
    disabled?: boolean;
}

export function Combobox({
    options,
    value,
    onValueChange,
    placeholder = 'Pilih opsi...',
    searchPlaceholder = 'Ketik untuk mencari...',
    emptyText = 'Tidak ada data ditemukan.',
    className,
    disabled = false,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const containerRef = React.useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => String(opt.value) === String(value));

    const filteredOptions = React.useMemo(() => {
        if (!searchQuery.trim()) return options;
        const q = searchQuery.toLowerCase();
        return options.filter((opt) => opt.label.toLowerCase().includes(q));
    }, [options, searchQuery]);

    // Close popover when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    return (
        <div ref={containerRef} className={cn('relative w-full min-w-0 max-w-full box-border', className)}>
            <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={open}
                disabled={disabled}
                onClick={() => setOpen(!open)}
                className="w-full min-w-0 max-w-full box-border justify-between font-normal text-left px-3 h-9 border-input bg-background dark:bg-input/30 cursor-pointer"
            >
                <span className="truncate">
                    {selectedOption ? selectedOption.label : <span className="text-muted-foreground">{placeholder}</span>}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>

            {open && (
                <div className="absolute left-0 top-full z-50 mt-1 min-w-full max-w-[90vw] sm:max-w-md rounded-lg border border-border bg-popover text-popover-foreground shadow-xl animate-in fade-in-0 zoom-in-95">
                    {/* Search Input Box */}
                    <div className="flex items-center border-b border-border px-3 py-2 bg-muted/30">
                        <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex h-8 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                            autoFocus
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="text-muted-foreground hover:text-foreground cursor-pointer p-1"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Options List with Extended Height (max 10-12 visible items) */}
                    <div className="max-h-[340px] overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin">
                        {filteredOptions.length === 0 ? (
                            <div className="py-8 text-center text-xs text-muted-foreground">
                                {emptyText}
                            </div>
                        ) : (
                            filteredOptions.map((option) => {
                                const isSelected = String(option.value) === String(value);
                                return (
                                    <div
                                        key={option.value}
                                        onClick={() => {
                                            onValueChange(option.value);
                                            setOpen(false);
                                            setSearchQuery('');
                                        }}
                                        className={cn(
                                            'relative flex cursor-pointer select-none items-center rounded-md px-2.5 py-2 text-xs sm:text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
                                            isSelected && 'bg-accent font-semibold text-primary'
                                        )}
                                    >
                                        <Check
                                            className={cn(
                                                'mr-2 h-4 w-4 shrink-0 text-primary',
                                                isSelected ? 'opacity-100' : 'opacity-0'
                                            )}
                                        />
                                        <span className="break-words leading-tight">{option.label}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer counter info */}
                    <div className="border-t border-border px-3 py-1.5 text-[11px] text-muted-foreground bg-muted/20 flex items-center justify-between">
                        <span>Menampilkan {filteredOptions.length} dari {options.length} item</span>
                        <span className="text-[10px]">Gunakan pencarian untuk mempercepat</span>
                    </div>
                </div>
            )}
        </div>
    );
}
