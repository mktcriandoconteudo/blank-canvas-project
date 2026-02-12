import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Edit2, Save, X, CheckSquare, LayoutGrid } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSelectorOptions, type SelectorOption } from "@/hooks/use-selector-options";
import IconPicker, { getIconComponent } from "@/components/IconPicker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PresetOption {
  key: string;
  label: string;
  icon_name: string;
}

const PRESET_OPTIONS: Record<string, PresetOption[]> = {
  amenity: [
    { key: "ar-condicionado", label: "Ar-condicionado", icon_name: "snowflake" },
    { key: "piscina", label: "Piscina aquecida", icon_name: "waves" },
    { key: "quartos", label: "Quartos", icon_name: "bed" },
    { key: "smart-tv", label: "Smart TV", icon_name: "tv" },
    { key: "wifi", label: "Wi-Fi", icon_name: "wifi" },
    { key: "estacionamento", label: "Estacionamento", icon_name: "car" },
    { key: "cozinha", label: "Cozinha equipada", icon_name: "utensils-crossed" },
    { key: "chuveiro-quente", label: "Chuveiro quente", icon_name: "shower-head" },
  ],
  condo_feature: [
    { key: "academia-compartilhada", label: "Academia compartilhada", icon_name: "dumbbell" },
    { key: "alarme-co", label: "Alarme de monóxido de carbono", icon_name: "shield-alert" },
    { key: "ar-condicionado-split", label: "Ar-condicionado split", icon_name: "snowflake" },
    { key: "armario-trancado", label: "Armário com chave", icon_name: "lock" },
    { key: "banheira", label: "Banheira", icon_name: "bath" },
    { key: "bebedouro", label: "Bebedouro 220V", icon_name: "glass-water" },
    { key: "cama-casal", label: "Cama casal", icon_name: "bed-double" },
    { key: "chuveiro-box", label: "Chuveiro com box", icon_name: "shower-head" },
    { key: "colchao-solteiro", label: "Colchão solteiro extra", icon_name: "grip" },
    { key: "cortina-blackout", label: "Cortina blackout", icon_name: "blinds" },
    { key: "cozinha-equipada", label: "Cozinha completa", icon_name: "utensils-crossed" },
    { key: "detector-fumaca", label: "Detector de fumaça", icon_name: "flame" },
    { key: "ducha-higienica", label: "Ducha higiênica", icon_name: "shower-head" },
    { key: "elevador", label: "Elevador", icon_name: "arrow-up-down" },
    { key: "estacionamento", label: "Estacionamento", icon_name: "car" },
    { key: "fogao-4-bocas", label: "Fogão 4 bocas c/ forno", icon_name: "cooking-pot" },
    { key: "geladeira", label: "Geladeira 220V", icon_name: "refrigerator" },
    { key: "guarda-roupa", label: "Guarda-roupa planejado", icon_name: "door-open" },
    { key: "jardim", label: "Jardim", icon_name: "tree-pine" },
    { key: "microondas", label: "Micro-ondas 220V", icon_name: "microwave" },
    { key: "piscina-compartilhada", label: "Piscina aquecida compartilhada", icon_name: "waves" },
    { key: "poltronas", label: "Poltronas", icon_name: "armchair" },
    { key: "portaria-24h", label: "Portaria 24h", icon_name: "lock" },
    { key: "quadros-decorativos", label: "Quadros decorativos", icon_name: "frame" },
    { key: "sacada-blindex", label: "Sacada com blindex", icon_name: "lamp" },
    { key: "smart-tv", label: "Smart TV", icon_name: "tv" },
    { key: "sofa-cama", label: "Sofá cama casal", icon_name: "sofa" },
    { key: "varal", label: "Varal fixo", icon_name: "shirt" },
    { key: "vista-montanha", label: "Vista montanha", icon_name: "mountain" },
    { key: "wifi", label: "Wi-Fi", icon_name: "wifi" },
  ],
  important_info: [
    { key: "chave-portaria", label: "Chave na portaria", icon_name: "key-round" },
    { key: "checkin-14h", label: "Check-in a partir das 14h", icon_name: "clock" },
    { key: "checkout-11h", label: "Check-out até 11h", icon_name: "clock" },
    { key: "nao-criancas-sem-supervisao", label: "Crianças sob supervisão", icon_name: "baby" },
    { key: "cuidado-aquecimento", label: "Cuidado com aquecimento", icon_name: "thermometer" },
    { key: "detector-fumaca-ativo", label: "Detector de fumaça ativo", icon_name: "flame" },
    { key: "energia-220v", label: "Energia 220V", icon_name: "plug" },
    { key: "evitar-sobrecarga", label: "Evitar sobrecarga elétrica", icon_name: "zap" },
    { key: "boleto-multa-diaria", label: "Multa: valor de 1 diária no CPF", icon_name: "clipboard-list" },
    { key: "nao-aceita-pet", label: "NÃO aceita pet", icon_name: "paw-print" },
    { key: "nao-deixar-vasilhas-sujas", label: "NÃO deixar vasilhas sujas", icon_name: "ban" },
    { key: "nao-ligar-tudo-junto", label: "NÃO ligar 2 ACs + chuveiro juntos", icon_name: "alert-triangle" },
    { key: "proibido-festas", label: "Proibido festas", icon_name: "ban" },
    { key: "proibido-fumar", label: "Proibido fumar", icon_name: "cigarette" },
    { key: "silencio-22h", label: "Silêncio após 22h", icon_name: "volume-2" },
    { key: "sujeito-multa-limpeza", label: "Sujeito a multa por limpeza", icon_name: "credit-card" },
    { key: "trazer-kit-higiene", label: "Trazer kit higiene pessoal", icon_name: "sparkles" },
    { key: "trazer-kit-limpeza", label: "Trazer kit limpeza", icon_name: "droplets" },
    { key: "trazer-roupa-cama-banho", label: "Trazer roupa de cama e banho", icon_name: "bed-double" },
  ],
};

interface OptionsManagerProps {
  category: string;
  title: string;
  resortId?: string;
}

const OptionsManager = ({ category, title, resortId }: OptionsManagerProps) => {
  const { options, addOption, updateOption, deleteOption } = useSelectorOptions(category, resortId);
  const [showAdd, setShowAdd] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [newIcon, setNewIcon] = useState("circle");
  const [editLabel, setEditLabel] = useState("");
  const [editIcon, setEditIcon] = useState("");

  // Multi-select state
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [singleDeleteTarget, setSingleDeleteTarget] = useState<SelectorOption | null>(null);

  // Gallery select state
  const [gallerySelected, setGallerySelected] = useState<Set<string>>(new Set());
  const [addingFromGallery, setAddingFromGallery] = useState(false);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelected(new Set());
  };

  const handleBulkDelete = async () => {
    let errorCount = 0;
    for (const id of selected) {
      const error = await deleteOption(id);
      if (error) errorCount++;
    }
    if (errorCount > 0) {
      toast({ title: "Erro", description: `${errorCount} item(ns) não puderam ser excluídos`, variant: "destructive" });
    } else {
      toast({ title: `${selected.size} item(ns) excluído(s)!` });
    }
    exitSelectMode();
    setShowDeleteConfirm(false);
  };

  const handleAdd = async () => {
    if (!newLabel.trim()) return;
    const key = newLabel.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const error = await addOption({ key, label: newLabel, icon_name: newIcon });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Opção adicionada!" });
      setNewLabel("");
      setNewIcon("circle");
      setShowAdd(false);
    }
  };

  const handleUpdate = async (id: string) => {
    const error = await updateOption(id, { label: editLabel, icon_name: editIcon });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Opção atualizada!" });
      setEditingId(null);
    }
  };

  const startEdit = (opt: SelectorOption) => {
    setEditingId(opt.id);
    setEditLabel(opt.label);
    setEditIcon(opt.icon_name);
  };

  const handleSingleDelete = (opt: SelectorOption) => {
    setSingleDeleteTarget(opt);
  };

  const confirmSingleDelete = async () => {
    if (!singleDeleteTarget) return;
    const error = await deleteOption(singleDeleteTarget.id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Opção excluída!" });
    }
    setSingleDeleteTarget(null);
  };

  // Gallery logic
  const presets = PRESET_OPTIONS[category] || [];
  const existingKeys = new Set(options.map(o => o.key));

  const toggleGalleryItem = (key: string) => {
    setGallerySelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleAddFromGallery = async () => {
    if (gallerySelected.size === 0) return;
    setAddingFromGallery(true);
    let added = 0;
    for (const key of gallerySelected) {
      const preset = presets.find(p => p.key === key);
      if (!preset) continue;
      const error = await addOption({ key: preset.key, label: preset.label, icon_name: preset.icon_name });
      if (!error) added++;
    }
    toast({ title: `${added} item(ns) adicionado(s)!` });
    setGallerySelected(new Set());
    setAddingFromGallery(false);
    setShowGallery(false);
  };

  const availablePresets = presets.filter(p => !existingKeys.has(p.key));

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-1">
            <CardTitle className="text-sm">{title}</CardTitle>
            <div className="flex gap-1">
              {selectMode ? (
                <>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="text-xs h-7"
                    disabled={selected.size === 0}
                    onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> Excluir ({selected.size})
                  </Button>
                  <Button size="sm" variant="ghost" className="text-xs h-7" onClick={exitSelectMode}>
                    <X className="w-3 h-3" />
                  </Button>
                </>
              ) : (
                <>
                  {options.length > 0 && (
                    <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setSelectMode(true)} title="Selecionar para excluir">
                      <CheckSquare className="w-3 h-3" />
                    </Button>
                  )}
                  {availablePresets.length > 0 && (
                    <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => { setShowGallery(true); setGallerySelected(new Set()); }} title="Galeria de opções">
                      <LayoutGrid className="w-3 h-3 mr-1" /> Galeria
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setShowAdd(!showAdd)}>
                    <Plus className="w-3 h-3 mr-1" /> Criar
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {showAdd && (
            <div className="flex items-end gap-2 p-3 bg-secondary/50 rounded-xl border border-border">
              <div className="space-y-1">
                <Label className="text-[10px]">Ícone</Label>
                <IconPicker value={newIcon} onChange={setNewIcon} />
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-[10px]">Nome</Label>
                <Input value={newLabel} onChange={e => setNewLabel(e.target.value)} className="h-9 text-xs" placeholder="Nome da opção" />
              </div>
              <Button size="sm" className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleAdd}>
                <Save className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-9" onClick={() => setShowAdd(false)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}

          <div className="space-y-1 max-h-60 overflow-y-auto">
            {options.map(opt => {
              const Icon = getIconComponent(opt.icon_name);
              if (editingId === opt.id) {
                return (
                  <div key={opt.id} className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg border border-border">
                    <IconPicker value={editIcon} onChange={setEditIcon} />
                    <Input value={editLabel} onChange={e => setEditLabel(e.target.value)} className="h-8 text-xs flex-1" />
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleUpdate(opt.id)}>
                      <Save className="w-3 h-3 text-emerald-600" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                );
              }
              return (
                <div
                  key={opt.id}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg group transition-colors ${
                    selectMode
                      ? selected.has(opt.id)
                        ? "bg-destructive/10 border border-destructive/30"
                        : "hover:bg-secondary/50 border border-transparent"
                      : "hover:bg-secondary/50"
                  }`}
                  onClick={selectMode ? (e) => { e.stopPropagation(); toggleSelect(opt.id); } : undefined}
                  role={selectMode ? "button" : undefined}
                >
                  {selectMode && (
                    <Checkbox
                      checked={selected.has(opt.id)}
                      onCheckedChange={() => toggleSelect(opt.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0"
                    />
                  )}
                  {Icon && <Icon className="w-4 h-4 text-muted-foreground shrink-0" />}
                  <span className="text-xs flex-1 truncate">{opt.label}</span>
                  {!selectMode && (
                    <div className="opacity-0 group-hover:opacity-100 flex gap-0.5 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); startEdit(opt); }}>
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); handleSingleDelete(opt); }}>
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Gallery Dialog */}
      <Dialog open={showGallery} onOpenChange={setShowGallery}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-sm">Galeria — {title}</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground -mt-2">
            Selecione as opções que deseja adicionar. Itens já adicionados não aparecem.
          </p>
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {availablePresets.map(preset => {
              const Icon = getIconComponent(preset.icon_name);
              const isSelected = gallerySelected.has(preset.key);
              return (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => toggleGalleryItem(preset.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? "bg-primary/10 border-2 border-primary ring-1 ring-primary/20"
                      : "bg-secondary/40 border border-border hover:bg-secondary/70"
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleGalleryItem(preset.key)}
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0"
                  />
                  {Icon && <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />}
                  <span className={`text-xs font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                    {preset.label}
                  </span>
                </button>
              );
            })}
            {availablePresets.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">
                Todas as opções da galeria já foram adicionadas!
              </p>
            )}
          </div>
          {availablePresets.length > 0 && (
            <div className="flex justify-between items-center pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">
                {gallerySelected.size} selecionado(s)
              </span>
              <Button
                size="sm"
                disabled={gallerySelected.size === 0 || addingFromGallery}
                onClick={handleAddFromGallery}
                className="text-xs"
              >
                {addingFromGallery ? "Adicionando..." : `Adicionar (${gallerySelected.size})`}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {selected.size} item(ns)?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Os itens selecionados serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!singleDeleteTarget} onOpenChange={(open) => { if (!open) setSingleDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir "{singleDeleteTarget?.label}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSingleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default OptionsManager;
