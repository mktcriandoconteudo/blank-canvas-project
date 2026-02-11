import { useState } from "react";
import { Droplets, Flame, Building2, TreePalm, Sparkles, UtensilsCrossed } from "lucide-react";
import { motion } from "framer-motion";

const categories = [
  { icon: Droplets, label: "Águas Termais" },
  { icon: Flame, label: "Em alta" },
  { icon: Building2, label: "Luxo" },
  { icon: TreePalm, label: "Lazer" },
  { icon: Sparkles, label: "All-inclusive" },
  { icon: UtensilsCrossed, label: "Gastronomia" },
];

const CategoryFilter = () => {
  const [active, setActive] = useState("Beira-mar");

  return (
    <div className="sticky top-20 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-hide">
          {categories.map(({ icon: Icon, label }) => (
            <button
              key={label}
              onClick={() => setActive(label)}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl min-w-fit transition-all"
            >
              {active === label && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute inset-0 bg-gradient-to-r from-primary/15 to-accent/15 border border-primary/25 rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={`w-4 h-4 relative z-10 transition-colors ${
                active === label ? "text-primary" : "text-muted-foreground"
              }`} />
              <span className={`text-xs font-semibold whitespace-nowrap relative z-10 transition-colors ${
                active === label ? "text-foreground" : "text-muted-foreground"
              }`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;
