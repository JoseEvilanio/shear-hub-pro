
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipTrigger, TooltipContent }
from "@/components/ui/tooltip";

export function PaymentAddModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardName || !expiry || !cvv) {
      toast.error("Por favor, preencha todos os campos do cartão.");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Cartão adicionado com sucesso!");
      setCardNumber("");
      setCardName("");
      setExpiry("");
      setCvv("");
      onClose();
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Cartão</DialogTitle>
          <DialogDescription>Preencha os dados do cartão para salvar um novo método de pagamento.</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardText">Nome completo do titular do cartão</Label>
            <Input
              id="cardText"
              value={cardName}
              onChange={e => setCardName(e.target.value)}
              placeholder="Como está no cartão"
              autoComplete="cc-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Número do Cartão</Label>
            <Input
              id="cardNumber"
              maxLength={19}
              value={cardNumber}
              onChange={e => setCardNumber(e.target.value.replace(/[^0-9 ]/g, ""))}
              placeholder="0000 0000 0000 0000"
              autoComplete="cc-number"
            />
          </div>
          <div className="flex gap-2 items-end">
            <div className="w-1/2">
              <Label htmlFor="expiry">Validade</Label>
              <Input
                id="expiry"
                maxLength={5}
                value={expiry}
                onChange={e => setExpiry(e.target.value.replace(/[^0-9/]/g, ""))}
                placeholder="MM/AA"
                autoComplete="cc-exp"
              />
            </div>
            <div className="w-1/2">
              <div className="flex items-center gap-1">
                <Label htmlFor="cvv">CVV</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-muted-foreground hover:text-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="8"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>O CVV é o número de 3 dígitos no verso do cartão.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="cvv"
                maxLength={4}
                value={cvv}
                onChange={e => setCvv(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="CVV"
                autoComplete="cc-csc"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" type="button" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button className="bg-barber-gold hover:bg-barber-gold/80" type="submit" disabled={saving}>
              Salvar Cartão
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
