
import { useState, useEffect } from "react";
import { ClientLayout } from "@/components/layout/client-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { SearchBar } from "@/components/cliente/home/search-bar";
import { BarberShopList } from "@/components/cliente/home/barber-shop-list";
import { BarberShopMap } from "@/components/cliente/home/barber-shop-map";
import { RecentBarberShops } from "@/components/cliente/home/recent-barber-shops";
import { mockBarberShops } from "@/data/mock-barber-shops";

const ClientHome = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("lista");
  const [useLocation, setUseLocation] = useState(true);
  const [priceRange, setPriceRange] = useState(["baixo", "médio", "alto"]);
  const [minRating, setMinRating] = useState(0);
  const [maxDistance, setMaxDistance] = useState(5);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [filteredShops, setFilteredShops] = useState(mockBarberShops);

  // Lista de todos os serviços disponíveis
  const availableServices = ["Corte", "Barba", "Degradê", "Coloração", "Tratamento", "Hidratação"];

  // Filtrar barbearias baseado nos critérios
  useEffect(() => {
    const filtered = mockBarberShops.filter(shop => {
      // Filtro de busca
      const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           shop.address.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro de faixa de preço
      const matchesPrice = priceRange.includes(shop.priceRange);
      
      // Filtro de avaliação
      const matchesRating = shop.rating >= minRating;
      
      // Filtro de distância
      const matchesDistance = shop.distance <= maxDistance;
      
      // Filtro de serviços
      const matchesServices = selectedServices.length === 0 || 
                             selectedServices.every(service => shop.services.includes(service));
      
      return matchesSearch && matchesPrice && matchesRating && matchesDistance && matchesServices;
    });
    
    setFilteredShops(filtered);
  }, [searchTerm, priceRange, minRating, maxDistance, selectedServices]);

  // Simula conseguir a localização do usuário
  useEffect(() => {
    if (useLocation) {
      // Em uma aplicação real, aqui usaríamos a API de Geolocalização
      console.log("Obtendo localização do usuário...");
    }
  }, [useLocation]);

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Início</h1>
            <p className="text-muted-foreground">
              Encontre as melhores barbearias próximas a você
            </p>
          </div>
          <Button 
            variant="default"
            className="bg-barber-gold hover:bg-barber-gold/90"
            asChild
          >
            <Link to="/cliente/barbearias">
              Ver todas as barbearias
            </Link>
          </Button>
        </div>

        {/* Barra de busca e filtros */}
        <SearchBar 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          useLocation={useLocation}
          setUseLocation={setUseLocation}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          minRating={minRating}
          setMinRating={setMinRating}
          maxDistance={maxDistance}
          setMaxDistance={setMaxDistance}
          selectedServices={selectedServices}
          setSelectedServices={setSelectedServices}
          availableServices={availableServices}
        />

        {/* Exibição das barbearias */}
        <div>
          <Tabs defaultValue="lista" value={viewMode} onValueChange={setViewMode} className="w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Barbearias Próximas</h2>
              <TabsList>
                <TabsTrigger value="lista">Lista</TabsTrigger>
                <TabsTrigger value="mapa">Mapa</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="lista" className="space-y-4">
              <BarberShopList shops={filteredShops} />
            </TabsContent>

            <TabsContent value="mapa">
              <BarberShopMap shops={filteredShops} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Seção de barbearias recentes ou favoritas */}
        <RecentBarberShops shops={mockBarberShops} />
      </div>
    </ClientLayout>
  );
};

export default ClientHome;
