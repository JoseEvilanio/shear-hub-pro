
import { useState, useEffect } from "react";
import { ClientLayout } from "@/components/layout/client-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { MapPin, Search, Star, Filter, Scissors } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data para barbearias
const mockBarberShops = [
  {
    id: 1,
    name: "Barbearia Vintage",
    address: "Rua Augusta, 1200, São Paulo",
    distance: 1.2,
    rating: 4.8,
    image: "",
    openTime: "09:00",
    closeTime: "20:00",
    services: ["Corte", "Barba", "Degradê"],
    priceRange: "médio"
  },
  {
    id: 2,
    name: "Corte & Estilo",
    address: "Av. Paulista, 800, São Paulo",
    distance: 2.5,
    rating: 4.5,
    image: "",
    openTime: "10:00",
    closeTime: "19:00",
    services: ["Corte", "Barba", "Coloração"],
    priceRange: "alto"
  },
  {
    id: 3,
    name: "Barba & Cabelo",
    address: "Rua Oscar Freire, 500, São Paulo",
    distance: 3.1,
    rating: 4.7,
    image: "",
    openTime: "08:00",
    closeTime: "21:00",
    services: ["Corte", "Barba", "Tratamento"],
    priceRange: "baixo"
  },
  {
    id: 4,
    name: "Barbearia Moderna",
    address: "Av. Rebouças, 1000, São Paulo",
    distance: 1.8,
    rating: 4.6,
    image: "",
    openTime: "09:00",
    closeTime: "19:00",
    services: ["Corte", "Tratamento"],
    priceRange: "médio"
  }
];

const ClientHome = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("mapa");
  const [useLocation, setUseLocation] = useState(true);
  const [priceRange, setPriceRange] = useState(["baixo", "médio", "alto"]);
  const [minRating, setMinRating] = useState(0);
  const [maxDistance, setMaxDistance] = useState(5);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [filteredShops, setFilteredShops] = useState(mockBarberShops);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

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

  // Lista de todos os serviços disponíveis
  const availableServices = ["Corte", "Barba", "Degradê", "Coloração", "Tratamento", "Hidratação"];

  const toggleService = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Buscar barbearias</CardTitle>
            <CardDescription>
              Encontre o melhor lugar para seu corte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nome ou endereço..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="location-toggle"
                  checked={useLocation}
                  onCheckedChange={setUseLocation}
                />
                <Label htmlFor="location-toggle">Usar minha localização</Label>
              </div>

              <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex gap-2 whitespace-nowrap"
                  >
                    <Filter className="h-4 w-4" /> Filtros
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <h3 className="font-bold text-lg mb-4">Filtros</h3>
                  
                  <div className="space-y-6">
                    {/* Filtros de barbearia */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nota mínima</Label>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <Slider 
                            value={[minRating]} 
                            min={0} 
                            max={5} 
                            step={0.5} 
                            onValueChange={(val) => setMinRating(val[0])} 
                            className="flex-1"
                          />
                          <span className="w-8 text-center">{minRating}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Distância máxima (km)</Label>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <Slider 
                            value={[maxDistance]} 
                            min={1} 
                            max={15} 
                            step={0.5} 
                            onValueChange={(val) => setMaxDistance(val[0])} 
                            className="flex-1"
                          />
                          <span className="w-8 text-center">{maxDistance}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Faixa de preço</Label>
                        <div className="flex flex-wrap gap-2">
                          {["baixo", "médio", "alto"].map((range) => (
                            <Badge 
                              key={range}
                              variant={priceRange.includes(range) ? "default" : "outline"}
                              className={`cursor-pointer ${priceRange.includes(range) ? "bg-barber-gold hover:bg-barber-gold/80" : ""}`}
                              onClick={() => {
                                if (priceRange.includes(range) && priceRange.length > 1) {
                                  setPriceRange(prev => prev.filter(p => p !== range));
                                } else if (!priceRange.includes(range)) {
                                  setPriceRange(prev => [...prev, range]);
                                }
                              }}
                            >
                              {range === "baixo" ? "Econômico" : range === "médio" ? "Médio" : "Premium"}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Serviços</Label>
                        <div className="flex flex-wrap gap-2">
                          {availableServices.map((service) => (
                            <Badge 
                              key={service}
                              variant={selectedServices.includes(service) ? "default" : "outline"}
                              className={`cursor-pointer ${selectedServices.includes(service) ? "bg-barber-gold hover:bg-barber-gold/80" : ""}`}
                              onClick={() => toggleService(service)}
                            >
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setMinRating(0);
                          setMaxDistance(5);
                          setPriceRange(["baixo", "médio", "alto"]);
                          setSelectedServices([]);
                          setIsFilterSheetOpen(false);
                        }}
                      >
                        Limpar
                      </Button>
                      <Button 
                        className="bg-barber-gold hover:bg-barber-gold/90"
                        onClick={() => setIsFilterSheetOpen(false)}
                      >
                        Aplicar Filtros
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </CardContent>
        </Card>

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
              {filteredShops.length > 0 ? (
                filteredShops.map((shop) => (
                  <Card key={shop.id} className="overflow-hidden">
                    <div className="flex flex-col sm:flex-row border-0">
                      {/* Imagem da barbearia */}
                      <div className="h-40 sm:h-auto sm:w-36 bg-muted flex items-center justify-center">
                        {shop.image ? (
                          <img src={shop.image} alt={shop.name} className="object-cover w-full h-full" />
                        ) : (
                          <div className="text-4xl font-bold text-muted-foreground">
                            {shop.name.substring(0, 1).toUpperCase()}
                          </div>
                        )}
                      </div>
                      
                      {/* Informações da barbearia */}
                      <div className="p-4 flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-lg">{shop.name}</h3>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 mr-1 fill-yellow-400" />
                            <span className="font-medium">{shop.rating}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm mt-2 text-muted-foreground">
                          <MapPin size={14} className="mr-1" />
                          <span>{shop.address}</span>
                        </div>
                        
                        <div className="mt-2">
                          {shop.services.map((service) => (
                            <Badge key={service} variant="outline" className="mr-1">
                              {service}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="mt-2 p-1 px-2 bg-barber-gold/10 text-barber-gold rounded-md inline-block text-sm">
                          {shop.distance} km de distância
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          <Button 
                            asChild
                            className="bg-barber-gold hover:bg-barber-gold/90"
                          >
                            <Link to={`/cliente/barbearia/${shop.id}`}>
                              Ver Detalhes
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">Nenhuma barbearia encontrada com estes filtros</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="mapa">
              <Card className="p-0 overflow-hidden">
                <div className="relative w-full h-[500px] bg-muted/30 rounded-md overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-muted/10 to-muted/30">
                    <div className="h-full w-full flex items-center justify-center">
                      <p className="text-muted-foreground text-center px-4">
                        Aqui seria exibido um mapa interativo com as barbearias próximas.
                        <br />
                        <span className="text-xs mt-2 block">
                          (Em uma implementação real seria utilizado Google Maps, MapBox ou outra API de mapas)
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Marcadores simulados no mapa */}
                  {filteredShops.map((shop) => {
                    // Posições aleatórias para simular
                    const left = 20 + Math.random() * 60;
                    const top = 20 + Math.random() * 60;
                    
                    return (
                      <Link 
                        key={shop.id}
                        to={`/cliente/barbearia/${shop.id}`}
                        className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                        style={{ top: `${top}%`, left: `${left}%` }}
                      >
                        <div className="bg-barber-gold text-white rounded-full p-1 shadow-lg hover:scale-110 transition">
                          <MapPin size={24} />
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-background border border-border px-2 py-1 rounded text-xs whitespace-nowrap shadow-md">
                          {shop.name}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Seção de barbearias recentes ou favoritas */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Visitadas Recentemente</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockBarberShops.slice(0, 3).map((shop) => (
              <Card key={shop.id} className="overflow-hidden">
                <div className="h-32 bg-muted relative">
                  {shop.image ? (
                    <img src={shop.image} alt={shop.name} className="object-cover w-full h-full" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Scissors className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-background rounded-md px-2 py-1 text-xs font-medium flex items-center">
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 mr-1" />
                    {shop.rating}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{shop.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{shop.address}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-barber-gold">{shop.distance} km</span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/cliente/barbearia/${shop.id}`}>
                        Visitar
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ClientHome;
