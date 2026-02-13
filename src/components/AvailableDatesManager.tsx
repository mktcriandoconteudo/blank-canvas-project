import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CalendarCheck } from "lucide-react";
import { format, isSameDay, eachDayOfInterval, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/hooks/use-toast";

interface Props {
  resortId: string;
}

const AvailableDatesManager = ({ resortId }: Props) => {
  const [enabled, setEnabled] = useState(false);
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const [reservedDays, setReservedDays] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [resortRes, datesRes, reservedRes] = await Promise.all([
      supabase.from("resorts").select("use_available_dates").eq("id", resortId).single(),
      supabase.from("available_dates").select("id, start_date").eq("resort_id", resortId).order("start_date"),
      supabase.from("reservations").select("check_in, check_out").eq("resort_id", resortId).eq("payment_status", "approved"),
    ]);
    if (resortRes.data) setEnabled(resortRes.data.use_available_dates);
    if (datesRes.data) {
      setSelectedDays(datesRes.data.map(d => new Date(d.start_date + "T12:00:00")));
    }
    if (reservedRes.data) {
      const allReserved: Date[] = [];
      for (const r of reservedRes.data) {
        const days = eachDayOfInterval({
          start: new Date(r.check_in + "T12:00:00"),
          end: addDays(new Date(r.check_out + "T12:00:00"), -1),
        });
        allReserved.push(...days);
      }
      setReservedDays(allReserved);
    }
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

  const handleDayClick = async (day: Date) => {
    if (!day) return;
    // Don't allow toggling reserved dates
    if (reservedDays.some(rd => isSameDay(rd, day))) {
      toast({ title: "Data com reserva confirmada", description: "Não é possível alterar datas com reservas aprovadas.", variant: "destructive" });
      return;
    }
    setSaving(true);

    const existing = selectedDays.find(d => isSameDay(d, day));
    const dateStr = format(day, "yyyy-MM-dd");

    if (existing) {
      // Remove
      await supabase.from("available_dates").delete()
        .eq("resort_id", resortId)
        .eq("start_date", dateStr);
      setSelectedDays(prev => prev.filter(d => !isSameDay(d, day)));
    } else {
      // Add
      await supabase.from("available_dates").insert({
        resort_id: resortId,
        start_date: dateStr,
        end_date: dateStr,
      });
      setSelectedDays(prev => [...prev, new Date(dateStr + "T12:00:00")]);
    }
    setSaving(false);
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
        <div className="bg-muted/40 rounded-xl p-3 border border-border">
          <p className="text-xs text-muted-foreground mb-2">
            Clique nos dias para marcar/desmarcar como disponíveis:
          </p>
          <div className="flex justify-center">
            <Calendar
              mode="multiple"
              selected={selectedDays}
              onDayClick={handleDayClick}
              locale={ptBR}
              disabled={(date) => date < new Date()}
              className="p-3 pointer-events-auto rounded-xl bg-background border"
              modifiers={{
                available: selectedDays.filter(d => !reservedDays.some(rd => isSameDay(rd, d))),
                reserved: reservedDays,
              }}
              modifiersClassNames={{
                available: "!bg-primary !text-primary-foreground !font-bold",
                reserved: "!bg-destructive/20 !text-destructive !line-through !font-bold",
              }}
            />
          </div>
          <div className="flex gap-3 text-[10px] text-muted-foreground justify-center mt-2">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-primary" /> Disponível
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-destructive/20 border border-destructive/30" /> Reservado
            </span>
          </div>
          {selectedDays.length > 0 && (
            <p className="text-[10px] text-muted-foreground text-center mt-1">
              {selectedDays.filter(d => !reservedDays.some(rd => isSameDay(rd, d))).length} disponível(is) · {reservedDays.length} reservada(s)
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AvailableDatesManager;
