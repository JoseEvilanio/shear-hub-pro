
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
import { History, Plus, Search, User, Trophy } from "lucide-react";
import { ClientAddModal } from "@/components/clients/client-add-modal";
import { ClientViewHistoryModal } from "@/components/clients/client-view-history-modal";
import { ClientMetrics } from "@/components/clients/client-metrics";
import { useToast } from "@/components/ui/use-toast";

// Mock data for clients
const mockClients = [
  {
    id: 1,
    name: "Ricardo Almeida",
    avatar: "",
    email: "ricardo@email.com",
    phone: "(11) 99876-5432",
    loyaltyPoints: 45,
    status: "active",
    lastVisit: "2025-04-29",
    totalVisits: 12,
    preferredBarber: "Carlos Eduardo",
    notes: "Prefere corte degradê baixo e barba modelada."
  },
  {
    id: 2,
    name: "Fernando Silva",
    avatar: "",
    email: "fernando@email.com",
    phone: "(11) 98765-4321",
    loyaltyPoints: 20,
    status: "active",
    lastVisit: "2025-04-15",
    totalVisits: 6,
    preferredBarber: "André Santos",
    notes: "Cliente sensível no couro cabeludo, usar tesoura na parte superior."
  },
  {
    id: 3,
    name: "Bruno Costa",
    avatar: "",
    email: "bruno@email.com",
    phone: "(11) 97654-3210",
    loyaltyPoints: 65,
    status: "inactive",
    lastVisit: "2025-03-02",
    totalVisits: 18,
    preferredBarber: "Marcos Paulo",
    notes: "Corte militar com máquina zero nas laterais."
  },
  {
    id: 4,
    name: "Pedro Oliveira",
    avatar: "",
    email: "pedro@email.com",
    phone: "(11) 96543-2109",
    loyaltyPoints: 30,
    status: "active",
    lastVisit: "2025-05-01",
    totalVisits: 8,
    preferredBarber: "João Victor",
    notes: "Barba apenas aparada, mantendo comprimento."
  }
];

const Clients = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const { toast } = useToast();

  const handleOpenHistory = (client: any) => {
    setSelectedClient(client);
    setIsHistoryModalOpen(true);
  };

  const handleToggleStatus = (clientId: number) => {
    // In a real app, this would call an API to update the client's status
    toast({
      title: "Status alterado",
      description: "O status do cliente foi atualizado com sucesso.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
            <p className="text-muted-foreground">
              Gerencie os clientes cadastrados em sua barbearia
            </p>
          </div>
          <Button className="bg-barber-gold hover:bg-barber-gold/80" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Cliente
          </Button>
        </div>

        <ClientMetrics clients={mockClients} />

        <Tabs defaultValue="cards" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="table">Tabela</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cards" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {mockClients.map(client => (
                <Card 
                  key={client.id} 
                  className={`overflow-hidden transition-all ${
                    client.status === "inactive" ? "opacity-70" : ""
                  }`}
                >
                  <CardHeader className="relative p-0">
                    <div className="h-24 bg-gradient-to-r from-barber-gold/30 to-barber-gold/10"></div>
                    <div className="absolute -bottom-10 left-4">
                      <Avatar className="h-16 w-16 border-4 border-background">
                        <AvatarImage src={client.avatar} alt={client.name} />
                        <AvatarFallback className="bg-barber-gold text-white text-xl">
                          {client.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-12 pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{client.name}</h3>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                        <p className="text-sm text-muted-foreground">{client.phone}</p>
                      </div>
                      <Badge 
                        className={client.status === "active" 
                          ? "bg-emerald-500 hover:bg-emerald-600" 
                          : "bg-gray-500 hover:bg-gray-600"}
                      >
                        {client.status === "active" ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex items-center gap-2 text-sm">
                        <User size={14} className="text-barber-gold" />
                        <span>Barbeiro: {client.preferredBarber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm mt-1">
                        <History size={14} className="text-barber-gold" />
                        <span>Última visita: {new Date(client.lastVisit).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 p-2 bg-muted rounded-md">
                      <div className="flex items-center gap-2">
                        <Trophy size={16} className="text-barber-gold" />
                        <span className="text-sm font-medium">Pontos de fidelidade</span>
                      </div>
                      <span className="font-bold">{client.loyaltyPoints}</span>
                    </div>
                    
                    {client.notes && (
                      <div className="mt-3 p-2 bg-muted/50 rounded-md text-xs italic">
                        <p className="line-clamp-2">{client.notes}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between pt-0">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full gap-1"
                      onClick={() => handleOpenHistory(client)}
                    >
                      <History size={14} />
                      Histórico
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full gap-1 ml-2"
                      onClick={() => handleToggleStatus(client.id)}
                    >
                      <User size={14} />
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
                    <TableHead>Cliente</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead className="text-center">Pontos</TableHead>
                    <TableHead>Barbeiro</TableHead>
                    <TableHead className="text-center">Visitas</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={client.avatar} alt={client.name} />
                            <AvatarFallback className="bg-barber-gold text-white">
                              {client.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{client.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Última visita: {new Date(client.lastVisit).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{client.email}</p>
                        <p className="text-sm">{client.phone}</p>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Trophy size={14} className="text-barber-gold" />
                          <span className="font-medium">{client.loyaltyPoints}</span>
                        </div>
                      </TableCell>
                      <TableCell>{client.preferredBarber}</TableCell>
                      <TableCell className="text-center">{client.totalVisits}</TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          className={client.status === "active" 
                            ? "bg-emerald-500 hover:bg-emerald-600" 
                            : "bg-gray-500 hover:bg-gray-600"}
                        >
                          {client.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleOpenHistory(client)}
                          >
                            <History size={14} />
                            <span className="sr-only">Ver histórico</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleToggleStatus(client.id)}
                          >
                            <User size={14} />
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

      <ClientAddModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      <ClientViewHistoryModal 
        isOpen={isHistoryModalOpen} 
        onClose={() => setIsHistoryModalOpen(false)} 
        client={selectedClient}
      />
    </DashboardLayout>
  );
};

export default Clients;
