import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { CalendarOff } from "lucide-react";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface BlockedDatesManagerProps {
  resortId: string;
}

const BlockedDatesManager = ({ resortId }: BlockedDatesManagerProps) => {
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBlocked = async () => {
    const { data } = await supabase
      .from("blocked_dates")
      .select("blocked_date")
      .eq("resort_id", resortId);
    if (data) {
      setBlockedDates(data.map(d => new Date(d.blocked_date + "T12:00:00")));
    }
  };

  useEffect(() => { fetchBlocked(); }, [resortId]);

  const toggleDate = async (date: Date | undefined) => {
    if (!date || loading) return;
    setLoading(true);
    const dateStr = format(date, "yyyy-MM-dd");
    const isBlocked = blockedDates.some(d => format(d, "yyyy-MM-dd") === dateStr);

    if (isBlocked) {
      await supabase
        .from("blocked_dates")
        .delete()
        .eq("resort_id", resortId)
        .eq("blocked_date", dateStr);
      toast({ title: `${format(date, "dd/MM/yyyy")} liberada` });
    } else {
      const { error } = await supabase.from("blocked_dates").insert({
        resort_id: resortId,
        blocked_date: dateStr,
      });
      if (error) {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
      } else {
        toast({ title: `${format(date, "dd/MM/yyyy")} bloqueada` });
      }
    }
    setLoading(false);
    fetchBlocked();
  };

  const blockedStrings = blockedDates.map(d => format(d, "yyyy-MM-dd"));

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <CalendarOff className="w-3 h-3 text-muted-foreground" />
        <Label className="text-xs font-medium text-muted-foreground">
          Disponibilidade ({blockedDates.length} bloqueadas)
        </Label>
      </div>
      <p className="text-[10px] text-muted-foreground">
        Clique nas datas para bloquear/desbloquear
      </p>
      <Calendar
        mode="single"
        onSelect={toggleDate}
        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
        modifiers={{ blocked: blockedDates }}
        modifiersClassNames={{ blocked: "bg-destructive/20 text-destructive line-through" }}
        className={cn("p-3 pointer-events-auto rounded-xl border border-border")}
        locale={ptBR}
        numberOfMonths={1}
      />
      <div className="flex gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-destructive/20 border border-destructive/30" /> Bloqueada
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-background border border-border" /> Disponível
        </span>
      </div>
    </div>
  );
};

export default BlockedDatesManager;
