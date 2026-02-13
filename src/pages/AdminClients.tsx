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

  const { data: reservations, isLoading } = useQuery({
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

  const { data: profiles } = useQuery({
    queryKey: ["admin-clients-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
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

  // Group reservations by guest identity (phone > name > email)
  const clientGroups = useMemo(() => {
    if (!reservations) return [];

    const groups: Record<string, {
      key: string;
      name: string;
      phone: string;
      email: string;
      avatar_url: string;
      reservations: typeof reservations;
    }> = {};

    for (const r of reservations) {
      const phoneClean = r.guest_phone?.replace(/\D/g, "");
      const key = (phoneClean && phoneClean.length >= 8)
        ? `p:${phoneClean}`
        : r.guest_name?.toLowerCase().trim()
          ? `n:${r.guest_name.toLowerCase().trim()}`
          : r.guest_email
            ? `e:${r.guest_email.toLowerCase().trim()}`
            : `id:${r.id}`;

      if (!groups[key]) {
        // Try to find matching profile for avatar
        const matchedProfile = profiles?.find(p => {
          const pPhone = p.phone?.replace(/\D/g, "");
          if (phoneClean && pPhone && phoneClean === pPhone) return true;
          if (r.guest_name && p.full_name && r.guest_name.toLowerCase().trim() === p.full_name.toLowerCase().trim()) return true;
          if (r.guest_email && (p.email === r.guest_email || p.contact_email === r.guest_email)) return true;
          return false;
        });

        groups[key] = {
          key,
          name: r.guest_name || "",
          phone: r.guest_phone || "",
          email: r.guest_email || "",
          avatar_url: matchedProfile?.avatar_url || "",
          reservations: [],
        };
      }
      // Enrich name/phone if missing
      const g = groups[key];
      if (!g.name && r.guest_name) g.name = r.guest_name;
      if (!g.phone && r.guest_phone) g.phone = r.guest_phone;
      if (!g.email && r.guest_email) g.email = r.guest_email;
      g.reservations.push(r);
    }

    return Object.values(groups);
  }, [reservations, profiles]);

  const filtered = useMemo(() => {
    if (!search.trim()) return clientGroups;
    const q = search.toLowerCase();
    return clientGroups.filter((c) => {
      if (c.name?.toLowerCase().includes(q)) return true;
      if (c.email?.toLowerCase().includes(q)) return true;
      if (c.phone?.includes(q)) return true;
      // Also search in reservation data
      return c.reservations.some(r =>
        r.responsible_cpf?.includes(q) ||
        r.responsible_rg?.includes(q) ||
        r.guest_name?.toLowerCase().includes(q)
      );
    });
  }, [clientGroups, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Clientes & Reservas
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {clientGroups.length} clientes · {reservations?.length ?? 0} reservas no total
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, e-mail, telefone, CPF ou RG..."
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Nenhum cliente encontrado.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((client) => {
            const isExpanded = expandedId === client.key;

            return (
              <div key={client.key} className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Summary */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : client.key)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                >
                  {client.avatar_url ? (
                    <img src={client.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{client.name || "Sem nome"}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {client.email || "Sem e-mail"}
                      {client.phone && ` · ${client.phone}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      {client.reservations.length} reserva{client.reservations.length > 1 ? "s" : ""}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>

                {/* Expanded */}
                {isExpanded && (
                  <div className="border-t border-border px-4 py-4 space-y-4 bg-muted/20">
                    {client.reservations.map((r) => {
                      const rGuests = guestsByReservation[r.id] || [];
                      return (
                        <div key={r.id} className="rounded-lg border border-border bg-card p-4 space-y-3">
                          {/* Reservation header */}
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

                          {/* Responsible data */}
                          <div>
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Dados do Responsável</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              <InfoItem icon={User} label="Nome" value={r.guest_name} />
                              <InfoItem icon={Phone} label="Telefone" value={r.guest_phone} />
                              <InfoItem icon={Mail} label="E-mail" value={r.guest_email} />
                              <InfoItem icon={CreditCard} label="CPF" value={r.responsible_cpf} />
                              <InfoItem icon={CreditCard} label="RG" value={r.responsible_rg} />
                              <InfoItem icon={User} label="Estado Civil" value={r.responsible_civil_status} />
                            </div>
                          </div>

                          {/* Address */}
                          {(r.responsible_street || r.responsible_city || r.responsible_cep) && (
                            <div>
                              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Endereço</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                                    <span className="text-muted-foreground">{g.guest_type === "adult" ? "Adulto" : g.guest_type === "child" ? "Criança" : g.guest_type}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* No extra data */}
                          {!r.responsible_cpf && !r.responsible_rg && !r.responsible_street && rGuests.length === 0 && (
                            <p className="text-xs text-muted-foreground italic">Formulário de hóspedes não preenchido.</p>
                          )}
                        </div>
                      );
                    })}
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
