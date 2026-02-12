import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Share2, Heart, Star, Home, ChevronRight, Sun, Moon, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import resort1Image from "@/assets/resort-1.webp";
import BookingCard from "@/components/BookingCard";
import PricingPlans from "@/components/PricingPlans";
import PhotoLightbox from "@/components/PhotoLightbox";
import { useSelectorOptions } from "@/hooks/use-selector-options";
import { getIconComponent } from "@/components/IconPicker";

// Sub-components that use DB-driven options
const DynamicAmenities = ({ keys, beds, guests }: { keys: string[]; beds: number; guests: number }) => {
  const { options } = useSelectorOptions("amenity");
  const filtered = keys.length > 0 ? options.filter(o => keys.includes(o.key)) : options.slice(0, 4);
  return (
    <div className="flex gap-2 flex-wrap mb-7">
      {filtered.map(o => {
        const Icon = getIconComponent(o.icon_name);
        const count = o.key === "quartos" ? beds : o.key === "hospedes" ? guests : null;
        return (
          <span key={o.id} className="flex items-center gap-1.5 bg-secondary text-secondary-foreground text-xs font-semibold px-4 py-2.5 rounded-2xl border border-border">
            {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
            {count ? `${count} ${o.label}` : o.label}
          </span>
        );
      })}
    </div>
  );
};

const DynamicCondoFeatures = ({ keys }: { keys: string[] }) => {
  const { options } = useSelectorOptions("condo_feature");
  const filtered = keys.length > 0 ? options.filter(o => keys.includes(o.key)) : options.slice(0, 10);
  if (filtered.length === 0) return null;
  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-7">
      <h2 className="text-base font-bold text-foreground mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        O que esse lugar oferece
      </h2>
      <div className="grid grid-cols-2 gap-y-4 gap-x-3">
        {filtered.map(o => {
          const Icon = getIconComponent(o.icon_name);
          return (
            <div key={o.id} className="flex items-start gap-2.5">
              {Icon && <Icon className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />}
              <span className="text-sm text-foreground leading-tight">{o.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DynamicImportantInfo = ({ keys }: { keys: string[] }) => {
  const { options } = useSelectorOptions("important_info");
  const filtered = options.filter(o => keys.includes(o.key));
  if (filtered.length === 0) return null;
  return (
    <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6 mb-7">
      <h2 className="text-base font-bold text-destructive flex items-center gap-2 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <AlertTriangle className="w-5 h-5" />
        Informações Importantes
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-3">
        {filtered.map(o => {
          const Icon = getIconComponent(o.icon_name);
          return (
            <div key={o.id} className="flex items-start gap-2.5">
              {Icon && <Icon className="w-5 h-5 text-destructive shrink-0 mt-0.5" />}
              <span className="text-sm text-foreground leading-tight">{o.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ResortDetail = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [liked, setLiked] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [dbPhotos, setDbPhotos] = useState<string[]>([]);
  const [resortAmenities, setResortAmenities] = useState<string[]>([]);
  const [resortDescription, setResortDescription] = useState<string | null>(null);
  const [resortName, setResortName] = useState<string>("Condomínio Enseada");
  const [resortId, setResortId] = useState<string | null>(null);
  const [condoFeatures, setCondoFeatures] = useState<string[]>([]);
  const [importantInfo, setImportantInfo] = useState<string[]>([]);
  const [resortBeds, setResortBeds] = useState<number>(1);
  const [resortGuests, setResortGuests] = useState<number>(2);

  // Fetch photos from database
  useEffect(() => {
    const fetchPhotos = async () => {
      // Find resort by slug (name converted to slug)
      const { data: resorts } = await supabase
        .from("resorts")
        .select("id, name, amenities, description, condo_features, important_info, beds, max_guests")
        .eq("is_active", true);

      if (resorts && resorts.length > 0) {
        const resort = resorts.find(r => 
          r.name.toLowerCase().replace(/\s+/g, '-') === slug
        ) || resorts[0];

        setResortAmenities((resort as any).amenities || []);
        setResortDescription((resort as any).description || null);
        setResortName(resort.name);
        setResortId(resort.id);
        setCondoFeatures((resort as any).condo_features || []);
        setImportantInfo((resort as any).important_info || []);
        setResortBeds((resort as any).beds || 1);
        setResortGuests((resort as any).max_guests || 2);

        const { data: photos } = await supabase
          .from("resort_photos")
          .select("url, is_cover, display_order")
          .eq("resort_id", resort.id)
          .order("display_order");

        if (photos && photos.length > 0) {
          setDbPhotos(photos.map(p => p.url));
        }
      }
    };
    fetchPhotos();
  }, [slug]);

  // Use DB photos if available, fallback to default
  const photos = dbPhotos.length > 0 ? dbPhotos.slice(0, 3) : [resort1Image];
  const galleryPhotos = dbPhotos.length > 0 ? dbPhotos : [resort1Image];

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  // Auto-play carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => {
        const next = (prev + 1) % photos.length;
        setDirection(1);
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

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
      <div className="px-6 pt-6 pb-10 max-w-5xl mx-auto flex flex-col gap-8">
        {/* Left: Info */}
        <div className="flex-1 min-w-0">
          {/* Popular Amenities */}
          <h2 className="text-base font-bold text-foreground mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Comodidades Populares
          </h2>
          <DynamicAmenities keys={resortAmenities} beds={resortBeds} guests={resortGuests} />

          {/* Description */}
          <h2 className="text-base font-bold text-foreground mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Descrição
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {resortDescription || "O Condomínio Enseada oferece estadias de luxo com acesso a piscinas de águas termais naturais, vista panorâmica e ambientes elegantes. Ideal para famílias, o resort conta com 3 quartos espaçosos, área gourmet completa e estacionamento privativo."}
          </p>

          {/* Gallery */}
          <h2 className="text-base font-bold text-foreground mb-4 mt-7" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Galeria de Fotos
          </h2>
          <div className="grid grid-cols-3 gap-1 rounded-2xl overflow-hidden mb-7">
             {galleryPhotos.map((src, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="aspect-square overflow-hidden cursor-pointer group"
                onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}
              >
                <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </motion.div>
            ))}
          </div>

          {/* O que esse lugar oferece */}
          <DynamicCondoFeatures keys={condoFeatures} />

          {/* Informações Importantes */}
          <DynamicImportantInfo keys={importantInfo} />

          {/* Pricing Plans */}
          <PricingPlans resortId={resortId ?? undefined} />
        </div>

        {/* Booking Card - full width at bottom */}
        <div className="w-full max-w-md mx-auto">
          <BookingCard />
        </div>
      </div>
      {/* Photo Lightbox */}
      <PhotoLightbox
        photos={galleryPhotos}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
};

export default ResortDetail;
