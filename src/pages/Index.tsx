import { Menu, User, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import HeroBanner from "@/components/HeroBanner";
import ResortCard from "@/components/ResortCard";

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
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return true;
  });
  const [resorts, setResorts] = useState<ResortWithCover[]>([]);
  const [logo, setLogo] = useState<LogoSettings>({ landing_logo_url: "", landing_logo_subtitle: "J G Locações" });

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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDark(!dark)}
            className="p-2.5 rounded-full bg-card/30 backdrop-blur-md border border-border/10"
          >
            {dark ? <Sun className="w-4 h-4 text-white" /> : <Moon className="w-4 h-4 text-white" />}
          </button>
          {logo.landing_logo_url && (
            <div className="flex flex-col items-center">
              <img src={logo.landing_logo_url} alt="Logo" className="h-8 w-auto object-contain drop-shadow-lg" />
              {logo.landing_logo_subtitle && (
                <span className="text-[8px] font-medium text-white/80 tracking-widest uppercase mt-0.5 drop-shadow" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {logo.landing_logo_subtitle}
                </span>
              )}
            </div>
          )}
        </div>
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
      <footer className="border-t border-border/50 py-10 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm text-muted-foreground">
          © 2026 Resorts · Termos · Privacidade · Mapa do site
        </div>
      </footer>
    </div>
  );
};

export default Index;
