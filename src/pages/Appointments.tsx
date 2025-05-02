
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AppointmentAddModal } from "@/components/appointments/appointment-add-modal";

const Appointments = () => {
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  // Simulated appointments
  const appointments = [
    {
      id: 1,
      client: "João Silva",
      service: "Corte de Cabelo",
      barber: "Carlos",
      date: "12/05/2023",
      time: "10:00",
      status: "confirmed",
      payment: "paid"
    },
    {
      id: 2,
      client: "Pedro Alves",
      service: "Barba",
      barber: "Eduardo",
      date: "12/05/2023",
      time: "11:30",
      status: "confirmed",
      payment: "pending"
    },
    {
      id: 3,
      client: "Marcos Oliveira",
      service: "Combo (Corte + Barba)",
      barber: "Carlos",
      date: "12/05/2023",
      time: "14:00",
      status: "pending",
      payment: "pending"
    },
    {
      id: 4,
      client: "Lucas Mendes",
      service: "Corte Degradê",
      barber: "André",
      date: "12/05/2023",
      time: "16:30",
      status: "confirmed",
      payment: "paid"
    },
    {
      id: 5,
      client: "Roberto Carlos",
      service: "Corte + Pigmentação",
      barber: "André",
      date: "13/05/2023",
      time: "09:00",
      status: "confirmed",
      payment: "paid"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-barber-green">Confirmado</Badge>;
      case 'pending':
        return <Badge variant="outline">Pendente</Badge>;
      case 'cancelled':
        return <Badge className="bg-barber-red">Cancelado</Badge>;
      default:
        return <Badge variant="outline">Indefinido</Badge>;
    }
  };

  const getPaymentBadge = (payment: string) => {
    switch (payment) {
      case 'paid':
        return <Badge className="bg-blue-500">Pago</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-orange-500 text-orange-500">Pendente</Badge>;
      default:
        return <Badge variant="outline">Indefinido</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Agendamentos</h2>
            <p className="text-muted-foreground">
              Gerencie os agendamentos da sua barbearia
            </p>
          </div>
          <Button 
            className="bg-barber-gold hover:bg-barber-gold/80"
            onClick={() => setIsAppointmentModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 bg-background border rounded-md px-3 py-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>12 Maio, 2023</span>
              </div>
              <Button variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Barbeiro" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="carlos">Carlos</SelectItem>
                  <SelectItem value="eduardo">Eduardo</SelectItem>
                  <SelectItem value="andre">André</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar cliente..."
              className="w-full md:w-[250px] pl-8"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Agendamentos do dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.map(appointment => (
                <div
                  key={appointment.id}
                  className="p-4 border rounded-lg flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1 md:flex-1">
                    <div className="font-medium">{appointment.client}</div>
                    <div className="text-sm text-muted-foreground">{appointment.service}</div>
                    <div className="text-xs text-muted-foreground">Barbeiro: {appointment.barber}</div>
                  </div>
                  
                  <div className="md:text-center md:flex-1">
                    <div className="inline-flex gap-2 items-center">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{appointment.date}</span>
                    </div>
                    <div className="text-sm font-medium mt-1">{appointment.time}</div>
                  </div>
                  
                  <div className="flex gap-2 md:gap-3 md:flex-1 md:justify-end">
                    {getStatusBadge(appointment.status)}
                    {getPaymentBadge(appointment.payment)}
                    <Button variant="outline" size="sm" className="ml-auto md:ml-0">
                      Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <AppointmentAddModal 
        isOpen={isAppointmentModalOpen} 
        onClose={() => setIsAppointmentModalOpen(false)} 
      />
    </DashboardLayout>
  );
};

export default Appointments;
