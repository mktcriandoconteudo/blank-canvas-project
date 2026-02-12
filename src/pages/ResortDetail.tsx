import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Share2, Heart, Star, Home, ChevronRight, Sun, Moon, AlertTriangle, Phone, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import resort1Image from "@/assets/resort-1.webp";
import BookingCard, { BookingCardRef } from "@/components/BookingCard";
import PricingPlans from "@/components/PricingPlans";
import PhotoLightbox from "@/components/PhotoLightbox";
import { useSelectorOptions } from "@/hooks/use-selector-options";
import { getIconComponent } from "@/components/IconPicker";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import Footer from "@/components/Footer";

// Dynamic FAQ component
const defaultFaqItems = [
  { id: "checkin", question: "Qual o horário de check-in e check-out?", answer: "O check-in é a partir das 14h e o check-out deve ser realizado até as 10h. Horários especiais podem ser solicitados com antecedência, sujeitos à disponibilidade." },
  { id: "pagamento", question: "Quais são as formas de pagamento?", answer: "Aceitamos PIX, cartão de crédito e transferência bancária. Pagamentos via PIX podem ter desconto especial. Consulte as condições na hora da reserva." },
  { id: "cancelamento", question: "Qual a política de cancelamento?", answer: "Cancelamentos com até 7 dias de antecedência têm reembolso integral. Entre 3 e 7 dias, é cobrada uma taxa de 50%. Cancelamentos com menos de 3 dias não são reembolsáveis." },
  { id: "animais", question: "É permitido levar animais de estimação?", answer: "A política de pets varia conforme o condomínio. Consulte diretamente conosco pelo WhatsApp para verificar se o apartamento aceita animais de estimação." },
  { id: "roupa-cama", question: "O apartamento fornece roupa de cama e toalhas?", answer: "Sim, o apartamento é equipado com roupa de cama, travesseiros e toalhas de banho para todos os hóspedes. Itens extras podem ser solicitados." },
  { id: "estacionamento", question: "Tem estacionamento disponível?", answer: "Sim, o condomínio conta com estacionamento privativo. A vaga é garantida para os hóspedes durante toda a estadia." },
  { id: "piscina", question: "As piscinas são de águas termais?", answer: "Sim, as piscinas do condomínio possuem águas termais naturais com temperatura entre 34°C e 42°C, disponíveis para uso durante todo o ano." },
];

const DynamicFaq = ({ resortId }: { resortId: string | null }) => {
  const [items, setItems] = useState<{ id: string; question: string; answer: string }[]>(defaultFaqItems);
  useEffect(() => {
    if (!resortId) return;
    supabase
      .from("faq_items")
      .select("id, question, answer")
      .eq("resort_id", resortId)
      .order("display_order")
      .then(({ data }) => { if (data && data.length > 0) setItems(data); });
  }, [resortId]);
  return (
    <div className="w-full max-w-md mx-auto bg-card border border-border rounded-2xl p-6">
      <h2 className="text-base font-bold text-foreground flex items-center gap-2 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <HelpCircle className="w-5 h-5 text-primary" />
        Perguntas Frequentes
      </h2>
      <Accordion type="single" collapsible className="w-full">
        {items.map(item => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger className="text-sm text-foreground hover:no-underline">{item.question}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

// Sub-components that use DB-driven options
const DynamicAmenities = ({ resortId, beds, guests }: { resortId: string | null; beds: number; guests: number }) => {
  const { options } = useSelectorOptions("amenity", resortId || undefined);
  if (options.length === 0) return null;
  return (
    <div className="flex gap-2 flex-wrap mb-7">
      {options.map(o => {
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

const DynamicCondoFeatures = ({ resortId }: { resortId: string | null }) => {
  const { options } = useSelectorOptions("condo_feature", resortId || undefined);
  if (options.length === 0) return null;
  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-7">
      <h2 className="text-base font-bold text-foreground mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        O que esse lugar oferece
      </h2>
      <div className="grid grid-cols-2 gap-y-4 gap-x-3">
        {options.map(o => {
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

const DynamicImportantInfo = ({ resortId }: { resortId: string | null }) => {
  const { options } = useSelectorOptions("important_info", resortId || undefined);
  if (options.length === 0) return null;
  return (
    <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6 mb-7">
      <h2 className="text-base font-bold text-destructive flex items-center gap-2 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <AlertTriangle className="w-5 h-5" />
        Informações Importantes
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-3">
        {options.map(o => {
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
  const { slug, aptSlug } = useParams();
  const bookingRef = useRef<BookingCardRef>(null);
  const bookingCardRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [liked, setLiked] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [dbPhotos, setDbPhotos] = useState<string[]>([]);
  const [resortAmenities, setResortAmenities] = useState<string[]>([]);
  const [resortDescription, setResortDescription] = useState<string | null>(null);
  const [resortName, setResortName] = useState<string>("");
  const [resortId, setResortId] = useState<string | null>(null);
  const [condoFeatures, setCondoFeatures] = useState<string[]>([]);
  const [importantInfo, setImportantInfo] = useState<string[]>([]);
  const [resortBeds, setResortBeds] = useState<number>(1);
  const [resortGuests, setResortGuests] = useState<number>(2);
  const [whatsapp, setWhatsapp] = useState<string | null>(null);
  // Fetch photos from database
  useEffect(() => {
    const fetchPhotos = async () => {
      // Determine which slug to use for finding the resort/apartment
      const targetSlug = aptSlug || slug;
      
      const { data: resorts } = await supabase
        .from("resorts")
        .select("id, name, amenities, description, condo_features, important_info, beds, max_guests")
        .eq("is_active", true);

      if (resorts && resorts.length > 0) {
        const resort = resorts.find(r => 
          r.name.toLowerCase().replace(/\s+/g, '-') === targetSlug
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

        // Fetch WhatsApp from payment config
        const { data: payConfig } = await supabase
          .from("resort_payment_config")
          .select("whatsapp")
          .eq("resort_id", resort.id)
          .maybeSingle();

        if (payConfig?.whatsapp) {
          setWhatsapp(payConfig.whatsapp);
        }
      }
    };
    fetchPhotos();
  }, [slug, aptSlug]);

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
            onClick={() => navigate(aptSlug ? `/condo/${slug}` : "/explore")}
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
            {resortName}
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
          <DynamicAmenities resortId={resortId} beds={resortBeds} guests={resortGuests} />

          {/* Description */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: 'hsl(340, 80%, 55%)' }}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Descrição
              </h2>
              {whatsapp && (
                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Gostaria de mais informações sobre o ' + resortName)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-white" />
                  </a>
                  <a
                    href={`tel:+${whatsapp.replace(/\D/g, '')}`}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-white" />
                  </a>
                </div>
              )}
            </div>
            <p className="text-sm text-white/90 leading-relaxed whitespace-pre-line">
              {resortDescription || "Descrição não disponível."}
            </p>
          </div>

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
          <DynamicCondoFeatures resortId={resortId} />

          {/* Informações Importantes */}
          <DynamicImportantInfo resortId={resortId} />

          {/* Pricing Plans */}
          <PricingPlans
            resortId={resortId ?? undefined}
            onSelectPlan={(plan) => {
              bookingRef.current?.selectPlan(plan);
            }}
          />
        </div>

        {/* Booking Card + FAQ side by side on desktop */}
        <div className="w-full flex flex-col lg:flex-row gap-8 lg:items-start">
          <div className="w-full lg:flex-1 max-w-md mx-auto lg:mx-0 lg:order-2" ref={bookingCardRef}>
            <BookingCard ref={bookingRef} resortId={resortId} />
          </div>
          <div className="w-full lg:flex-1 max-w-md mx-auto lg:mx-0 lg:order-1">
            <DynamicFaq resortId={resortId} />
          </div>
        </div>

        {/* Still have questions? */}
        {whatsapp && (
          <div className="w-full max-w-md mx-auto bg-card border border-border rounded-2xl p-6 text-center">
            <h2 className="text-base font-bold text-foreground mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Ainda tem dúvidas?
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Fale diretamente conosco, estamos prontos para te ajudar!
            </p>
            <div className="flex gap-3 justify-center">
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Gostaria de mais informações sobre o ' + resortName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-bold text-sm transition-all hover:brightness-110 shadow-lg"
                style={{ background: "#25D366" }}
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
              <a
                href={`tel:+${whatsapp.replace(/\D/g, '')}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm transition-all hover:brightness-110 shadow-lg"
              >
                <Phone className="w-4 h-4" />
                Ligar
              </a>
            </div>
          </div>
        )}
      </div>
      {/* Photo Lightbox */}
      <PhotoLightbox
        photos={galleryPhotos}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
      <Footer />
    </div>
  );
};

export default ResortDetail;
