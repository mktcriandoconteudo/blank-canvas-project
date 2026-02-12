import { useState, useEffect } from "react";
import { CalendarCheck } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface Plan {
  id: string;
  name: string;
  sessions: string;
  price_per_night: number;
  total_nights: number;
  is_popular: boolean;
}

const fallbackPlans: Plan[] = [
  { id: "1", name: "Essencial", sessions: "2 diárias", price_per_night: 620, total_nights: 2, is_popular: false },
  { id: "2", name: "Premium", sessions: "5 diárias", price_per_night: 550, total_nights: 5, is_popular: true },
  { id: "3", name: "VIP", sessions: "10 diárias", price_per_night: 480, total_nights: 10, is_popular: false },
];

interface PricingPlansProps {
  resortId?: string;
  onSelectPlan?: (plan: { name: string; sessions: string; price_per_night: number; total_nights: number }) => void;
}

const PricingPlans = ({ resortId, onSelectPlan }: PricingPlansProps) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      if (!resortId) { setPlans(fallbackPlans); return; }
      const { data } = await supabase
        .from("pricing_plans")
        .select("*")
        .eq("resort_id", resortId)
        .order("display_order");
      if (data && data.length > 0) {
        setPlans(data as Plan[]);
      } else {
        setPlans(fallbackPlans);
      }
    };
    fetchPlans();
  }, [resortId]);

  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  const handleSelect = (plan: Plan) => {
    setSelectedId(plan.id);
    onSelectPlan?.({
      name: plan.name,
      sessions: plan.sessions,
      price_per_night: plan.price_per_night,
      total_nights: plan.total_nights,
    });
  };

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
        {plans.map((plan, i) => {
          const total = plan.price_per_night * plan.total_nights;
          const isSelected = selectedId === plan.id;
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.1 }}
              className={`relative rounded-2xl overflow-hidden border cursor-pointer transition-all ${
                plan.is_popular
                  ? "bg-[hsl(340,80%,55%)] text-white border-transparent shadow-lg scale-[1.03]"
                  : isSelected
                    ? "bg-card text-foreground border-primary shadow-md ring-2 ring-primary/30"
                    : "bg-card text-foreground border-border"
              }`}
              onClick={() => handleSelect(plan)}
            >
              {plan.is_popular && (
                <div className="text-center text-[10px] font-bold uppercase tracking-wider pt-2.5 pb-0.5 flex items-center justify-center gap-1">
                  <span>⭐</span> Mais Popular
                </div>
              )}

              <div className={`p-5 ${plan.is_popular ? "pt-2" : "pt-5"}`}>
                <h3
                  className="text-lg font-extrabold"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {plan.name}
                </h3>
                <p className={`text-xs mb-3 ${plan.is_popular ? "text-white/80" : "text-muted-foreground"}`}>
                  {plan.sessions}
                </p>

                <div className="flex items-baseline gap-0.5 mb-1">
                  <span
                    className="text-2xl font-extrabold"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {formatCurrency(plan.price_per_night)}
                  </span>
                  <span className={`text-xs ${plan.is_popular ? "text-white/70" : "text-muted-foreground"}`}>
                    /diária
                  </span>
                </div>
                <p className={`text-xs mb-4 ${plan.is_popular ? "text-white/70" : "text-muted-foreground"}`}>
                  Total: {formatCurrency(total)}
                </p>

                <button
                  className={`w-full flex items-center justify-center gap-2 font-bold text-sm py-2.5 transition-opacity hover:opacity-90 ${
                    plan.is_popular
                      ? "bg-white text-[hsl(340,80%,55%)]"
                      : isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-[hsl(340,80%,55%)] text-white"
                  }`}
                  style={{ borderRadius: 24 }}
                >
                  <CalendarCheck className="w-4 h-4" />
                  {isSelected ? "Selecionado ✓" : "Agendar Agora"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PricingPlans;
