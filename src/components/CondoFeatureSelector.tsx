import { Wifi, Waves, ArrowUpDown, Snowflake, Fence, Refrigerator, Microwave, Dumbbell, ShieldAlert, Flame, Car, UtensilsCrossed, Coffee, Bath, Mountain, TreePine, Tv, Lock, Baby, Dog, Sparkles, Shirt, BedDouble, DoorOpen, ShowerHead, Armchair, Sofa, Wine, CookingPot, GlassWater, Blinds, Grip, Lamp, Frame, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CondoFeatureOption {
  key: string;
  label: string;
  icon: LucideIcon;
}

export const CONDO_FEATURE_OPTIONS: CondoFeatureOption[] = [
  { key: "wifi", label: "Wi-Fi", icon: Wifi },
  { key: "piscina-compartilhada", label: "Piscina aquecida compartilhada", icon: Waves },
  { key: "elevador", label: "Elevador", icon: ArrowUpDown },
  { key: "ar-condicionado-split", label: "Ar-condicionado split", icon: Snowflake },
  { key: "varanda-privativa", label: "Varanda privativa", icon: Fence },
  { key: "geladeira", label: "Geladeira 220V", icon: Refrigerator },
  { key: "microondas", label: "Micro-ondas 220V", icon: Microwave },
  { key: "academia-compartilhada", label: "Academia compartilhada", icon: Dumbbell },
  { key: "alarme-co", label: "Alarme de monóxido de carbono", icon: ShieldAlert },
  { key: "detector-fumaca", label: "Detector de fumaça", icon: Flame },
  { key: "estacionamento", label: "Estacionamento", icon: Car },
  { key: "cozinha-equipada", label: "Cozinha completa", icon: UtensilsCrossed },
  { key: "cafe-manha", label: "Café da manhã", icon: Coffee },
  { key: "banheira", label: "Banheira", icon: Bath },
  { key: "vista-montanha", label: "Vista montanha", icon: Mountain },
  { key: "jardim", label: "Jardim", icon: TreePine },
  { key: "smart-tv", label: "Smart TV", icon: Tv },
  { key: "portaria-24h", label: "Portaria 24h", icon: Lock },
  { key: "area-kids", label: "Área kids", icon: Baby },
  { key: "pet-friendly", label: "Pet friendly", icon: Dog },
  { key: "sauna", label: "Sauna", icon: Sparkles },
  { key: "lavanderia", label: "Lavanderia", icon: Shirt },
  { key: "cama-casal", label: "Cama casal", icon: BedDouble },
  { key: "cortina-blackout", label: "Cortina blackout", icon: Blinds },
  { key: "guarda-roupa", label: "Guarda-roupa planejado", icon: DoorOpen },
  { key: "armario-trancado", label: "Armário com chave", icon: Lock },
  { key: "chuveiro-box", label: "Chuveiro com box", icon: ShowerHead },
  { key: "ducha-higienica", label: "Ducha higiênica", icon: ShowerHead },
  { key: "fogao-4-bocas", label: "Fogão 4 bocas c/ forno", icon: CookingPot },
  { key: "adega", label: "Adega", icon: Wine },
  { key: "bebedouro", label: "Bebedouro 220V", icon: GlassWater },
  { key: "sofa-cama", label: "Sofá cama casal", icon: Sofa },
  { key: "poltronas", label: "Poltronas", icon: Armchair },
  { key: "colchao-solteiro", label: "Colchão solteiro extra", icon: Grip },
  { key: "sacada-blindex", label: "Sacada com blindex", icon: Lamp },
  { key: "rede", label: "Ganchos para rede", icon: Fence },
  { key: "varal", label: "Varal fixo", icon: Shirt },
  { key: "quadros-decorativos", label: "Quadros decorativos", icon: Frame },
];

interface CondoFeatureSelectorProps {
  selected: string[];
  onChange: (features: string[]) => void;
}

const CondoFeatureSelector = ({ selected, onChange }: CondoFeatureSelectorProps) => {
  const toggle = (key: string) => {
    onChange(
      selected.includes(key)
        ? selected.filter((k) => k !== key)
        : [...selected, key]
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {CONDO_FEATURE_OPTIONS.map((a) => {
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

export default CondoFeatureSelector;
