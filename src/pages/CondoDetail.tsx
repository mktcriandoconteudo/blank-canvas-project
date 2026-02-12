import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Share2, Heart, Star, Home, ChevronRight, Sun, Moon, MapPin, Bed, Users, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import resort1Image from "@/assets/resort-1.webp";

interface Apartment {
  id: string;
  name: string;
  location: string;
  price_per_night: number | null;
  beds: number | null;
  max_guests: number | null;
  tag: string | null;
  coverUrl: string;
  slug: string;
}

const CondoDetail = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [liked, setLiked] = useState(false);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [condoName, setCondoName] = useState("");
  const [condoLocation, setCondoLocation] = useState("");
  const [condoDescription, setCondoDescription] = useState<string | null>(null);
  const [condoPhotos, setCondoPhotos] = useState<string[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);

  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const fetchCondo = async () => {
      // Find the condominium by slug
      const { data: condos } = await supabase
        .from("resorts")
        .select("id, name, location, description, rating, reviews_count")
        .is("parent_id", null)
        .eq("is_active", true);

      if (!condos || condos.length === 0) return;

      const condo = condos.find(c =>
        c.name.toLowerCase().replace(/\s+/g, '-') === slug
      );
      if (!condo) return;

      setCondoName(condo.name);
      setCondoLocation(condo.location);
      setCondoDescription(condo.description);

      // Fetch condo photos
      const { data: photos } = await supabase
        .from("resort_photos")
        .select("url")
        .eq("resort_id", condo.id)
        .order("display_order");

      if (photos && photos.length > 0) {
        setCondoPhotos(photos.map(p => p.url));
      }

      // Fetch apartments (children)
      const { data: apts } = await supabase
        .from("resorts")
        .select("id, name, location, price_per_night, beds, max_guests, tag")
        .eq("parent_id", condo.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (!apts || apts.length === 0) {
        setApartments([]);
        return;
      }

      // Fetch cover photos for apartments
      const aptIds = apts.map(a => a.id);
      const { data: aptPhotos } = await supabase
        .from("resort_photos")
        .select("resort_id, url, is_cover")
        .in("resort_id", aptIds)
        .order("display_order");

      const aptsWithCovers: Apartment[] = apts.map(a => {
        const resortPhotos = (aptPhotos || []).filter(p => p.resort_id === a.id);
        const cover = resortPhotos.find(p => p.is_cover) || resortPhotos[0];
        return {
          ...a,
          coverUrl: cover?.url || "",
          slug: a.name.toLowerCase().replace(/\s+/g, '-'),
        };
      });

      setApartments(aptsWithCovers);
    };

    fetchCondo();
  }, [slug]);

  const photos = condoPhotos.length > 0 ? condoPhotos.slice(0, 5) : [resort1Image];

  // Auto-play carousel
  useEffect(() => {
    if (photos.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => {
        setDirection(1);
        return (prev + 1) % photos.length;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [photos.length]);

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
      {/* Hero */}
      <div className="relative w-full" style={{ height: "50vh", minHeight: 300, maxHeight: 440 }}>
        <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: "0 0 50% 50% / 0 0 8% 8%" }}>
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
            onClick={() => navigate("/explore")}
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

        {/* Carousel arrows */}
        {photos.length > 1 && current > 0 && (
          <button onClick={() => goTo(current - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white p-1.5 rounded-full z-20">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {photos.length > 1 && current < photos.length - 1 && (
          <button onClick={() => goTo(current + 1)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white p-1.5 rounded-full z-20">
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Bottom content */}
        <div className="absolute bottom-10 left-6 right-6 z-20">
          <div className="w-8 h-8 rounded-lg bg-primary/80 flex items-center justify-center mb-2">
            <Building2 className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1
            className="text-white font-extrabold text-[26px] leading-tight drop-shadow-lg"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {condoName}
          </h1>
          <div className="flex items-center gap-1.5 text-white/80 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-sm font-medium">{condoLocation}</span>
          </div>
        </div>

        {/* Dots */}
        {photos.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all ${i === current ? "bg-white w-5" : "bg-white/40 w-2"}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-6 pt-6 pb-10 max-w-5xl mx-auto">
        {/* Description */}
        {condoDescription && (
          <div className="mb-8 rounded-[1.25rem] p-6" style={{ background: "hsl(340, 80%, 55%)" }}>
            <h2 className="text-base font-bold text-white mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Sobre o Condomínio
            </h2>
            <p className="text-sm text-white/90 leading-relaxed whitespace-pre-line">
              {condoDescription}
            </p>
          </div>
        )}

        {/* Apartments */}
        <h2 className="text-lg font-bold text-foreground mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Apartamentos Disponíveis
          {apartments.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({apartments.length} {apartments.length === 1 ? "unidade" : "unidades"})
            </span>
          )}
        </h2>

        {apartments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Nenhum apartamento disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
            {apartments.map((apt) => (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="group cursor-pointer"
                onClick={() => navigate(`/resort/${slug}/${apt.slug}`)}
              >
                <div className="relative overflow-hidden rounded-3xl aspect-[3/4] ring-1 ring-border/20 shadow-lg shadow-primary/5">
                  <img
                    src={apt.coverUrl || resort1Image}
                    alt={apt.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {apt.tag && (
                    <span className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-[10px] font-bold tracking-widest uppercase shadow-lg">
                      {apt.tag}
                    </span>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3
                      className="text-white font-extrabold text-xl leading-tight mb-1 drop-shadow-lg"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      {apt.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      {apt.price_per_night && (
                        <span className="flex items-center gap-1.5 bg-card/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/10">
                          <span className="text-[10px] font-normal opacity-80">a partir de</span> R$ {apt.price_per_night.toLocaleString("pt-BR")} <span className="text-[10px] font-normal opacity-80">/noite</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1 bg-card/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/10">
                        <Bed className="w-3 h-3" />
                        {apt.beds ?? 1} quartos
                      </span>
                      <span className="flex items-center gap-1 bg-card/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/10">
                        <Users className="w-3 h-3" />
                        {apt.max_guests ?? 2} hósp.
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 py-10 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm text-muted-foreground">
          © 2026 Resorts · Termos · Privacidade · Mapa do site
        </div>
      </footer>
    </div>
  );
};

export default CondoDetail;
