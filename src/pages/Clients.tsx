
import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, UserMinus } from "lucide-react";

import { ClientAddModal } from "@/components/clients/client-add-modal";
import { ClientEditModal } from "@/components/clients/client-edit-modal";
import { ClientDeleteModal } from "@/components/clients/client-delete-modal";
import { ClientViewHistoryModal } from "@/components/clients/client-view-history-modal";
import { ClientMetrics } from "@/components/clients/client-metrics";
import { ClientCardView } from "@/components/clients/client-card-view";
import { ClientTableView } from "@/components/clients/client-table-view";
import { ClientSearchFilter } from "@/components/clients/client-search-filter";
import { useToast } from "@/components/ui/use-toast";

import { mockClients } from "@/data/mock-clients";

const Clients = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const filteredClients = useMemo(() => {
    return mockClients.filter(client => {
      // Apply status filter
      if (statusFilter !== "all" && client.status !== statusFilter) {
        return false;
      }
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          client.name.toLowerCase().includes(query) ||
          client.email.toLowerCase().includes(query) ||
          client.phone.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [searchQuery, statusFilter]);

  const handleOpenHistory = (client: any) => {
    setSelectedClient(client);
    setIsHistoryModalOpen(true);
  };

  const handleEditClient = (client: any) => {
    setSelectedClient(client);
    setIsEditModalOpen(true);
  };

  const handleDeleteClient = (client: any) => {
    setSelectedClient(client);
    setIsDeleteModalOpen(true);
  };

  const handleToggleStatus = (clientId: number) => {
    // In a real app, this would call an API to update the client's status
    toast({
      title: "Status alterado",
      description: "O status do cliente foi atualizado com sucesso.",
    });
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
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
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="text-red-600 border-red-600 hover:bg-red-600/10"
            >
              <UserMinus className="mr-2 h-4 w-4" />
              Clientes Inativos
            </Button>
            <Button className="bg-barber-gold hover:bg-barber-gold/80" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Cliente
            </Button>
          </div>
        </div>

        <ClientMetrics clients={filteredClients} />
        
        <div className="mb-6">
          <ClientSearchFilter 
            onSearchChange={setSearchQuery}
            onStatusFilterChange={setStatusFilter}
            onReset={handleResetFilters}
          />
        </div>

        <Tabs defaultValue="cards" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="table">Tabela</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cards" className="space-y-4">
            {filteredClients.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Nenhum cliente encontrado com os filtros aplicados.</p>
              </div>
            ) : (
              <ClientCardView 
                clients={filteredClients} 
                onOpenHistory={handleOpenHistory} 
                onEdit={handleEditClient}
                onDelete={handleDeleteClient}
              />
            )}
          </TabsContent>
          
          <TabsContent value="table">
            {filteredClients.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Nenhum cliente encontrado com os filtros aplicados.</p>
              </div>
            ) : (
              <ClientTableView 
                clients={filteredClients} 
                onOpenHistory={handleOpenHistory} 
                onEdit={handleEditClient}
                onDelete={handleDeleteClient}
                onToggleStatus={handleToggleStatus}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      <ClientAddModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      <ClientEditModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        client={selectedClient}
      />

      <ClientDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        client={selectedClient}
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
