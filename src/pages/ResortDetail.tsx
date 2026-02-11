import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Share2, Heart, Star, Bed, Wifi, Tv, Users, MapPin, ChevronRight } from "lucide-react";
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
  { icon: Users, label: "6 Hóspedes" },
];

const ResortDetail = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [liked, setLiked] = useState(false);

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
    <div className="min-h-screen bg-background">
      {/* Photo carousel */}
      <div className="relative w-full h-[320px] sm:h-[400px] overflow-hidden rounded-b-[2.5rem]">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top nav */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-full bg-card/30 backdrop-blur-md border border-border/10"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex gap-2">
            <button className="p-2.5 rounded-full bg-card/30 backdrop-blur-md border border-border/10">
              <Share2 className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => setLiked(!liked)}
              className="p-2.5 rounded-full bg-card/30 backdrop-blur-md border border-border/10"
            >
              <Heart className={`w-4 h-4 transition-all ${liked ? "fill-primary text-primary" : "text-white"}`} />
            </button>
          </div>
        </div>

        {/* Carousel arrows */}
        {current > 0 && (
          <button
            onClick={() => goTo(current - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white p-2 rounded-full z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {current < photos.length - 1 && (
          <button
            onClick={() => goTo(current + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white p-2 rounded-full z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Bottom overlay */}
        <div className="absolute bottom-6 left-5 right-5 z-10">
          <h1
            className="text-white font-extrabold text-2xl sm:text-3xl drop-shadow-lg leading-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Condomínio Enseada
          </h1>
          <div className="flex items-center gap-2 mt-1.5">
            <MapPin className="w-3.5 h-3.5 text-white/75" />
            <span className="text-sm text-white/75 font-medium">Caldas Novas, GO</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex -space-x-2">
              {[0, 1].map((i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-primary/60 border-2 border-white/30" />
              ))}
            </div>
            <span className="flex items-center gap-1 text-white/85 text-xs font-semibold">
              <Star className="w-3 h-3 fill-primary text-primary" />
              4.9 · 342 avaliações
            </span>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === current ? "bg-white w-5" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6 max-w-2xl mx-auto">
        {/* Amenities */}
        <h2
          className="text-lg font-bold text-foreground mb-3"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Comodidades
        </h2>
        <div className="flex gap-2 flex-wrap mb-6">
          {amenities.map((a) => (
            <span
              key={a.label}
              className="flex items-center gap-1.5 bg-secondary text-secondary-foreground text-xs font-semibold px-3.5 py-2 rounded-xl border border-border"
            >
              <a.icon className="w-3.5 h-3.5" />
              {a.label}
            </span>
          ))}
        </div>

        {/* Description */}
        <h2
          className="text-lg font-bold text-foreground mb-2"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Descrição
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
          O Condomínio Enseada oferece estadias de luxo com acesso a piscinas de águas termais naturais,
          vista panorâmica e ambientes elegantes. Ideal para famílias, o resort conta com 3 quartos espaçosos,
          área gourmet completa, Wi-Fi de alta velocidade e estacionamento privativo.
          Localizado no coração de Caldas Novas, próximo aos principais parques aquáticos e atrações turísticas.
        </p>

        {/* Bottom bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border px-5 py-4 flex items-center justify-between z-50">
          <div>
            <span className="text-xl font-bold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              R$ 1.250
            </span>
            <span className="text-sm text-muted-foreground">/ noite</span>
          </div>
          <button className="bg-primary text-primary-foreground font-bold text-sm px-6 py-3 rounded-2xl shadow-lg shadow-primary/30 hover:opacity-90 transition-opacity">
            Reservar
          </button>
        </div>

        {/* Spacer for fixed bottom bar */}
        <div className="h-20" />
      </div>
    </div>
  );
};

export default ResortDetail;
