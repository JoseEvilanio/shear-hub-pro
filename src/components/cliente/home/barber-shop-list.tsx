
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin } from "lucide-react";

interface BarberShop {
  id: number;
  name: string;
  address: string;
  distance: number;
  rating: number;
  image: string;
  openTime: string;
  closeTime: string;
  services: string[];
  priceRange: string;
}

interface BarberShopListProps {
  shops: BarberShop[];
}

export function BarberShopList({ shops }: BarberShopListProps) {
  if (shops.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Nenhuma barbearia encontrada com estes filtros</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {shops.map((shop) => (
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
      ))}
    </div>
  );
}
