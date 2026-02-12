import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { HelpCircle, Plus, Trash2, Save, GripVertical, Edit2, X } from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  display_order: number;
}

const FaqManager = ({ resortId }: { resortId: string }) => {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQ, setEditQ] = useState("");
  const [editA, setEditA] = useState("");

  const fetchItems = async () => {
    const { data } = await supabase
      .from("faq_items")
      .select("*")
      .eq("resort_id", resortId)
      .order("display_order");
    if (data) setItems(data as FaqItem[]);
  };

  useEffect(() => { fetchItems(); }, [resortId]);

  const handleAdd = async () => {
    if (!newQ.trim() || !newA.trim()) {
      toast({ title: "Preencha pergunta e resposta", variant: "destructive" });
      return;
    }
    const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.display_order)) : 0;
    const { error } = await supabase.from("faq_items").insert({
      resort_id: resortId,
      question: newQ.trim(),
      answer: newA.trim(),
      display_order: maxOrder + 1,
    });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Pergunta adicionada!" });
    setNewQ("");
    setNewA("");
    setAdding(false);
    fetchItems();
  };

  const handleEdit = (item: FaqItem) => {
    setEditingId(item.id);
    setEditQ(item.question);
    setEditA(item.answer);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editQ.trim() || !editA.trim()) {
      toast({ title: "Preencha pergunta e resposta", variant: "destructive" });
      return;
    }
    const { error } = await supabase
      .from("faq_items")
      .update({ question: editQ.trim(), answer: editA.trim() })
      .eq("id", editingId);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Pergunta atualizada!" });
    setEditingId(null);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover esta pergunta?")) return;
    await supabase.from("faq_items").delete().eq("id", id);
    toast({ title: "Removida!" });
    fetchItems();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5" /> FAQ ({items.length})
        </p>
        <Button size="sm" variant="outline" className="text-[10px] h-6 px-2" onClick={() => setAdding(!adding)}>
          <Plus className="w-3 h-3 mr-0.5" /> Adicionar
        </Button>
      </div>

      {adding && (
        <div className="border border-border rounded-lg p-2.5 space-y-2">
          <Input value={newQ} onChange={e => setNewQ(e.target.value)} placeholder="Pergunta" className="text-xs h-8" />
          <Textarea value={newA} onChange={e => setNewA(e.target.value)} placeholder="Resposta" rows={2} className="text-xs" />
          <div className="flex gap-1">
            <Button size="sm" className="text-[10px] h-6" onClick={handleAdd}>
              <Save className="w-3 h-3 mr-0.5" /> Salvar
            </Button>
            <Button size="sm" variant="ghost" className="text-[10px] h-6" onClick={() => setAdding(false)}>Cancelar</Button>
          </div>
        </div>
      )}

      {items.map(item => (
        <div key={item.id} className="border border-border rounded-lg p-2.5">
          {editingId === item.id ? (
            <div className="space-y-2">
              <Input value={editQ} onChange={e => setEditQ(e.target.value)} placeholder="Pergunta" className="text-xs h-8" />
              <Textarea value={editA} onChange={e => setEditA(e.target.value)} placeholder="Resposta" rows={2} className="text-xs" />
              <div className="flex gap-1">
                <Button size="sm" className="text-[10px] h-6" onClick={handleSaveEdit}>
                  <Save className="w-3 h-3 mr-0.5" /> Salvar
                </Button>
                <Button size="sm" variant="ghost" className="text-[10px] h-6" onClick={() => setEditingId(null)}>
                  <X className="w-3 h-3 mr-0.5" /> Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <GripVertical className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-foreground">{item.question}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.answer}</p>
              </div>
              <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => handleEdit(item)}>
                <Edit2 className="w-3 h-3" />
              </Button>
              <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => handleDelete(item.id)}>
                <Trash2 className="w-3 h-3 text-destructive" />
              </Button>
            </div>
          )}
        </div>
      ))}

      {items.length === 0 && !adding && (
        <p className="text-[10px] text-muted-foreground text-center py-2">Nenhuma pergunta cadastrada</p>
      )}
    </div>
  );
};

export default FaqManager;
