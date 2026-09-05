import { AlertTriangle, Archive, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type ConfirmDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'destructive' | 'warning' | 'default' | 'emerald';
    icon?: 'archive' | 'trash' | 'warning' | 'restore';
    onConfirm: () => void;
    isLoading?: boolean;
};

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmText = 'Konfirmasi',
    cancelText = 'Batal',
    variant = 'destructive',
    icon = 'archive',
    onConfirm,
    isLoading = false,
}: ConfirmDialogProps) {
    const renderIcon = () => {
        switch (icon) {
            case 'archive':
                return <Archive className="h-6 w-6 text-amber-500" />;
            case 'restore':
                return <RotateCcw className="h-6 w-6 text-emerald-500" />;
            case 'trash':
                return <Trash2 className="h-6 w-6 text-destructive" />;
            default:
                return <AlertTriangle className="h-6 w-6 text-amber-500" />;
        }
    };

    const getButtonClass = () => {
        switch (variant) {
            case 'destructive':
                return 'bg-destructive text-destructive-foreground hover:bg-destructive/90';
            case 'warning':
                return 'bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600';
            case 'emerald':
                return 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600';
            default:
                return 'bg-primary text-primary-foreground hover:bg-primary/90';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-w-[95vw] rounded-xl p-4 sm:p-6">
                <DialogHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-3 space-y-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted/80 border border-border">
                        {renderIcon()}
                    </div>
                    <div className="flex-1">
                        <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                            {title}
                        </DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                            {description}
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <DialogFooter className="flex flex-row items-center justify-end gap-2 pt-4 border-t border-border mt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                        className="cursor-pointer flex-1 sm:flex-initial text-xs sm:text-sm"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`cursor-pointer flex-1 sm:flex-initial text-xs sm:text-sm ${getButtonClass()}`}
                    >
                        {isLoading ? 'Memproses...' : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
