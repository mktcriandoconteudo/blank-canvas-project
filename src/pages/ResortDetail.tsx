import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Share2, Heart, Star, Bed, Wifi, Tv, Users, Home, ChevronRight, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import resort1Image from "@/assets/resort-1.webp";

const photos = [
  resort1Image,
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
  "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80",
];

const amenities = [
  { icon: Bed, label: "3 Quartos" },
  { icon: Tv, label: "Smart TV" },
  { icon: Wifi, label: "Wi-Fi" },
  { icon: Users, label: "6 Hósp." },
];

const ResortDetail = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [liked, setLiked] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const goTo = (i: number) => {
    setDirection(i > current ? 1 : -1);
    setCurrent(i);
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* ===== HERO PHOTO SECTION ===== */}
      <div className="relative w-full" style={{ height: "55vh", minHeight: 320, maxHeight: 480 }}>
        {/* Curved clip */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            borderRadius: "0 0 50% 50% / 0 0 8% 8%",
          }}
        >
          <AnimatePresence custom={direction} mode="popLayout">
            <motion.img
              key={current}
              src={photos[current]}
              alt={`Foto ${current + 1}`}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
        </div>

        {/* Top bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate("/explore");
              }
            }}
            className="w-10 h-10 rounded-full bg-card/30 backdrop-blur-md border border-border/10 flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setDark(!dark)}
              className="w-10 h-10 rounded-full bg-card/30 backdrop-blur-md border border-border/10 flex items-center justify-center"
            >
              {dark ? <Sun className="w-4 h-4 text-white" /> : <Moon className="w-4 h-4 text-white" />}
            </button>
            <button className="w-10 h-10 rounded-full bg-card/30 backdrop-blur-md border border-border/10 flex items-center justify-center">
              <Share2 className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => setLiked(!liked)}
              className="w-10 h-10 rounded-full bg-card/30 backdrop-blur-md border border-border/10 flex items-center justify-center"
            >
              <Heart className={`w-4 h-4 transition-all ${liked ? "fill-primary text-primary" : "text-white"}`} />
            </button>
          </div>
        </div>

        {/* Carousel nav arrows */}
        {current > 0 && (
          <button
            onClick={() => goTo(current - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white p-1.5 rounded-full z-20"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {current < photos.length - 1 && (
          <button
            onClick={() => goTo(current + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white p-1.5 rounded-full z-20"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Bottom content over photo */}
        <div className="absolute bottom-10 left-6 right-6 z-20">
          {/* Home icon */}
          <div className="w-8 h-8 rounded-lg bg-primary/80 flex items-center justify-center mb-2">
            <Home className="w-4 h-4 text-primary-foreground" />
          </div>

          <h1
            className="text-white font-extrabold text-[26px] leading-tight drop-shadow-lg"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Condomínio{"\n"}Enseada
          </h1>

          {/* Avatars + reviews */}
          <div className="flex items-center gap-2.5 mt-2">
            <div className="flex -space-x-1.5">
              <div className="w-6 h-6 rounded-full bg-primary/70 border-2 border-white/40" />
              <div className="w-6 h-6 rounded-full bg-accent/70 border-2 border-white/40" />
            </div>
            <span className="flex items-center gap-1 text-white/90 text-xs font-semibold">
              <Star className="w-3 h-3 fill-primary text-primary" />
              342 avaliações
            </span>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all ${
                i === current ? "bg-white w-5" : "bg-white/40 w-2"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ===== SCROLLABLE CONTENT ===== */}
      <div className="px-6 pt-6 pb-28 max-w-lg mx-auto">
        {/* Popular Amenities */}
        <h2
          className="text-base font-bold text-foreground mb-3"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Comodidades Populares
        </h2>
        <div className="flex gap-2 flex-wrap mb-7">
          {amenities.map((a) => (
            <span
              key={a.label}
              className="flex items-center gap-1.5 bg-secondary text-secondary-foreground text-xs font-semibold px-4 py-2.5 rounded-2xl border border-border"
            >
              <a.icon className="w-4 h-4 text-muted-foreground" />
              {a.label}
            </span>
          ))}
        </div>

        {/* Description */}
        <h2
          className="text-base font-bold text-foreground mb-2"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Descrição
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          O Condomínio Enseada oferece estadias de luxo com acesso a piscinas de águas termais naturais,
          vista panorâmica e ambientes elegantes. Ideal para famílias, o resort conta com 3 quartos espaçosos,
          área gourmet completa e estacionamento privativo.{" "}
          <span className="text-primary font-semibold cursor-pointer">Ver Mais...</span>
        </p>
      </div>

      {/* ===== FIXED BOTTOM BAR ===== */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-6 py-4 flex items-center justify-between z-50">
        <div>
          <span
            className="text-xl font-extrabold text-foreground"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            R$ 1.250
          </span>
          <span className="text-sm text-muted-foreground ml-0.5">/ noite</span>
        </div>
        <button className="bg-primary text-primary-foreground font-bold text-sm px-7 py-3 rounded-2xl shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity">
          Reservar
        </button>
      </div>
    </div>
  );
};

export default ResortDetail;
