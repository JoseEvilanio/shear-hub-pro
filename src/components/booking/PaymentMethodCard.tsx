
import { CreditCard, QrCode, Scissors, Wallet } from "lucide-react";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface PaymentMethodCardProps {
  form: any;
  barberShopId: string | undefined;
  isSubmitting: boolean;
}

export function PaymentMethodCard({ form, barberShopId, isSubmitting }: PaymentMethodCardProps) {
  const navigate = useNavigate();
  
  // Componente auxiliar para Label
  const Label = ({ htmlFor, children, className }: { htmlFor: string; children: React.ReactNode; className?: string }) => {
    return (
      <label
        htmlFor={htmlFor}
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          className
        )}
      >
        {children}
      </label>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Forma de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <RadioGroupItem value="na_hora" id="na_hora" />
                  <Label htmlFor="na_hora" className="flex flex-1 items-center">
                    <Scissors className="mr-2 h-5 w-5 text-muted-foreground" />
                    <div>
                      <div>Pagar na hora</div>
                      <div className="text-sm text-muted-foreground">
                        Efetue o pagamento diretamente na barbearia
                      </div>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <RadioGroupItem value="pix" id="pix" />
                  <Label htmlFor="pix" className="flex flex-1 items-center">
                    <QrCode className="mr-2 h-5 w-5 text-muted-foreground" />
                    <div>
                      <div>Pagar com PIX</div>
                      <div className="text-sm text-muted-foreground">
                        Pagamento instantâneo via QR Code
                      </div>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <RadioGroupItem value="cartao" id="cartao" />
                  <Label htmlFor="cartao" className="flex flex-1 items-center">
                    <CreditCard className="mr-2 h-5 w-5 text-muted-foreground" />
                    <div>
                      <div>Cartão de Crédito</div>
                      <div className="text-sm text-muted-foreground">
                        Pagamento seguro com cartão
                      </div>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 rounded-md border p-3 opacity-50 cursor-not-allowed">
                  <RadioGroupItem value="carteira" id="carteira" disabled />
                  <Label htmlFor="carteira" className="flex flex-1 items-center">
                    <Wallet className="mr-2 h-5 w-5 text-muted-foreground" />
                    <div>
                      <div>Saldo na Carteira</div>
                      <div className="text-sm text-muted-foreground">
                        Você não possui saldo (Em breve)
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          type="button"
          onClick={() => navigate(`/cliente/barbearia/${barberShopId}`)}
        >
          Voltar
        </Button>
        
        <Button 
          type="submit" 
          className="bg-barber-gold hover:bg-barber-gold/90" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Confirmando..." : "Confirmar Agendamento"}
        </Button>
      </CardFooter>
    </Card>
  );
}
