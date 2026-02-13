import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CalendarCheck, CalendarX, CheckCircle2, Clock, XCircle, ChevronDown, ChevronUp, Users, CreditCard, FileImage, Trash2, Printer, Eye } from "lucide-react";
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

const ResortReservations = ({ resortId }: { resortId: string }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [guests, setGuests] = useState<Record<string, ReservationGuest[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [resortName, setResortName] = useState("");
  const [guestDetailId, setGuestDetailId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [resRes, guestRes, resortRes] = await Promise.all([
      supabase.from("reservations").select("*").eq("resort_id", resortId).order("created_at", { ascending: false }),
      supabase.from("reservation_guests").select("*"),
      supabase.from("resorts").select("name").eq("id", resortId).single(),
    ]);

    if (resRes.data) setReservations(resRes.data as Reservation[]);
    if (guestRes.data) {
      const map: Record<string, ReservationGuest[]> = {};
      guestRes.data.forEach((g: any) => {
        if (!map[g.reservation_id]) map[g.reservation_id] = [];
        map[g.reservation_id].push(g);
      });
      setGuests(map);
    }
    if (resortRes.data) setResortName(resortRes.data.name);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [resortId]);

  const handleConfirm = async (res: Reservation) => {
    const { error } = await supabase.from("reservations").update({ payment_status: "approved" }).eq("id", res.id);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }

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
    if (dates.length > 0) await supabase.from("blocked_dates").insert(dates);

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

  const handleDelete = async (res: Reservation) => {
    if (!confirm("⚠️ ATENÇÃO: Essa ação é irreversível!\n\nDeseja realmente APAGAR esta reserva e todos os dados de hóspedes vinculados?")) return;
    if (!confirm("Tem certeza ABSOLUTA? Os dados serão perdidos permanentemente.")) return;
    await supabase.from("reservation_guests").delete().eq("reservation_id", res.id);
    await supabase.from("reservations").delete().eq("id", res.id);
    toast({ title: "Reserva apagada permanentemente" });
    fetchData();
  };

  const handlePrint = (res: Reservation) => {
    const resGuests = guests[res.id] || [];
    const adultGuests = resGuests.filter(g => g.guest_type === "adult");
    const childGuests = resGuests.filter(g => g.guest_type === "child");
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html><head><title>Reserva - ${res.guest_name || "Hóspede"}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; color: #333; }
        h1 { font-size: 20px; margin-bottom: 4px; }
        h2 { font-size: 15px; color: #666; margin-top: 20px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
        .subtitle { font-size: 13px; color: #888; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 8px 0 16px; }
        td { padding: 4px 8px; font-size: 13px; border: 1px solid #eee; }
        td:first-child { font-weight: bold; width: 160px; background: #f9f9f9; }
        .status { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; }
        .status-approved { background: #dcfce7; color: #16a34a; }
        .status-pending { background: #fef9c3; color: #ca8a04; }
        .status-rejected { background: #fecaca; color: #dc2626; }
        .guest-section { margin: 6px 0; }
        .guest-type { font-size: 11px; text-transform: uppercase; font-weight: bold; color: #999; margin: 8px 0 4px; }
        @media print { body { padding: 15px; } }
      </style></head><body>
      <h1>📋 Ficha de Reserva</h1>
      <p class="subtitle">${resortName} · Reserva #${res.id.slice(0, 8)}</p>
      
      <span class="status status-${res.payment_status}">${res.payment_status === "approved" ? "✅ Confirmada" : res.payment_status === "pending" ? "⏳ Pendente" : "❌ Rejeitada"}</span>
      
      <h2>📅 Período</h2>
      <table>
        <tr><td>Check-in</td><td>${res.check_in ? format(new Date(res.check_in + "T12:00:00"), "dd/MM/yyyy") : "—"}</td></tr>
        <tr><td>Check-out</td><td>${res.check_out ? format(new Date(res.check_out + "T12:00:00"), "dd/MM/yyyy") : "—"}</td></tr>
        <tr><td>Noites</td><td>${res.total_nights}</td></tr>
        <tr><td>Hóspedes</td><td>${res.guests}</td></tr>
        <tr><td>Plano</td><td>${res.plan_name} · ${res.plan_sessions}</td></tr>
      </table>
      
      <h2>💰 Pagamento</h2>
      <table>
        <tr><td>Diária</td><td>R$ ${res.price_per_night.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td></tr>
        <tr><td>Total</td><td><strong>R$ ${res.total_price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong></td></tr>
        <tr><td>Método</td><td>${res.mp_payment_id ? "Mercado Pago" : res.receipt_url ? "Pix Manual" : "Pendente"}</td></tr>
      </table>
      
      <h2>😎 Responsável</h2>
      <table>
        <tr><td>Nome</td><td>${res.guest_name || "—"}</td></tr>
        <tr><td>Email</td><td>${res.guest_email || "—"}</td></tr>
        <tr><td>Celular</td><td>${res.guest_phone || "—"}</td></tr>
        <tr><td>RG</td><td>${res.responsible_rg || "—"}</td></tr>
        <tr><td>CPF</td><td>${res.responsible_cpf || "—"}</td></tr>
        <tr><td>Estado Civil</td><td>${res.responsible_civil_status || "—"}</td></tr>
        ${res.responsible_street ? `<tr><td>Endereço</td><td>${res.responsible_street}, ${res.responsible_number} · ${res.responsible_neighborhood} · ${res.responsible_city} · CEP ${res.responsible_cep}</td></tr>` : ""}
      </table>
      
      <h2>👥 Hóspedes (${resGuests.length})</h2>
      ${resGuests.length === 0 ? "<p style='color:#999;font-size:13px;'>Nenhum hóspede cadastrado</p>" : ""}
      ${adultGuests.length > 0 ? `
        <p class="guest-type">Adultos (${adultGuests.length})</p>
        <table>${adultGuests.map((g, i) => `<tr><td>${i + 1}. ${g.full_name}</td><td>CPF: ${g.cpf || "—"}</td></tr>`).join("")}</table>
      ` : ""}
      ${childGuests.length > 0 ? `
        <p class="guest-type">Crianças (${childGuests.length})</p>
        <table>${childGuests.map((g, i) => `<tr><td>${i + 1}. ${g.full_name}</td><td>Idade: ${g.age || "—"} anos</td></tr>`).join("")}</table>
      ` : ""}
      
      <hr style="margin-top:30px;border:none;border-top:1px solid #ddd;">
      <p style="font-size:11px;color:#aaa;margin-top:10px;">Documento gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}</p>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const filtered = filter === "all" ? reservations : reservations.filter(r => r.payment_status === filter);
  const formatCurrency = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  const pendingCount = reservations.filter(r => r.payment_status === "pending").length;

  if (loading) return <div className="flex justify-center py-4"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="border-2 border-primary/30 rounded-xl overflow-hidden bg-primary/5">
      {/* Header */}
      <div className="px-4 py-3 bg-primary/10 border-b border-primary/20">
        <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <CalendarCheck className="w-3.5 h-3.5" /> Reservas ({reservations.length})
        </p>
        <div className="flex gap-1">
          {(["all", "pending", "approved", "rejected"] as const).map(f => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              className="text-[10px] h-6 px-2 rounded-full"
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "Todas" : f === "pending" ? "Pendentes" : f === "approved" ? "Confirmadas" : "Rejeitadas"}
              {f === "pending" && pendingCount > 0 && (
                <span className="ml-1 bg-amber-500/20 text-amber-600 text-[9px] font-bold px-1 rounded-full">
                  {pendingCount}
                </span>
              )}
            </Button>
          ))}
        </div>
        </div>
      </div>

      <div className="p-4 space-y-3">

      {filtered.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">Nenhuma reserva</p>
      )}

      {filtered.map(res => {
        const resGuests = guests[res.id] || [];
        const adultGuests = resGuests.filter(g => g.guest_type === "adult");
        const childGuests = resGuests.filter(g => g.guest_type === "child");
        const isExpanded = expandedId === res.id;
        const status = statusLabels[res.payment_status] || statusLabels.pending;
        const StatusIcon = status.icon;
        const paymentMethod = res.mp_payment_id ? "Mercado Pago" : res.receipt_url ? "Pix Manual" : "Pendente";

        return (
          <div key={res.id} className={cn("border rounded-xl p-3 transition-all", res.payment_status === "pending" && "border-amber-500/30")}>
            <div className="flex items-center justify-between gap-2 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : res.id)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <StatusIcon className={cn("w-3.5 h-3.5 shrink-0", status.color)} />
                  <span className={cn("text-[10px] font-bold", status.color)}>{status.label}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {res.created_at ? format(new Date(res.created_at), "dd/MM/yy HH:mm") : ""}
                  </span>
                </div>
                <p className="text-xs font-bold text-foreground mt-0.5">{res.guest_name || "Sem nome"}</p>
                <p className="text-[10px] text-muted-foreground">
                  {res.check_in && format(new Date(res.check_in + "T12:00:00"), "dd/MM")} → {res.check_out && format(new Date(res.check_out + "T12:00:00"), "dd/MM")} · {res.guests} hóspedes
                </p>
              </div>
              <button
                className="p-1.5 rounded-full hover:bg-muted transition-colors shrink-0"
                title="Ver hóspedes"
                onClick={(e) => { e.stopPropagation(); setGuestDetailId(res.id); }}
              >
                <Eye className="w-4 h-4 text-primary" />
              </button>
              <div className="text-right shrink-0">
                <p className="text-xs font-extrabold text-foreground">{formatCurrency(res.total_price)}</p>
                <p className="text-[9px] text-muted-foreground">{res.plan_name}</p>
              </div>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
            </div>

            {isExpanded && (
              <div className="mt-3 space-y-3">
                {/* Payment */}
                <div className="bg-muted/40 rounded-lg p-2.5 space-y-1.5">
                  <p className="text-[10px] font-bold text-foreground flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> Pagamento
                  </p>
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    <div><span className="text-muted-foreground">Método:</span> <span className="font-semibold text-foreground">{paymentMethod}</span></div>
                    <div><span className="text-muted-foreground">Plano:</span> <span className="font-semibold text-foreground">{res.plan_name} · {res.plan_sessions}</span></div>
                    <div><span className="text-muted-foreground">Diária:</span> <span className="font-semibold text-foreground">{formatCurrency(res.price_per_night)}</span></div>
                    <div><span className="text-muted-foreground">Total ({res.total_nights}n):</span> <span className="font-semibold text-foreground">{formatCurrency(res.total_price)}</span></div>
                  </div>
                  {res.receipt_url && (
                    <Button size="sm" variant="outline" className="text-[10px] h-6 rounded-md gap-1" onClick={() => setReceiptPreview(res.receipt_url)}>
                      <FileImage className="w-3 h-3" /> Ver comprovante
                    </Button>
                  )}
                  {res.mp_payment_id && (
                    <p className="text-[9px] text-muted-foreground">MP ID: {res.mp_payment_id}</p>
                  )}
                </div>

                {/* Responsible */}
                <div className="bg-muted/40 rounded-lg p-2.5 space-y-1.5">
                  <p className="text-[10px] font-bold text-foreground">😎 Responsável</p>
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
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
                <div className="bg-muted/40 rounded-lg p-2.5 space-y-1.5">
                  <p className="text-[10px] font-bold text-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" /> Hóspedes ({resGuests.length})
                  </p>
                  {resGuests.length === 0 && (
                    <p className="text-[10px] text-muted-foreground italic">Nenhum hóspede cadastrado ainda</p>
                  )}
                  {adultGuests.length > 0 && (
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-semibold text-muted-foreground uppercase">Adultos ({adultGuests.length})</p>
                      {adultGuests.map(g => (
                        <div key={g.id} className="text-[10px] flex gap-2">
                          <span className="font-medium text-foreground">{g.full_name}</span>
                          {g.cpf && <span className="text-muted-foreground">CPF: {g.cpf}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  {childGuests.length > 0 && (
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-semibold text-muted-foreground uppercase">Crianças ({childGuests.length})</p>
                      {childGuests.map(g => (
                        <div key={g.id} className="text-[10px] flex gap-2">
                          <span className="font-medium text-foreground">{g.full_name}</span>
                          {g.age && <span className="text-muted-foreground">{g.age} anos</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" className="text-[10px] h-6 rounded-md gap-1" onClick={() => handlePrint(res)}>
                    <Printer className="w-3 h-3" /> Imprimir ficha
                  </Button>
                  {res.payment_status === "pending" && !res.mp_payment_id && (
                    <>
                      <Button size="sm" className="text-[10px] h-6 rounded-md gap-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleConfirm(res)}>
                        <CheckCircle2 className="w-3 h-3" /> Confirmar e bloquear
                      </Button>
                      <Button size="sm" variant="outline" className="text-[10px] h-6 rounded-md gap-1 text-destructive" onClick={() => handleReject(res.id)}>
                        <XCircle className="w-3 h-3" /> Rejeitar
                      </Button>
                      <Button size="sm" variant="outline" className="text-[10px] h-6 rounded-md gap-1 text-destructive border-destructive/30" onClick={() => handleDelete(res)}>
                        <Trash2 className="w-3 h-3" /> Apagar
                      </Button>
                    </>
                  )}
                  {res.payment_status === "approved" && (
                    <Button size="sm" variant="outline" className="text-[10px] h-6 rounded-md gap-1" onClick={() => handleUnblockDates(res)}>
                      <CalendarX className="w-3 h-3" /> Desbloquear datas
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Receipt preview */}
      <Dialog open={!!receiptPreview} onOpenChange={() => setReceiptPreview(null)}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
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

      {/* Guest detail dialog */}
      <Dialog open={!!guestDetailId} onOpenChange={() => setGuestDetailId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Users className="w-4 h-4" /> Ficha de Hóspedes
            </DialogTitle>
          </DialogHeader>
          {(() => {
            const res = reservations.find(r => r.id === guestDetailId);
            if (!res) return null;
            const resGuests = guests[res.id] || [];
            const adults = resGuests.filter(g => g.guest_type === "adult");
            const children = resGuests.filter(g => g.guest_type === "child");
            return (
              <div className="space-y-4">
                {/* Responsible */}
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-bold text-foreground">😎 Responsável</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div><span className="text-muted-foreground">Nome:</span> <span className="font-medium">{res.guest_name || "—"}</span></div>
                    <div><span className="text-muted-foreground">Celular:</span> <span className="font-medium">{res.guest_phone || "—"}</span></div>
                    <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{res.guest_email || "—"}</span></div>
                    <div><span className="text-muted-foreground">RG:</span> <span className="font-medium">{res.responsible_rg || "—"}</span></div>
                    <div><span className="text-muted-foreground">CPF:</span> <span className="font-medium">{res.responsible_cpf || "—"}</span></div>
                    <div><span className="text-muted-foreground">Estado Civil:</span> <span className="font-medium">{res.responsible_civil_status || "—"}</span></div>
                    {res.responsible_street && (
                      <div className="col-span-2"><span className="text-muted-foreground">Endereço:</span> <span className="font-medium">{res.responsible_street}, {res.responsible_number} · {res.responsible_neighborhood} · {res.responsible_city} · CEP {res.responsible_cep}</span></div>
                    )}
                  </div>
                </div>

                {/* Period */}
                <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                  <p className="text-xs font-bold text-foreground">📅 Período</p>
                  <p className="text-xs text-foreground">
                    {res.check_in ? format(new Date(res.check_in + "T12:00:00"), "dd/MM/yyyy") : "—"} → {res.check_out ? format(new Date(res.check_out + "T12:00:00"), "dd/MM/yyyy") : "—"} · {res.total_nights} noites · {res.guests} hóspedes
                  </p>
                  <p className="text-xs text-muted-foreground">{res.plan_name} · {res.plan_sessions}</p>
                </div>

                {/* Guests */}
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-bold text-foreground">👥 Hóspedes ({resGuests.length})</p>
                  {resGuests.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">Nenhum hóspede cadastrado</p>
                  )}
                  {adults.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Adultos ({adults.length})</p>
                      {adults.map((g, i) => (
                        <div key={g.id} className="flex justify-between items-center text-xs bg-background rounded-md px-2.5 py-1.5 border">
                          <span className="font-medium">{i + 1}. {g.full_name}</span>
                          <span className="text-muted-foreground">{g.cpf ? `CPF: ${g.cpf}` : "—"}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {children.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Crianças ({children.length})</p>
                      {children.map((g, i) => (
                        <div key={g.id} className="flex justify-between items-center text-xs bg-background rounded-md px-2.5 py-1.5 border">
                          <span className="font-medium">{i + 1}. {g.full_name}</span>
                          <span className="text-muted-foreground">{g.age ? `${g.age} anos` : "—"}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs" onClick={() => { setGuestDetailId(null); handlePrint(res); }}>
                  <Printer className="w-3.5 h-3.5" /> Imprimir ficha completa
                </Button>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default ResortReservations;
