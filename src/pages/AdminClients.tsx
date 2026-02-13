import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search, Mail, Phone, User, Calendar, ChevronDown, ChevronUp, MapPin, CreditCard, Users, Home } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const AdminClients = () => {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  // Match reservations to profiles by phone, name, or email
  const getReservationsForProfile = (p: NonNullable<typeof profiles>[0]) => {
    if (!reservations) return [];
    const pPhone = p.phone?.replace(/\D/g, "");
    const pName = p.full_name?.toLowerCase().trim();
    const pEmail = p.email?.toLowerCase().trim();
    const pContactEmail = (p as any).contact_email?.toLowerCase().trim();

    return reservations.filter((r) => {
      const rPhone = r.guest_phone?.replace(/\D/g, "");
      if (pPhone && rPhone && pPhone === rPhone) return true;
      if (pName && r.guest_name?.toLowerCase().trim() === pName) return true;
      if (pEmail && r.guest_email?.toLowerCase().trim() === pEmail) return true;
      if (pContactEmail && r.guest_email?.toLowerCase().trim() === pContactEmail) return true;
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
        (p as any).contact_email?.toLowerCase().includes(q) ||
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

      {/* Search */}
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
                <button
                  onClick={() => setExpandedId(isExpanded ? null : p.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
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
                      {(p as any).contact_email || p.email || "—"}
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

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-border px-4 py-4 space-y-5 bg-muted/20">
                    {/* Profile info */}
                    <div>
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Dados do Perfil</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <InfoItem icon={User} label="Nome" value={p.full_name} />
                        <InfoItem icon={Phone} label="Telefone" value={p.phone} />
                        <InfoItem icon={Mail} label="E-mail" value={(p as any).contact_email || p.email} />
                        <InfoItem icon={Calendar} label="Cadastro" value={p.created_at ? format(new Date(p.created_at), "dd/MM/yyyy") : null} />
                      </div>
                    </div>

                    {/* Reservations with full guest form data */}
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
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                                  <span className="font-semibold text-foreground">{resortMap[r.resort_id] || "Resort"}</span>
                                  <span className="text-muted-foreground">
                                    {format(new Date(r.check_in), "dd/MM/yyyy")} → {format(new Date(r.check_out), "dd/MM/yyyy")}
                                  </span>
                                  <span className={cn(
                                    "text-xs px-2 py-0.5 rounded-full font-medium",
                                    r.payment_status === "approved" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                                  )}>
                                    {r.payment_status === "approved" ? "Pago" : r.payment_status === "pending" ? "Pendente" : r.payment_status}
                                  </span>
                                  <span className="text-muted-foreground text-xs">R$ {Number(r.total_price).toFixed(2)}</span>
                                </div>

                                {/* Responsible data from guest form */}
                                {(r.responsible_cpf || r.responsible_rg || r.responsible_street) && (
                                  <div>
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Dados do Responsável (Formulário)</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                                    <div className="pl-3 border-l-2 border-primary/20 space-y-1">
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
                                  <p className="text-xs text-muted-foreground italic">Formulário de hóspedes não preenchido.</p>
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
