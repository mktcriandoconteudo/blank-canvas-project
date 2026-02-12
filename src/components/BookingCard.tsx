import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { ChevronDown } from "lucide-react";
import { format, addDays, eachDayOfInterval, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [guests, setGuests] = useState(1);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan | null>(null);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [hasConflict, setHasConflict] = useState(false);

  // Fetch blocked dates
  useEffect(() => {
    if (!resortId) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("blocked_dates")
        .select("blocked_date")
        .eq("resort_id", resortId);
      if (data) {
        setBlockedDates(data.map(d => new Date(d.blocked_date + "T12:00:00")));
      }
    };
    fetch();
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
      // Suggest check-in as tomorrow if not set
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

  return (
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
  );
});

BookingCard.displayName = "BookingCard";

export default BookingCard;
