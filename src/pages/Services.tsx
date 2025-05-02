
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Clock } from "lucide-react";
import { mockServices } from "@/data/mock-services";
import { ServiceAddModal } from "@/components/services/service-add-modal";
import { ServiceEditModal } from "@/components/services/service-edit-modal";

const Services = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  const handleEditService = (service: any) => {
    setSelectedService(service);
    setIsEditModalOpen(true);
  };

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
              <p className="text-4xl font-bold">{mockServices.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-barber-gold/10 pb-2">
              <CardTitle className="text-2xl">Tempo Médio</CardTitle>
              <CardDescription>Duração média dos serviços</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-4xl font-bold">
                {Math.round(
                  mockServices.reduce((acc, service) => acc + service.duration, 0) / 
                  mockServices.length
                )} min
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
                R$ {(
                  mockServices.reduce((acc, service) => acc + service.price, 0) / 
                  mockServices.length
                ).toFixed(2)}
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
                  {mockServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell>{service.description}</TableCell>
                      <TableCell>{service.duration} min</TableCell>
                      <TableCell>R$ {service.price.toFixed(2)}</TableCell>
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
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="cards" className="space-y-4">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {mockServices.map((service) => (
                <Card key={service.id}>
                  <CardHeader>
                    <CardTitle>{service.name}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{service.duration} minutos</span>
                    </div>
                    <p className="mt-4 text-2xl font-bold">
                      R$ {service.price.toFixed(2)}
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
                    <Button variant="outline" size="sm" className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ServiceAddModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      <ServiceEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        service={selectedService}
      />
    </DashboardLayout>
  );
};

export default Services;
