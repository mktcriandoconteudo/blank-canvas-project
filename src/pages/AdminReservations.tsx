import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarCheck, CalendarX, Eye, CheckCircle2, Clock, XCircle, ChevronDown, ChevronUp, Users, MapPin, CreditCard, FileImage } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Reservation {
  id: string;
  resort_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  plan_name: string;
  plan_sessions: string;
  price_per_night: number;
  total_nights: number;
  total_price: number;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  payment_status: string;
  created_at: string | null;
  receipt_url: string | null;
  responsible_rg: string | null;
  responsible_cpf: string | null;
  responsible_civil_status: string | null;
  responsible_street: string | null;
  responsible_number: string | null;
  responsible_cep: string | null;
  responsible_neighborhood: string | null;
  responsible_city: string | null;
  mp_payment_id: string | null;
}

interface ResortInfo {
  id: string;
  name: string;
  parent_id: string | null;
}

interface ReservationGuest {
  id: string;
  reservation_id: string;
  guest_type: string;
  full_name: string;
  cpf: string | null;
  age: number | null;
}

const statusLabels: Record<string, { label: string; icon: typeof CheckCircle2; color: string }> = {
  pending: { label: "Pendente", icon: Clock, color: "text-amber-500" },
  approved: { label: "Confirmado", icon: CheckCircle2, color: "text-emerald-500" },
  rejected: { label: "Rejeitado", icon: XCircle, color: "text-destructive" },
};

const AdminReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [resorts, setResorts] = useState<Record<string, ResortInfo>>({});
  const [guests, setGuests] = useState<Record<string, ReservationGuest[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const fetchData = async () => {
    setLoading(true);
    const [resRes, resortRes, guestRes] = await Promise.all([
      supabase.from("reservations").select("*").order("created_at", { ascending: false }),
      supabase.from("resorts").select("id, name, parent_id"),
      supabase.from("reservation_guests").select("*"),
    ]);

    if (resRes.data) setReservations(resRes.data as Reservation[]);
    if (resortRes.data) {
      const map: Record<string, ResortInfo> = {};
      resortRes.data.forEach((r: any) => { map[r.id] = r; });
      setResorts(map);
    }
    if (guestRes.data) {
      const map: Record<string, ReservationGuest[]> = {};
      guestRes.data.forEach((g: any) => {
        if (!map[g.reservation_id]) map[g.reservation_id] = [];
        map[g.reservation_id].push(g);
      });
      setGuests(map);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleConfirm = async (res: Reservation) => {
    // Update status to approved
    const { error } = await supabase.from("reservations").update({ payment_status: "approved" }).eq("id", res.id);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }

    // Block the dates
    const start = new Date(res.check_in + "T12:00:00");
    const end = new Date(res.check_out + "T12:00:00");
    const dates: { resort_id: string; blocked_date: string; reason: string }[] = [];
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      dates.push({
        resort_id: res.resort_id,
        blocked_date: format(d, "yyyy-MM-dd"),
        reason: `Reserva: ${res.guest_name || "Hóspede"} (${res.id.slice(0, 8)})`,
      });
    }
    if (dates.length > 0) {
      await supabase.from("blocked_dates").insert(dates);
    }

    toast({ title: "Reserva confirmada!", description: "Datas bloqueadas automaticamente." });
    fetchData();
  };

  const handleReject = async (id: string) => {
    if (!confirm("Rejeitar esta reserva?")) return;
    await supabase.from("reservations").update({ payment_status: "rejected" }).eq("id", id);
    toast({ title: "Reserva rejeitada" });
    fetchData();
  };

  const handleUnblockDates = async (res: Reservation) => {
    if (!confirm("Desbloquear as datas desta reserva?")) return;
    const start = new Date(res.check_in + "T12:00:00");
    const end = new Date(res.check_out + "T12:00:00");
    const datesToUnblock: string[] = [];
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      datesToUnblock.push(format(d, "yyyy-MM-dd"));
    }
    await supabase.from("blocked_dates").delete()
      .eq("resort_id", res.resort_id)
      .in("blocked_date", datesToUnblock);
    toast({ title: "Datas desbloqueadas!" });
    fetchData();
  };

  const filtered = filter === "all" ? reservations : reservations.filter(r => r.payment_status === filter);

  const formatCurrency = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  if (loading) return <div className="flex items-center justify-center p-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-bold text-foreground">Reservas</h2>
        <div className="flex gap-1">
          {(["all", "pending", "approved", "rejected"] as const).map(f => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              className="text-xs h-8 rounded-full"
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "Todas" : f === "pending" ? "Pendentes" : f === "approved" ? "Confirmadas" : "Rejeitadas"}
              {f === "pending" && (
                <span className="ml-1 bg-amber-500/20 text-amber-600 text-[10px] font-bold px-1.5 rounded-full">
                  {reservations.filter(r => r.payment_status === "pending").length}
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <CalendarCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Nenhuma reserva encontrada</p>
        </div>
      )}

      {filtered.map(res => {
        const resort = resorts[res.resort_id];
        const resGuests = guests[res.id] || [];
        const adultGuests = resGuests.filter(g => g.guest_type === "adult");
        const childGuests = resGuests.filter(g => g.guest_type === "child");
        const isExpanded = expandedId === res.id;
        const status = statusLabels[res.payment_status] || statusLabels.pending;
        const StatusIcon = status.icon;
        const paymentMethod = res.mp_payment_id ? "Mercado Pago" : res.receipt_url ? "Pix Manual" : "Pendente";

        return (
          <Card key={res.id} className={cn("transition-all", res.payment_status === "pending" && "border-amber-500/30")}>
            <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : res.id)}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusIcon className={cn("w-4 h-4 shrink-0", status.color)} />
                    <span className={cn("text-xs font-bold", status.color)}>{status.label}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">
                      {res.created_at ? format(new Date(res.created_at), "dd/MM/yyyy HH:mm") : ""}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-foreground mt-1">{res.guest_name || "Sem nome"}</p>
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {resort?.name || "Resort"}
                    </span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">
                      {res.check_in && format(new Date(res.check_in + "T12:00:00"), "dd/MM")} → {res.check_out && format(new Date(res.check_out + "T12:00:00"), "dd/MM")}
                    </span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{res.guests} hóspedes</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-extrabold text-foreground">{formatCurrency(res.total_price)}</p>
                  <p className="text-[10px] text-muted-foreground">{res.plan_name}</p>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-0 space-y-4">
                {/* Payment info */}
                <div className="bg-muted/40 rounded-xl p-3 space-y-2">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" /> Pagamento
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Método:</span>{" "}
                      <span className="font-semibold text-foreground">{paymentMethod}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Plano:</span>{" "}
                      <span className="font-semibold text-foreground">{res.plan_name} · {res.plan_sessions}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Diária:</span>{" "}
                      <span className="font-semibold text-foreground">{formatCurrency(res.price_per_night)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total ({res.total_nights} noites):</span>{" "}
                      <span className="font-semibold text-foreground">{formatCurrency(res.total_price)}</span>
                    </div>
                  </div>
                  {res.receipt_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 rounded-lg gap-1.5"
                      onClick={() => setReceiptPreview(res.receipt_url)}
                    >
                      <FileImage className="w-3.5 h-3.5" /> Ver comprovante
                    </Button>
                  )}
                  {res.mp_payment_id && (
                    <p className="text-[10px] text-muted-foreground">MP Payment ID: {res.mp_payment_id}</p>
                  )}
                </div>

                {/* Responsible info */}
                <div className="bg-muted/40 rounded-xl p-3 space-y-2">
                  <p className="text-xs font-bold text-foreground">😎 Responsável</p>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div><span className="text-muted-foreground">Nome:</span> <span className="font-medium text-foreground">{res.guest_name}</span></div>
                    <div><span className="text-muted-foreground">Email:</span> <span className="font-medium text-foreground">{res.guest_email}</span></div>
                    <div><span className="text-muted-foreground">Celular:</span> <span className="font-medium text-foreground">{res.guest_phone}</span></div>
                    <div><span className="text-muted-foreground">RG:</span> <span className="font-medium text-foreground">{res.responsible_rg || "—"}</span></div>
                    <div><span className="text-muted-foreground">CPF:</span> <span className="font-medium text-foreground">{res.responsible_cpf || "—"}</span></div>
                    <div><span className="text-muted-foreground">Estado civil:</span> <span className="font-medium text-foreground">{res.responsible_civil_status || "—"}</span></div>
                    {res.responsible_street && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Endereço:</span>{" "}
                        <span className="font-medium text-foreground">
                          {res.responsible_street}, {res.responsible_number} · {res.responsible_neighborhood} · {res.responsible_city} · CEP {res.responsible_cep}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Guests */}
                {resGuests.length > 0 && (
                  <div className="bg-muted/40 rounded-xl p-3 space-y-2">
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> Hóspedes ({resGuests.length})
                    </p>
                    {adultGuests.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase">Adultos</p>
                        {adultGuests.map(g => (
                          <div key={g.id} className="text-xs flex gap-2">
                            <span className="font-medium text-foreground">{g.full_name}</span>
                            {g.cpf && <span className="text-muted-foreground">CPF: {g.cpf}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                    {childGuests.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase">Crianças</p>
                        {childGuests.map(g => (
                          <div key={g.id} className="text-xs flex gap-2">
                            <span className="font-medium text-foreground">{g.full_name}</span>
                            {g.age && <span className="text-muted-foreground">{g.age} anos</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  {res.payment_status === "pending" && (
                    <>
                      <Button size="sm" className="text-xs h-8 rounded-lg gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleConfirm(res)}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirmar e bloquear datas
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs h-8 rounded-lg gap-1.5 text-destructive" onClick={() => handleReject(res.id)}>
                        <XCircle className="w-3.5 h-3.5" /> Rejeitar
                      </Button>
                    </>
                  )}
                  {res.payment_status === "approved" && (
                    <Button size="sm" variant="outline" className="text-xs h-8 rounded-lg gap-1.5" onClick={() => handleUnblockDates(res)}>
                      <CalendarX className="w-3.5 h-3.5" /> Desbloquear datas
                    </Button>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Receipt preview */}
      <Dialog open={!!receiptPreview} onOpenChange={() => setReceiptPreview(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Comprovante de pagamento</DialogTitle>
          </DialogHeader>
          {receiptPreview && (
            receiptPreview.endsWith(".pdf") ? (
              <iframe src={receiptPreview} className="w-full h-[500px] rounded-lg" />
            ) : (
              <img src={receiptPreview} alt="Comprovante" className="w-full rounded-lg" />
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReservations;
