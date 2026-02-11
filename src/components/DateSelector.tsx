import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";

interface DateSelectorProps {
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  onCheckInChange: (date: Date | undefined) => void;
  onCheckOutChange: (date: Date | undefined) => void;
}

const DateSelector = ({ checkIn, checkOut, onCheckInChange, onCheckOutChange }: DateSelectorProps) => {
  return (
    <div className="mb-7">
      <h2
        className="text-base font-bold text-foreground mb-1"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        Escolha a data
      </h2>
      <p className="text-xs text-muted-foreground mb-5">
        Selecione um dia disponível no calendário
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Check-in Calendar */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-[10px] font-bold text-foreground uppercase tracking-wider mb-2 text-center">
            Check-in
          </p>
          {checkIn && (
            <p className="text-xs text-primary font-semibold text-center mb-2">
              {format(checkIn, "dd 'de' MMMM, yyyy", { locale: ptBR })}
            </p>
          )}
          <Calendar
            mode="single"
            selected={checkIn}
            onSelect={(date) => {
              onCheckInChange(date);
              if (date && checkOut && date >= checkOut) {
                const nextDay = new Date(date);
                nextDay.setDate(nextDay.getDate() + 1);
                onCheckOutChange(nextDay);
              }
            }}
            disabled={(date) => date < new Date()}
            className={cn("p-0 pointer-events-auto w-full")}
            locale={ptBR}
          />
        </div>

        {/* Checkout Calendar */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-[10px] font-bold text-foreground uppercase tracking-wider mb-2 text-center">
            Checkout
          </p>
          {checkOut && (
            <p className="text-xs text-primary font-semibold text-center mb-2">
              {format(checkOut, "dd 'de' MMMM, yyyy", { locale: ptBR })}
            </p>
          )}
          <Calendar
            mode="single"
            selected={checkOut}
            onSelect={onCheckOutChange}
            disabled={(date) => date <= (checkIn || new Date())}
            className={cn("p-0 pointer-events-auto w-full")}
            locale={ptBR}
          />
        </div>
      </div>
    </div>
  );
};

export default DateSelector;
