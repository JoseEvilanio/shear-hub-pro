
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { ClientAddModal } from "@/components/clients/client-add-modal";
import { ClientViewHistoryModal } from "@/components/clients/client-view-history-modal";
import { ClientMetrics } from "@/components/clients/client-metrics";
import { ClientCardView } from "@/components/clients/client-card-view";
import { ClientTableView } from "@/components/clients/client-table-view";
import { mockClients } from "@/data/mock-clients";

const Clients = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const handleOpenHistory = (client: any) => {
    setSelectedClient(client);
    setIsHistoryModalOpen(true);
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
            <ClientCardView clients={mockClients} onOpenHistory={handleOpenHistory} />
          </TabsContent>
          
          <TabsContent value="table">
            <ClientTableView clients={mockClients} onOpenHistory={handleOpenHistory} />
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
