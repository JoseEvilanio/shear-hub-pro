
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";

interface LoyaltyProgramAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoyaltyProgramAddModal = ({ isOpen, onClose }: LoyaltyProgramAddModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rule, setRule] = useState("");
  const [isActive, setIsActive] = useState(true);
  
  const [rewards, setRewards] = useState([
    { name: "", description: "", points: "" }
  ]);

  const addReward = () => {
    setRewards([...rewards, { name: "", description: "", points: "" }]);
  };

  const updateReward = (index: number, field: string, value: string) => {
    const newRewards = [...rewards];
    newRewards[index] = { ...newRewards[index], [field]: value };
    setRewards(newRewards);
  };

  const removeReward = (index: number) => {
    if (rewards.length > 1) {
      const newRewards = [...rewards];
      newRewards.splice(index, 1);
      setRewards(newRewards);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Implement program add logic here
    console.log("Adding loyalty program:", { 
      name, 
      description, 
      rule, 
      status: isActive ? "active" : "inactive",
      rewards
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Novo Programa de Fidelidade</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Programa</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Clube de Pontos"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o programa de fidelidade"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rule">Regra de Pontuação</Label>
              <Input
                id="rule"
                value={rule}
                onChange={(e) => setRule(e.target.value)}
                placeholder="Ex: Cada R$10 = 1 ponto"
                required
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="active" 
                checked={isActive} 
                onCheckedChange={setIsActive} 
              />
              <Label htmlFor="active">Programa Ativo</Label>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Recompensas</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addReward}
                >
                  Adicionar Recompensa
                </Button>
              </div>
              
              {rewards.map((reward, index) => (
                <div key={index} className="space-y-3 p-4 border rounded-md">
                  <div className="space-y-2">
                    <Label htmlFor={`reward-name-${index}`}>Nome da Recompensa</Label>
                    <Input
                      id={`reward-name-${index}`}
                      value={reward.name}
                      onChange={(e) => updateReward(index, "name", e.target.value)}
                      placeholder="Ex: Corte Grátis"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`reward-description-${index}`}>Descrição</Label>
                    <Input
                      id={`reward-description-${index}`}
                      value={reward.description}
                      onChange={(e) => updateReward(index, "description", e.target.value)}
                      placeholder="Descreva a recompensa"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="space-y-2 flex-1">
                      <Label htmlFor={`reward-points-${index}`}>Pontos Necessários</Label>
                      <Input
                        id={`reward-points-${index}`}
                        type="number"
                        min="1"
                        value={reward.points}
                        onChange={(e) => updateReward(index, "points", e.target.value)}
                        placeholder="Ex: 100"
                        required
                      />
                    </div>
                    
                    {rewards.length > 1 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        className="self-end text-destructive"
                        onClick={() => removeReward(index)}
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-barber-gold hover:bg-barber-gold/80">Criar Programa</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
