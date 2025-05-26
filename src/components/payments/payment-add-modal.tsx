
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
import { supabase } from "@/integrations/supabase/client"; // Import supabase

export function PaymentAddModal() {
  const [open, setOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [service, setService] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-barber-gold hover:bg-barber-gold/80">
          <DollarSign className="mr-2 h-4 w-4" />
          Novo Pagamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
          <DialogDescription>
            Adicione os detalhes do pagamento abaixo
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client">Cliente</Label>
            <Input
              id="client"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Nome do cliente"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="service">Serviço</Label>
            <Input
              id="service"
              value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder="Nome do serviço"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Método de Pagamento</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit">Cartão de Crédito</SelectItem>
                <SelectItem value="cash">Dinheiro</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="debit">Cartão de Débito</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-barber-gold hover:bg-barber-gold/80" type="submit">
              Registrar Pagamento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
