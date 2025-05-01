
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Edit, Plus, Users } from "lucide-react";
import { BarberAddModal } from "@/components/barbers/barber-add-modal";
import { BarberViewScheduleModal } from "@/components/barbers/barber-view-schedule-modal";
import { BarberMetrics } from "@/components/barbers/barber-metrics";
import { useToast } from "@/components/ui/use-toast";

// Mock data for barbers
const mockBarbers = [
  {
    id: 1,
    name: "Carlos Eduardo",
    avatar: "",
    email: "carlos@shearhub.com",
    phone: "(11) 98765-4321",
    specialties: ["Corte moderno", "Degradê", "Barba"],
    status: "active",
    todayAppointments: 5,
    monthAppointments: 42,
    bio: "Especialista em cortes modernos e degradê, com mais de 10 anos de experiência."
  },
  {
    id: 2,
    name: "André Santos",
    avatar: "",
    email: "andre@shearhub.com",
    phone: "(11) 91234-5678",
    specialties: ["Barba", "Tingimento", "Corte clássico"],
    status: "active",
    todayAppointments: 3,
    monthAppointments: 38,
    bio: "Mestre barbeiro especializado em barbas e tratamentos capilares."
  },
  {
    id: 3,
    name: "Marcos Paulo",
    avatar: "",
    email: "marcos@shearhub.com",
    phone: "(11) 99876-5432",
    specialties: ["Degradê", "Desenho", "Corte infantil"],
    status: "inactive",
    todayAppointments: 0,
    monthAppointments: 15,
    bio: "Especialista em degradês e desenhos na cabeça."
  },
  {
    id: 4,
    name: "João Victor",
    avatar: "",
    email: "joao@shearhub.com",
    phone: "(11) 95555-4444",
    specialties: ["Tratamentos capilares", "Coloração", "Corte"],
    status: "active",
    todayAppointments: 4,
    monthAppointments: 36,
    bio: "Especialista em tratamentos capilares e coloração."
  }
];

const Barbers = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState<any>(null);
  const { toast } = useToast();

  const handleOpenSchedule = (barber: any) => {
    setSelectedBarber(barber);
    setIsScheduleModalOpen(true);
  };

  const handleToggleStatus = (barberId: number) => {
    // In a real app, this would call an API to update the barber's status
    toast({
      title: "Status alterado",
      description: "O status do barbeiro foi atualizado com sucesso.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Barbeiros</h2>
            <p className="text-muted-foreground">
              Gerencie os barbeiros cadastrados em sua barbearia
            </p>
          </div>
          <Button className="bg-barber-gold hover:bg-barber-gold/80" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Barbeiro
          </Button>
        </div>

        <BarberMetrics barbers={mockBarbers} />

        <Tabs defaultValue="cards" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="table">Tabela</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cards" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {mockBarbers.map(barber => (
                <Card 
                  key={barber.id} 
                  className={`overflow-hidden transition-all ${
                    barber.status === "inactive" ? "opacity-70" : ""
                  }`}
                >
                  <CardHeader className="relative p-0">
                    <div className="h-24 bg-gradient-to-r from-barber-gold/30 to-barber-gold/10"></div>
                    <div className="absolute -bottom-10 left-4">
                      <Avatar className="h-16 w-16 border-4 border-background">
                        <AvatarImage src={barber.avatar} alt={barber.name} />
                        <AvatarFallback className="bg-barber-gold text-white text-xl">
                          {barber.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-12 pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{barber.name}</h3>
                        <p className="text-sm text-muted-foreground">{barber.email}</p>
                      </div>
                      <Badge 
                        className={barber.status === "active" 
                          ? "bg-emerald-500 hover:bg-emerald-600" 
                          : "bg-gray-500 hover:bg-gray-600"}
                      >
                        {barber.status === "active" ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 my-2">
                      {barber.specialties.map((specialty, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-muted">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className="text-center p-2 bg-muted rounded-md">
                        <p className="text-xs text-muted-foreground">Hoje</p>
                        <p className="font-semibold">{barber.todayAppointments}</p>
                      </div>
                      <div className="text-center p-2 bg-muted rounded-md">
                        <p className="text-xs text-muted-foreground">Este mês</p>
                        <p className="font-semibold">{barber.monthAppointments}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-0">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full gap-1"
                      onClick={() => handleOpenSchedule(barber)}
                    >
                      <Calendar size={14} />
                      Ver Agenda
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full gap-1 ml-2"
                      onClick={() => handleToggleStatus(barber.id)}
                    >
                      <Edit size={14} />
                      Editar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="table">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barbeiro</TableHead>
                    <TableHead>Especialidades</TableHead>
                    <TableHead className="text-center">Hoje</TableHead>
                    <TableHead className="text-center">Este mês</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBarbers.map((barber) => (
                    <TableRow key={barber.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={barber.avatar} alt={barber.name} />
                            <AvatarFallback className="bg-barber-gold text-white">
                              {barber.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{barber.name}</p>
                            <p className="text-xs text-muted-foreground">{barber.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {barber.specialties.slice(0, 2).map((specialty, i) => (
                            <Badge key={i} variant="outline" className="text-xs bg-muted">
                              {specialty}
                            </Badge>
                          ))}
                          {barber.specialties.length > 2 && (
                            <Badge variant="outline" className="text-xs bg-muted">
                              +{barber.specialties.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{barber.todayAppointments}</TableCell>
                      <TableCell className="text-center">{barber.monthAppointments}</TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          className={barber.status === "active" 
                            ? "bg-emerald-500 hover:bg-emerald-600" 
                            : "bg-gray-500 hover:bg-gray-600"}
                        >
                          {barber.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleOpenSchedule(barber)}
                          >
                            <Calendar size={14} />
                            <span className="sr-only">Ver agenda</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleToggleStatus(barber.id)}
                          >
                            <Edit size={14} />
                            <span className="sr-only">Editar</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <BarberAddModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      <BarberViewScheduleModal 
        isOpen={isScheduleModalOpen} 
        onClose={() => setIsScheduleModalOpen(false)} 
        barber={selectedBarber}
      />
    </DashboardLayout>
  );
};

export default Barbers;
