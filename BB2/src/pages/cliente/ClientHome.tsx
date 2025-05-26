import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockBarbers } from "@/data/mock-barbers";

const mockBarbershops = [
  {
    id: 1,
    name: "Barbearia Central",
    address: "Rua das Flores, 123",
    distance: 1.2,
    rating: 4.8,
    image: "",
    openTime: "08:00",
    closeTime: "20:00"
  },
  {
    id: 2,
    name: "Barbearia do Bairro",
    address: "Av. Brasil, 456",
    distance: 2.5,
    rating: 4.5,
    image: "",
    openTime: "09:00",
    closeTime: "19:00"
  }
];

const mockAppointments = [
  {
    id: 1,
    barbershop: "Barbearia Central",
    barber: "Carlos Eduardo",
    date: "2024-06-01",
    service: "Corte moderno",
    status: "finalizado"
  },
  {
    id: 2,
    barbershop: "Barbearia do Bairro",
    barber: "João Silva",
    date: "2024-05-15",
    service: "Barba completa",
    status: "finalizado"
  }
];

const mockLoyalty = [
  {
    barbershop: "Barbearia Central",
    points: 120
  },
  {
    barbershop: "Barbearia do Bairro",
    points: 80
  }
];

export default function ClientHome() {
  const [selectedBarbershop, setSelectedBarbershop] = useState<number | null>(null);
  const [searchBarber, setSearchBarber] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");

  // Filtro de barbeiros por barbearia, busca e especialidade
  const filteredBarbers = mockBarbers
    .filter(barber => barber.status === "active")
    .filter(barber =>
      (!specialtyFilter || barber.specialties.includes(specialtyFilter)) &&
      (!searchBarber || barber.name.toLowerCase().includes(searchBarber.toLowerCase()))
    );

  return (
    <div className="max-w-5xl mx-auto py-8">
      <Tabs defaultValue="barbershops">
        <TabsList className="mb-4 flex flex-wrap gap-2">
          <TabsTrigger value="barbershops">Barbearias Próximas</TabsTrigger>
          <TabsTrigger value="barbers">Barbeiros</TabsTrigger>
          <TabsTrigger value="appointments">Meus Agendamentos</TabsTrigger>
          <TabsTrigger value="loyalty">Fidelidade</TabsTrigger>
          <TabsTrigger value="suggestions">Sugestões</TabsTrigger>
        </TabsList>

        <TabsContent value="barbershops">
          <h2 className="text-xl font-bold mb-4">Barbearias Próximas de Você</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockBarbershops.map(shop => (
              <Card key={shop.id} className={`cursor-pointer hover:shadow-lg ${selectedBarbershop === shop.id ? "border-barber-gold border-2" : ""}`} onClick={() => setSelectedBarbershop(shop.id)}>
                <CardHeader>
                  <CardTitle>{shop.name}</CardTitle>
                  <CardDescription>
                    {shop.address} • {shop.distance}km • ⭐ {shop.rating}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span>Aberto: {shop.openTime} - {shop.closeTime}</span>
                    <Button onClick={() => setSelectedBarbershop(shop.id)}>
                      Ver barbeiros
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="barbers">
          {selectedBarbershop ? (
            <div>
              <h2 className="text-xl font-bold mb-4">
                Barbeiros da {mockBarbershops.find(s => s.id === selectedBarbershop)?.name}
              </h2>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Buscar barbeiro pelo nome..."
                  value={searchBarber}
                  onChange={e => setSearchBarber(e.target.value)}
                  className="max-w-xs"
                />
                <Input
                  placeholder="Filtrar por especialidade (ex: Corte)"
                  value={specialtyFilter}
                  onChange={e => setSpecialtyFilter(e.target.value)}
                  className="max-w-xs"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBarbers.length > 0 ? filteredBarbers.map(barber => (
                  <Card key={barber.id}>
                    <CardHeader>
                      <CardTitle>{barber.name}</CardTitle>
                      <CardDescription>
                        {barber.specialties.join(", ")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>{barber.bio}</p>
                      <Button className="mt-2">Agendar com {barber.name}</Button>
                    </CardContent>
                  </Card>
                )) : (
                  <span>Nenhum barbeiro encontrado para os filtros selecionados.</span>
                )}
              </div>
            </div>
          ) : (
            <p>Selecione uma barbearia para ver os barbeiros disponíveis.</p>
          )}
        </TabsContent>

        <TabsContent value="appointments">
          <h2 className="text-xl font-bold mb-4">Meus Agendamentos Passados</h2>
          <div className="space-y-4">
            {mockAppointments.map(app => (
              <Card key={app.id}>
                <CardHeader>
                  <CardTitle>{app.barbershop} - {app.barber}</CardTitle>
                  <CardDescription>{app.date} • {app.service}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline">Agendar novamente</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="loyalty">
          <h2 className="text-xl font-bold mb-4">Meus Pontos de Fidelidade</h2>
          <div className="space-y-4">
            {mockLoyalty.map(loyalty => (
              <Card key={loyalty.barbershop}>
                <CardHeader>
                  <CardTitle>{loyalty.barbershop}</CardTitle>
                  <CardDescription>
                    Pontos acumulados: <span className="font-bold">{loyalty.points}</span>
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="suggestions">
          <h2 className="text-xl font-bold mb-4">Sugestões de Melhorias</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Filtrar barbeiros por especialidade e busca por nome.</li>
            <li>Recomendações de barbeiros baseadas no histórico do cliente.</li>
            <li>Exibir avaliações e comentários dos barbeiros.</li>
            <li>Mostrar promoções ativas de cada barbearia.</li>
            <li>Permitir reagendamento rápido de serviços anteriores.</li>
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
}