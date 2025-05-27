
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client"; // Import supabase
import { toast } from "sonner"; // Import toast

interface ServiceAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceAdded: () => void; // Prop to refresh service list
}

export const ServiceAddModal = ({ isOpen, onClose, onServiceAdded }: ServiceAddModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!name || !duration || !price) {
      toast.error("Nome, duração e preço são campos obrigatórios.");
      setIsLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado para adicionar um serviço.");
        setIsLoading(false);
        return;
      }
      const user_id = user.id;
      // TODO: Determine how barbershop_id is linked. For now, assuming services are linked to user_id directly
      // or user_id itself represents the barbershop owner context.
      // const barbershop_id = 'get_barbershop_id_from_user_profile_or_context'; // Placeholder

      const serviceData = {
        name,
        description,
        duration: parseInt(duration, 10),
        price: parseFloat(price),
        category: category || null, // Ensure category can be null if not provided
        user_id: user_id,
        // barbershop_id: barbershop_id, // Uncomment and set if you have a barbershop_id
      };

      const { error } = await supabase.from('services').insert([serviceData]);

      if (error) {
        toast.error(error.message || "Erro ao adicionar serviço.");
        console.error("Error inserting service:", error);
      } else {
        toast.success("Serviço adicionado com sucesso!");
        onServiceAdded(); // Refresh the list in the parent component
        // Reset form fields
        setName("");
        setDescription("");
        setDuration("");
        setPrice("");
        setCategory("");
        onClose(); // Close the modal
      }
    } catch (error: any) {
      toast.error("Ocorreu um erro inesperado.");
      console.error("Unexpected error in handleSubmit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Serviço</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Serviço</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Corte de Cabelo"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o serviço"
                // Description might not be strictly required, adjust if needed
                disabled={isLoading}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duração (minutos)</Label>
                <Input
                  id="duration"
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
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
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
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
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
              {isLoading ? "Adicionando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
