import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface Slide {
  id: string;
  image_url: string;
  title: string;
  subtitle: string;
}

const fallbackSlides: Slide[] = [
  { id: "1", image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80", title: "Caldas Novas", subtitle: "A capital das águas quentes" },
  { id: "2", image_url: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1600&q=80", title: "Parques Aquáticos", subtitle: "Diversão para toda a família" },
  { id: "3", image_url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&q=80", title: "Resorts & Spas", subtitle: "Relaxe nas águas termais naturais" },
];

const HeroBanner = () => {
  const [slides, setSlides] = useState<Slide[]>(fallbackSlides);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [mainTitle, setMainTitle] = useState("");
  const [mainSubtitle, setMainSubtitle] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoSubtitle, setLogoSubtitle] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const [slidesRes, settingsRes] = await Promise.all([
        supabase.from("hero_slides").select("id, image_url, title, subtitle").eq("is_active", true).order("display_order"),
        supabase.from("site_settings").select("key, value").in("key", ["hero_main_title", "hero_main_subtitle", "landing_logo_url", "landing_logo_subtitle"]),
      ]);
      if (slidesRes.data && slidesRes.data.length > 0) {
        setSlides(slidesRes.data as Slide[]);
      }
      if (settingsRes.data) {
        const t = settingsRes.data.find(d => d.key === "hero_main_title");
        const s = settingsRes.data.find(d => d.key === "hero_main_subtitle");
        const l = settingsRes.data.find(d => d.key === "landing_logo_url");
        const ls = settingsRes.data.find(d => d.key === "landing_logo_subtitle");
        if (t) setMainTitle(t.value);
        if (s) setMainSubtitle(s.value);
        if (l) setLogoUrl(l.value);
        if (ls) setLogoSubtitle(ls.value);
      }
    };
    fetchData();
  }, []);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((c) => (c + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <div>

      {/* Rotating banner */}
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
              src={slides[current]?.image_url}
              alt={slides[current]?.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

            {/* Centered logo + subtitle */}
            {logoUrl && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="flex flex-col items-center">
                  <img src={logoUrl} alt="Logo" className="h-16 sm:h-20 w-auto object-contain drop-shadow-xl" />
                  {logoSubtitle && (
                    <span className="text-xs sm:text-sm font-medium text-white/80 tracking-widest uppercase mt-1 drop-shadow-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {logoSubtitle}
                    </span>
                  )}
                </div>
              </div>
            )}
            {(slides[current]?.title || slides[current]?.subtitle) && (
              <div className="absolute bottom-14 sm:bottom-12 left-0 right-0 text-center text-white px-4">
                {slides[current]?.title && (
                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {slides[current].title}
                  </motion.h2>
                )}
                {slides[current]?.subtitle && (
                  <motion.p
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="mt-2 text-base sm:text-lg md:text-xl text-white/85 font-medium"
                  >
                    {slides[current].subtitle}
                  </motion.p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {slides.length > 1 && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};

export default HeroBanner;
