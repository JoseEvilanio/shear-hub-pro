
import { useState } from "react";
import { CalendarIcon, Clock } from "lucide-react";
import { FormField, FormItem, FormMessage, FormControl } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface DateTimeSelectionCardProps {
  form: any;
  availableTimes: string[];
  bookedTimes: string[];
}

export function DateTimeSelectionCard({ 
  form, 
  availableTimes, 
  bookedTimes 
}: DateTimeSelectionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Data e Horário
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Calendário para seleção de data */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full md:w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd 'de' MMMM, yyyy", { locale: pt })
                        ) : (
                          "Selecione uma data"
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                        date > new Date(new Date().setMonth(new Date().getMonth() + 1))
                      }
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Horários disponíveis */}
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem className="flex-1">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableTimes.map((time) => {
                    const isBooked = bookedTimes.includes(time);
                    return (
                      <Button
                        key={time}
                        type="button"
                        variant="outline"
                        size="sm"
                        className={cn(
                          field.value === time 
                            ? "bg-barber-gold text-white hover:bg-barber-gold/90" 
                            : "",
                          isBooked 
                            ? "opacity-50 cursor-not-allowed" 
                            : ""
                        )}
                        onClick={() => {
                          if (!isBooked) {
                            field.onChange(time);
                          }
                        }}
                        disabled={isBooked}
                      >
                        {time}
                      </Button>
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
