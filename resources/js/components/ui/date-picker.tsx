import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DatePickerProps {
    value?: string; // YYYY-MM-DD format
    onChange: (date: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export function DatePicker({
    value,
    onChange,
    placeholder = 'Pilih tanggal...',
    className,
    disabled = false,
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Parse initial value or current date
    const selectedDate = React.useMemo(() => {
        if (!value) return null;
        const [year, month, day] = value.split('-').map(Number);
        if (!year || !month || !day) return null;
        return new Date(year, month - 1, day);
    }, [value]);

    const [viewDate, setViewDate] = React.useState(() => {
        return selectedDate || new Date();
    });

    React.useEffect(() => {
        if (selectedDate) {
            setViewDate(selectedDate);
        }
    }, [selectedDate]);

    // Close on click outside
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

    // Days in current view month
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = React.useMemo(() => {
        const result: (number | null)[] = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            result.push(null);
        }
        for (let d = 1; d <= daysInMonth; d++) {
            result.push(d);
        }
        return result;
    }, [firstDayOfMonth, daysInMonth]);

    const handleSelectDay = (day: number) => {
        const formattedMonth = String(month + 1).padStart(2, '0');
        const formattedDay = String(day).padStart(2, '0');
        const formattedDateString = `${year}-${formattedMonth}-${formattedDay}`;
        onChange(formattedDateString);
        setOpen(false);
    };

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setViewDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setViewDate(new Date(year, month + 1, 1));
    };

    const handleToday = (e: React.MouseEvent) => {
        e.stopPropagation();
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        onChange(`${y}-${m}-${d}`);
        setOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        setOpen(false);
    };

    const formattedDisplay = React.useMemo(() => {
        if (!selectedDate) return null;
        const d = String(selectedDate.getDate()).padStart(2, '0');
        const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const y = selectedDate.getFullYear();
        return `${d}/${m}/${y}`;
    }, [selectedDate]);

    return (
        <div ref={containerRef} className={cn('relative w-full min-w-0 max-w-full box-border', className)}>
            <Button
                type="button"
                variant="outline"
                disabled={disabled}
                onClick={() => setOpen(!open)}
                className="w-full min-w-0 max-w-full box-border justify-between px-3 font-normal text-left h-9 border-input bg-background dark:bg-input/30 cursor-pointer"
            >
                <div className="flex items-center gap-2 truncate">
                    <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>
                        {formattedDisplay ? (
                            formattedDisplay
                        ) : (
                            <span className="text-muted-foreground">{placeholder}</span>
                        )}
                    </span>
                </div>
                {value && (
                    <span
                        onClick={handleClear}
                        className="rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Bersihkan Tanggal"
                    >
                        <X className="h-3.5 w-3.5" />
                    </span>
                )}
            </Button>

            {open && (
                <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-lg border border-border bg-popover text-popover-foreground p-3 shadow-lg animate-in fade-in-0 zoom-in-95">
                    {/* Month / Year Header Navigation */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 cursor-pointer"
                            onClick={handlePrevMonth}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-bold">
                            {MONTH_NAMES[month]} {year}
                        </span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 cursor-pointer"
                            onClick={handleNextMonth}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Days Header */}
                    <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-muted-foreground mb-1">
                        {DAY_NAMES.map((d) => (
                            <div key={d} className="py-1">{d}</div>
                        ))}
                    </div>

                    {/* Date Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                        {days.map((day, idx) => {
                            if (day === null) {
                                return <div key={`empty-${idx}`} />;
                            }
                            const isSelected =
                                selectedDate &&
                                selectedDate.getFullYear() === year &&
                                selectedDate.getMonth() === month &&
                                selectedDate.getDate() === day;

                            const isToday =
                                new Date().getFullYear() === year &&
                                new Date().getMonth() === month &&
                                new Date().getDate() === day;

                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => handleSelectDay(day)}
                                    className={cn(
                                        'h-8 w-8 rounded-md flex items-center justify-center font-medium transition-colors cursor-pointer',
                                        isSelected
                                            ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                                            : isToday
                                            ? 'border border-primary text-primary font-bold hover:bg-accent'
                                            : 'hover:bg-accent hover:text-accent-foreground'
                                    )}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between border-t border-border pt-2 mt-3 text-xs">
                        <button
                            type="button"
                            onClick={handleToday}
                            className="font-medium text-primary hover:underline cursor-pointer"
                        >
                            Hari Ini
                        </button>
                        {value && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="font-medium text-destructive hover:underline cursor-pointer"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
