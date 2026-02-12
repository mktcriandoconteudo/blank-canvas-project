import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { ChevronDown } from "lucide-react";

import { format, addDays, eachDayOfInterval, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SelectedPlan {
  name: string;
  sessions: string;
  price_per_night: number;
  total_nights: number;
}

interface BookingCardProps {
  resortId?: string | null;
}

export interface BookingCardRef {
  selectPlan: (plan: SelectedPlan) => void;
}

const BookingCard = forwardRef<BookingCardRef, BookingCardProps>(({ resortId }, ref) => {
  const [checkIn, setCheckIn] = useState<Date | undefined>(addDays(new Date(), 7));
  const [checkOut, setCheckOut] = useState<Date | undefined>(addDays(new Date(), 9));
  const [guests, setGuests] = useState(1);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan | null>(null);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [hasConflict, setHasConflict] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [booking, setBooking] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [paymentConfig, setPaymentConfig] = useState<{
    payment_method: string;
    pix_key?: string;
    pix_name?: string;
    pix_bank?: string;
    whatsapp?: string;
  } | null>(null);
  const [showPixInfo, setShowPixInfo] = useState(false);
  const [pixReservationId, setPixReservationId] = useState<string | null>(null);

  // Fetch blocked dates & payment config
  useEffect(() => {
    if (!resortId) return;
    const fetchData = async () => {
      const [blockedRes, payRes] = await Promise.all([
        supabase.from("blocked_dates").select("blocked_date").eq("resort_id", resortId),
        supabase.from("resort_payment_config").select("payment_method, pix_key, pix_name, pix_bank, whatsapp").eq("resort_id", resortId).maybeSingle(),
      ]);
      if (blockedRes.data) {
        setBlockedDates(blockedRes.data.map(d => new Date(d.blocked_date + "T12:00:00")));
      }
      if (payRes.data) {
        setPaymentConfig(payRes.data);
      }
    };
    fetchData();
  }, [resortId]);

  // Check for conflicts when dates change
  useEffect(() => {
    if (!checkIn || !checkOut || blockedDates.length === 0) {
      setHasConflict(false);
      return;
    }
    const days = eachDayOfInterval({ start: checkIn, end: addDays(checkOut, -1) });
    const conflict = days.some(day =>
      blockedDates.some(blocked => isSameDay(day, blocked))
    );
    setHasConflict(conflict);
  }, [checkIn, checkOut, blockedDates]);

  // Auto-set checkout based on plan nights
  useEffect(() => {
    if (selectedPlan && checkIn) {
      setCheckOut(addDays(checkIn, selectedPlan.total_nights));
    }
  }, [checkIn, selectedPlan]);

  useImperativeHandle(ref, () => ({
    selectPlan: (plan: SelectedPlan) => {
      setSelectedPlan(plan);
      if (!checkIn) {
        const tomorrow = addDays(new Date(), 1);
        setCheckIn(tomorrow);
        setCheckOut(addDays(tomorrow, plan.total_nights));
      } else {
        setCheckOut(addDays(checkIn, plan.total_nights));
      }
    },
  }));

  const isDateBlocked = (date: Date) =>
    blockedDates.some(blocked => isSameDay(date, blocked));

  const formatDate = (date: Date | undefined) =>
    date ? format(date, "dd/MM/yyyy") : "Selecionar";

  const totalPrice = selectedPlan
    ? selectedPlan.price_per_night * selectedPlan.total_nights
    : null;

  const handleReserve = () => {
    setShowGuestForm(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedPlan || !checkIn || !checkOut || !resortId || !totalPrice) return;
    setBooking(true);

    try {
      // Create reservation
      const { data: reservation, error } = await supabase
        .from("reservations")
        .insert({
          resort_id: resortId,
          check_in: format(checkIn, "yyyy-MM-dd"),
          check_out: format(checkOut, "yyyy-MM-dd"),
          guests,
          plan_name: selectedPlan.name,
          plan_sessions: selectedPlan.sessions,
          price_per_night: selectedPlan.price_per_night,
          total_nights: selectedPlan.total_nights,
          total_price: totalPrice,
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone,
          payment_status: "pending",
        })
        .select("id")
        .single();

      if (error) throw error;

      const method = paymentConfig?.payment_method || "manual";

      if (method === "mercadopago") {
        // Call edge function to create MP preference
        const { data: mpData, error: mpError } = await supabase.functions.invoke(
          "create-mp-preference",
          { body: { reservation_id: reservation.id } }
        );

        if (mpError) throw mpError;

        // Redirect to Mercado Pago checkout
        if (mpData?.init_point) {
          window.location.href = mpData.init_point;
          return;
        }
      } else if (method === "pix") {
        setPixReservationId(reservation.id);
        setShowGuestForm(false);
        setShowPixInfo(true);
        setBooking(false);
        return;
      } else {
        // Manual - redirect to WhatsApp
        const whatsapp = paymentConfig?.whatsapp || "";
        if (whatsapp) {
          const msg = encodeURIComponent(
            `Olá! Gostaria de confirmar minha reserva:\n` +
            `📅 Check-in: ${format(checkIn, "dd/MM/yyyy")}\n` +
            `📅 Checkout: ${format(checkOut, "dd/MM/yyyy")}\n` +
            `👥 Hóspedes: ${guests}\n` +
            `📋 Plano: ${selectedPlan.name}\n` +
            `💰 Total: R$ ${totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n` +
            `Nome: ${guestName}`
          );
          window.open(`https://wa.me/${whatsapp}?text=${msg}`, "_blank");
        }
      }

      toast({ title: "Reserva criada!", description: "Aguardando confirmação de pagamento." });
      setShowGuestForm(false);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setBooking(false);
    }
  };

  return (
    <>
      <div className="sticky top-6 bg-card border border-border rounded-2xl p-6 shadow-lg">
        {/* Price display */}
        <div className="mb-4">
          {selectedPlan ? (
            <>
              <span
                className="text-xl font-extrabold text-foreground"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                R$ {selectedPlan.price_per_night.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-sm text-muted-foreground ml-1">por diária</span>
              <div className="mt-1">
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {selectedPlan.name} · {selectedPlan.sessions}
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Selecione um plano acima para prosseguir</p>
          )}
        </div>


        <div className="border border-border overflow-hidden mb-3" style={{ borderRadius: 30 }}>
          <div className="flex divide-x divide-border">
            {/* Check-in */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex-1 p-3 text-left hover:bg-muted/50 transition-colors cursor-pointer">
                  <p className="text-[10px] font-bold text-foreground uppercase tracking-wide">Check-in</p>
                  <p className="text-sm text-foreground mt-0.5">{formatDate(checkIn)}</p>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card z-50" align="start">
                <Calendar
                  mode="single"
                  selected={checkIn}
                  onSelect={(date) => {
                    setCheckIn(date);
                    if (date && selectedPlan) {
                      setCheckOut(addDays(date, selectedPlan.total_nights));
                    } else if (date && checkOut && date >= checkOut) {
                      setCheckOut(addDays(date, 1));
                    }
                  }}
                  disabled={(date) => date < new Date() || isDateBlocked(date)}
                  modifiers={{ blocked: blockedDates }}
                  modifiersClassNames={{ blocked: "bg-destructive/20 text-destructive line-through" }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>

            {/* Checkout */}
            {selectedPlan ? (
              <div className="flex-1 p-3 text-left opacity-70 cursor-default">
                <p className="text-[10px] font-bold text-foreground uppercase tracking-wide">Checkout</p>
                <p className="text-sm text-foreground mt-0.5">{formatDate(checkOut)}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">🔒 {selectedPlan.total_nights} diárias ({selectedPlan.name})</p>
              </div>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex-1 p-3 text-left hover:bg-muted/50 transition-colors cursor-pointer">
                    <p className="text-[10px] font-bold text-foreground uppercase tracking-wide">Checkout</p>
                    <p className="text-sm text-foreground mt-0.5">{formatDate(checkOut)}</p>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card z-50" align="end">
                  <Calendar
                    mode="single"
                    selected={checkOut}
                    onSelect={setCheckOut}
                    disabled={(date) => date <= (checkIn || new Date()) || isDateBlocked(date)}
                    modifiers={{ blocked: blockedDates }}
                    modifiersClassNames={{ blocked: "bg-destructive/20 text-destructive line-through" }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Guests */}
          <div className="border-t border-border">
            <button
              onClick={() => setGuestsOpen(!guestsOpen)}
              className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div>
                <p className="text-[10px] font-bold text-foreground uppercase tracking-wide">Hóspedes</p>
                <p className="text-sm text-foreground mt-0.5">
                  {guests} {guests === 1 ? "hóspede" : "hóspedes"}
                </p>
              </div>
              <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", guestsOpen && "rotate-180")} />
            </button>
            {guestsOpen && (
              <div className="border-t border-border max-h-40 overflow-y-auto">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => { setGuests(num); setGuestsOpen(false); }}
                    className={cn(
                      "w-full text-left px-4 py-2.5 text-sm transition-colors",
                      guests === num
                        ? "bg-primary text-primary-foreground font-bold"
                        : "text-foreground hover:bg-muted/50"
                    )}
                  >
                    {num} {num === 1 ? "hóspede" : "hóspedes"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Conflict warning */}
        {hasConflict && (
          <p className="text-xs text-destructive font-medium mb-3 text-center">
            ⚠️ Algumas datas selecionadas estão indisponíveis
          </p>
        )}

        {/* Total */}
        {totalPrice && !hasConflict && checkIn && checkOut && (
          <div className="flex justify-between items-center mb-3 px-1">
            <span className="text-sm text-muted-foreground">
              {selectedPlan!.total_nights} noites × R$ {selectedPlan!.price_per_night.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-base font-bold text-foreground">
              R$ {totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground mb-4">
          {checkIn ? `Cancelamento gratuito antes de ${format(addDays(checkIn, -3), "dd 'de' MMMM", { locale: ptBR })}` : "Selecione as datas"}
        </p>
        <button
          onClick={handleReserve}
          className={cn(
            "w-full font-bold text-base py-3.5 shadow-lg transition-opacity",
            hasConflict || !selectedPlan || !checkIn
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-[hsl(340,80%,55%)] text-white hover:opacity-90"
          )}
          style={{ borderRadius: 30 }}
          disabled={hasConflict || !selectedPlan || !checkIn}
        >
          Reservar
        </button>
        <p className="text-center text-xs text-muted-foreground mt-3">
          Você ainda não será cobrado
        </p>
      </div>

      {/* Guest info dialog */}
      <Dialog open={showGuestForm} onOpenChange={setShowGuestForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dados do hóspede</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="guest-name" className="text-xs">Nome completo</Label>
              <Input id="guest-name" value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Seu nome" />
            </div>
            <div>
              <Label htmlFor="guest-email" className="text-xs">E-mail</Label>
              <Input id="guest-email" type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} placeholder="seu@email.com" />
            </div>
            <div>
              <Label htmlFor="guest-phone" className="text-xs">Telefone / WhatsApp</Label>
              <Input id="guest-phone" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} placeholder="5562999999999" />
            </div>
            {totalPrice && (
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <p className="font-semibold text-foreground">Resumo</p>
                <p className="text-muted-foreground">{selectedPlan?.name} · {selectedPlan?.total_nights} noites</p>
                <p className="font-bold text-foreground mt-1">
                  Total: R$ {totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Pagamento via {paymentConfig?.payment_method === "mercadopago" ? "Mercado Pago" : paymentConfig?.payment_method === "pix" ? "Pix" : "WhatsApp"}
                </p>
              </div>
            )}
            <button
              onClick={handleConfirmBooking}
              disabled={booking || !guestName}
              className={cn(
                "w-full font-bold text-base py-3 shadow-lg transition-opacity rounded-xl",
                booking || !guestName
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-[hsl(340,80%,55%)] text-white hover:opacity-90"
              )}
            >
              {booking ? "Processando..." : paymentConfig?.payment_method === "mercadopago" ? "Pagar com Mercado Pago" : "Confirmar reserva"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pix info dialog */}
      <Dialog open={showPixInfo} onOpenChange={setShowPixInfo}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pagamento via Pix</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm"><span className="font-semibold">Chave Pix:</span> {paymentConfig?.pix_key}</p>
              <p className="text-sm"><span className="font-semibold">Titular:</span> {paymentConfig?.pix_name}</p>
              <p className="text-sm"><span className="font-semibold">Banco:</span> {paymentConfig?.pix_bank}</p>
              <p className="text-base font-bold text-foreground mt-2">
                Valor: R$ {totalPrice?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Após realizar o Pix, envie o comprovante via WhatsApp para confirmar sua reserva.
            </p>
            {paymentConfig?.whatsapp && (
              <button
                onClick={() => {
                  const msg = encodeURIComponent(
                    `Olá! Realizei o Pix da reserva.\nValor: R$ ${totalPrice?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\nNome: ${guestName}`
                  );
                  window.open(`https://wa.me/${paymentConfig.whatsapp}?text=${msg}`, "_blank");
                }}
                className="w-full font-bold text-base py-3 shadow-lg rounded-xl bg-[hsl(142,70%,45%)] text-white hover:opacity-90 transition-opacity"
              >
                Enviar comprovante via WhatsApp
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

BookingCard.displayName = "BookingCard";

export default BookingCard;
