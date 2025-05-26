
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  MapPin, 
  Search, 
  Filter, 
  Star, 
  Scissors, 
  ArrowRight,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

// Mock data para barbearias
const mockBarberShops = [
  {
    id: 1,
    name: "Barbearia Vintage",
    address: "Rua Augusta, 1200, São Paulo",
    distance: 1.2,
    rating: 4.8,
    reviewCount: 128,
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
    reviewCount: 97,
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
    reviewCount: 112,
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
    reviewCount: 85,
    image: "",
    openTime: "09:00",
    closeTime: "19:00",
    services: ["Corte", "Tratamento"],
    priceRange: "médio"
  },
  {
    id: 5,
    name: "Gillete Premium",
    address: "Rua da Consolação, 1500, São Paulo",
    distance: 2.3,
    rating: 4.4,
    reviewCount: 76,
    image: "",
    openTime: "09:00",
    closeTime: "20:30",
    services: ["Corte", "Barba", "Massagem"],
    priceRange: "alto"
  },
  {
    id: 6,
    name: "Barber Shop Classic",
    address: "Alameda Santos, 700, São Paulo",
    distance: 3.5,
    rating: 4.9,
    reviewCount: 145,
    image: "",
    openTime: "10:00",
    closeTime: "22:00",
    services: ["Corte", "Barba", "Degradê", "Coloração"],
    priceRange: "médio"
  }
];

// Lista de todos os serviços disponíveis
const availableServices = ["Corte", "Barba", "Degradê", "Coloração", "Tratamento", "Hidratação", "Massagem"];

// Lista de faixas de preço
const priceRangeOptions = ["baixo", "médio", "alto"];

const ClientBarberShops = () => {
  const [viewMode, setViewMode] = useState("lista");
  const [searchTerm, setSearchTerm] = useState("");
  const [useLocation, setUseLocation] = useState(true);
  const [priceRange, setPriceRange] = useState<string[]>(["baixo", "médio", "alto"]);
  const [minRating, setMinRating] = useState(0);
  const [maxDistance, setMaxDistance] = useState(5);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [filteredShops, setFilteredShops] = useState(mockBarberShops);
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  
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
                             selectedServices.some(service => shop.services.includes(service));
      
      return matchesSearch && matchesPrice && matchesRating && matchesDistance && matchesServices;
    });
    
    setFilteredShops(filtered);
  }, [searchTerm, priceRange, minRating, maxDistance, selectedServices]);
  
  // Função para alternar seleção de serviço
  const toggleService = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };
  
  // Função para alternar seleção de faixa de preço
  const togglePriceRange = (range: string) => {
    setPriceRange(prev => 
      prev.includes(range)
        ? prev.filter(r => r !== range)
        : [...prev, range]
    );
  };
  
  // Simula conseguir a localização do usuário
  useEffect(() => {
    if (useLocation) {
      console.log("Obtendo localização do usuário...");
    }
  }, [useLocation]);

  return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Barbearias</h1>
            <p className="text-muted-foreground">
              Encontre as melhores barbearias para agendar seu corte
            </p>
          </div>
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
                  checked={showMap}
                  onCheckedChange={setShowMap}
                  id="show-map"
                />
                <Label htmlFor="show-map">Ver no mapa</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exibição das barbearias */}
        <div>
          <Tabs defaultValue="lista" value={viewMode} onValueChange={setViewMode}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {filteredShops.length} de {mockBarberShops.length} barbearias
              </div>
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
                            <span className="text-xs text-muted-foreground ml-1">({shop.reviewCount})</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm mt-2 text-muted-foreground">
                          <MapPin size={14} className="mr-1" />
                          <span>{shop.address}</span>
                        </div>
                        
                        <div className="flex items-center text-sm mt-1 text-muted-foreground">
                          <Clock size={14} className="mr-1" />
                          <span>Aberto: {shop.openTime} - {shop.closeTime}</span>
                        </div>
                        
                        <div className="mt-2">
                          {shop.services.map((service) => (
                            <Badge key={service} variant="outline" className="mr-1">
                              {service}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex justify-between items-center mt-4">
                          <div className="p-1 px-2 bg-barber-gold/10 text-barber-gold rounded-md inline-block text-sm">
                            {shop.distance} km de distância
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              asChild
                            >
                              <Link to={`/cliente/barbearia/${shop.id}`}>
                                Detalhes
                              </Link>
                            </Button>
                            
                            <Button 
                              size="sm"
                              className="bg-barber-gold hover:bg-barber-gold/90"
                              asChild
                            >
                              <Link to={`/cliente/agendar/${shop.id}`}>
                                Agendar
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="rounded-full bg-muted p-4 mb-4">
                      <Scissors className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">Nenhuma barbearia encontrada</h3>
                    <p className="text-sm text-muted-foreground text-center mt-1 max-w-sm">
                      Tente ajustar seus filtros ou buscar em uma área mais ampla.
                    </p>
                    <Button 
                      className="mt-6"
                      onClick={() => {
                        setMinRating(0);
                        setMaxDistance(5);
                        setPriceRange(["baixo", "médio", "alto"]);
                        setSelectedServices([]);
                        setSearchTerm("");
                      }}
                    >
                      Limpar filtros
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="mapa">
              <Card className="p-0 overflow-hidden">
                <div className="relative w-full h-[600px] bg-muted/30 rounded-md overflow-hidden">
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
                    const left =  20 + Math.random() * 60;
                    const top = 20 + Math.random() * 60;
                    
                    return (
                      <div 
                        key={shop.id}
                        className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group"
                        style={{ top: `${top}%`, left: `${left}%` }}
                      >
                        <Link to={`/cliente/barbearia/${shop.id}`}>
                          <div className="bg-barber-gold text-white rounded-full p-1 shadow-lg hover:scale-110 transition">
                            <MapPin size={24} />
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-background border border-border px-2 py-1 rounded text-xs whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                            {shop.name} - {shop.rating} ⭐
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
  );
};

export default ClientBarberShops;
