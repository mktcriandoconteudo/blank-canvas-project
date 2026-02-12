import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Edit2, Save, X, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PricingPlan {
  id: string;
  resort_id: string;
  name: string;
  sessions: string;
  price_per_night: number;
  total_nights: number;
  is_popular: boolean;
  display_order: number;
}

interface PricingPlansManagerProps {
  resortId: string;
}

const PricingPlansManager = ({ resortId }: PricingPlansManagerProps) => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", sessions: "", price_per_night: "", total_nights: "", is_popular: false });

  const fetchPlans = async () => {
    const { data } = await supabase
      .from("pricing_plans")
      .select("*")
      .eq("resort_id", resortId)
      .order("display_order");
    if (data) setPlans(data as PricingPlan[]);
  };

  useEffect(() => { fetchPlans(); }, [resortId]);

  const handleAdd = async () => {
    if (!form.name || !form.price_per_night) return;
    const maxOrder = plans.length > 0 ? Math.max(...plans.map(p => p.display_order)) : 0;
    const { error } = await supabase.from("pricing_plans").insert({
      resort_id: resortId,
      name: form.name,
      sessions: form.sessions,
      price_per_night: parseFloat(form.price_per_night),
      total_nights: parseInt(form.total_nights) || 1,
      is_popular: form.is_popular,
      display_order: maxOrder + 1,
    });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Plano adicionado!" });
      setForm({ name: "", sessions: "", price_per_night: "", total_nights: "", is_popular: false });
      setShowAdd(false);
      fetchPlans();
    }
  };

  const handleUpdate = async (id: string) => {
    const { error } = await supabase.from("pricing_plans").update({
      name: form.name,
      sessions: form.sessions,
      price_per_night: parseFloat(form.price_per_night),
      total_nights: parseInt(form.total_nights) || 1,
      is_popular: form.is_popular,
    }).eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Plano atualizado!" });
      setEditingId(null);
      fetchPlans();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este plano?")) return;
    await supabase.from("pricing_plans").delete().eq("id", id);
    toast({ title: "Plano excluído!" });
    fetchPlans();
  };

  const startEdit = (plan: PricingPlan) => {
    setEditingId(plan.id);
    setForm({
      name: plan.name,
      sessions: plan.sessions,
      price_per_night: String(plan.price_per_night),
      total_nights: String(plan.total_nights),
      is_popular: plan.is_popular,
    });
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <Star className="w-3 h-3" /> Planos ({plans.length})
        </span>
        <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => { setShowAdd(!showAdd); setEditingId(null); }}>
          <Plus className="w-3 h-3 mr-1" /> Plano
        </Button>
      </div>

      {(showAdd || editingId) && (
        <div className="p-3 bg-secondary/50 rounded-xl border border-border space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px]">Nome</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="h-8 text-xs" placeholder="Ex: Premium" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Sessões</Label>
              <Input value={form.sessions} onChange={e => setForm(p => ({ ...p, sessions: e.target.value }))} className="h-8 text-xs" placeholder="Ex: 5 diárias" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Preço/diária (R$)</Label>
              <Input type="number" value={form.price_per_night} onChange={e => setForm(p => ({ ...p, price_per_night: e.target.value }))} className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Total noites</Label>
              <Input type="number" value={form.total_nights} onChange={e => setForm(p => ({ ...p, total_nights: e.target.value }))} className="h-8 text-xs" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.is_popular} onCheckedChange={v => setForm(p => ({ ...p, is_popular: v }))} />
            <Label className="text-xs">Mais Popular</Label>
          </div>
          <div className="flex gap-2">
            {editingId ? (
              <>
                <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs" onClick={() => handleUpdate(editingId)}>
                  <Save className="w-3 h-3 mr-1" /> Salvar
                </Button>
                <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setEditingId(null)}>
                  <X className="w-3 h-3 mr-1" /> Cancelar
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs" onClick={handleAdd}>
                  <Plus className="w-3 h-3 mr-1" /> Criar
                </Button>
                <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setShowAdd(false)}>
                  Cancelar
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {plans.length > 0 && (
        <div className="space-y-1">
          {plans.map(plan => (
            <div key={plan.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary/50 group">
              {plan.is_popular && <Star className="w-3 h-3 text-primary fill-primary shrink-0" />}
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium">{plan.name}</span>
                <span className="text-[10px] text-muted-foreground ml-1.5">
                  {formatCurrency(plan.price_per_night)}/diária · {plan.sessions}
                </span>
              </div>
              <div className="opacity-0 group-hover:opacity-100 flex gap-0.5 transition-opacity shrink-0">
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => startEdit(plan)}>
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleDelete(plan.id)}>
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PricingPlansManager;
