
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { User, Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface ClientEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: any | null;
}

export function ClientEditModal({ isOpen, onClose, client }: ClientEditModalProps) {
  const [formData, setFormData] = useState({
    name: client?.name || "",
    email: client?.email || "",
    phone: client?.phone || "",
    preferredBarber: client?.preferredBarber || "",
    notes: client?.notes || "",
    status: client?.status === "active" ? true : false,
  });
  const [avatar, setAvatar] = useState<string | null>(client?.avatar || null);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, status: checked }));
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
    // Here you would typically make an API call to update the client
    toast({
      title: "Cliente atualizado",
      description: "As informações do cliente foram atualizadas com sucesso.",
    });
    onClose();
  };

  if (!client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Editar Cliente</DialogTitle>
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
                <Label htmlFor="avatar-edit" className="cursor-pointer">
                  <div className="bg-barber-gold h-8 w-8 rounded-full flex items-center justify-center text-white">
                    <Upload size={16} />
                  </div>
                </Label>
                <Input 
                  id="avatar-edit" 
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
                  <SelectItem value="Carlos Eduardo">Carlos Eduardo</SelectItem>
                  <SelectItem value="André Santos">André Santos</SelectItem>
                  <SelectItem value="Marcos Paulo">Marcos Paulo</SelectItem>
                  <SelectItem value="João Victor">João Victor</SelectItem>
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

            <div className="flex items-center space-x-2 pt-2">
              <Switch 
                id="status" 
                checked={formData.status}
                onCheckedChange={handleStatusChange}
              />
              <Label htmlFor="status">Cliente ativo</Label>
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-barber-gold hover:bg-barber-gold/80">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
