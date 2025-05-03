
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";

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

interface BarberShopMapProps {
  shops: BarberShop[];
}

export function BarberShopMap({ shops }: BarberShopMapProps) {
  return (
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
        {shops.map((shop) => {
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
  );
}
