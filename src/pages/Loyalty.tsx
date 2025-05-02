
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Gift, Plus, Star, Users } from "lucide-react";
import { mockLoyaltyPrograms } from "@/data/mock-loyalty";
import { LoyaltyProgramAddModal } from "@/components/loyalty/loyalty-program-add-modal";

const Loyalty = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Programa de Fidelidade</h2>
            <p className="text-muted-foreground">
              Gerencie os programas de fidelidade para seus clientes
            </p>
          </div>
          <Button className="bg-barber-gold hover:bg-barber-gold/80" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Programa
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="bg-barber-gold/10 pb-2">
              <CardTitle className="text-2xl">Programas Ativos</CardTitle>
              <CardDescription>Total de programas em execução</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-4xl font-bold">
                {mockLoyaltyPrograms.filter(p => p.status === "active").length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-barber-gold/10 pb-2">
              <CardTitle className="text-2xl">Clientes Participantes</CardTitle>
              <CardDescription>Total de clientes nos programas</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 flex items-center">
              <Users className="h-8 w-8 mr-3 text-barber-gold" />
              <p className="text-4xl font-bold">124</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-barber-gold/10 pb-2">
              <CardTitle className="text-2xl">Recompensas Resgatadas</CardTitle>
              <CardDescription>Total de recompensas entregues</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 flex items-center">
              <Gift className="h-8 w-8 mr-3 text-barber-gold" />
              <p className="text-4xl font-bold">37</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="programs" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="programs">Programas</TabsTrigger>
            <TabsTrigger value="rewards">Recompensas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="programs">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Programa</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Regra</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Participantes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockLoyaltyPrograms.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Award className="h-5 w-5 mr-2 text-barber-gold" />
                          {program.name}
                        </div>
                      </TableCell>
                      <TableCell>{program.description}</TableCell>
                      <TableCell>{program.rule}</TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          program.status === "active" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        }`}>
                          {program.status === "active" ? "Ativo" : "Inativo"}
                        </div>
                      </TableCell>
                      <TableCell>{program.participants}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="rewards">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {mockLoyaltyPrograms.flatMap(program => 
                program.rewards.map((reward, idx) => (
                  <Card key={`${program.id}-${idx}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Gift className="h-5 w-5 mr-2 text-barber-gold" />
                        {reward.name}
                      </CardTitle>
                      <CardDescription>{reward.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-1 mb-4">
                        <Star className="h-4 w-4 text-barber-gold" />
                        <span>{reward.points} pontos necessários</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Programa: {program.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Resgatados: {reward.redeemed} vezes
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <LoyaltyProgramAddModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </DashboardLayout>
  );
};

export default Loyalty;
