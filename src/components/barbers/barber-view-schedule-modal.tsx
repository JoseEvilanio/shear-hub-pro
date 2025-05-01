
import { useState } from "react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BarberViewScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  barber: {
    id: number;
    name: string;
    avatar: string;
    todayAppointments: number;
  } | null;
}

// Mock data for appointments
const mockAppointments = [
  {
    id: 1,
    clientName: "Ricardo Silva",
    service: "Corte Degradê",
    time: "09:00",
    duration: 30,
    status: "confirmed"
  },
  {
    id: 2,
    clientName: "Marcelo Santos",
    service: "Barba",
    time: "10:00",
    duration: 20,
    status: "confirmed"
  },
  {
    id: 3,
    clientName: "Lucas Oliveira",
    service: "Combo Corte + Barba",
    time: "11:00",
    duration: 50,
    status: "completed"
  },
  {
    id: 4,
    clientName: "Fernando Costa",
    service: "Corte Simples",
    time: "13:30",
    duration: 30,
    status: "canceled"
  },
  {
    id: 5,
    clientName: "Gabriel Almeida",
    service: "Tingimento",
    time: "14:30",
    duration: 60,
    status: "confirmed"
  },
  {
    id: 6,
    clientName: "Rafael Mendes",
    service: "Sobrancelha",
    time: "16:00",
    duration: 15,
    status: "completed"
  }
];

export function BarberViewScheduleModal({ 
  isOpen, 
  onClose, 
  barber 
}: BarberViewScheduleModalProps) {
  const [date, setDate] = useState<Date>(new Date());

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Confirmado</Badge>;
      case "completed":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Concluído</Badge>;
      case "canceled":
        return <Badge className="bg-red-500 hover:bg-red-600">Cancelado</Badge>;
      default:
        return <Badge>Pendente</Badge>;
    }
  };

  if (!barber) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <Avatar>
              <AvatarImage src={barber.avatar} alt={barber.name} />
              <AvatarFallback className="bg-barber-gold text-white">
                {barber.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <DialogTitle>Agenda de {barber.name}</DialogTitle>
          </div>
          <DialogDescription className="flex items-center justify-between">
            <span>{barber.todayAppointments} agendamentos hoje</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Horário</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">{appointment.time}</TableCell>
                    <TableCell>{appointment.clientName}</TableCell>
                    <TableCell>{appointment.service}</TableCell>
                    <TableCell>{appointment.duration} min</TableCell>
                    <TableCell className="text-right">
                      {getStatusBadge(appointment.status)}
                    </TableCell>
                  </TableRow>
                ))}
                {mockAppointments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      Nenhum agendamento para esta data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setDate(addDays(date, -1))}
            >
              Dia anterior
            </Button>
            <Button
              className="bg-barber-gold hover:bg-barber-gold/80"
              onClick={() => setDate(new Date())}
            >
              Hoje
            </Button>
            <Button 
              variant="outline"
              onClick={() => setDate(addDays(date, 1))}
            >
              Próximo dia
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
