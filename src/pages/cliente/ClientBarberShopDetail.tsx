import { useState } from "react";
import { useParams, Link } from "react-router-dom";
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
                  <Link to={`/cliente/agenda/${barberShop.id}`}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Agendar Horário
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{barberShop.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Aberto das {barberShop.openTime} às {barberShop.closeTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{barberShop.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-muted-foreground" />
                  <span>{barberShop.instagram}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:w-1/3 space-y-6">
          {/* Card de avaliações */}
          <Card>
            <CardHeader>
              <CardTitle>Avaliações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {barberShop.reviews.map((review) => (
                  <div key={review.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-barber-gold">
                            {review.author.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{review.author}</p>
                          <p className="text-sm text-muted-foreground">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="ml-1">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Card de comodidades */}
          <Card>
            <CardHeader>
              <CardTitle>Comodidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {barberShop.amenities.map((amenity) => (
                  <Badge key={amenity} variant="secondary">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs de serviços e barbeiros */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="servicos">Serviços</TabsTrigger>
              <TabsTrigger value="barbeiros">Barbeiros</TabsTrigger>
            </TabsList>

            <TabsContent value="servicos" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {mockServices.map((service) => (
                  <Card key={service.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{service.name}</h3>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        </div>
                        <span className="font-medium">R$ {service.price.toFixed(2)}</span>
                      </div>
                      <div className="mt-4">
                        <span className="text-sm text-muted-foreground">{service.duration} min</span>
                      </div>
                    </CardContent>
                  </Card>
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
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientBarberShopDetail;
