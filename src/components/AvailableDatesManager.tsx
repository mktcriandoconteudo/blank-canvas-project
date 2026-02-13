import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar, Plus, Trash2, CalendarCheck } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface AvailableDate {
  id: string;
  resort_id: string;
  start_date: string;
  end_date: string;
  label: string | null;
}

interface Props {
  resortId: string;
}

const AvailableDatesManager = ({ resortId }: Props) => {
  const [enabled, setEnabled] = useState(false);
  const [dates, setDates] = useState<AvailableDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newStart, setNewStart] = useState<Date | undefined>();
  const [newEnd, setNewEnd] = useState<Date | undefined>();
  const [newLabel, setNewLabel] = useState("");
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [resortRes, datesRes] = await Promise.all([
      supabase.from("resorts").select("use_available_dates").eq("id", resortId).single(),
      supabase.from("available_dates").select("*").eq("resort_id", resortId).order("start_date"),
    ]);
    if (resortRes.data) setEnabled(resortRes.data.use_available_dates);
    if (datesRes.data) setDates(datesRes.data as AvailableDate[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [resortId]);

  const toggleEnabled = async (val: boolean) => {
    setEnabled(val);
    await supabase.from("resorts").update({ use_available_dates: val } as any).eq("id", resortId);
    toast({ title: val ? "Datas disponíveis ativadas" : "Datas disponíveis desativadas" });
  };

  const handleAdd = async () => {
    if (!newStart || !newEnd) {
      toast({ title: "Selecione as datas de início e fim", variant: "destructive" });
      return;
    }
    if (newEnd < newStart) {
      toast({ title: "A data final deve ser após a inicial", variant: "destructive" });
      return;
    }
    setAdding(true);
    const { error } = await supabase.from("available_dates").insert({
      resort_id: resortId,
      start_date: format(newStart, "yyyy-MM-dd"),
      end_date: format(newEnd, "yyyy-MM-dd"),
      label: newLabel || null,
    });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Período adicionado!" });
      setNewStart(undefined);
      setNewEnd(undefined);
      setNewLabel("");
      fetchData();
    }
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("available_dates").delete().eq("id", id);
    toast({ title: "Período removido!" });
    fetchData();
  };

  if (loading) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <CalendarCheck className="w-3.5 h-3.5" />
          Datas Disponíveis
        </span>
        <div className="flex items-center gap-2">
          <Label htmlFor={`avail-toggle-${resortId}`} className="text-[10px] text-muted-foreground">
            {enabled ? "Ativo" : "Desligado"}
          </Label>
          <Switch
            id={`avail-toggle-${resortId}`}
            checked={enabled}
            onCheckedChange={toggleEnabled}
          />
        </div>
      </div>

      {enabled && (
        <div className="space-y-2 bg-muted/40 rounded-xl p-3 border border-border">
          {/* Existing ranges */}
          {dates.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">Nenhum período cadastrado. Adicione abaixo.</p>
          ) : (
            <div className="space-y-1.5">
              {dates.map(d => (
                <div key={d.id} className="flex items-center justify-between bg-background rounded-lg px-3 py-2 border text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span className="font-semibold">
                      {format(new Date(d.start_date + "T12:00:00"), "dd/MM/yyyy")} → {format(new Date(d.end_date + "T12:00:00"), "dd/MM/yyyy")}
                    </span>
                    {d.label && <span className="text-muted-foreground">· {d.label}</span>}
                  </div>
                  <button onClick={() => handleDelete(d.id)} className="text-destructive hover:text-destructive/80">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add new range */}
          <div className="flex flex-wrap items-end gap-2 pt-2 border-t border-border">
            <div className="space-y-1">
              <Label className="text-[10px]">Início</Label>
              <Popover open={startOpen} onOpenChange={setStartOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("text-xs w-[120px] justify-start", !newStart && "text-muted-foreground")}>
                    <Calendar className="w-3 h-3 mr-1" />
                    {newStart ? format(newStart, "dd/MM/yyyy") : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarUI
                    mode="single"
                    selected={newStart}
                    onSelect={(d) => { setNewStart(d); setStartOpen(false); }}
                    locale={ptBR}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px]">Fim</Label>
              <Popover open={endOpen} onOpenChange={setEndOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("text-xs w-[120px] justify-start", !newEnd && "text-muted-foreground")}>
                    <Calendar className="w-3 h-3 mr-1" />
                    {newEnd ? format(newEnd, "dd/MM/yyyy") : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarUI
                    mode="single"
                    selected={newEnd}
                    onSelect={(d) => { setNewEnd(d); setEndOpen(false); }}
                    locale={ptBR}
                    disabled={(date) => newStart ? date < newStart : false}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px]">Rótulo (opcional)</Label>
              <Input
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                placeholder="Ex: Carnaval"
                className="h-9 text-xs w-[120px]"
              />
            </div>

            <Button size="sm" onClick={handleAdd} disabled={adding} className="h-9">
              <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableDatesManager;
