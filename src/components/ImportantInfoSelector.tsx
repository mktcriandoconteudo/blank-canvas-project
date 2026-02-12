import { PawPrint, ShirtIcon, Sparkles, Zap, BedDouble, AlertTriangle, Ban, Droplets, Plug, ClipboardList, CreditCard, Thermometer, Clock, KeyRound, Volume2, Cigarette, Baby, Flame, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImportantInfoOption {
  key: string;
  label: string;
  icon: LucideIcon;
}

export const IMPORTANT_INFO_OPTIONS: ImportantInfoOption[] = [
  { key: "nao-aceita-pet", label: "NÃO aceita pet", icon: PawPrint },
  { key: "trazer-roupa-cama-banho", label: "Trazer roupa de cama e banho", icon: BedDouble },
  { key: "trazer-kit-higiene", label: "Trazer kit higiene pessoal", icon: Sparkles },
  { key: "trazer-kit-limpeza", label: "Trazer kit limpeza", icon: Droplets },
  { key: "nao-deixar-vasilhas-sujas", label: "NÃO deixar vasilhas sujas", icon: Ban },
  { key: "sujeito-multa-limpeza", label: "Sujeito a multa por limpeza", icon: CreditCard },
  { key: "boleto-multa-diaria", label: "Multa: valor de 1 diária no CPF", icon: ClipboardList },
  { key: "evitar-sobrecarga", label: "Evitar sobrecarga elétrica", icon: Zap },
  { key: "nao-ligar-tudo-junto", label: "NÃO ligar 2 ACs + chuveiro juntos", icon: AlertTriangle },
  { key: "energia-220v", label: "Energia 220V", icon: Plug },
  { key: "proibido-fumar", label: "Proibido fumar", icon: Cigarette },
  { key: "silencio-22h", label: "Silêncio após 22h", icon: Volume2 },
  { key: "checkin-14h", label: "Check-in a partir das 14h", icon: Clock },
  { key: "checkout-11h", label: "Check-out até 11h", icon: Clock },
  { key: "chave-portaria", label: "Chave na portaria", icon: KeyRound },
  { key: "nao-criancas-sem-supervisao", label: "Crianças sob supervisão", icon: Baby },
  { key: "cuidado-aquecimento", label: "Cuidado com aquecimento", icon: Thermometer },
  { key: "proibido-festas", label: "Proibido festas", icon: Ban },
  { key: "detector-fumaca-ativo", label: "Detector de fumaça ativo", icon: Flame },
];

interface ImportantInfoSelectorProps {
  selected: string[];
  onChange: (info: string[]) => void;
}

const ImportantInfoSelector = ({ selected, onChange }: ImportantInfoSelectorProps) => {
  const toggle = (key: string) => {
    onChange(
      selected.includes(key)
        ? selected.filter((k) => k !== key)
        : [...selected, key]
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {IMPORTANT_INFO_OPTIONS.map((a) => {
        const isActive = selected.includes(a.key);
        return (
          <button
            key={a.key}
            type="button"
            onClick={() => toggle(a.key)}
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border transition-all duration-200",
              isActive
                ? "bg-destructive text-destructive-foreground border-destructive shadow-sm scale-[1.02]"
                : "bg-secondary text-secondary-foreground border-border hover:border-destructive/40"
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

export default ImportantInfoSelector;
