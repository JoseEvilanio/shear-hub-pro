
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  useLocation: boolean;
  setUseLocation: (use: boolean) => void;
  priceRange: string[];
  setPriceRange: (range: string[]) => void;
  minRating: number;
  setMinRating: (rating: number) => void;
  maxDistance: number;
  setMaxDistance: (distance: number) => void;
  selectedServices: string[];
  setSelectedServices: (services: string[]) => void;
  availableServices: string[];
}

import { Star, MapPin } from "lucide-react";

export function SearchBar({
  searchTerm,
  setSearchTerm,
  useLocation,
  setUseLocation,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
  maxDistance,
  setMaxDistance,
  selectedServices,
  setSelectedServices,
  availableServices
}: SearchBarProps) {
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const toggleService = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter(s => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  return (
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
                              setPriceRange(priceRange.filter(p => p !== range));
                            } else if (!priceRange.includes(range)) {
                              setPriceRange([...priceRange, range]);
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
  );
}
