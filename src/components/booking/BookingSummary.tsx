
import { CalendarIcon, Clock, Scissors } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { mockServices } from "@/data/mock-services";
import { mockBarbers } from "@/data/mock-barbers";

interface BookingSummaryProps {
  form: any;
  barberShop: {
    id: number;
    name: string;
    address: string;
  };
}

export function BookingSummary({ form, barberShop }: BookingSummaryProps) {
  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle>Resumo do Agendamento</CardTitle>
        <CardDescription>
          Confira os detalhes antes de confirmar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barbearia */}
        <div>
          <h3 className="text-sm font-medium mb-1">Barbearia</h3>
          <div className="flex items-start gap-2">
            <Scissors className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <div className="font-medium">{barberShop.name}</div>
              <div className="text-xs text-muted-foreground">{barberShop.address}</div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Serviço */}
        <div>
          <h3 className="text-sm font-medium mb-1">Serviço Selecionado</h3>
          {form.watch("service") ? (
            <div className="flex justify-between items-center">
              <div>
                {mockServices.find(s => String(s.id) === form.watch("service"))?.name || "Nenhum serviço selecionado"}
              </div>
              <div className="font-medium">
                R$ {mockServices.find(s => String(s.id) === form.watch("service"))?.price.toFixed(2) || "0.00"}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Selecione um serviço</div>
          )}
        </div>
        
        <Separator />
        
        {/* Barbeiro */}
        <div>
          <h3 className="text-sm font-medium mb-1">Profissional</h3>
          {form.watch("barber") ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-barber-gold text-background text-xs">
                  {mockBarbers.find(b => String(b.id) === form.watch("barber"))?.name.substring(0, 2).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                {mockBarbers.find(b => String(b.id) === form.watch("barber"))?.name || "Qualquer disponível"}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Primeiro profissional disponível</div>
          )}
        </div>
        
        <Separator />
        
        {/* Data e Hora */}
        <div>
          <h3 className="text-sm font-medium mb-1">Data e Hora</h3>
          <div className="flex justify-between">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span>
                {form.watch("date") 
                  ? format(form.watch("date"), "dd/MM/yyyy", { locale: pt })
                  : "Selecione uma data"
                }
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{form.watch("time") || "Selecione um horário"}</span>
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Forma de Pagamento */}
        <div>
          <h3 className="text-sm font-medium mb-1">Pagamento</h3>
          <div>
            {form.watch("paymentMethod") === "na_hora" && "Pagamento na barbearia"}
            {form.watch("paymentMethod") === "pix" && "PIX"}
            {form.watch("paymentMethod") === "cartao" && "Cartão de Crédito"}
            {form.watch("paymentMethod") === "carteira" && "Saldo na Carteira"}
          </div>
        </div>
        
        <Separator />
        
        {/* Total */}
        <div>
          <div className="flex justify-between items-center text-lg font-medium">
            <span>Total</span>
            <span>
              R$ {form.watch("service") 
                ? mockServices.find(s => String(s.id) === form.watch("service"))?.price.toFixed(2) 
                : "0.00"
              }
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
