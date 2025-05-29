import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClientLayout } from "@/components/layout/client-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, MapPin, MoreHorizontal, Scissors, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// Mock para agendamentos do cliente
const mockAppointments = [
  {
    id: 1,
    date: "2025-05-04",
    time: "14:30",
    barberShop: {
      id: 1,
      name: "Barbearia Vintage",
      address: "Rua Augusta, 1200, São Paulo",
      image: ""
    },
    barber: {
      id: 1,
      name: "Carlos Eduardo",
      avatar: ""
    },
    service: {
      name: "Corte + Barba",
      price: 55.00,
      duration: 45
    },
    status: "upcoming", // upcoming, completed, canceled
    paymentStatus: "pending", // paid, pending
    paymentMethod: "na_hora" // na_hora, pix, cartao
  },
  {
    id: 2,
    date: "2025-05-10",
    time: "10:00",
    barberShop: {
      id: 2,
      name: "Corte & Estilo",
      address: "Av. Paulista, 800, São Paulo",
      image: ""
    },
    barber: {
      id: 4,
      name: "João Victor",
      avatar: ""
    },
    service: {
      name: "Degradê",
      price: 45.00,
      duration: 40
    },
    status: "upcoming",
    paymentStatus: "paid",
    paymentMethod: "cartao"
  },
  {
    id: 3,
    date: "2025-04-25",
    time: "16:00",
    barberShop: {
      id: 1,
      name: "Barbearia Vintage",
      address: "Rua Augusta, 1200, São Paulo",
      image: ""
    },
    barber: {
      id: 2,
      name: "André Santos",
      avatar: ""
    },
    service: {
      name: "Corte Simples",
      price: 35.00,
      duration: 30
    },
    status: "completed",
    paymentStatus: "paid",
    paymentMethod: "pix"
  },
  {
    id: 4,
    date: "2025-04-15",
    time: "11:30",
    barberShop: {
      id: 3,
      name: "Barba & Cabelo",
      address: "Rua Oscar Freire, 500, São Paulo",
      image: ""
    },
    barber: {
      id: 1,
      name: "Carlos Eduardo",
      avatar: ""
    },
    service: {
      name: "Barba",
      price: 25.00,
      duration: 20
    },
    status: "canceled",
    paymentStatus: "refunded",
    paymentMethod: "cartao"
  }
];

const ClientAppointments = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");
  
  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "numeric",
      month: "short",
      weekday: "short"
    }).format(date);
  };
  
  // Função para cancelar agendamento
  const handleCancelAppointment = (id: number) => {
    toast.warning(
      "Deseja cancelar este agendamento?",
      {
        action: {
          label: "Confirmar",
          onClick: () => {
            // Em uma aplicação real, aqui chamaria a API para cancelamento
            toast.success("Agendamento cancelado com sucesso!");
          },
        },
        cancel: {
          label: "Cancelar",
          onClick: () => {},
        },
      }
    );
  };
  
  // Função para reagendar
  const handleRescheduleAppointment = (id: number) => {
    // Em um app real, navegaria para a página de agendamento com os dados pré-preenchidos
    navigate(`/cliente/agenda/${id}`);
  };
  
  // Filtrar agendamentos de acordo com a tab selecionada
  const filteredAppointments = mockAppointments.filter(appointment => {
    switch (activeTab) {
      case "upcoming":
        return appointment.status === "upcoming";
      case "completed":
        return appointment.status === "completed";
      case "canceled":
        return appointment.status === "canceled";
      default:
        return true;
    }
  });
  
  // Função para obter o tema do status do agendamento
  const getStatusTheme = (status: string, paymentStatus: string) => {
    if (status === "canceled") return "destructive";
    if (status === "completed") return "default";
    if (paymentStatus === "paid") return "success";
    return "warning";
  };
  
  // Função para obter o texto do status do agendamento
  const getStatusText = (status: string, paymentStatus: string) => {
    if (status === "canceled") return "Cancelado";
    if (status === "completed") return "Concluído";
    if (paymentStatus === "paid") return "Confirmado";
    return "Aguardando pagamento";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Agendamentos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os seus agendamentos
          </p>
        </div>
        <Button 
          className="bg-barber-gold hover:bg-barber-gold/90"
          onClick={() => navigate("/cliente")}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      {/* Tabs para filtrar agendamentos */}
      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="upcoming">Próximos</TabsTrigger>
            <TabsTrigger value="completed">Concluídos</TabsTrigger>
            <TabsTrigger value="canceled">Cancelados</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="upcoming" className="mt-4">
          {filteredAppointments.length > 0 ? (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onCancel={() => handleCancelAppointment(appointment.id)}
                  onReschedule={() => handleRescheduleAppointment(appointment.id)}
                  getStatusTheme={getStatusTheme}
                  getStatusText={getStatusText}
                  formatDate={formatDate}
                />
              ))}
            </div>
          ) : (
            <EmptyState 
              title="Nenhum agendamento futuro"
              description="Você não tem agendamentos marcados."
            />
          )}
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          {filteredAppointments.length > 0 ? (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onCancel={() => {}}
                  onReschedule={() => {}}
                  getStatusTheme={getStatusTheme}
                  getStatusText={getStatusText}
                  formatDate={formatDate}
                  showFeedback
                />
              ))}
            </div>
          ) : (
            <EmptyState 
              title="Nenhum agendamento concluído"
              description="Aqui aparecerão seus agendamentos finalizados."
            />
          )}
        </TabsContent>
        <TabsContent value="canceled" className="mt-4">
          {filteredAppointments.length > 0 ? (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onCancel={() => {}}
                  onReschedule={() => handleRescheduleAppointment(appointment.id)}
                  getStatusTheme={getStatusTheme}
                  getStatusText={getStatusText}
                  formatDate={formatDate}
                  showRebook
                />
              ))}
            </div>
          ) : (
            <EmptyState 
              title="Nenhum agendamento cancelado"
              description="Você não tem agendamentos cancelados."
              buttonText="Agendar Novamente"
              onClick={() => navigate("/cliente")}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Componente para o card de agendamento
interface AppointmentCardProps {
  appointment: any;
  onCancel: () => void;
  onReschedule: () => void;
  getStatusTheme: (status: string, paymentStatus: string) => string;
  getStatusText: (status: string, paymentStatus: string) => string;
  formatDate: (dateString: string) => string;
  showRebook?: boolean;
  showFeedback?: boolean;
}

const AppointmentCard = ({
  appointment,
  onCancel,
  onReschedule,
  getStatusTheme,
  getStatusText,
  formatDate,
  showRebook = false,
  showFeedback = false
}: AppointmentCardProps) => {
  const navigate = useNavigate();
  
  const handleFeedback = () => {
    navigate(`/cliente/feedback/${appointment.id}`);
  };
  
  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Parte da data */}
          <div className="p-4 sm:w-28 sm:flex-shrink-0 flex sm:flex-col gap-2 sm:gap-0 sm:border-r">
            <div className="text-xl font-bold">{formatDate(appointment.date)}</div>
            <div className="text-sm text-muted-foreground">{appointment.time}</div>
          </div>

          {/* Parte principal */}
          <div className="flex-grow p-4">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={appointment.barberShop.image} />
                  <AvatarFallback className="bg-muted">
                    {appointment.barberShop.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{appointment.barberShop.name}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" /> {appointment.barberShop.address}
                  </div>
                </div>
              </div>
              
              <Badge variant={getStatusTheme(appointment.status, appointment.paymentStatus) as any}>
                {getStatusText(appointment.status, appointment.paymentStatus)}
              </Badge>
            </div>
            
            <div className="mt-3 flex flex-col sm:flex-row sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center">
                  <Scissors className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span>{appointment.service.name}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{appointment.service.duration} min com {appointment.barber.name}</span>
                </div>
              </div>
              
              <div className="mt-3 sm:mt-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start">
                <div className="text-sm">Valor:</div>
                <div className="font-bold text-lg">R$ {appointment.service.price.toFixed(2)}</div>
              </div>
            </div>
            
            {/* Ações possíveis */}
            <div className="mt-4 flex justify-end gap-2">
              {appointment.status === "upcoming" && (
                <>
                  <Button variant="outline" size="sm" onClick={onReschedule}>
                    Reagendar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={onCancel}>
                    Cancelar
                  </Button>
                </>
              )}
              
              {showRebook && (
                <Button variant="default" size="sm" className="bg-barber-gold hover:bg-barber-gold/90" onClick={onReschedule}>
                  Agendar Novamente
                </Button>
              )}
              
              {showFeedback && (
                <Button variant="outline" size="sm" onClick={handleFeedback}>
                  Avaliar Serviço
                </Button>
              )}
              
              {appointment.status === "upcoming" && appointment.paymentStatus === "pending" && appointment.paymentMethod !== "na_hora" && (
                <Button variant="default" size="sm" className="bg-barber-gold hover:bg-barber-gold/90">
                  Efetuar Pagamento
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente de estado vazio
interface EmptyStateProps {
  title: string;
  description: string;
  buttonText?: string;
  onClick?: () => void;
}

const EmptyState = ({ title, description, buttonText, onClick }: EmptyStateProps) => {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Calendar className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground text-center mt-1 max-w-sm">
          {description}
        </p>
        {buttonText && onClick && (
          <Button 
            className="mt-6 bg-barber-gold hover:bg-barber-gold/90"
            onClick={onClick}
          >
            {buttonText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientAppointments;
