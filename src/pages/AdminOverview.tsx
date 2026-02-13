import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CalendarCheck, Users, TrendingUp, Clock, ExternalLink, BarChart3, MapPin } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Reservation {
  id: string;
  total_price: number;
  payment_status: string;
  created_at: string;
  check_in: string;
  check_out: string;
  guests: number;
  guest_name: string | null;
}

const formatCurrency = (v: number) =>
  `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

const AdminOverview = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<7 | 14 | 30>(30);
  const [gaId, setGaId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: resData }, { data: gaData }] = await Promise.all([
        supabase
          .from("reservations")
          .select("id, total_price, payment_status, created_at, check_in, check_out, guests, guest_name")
          .order("created_at", { ascending: false }),
        supabase
          .from("site_settings")
          .select("value")
          .eq("key", "ga_measurement_id")
          .maybeSingle(),
      ]);
      if (resData) setReservations(resData);
      if (gaData?.value) setGaId(gaData.value);
      setLoading(false);
    };
    fetchData();
  }, []);

  const now = new Date();
  const periodStart = startOfDay(subDays(now, period));

  const approved = reservations.filter(r => r.payment_status === "approved");
  const pending = reservations.filter(r => r.payment_status === "pending");

  const totalRevenue = approved.reduce((s, r) => s + Number(r.total_price), 0);
  const periodRevenue = approved
    .filter(r => new Date(r.created_at) >= periodStart)
    .reduce((s, r) => s + Number(r.total_price), 0);

  const totalGuests = approved.reduce((s, r) => s + r.guests, 0);

  // Chart data: revenue per day in selected period
  const chartData = useMemo(() => {
    const days: { date: string; label: string; receita: number; reservas: number }[] = [];
    for (let i = period - 1; i >= 0; i--) {
      const day = startOfDay(subDays(now, i));
      const nextDay = startOfDay(subDays(now, i - 1));
      const dayApproved = approved.filter(r => {
        const d = new Date(r.created_at);
        return d >= day && d < nextDay;
      });
      days.push({
        date: format(day, "yyyy-MM-dd"),
        label: format(day, "dd/MM", { locale: ptBR }),
        receita: dayApproved.reduce((s, r) => s + Number(r.total_price), 0),
        reservas: dayApproved.length,
      });
    }
    return days;
  }, [reservations, period]);

  const kpis = [
    { title: "Faturamento Total", value: formatCurrency(totalRevenue), icon: DollarSign, color: "text-emerald-500" },
    { title: `Faturamento ${period}d`, value: formatCurrency(periodRevenue), icon: TrendingUp, color: "text-primary" },
    { title: "Reservas Aprovadas", value: approved.length.toString(), icon: CalendarCheck, color: "text-blue-500" },
    { title: "Reservas Pendentes", value: pending.length.toString(), icon: Clock, color: "text-amber-500" },
    { title: "Hóspedes Atendidos", value: totalGuests.toString(), icon: Users, color: "text-violet-500" },
  ];

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <TrendingUp className="w-5 h-5 text-primary" />
            Dashboard
          </h1>
          <div className="flex gap-1">
            {([7, 14, 30] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  period === p
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {p}d
              </button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {kpis.map(kpi => (
            <Card key={kpi.title}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                  <span className="text-[11px] text-muted-foreground font-medium">{kpi.title}</span>
                </div>
                <p className="text-xl font-extrabold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {kpi.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Faturamento por Dia</CardTitle>
          </CardHeader>
          <CardContent className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number) => [formatCurrency(v), "Receita"]}
                />
                <Area type="monotone" dataKey="receita" stroke="hsl(var(--primary))" fill="url(#revenueGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Google Analytics Link */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-foreground mb-1">Visitas ao Site & Localização</h3>
                {gaId ? (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      O Google Analytics está ativo (ID: <code className="text-[10px] bg-muted px-1 py-0.5 rounded">{gaId}</code>). Acesse o painel para ver visitas reais, de onde vêm e o mapa do Brasil.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs bg-primary text-primary-foreground font-semibold px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity">
                        <BarChart3 className="w-3.5 h-3.5" /> Ver Dashboard
                      </a>
                      <a href="https://analytics.google.com/analytics/web/#/report/visitors-geo/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs border border-border text-foreground font-semibold px-3 py-1.5 rounded-full hover:bg-muted transition-colors">
                        <MapPin className="w-3.5 h-3.5" /> Mapa de Visitantes
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Configure o Google Analytics para ver visitas reais, localização geográfica e mapa de visitantes.
                    </p>
                    <a href="/admin/seo" className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline">
                      <ExternalLink className="w-3.5 h-3.5" /> Configurar em SEO & Google
                    </a>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Reservations */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Últimas Reservas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-72 overflow-auto">
              {reservations.slice(0, 10).map(r => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.guest_name || "Sem nome"}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {format(new Date(r.check_in), "dd/MM/yyyy")} → {format(new Date(r.check_out), "dd/MM/yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{formatCurrency(Number(r.total_price))}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      r.payment_status === "approved"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : r.payment_status === "pending"
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-muted text-muted-foreground"
                    }`}>
                      {r.payment_status === "approved" ? "Aprovada" : r.payment_status === "pending" ? "Pendente" : r.payment_status}
                    </span>
                  </div>
                </div>
              ))}
              {reservations.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma reserva encontrada</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
