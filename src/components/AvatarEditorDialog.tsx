import { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut, Check } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  onCropComplete: (blob: Blob) => void;
}

const AvatarEditorDialog = ({ open, onOpenChange, imageSrc, onCropComplete }: Props) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset on new image
  useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [imageSrc]);

  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    setDragging(true);
    const point = "touches" in e ? e.touches[0] : e;
    dragStart.current = { x: point.clientX, y: point.clientY };
    offsetStart.current = { ...offset };
  }, [offset]);

  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!dragging) return;
    const point = "touches" in e ? e.touches[0] : e;
    const dx = point.clientX - dragStart.current.x;
    const dy = point.clientY - dragStart.current.y;
    setOffset({
      x: offsetStart.current.x + dx,
      y: offsetStart.current.y + dy,
    });
  }, [dragging]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  const handleCrop = () => {
    const canvas = document.createElement("canvas");
    const size = 400;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Calculate how the image is displayed in the 240px container
      const containerSize = 240;
      const scale = zoom;

      // Image natural dimensions
      const imgAspect = img.naturalWidth / img.naturalHeight;
      let drawW: number, drawH: number;
      if (imgAspect > 1) {
        drawH = containerSize * scale;
        drawW = drawH * imgAspect;
      } else {
        drawW = containerSize * scale;
        drawH = drawW / imgAspect;
      }

      // Map offset from container coords to canvas coords
      const ratio = size / containerSize;
      const canvasOffX = offset.x * ratio;
      const canvasOffY = offset.y * ratio;
      const canvasDrawW = drawW * ratio;
      const canvasDrawH = drawH * ratio;

      // Center the image and apply offset
      const x = (size - canvasDrawW) / 2 + canvasOffX;
      const y = (size - canvasDrawH) / 2 + canvasOffY;

      // Clip to circle
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();

      ctx.drawImage(img, x, y, canvasDrawW, canvasDrawH);

      canvas.toBlob((blob) => {
        if (blob) onCropComplete(blob);
      }, "image/png", 0.9);
    };
    img.src = imageSrc;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-sm">Ajustar Avatar</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Crop area */}
          <div
            ref={containerRef}
            className="relative w-60 h-60 mx-auto rounded-full overflow-hidden border-4 border-primary/20 cursor-grab active:cursor-grabbing select-none bg-muted"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
          >
            <img
              src={imageSrc}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{
                transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`,
                transformOrigin: "center",
              }}
              draggable={false}
            />
          </div>

          {/* Zoom control */}
          <div className="flex items-center gap-3 px-4">
            <ZoomOut className="w-4 h-4 text-muted-foreground shrink-0" />
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.05}
              onValueChange={([v]) => setZoom(v)}
              className="flex-1"
            />
            <ZoomIn className="w-4 h-4 text-muted-foreground shrink-0" />
          </div>

          <Button onClick={handleCrop} className="w-full rounded-xl gap-2">
            <Check className="w-4 h-4" /> Salvar avatar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarEditorDialog;
