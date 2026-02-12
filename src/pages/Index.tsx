import { Menu, User, Moon, Sun, CalendarCheck, X, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import HeroBanner from "@/components/HeroBanner";
import ResortCard from "@/components/ResortCard";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";

interface LogoSettings {
  landing_logo_url: string;
  landing_logo_subtitle: string;
}

interface ResortWithCover {
  id: string;
  name: string;
  location: string;
  rating: number | null;
  reviews_count: number | null;
  price_per_night: number | null;
  tag: string | null;
  beds: number | null;
  max_guests: number | null;
  coverUrl: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return true;
  });
  const [resorts, setResorts] = useState<ResortWithCover[]>([]);
  const [logo, setLogo] = useState<LogoSettings>({ landing_logo_url: "", landing_logo_subtitle: "J G Locações" });
  const [showInfoCard, setShowInfoCard] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Check auth and show info card
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    // Show card after a short delay
    const timer = setTimeout(() => setShowInfoCard(true), 1500);
    return () => { subscription.unsubscribe(); clearTimeout(timer); };
  }, []);

  useEffect(() => {
    const fetchLogo = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["landing_logo_url", "landing_logo_subtitle"]);
      if (data) {
        const map: Record<string, string> = {};
        data.forEach(d => { map[d.key] = d.value; });
        setLogo(prev => ({ ...prev, ...map }));
      }
    };
    fetchLogo();
  }, []);
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const fetchResorts = async () => {
      // Only show condominiums (parent_id IS NULL) on explore page
      const { data } = await supabase
        .from("resorts")
        .select("id, name, location, rating, reviews_count, price_per_night, tag, beds, max_guests")
        .eq("is_active", true)
        .is("parent_id", null)
        .order("created_at", { ascending: false });

      if (!data || data.length === 0) return;

      // Fetch cover photos for all resorts
      const ids = data.map(r => r.id);
      const { data: photos } = await supabase
        .from("resort_photos")
        .select("resort_id, url, is_cover")
        .in("resort_id", ids)
        .order("display_order");

      const resortsWithCovers: ResortWithCover[] = data.map(r => {
        const resortPhotos = (photos || []).filter(p => p.resort_id === r.id);
        const cover = resortPhotos.find(p => p.is_cover) || resortPhotos[0];
        return {
          ...r,
          coverUrl: cover?.url || "",
        };
      });

      setResorts(resortsWithCovers);
    };

    fetchResorts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal header overlaid on banner */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-4">
        <button
          onClick={() => setDark(!dark)}
          className="p-2.5 rounded-full bg-card/30 backdrop-blur-md border border-border/10"
        >
          {dark ? <Sun className="w-4 h-4 text-white" /> : <Moon className="w-4 h-4 text-white" />}
        </button>
        <button className="flex items-center gap-2 bg-card/30 backdrop-blur-md border border-border/10 rounded-full px-3 py-2">
          <Menu className="w-4 h-4 text-white" />
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </button>
      </div>
      <HeroBanner />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
          {resorts.map((resort) => (
            <ResortCard
              key={resort.id}
              image={resort.coverUrl}
              title={resort.name}
              location={resort.location}
              rating={resort.rating ?? 0}
              reviews={resort.reviews_count ?? 0}
              price={resort.price_per_night ?? 0}
              dates=""
              tag={resort.tag ?? undefined}
              beds={resort.beds ?? 1}
              guests={resort.max_guests ?? 2}
             slug={resort.name.toLowerCase().replace(/\s+/g, '-')}
             linkPrefix="/condo"
            />
          ))}
        </div>
      </main>
      <Footer />

      {/* Sliding info card near user icon */}
      <AnimatePresence>
        {showInfoCard && (
          <motion.div
            initial={{ y: -20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-16 right-3 sm:right-5 z-[60] w-[280px] bg-card border border-border rounded-2xl shadow-2xl shadow-black/20 overflow-hidden"
          >
            {/* Arrow pointing up to the icon */}
            <div className="absolute -top-2 right-5 w-4 h-4 bg-card border-l border-t border-border rotate-45" />
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <button
                  onClick={() => setShowInfoCard(false)}
                  className="p-1 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Acompanhe suas reservas
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {user
                    ? "Acesse suas reservas e acompanhe o status de cada uma delas em tempo real."
                    : "Faça login ou crie sua conta para acompanhar o status das suas reservas em tempo real."
                  }
                </p>
              </div>
              <button
                onClick={() => {
                  setShowInfoCard(false);
                  if (user) {
                    navigate("/minhas-reservas");
                  } else {
                    setAuthOpen(true);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                {user ? (
                  <>
                    <CalendarCheck className="w-3.5 h-3.5" /> Ver minhas reservas
                  </>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5" /> Entrar ou criar conta
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} onSuccess={() => navigate("/minhas-reservas")} />
    </div>
  );
};

export default Index;
