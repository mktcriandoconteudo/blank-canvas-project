import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const BookingCard = () => {
  const [checkIn, setCheckIn] = useState<Date | undefined>(new Date(2026, 4, 29));
  const [checkOut, setCheckOut] = useState<Date | undefined>(new Date(2026, 4, 31));
  const [guests, setGuests] = useState(1);
  const [guestsOpen, setGuestsOpen] = useState(false);

  const formatDate = (date: Date | undefined) =>
    date ? format(date, "dd/MM/yyyy") : "Selecionar";

  return (
    <div className="sticky top-6 bg-card border border-border rounded-2xl p-6 shadow-lg">
      <div className="mb-4">
        <span
          className="text-xl font-extrabold text-foreground"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          R$ 1.250
        </span>
        <span className="text-sm text-muted-foreground ml-1">por 2 noites</span>
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
                  if (date && checkOut && date >= checkOut) {
                    const nextDay = new Date(date);
                    nextDay.setDate(nextDay.getDate() + 1);
                    setCheckOut(nextDay);
                  }
                }}
                disabled={(date) => date < new Date()}
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
                disabled={(date) => date <= (checkIn || new Date())}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Guests - inline counter */}
        <div className="w-full border-t border-border p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-foreground uppercase tracking-wide">Hóspedes</p>
            <p className="text-sm text-foreground mt-0.5">
              {guests} {guests === 1 ? "hóspede" : "hóspedes"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setGuests(Math.max(1, guests - 1))}
              disabled={guests <= 1}
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-sm font-semibold text-foreground w-4 text-center">{guests}</span>
            <button
              onClick={() => setGuests(Math.min(10, guests + 1))}
              disabled={guests >= 10}
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground mb-4">
        Cancelamento gratuito antes de 28 de maio
      </p>
      <button
        className="w-full bg-[hsl(340,80%,55%)] text-white font-bold text-base py-3.5 shadow-lg hover:opacity-90 transition-opacity"
        style={{ borderRadius: 30 }}
      >
        Reservar
      </button>
      <p className="text-center text-xs text-muted-foreground mt-3">
        Você ainda não será cobrado
      </p>
    </div>
  );
};

export default BookingCard;
