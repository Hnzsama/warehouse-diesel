import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type AvatarCropperModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    imageSrc: string | null;
    onCropComplete: (base64CroppedImage: string) => void;
};

export default function AvatarCropperModal({
    open,
    onOpenChange,
    imageSrc,
    onCropComplete,
}: AvatarCropperModalProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);
    const [zoom, setZoom] = useState<number>(1);
    const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    // Load image element when imageSrc changes
    useEffect(() => {
        if (!imageSrc) return;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imageSrc;
        img.onload = () => {
            setImgElement(img);
            setZoom(1);
            setPan({ x: 0, y: 0 });
        };
    }, [imageSrc]);

    // Draw canvas preview
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !imgElement) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = 320;
        canvas.width = size;
        canvas.height = size;

        // Clear canvas
        ctx.clearRect(0, 0, size, size);

        // Draw dark background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, size, size);

        // Calculate aspect fill scaling
        const scale = Math.max(size / imgElement.width, size / imgElement.height) * zoom;
        const drawW = imgElement.width * scale;
        const drawH = imgElement.height * scale;

        const drawX = (size - drawW) / 2 + pan.x;
        const drawY = (size - drawH) / 2 + pan.y;

        ctx.drawImage(imgElement, drawX, drawY, drawW, drawH);

        // Draw 1:1 circular crop mask overlay
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
        ctx.beginPath();
        ctx.rect(0, 0, size, size);
        ctx.arc(size / 2, size / 2, size / 2 - 10, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.restore();

        // Draw dashed guide circle
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 10, 0, Math.PI * 2);
        ctx.stroke();
    }, [imgElement, zoom, pan]);

    // Handle Pan dragging
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPan({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Touch event handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            setIsDragging(true);
            setDragStart({
                x: e.touches[0].clientX - pan.x,
                y: e.touches[0].clientY - pan.y,
            });
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || e.touches.length !== 1) return;
        setPan({
            x: e.touches[0].clientX - dragStart.x,
            y: e.touches[0].clientY - dragStart.y,
        });
    };

    // Crop high-resolution 400x400 output PNG
    const handleSaveCrop = () => {
        if (!imgElement) return;

        const outputCanvas = document.createElement('canvas');
        const outSize = 400;
        outputCanvas.width = outSize;
        outputCanvas.height = outSize;

        const ctx = outputCanvas.getContext('2d');
        if (!ctx) return;

        const size = 320;
        const scale = Math.max(size / imgElement.width, size / imgElement.height) * zoom;
        const drawW = imgElement.width * scale;
        const drawH = imgElement.height * scale;

        const drawX = (size - drawW) / 2 + pan.x;
        const drawY = (size - drawH) / 2 + pan.y;

        // Multiply coordinates to 400x400 resolution
        const factor = outSize / size;

        ctx.drawImage(
            imgElement,
            drawX * factor,
            drawY * factor,
            drawW * factor,
            drawH * factor
        );

        const base64Png = outputCanvas.toDataURL('image/png', 0.92);
        onCropComplete(base64Png);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-w-[95vw] rounded-xl">
                <DialogHeader>
                    <DialogTitle className="text-base sm:text-lg font-bold">
                        Potong Foto Profil (Rasio 1:1)
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2 w-full min-w-0 max-w-full box-border">
                    <p className="text-xs text-muted-foreground">
                        Geser gambar untuk mengatur posisi dan gunakan slider untuk memperbesar/memperkecil.
                    </p>

                    {/* Canvas Cropper Area */}
                    <div className="flex justify-center items-center bg-slate-900 rounded-lg p-2 overflow-hidden select-none">
                        <canvas
                            ref={canvasRef}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleMouseUp}
                            className="cursor-move rounded-md touch-none"
                        />
                    </div>

                    {/* Zoom & Reset Controls */}
                    <div className="flex items-center gap-3">
                        <ZoomOut className="h-4 w-4 text-muted-foreground shrink-0" />
                        <input
                            type="range"
                            min="0.6"
                            max="2.5"
                            step="0.05"
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="w-full accent-primary h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
                        />
                        <ZoomIn className="h-4 w-4 text-muted-foreground shrink-0" />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setZoom(1);
                                setPan({ x: 0, y: 0 });
                            }}
                            title="Reset Posisi"
                            className="h-8 w-8 shrink-0 cursor-pointer"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">
                            Batal
                        </Button>
                        <Button type="button" onClick={handleSaveCrop} className="cursor-pointer font-bold">
                            Potong & Simpan Foto
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
