import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BarberShop {
  id: string;
  name: string;
  address: string;
  rating: number;
  image_url: string;
  description: string;
}

const ClientBarberShopList = () => {
  const [barberShops, setBarberShops] = useState<BarberShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchBarberShops = async () => {
      try {
        const { data, error } = await supabase
          .from('barbershops')
          .select('*')
          .order('name');

        if (error) throw error;

        setBarberShops(data || []);
      } catch (error: any) {
        toast.error(error.message || "Erro ao carregar barbearias");
      } finally {
        setLoading(false);
      }
    };

    fetchBarberShops();
  }, []);

  const filteredBarberShops = barberShops.filter((shop) =>
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Barbearias</h2>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Buscar barbearia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[300px]"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-barber-gold"></div>
        </div>
      ) : filteredBarberShops.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBarberShops.map((shop) => (
            <Card key={shop.id} className="overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={shop.image_url || "https://placehold.co/600x400"}
                  alt={shop.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <CardHeader>
                <CardTitle>{shop.name}</CardTitle>
                <CardDescription>{shop.address}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {shop.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm font-medium">{shop.rating.toFixed(1)}</span>
                  </div>
                  <Button asChild>
                    <Link to={`/cliente/barbearias/${shop.id}`}>
                      Ver Detalhes
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma barbearia encontrada
        </div>
      )}
    </div>
  );
};

export default ClientBarberShopList; 