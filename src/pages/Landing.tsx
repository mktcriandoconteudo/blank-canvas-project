import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      {/* Background image */}
      <img
        src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80"
        alt="Resort em Caldas Novas"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full px-6 pb-10 sm:px-8 sm:pb-14 max-w-lg mx-auto">
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Encontre & Reserve sua Estadia Perfeita!
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-4 text-base sm:text-lg text-white/75 font-medium leading-relaxed"
        >
          Explore os melhores hotéis e resorts, reserve em segundos e aproveite uma estadia perfeita!
        </motion.p>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          onClick={() => navigate("/explore")}
          className="mt-8 w-full py-4 bg-card text-foreground font-bold text-base rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Começar
        </motion.button>

        <div className="flex justify-center mt-4">
          <div className="w-32 h-1.5 rounded-full bg-white/40" />
        </div>
      </div>
    </div>
  );
};

export default Landing;
