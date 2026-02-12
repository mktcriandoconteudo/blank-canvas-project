import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { format } from "date-fns";
import { CalendarCheck, MapPin, Users, CreditCard, ChevronDown, ChevronUp, Clock, CheckCircle2, XCircle, ArrowLeft, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  payment_status: string;
  created_at: string | null;
}

interface ReservationGuest {
  id: string;
  reservation_id: string;
  guest_type: string;
  full_name: string;
  cpf: string | null;
  age: number | null;
}

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
  pending: { label: "Pendente", icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
  approved: { label: "Confirmada", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  rejected: { label: "Rejeitada", icon: XCircle, color: "text-destructive", bg: "bg-red-50 dark:bg-red-950/30" },
};

const MyReservations = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<(Reservation & { resort_name: string; resort_location: string })[]>([]);
  const [guests, setGuests] = useState<Record<string, ReservationGuest[]>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/explore");
        return;
      }
      setUser(session.user);
      fetchReservations(session.user.email || "");
    });
  }, [navigate]);

  const fetchReservations = async (email: string) => {
    setLoading(true);

    const { data: resData } = await supabase
      .from("reservations")
      .select("*")
      .eq("guest_email", email)
      .order("created_at", { ascending: false });

    if (resData && resData.length > 0) {
      // Fetch resort names
      const resortIds = [...new Set(resData.map(r => r.resort_id))];
      const { data: resorts } = await supabase
        .from("resorts")
        .select("id, name, location")
        .in("id", resortIds);

      const resortMap: Record<string, { name: string; location: string }> = {};
      resorts?.forEach(r => { resortMap[r.id] = { name: r.name, location: r.location }; });

      const enriched = resData.map(r => ({
        ...r,
        resort_name: resortMap[r.resort_id]?.name || "Resort",
        resort_location: resortMap[r.resort_id]?.location || "",
      }));

      setReservations(enriched);

      // Fetch guests
      const resIds = resData.map(r => r.id);
      const { data: guestData } = await supabase
        .from("reservation_guests")
        .select("*")
        .in("reservation_id", resIds);

      if (guestData) {
        const map: Record<string, ReservationGuest[]> = {};
        guestData.forEach(g => {
          if (!map[g.reservation_id]) map[g.reservation_id] = [];
          map[g.reservation_id].push(g);
        });
        setGuests(map);
      }
    }

    setLoading(false);
  };

  const formatCurrency = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => navigate("/explore")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Minhas Reservas
            </h1>
            <p className="text-sm text-muted-foreground">Acompanhe todas as suas reservas</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <CalendarCheck className="w-12 h-12 text-muted-foreground/40 mx-auto" />
            <p className="text-lg font-semibold text-foreground">Nenhuma reserva encontrada</p>
            <p className="text-sm text-muted-foreground">Suas reservas aparecerão aqui após realizar uma.</p>
            <Button onClick={() => navigate("/explore")} className="mt-4 rounded-xl">
              Explorar resorts
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map(res => {
              const isExpanded = expandedId === res.id;
              const status = statusConfig[res.payment_status] || statusConfig.pending;
              const StatusIcon = status.icon;
              const resGuests = guests[res.id] || [];
              const adults = resGuests.filter(g => g.guest_type === "adult");
              const children = resGuests.filter(g => g.guest_type === "child");
              const missingGuests = resGuests.length === 0;

              return (
                <div
                  key={res.id}
                  className={cn(
                    "border rounded-2xl overflow-hidden transition-all",
                    res.payment_status === "approved" && "border-emerald-200 dark:border-emerald-900/50"
                  )}
                >
                  {/* Blinking alert for missing guest data */}
                  {missingGuests && (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/50 animate-pulse">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                        Pendente: Preencha o cadastro de hóspedes para esta reserva
                      </p>
                    </div>
                  )}
                  {/* Header */}
                  <div
                    className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : res.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn("inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full", status.bg, status.color)}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {res.created_at ? format(new Date(res.created_at), "dd/MM/yy") : ""}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-foreground">{res.resort_name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {res.resort_location}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-extrabold text-foreground">{formatCurrency(res.total_price)}</p>
                        <p className="text-[10px] text-muted-foreground">{res.total_nights} noites</p>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 border-t">
                      {/* Period */}
                      <div className="bg-muted/40 rounded-xl p-3 mt-3">
                        <p className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
                          <CalendarCheck className="w-3.5 h-3.5" /> Período
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Check-in:</span>{" "}
                            <span className="font-semibold">{res.check_in ? format(new Date(res.check_in + "T12:00:00"), "dd/MM/yyyy") : "—"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Check-out:</span>{" "}
                            <span className="font-semibold">{res.check_out ? format(new Date(res.check_out + "T12:00:00"), "dd/MM/yyyy") : "—"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Plano:</span>{" "}
                            <span className="font-semibold">{res.plan_name}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Temporada:</span>{" "}
                            <span className="font-semibold">{res.plan_sessions}</span>
                          </div>
                        </div>
                      </div>

                      {/* Payment */}
                      <div className="bg-muted/40 rounded-xl p-3">
                        <p className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
                          <CreditCard className="w-3.5 h-3.5" /> Pagamento
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Diária:</span>{" "}
                            <span className="font-semibold">{formatCurrency(res.price_per_night)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total:</span>{" "}
                            <span className="font-extrabold">{formatCurrency(res.total_price)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Guests */}
                      <div className="bg-muted/40 rounded-xl p-3">
                        <p className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
                          <Users className="w-3.5 h-3.5" /> Hóspedes ({res.guests})
                        </p>
                        {resGuests.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic">Nenhum hóspede cadastrado</p>
                        ) : (
                          <div className="space-y-1.5">
                            {adults.length > 0 && (
                              <div className="space-y-1">
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Adultos</p>
                                {adults.map(g => (
                                  <div key={g.id} className="text-xs flex justify-between bg-background rounded-lg px-2.5 py-1.5 border">
                                    <span className="font-medium">{g.full_name}</span>
                                    <span className="text-muted-foreground">{g.cpf ? `CPF: ${g.cpf}` : ""}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {children.length > 0 && (
                              <div className="space-y-1">
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Crianças</p>
                                {children.map(g => (
                                  <div key={g.id} className="text-xs flex justify-between bg-background rounded-lg px-2.5 py-1.5 border">
                                    <span className="font-medium">{g.full_name}</span>
                                    <span className="text-muted-foreground">{g.age ? `${g.age} anos` : ""}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyReservations;
