
import { MapPin, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BarberShopCardProps {
  shop: {
    id: number;
    name: string;
    address: string;
    distance: number;
    rating: number;
    image: string;
    openTime: string;
    closeTime: string;
  };
  selected: boolean;
  onSelect: () => void;
}

export function BarberShopCard({ shop, selected, onSelect }: BarberShopCardProps) {
  return (
    <div 
      className={`border rounded-lg overflow-hidden transition-all ${
        selected ? "border-barber-gold ring-1 ring-barber-gold" : "hover:border-barber-gold/50"
      }`}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Imagem ou avatar da barbearia */}
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
          
          <div className="flex items-center text-sm mt-1 text-muted-foreground">
            <Clock size={14} className="mr-1" />
            <span>Aberto: {shop.openTime} - {shop.closeTime}</span>
          </div>
          
          <div className="mt-2 p-1 px-2 bg-barber-gold/10 text-barber-gold rounded-md inline-block text-sm">
            {shop.distance} km de distância
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button 
              variant={selected ? "default" : "outline"}
              className={selected ? "bg-barber-gold hover:bg-barber-gold/90" : ""}
              onClick={onSelect}
            >
              {selected ? "Selecionada" : "Selecionar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
