
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { History, Trophy, User, Trash2 } from "lucide-react";

interface ClientCardViewProps {
  clients: any[];
  onOpenHistory: (client: any) => void;
  onEdit: (client: any) => void;
  onDelete: (client: any) => void;
}

export function ClientCardView({ clients, onOpenHistory, onEdit, onDelete }: ClientCardViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {clients.map(client => (
        <Card 
          key={client.id} 
          className={`overflow-hidden transition-all ${
            client.status === "inactive" ? "opacity-70" : ""
          }`}
        >
          <CardHeader className="relative p-0">
            <div className="h-24 bg-gradient-to-r from-barber-gold/30 to-barber-gold/10"></div>
            <div className="absolute -bottom-10 left-4">
              <Avatar className="h-16 w-16 border-4 border-background">
                <AvatarImage src={client.avatar} alt={client.name} />
                <AvatarFallback className="bg-barber-gold text-white text-xl">
                  {client.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </CardHeader>
          <CardContent className="pt-12 pb-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-lg">{client.name}</h3>
                <p className="text-sm text-muted-foreground">{client.email}</p>
                <p className="text-sm text-muted-foreground">{client.phone}</p>
              </div>
              <Badge 
                className={client.status === "active" 
                  ? "bg-emerald-500 hover:bg-emerald-600" 
                  : "bg-gray-500 hover:bg-gray-600"}
              >
                {client.status === "active" ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center gap-2 text-sm">
                <User size={14} className="text-barber-gold" />
                <span>Barbeiro: {client.preferredBarber}</span>
              </div>
              <div className="flex items-center gap-2 text-sm mt-1">
                <History size={14} className="text-barber-gold" />
                <span>Última visita: {new Date(client.lastVisit).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4 p-2 bg-muted rounded-md">
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-barber-gold" />
                <span className="text-sm font-medium">Pontos de fidelidade</span>
              </div>
              <span className="font-bold">{client.loyaltyPoints}</span>
            </div>
            
            {client.notes && (
              <div className="mt-3 p-2 bg-muted/50 rounded-md text-xs italic">
                <p className="line-clamp-2">{client.notes}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between pt-0 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 gap-1"
              onClick={() => onOpenHistory(client)}
            >
              <History size={14} />
              Histórico
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 gap-1"
              onClick={() => onEdit(client)}
            >
              <User size={14} />
              Editar
            </Button>
            <Button 
              variant="outline"
              size="sm"
              className="text-red-500 w-9 p-0 flex-none"
              onClick={() => onDelete(client)}
            >
              <Trash2 size={14} />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
