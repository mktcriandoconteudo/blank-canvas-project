import { useState } from "react";
import { icons, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// Popular icons subset for faster rendering
const POPULAR_ICONS = [
  "bed", "bed-double", "tv", "wifi", "users", "waves", "snowflake", "fence",
  "refrigerator", "microwave", "dumbbell", "arrow-up-down", "car", "utensils-crossed",
  "coffee", "bath", "mountain", "tree-pine", "shield-alert", "flame", "home",
  "lock", "baby", "dog", "sparkles", "shirt", "door-open", "shower-head",
  "cooking-pot", "wine", "glass-water", "sofa", "armchair", "grip", "lamp",
  "frame", "paw-print", "droplets", "ban", "credit-card", "clipboard-list",
  "zap", "alert-triangle", "plug", "cigarette", "volume-2", "clock", "key-round",
  "thermometer", "heart", "star", "check", "x", "plus", "minus", "search",
  "eye", "map-pin", "phone", "mail", "calendar", "camera", "image", "sun",
  "moon", "cloud", "umbrella", "wind", "leaf", "flower-2", "fish", "bird",
  "tent", "landmark", "building", "store", "warehouse", "church", "school",
  "hospital", "library", "flag", "globe", "compass", "anchor", "rocket",
  "plane", "train", "bus", "bike", "ship", "ticket", "gift", "trophy",
  "medal", "crown", "gem", "diamond", "coins", "wallet", "receipt",
  "shopping-cart", "shopping-bag", "package", "box", "archive",
  "folder", "file-text", "clipboard", "book", "newspaper",
  "music", "headphones", "mic", "video", "monitor", "smartphone",
  "tablet", "laptop", "printer", "hard-drive", "cpu", "battery",
  "bluetooth", "signal", "radio", "satellite", "circle",
];

// Convert kebab-case to PascalCase for lucide icons lookup
function kebabToPascal(str: string): string {
  return str.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join("");
}

export function getIconComponent(iconName: string): LucideIcon | null {
  const pascalName = kebabToPascal(iconName);
  return (icons as Record<string, LucideIcon>)[pascalName] || null;
}

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
}

const IconPicker = ({ value, onChange }: IconPickerProps) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const CurrentIcon = getIconComponent(value);

  const filteredIcons = search
    ? POPULAR_ICONS.filter(name => name.includes(search.toLowerCase()))
    : POPULAR_ICONS;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-9">
          {CurrentIcon ? <CurrentIcon className="w-4 h-4" /> : <span className="w-4 h-4" />}
          <span className="text-xs text-muted-foreground">{value}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <Input
          placeholder="Buscar ícone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mb-2 h-8 text-xs"
        />
        <ScrollArea className="h-48">
          <div className="grid grid-cols-8 gap-1">
            {filteredIcons.map(name => {
              const Icon = getIconComponent(name);
              if (!Icon) return null;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => { onChange(name); setOpen(false); }}
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    value === name
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary"
                  )}
                  title={name}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default IconPicker;
