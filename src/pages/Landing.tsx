import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MapPin, ArrowRight } from "lucide-react";
import landingBg from "@/assets/landing-bg.webp";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      {/* Background image */}
      <img
        src={landingBg}
        alt="Resort em Caldas Novas"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Top badge */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="absolute top-14 left-0 right-0 z-10 flex justify-center"
      >
        <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20">
          <MapPin className="w-3.5 h-3.5 text-white/90" />
          <span className="text-xs font-medium text-white/90 tracking-wide" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Caldas Novas, GO
          </span>
        </div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full px-6 pb-10 sm:px-8 sm:pb-14 max-w-lg mx-auto">
        <motion.p
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-sm font-semibold text-white tracking-widest uppercase mb-3"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Hotéis & Resorts
        </motion.p>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-[32px] sm:text-[36px] font-bold text-white leading-[1.15] tracking-tight"
          style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
        >
          Encontre a estadia{" "}
          <span className="text-primary">perfeita</span> para você
        </motion.h1>

        <motion.p
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="mt-3 text-sm text-white/60 font-normal leading-relaxed"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Reserve em segundos e aproveite os melhores resorts de águas quentes.
        </motion.p>

        <motion.button
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          onClick={() => navigate("/explore")}
          className="mt-7 w-full py-4 bg-primary text-primary-foreground font-semibold text-sm rounded-2xl shadow-lg shadow-primary/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Explorar agora
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
