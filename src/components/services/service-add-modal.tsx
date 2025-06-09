import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ServiceAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ServiceAddModal({ isOpen, onClose, onSuccess }: ServiceAddModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado.");
        return;
      }

      // Primeiro, buscar a barbearia do usuário
      const { data: barbershops, error: barbershopError } = await supabase
        .from('barbershops')
        .select('id')
        .eq('owner_id', user.id);

      if (barbershopError) {
        toast.error("Erro ao buscar barbearia.");
        console.error("Error fetching barbershop:", barbershopError);
        return;
      }

      if (!barbershops || barbershops.length === 0) {
        toast.error("Nenhuma barbearia encontrada para este usuário.");
        return;
      }

      // Usar a primeira barbearia encontrada
      const barbershopId = barbershops[0].id;

      const { error } = await supabase
        .from('services')
        .insert({
          barbershop_id: barbershopId,
          name,
          description: description || null,
          price: parseFloat(price),
          duration_minutes: parseInt(duration),
          is_active: true
        });

      if (error) throw error;

      toast.success('Serviço adicionado com sucesso!');
      onSuccess();
      onClose();
      
      // Limpar o formulário
      setName("");
      setDescription("");
      setPrice("");
      setDuration("");
    } catch (error: any) {
      console.error('Error adding service:', error);
      toast.error(error.message || 'Erro ao adicionar serviço');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Serviço</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Serviço</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o serviço..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adicionando...' : 'Adicionar Serviço'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
