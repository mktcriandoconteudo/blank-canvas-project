import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80",
    title: "Caldas Novas",
    subtitle: "A capital das águas quentes",
  },
  {
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1600&q=80",
    title: "Parques Aquáticos",
    subtitle: "Diversão para toda a família",
  },
  {
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&q=80",
    title: "Resorts & Spas",
    subtitle: "Relaxe nas águas termais naturais",
  },
  {
    image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1600&q=80",
    title: "Lago Corumbá",
    subtitle: "Paisagens de tirar o fôlego",
  },
  {
    image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1600&q=80",
    title: "Hospedagem Premium",
    subtitle: "Conforto e sofisticação",
  },
];

const HeroBanner = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((c) => (c + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <div className="relative w-full h-[280px] sm:h-[360px] md:h-[440px] overflow-hidden">
      <AnimatePresence custom={direction} mode="popLayout">
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={slides[current].image}
            alt={slides[current].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-8 sm:bottom-12 left-0 right-0 text-center text-white px-4">
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {slides[current].title}
            </motion.h2>
            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mt-2 text-base sm:text-lg md:text-xl text-white/85 font-medium"
            >
              {slides[current].subtitle}
            </motion.p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Nav arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white p-2 rounded-full transition-colors z-10"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white p-2 rounded-full transition-colors z-10"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > current ? 1 : -1);
              setCurrent(i);
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              i === current ? "bg-white w-6" : "bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;
