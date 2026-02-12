import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MapPin, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import landingBgDefault from "@/assets/landing-bg.webp";

const LANDING_KEYS = [
  "landing_badge",
  "landing_label",
  "landing_title",
  "landing_subtitle",
  "landing_button_text",
  "landing_button_color",
  "landing_button_text_color",
  "landing_bg_url",
  "landing_logo_url",
  "landing_logo_subtitle",
];

const Landing = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Record<string, string>>({
    landing_badge: "Caldas Novas, GO",
    landing_label: "Hotéis & Resorts",
    landing_title: "Encontre a estadia perfeita para você",
    landing_subtitle: "Reserve em segundos e aproveite os melhores resorts de águas quentes.",
    landing_button_text: "Explorar agora",
    landing_button_color: "#ffffff",
    landing_button_text_color: "#000000",
    landing_bg_url: "",
    landing_logo_url: "",
    landing_logo_subtitle: "J G Locações",
  });

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", LANDING_KEYS);
      if (data) {
        const map: Record<string, string> = {};
        data.forEach(d => { map[d.key] = d.value; });
        setSettings(prev => ({ ...prev, ...map }));
      }
    };
    fetch();
  }, []);

  const bgImage = settings.landing_bg_url || landingBgDefault;

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      {/* Background image */}
      <img
        src={bgImage}
        alt="Landing background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Top badge */}
      {settings.landing_badge && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="absolute top-14 left-0 right-0 z-10 flex justify-center"
        >
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20">
            <MapPin className="w-3.5 h-3.5 text-white/90" />
            <span className="text-xs font-medium text-white/90 tracking-wide" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {settings.landing_badge}
            </span>
          </div>
        </motion.div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full px-6 pb-10 sm:px-8 sm:pb-14 max-w-lg mx-auto">
        {/* Logo */}
        {settings.landing_logo_url && (
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <img
              src={settings.landing_logo_url}
              alt="Logo"
              className="h-16 sm:h-20 w-auto object-contain drop-shadow-lg"
            />
          </motion.div>
        )}

        {settings.landing_logo_subtitle && (
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-sm font-medium text-white/80 text-center mb-5 tracking-wide"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {settings.landing_logo_subtitle}
          </motion.p>
        )}

        {settings.landing_label && (
          <motion.p
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-sm font-semibold text-white tracking-widest uppercase mb-3"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {settings.landing_label}
          </motion.p>
        )}

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-[32px] sm:text-[36px] font-bold text-white leading-[1.15] tracking-tight"
          style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
        >
          {settings.landing_title}
        </motion.h1>

        {settings.landing_subtitle && (
          <motion.p
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="mt-3 text-sm text-white/60 font-normal leading-relaxed"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {settings.landing_subtitle}
          </motion.p>
        )}

        <motion.button
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          onClick={() => navigate("/explore")}
          className="mt-7 w-full py-4 font-semibold text-sm rounded-[30px] shadow-lg hover:brightness-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            backgroundColor: settings.landing_button_color || "#ffffff",
            color: settings.landing_button_text_color || "#000000",
          }}
        >
          {settings.landing_button_text || "Explorar agora"}
          <ArrowRight className="w-4 h-4" />
        </motion.button>

        <div className="flex justify-center mt-5">
          <div className="w-32 h-1 rounded-full bg-white/30" />
        </div>
      </div>
    </div>
  );
};

export default Landing;
