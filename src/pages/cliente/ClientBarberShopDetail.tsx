
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ClientLayout } from "@/components/layout/client-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Star,
  Clock,
  Calendar,
  Scissors,
  Phone,
  Instagram,
  Share2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockBarbers } from "@/data/mock-barbers";
import { mockServices } from "@/data/mock-services";

// Mock data para detalhes da barbearia
const mockBarberShopDetail = {
  id: 1,
  name: "Barbearia Vintage",
  description: "Especializada em cortes clássicos e modernos, a Barbearia Vintage oferece um ambiente sofisticado com atendimento personalizado.",
  address: "Rua Augusta, 1200, São Paulo",
  distance: 1.2,
  rating: 4.8,
  totalReviews: 128,
  images: ["", "", ""],
  openTime: "09:00",
  closeTime: "20:00",
  phone: "(11) 99999-8888",
  instagram: "@barbeariavintage",
  website: "www.barbeariavintage.com.br",
  amenities: ["Wi-Fi", "Café", "TV", "Estacionamento", "Cerveja"],
  reviews: [
    {
      id: 1,
      author: "Roberto Almeida",
      avatar: "",
      rating: 5,
      date: "02/05/2025",
      comment: "Excelente atendimento e corte perfeito. Recomendo!"
    },
    {
      id: 2,
      author: "Carlos Eduardo",
      avatar: "",
      rating: 4,
      date: "30/04/2025",
      comment: "Bom serviço, mas demorou um pouco para ser atendido."
    },
    {
      id: 3,
      author: "Lucas Silva",
      avatar: "",
      rating: 5,
      date: "28/04/2025",
      comment: "Melhor barbearia da região! O Carlos fez um degradê perfeito."
    }
  ]
};

const ClientBarberShopDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("servicos");
  
  // Em uma aplicação real, faríamos uma chamada API para obter os detalhes da barbearia
  // baseado no ID da URL
  const barberShop = mockBarberShopDetail;
  
  // Filtramos os barbeiros que estão ativos
  const barbers = mockBarbers.filter(barber => barber.status === "active");

  return (
    <ClientLayout>
      <div className="space-y-6">
        {/* Header com informações básicas */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/3 space-y-6">
            {/* Imagem principal e galeria */}
            <div className="relative h-64 bg-muted rounded-lg overflow-hidden">
              <div className="h-full flex items-center justify-center">
                <Scissors className="h-16 w-16 text-muted-foreground" />
              </div>
              <div className="absolute bottom-4 right-4 flex gap-2">
                {barberShop.images.map((_, index) => (
                  <div key={index} className="w-16 h-16 bg-background/80 rounded-md flex items-center justify-center">
                    <Scissors className="h-8 w-8 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>

            {/* Informações da barbearia */}
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">{barberShop.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="font-medium">{barberShop.rating}</span>
                      </div>
                      <span className="text-muted-foreground text-sm">
                        ({barberShop.totalReviews} avaliações)
                      </span>
                    </div>
                  </div>
                  <Button 
                    asChild
                    className="bg-barber-gold hover:bg-barber-gold/90"
                  >
                    <Link to={`/cliente/agendar/${barberShop.id}`}>
                      <Calendar className="mr-2 h-4 w-4" />
                      Agendar Horário
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{barberShop.description}</p>
                
                <div className="flex flex-col sm:flex-row gap-4 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <MapPin size={14} className="mr-1" />
                    <span>{barberShop.address}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Clock size={14} className="mr-1" />
                    <span>Aberto: {barberShop.openTime} - {barberShop.closeTime}</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Phone size={14} className="mr-1" />
                    <span>{barberShop.phone}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Instagram size={14} className="mr-1" />
                    <span>{barberShop.instagram}</span>
                  </div>
                </div>
                
                <div className="pt-2">
                  <h3 className="text-sm font-medium mb-2">Comodidades:</h3>
                  <div className="flex flex-wrap gap-2">
                    {barberShop.amenities.map((amenity) => (
                      <Badge key={amenity} variant="outline">{amenity}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs para serviços, barbeiros e avaliações */}
            <Tabs defaultValue="servicos" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="servicos">Serviços</TabsTrigger>
                <TabsTrigger value="barbeiros">Barbeiros</TabsTrigger>
                <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
              </TabsList>
              
              <TabsContent value="servicos" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {mockServices.map((service) => (
                    <div 
                      key={service.id}
                      className="p-4 border rounded-md"
                    >
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">{service.description}</div>
                      <div className="flex justify-between mt-2">
                        <span className="text-sm text-muted-foreground">{service.duration} min</span>
                        <span className="font-medium">R$ {service.price.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="barbeiros" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {barbers.map((barber) => (
                    <Card key={barber.id} className="overflow-hidden">
                      <CardContent className="p-4 text-center">
                        <Avatar className="h-24 w-24 mb-4 mx-auto">
                          <AvatarImage src={barber.avatar} alt={barber.name} />
                          <AvatarFallback className="bg-barber-gold text-background">
                            {barber.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="font-medium text-lg">{barber.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{barber.specialties.join(", ")}</p>
                        <div className="mt-4">
                          {barber.bio && (
                            <p className="text-xs text-muted-foreground">{barber.bio}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="avaliacoes" className="space-y-4">
                {barberShop.reviews.map((review) => (
                  <Card key={review.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={review.avatar} alt={review.author} />
                            <AvatarFallback className="bg-muted">
                              {review.author.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{review.author}</h4>
                            <span className="text-xs text-muted-foreground">{review.date}</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-3 text-sm">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
                
                <div className="text-center">
                  <Button variant="outline">Ver mais avaliações</Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="lg:w-1/3">
            {/* Mapa */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Localização</CardTitle>
                <CardDescription>Como chegar</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-48 bg-muted flex items-center justify-center text-center p-4">
                  <div className="text-muted-foreground">
                    <MapPin className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">
                      {barberShop.address}
                      <br />
                      <span className="text-xs">
                        (Aqui seria exibido um mapa interativo)
                      </span>
                    </p>
                  </div>
                </div>
                <div className="p-4">
                  <Button variant="outline" className="w-full">
                    Traçar Rota
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Horários Disponíveis */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Horários Disponíveis</CardTitle>
                <CardDescription>Para hoje, 03/05/2025</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {["10:00", "11:30", "13:00", "14:30", "16:00", "17:30"].map((time) => (
                    <Button
                      key={time}
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link to={`/cliente/agendar/${barberShop.id}?time=${time}`}>
                        {time}
                      </Link>
                    </Button>
                  ))}
                </div>
                <Button
                  className="w-full mt-4 bg-barber-gold hover:bg-barber-gold/90"
                  asChild
                >
                  <Link to={`/cliente/agendar/${barberShop.id}`}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Ver todos horários
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            {/* Compartilhar */}
            <Card className="mt-6">
              <CardContent className="p-4">
                <Button variant="outline" className="w-full">
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartilhar barbearia
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ClientBarberShopDetail;
