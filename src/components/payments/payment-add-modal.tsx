
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
<<<<<<< HEAD
import { Tooltip, TooltipTrigger, TooltipContent }
from "@/components/ui/tooltip";

export function PaymentAddModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [saving, setSaving] = useState(false);
=======
import { supabase } from "@/integrations/supabase/client"; // Import supabase

export function PaymentAddModal() {
  const [open, setOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [service, setService] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [isLoading, setIsLoading] = useState(false); // Add loading state
>>>>>>> ab7eed0437afa7e93ad5d147cb871cafd9e28691

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
<<<<<<< HEAD
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
=======
    setIsLoading(true);

    // Validation
    if (!clientName || !service || !amount || !paymentMethod) {
      toast.error("Por favor, preencha todos os campos");
      setIsLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado para registrar um pagamento.");
        setIsLoading(false);
        return;
      }
      const user_id = user.id;
      // TODO: In a real application, fetch the actual barbershop_id based on the logged-in user's profile/role.
      // For instance, if a user is an owner of a barbershop, their profile might link to a barbershops table.
      const barbershop_id = 'mock_barbershop_id'; // Placeholder - replace with actual logic

      const paymentData = {
        client_name: clientName,
        service_name: service,
        amount: parseFloat(amount),
        payment_method: paymentMethod,
        user_id: user_id, // ID of the user who recorded the payment
        barbershop_id: barbershop_id, // ID of the barbershop receiving payment
        // created_at will be set by default by Supabase
      };

      const { error } = await supabase.from('payments').insert([paymentData]);

      if (error) {
        toast.error(error.message || "Erro ao registrar pagamento.");
        console.error("Error inserting payment:", error);
      } else {
        toast.success("Pagamento registrado com sucesso!");
        setOpen(false);
        // Reset form
        setClientName("");
        setService("");
        setAmount("");
        setPaymentMethod("credit");
      }
    } catch (error: any) {
      toast.error("Ocorreu um erro inesperado.");
      console.error("Unexpected error in handleSubmit:", error);
    } finally {
      setIsLoading(false);
    }
>>>>>>> ab7eed0437afa7e93ad5d147cb871cafd9e28691
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
