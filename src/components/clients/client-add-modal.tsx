
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { User, Upload } from "lucide-react";

interface ClientAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClientAddModal({ isOpen, onClose }: ClientAddModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    preferredBarber: "",
    notes: "",
  });
  const [avatar, setAvatar] = useState<string | null>(null);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically make an API call to save the client
    toast({
      title: "Cliente adicionado",
      description: "O cliente foi cadastrado com sucesso.",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Adicionar Novo Cliente</DialogTitle>
          <DialogDescription>
            Preencha os dados do novo cliente abaixo.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                {avatar ? (
                  <AvatarImage src={avatar} alt="Preview" />
                ) : (
                  <AvatarFallback className="bg-muted">
                    <User size={40} />
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="absolute -bottom-2 -right-2">
                <Label htmlFor="avatar" className="cursor-pointer">
                  <div className="bg-barber-gold h-8 w-8 rounded-full flex items-center justify-center text-white">
                    <Upload size={16} />
                  </div>
                </Label>
                <Input 
                  id="avatar" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                  className="hidden" 
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo*</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="Nome do cliente" 
                value={formData.name} 
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email"
                  placeholder="email@exemplo.com" 
                  value={formData.email} 
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Celular*</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  placeholder="(00) 00000-0000" 
                  value={formData.phone} 
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="preferredBarber">Barbeiro preferido</Label>
              <Select 
                value={formData.preferredBarber} 
                onValueChange={(value) => handleSelectChange("preferredBarber", value)}
              >
                <SelectTrigger id="preferredBarber">
                  <SelectValue placeholder="Selecione um barbeiro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="carlos">Carlos Eduardo</SelectItem>
                  <SelectItem value="andre">André Santos</SelectItem>
                  <SelectItem value="marcos">Marcos Paulo</SelectItem>
                  <SelectItem value="joao">João Victor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea 
                id="notes" 
                name="notes" 
                placeholder="Preferências, histórico ou outras informações importantes" 
                value={formData.notes} 
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-barber-gold hover:bg-barber-gold/80">
              Adicionar Cliente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
