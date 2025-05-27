
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client"; // Import supabase
import { toast } from "sonner"; // Import toast

// Define an interface for the Service data consistent with parent page
interface Service {
  id: string;
  name: string;
  description?: string | null;
  duration: number;
  price: number;
  category?: string | null;
  user_id?: string;
  barbershop_id?: string | null;
}
interface ServiceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null; // Allow service to be null initially
  onServiceUpdated: () => void; // Prop to refresh service list
}

export const ServiceEditModal = ({ isOpen, onClose, service, onServiceUpdated }: ServiceEditModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (service) {
      setName(service.name || "");
      setDescription(service.description || "");
      setDuration(service.duration?.toString() || "");
      setPrice(service.price?.toString() || "");
      setCategory(service.category || "");
    } else {
      // Reset form if service is null (e.g., when modal is closed and re-opened without a service)
      setName("");
      setDescription("");
      setDuration("");
      setPrice("");
      setCategory("");
    }
  }, [service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!service || !service.id) {
      toast.error("Serviço inválido para atualização.");
      setIsLoading(false);
      return;
    }
    
    if (!name || !duration || !price) {
      toast.error("Nome, duração e preço são campos obrigatórios.");
      setIsLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado para atualizar um serviço.");
        setIsLoading(false);
        return;
      }
      const userId = user.id;

      const serviceData = {
        name,
        description,
        duration: parseInt(duration, 10),
        price: parseFloat(price),
        category: category || null,
        // user_id and barbershop_id are typically not updated here,
        // they are properties of the service linked upon creation.
        // If they need to be updatable, they should be part of the form.
      };

      const { error } = await supabase
        .from('services')
        .update(serviceData)
        .eq('id', service.id)
        .eq('user_id', userId); // Ensure user can only update their own services

      if (error) {
        toast.error(error.message || "Erro ao atualizar serviço.");
        console.error("Error updating service:", error);
      } else {
        toast.success("Serviço atualizado com sucesso!");
        onServiceUpdated(); // Refresh the list in the parent component
        onClose(); // Close the modal
      }
    } catch (error: any) {
      toast.error("Ocorreu um erro inesperado.");
      console.error("Unexpected error in handleSubmit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !service) return null; // Keep modal closed if no service or not open

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Serviço</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome do Serviço</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Corte de Cabelo"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o serviço"
                // Description might not be strictly required
                disabled={isLoading}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duração (minutos)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Ex: 30"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-price">Preço (R$)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Ex: 35.00"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-category">Categoria</Label>
              <Input
                id="edit-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Cabelo, Barba, Tratamento"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
            <Button type="submit" className="bg-barber-gold hover:bg-barber-gold/80" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
