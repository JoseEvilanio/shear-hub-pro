
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Clock, Loader2 } from "lucide-react"; // Added Loader2
// import { mockServices } from "@/data/mock-services"; // Remove mock data
import { ServiceAddModal } from "@/components/services/service-add-modal";
import { ServiceEditModal } from "@/components/services/service-edit-modal";
import { supabase } from "@/integrations/supabase/client"; // Import supabase
import { useState, useEffect } from "react"; // Import useEffect
import { toast } from "sonner"; // For error notifications
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  // AlertDialogTrigger, // We'll trigger manually
} from "@/components/ui/alert-dialog";

// Define an interface for the Service data
interface Service {
  id: string; // Assuming ID is a string from Supabase (e.g., UUID)
  name: string;
  description?: string | null; // Optional
  duration: number; // Assuming duration in minutes
  price: number;
  user_id?: string; // Assuming services are linked to a user
  barbershop_id?: string | null; // Assuming services might be linked to a barbershop
  // Add other fields if necessary, like created_at, category, etc.
}

const Services = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado.");
        setIsLoading(false);
        setServices([]); // Clear services if user is not authenticated
        return;
      }

      // Fetch services associated with the user.
      // TODO: Adjust if services should be fetched via a barbershop_id linked to the user.
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', user.id) // Assuming services are directly linked to user_id
        .order('name', { ascending: true });

      if (error) {
        toast.error(error.message || "Erro ao buscar serviços.");
        console.error("Error fetching services:", error);
        setServices([]);
      } else {
        setServices(data as Service[]);
      }
    } catch (error: any) {
      toast.error("Ocorreu um erro inesperado ao buscar serviços.");
      console.error("Unexpected error fetching services:", error);
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchServices();
  }, []);

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteDialog = (service: Service) => {
    setServiceToDelete(service);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!serviceToDelete || !serviceToDelete.id) {
      toast.error("Nenhum serviço selecionado para exclusão.");
      return;
    }
    setIsDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado.");
        setIsDeleting(false);
        return;
      }

      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceToDelete.id)
        .eq('user_id', user.id); // Ensure user can only delete their own services

      if (error) {
        toast.error(error.message || "Erro ao excluir serviço.");
        console.error("Error deleting service:", error);
      } else {
        toast.success("Serviço excluído com sucesso!");
        fetchServices(); // Refresh the list
      }
    } catch (error: any) {
      toast.error("Ocorreu um erro inesperado ao excluir o serviço.");
      console.error("Unexpected error deleting service:", error);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setServiceToDelete(null);
    }
  };

  const totalServices = services.length;
  const averageDuration = totalServices > 0 
    ? Math.round(services.reduce((acc, service) => acc + service.duration, 0) / totalServices)
    : 0;
  const averagePrice = totalServices > 0
    ? (services.reduce((acc, service) => acc + service.price, 0) / totalServices)
    : 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-150px)]">
          <Loader2 className="h-16 w-16 animate-spin text-barber-gold" />
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Serviços</h2>
            <p className="text-muted-foreground">
              Gerencie os serviços oferecidos em sua barbearia
            </p>
          </div>
          <Button className="bg-barber-gold hover:bg-barber-gold/80" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Serviço
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="bg-barber-gold/10 pb-2">
              <CardTitle className="text-2xl">Total de Serviços</CardTitle>
              <CardDescription>Todos os serviços cadastrados</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-4xl font-bold">{totalServices}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-barber-gold/10 pb-2">
              <CardTitle className="text-2xl">Tempo Médio</CardTitle>
              <CardDescription>Duração média dos serviços</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-4xl font-bold">
                {averageDuration} min
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-barber-gold/10 pb-2">
              <CardTitle className="text-2xl">Preço Médio</CardTitle>
              <CardDescription>Valor médio dos serviços</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-4xl font-bold">
                R$ {averagePrice.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="table" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="table">Tabela</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
          </TabsList>
          
          <TabsContent value="table">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.length === 0 && !isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Nenhum serviço encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell>{service.description || "-"}</TableCell>
                        <TableCell>{service.duration} min</TableCell>
                        <TableCell>R$ {Number(service.price).toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditService(service)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleOpenDeleteDialog(service)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="cards" className="space-y-4">
            {services.length === 0 && !isLoading ? (
              <div className="text-center text-muted-foreground py-10">
                Nenhum serviço encontrado.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <Card key={service.id}>
                    <CardHeader>
                      <CardTitle>{service.name}</CardTitle>
                      <CardDescription>{service.description || "Sem descrição"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{service.duration} minutos</span>
                      </div>
                      <p className="mt-4 text-2xl font-bold">
                        R$ {Number(service.price).toFixed(2)}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditService(service)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive"
                        onClick={() => handleOpenDeleteDialog(service)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <ServiceAddModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onServiceAdded={fetchServices} // Pass fetchServices to refresh list
      />

      <ServiceEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        service={selectedService}
        onServiceUpdated={fetchServices} // Pass fetchServices to refresh list
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o serviço "{serviceToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirmar Exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Services;
