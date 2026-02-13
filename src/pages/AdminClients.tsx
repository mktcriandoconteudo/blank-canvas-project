import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search, Mail, Phone, User, Calendar, ChevronDown, ChevronUp, MapPin, CreditCard, Users, Home } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ClientData {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  contact_email: string;
  avatar_url: string;
  created_at: string;
  cpf: string;
  rg: string;
  civil_status: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  cep: string;
  reservationIds: string[];
}

const AdminClients = () => {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: profiles, isLoading: loadingProfiles } = useQuery({
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
      const { data, error } = await supabase
        .from("reservation_guests")
        .select("*");
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

  // Build unique clients from RESERVATIONS first (since they have the most data),
  // then enrich with profile data
  const allClients = useMemo(() => {
    const clientMap: Record<string, ClientData> = {};

    const normalizeKey = (name?: string | null, phone?: string | null, email?: string | null) => {
      // Use phone as primary key, then email, then name
      const p = phone?.replace(/\D/g, "").trim();
      if (p && p.length >= 8) return `phone:${p}`;
      const e = email?.toLowerCase().trim();
      if (e && !e.includes("@reservas.app")) return `email:${e}`;
      const n = name?.toLowerCase().trim();
      if (n) return `name:${n}`;
      return null;
    };

    // Process reservations first (they have CPF, RG, address etc)
    if (reservations) {
      for (const r of reservations) {
        const key = normalizeKey(r.guest_name, r.guest_phone, r.guest_email);
        if (!key) {
          // No way to identify, create standalone entry
          const standaloneKey = `res:${r.id}`;
          clientMap[standaloneKey] = {
            id: r.id,
            full_name: r.guest_name || "",
            phone: r.guest_phone || "",
            email: r.guest_email || "",
            contact_email: r.guest_email || "",
            avatar_url: "",
            created_at: r.created_at || "",
            cpf: r.responsible_cpf || "",
            rg: r.responsible_rg || "",
            civil_status: r.responsible_civil_status || "",
            street: r.responsible_street || "",
            number: r.responsible_number || "",
            neighborhood: r.responsible_neighborhood || "",
            city: r.responsible_city || "",
            cep: r.responsible_cep || "",
            reservationIds: [r.id],
          };
          continue;
        }

        if (clientMap[key]) {
          const c = clientMap[key];
          c.reservationIds.push(r.id);
          // Fill missing fields
          if (!c.full_name && r.guest_name) c.full_name = r.guest_name;
          if (!c.phone && r.guest_phone) c.phone = r.guest_phone;
          if (!c.cpf && r.responsible_cpf) c.cpf = r.responsible_cpf;
          if (!c.rg && r.responsible_rg) c.rg = r.responsible_rg;
          if (!c.civil_status && r.responsible_civil_status) c.civil_status = r.responsible_civil_status;
          if (!c.street && r.responsible_street) c.street = r.responsible_street;
          if (!c.number && r.responsible_number) c.number = r.responsible_number;
          if (!c.neighborhood && r.responsible_neighborhood) c.neighborhood = r.responsible_neighborhood;
          if (!c.city && r.responsible_city) c.city = r.responsible_city;
          if (!c.cep && r.responsible_cep) c.cep = r.responsible_cep;
        } else {
          clientMap[key] = {
            id: r.id,
            full_name: r.guest_name || "",
            phone: r.guest_phone || "",
            email: r.guest_email || "",
            contact_email: r.guest_email || "",
            avatar_url: "",
            created_at: r.created_at || "",
            cpf: r.responsible_cpf || "",
            rg: r.responsible_rg || "",
            civil_status: r.responsible_civil_status || "",
            street: r.responsible_street || "",
            number: r.responsible_number || "",
            neighborhood: r.responsible_neighborhood || "",
            city: r.responsible_city || "",
            cep: r.responsible_cep || "",
            reservationIds: [r.id],
          };
        }
      }
    }

    // Enrich with profile data
    if (profiles) {
      for (const p of profiles) {
        const key = normalizeKey(p.full_name, p.phone, p.contact_email || p.email);
        if (!key) continue;

        if (clientMap[key]) {
          const c = clientMap[key];
          // Profile data enrichment
          if (!c.full_name && p.full_name) c.full_name = p.full_name;
          if (!c.phone && p.phone) c.phone = p.phone;
          if (p.avatar_url) c.avatar_url = p.avatar_url;
          if (p.contact_email) c.contact_email = p.contact_email;
          if (p.created_at && (!c.created_at || new Date(p.created_at) < new Date(c.created_at))) {
            c.created_at = p.created_at;
          }
          c.id = p.id; // prefer profile id
        } else {
          // Profile-only client (no reservations)
          clientMap[key] = {
            id: p.id,
            full_name: p.full_name || "",
            phone: p.phone || "",
            email: p.email || "",
            contact_email: p.contact_email || "",
            avatar_url: p.avatar_url || "",
            created_at: p.created_at || "",
            cpf: "",
            rg: "",
            civil_status: "",
            street: "",
            number: "",
            neighborhood: "",
            city: "",
            cep: "",
            reservationIds: [],
          };
        }
      }
    }

    return Object.values(clientMap).sort((a, b) => {
      if (!a.created_at) return 1;
      if (!b.created_at) return -1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [profiles, reservations]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allClients;
    const q = search.toLowerCase();
    return allClients.filter(
      (c) =>
        c.full_name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.contact_email?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.cpf?.includes(q) ||
        c.rg?.includes(q)
    );
  }, [allClients, search]);

  const getClientReservations = (client: ClientData) => {
    if (!reservations) return [];
    return reservations.filter((r) => client.reservationIds.includes(r.id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Clientes Cadastrados
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {allClients.length} clientes no total
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

      {loadingProfiles ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Nenhum cliente encontrado.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((client) => {
            const isExpanded = expandedId === client.id;
            const clientReservations = getClientReservations(client);

            return (
              <div key={client.id} className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Summary row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : client.id)}
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
                    <p className="font-semibold text-foreground truncate">{client.full_name || "Sem nome"}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {client.contact_email || client.email || "Sem e-mail"}
                      {client.phone && ` · ${client.phone}`}
                      {client.cpf && ` · CPF: ${client.cpf}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {clientReservations.length > 0 && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                        {clientReservations.length} reserva{clientReservations.length > 1 ? "s" : ""}
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-border px-4 py-4 space-y-5 bg-muted/20">
                    {/* Personal info */}
                    <div>
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Dados Pessoais</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <InfoItem icon={User} label="Nome" value={client.full_name} />
                        <InfoItem icon={Phone} label="Telefone" value={client.phone} />
                        <InfoItem icon={Mail} label="E-mail" value={client.contact_email || client.email} />
                        <InfoItem icon={CreditCard} label="CPF" value={client.cpf} />
                        <InfoItem icon={CreditCard} label="RG" value={client.rg} />
                        <InfoItem icon={User} label="Estado Civil" value={client.civil_status} />
                        <InfoItem icon={Calendar} label="Cadastro" value={client.created_at ? format(new Date(client.created_at), "dd/MM/yyyy HH:mm") : ""} />
                      </div>
                    </div>

                    {/* Address */}
                    {(client.street || client.city || client.cep) && (
                      <div>
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Endereço</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <InfoItem icon={Home} label="Rua" value={client.street} />
                          <InfoItem icon={Home} label="Número" value={client.number} />
                          <InfoItem icon={MapPin} label="Bairro" value={client.neighborhood} />
                          <InfoItem icon={MapPin} label="Cidade" value={client.city} />
                          <InfoItem icon={MapPin} label="CEP" value={client.cep} />
                        </div>
                      </div>
                    )}

                    {/* Reservations */}
                    {clientReservations.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                          Reservas ({clientReservations.length})
                        </h3>
                        <div className="space-y-2">
                          {clientReservations.map((r) => {
                            const rGuests = guestsByReservation[r.id] || [];
                            return (
                              <div key={r.id} className="rounded-lg border border-border bg-card p-3 space-y-2">
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                                  <span className="font-medium text-foreground">{resortMap[r.resort_id] || "Resort"}</span>
                                  <span className="text-muted-foreground">
                                    {format(new Date(r.check_in), "dd/MM/yyyy")} → {format(new Date(r.check_out), "dd/MM/yyyy")}
                                  </span>
                                  <span className={cn(
                                    "text-xs px-2 py-0.5 rounded-full font-medium",
                                    r.payment_status === "approved"
                                      ? "bg-primary/10 text-primary"
                                      : r.payment_status === "pending"
                                        ? "bg-destructive/10 text-destructive"
                                        : "bg-muted text-muted-foreground"
                                  )}>
                                    {r.payment_status === "approved" ? "Pago" : r.payment_status === "pending" ? "Pendente" : r.payment_status}
                                  </span>
                                  <span className="text-muted-foreground text-xs">
                                    R$ {Number(r.total_price).toFixed(2)}
                                  </span>
                                </div>

                                {/* Reservation-specific responsible data */}
                                {(r.responsible_cpf || r.responsible_rg) && (
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                                    {r.responsible_cpf && <span className="text-muted-foreground"><strong>CPF:</strong> {r.responsible_cpf}</span>}
                                    {r.responsible_rg && <span className="text-muted-foreground"><strong>RG:</strong> {r.responsible_rg}</span>}
                                    {r.responsible_civil_status && <span className="text-muted-foreground"><strong>Est. Civil:</strong> {r.responsible_civil_status}</span>}
                                    {r.responsible_street && (
                                      <span className="text-muted-foreground sm:col-span-3">
                                        <strong>End.:</strong> {r.responsible_street}{r.responsible_number ? `, ${r.responsible_number}` : ""}{r.responsible_neighborhood ? ` - ${r.responsible_neighborhood}` : ""}{r.responsible_city ? `, ${r.responsible_city}` : ""}{r.responsible_cep ? ` (${r.responsible_cep})` : ""}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Guests of this reservation */}
                                {rGuests.length > 0 && (
                                  <div className="pl-3 border-l-2 border-primary/20">
                                    <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                                      <Users className="w-3 h-3" /> Hóspedes ({rGuests.length})
                                    </p>
                                    {rGuests.map((g) => (
                                      <p key={g.id} className="text-xs text-foreground">
                                        {g.full_name}
                                        {g.cpf && <span className="text-muted-foreground"> · CPF: {g.cpf}</span>}
                                        {g.age && <span className="text-muted-foreground"> · {g.age} anos</span>}
                                        <span className="text-muted-foreground"> · {g.guest_type === "adult" ? "Adulto" : g.guest_type === "child" ? "Criança" : g.guest_type}</span>
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {clientReservations.length === 0 && !client.cpf && !client.street && (
                      <p className="text-sm text-muted-foreground italic">Nenhuma reserva ou dados adicionais encontrados para este cliente.</p>
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

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => {
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
