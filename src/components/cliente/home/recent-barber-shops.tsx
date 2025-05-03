
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Scissors } from "lucide-react";

interface BarberShop {
  id: number;
  name: string;
  address: string;
  distance: number;
  rating: number;
  image: string;
}

interface RecentBarberShopsProps {
  shops: BarberShop[];
}

export function RecentBarberShops({ shops }: RecentBarberShopsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Visitadas Recentemente</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {shops.slice(0, 3).map((shop) => (
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
  );
}
