import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Edit2, Save, X, CheckSquare } from "lucide-react";
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

interface OptionsManagerProps {
  category: string;
  title: string;
  resortId?: string;
}

const OptionsManager = ({ category, title, resortId }: OptionsManagerProps) => {
  const { options, addOption, updateOption, deleteOption } = useSelectorOptions(category, resortId);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [newIcon, setNewIcon] = useState("circle");
  const [editLabel, setEditLabel] = useState("");
  const [editIcon, setEditIcon] = useState("");

  // Multi-select state
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setShowAdd(!showAdd)}>
                    <Plus className="w-3 h-3 mr-1" /> Adicionar
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
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

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
    </>
  );
};

export default OptionsManager;
