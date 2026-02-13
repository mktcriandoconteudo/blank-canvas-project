import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Mail, Phone, User, Calendar, ChevronDown, ChevronUp, MapPin, CreditCard, Users, Home, Trash2, Printer, Eye, Banknote } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const AdminClients = () => {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ profileId: string; reservationIds: string[]; name: string } | null>(null);
  const [deleteReservationTarget, setDeleteReservationTarget] = useState<{ id: string; guestName: string } | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["admin-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: reservations } = useQuery({
    queryKey: ["admin-clients-reservations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: guests } = useQuery({
    queryKey: ["admin-clients-guests"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reservation_guests").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: resorts } = useQuery({
    queryKey: ["admin-clients-resorts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("resorts").select("id, name");
      if (error) throw error;
      return data;
    },
  });

  const deleteClient = useMutation({
    mutationFn: async ({ profileId, reservationIds }: { profileId: string; reservationIds: string[] }) => {
      for (const rid of reservationIds) {
        const { error: gErr } = await supabase
          .from("reservation_guests")
          .delete()
          .eq("reservation_id", rid);
        if (gErr) throw gErr;
        const { error: rErr } = await supabase
          .from("reservations")
          .delete()
          .eq("id", rid);
        if (rErr) throw rErr;
      }
      const { error: pErr } = await supabase
        .from("profiles")
        .delete()
        .eq("id", profileId);
      if (pErr) throw pErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-clients"] });
      queryClient.invalidateQueries({ queryKey: ["admin-clients-reservations"] });
      queryClient.invalidateQueries({ queryKey: ["admin-clients-guests"] });
      toast({ title: "Cliente excluído com sucesso! 🗑️" });
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast({ title: "Erro ao excluir", description: err.message, variant: "destructive" });
    },
  });

  const deleteReservation = useMutation({
    mutationFn: async (reservationId: string) => {
      const { error: gErr } = await supabase
        .from("reservation_guests")
        .delete()
        .eq("reservation_id", reservationId);
      if (gErr) throw gErr;
      const { error: rErr } = await supabase
        .from("reservations")
        .delete()
        .eq("id", reservationId);
      if (rErr) throw rErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-clients-reservations"] });
      queryClient.invalidateQueries({ queryKey: ["admin-clients-guests"] });
      toast({ title: "Reserva excluída! A data foi liberada. 🗑️" });
      setDeleteReservationTarget(null);
    },
    onError: (err: any) => {
      toast({ title: "Erro ao excluir reserva", description: err.message, variant: "destructive" });
    },
  });

  const guestsByReservation = useMemo(() => {
    const map: Record<string, NonNullable<typeof guests>> = {};
    if (!guests) return map;
    for (const g of guests) {
      if (!map[g.reservation_id]) map[g.reservation_id] = [];
      map[g.reservation_id].push(g);
    }
    return map;
  }, [guests]);

  const resortMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (!resorts) return map;
    for (const r of resorts) map[r.id] = r.name;
    return map;
  }, [resorts]);

  const handlePrintReservation = (r: NonNullable<typeof reservations>[0]) => {
    const rGuests = guestsByReservation[r.id] || [];
    const adultGuests = rGuests.filter(g => g.guest_type === "adult");
    const childGuests = rGuests.filter(g => g.guest_type === "child");
    const pw = window.open("", "_blank");
    if (!pw) return;
    pw.document.write(`<html><head><title>Reserva - ${r.guest_name || "Hóspede"}</title>
      <style>body{font-family:Arial,sans-serif;padding:30px;color:#333}h1{font-size:20px;margin-bottom:4px}h2{font-size:15px;color:#666;margin-top:20px;border-bottom:1px solid #ddd;padding-bottom:4px}.subtitle{font-size:13px;color:#888;margin-bottom:20px}table{width:100%;border-collapse:collapse;margin:8px 0 16px}td{padding:4px 8px;font-size:13px;border:1px solid #eee}td:first-child{font-weight:bold;width:160px;background:#f9f9f9}.status{display:inline-block;padding:2px 10px;border-radius:12px;font-size:12px;font-weight:bold}.status-approved{background:#dcfce7;color:#16a34a}.status-pending{background:#fef9c3;color:#ca8a04}.status-rejected{background:#fecaca;color:#dc2626}.guest-type{font-size:11px;text-transform:uppercase;font-weight:bold;color:#999;margin:8px 0 4px}@media print{body{padding:15px}}</style></head><body>
      <h1>📋 Ficha de Reserva</h1>
      <p class="subtitle">${resortMap[r.resort_id] || "Resort"} · Reserva #${r.id.slice(0, 8)}</p>
      <span class="status status-${r.payment_status}">${r.payment_status === "approved" ? "✅ Confirmada" : r.payment_status === "pending" ? "⏳ Pendente" : "❌ Rejeitada"}</span>
      <h2>📅 Período</h2>
      <table><tr><td>Check-in</td><td>${format(new Date(r.check_in), "dd/MM/yyyy")}</td></tr><tr><td>Check-out</td><td>${format(new Date(r.check_out), "dd/MM/yyyy")}</td></tr><tr><td>Noites</td><td>${r.total_nights}</td></tr><tr><td>Hóspedes</td><td>${r.guests}</td></tr><tr><td>Plano</td><td>${r.plan_name} · ${r.plan_sessions}</td></tr></table>
      <h2>💰 Pagamento</h2>
      <table><tr><td>Diária</td><td>R$ ${Number(r.price_per_night).toFixed(2)}</td></tr><tr><td>Total</td><td><strong>R$ ${Number(r.total_price).toFixed(2)}</strong></td></tr></table>
      <h2>😎 Responsável</h2>
      <table><tr><td>Nome</td><td>${r.guest_name || "—"}</td></tr><tr><td>Email</td><td>${r.guest_email || "—"}</td></tr><tr><td>Celular</td><td>${r.guest_phone || "—"}</td></tr><tr><td>RG</td><td>${r.responsible_rg || "—"}</td></tr><tr><td>CPF</td><td>${r.responsible_cpf || "—"}</td></tr><tr><td>Estado Civil</td><td>${r.responsible_civil_status || "—"}</td></tr>${r.responsible_street ? `<tr><td>Endereço</td><td>${r.responsible_street}, ${r.responsible_number} · ${r.responsible_neighborhood} · ${r.responsible_city}/${r.responsible_state} · CEP ${r.responsible_cep}</td></tr>` : ""}</table>
      <h2>👥 Hóspedes (${rGuests.length})</h2>
      ${rGuests.length === 0 ? "<p style='color:#999;font-size:13px;'>Nenhum hóspede cadastrado</p>" : ""}
      ${adultGuests.length > 0 ? `<p class="guest-type">Adultos (${adultGuests.length})</p><table>${adultGuests.map((g, i) => `<tr><td>${i + 1}. ${g.full_name}</td><td>CPF: ${g.cpf || "—"}</td></tr>`).join("")}</table>` : ""}
      ${childGuests.length > 0 ? `<p class="guest-type">Crianças (${childGuests.length})</p><table>${childGuests.map((g, i) => `<tr><td>${i + 1}. ${g.full_name}</td><td>Idade: ${g.age || "—"} anos</td></tr>`).join("")}</table>` : ""}
      </body></html>`);
    pw.document.close();
    pw.print();
  };

  // Match reservations to profiles by phone, name, or email (including @reservas.app)
  const getReservationsForProfile = (p: NonNullable<typeof profiles>[0]) => {
    if (!reservations) return [];
    const pPhone = p.phone?.replace(/\D/g, "");
    const pName = p.full_name?.toLowerCase().trim();
    const pEmail = p.email?.toLowerCase().trim();
    const pContactEmail = p.contact_email?.toLowerCase().trim();

    // First pass: direct match by phone, email or name
    const directMatches = reservations.filter((r) => {
      const rPhone = r.guest_phone?.replace(/\D/g, "");
      const rEmail = r.guest_email?.toLowerCase().trim();
      const rName = r.guest_name?.toLowerCase().trim();
      if (pPhone && rPhone && pPhone.length >= 8 && pPhone === rPhone) return true;
      if (pEmail && rEmail && pEmail === rEmail) return true;
      if (pContactEmail && rEmail && pContactEmail === rEmail) return true;
      if (pName && rName && pName === rName) return true;
      return false;
    });

    // Second pass: collect all guest_emails from direct matches, then include
    // any other reservations with those same emails (catches entries without name/phone)
    const matchedEmails = new Set<string>();
    directMatches.forEach((r) => {
      const rEmail = r.guest_email?.toLowerCase().trim();
      if (rEmail) matchedEmails.add(rEmail);
    });

    if (matchedEmails.size === 0) return directMatches;

    return reservations.filter((r) => {
      const rPhone = r.guest_phone?.replace(/\D/g, "");
      const rEmail = r.guest_email?.toLowerCase().trim();
      const rName = r.guest_name?.toLowerCase().trim();
      // Direct matches
      if (pPhone && rPhone && pPhone.length >= 8 && pPhone === rPhone) return true;
      if (pEmail && rEmail && pEmail === rEmail) return true;
      if (pContactEmail && rEmail && pContactEmail === rEmail) return true;
      if (pName && rName && pName === rName) return true;
      // Transitive match by email
      if (rEmail && matchedEmails.has(rEmail)) return true;
      return false;
    });
  };

  const filtered = useMemo(() => {
    if (!profiles) return [];
    if (!search.trim()) return profiles;
    const q = search.toLowerCase();
    return profiles.filter(
      (p) =>
        p.full_name?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.contact_email?.toLowerCase().includes(q) ||
        p.phone?.includes(q)
    );
  }, [profiles, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Clientes Cadastrados
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {profiles?.length ?? 0} clientes no total
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, e-mail ou telefone..."
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Nenhum cliente encontrado.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const isExpanded = expandedId === p.id;
            const clientReservations = getReservationsForProfile(p);

            return (
              <div key={p.id} className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Summary row */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : p.id)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
                  >
                    {p.avatar_url ? (
                      <img src={p.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{p.full_name || "—"}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {p.contact_email || p.email || "—"}
                        {p.phone && ` · ${p.phone}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {clientReservations.length > 0 && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          {clientReservations.length} reserva{clientReservations.length > 1 ? "s" : ""}
                        </span>
                      )}
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget({
                        profileId: p.id,
                        reservationIds: clientReservations.map((r) => r.id),
                        name: p.full_name || "este cliente",
                      });
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-border px-4 py-4 space-y-5 bg-muted/20">
                    {/* Profile info */}
                    <div>
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Dados do Perfil</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <InfoItem icon={User} label="Nome" value={p.full_name} />
                        <InfoItem icon={Phone} label="Telefone" value={p.phone} />
                        <InfoItem icon={Mail} label="E-mail" value={p.contact_email || p.email} />
                        <InfoItem icon={Calendar} label="Cadastro" value={p.created_at ? format(new Date(p.created_at), "dd/MM/yyyy") : null} />
                      </div>
                    </div>

                    {/* Reservations */}
                    {clientReservations.length > 0 ? (
                      <div>
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                          Reservas ({clientReservations.length})
                        </h3>
                        <div className="space-y-3">
                          {clientReservations.map((r) => {
                            const rGuests = guestsByReservation[r.id] || [];
                            return (
                              <div key={r.id} className="rounded-lg border border-border bg-card p-4 space-y-3">
                                {/* Header */}
                                <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-4 gap-y-1.5 text-sm">
                                  <span className="font-semibold text-foreground">{resortMap[r.resort_id] || "Resort"}</span>
                                  <span className="text-muted-foreground">
                                    {format(new Date(r.check_in), "dd/MM/yyyy")} → {format(new Date(r.check_out), "dd/MM/yyyy")}
                                  </span>
                                  <span className={cn(
                                    "text-xs px-2.5 py-1 rounded-full font-bold",
                                    r.payment_status === "approved" ? "bg-emerald-500 text-white shadow-sm" : "bg-destructive/10 text-destructive"
                                  )}>
                                    {r.payment_status === "approved" ? "Pago" : r.payment_status === "pending" ? "Pendente" : r.payment_status}
                                  </span>
                                  <span className={cn(
                                    "text-xs px-2 py-0.5 rounded-full font-medium",
                                    r.mp_payment_id ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                  )}>
                                    <Banknote className="w-3 h-3 inline mr-1" />
                                    {r.mp_payment_id ? "Mercado Pago" : "Pix Manual"}
                                  </span>
                                  <span className="text-muted-foreground text-xs">R$ {Number(r.total_price).toFixed(2)}</span>
                                  <div className="flex items-center gap-1 ml-auto">
                                    {r.receipt_url && (
                                      <button
                                        onClick={() => setReceiptUrl(r.receipt_url)}
                                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-xs font-medium text-primary"
                                        title="Ver comprovante"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                        Comprovante
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handlePrintReservation(r)}
                                      className="p-1 rounded-lg hover:bg-muted transition-colors"
                                      title="Imprimir ficha"
                                    >
                                      <Printer className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                    <button
                                      onClick={() => setDeleteReservationTarget({ id: r.id, guestName: r.guest_name || "esta reserva" })}
                                      className="p-1 rounded-lg hover:bg-destructive/10 transition-colors"
                                      title="Excluir reserva"
                                    >
                                      <Trash2 className="w-4 h-4 text-destructive" />
                                    </button>
                                  </div>
                                </div>

                                {/* Responsible data */}
                                {(r.responsible_cpf || r.responsible_rg || r.responsible_civil_status || r.responsible_street) && (
                                  <div>
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Dados do Responsável</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                      <InfoItem icon={User} label="Nome" value={r.guest_name} />
                                      <InfoItem icon={Phone} label="Telefone" value={r.guest_phone} />
                                      <InfoItem icon={Mail} label="E-mail" value={r.guest_email} />
                                      <InfoItem icon={CreditCard} label="CPF" value={r.responsible_cpf} />
                                      <InfoItem icon={CreditCard} label="RG" value={r.responsible_rg} />
                                      <InfoItem icon={User} label="Estado Civil" value={r.responsible_civil_status} />
                                      <InfoItem icon={Home} label="Rua" value={r.responsible_street} />
                                      <InfoItem icon={Home} label="Número" value={r.responsible_number} />
                                      <InfoItem icon={MapPin} label="Bairro" value={r.responsible_neighborhood} />
                                      <InfoItem icon={MapPin} label="Cidade" value={r.responsible_city} />
                                      <InfoItem icon={MapPin} label="CEP" value={r.responsible_cep} />
                                    </div>
                                  </div>
                                )}

                                {/* Guests */}
                                {rGuests.length > 0 && (
                                  <div>
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                      Hóspedes ({rGuests.length})
                                    </h4>
                                    <div className="pl-3 border-l-2 border-primary/20 space-y-1.5">
                                      {rGuests.map((g) => (
                                        <div key={g.id} className="text-sm text-foreground flex flex-wrap gap-x-3">
                                          <span className="font-medium">{g.full_name}</span>
                                          {g.cpf && <span className="text-muted-foreground">CPF: {g.cpf}</span>}
                                          {g.age != null && <span className="text-muted-foreground">{g.age} anos</span>}
                                          <span className="text-muted-foreground">
                                            {g.guest_type === "adult" ? "Adulto" : g.guest_type === "child" ? "Criança" : g.guest_type}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {!r.responsible_cpf && !r.responsible_rg && !r.responsible_street && rGuests.length === 0 && (
                                  <p className="text-xs text-muted-foreground italic">Formulário de hóspedes não preenchido nesta reserva.</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Nenhuma reserva encontrada para este cliente.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deleteTarget?.name}</strong>? {deleteTarget && deleteTarget.reservationIds.length > 0 ? `Todas as ${deleteTarget.reservationIds.length} reserva(s) e dados de hóspedes vinculados também serão removidos.` : "Esta ação não pode ser desfeita."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteClient.mutate({ profileId: deleteTarget.profileId, reservationIds: deleteTarget.reservationIds })}
              disabled={deleteClient.isPending}
            >
              {deleteClient.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete single reservation dialog */}
      <AlertDialog open={!!deleteReservationTarget} onOpenChange={(open) => !open && setDeleteReservationTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a reserva de <strong>{deleteReservationTarget?.guestName}</strong>? A data será liberada automaticamente. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteReservationTarget && deleteReservation.mutate(deleteReservationTarget.id)}
              disabled={deleteReservation.isPending}
            >
              {deleteReservation.isPending ? "Excluindo..." : "Excluir Reserva"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Receipt viewer dialog */}
      <Dialog open={!!receiptUrl} onOpenChange={(open) => !open && setReceiptUrl(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" /> Comprovante de Pagamento
            </DialogTitle>
          </DialogHeader>
          {receiptUrl && (
            receiptUrl.endsWith(".pdf") ? (
              <iframe src={receiptUrl} className="w-full h-[70vh] rounded-lg border border-border" />
            ) : (
              <div className="flex items-center justify-center overflow-auto max-h-[70vh]">
                <img src={receiptUrl} alt="Comprovante" className="max-w-full max-h-[70vh] rounded-lg object-contain" />
              </div>
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null | undefined }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-foreground font-medium">{value}</p>
      </div>
    </div>
  );
};

export default AdminClients;
