import { useState } from "react";
import { Waves, TreePalm, Mountain, Umbrella, Building2, Sailboat, Flame, Snowflake, Sun, Castle } from "lucide-react";

const categories = [
  { icon: Waves, label: "Beira-mar" },
  { icon: TreePalm, label: "Tropical" },
  { icon: Mountain, label: "Montanha" },
  { icon: Umbrella, label: "Piscinas" },
  { icon: Building2, label: "Luxo" },
  { icon: Sailboat, label: "Náutico" },
  { icon: Flame, label: "Em alta" },
  { icon: Snowflake, label: "Inverno" },
  { icon: Sun, label: "All-inclusive" },
  { icon: Castle, label: "Histórico" },
];

const CategoryFilter = () => {
  const [active, setActive] = useState("Beira-mar");

  return (
    <div className="sticky top-20 z-40 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-8 overflow-x-auto py-4 scrollbar-hide">
          {categories.map(({ icon: Icon, label }) => (
            <button
              key={label}
              onClick={() => setActive(label)}
              className={`flex flex-col items-center gap-1.5 min-w-fit pb-2 border-b-2 transition-all ${
                active === label
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium whitespace-nowrap">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;
