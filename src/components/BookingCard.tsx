import mercadoPagoLogo from "@/assets/mercadopago-logo.png";
import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Copy, Check, Upload, Users, QrCode, LogIn, LogOut, Loader2 } from "lucide-react";

import { format, addDays, eachDayOfInterval, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import AuthModal from "@/components/AuthModal";
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

type BookingStep = "idle" | "payment-method" | "pix" | "guest-details";

interface AdultGuest {
  full_name: string;
  cpf: string;
}

interface ChildGuest {
  full_name: string;
  age: string;
}

interface ResponsibleInfo {
  rg: string;
  cpf: string;
  civil_status: string;
  street: string;
  number: string;
  cep: string;
  neighborhood: string;
  city: string;
  state: string;
}

const civilStatusOptions = ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "União Estável"];

const BookingCard = forwardRef<BookingCardRef, BookingCardProps>(({ resortId }, ref) => {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState<Date | undefined>(undefined);
  const [checkOut, setCheckOut] = useState<Date | undefined>(undefined);
  const [guests, setGuests] = useState(1);
  const [guestsChosen, setGuestsChosen] = useState(false);
  const [checkInChosen, setCheckInChosen] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan | null>(null);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [maxGuests, setMaxGuests] = useState(10);
  const [hasConflict, setHasConflict] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);
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
    pix_discount_percent?: number;
    checkin_time?: string;
    checkout_time?: string;
  } | null>(null);

  // Multi-step flow
  const [step, setStep] = useState<BookingStep>("idle");
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [adults, setAdults] = useState<AdultGuest[]>([{ full_name: "", cpf: "" }]);
  const [children, setChildren] = useState<ChildGuest[]>([]);
  const [numChildren, setNumChildren] = useState(0);
  const [responsible, setResponsible] = useState<ResponsibleInfo>({ rg: "", cpf: "", civil_status: "", street: "", number: "", cep: "", neighborhood: "", city: "", state: "" });
  const [fetchingCep, setFetchingCep] = useState(false);

  const formatCep = (value: string) => {
    let v = value.replace(/\D/g, "").slice(0, 8);
    if (v.length > 5) v = `${v.slice(0, 5)}-${v.slice(5)}`;
    return v;
  };

  const fetchAddressByCep = useCallback(async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;
    setFetchingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setResponsible(p => ({
          ...p,
          street: data.logradouro || p.street,
          neighborhood: data.bairro || p.neighborhood,
          city: data.localidade || p.city,
          state: data.uf || p.state,
        }));
      }
    } catch {
      // silently fail
    } finally {
      setFetchingCep(false);
    }
  }, []);

  // Auth listener
  const fillUserData = useCallback(async (session: any) => {
    if (!session?.user) return;
    const { data: profile } = await supabase.from("profiles").select("full_name, phone, contact_email").eq("user_id", session.user.id).maybeSingle();
    if (profile?.full_name) setGuestName(profile.full_name);
    if (profile?.phone) setGuestPhone(profile.phone);
    setGuestEmail(profile?.contact_email || session.user.email || "");

    // Auto-fill responsible data from last reservation
    const { data: lastRes } = await supabase
      .from("reservations")
      .select("responsible_cpf, responsible_rg, responsible_civil_status, responsible_street, responsible_number, responsible_cep, responsible_neighborhood, responsible_city, responsible_state, guest_name, guest_phone")
      .or(`guest_phone.eq.${profile?.phone || ""},guest_name.ilike.${profile?.full_name || ""}`)
      .not("responsible_cpf", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastRes) {
      setResponsible(prev => ({
        rg: lastRes.responsible_rg || prev.rg,
        cpf: lastRes.responsible_cpf || prev.cpf,
        civil_status: lastRes.responsible_civil_status || prev.civil_status,
        street: lastRes.responsible_street || prev.street,
        number: lastRes.responsible_number || prev.number,
        cep: lastRes.responsible_cep || prev.cep,
        neighborhood: lastRes.responsible_neighborhood || prev.neighborhood,
        city: lastRes.responsible_city || prev.city,
        state: lastRes.responsible_state || prev.state,
      }));
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fillUserData(session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fillUserData(session);
    });
    return () => subscription.unsubscribe();
  }, [fillUserData]);

  // Fetch blocked dates, reserved dates & payment config
  useEffect(() => {
    if (!resortId) return;
    const fetchData = async () => {
      const [blockedRes, reservedRes, payRes, resortRes] = await Promise.all([
        supabase.from("blocked_dates").select("blocked_date").eq("resort_id", resortId),
        supabase.from("reservations").select("check_in, check_out").eq("resort_id", resortId).in("payment_status", ["approved", "pending"]),
        supabase.from("resort_payment_config").select("payment_method, pix_key, pix_name, pix_bank, whatsapp, pix_discount_percent, checkin_time, checkout_time").eq("resort_id", resortId).maybeSingle(),
        supabase.from("resorts").select("max_guests").eq("id", resortId).maybeSingle(),
      ]);

      const allBlocked: Date[] = [];
      if (blockedRes.data) {
        allBlocked.push(...blockedRes.data.map(d => new Date(d.blocked_date + "T12:00:00")));
      }
      if (reservedRes.data) {
        for (const r of reservedRes.data) {
          const days = eachDayOfInterval({
            start: new Date(r.check_in + "T12:00:00"),
            end: addDays(new Date(r.check_out + "T12:00:00"), -1),
          });
          allBlocked.push(...days);
        }
      }
      setBlockedDates(allBlocked);
      if (payRes.data) setPaymentConfig(payRes.data);
      if (resortRes.data?.max_guests) setMaxGuests(resortRes.data.max_guests);
    };
    fetchData();
  }, [resortId]);

  // Check for conflicts
  useEffect(() => {
    if (!checkIn || !checkOut || blockedDates.length === 0) { setHasConflict(false); return; }
    const days = eachDayOfInterval({ start: checkIn, end: addDays(checkOut, -1) });
    setHasConflict(days.some(day => blockedDates.some(blocked => isSameDay(day, blocked))));
  }, [checkIn, checkOut, blockedDates]);

  // Auto-set checkout
  useEffect(() => {
    if (selectedPlan && checkIn) setCheckOut(addDays(checkIn, selectedPlan.total_nights));
  }, [checkIn, selectedPlan]);

  // Update children array when numChildren changes
  useEffect(() => {
    setChildren(prev => {
      const newChildren: ChildGuest[] = [];
      for (let i = 0; i < numChildren; i++) {
        newChildren.push(prev[i] || { full_name: "", age: "" });
      }
      return newChildren;
    });
  }, [numChildren]);

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

  const isDateBlocked = (date: Date) => blockedDates.some(blocked => isSameDay(date, blocked));
  const formatDate = (date: Date | undefined) => date ? format(date, "dd/MM/yyyy") : "Selecionar";
  const totalPrice = selectedPlan ? selectedPlan.price_per_night * selectedPlan.total_nights : null;
  const pixDiscountedPrice = totalPrice && paymentConfig?.pix_discount_percent
    ? totalPrice * (1 - paymentConfig.pix_discount_percent / 100)
    : totalPrice;

  const handleReserve = () => {
    if (!user) { setShowAuthModal(true); return; }
    setStep("payment-method");
  };

  const handleAuthSuccess = () => {
    setStep("payment-method");
  };

  // Create reservation and proceed to payment
  const createReservation = async (method: "pix" | "mercadopago") => {
    if (!selectedPlan || !checkIn || !checkOut || !resortId || !totalPrice) return;
    setBooking(true);
    try {
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
          total_price: method === "pix" ? pixDiscountedPrice! : totalPrice,
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone,
          payment_status: "pending",
        })
        .select("id")
        .single();

      if (error) throw error;
      setReservationId(reservation.id);

      if (method === "mercadopago") {
        const { data: mpData, error: mpError } = await supabase.functions.invoke(
          "create-mp-preference",
          { body: { reservation_id: reservation.id } }
        );
        if (mpError) throw mpError;
        if (mpData?.init_point) {
          window.location.href = mpData.init_point;
          return;
        }
      } else {
        setStep("pix");
      }
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setBooking(false);
    }
  };

  const handleCopyPixKey = async () => {
    if (paymentConfig?.pix_key) {
      await navigator.clipboard.writeText(paymentConfig.pix_key);
      setPixCopied(true);
      toast({ title: "Chave Pix copiada!" });
      setTimeout(() => setPixCopied(false), 3000);
    }
  };

  const handleReceiptUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !reservationId || !user) return;
    setUploadingReceipt(true);
    try {
      const file = files[0];
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${reservationId}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("payment-receipts")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("payment-receipts").getPublicUrl(path);

      await supabase.from("reservations").update({ receipt_url: publicUrl }).eq("id", reservationId);

      setReceiptUploaded(true);
      toast({ title: "Comprovante enviado!", description: "Sua reserva será confirmada em breve." });

      // After receipt uploaded, go to guest details
      setTimeout(() => setStep("guest-details"), 1500);
    } catch (err: any) {
      toast({ title: "Erro no upload", description: err.message, variant: "destructive" });
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleSaveGuests = async () => {
    if (!reservationId) return;
    if (!responsible.cpf || !responsible.rg) {
      toast({ title: "Preencha os dados do responsável (RG e CPF)", variant: "destructive" });
      return;
    }
    setBooking(true);
    try {
      // Save responsible info
      await supabase.from("reservations").update({
        responsible_rg: responsible.rg,
        responsible_cpf: responsible.cpf,
        responsible_civil_status: responsible.civil_status,
        responsible_street: responsible.street,
        responsible_number: responsible.number,
        responsible_cep: responsible.cep,
        responsible_neighborhood: responsible.neighborhood,
        responsible_city: responsible.city,
        responsible_state: responsible.state,
      } as any).eq("id", reservationId);

      // Save adults
      const adultRows = adults.filter(a => a.full_name.trim()).map(a => ({
        reservation_id: reservationId,
        guest_type: "adult" as const,
        full_name: a.full_name,
        cpf: a.cpf || null,
        age: null,
      }));

      // Save children
      const childRows = children.filter(c => c.full_name.trim()).map(c => ({
        reservation_id: reservationId,
        guest_type: "child" as const,
        full_name: c.full_name,
        cpf: null,
        age: parseInt(c.age) || null,
      }));

      const allGuests = [...adultRows, ...childRows];
      if (allGuests.length > 0) {
        const { error } = await supabase.from("reservation_guests").insert(allGuests);
        if (error) throw error;
      }

      toast({ title: "Reserva finalizada! 🎉", description: "Seus dados foram salvos com sucesso." });
      setStep("idle");
      setReservationId(null);
      setReceiptUploaded(false);
      setTimeout(() => navigate("/minhas-reservas"), 1200);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setBooking(false);
    }
  };

  const qrCodeUrl = paymentConfig?.pix_key
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentConfig.pix_key)}`
    : null;

  return (
    <>
      <div className="sticky top-6 bg-card border-2 border-primary/40 rounded-2xl p-6 shadow-xl shadow-primary/10 ring-1 ring-primary/10">
        {/* Checklist de etapas */}
        {selectedPlan && (
          <div className="mb-5 space-y-2.5">
            {[
              { label: "Escolha a data de check-in", done: checkInChosen, active: !checkInChosen },
              { label: "Quantidade de hóspedes", done: guestsChosen, active: checkInChosen && !guestsChosen },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all",
                  item.done
                    ? "bg-primary text-primary-foreground"
                    : item.active
                      ? "border-2 border-primary text-primary"
                      : "border-2 border-border text-muted-foreground"
                )}>
                  {item.done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={cn(
                  "text-sm font-medium transition-colors",
                  item.done ? "text-primary" : item.active ? "text-foreground" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Price display */}
        <div className="mb-4">
          {selectedPlan ? (
            <>
              <span className="text-xl font-extrabold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
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
            {/* Check-in - acende quando plano selecionado mas data não escolhida */}
            <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
              <PopoverTrigger asChild>
                <button className={cn(
                  "flex-1 p-3 text-left transition-all cursor-pointer",
                  selectedPlan && !checkInChosen
                    ? "bg-primary/10 hover:bg-primary/15"
                    : "hover:bg-muted/50"
                )}>
                  <p className={cn("text-[10px] font-bold uppercase tracking-wide", selectedPlan && !checkInChosen ? "text-primary" : "text-foreground")}>Check-in</p>
                  <p className={cn("text-sm mt-0.5", selectedPlan && !checkInChosen ? "text-primary font-bold" : "text-foreground")}>{formatDate(checkIn)}</p>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card z-50" align="start">
                <Calendar
                  mode="single"
                  selected={checkIn}
                  onSelect={(date) => {
                    if (!date) return;
                    if (selectedPlan) {
                      const periodDates = eachDayOfInterval({ start: date, end: addDays(date, selectedPlan.total_nights - 1) });
                      const hasBlockedInPeriod = periodDates.some(d => blockedDates.some(b => isSameDay(d, b)));
                      if (hasBlockedInPeriod) {
                        toast({ title: "Período indisponível", description: "Algumas datas estão bloqueadas. Escolha outra data.", variant: "destructive" });
                        return;
                      }
                      setCheckIn(date);
                      setCheckOut(addDays(date, selectedPlan.total_nights));
                      setCheckInChosen(true);
                      setCheckInOpen(false);
                    } else {
                      setCheckIn(date);
                      setCheckInChosen(true);
                      setCheckInOpen(false);
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

          {/* Guests - acende quando checkIn escolhido mas hóspedes ainda não */}
          <div className={cn(
            "border-t transition-all",
            checkInChosen && !guestsChosen && selectedPlan
              ? "border-primary bg-primary/10"
              : "border-border"
          )}>
            <button
              onClick={() => setGuestsOpen(!guestsOpen)}
              className={cn(
                "w-full p-3 flex items-center justify-between transition-colors cursor-pointer",
                checkInChosen && !guestsChosen && selectedPlan ? "hover:bg-primary/15" : "hover:bg-muted/50"
              )}
            >
              <div>
                <p className={cn("text-[10px] font-bold uppercase tracking-wide", checkInChosen && !guestsChosen && selectedPlan ? "text-primary" : "text-foreground")}>Hóspedes</p>
                <p className={cn("text-sm mt-0.5", checkInChosen && !guestsChosen && selectedPlan ? "text-primary font-bold" : "text-foreground")}>
                  {guests} {guests === 1 ? "hóspede" : "hóspedes"}
                </p>
              </div>
              <ChevronDown className={cn("w-4 h-4 transition-transform", checkInChosen && !guestsChosen && selectedPlan ? "text-primary" : "text-muted-foreground", guestsOpen && "rotate-180")} />
            </button>
            {guestsOpen && (
              <div className="border-t border-border max-h-40 overflow-y-auto bg-card">
                {Array.from({ length: maxGuests }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => { setGuests(num); setGuestsChosen(true); setGuestsOpen(false); }}
                    className={cn(
                      "w-full text-left px-4 py-2.5 text-sm transition-colors",
                      guests === num ? "bg-primary text-primary-foreground font-bold" : "text-foreground hover:bg-muted/50"
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
          <p className="text-xs text-destructive font-medium mb-3 text-center">⚠️ Algumas datas selecionadas estão indisponíveis</p>
        )}

        {/* Total */}
        {totalPrice && !hasConflict && checkIn && checkOut && (
          <div className="mb-3 px-1 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {selectedPlan!.total_nights} noites × R$ {selectedPlan!.price_per_night.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-base font-bold text-foreground">
                R$ {totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              💳 Parcele em até <span className="font-semibold text-foreground">10x no cartão</span> <span className="text-[10px]">(juros do Mercado Pago)</span>
            </p>
            {paymentConfig?.pix_discount_percent && paymentConfig.pix_discount_percent > 0 ? (
              <p className="text-xs text-center font-semibold" style={{ color: "hsl(142, 70%, 40%)" }}>
                🏷️ ou {paymentConfig.pix_discount_percent}% de desconto no Pix à vista — R$ {pixDiscountedPrice?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            ) : null}
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground mb-3">
          {checkIn ? `Cancelamento gratuito antes de ${format(addDays(checkIn, -3), "dd 'de' MMMM", { locale: ptBR })}` : "Selecione as datas"}
        </p>

        {/* Check-in / Check-out time cards */}
        <div className="flex gap-2 mb-4 justify-center">
          <span className="flex items-center gap-1.5 bg-secondary text-secondary-foreground text-xs font-semibold px-4 py-2.5 rounded-2xl border border-border">
            <LogIn className="w-4 h-4 text-muted-foreground" />
            Check-in {paymentConfig?.checkin_time || "14:00"}
          </span>
          <span className="flex items-center gap-1.5 bg-secondary text-secondary-foreground text-xs font-semibold px-4 py-2.5 rounded-2xl border border-border">
            <LogOut className="w-4 h-4 text-muted-foreground" />
            Check-out {paymentConfig?.checkout_time || "10:00"}
          </span>
        </div>
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
        <p className="text-center text-xs text-muted-foreground mt-3">Você ainda não será cobrado</p>

        {/* Secure payment badges */}
        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span className="text-[10px] text-muted-foreground font-medium">Pagamento 100% seguro</span>
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <svg className="h-5 w-auto" viewBox="0 0 48 16" fill="none"><rect width="48" height="16" rx="2" fill="#1A1F71"/><text x="24" y="11.5" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial">VISA</text></svg>
            <svg className="h-5 w-auto" viewBox="0 0 48 16" fill="none"><rect width="48" height="16" rx="2" fill="#252525"/><circle cx="20" cy="8" r="5" fill="#EB001B"/><circle cx="28" cy="8" r="5" fill="#F79E1B"/></svg>
            <svg className="h-5 w-auto" viewBox="0 0 36 16" fill="none"><rect width="36" height="16" rx="2" fill="#000"/><text x="18" y="11" textAnchor="middle" fill="#FFCB05" fontSize="7" fontWeight="bold" fontFamily="Arial">elo</text></svg>
            <svg className="h-5 w-auto" viewBox="0 0 36 16" fill="none"><rect width="36" height="16" rx="2" fill="#006FCF"/><text x="18" y="11" textAnchor="middle" fill="white" fontSize="5.5" fontWeight="bold" fontFamily="Arial">AMEX</text></svg>
            <svg className="h-5 w-auto" viewBox="0 0 48 16" fill="none"><rect width="48" height="16" rx="2" fill="#822124"/><text x="24" y="11" textAnchor="middle" fill="white" fontSize="5.5" fontWeight="bold" fontFamily="Arial">Hipercard</text></svg>
            <svg className="h-5 w-auto" viewBox="0 0 36 16" fill="none"><rect width="36" height="16" rx="2" fill="#32BCAD"/><text x="18" y="11" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="Arial">PIX</text></svg>
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <img src={mercadoPagoLogo} alt="Mercado Pago" className="h-4 w-auto" />
            <span className="text-[9px] text-muted-foreground">Seus dados estão protegidos</span>
          </div>
        </div>
      </div>

      {/* ===== STEP 1: Payment Method Selection ===== */}
      <Dialog open={step === "payment-method"} onOpenChange={(open) => { if (!open) setStep("idle"); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-lg">Escolha a forma de pagamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Booking summary */}
            {totalPrice && (
              <div className="bg-muted/50 rounded-2xl p-4 space-y-1">
                <p className="text-sm font-semibold text-foreground">{selectedPlan?.name} · {selectedPlan?.total_nights} noites</p>
                <p className="text-xs text-muted-foreground">
                  {checkIn && format(checkIn, "dd/MM/yyyy")} → {checkOut && format(checkOut, "dd/MM/yyyy")} · {guests} {guests === 1 ? "hóspede" : "hóspedes"}
                </p>
                <p className="text-base font-bold text-foreground mt-1">
                  Total: R$ {totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}

            {/* PIX button */}
            <button
              onClick={() => createReservation("pix")}
              disabled={booking}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-border hover:border-primary/50 transition-all bg-card group"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#32BCAD" }}>
                <span className="text-white font-bold text-sm">PIX</span>
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-foreground text-sm">Pagar com Pix</p>
                <p className="text-xs text-muted-foreground">Transferência instantânea</p>
                {paymentConfig?.pix_discount_percent && paymentConfig.pix_discount_percent > 0 && pixDiscountedPrice ? (
                  <p className="text-xs font-bold mt-0.5" style={{ color: "hsl(142, 70%, 40%)" }}>
                    {paymentConfig.pix_discount_percent}% OFF → R$ {pixDiscountedPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                ) : null}
              </div>
            </button>

            {/* Mercado Pago button */}
            <button
              onClick={() => createReservation("mercadopago")}
              disabled={booking}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-border hover:border-primary/50 transition-all bg-card group"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-[#009EE3] overflow-hidden p-1.5">
                <img src={mercadoPagoLogo} alt="Mercado Pago" className="w-full h-full object-contain" />
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-foreground text-sm">Pagar com Mercado Pago</p>
                <p className="text-xs text-muted-foreground">Cartão de crédito, débito ou boleto</p>
                <p className="text-xs text-muted-foreground mt-0.5">💳 Até 10x no cartão</p>
              </div>
            </button>

            {booking && (
              <p className="text-center text-sm text-muted-foreground animate-pulse">Processando...</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== STEP 2: PIX Payment ===== */}
      <Dialog open={step === "pix"} onOpenChange={(open) => { if (!open) setStep("idle"); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5" /> Pagamento via Pix
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* QR Code */}
            {qrCodeUrl && (
              <div className="flex justify-center">
                <div className="bg-white p-3 rounded-2xl shadow-md">
                  <img src={qrCodeUrl} alt="QR Code Pix" className="w-48 h-48" />
                </div>
              </div>
            )}

            {/* PIX info */}
            <div className="bg-muted/50 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Chave Pix</p>
                  <p className="text-sm font-mono font-semibold text-foreground break-all">{paymentConfig?.pix_key}</p>
                </div>
                <button
                  onClick={handleCopyPixKey}
                  className="shrink-0 p-2 rounded-xl hover:bg-muted transition-colors"
                >
                  {pixCopied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>
              <div className="border-t border-border pt-2 space-y-1">
                <p className="text-xs"><span className="font-semibold text-foreground">Titular:</span> <span className="text-muted-foreground">{paymentConfig?.pix_name}</span></p>
                <p className="text-xs"><span className="font-semibold text-foreground">Banco:</span> <span className="text-muted-foreground">{paymentConfig?.pix_bank}</span></p>
              </div>
              <div className="border-t border-border pt-2">
                <p className="text-xs text-muted-foreground">Valor a pagar:</p>
                <p className="text-lg font-extrabold text-foreground">
                  R$ {pixDiscountedPrice?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                {paymentConfig?.pix_discount_percent && paymentConfig.pix_discount_percent > 0 && (
                  <p className="text-xs font-semibold" style={{ color: "hsl(142, 70%, 40%)" }}>
                    🏷️ {paymentConfig.pix_discount_percent}% de desconto aplicado!
                  </p>
                )}
              </div>
            </div>

            {/* Upload receipt */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground text-center">Após o pagamento, envie o comprovante:</p>
              <label className={cn(
                "flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all",
                receiptUploaded
                  ? "border-primary/50 bg-primary/5"
                  : "border-border hover:border-primary/30 hover:bg-muted/30"
              )}>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={e => handleReceiptUpload(e.target.files)}
                  disabled={uploadingReceipt || receiptUploaded}
                />
                {receiptUploaded ? (
                  <>
                    <Check className="w-8 h-8 text-primary" />
                    <span className="text-sm font-semibold text-primary">Comprovante enviado!</span>
                  </>
                ) : uploadingReceipt ? (
                  <>
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-muted-foreground">Enviando...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">Clique para enviar o comprovante</span>
                    <span className="text-[10px] text-muted-foreground">Imagem ou PDF</span>
                  </>
                )}
              </label>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== STEP 3: Guest Registration ===== */}
      <Dialog open={step === "guest-details"} onOpenChange={(open) => { if (!open) setStep("idle"); }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center gap-2">
              <Users className="w-5 h-5" /> Dados dos Hóspedes
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            {/* Responsável pela reserva */}
            <div className="space-y-3">
              <p className="text-sm font-bold text-foreground flex items-center gap-2">😎 Responsável pela reserva</p>
              <div className="bg-muted/30 rounded-2xl p-4 space-y-3 border border-border">
                <div className="space-y-1">
                  <Label className="text-xs">Nome completo</Label>
                  <Input value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Nome do responsável" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">RG</Label>
                    <Input value={responsible.rg} onChange={e => setResponsible(p => ({ ...p, rg: e.target.value }))} placeholder="00.000.000-0" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">CPF</Label>
                    <Input value={responsible.cpf} onChange={e => setResponsible(p => ({ ...p, cpf: e.target.value }))} placeholder="000.000.000-00" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Estado civil</Label>
                    <select
                      value={responsible.civil_status}
                      onChange={e => setResponsible(p => ({ ...p, civil_status: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Selecione</option>
                      {civilStatusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Celular</Label>
                    <Input
                      value={guestPhone}
                      onChange={e => {
                        let v = e.target.value.replace(/\D/g, "").slice(0, 11);
                        if (v.length > 6) v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
                        else if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
                        else if (v.length > 0) v = `(${v}`;
                        setGuestPhone(v);
                      }}
                      placeholder="(62) 99999-9999"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">E-mail</Label>
                  <Input value={guestEmail} onChange={e => setGuestEmail(e.target.value)} placeholder="seu@email.com" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">CEP</Label>
                    <div className="relative">
                      <Input
                        value={responsible.cep}
                        onChange={e => {
                          const formatted = formatCep(e.target.value);
                          setResponsible(p => ({ ...p, cep: formatted }));
                          if (formatted.replace(/\D/g, "").length === 8) {
                            fetchAddressByCep(formatted);
                          }
                        }}
                        placeholder="00000-000"
                      />
                      {fetchingCep && (
                        <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Bairro</Label>
                    <Input value={responsible.neighborhood} onChange={e => setResponsible(p => ({ ...p, neighborhood: e.target.value }))} placeholder="Preenchido pelo CEP" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Cidade</Label>
                    <Input value={responsible.city} onChange={e => setResponsible(p => ({ ...p, city: e.target.value }))} placeholder="Preenchido pelo CEP" />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Rua / Av</Label>
                    <Input value={responsible.street} onChange={e => setResponsible(p => ({ ...p, street: e.target.value }))} placeholder="Preenchido pelo CEP" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Nº</Label>
                    <Input value={responsible.number} onChange={e => setResponsible(p => ({ ...p, number: e.target.value }))} placeholder="123" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">UF</Label>
                    <Input value={responsible.state} onChange={e => setResponsible(p => ({ ...p, state: e.target.value }))} placeholder="UF" maxLength={2} />
                  </div>
                </div>
              </div>
            </div>

            {/* Quantas crianças - só aparece se 2+ hóspedes */}
            {guests >= 2 && (
            <div className="bg-muted/30 rounded-2xl p-4 border border-border space-y-2">
              <Label className="text-xs font-semibold">Quantas crianças no grupo?</Label>
              <div className="flex gap-2">
                {Array.from({ length: Math.min(guests, 6) }, (_, i) => i).map(n => (
                  <button
                    key={n}
                    onClick={() => setNumChildren(n)}
                    className={cn(
                      "w-9 h-9 rounded-xl text-sm font-bold transition-colors",
                      numChildren === n ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            )}

            {/* Adultos */}
            <div className="space-y-3">
              <p className="text-sm font-bold text-foreground flex items-center gap-2">🧑 Nome e CPF dos adultos</p>
              {adults.map((adult, i) => (
                <div key={i} className="bg-muted/30 rounded-2xl p-3 border border-border space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Adulto {i + 1}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[11px]">Nome completo</Label>
                      <Input
                        value={adult.full_name}
                        onChange={e => { const v = e.target.value; setAdults(p => { const u = [...p]; u[i] = { ...u[i], full_name: v }; return u; }); }}
                        placeholder="Nome"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">CPF</Label>
                      <Input
                        value={adult.cpf}
                        onChange={e => { const v = e.target.value; setAdults(p => { const u = [...p]; u[i] = { ...u[i], cpf: v }; return u; }); }}
                        placeholder="000.000.000-00"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Crianças */}
            {numChildren > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-bold text-foreground flex items-center gap-2">🧚 Nome e idade das crianças</p>
                {children.map((child, i) => (
                  <div key={i} className="bg-muted/30 rounded-2xl p-3 border border-border space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Criança {i + 1}</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2 space-y-1">
                        <Label className="text-[11px]">Nome completo</Label>
                        <Input
                          value={child.full_name}
                          onChange={e => { const v = e.target.value; setChildren(p => { const u = [...p]; u[i] = { ...u[i], full_name: v }; return u; }); }}
                          placeholder="Nome da criança"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px]">Idade</Label>
                        <Input
                          type="number"
                          value={child.age}
                          onChange={e => { const v = e.target.value; setChildren(p => { const u = [...p]; u[i] = { ...u[i], age: v }; return u; }); }}
                          placeholder="Ex: 5"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleSaveGuests}
              disabled={booking || !responsible.cpf}
              className={cn(
                "w-full font-bold text-base py-3.5 shadow-lg transition-opacity rounded-2xl",
                booking || !responsible.cpf
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-[hsl(340,80%,55%)] text-white hover:opacity-90"
              )}
            >
              {booking ? "Salvando..." : "Finalizar Reserva"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Auth modal */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} onSuccess={handleAuthSuccess} />
    </>
  );
});

BookingCard.displayName = "BookingCard";

export default BookingCard;
