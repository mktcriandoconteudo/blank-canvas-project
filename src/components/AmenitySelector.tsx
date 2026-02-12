import { Bed, Tv, Wifi, Users, Waves, Snowflake, Fence, Refrigerator, Microwave, Dumbbell, ShieldAlert, Flame, ArrowUpDown, Home, Car, UtensilsCrossed, Coffee, Bath, Mountain, TreePine, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AmenityOption {
  key: string;
  label: string;
  icon: LucideIcon;
}

export const AMENITY_OPTIONS: AmenityOption[] = [
  { key: "quartos", label: "Quartos", icon: Bed },
  { key: "smart-tv", label: "Smart TV", icon: Tv },
  { key: "wifi", label: "Wi-Fi", icon: Wifi },
  { key: "hospedes", label: "Hóspedes", icon: Users },
  { key: "piscina", label: "Piscina aquecida", icon: Waves },
  { key: "ar-condicionado", label: "Ar-condicionado", icon: Snowflake },
  { key: "varanda", label: "Varanda", icon: Fence },
  { key: "geladeira", label: "Geladeira", icon: Refrigerator },
  { key: "microondas", label: "Microondas", icon: Microwave },
  { key: "academia", label: "Academia", icon: Dumbbell },
  { key: "elevador", label: "Elevador", icon: ArrowUpDown },
  { key: "estacionamento", label: "Estacionamento", icon: Car },
  { key: "cozinha", label: "Cozinha", icon: UtensilsCrossed },
  { key: "cafe", label: "Café da manhã", icon: Coffee },
  { key: "banheira", label: "Banheira", icon: Bath },
  { key: "vista-montanha", label: "Vista montanha", icon: Mountain },
  { key: "jardim", label: "Jardim", icon: TreePine },
  { key: "alarme-co", label: "Alarme CO₂", icon: ShieldAlert },
  { key: "detector-fumaca", label: "Detector fumaça", icon: Flame },
  { key: "condominio", label: "Condomínio", icon: Home },
];

interface AmenitySelectorProps {
  selected: string[];
  onChange: (amenities: string[]) => void;
}

const AmenitySelector = ({ selected, onChange }: AmenitySelectorProps) => {
  const toggle = (key: string) => {
    onChange(
      selected.includes(key)
        ? selected.filter((k) => k !== key)
        : [...selected, key]
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {AMENITY_OPTIONS.map((a) => {
        const isActive = selected.includes(a.key);
        return (
          <button
            key={a.key}
            type="button"
            onClick={() => toggle(a.key)}
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground border-primary shadow-sm scale-[1.02]"
                : "bg-secondary text-secondary-foreground border-border hover:border-primary/40"
            )}
          >
            <a.icon className="w-3.5 h-3.5" />
            {a.label}
          </button>
        );
      })}
    </div>
  );
};

export default AmenitySelector;
