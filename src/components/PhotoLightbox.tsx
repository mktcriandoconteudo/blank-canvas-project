import { useState, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface PhotoLightboxProps {
  photos: string[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
}

const PhotoLightbox = ({ photos, initialIndex, open, onClose }: PhotoLightboxProps) => {
  const [current, setCurrent] = useState(initialIndex);
  const [dragDirection, setDragDirection] = useState<"x" | "y" | null>(null);
  const [exitY, setExitY] = useState(0);
  const lockRef = useRef(false);

  // Reset index when opening
  const handleAnimationStart = () => {
    setCurrent(initialIndex);
  };

  const goNext = () => {
    if (current < photos.length - 1) setCurrent(current + 1);
  };

  const goPrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const { offset, velocity } = info;

    if (dragDirection === "y" && (offset.y > 100 || velocity.y > 500)) {
      setExitY(offset.y);
      onClose();
    } else if (dragDirection === "x") {
      if (offset.x < -50 || velocity.x < -300) {
        goNext();
      } else if (offset.x > 50 || velocity.x > 300) {
        goPrev();
      }
    }

    setDragDirection(null);
    lockRef.current = false;
  };

  const handleDrag = (_: any, info: PanInfo) => {
    if (!lockRef.current) {
      const absX = Math.abs(info.offset.x);
      const absY = Math.abs(info.offset.y);
      if (absX > 10 || absY > 10) {
        setDragDirection(absX > absY ? "x" : "y");
        lockRef.current = true;
      }
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          onAnimationStart={handleAnimationStart}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-[110] w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[110] text-white/70 text-sm font-medium">
            {current + 1} / {photos.length}
          </div>

          {/* Nav arrows (desktop) */}
          {current > 0 && (
            <button
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-[110] w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hidden md:flex"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          )}
          {current < photos.length - 1 && (
            <button
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-[110] w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hidden md:flex"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          )}

          {/* Photo */}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.7}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
            >
              <img
                src={photos[current]}
                alt={`Foto ${current + 1}`}
                className="max-w-full max-h-full object-contain select-none pointer-events-none"
                draggable={false}
              />
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-[110]">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all ${
                  i === current ? "bg-white w-5" : "bg-white/40 w-2"
                }`}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PhotoLightbox;
