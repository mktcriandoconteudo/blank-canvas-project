import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSelectorOptions, type SelectorOption } from "@/hooks/use-selector-options";
import IconPicker, { getIconComponent } from "@/components/IconPicker";

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

  const handleDelete = async (e: React.MouseEvent, opt: SelectorOption) => {
    e.stopPropagation();
    if (!confirm(`Excluir "${opt.label}"?`)) return;
    const error = await deleteOption(opt.id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Opção excluída!" });
    }
  };

  const startEdit = (opt: SelectorOption) => {
    setEditingId(opt.id);
    setEditLabel(opt.label);
    setEditIcon(opt.icon_name);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{title}</CardTitle>
          <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setShowAdd(!showAdd)}>
            <Plus className="w-3 h-3 mr-1" /> Adicionar
          </Button>
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
              <div key={opt.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary/50 group">
                {Icon && <Icon className="w-4 h-4 text-muted-foreground shrink-0" />}
                <span className="text-xs flex-1 truncate">{opt.label}</span>
                <div className="opacity-0 group-hover:opacity-100 flex gap-0.5 transition-opacity">
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => startEdit(opt)}>
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => handleDelete(e, opt)}>
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default OptionsManager;
