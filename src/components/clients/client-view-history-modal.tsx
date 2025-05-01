
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Scissors, User } from "lucide-react";
import { mockAppointments } from "@/data/mock-clients";

interface ClientViewHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: any | null;
}

export function ClientViewHistoryModal({ isOpen, onClose, client }: ClientViewHistoryModalProps) {
  if (!client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl font-bold">Histórico do Cliente</span>
            <Badge variant="outline" className="ml-2">
              Total: {mockAppointments.length} visitas
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex items-center gap-3 mb-4 p-3 bg-muted rounded-md">
          <Avatar className="h-14 w-14 border-2 border-background">
            <AvatarImage src={client.avatar} alt={client.name} />
            <AvatarFallback className="bg-barber-gold text-white text-lg">
              {client.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold text-lg">{client.name}</h3>
            <p className="text-sm text-muted-foreground">{client.email} • {client.phone}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-barber-gold hover:bg-barber-gold/80">
                {client.loyaltyPoints} pontos
              </Badge>
            </div>
          </div>
        </div>
        
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {mockAppointments.map((appointment) => (
              <div 
                key={appointment.id} 
                className={`p-4 border rounded-md ${
                  appointment.status === 'canceled' ? 'border-red-200 bg-red-50 dark:bg-red-900/10' : 'border-muted-foreground/20'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-barber-gold" />
                    <span className="font-medium">
                      {new Date(appointment.date).toLocaleDateString('pt-BR')}
                    </span>
                    <Clock size={16} className="text-barber-gold ml-2" />
                    <span>{appointment.time}</span>
                  </div>
                  <Badge 
                    className={appointment.status === 'completed' 
                      ? 'bg-emerald-500 hover:bg-emerald-600' 
                      : 'bg-red-500 hover:bg-red-600'}
                  >
                    {appointment.status === 'completed' ? 'Concluído' : 'Cancelado'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                  <div className="flex items-center gap-2">
                    <Scissors size={16} className="text-barber-gold" />
                    <span className="text-sm">Serviço: {appointment.service}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-barber-gold" />
                    <span className="text-sm">Barbeiro: {appointment.barber}</span>
                  </div>
                </div>
                
                <div className="flex justify-between mt-3 pt-2 border-t border-muted-foreground/10">
                  <span className="text-sm text-muted-foreground">
                    Pagamento: {appointment.paymentMethod}
                  </span>
                  <span className="font-bold">
                    R$ {appointment.price.toFixed(2)}
                  </span>
                </div>
                
                {appointment.note && (
                  <div className="mt-2 pt-2 text-sm italic text-muted-foreground">
                    "{appointment.note}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
