
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface BarberTableViewProps {
  barbers: Array<{
    id: number;
    name: string;
    avatar: string;
    email: string;
    specialties: string[];
    status: string;
    todayAppointments: number;
    monthAppointments: number;
  }>;
  onOpenSchedule: (barber: any) => void;
}

export function BarberTableView({ barbers, onOpenSchedule }: BarberTableViewProps) {
  const { toast } = useToast();

  const handleToggleStatus = (barberId: number) => {
    // In a real app, this would call an API to update the barber's status
    toast({
      title: "Status alterado",
      description: "O status do barbeiro foi atualizado com sucesso.",
    });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Barbeiro</TableHead>
            <TableHead>Especialidades</TableHead>
            <TableHead className="text-center">Hoje</TableHead>
            <TableHead className="text-center">Este mês</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {barbers.map((barber) => (
            <TableRow key={barber.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={barber.avatar} alt={barber.name} />
                    <AvatarFallback className="bg-barber-gold text-white">
                      {barber.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{barber.name}</p>
                    <p className="text-xs text-muted-foreground">{barber.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {barber.specialties.slice(0, 2).map((specialty, i) => (
                    <Badge key={i} variant="outline" className="text-xs bg-muted">
                      {specialty}
                    </Badge>
                  ))}
                  {barber.specialties.length > 2 && (
                    <Badge variant="outline" className="text-xs bg-muted">
                      +{barber.specialties.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">{barber.todayAppointments}</TableCell>
              <TableCell className="text-center">{barber.monthAppointments}</TableCell>
              <TableCell className="text-center">
                <Badge 
                  className={barber.status === "active" 
                    ? "bg-emerald-500 hover:bg-emerald-600" 
                    : "bg-gray-500 hover:bg-gray-600"}
                >
                  {barber.status === "active" ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onOpenSchedule(barber)}
                  >
                    <Calendar size={14} />
                    <span className="sr-only">Ver agenda</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleToggleStatus(barber.id)}
                  >
                    <Edit size={14} />
                    <span className="sr-only">Editar</span>
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
