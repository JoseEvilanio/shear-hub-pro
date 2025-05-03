
import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";

interface BookingMapProps {
  shops: any[];
  onSelectShop: (shop: any) => void;
}

export function BookingMap({ shops, onSelectShop }: BookingMapProps) {
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    // Em uma implementação real, aqui carregaríamos uma biblioteca de mapa como Google Maps ou Mapbox
    const timer = setTimeout(() => {
      setIsMapLoaded(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-[400px] bg-muted/30 rounded-md overflow-hidden">
      {!isMapLoaded ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Carregando mapa...</p>
        </div>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-muted/10 to-muted/30">
            {/* Em uma aplicação real, aqui teríamos o componente de mapa */}
            <div className="h-full w-full flex items-center justify-center">
              <p className="text-muted-foreground text-center px-4">
                Para visualização real do mapa, seria utilizada uma API como Google Maps ou Mapbox.
                <br />
                <span className="text-xs mt-2 block">
                  Os pontos abaixo representam as barbearias na sua região
                </span>
              </p>
            </div>
          </div>

          {/* Marcadores para as barbearias */}
          {shops.map((shop) => {
            // Posições aleatórias apenas para simular o mapa
            const left = 20 + Math.random() * 60;
            const top = 20 + Math.random() * 60;
            
            return (
              <div 
                key={shop.id}
                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                style={{ top: `${top}%`, left: `${left}%` }}
                onClick={() => onSelectShop(shop)}
              >
                <div className="bg-barber-gold text-white rounded-full p-1 shadow-lg hover:scale-110 transition">
                  <MapPin size={24} />
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-background border border-border px-2 py-1 rounded text-xs whitespace-nowrap shadow-md">
                  {shop.name}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
