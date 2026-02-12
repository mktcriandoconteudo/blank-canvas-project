import { cn } from "@/lib/utils";
import { useSelectorOptions } from "@/hooks/use-selector-options";
import { getIconComponent } from "@/components/IconPicker";

interface DynamicSelectorProps {
  category: string;
  selected: string[];
  onChange: (keys: string[]) => void;
  variant?: "default" | "destructive";
  resortId?: string;
}

const DynamicSelector = ({ category, selected, onChange, variant = "default", resortId }: DynamicSelectorProps) => {
  const { options } = useSelectorOptions(category, resortId);

  const toggle = (key: string) => {
    onChange(
      selected.includes(key)
        ? selected.filter(k => k !== key)
        : [...selected, key]
    );
  };

  const activeClass = variant === "destructive"
    ? "bg-destructive text-destructive-foreground border-destructive shadow-sm scale-[1.02]"
    : "bg-primary text-primary-foreground border-primary shadow-sm scale-[1.02]";

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const Icon = getIconComponent(opt.icon_name);
        const isActive = selected.includes(opt.key);
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => toggle(opt.key)}
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border transition-all duration-200",
              isActive
                ? activeClass
                : "bg-secondary text-secondary-foreground border-border hover:border-primary/40"
            )}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

export default DynamicSelector;
