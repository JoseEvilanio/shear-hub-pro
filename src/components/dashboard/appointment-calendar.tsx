
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export function AppointmentCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Simulated appointments
  const appointments = [
    {
      id: 1,
      client: "João Silva",
      service: "Corte de Cabelo",
      barber: "Carlos",
      time: "10:00",
      status: "confirmed"
    },
    {
      id: 2,
      client: "Pedro Alves",
      service: "Barba",
      barber: "Eduardo",
      time: "11:30",
      status: "confirmed"
    },
    {
      id: 3,
      client: "Marcos Oliveira",
      service: "Combo (Corte + Barba)",
      barber: "Carlos",
      time: "14:00",
      status: "pending"
    },
    {
      id: 4,
      client: "Lucas Mendes",
      service: "Corte Degradê",
      barber: "André",
      time: "16:30",
      status: "confirmed"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Calendário</CardTitle>
          <CardDescription>
            Selecione uma data para ver os agendamentos
          </CardDescription>
        </CardHeader>
        <CardContent className="py-2 pointer-events-auto">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Agendamentos do dia</CardTitle>
          <CardDescription>
            {date ? date.toLocaleDateString('pt-BR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }) : 'Selecione uma data'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div 
                key={appointment.id}
                className="p-4 border rounded-lg flex justify-between items-center hover:bg-accent/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="font-medium">{appointment.client}</div>
                  <div className="text-sm text-muted-foreground">{appointment.service}</div>
                  <div className="text-xs text-muted-foreground">Barbeiro: {appointment.barber}</div>
                </div>
                <div className="text-right space-y-1">
                  <div className="font-medium">{appointment.time}</div>
                  <Badge variant={appointment.status === "confirmed" ? "default" : "outline"}>
                    {appointment.status === "confirmed" ? "Confirmado" : "Pendente"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
