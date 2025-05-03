
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PopoverContent, Popover, PopoverTrigger } from "@/components/ui/popover";
import { mockBarbers } from "@/data/mock-barbers";
import { mockServices } from "@/data/mock-services";
import { MapPin, Search, Calendar as CalendarIcon, Clock, User, Filter } from "lucide-react";
import { BookingMap } from "@/components/booking/booking-map";
import { BarberShopCard } from "@/components/booking/barber-shop-card";
import { TimeSlotPicker } from "@/components/booking/time-slot-picker";

const ClientBooking = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [useLocation, setUseLocation] = useState(true);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedShop, setSelectedShop] = useState<any | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<any | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Mock data for barber shops
  const barberShops = [
    {
      id: 1,
      name: "Barbearia Vintage",
      address: "Rua Augusta, 1200, São Paulo",
      distance: 1.2,
      rating: 4.8,
      image: "",
      openTime: "09:00",
      closeTime: "20:00"
    },
    {
      id: 2,
      name: "Corte & Estilo",
      address: "Av. Paulista, 800, São Paulo",
      distance: 2.5,
      rating: 4.5,
      image: "",
      openTime: "10:00",
      closeTime: "19:00"
    },
    {
      id: 3,
      name: "Barba & Cabelo",
      address: "Rua Oscar Freire, 500, São Paulo",
      distance: 3.1,
      rating: 4.7,
      image: "",
      openTime: "08:00",
      closeTime: "21:00"
    }
  ];

  const filteredShops = barberShops.filter(shop => 
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBookingSubmit = () => {
    if (!selectedService || !selectedShop || !selectedBarber || !selectedTime || !date) {
      toast({
        title: "Informações incompletas",
        description: "Por favor, preencha todas as informações para agendar.",
        variant: "destructive"
      });
      return;
    }

    // Em uma aplicação real, aqui seria feita uma chamada API
    toast({
      title: "Agendamento realizado!",
      description: `Seu agendamento foi marcado para ${date.toLocaleDateString('pt-BR')} às ${selectedTime} com ${selectedBarber.name}.`,
    });

    // Limpar seleção
    setSelectedService(null);
    setSelectedTime(null);
    setSelectedBarber(null);
  };

  const handleShopSelect = (shop: any) => {
    setSelectedShop(shop);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Agendar Serviço</h2>
            <p className="text-muted-foreground">
              Encontre uma barbearia próxima e agende seu serviço
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Coluna de busca e mapa */}
          <Card className="flex-1 overflow-hidden">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle>Barbearias Próximas</CardTitle>
                <div className="flex items-center gap-2">
                  <Label htmlFor="location-toggle" className="text-sm">Usar minha localização</Label>
                  <Switch 
                    id="location-toggle" 
                    checked={useLocation} 
                    onCheckedChange={setUseLocation} 
                  />
                </div>
              </div>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nome ou endereço..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>

            <Tabs defaultValue="lista" className="px-6">
              <TabsList className="mb-4">
                <TabsTrigger value="lista">Lista</TabsTrigger>
                <TabsTrigger value="mapa">Mapa</TabsTrigger>
              </TabsList>
              
              <TabsContent value="lista" className="space-y-4 max-h-[500px] overflow-auto pb-4">
                {filteredShops.map(shop => (
                  <BarberShopCard 
                    key={shop.id} 
                    shop={shop} 
                    selected={selectedShop?.id === shop.id}
                    onSelect={() => handleShopSelect(shop)}
                  />
                ))}
              </TabsContent>
              
              <TabsContent value="mapa">
                <BookingMap shops={barberShops} onSelectShop={handleShopSelect} />
              </TabsContent>
            </Tabs>
          </Card>

          {/* Coluna de agendamento */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Detalhes do Agendamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedShop ? (
                <div className="bg-muted/50 p-4 rounded-md">
                  <h3 className="font-medium">{selectedShop.name}</h3>
                  <div className="flex items-center text-sm mt-1 text-muted-foreground">
                    <MapPin size={14} className="mr-1" />
                    {selectedShop.address}
                  </div>
                  <div className="text-sm mt-1 text-muted-foreground">
                    Horário: {selectedShop.openTime} - {selectedShop.closeTime}
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 bg-muted/20 rounded-md">
                  <p className="text-muted-foreground">Selecione uma barbearia para continuar</p>
                </div>
              )}

              {selectedShop && (
                <>
                  {/* Serviços */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Serviço</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {mockServices.map(service => (
                        <div 
                          key={service.id}
                          onClick={() => setSelectedService(service.name)}
                          className={`p-3 border rounded-md cursor-pointer transition-colors ${
                            selectedService === service.name 
                              ? "border-barber-gold bg-barber-gold/5" 
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <div className="font-medium">{service.name}</div>
                          <div className="flex justify-between mt-1">
                            <span className="text-sm text-muted-foreground">{service.duration} min</span>
                            <span className="font-medium">R$ {service.price.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Data */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Data</h3>
                    <div className="border rounded-md p-3">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="mx-auto"
                      />
                    </div>
                  </div>

                  {/* Horários */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Horário</h3>
                    <TimeSlotPicker 
                      selectedTime={selectedTime} 
                      onTimeSelect={setSelectedTime} 
                    />
                  </div>

                  {/* Barbeiros */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Barbeiro</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {mockBarbers
                        .filter(barber => barber.status === "active")
                        .map(barber => (
                          <div 
                            key={barber.id}
                            onClick={() => setSelectedBarber(barber)}
                            className={`p-3 border rounded-md cursor-pointer transition-colors flex flex-col items-center ${
                              selectedBarber?.id === barber.id 
                                ? "border-barber-gold bg-barber-gold/5" 
                                : "hover:bg-muted/50"
                            }`}
                          >
                            <Avatar className="h-12 w-12 mb-2">
                              <AvatarImage src={barber.avatar} alt={barber.name} />
                              <AvatarFallback className="bg-barber-gold text-white">
                                {barber.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="font-medium text-center">{barber.name}</div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-4 bg-barber-gold hover:bg-barber-gold/90"
                    onClick={handleBookingSubmit}
                  >
                    Confirmar Agendamento
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientBooking;
