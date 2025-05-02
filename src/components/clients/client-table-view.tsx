
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { History, Trophy, User, Trash2 } from "lucide-react";

interface ClientTableViewProps {
  clients: any[];
  onOpenHistory: (client: any) => void;
  onEdit: (client: any) => void;
  onDelete: (client: any) => void;
  onToggleStatus: (clientId: number) => void;
}

export function ClientTableView({ 
  clients, 
  onOpenHistory, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}: ClientTableViewProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead className="text-center">Pontos</TableHead>
            <TableHead>Barbeiro</TableHead>
            <TableHead className="text-center">Visitas</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={client.avatar} alt={client.name} />
                    <AvatarFallback className="bg-barber-gold text-white">
                      {client.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Última visita: {new Date(client.lastVisit).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <p className="text-sm">{client.email}</p>
                <p className="text-sm">{client.phone}</p>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Trophy size={14} className="text-barber-gold" />
                  <span className="font-medium">{client.loyaltyPoints}</span>
                </div>
              </TableCell>
              <TableCell>{client.preferredBarber}</TableCell>
              <TableCell className="text-center">{client.totalVisits}</TableCell>
              <TableCell className="text-center">
                <Badge 
                  className={client.status === "active" 
                    ? "bg-emerald-500 hover:bg-emerald-600 cursor-pointer" 
                    : "bg-gray-500 hover:bg-gray-600 cursor-pointer"}
                  onClick={() => onToggleStatus(client.id)}
                >
                  {client.status === "active" ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onOpenHistory(client)}
                  >
                    <History size={14} />
                    <span className="sr-only">Ver histórico</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onEdit(client)}
                  >
                    <User size={14} />
                    <span className="sr-only">Editar</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500"
                    onClick={() => onDelete(client)}
                  >
                    <Trash2 size={14} />
                    <span className="sr-only">Excluir</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
