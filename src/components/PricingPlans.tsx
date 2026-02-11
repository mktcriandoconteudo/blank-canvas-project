import { CalendarCheck } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Essencial",
    sessions: "2 diárias",
    price: "R$ 620,00",
    perUnit: "/diária",
    total: "Total: R$ 1.240,00",
    popular: false,
  },
  {
    name: "Premium",
    sessions: "5 diárias",
    price: "R$ 550,00",
    perUnit: "/diária",
    total: "Total: R$ 2.750,00",
    popular: true,
  },
  {
    name: "VIP",
    sessions: "10 diárias",
    price: "R$ 480,00",
    perUnit: "/diária",
    total: "Total: R$ 4.800,00",
    popular: false,
  },
];

const PricingPlans = () => {
  return (
    <div className="mb-7">
      <h2
        className="text-base font-bold text-foreground mb-1"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        Escolha o seu{" "}
        <span className="text-primary">Plano</span>
      </h2>
      <p className="text-xs text-muted-foreground mb-5">
        Pacotes especiais para estadias prolongadas
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.1 }}
            className={`relative rounded-2xl overflow-hidden border ${
              plan.popular
                ? "bg-[hsl(340,80%,55%)] text-white border-transparent shadow-lg scale-[1.03]"
                : "bg-card text-foreground border-border"
            }`}
          >
            {plan.popular && (
              <div className="text-center text-[10px] font-bold uppercase tracking-wider pt-2.5 pb-0.5 flex items-center justify-center gap-1">
                <span>⭐</span> Mais Popular
              </div>
            )}

            <div className={`p-5 ${plan.popular ? "pt-2" : "pt-5"}`}>
              <h3
                className="text-lg font-extrabold"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {plan.name}
              </h3>
              <p className={`text-xs mb-3 ${plan.popular ? "text-white/80" : "text-muted-foreground"}`}>
                {plan.sessions}
              </p>

              <div className="flex items-baseline gap-0.5 mb-1">
                <span
                  className="text-2xl font-extrabold"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {plan.price}
                </span>
                <span className={`text-xs ${plan.popular ? "text-white/70" : "text-muted-foreground"}`}>
                  {plan.perUnit}
                </span>
              </div>
              <p className={`text-xs mb-4 ${plan.popular ? "text-white/70" : "text-muted-foreground"}`}>
                {plan.total}
              </p>

              <button
                className={`w-full flex items-center justify-center gap-2 font-bold text-sm py-2.5 transition-opacity hover:opacity-90 ${
                  plan.popular
                    ? "bg-white text-[hsl(340,80%,55%)]"
                    : "bg-[hsl(340,80%,55%)] text-white"
                }`}
                style={{ borderRadius: 24 }}
              >
                <CalendarCheck className="w-4 h-4" />
                Agendar Agora
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PricingPlans;
