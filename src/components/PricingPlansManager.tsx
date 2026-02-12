import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit2, Save, X, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const sessionsOptions = [
  "1 diária", "2 diárias", "3 diárias", "4 diárias", "5 diárias",
  "6 diárias", "7 diárias", "10 diárias", "14 diárias", "15 diárias",
  "20 diárias", "30 diárias",
];

const nightsOptions = [1, 2, 3, 4, 5, 6, 7, 10, 14, 15, 20, 30];

const formatCurrencyInput = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  const cents = parseInt(numbers || "0", 10);
  return (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const parseCurrencyInput = (formatted: string): number => {
  const numbers = formatted.replace(/\D/g, "");
  return parseInt(numbers || "0", 10) / 100;
};

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
      price_per_night: parseCurrencyInput(form.price_per_night),
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
      price_per_night: parseCurrencyInput(form.price_per_night),
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
      price_per_night: plan.price_per_night.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      total_nights: String(plan.total_nights),
      is_popular: plan.is_popular,
    });
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  };

  const handlePriceChange = (rawValue: string) => {
    const formatted = formatCurrencyInput(rawValue);
    setForm(p => ({ ...p, price_per_night: formatted }));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Star className="w-4 h-4 text-primary" />
          Planos de Preços
          {plans.length > 0 && (
            <span className="text-xs font-normal text-muted-foreground">({plans.length})</span>
          )}
        </h4>
        <Button
          size="sm"
          onClick={() => { setShowAdd(!showAdd); setEditingId(null); setForm({ name: "", sessions: "", price_per_night: "", total_nights: "", is_popular: false }); }}
          className="h-8 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Novo Plano
        </Button>
      </div>

      {/* Form (Add/Edit) */}
      {(showAdd || editingId) && (
        <div className="p-4 bg-muted/40 rounded-2xl border-2 border-primary/20 space-y-3">
          <p className="text-xs font-bold text-foreground">
            {editingId ? "✏️ Editar Plano" : "➕ Novo Plano"}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Nome do plano</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="h-9 text-sm rounded-xl" placeholder="Ex: Premium" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Sessões</Label>
              <Select value={form.sessions} onValueChange={v => setForm(p => ({ ...p, sessions: v }))}>
                <SelectTrigger className="h-9 text-sm rounded-xl"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {sessionsOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Preço por diária</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">R$</span>
                <Input
                  value={form.price_per_night}
                  onChange={e => handlePriceChange(e.target.value)}
                  className="h-9 text-sm pl-10 rounded-xl"
                  placeholder="0,00"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Total de noites</Label>
              <Select value={form.total_nights} onValueChange={v => setForm(p => ({ ...p, total_nights: v }))}>
                <SelectTrigger className="h-9 text-sm rounded-xl"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {nightsOptions.map(n => <SelectItem key={n} value={String(n)}>{n} {n === 1 ? "noite" : "noites"}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-card rounded-xl p-2.5 border border-border">
            <Switch checked={form.is_popular} onCheckedChange={v => setForm(p => ({ ...p, is_popular: v }))} />
            <Label className="text-xs font-medium">⭐ Marcar como "Mais Popular"</Label>
          </div>
          <div className="flex gap-2 pt-1">
            {editingId ? (
              <>
                <Button size="sm" className="h-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold flex-1" onClick={() => handleUpdate(editingId)}>
                  <Save className="w-3.5 h-3.5 mr-1" /> Salvar alterações
                </Button>
                <Button size="sm" variant="outline" className="h-9 rounded-xl text-xs" onClick={() => setEditingId(null)}>
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" className="h-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold flex-1" onClick={handleAdd}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Criar plano
                </Button>
                <Button size="sm" variant="outline" className="h-9 rounded-xl text-xs" onClick={() => setShowAdd(false)}>
                  Cancelar
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Plans list */}
      {plans.length === 0 && !showAdd && (
        <div className="text-center py-6 text-muted-foreground">
          <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-xs">Nenhum plano cadastrado</p>
          <p className="text-[10px]">Clique em "Novo Plano" para começar</p>
        </div>
      )}

      {plans.length > 0 && (
        <div className="grid gap-2">
          {plans.map(plan => {
            const total = plan.price_per_night * plan.total_nights;
            return (
              <div
                key={plan.id}
                className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  plan.is_popular
                    ? "bg-primary/10 border-primary/30"
                    : "bg-card border-border hover:border-primary/20"
                }`}
              >
                {plan.is_popular && (
                  <span className="absolute -top-2 left-3 text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    ⭐ Popular
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{plan.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {plan.sessions} · {plan.total_nights} {plan.total_nights === 1 ? "noite" : "noites"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-extrabold text-foreground">{formatCurrency(plan.price_per_night)}</p>
                  <p className="text-[10px] text-muted-foreground">Total: {formatCurrency(total)}</p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg hover:bg-primary/10" onClick={() => startEdit(plan)}>
                    <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg hover:bg-destructive/10" onClick={() => handleDelete(plan.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PricingPlansManager;
