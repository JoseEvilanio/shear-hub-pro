
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface BarberCardViewProps {
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

export function BarberCardView({ barbers, onOpenSchedule }: BarberCardViewProps) {
  const { toast } = useToast();

  const handleToggleStatus = (barberId: number) => {
    // In a real app, this would call an API to update the barber's status
    toast({
      title: "Status alterado",
      description: "O status do barbeiro foi atualizado com sucesso.",
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {barbers.map(barber => (
        <Card 
          key={barber.id} 
          className={`overflow-hidden transition-all ${
            barber.status === "inactive" ? "opacity-70" : ""
          }`}
        >
          <CardHeader className="relative p-0">
            <div className="h-24 bg-gradient-to-r from-barber-gold/30 to-barber-gold/10"></div>
            <div className="absolute -bottom-10 left-4">
              <Avatar className="h-16 w-16 border-4 border-background">
                <AvatarImage src={barber.avatar} alt={barber.name} />
                <AvatarFallback className="bg-barber-gold text-white text-xl">
                  {barber.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </CardHeader>
          <CardContent className="pt-12 pb-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-lg">{barber.name}</h3>
                <p className="text-sm text-muted-foreground">{barber.email}</p>
              </div>
              <Badge 
                className={barber.status === "active" 
                  ? "bg-emerald-500 hover:bg-emerald-600" 
                  : "bg-gray-500 hover:bg-gray-600"}
              >
                {barber.status === "active" ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1 my-2">
              {barber.specialties.map((specialty, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-muted">
                  {specialty}
                </Badge>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="text-center p-2 bg-muted rounded-md">
                <p className="text-xs text-muted-foreground">Hoje</p>
                <p className="font-semibold">{barber.todayAppointments}</p>
              </div>
              <div className="text-center p-2 bg-muted rounded-md">
                <p className="text-xs text-muted-foreground">Este mês</p>
                <p className="font-semibold">{barber.monthAppointments}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-0">
            <Button 
              variant="outline" 
              size="sm"
              className="w-full gap-1"
              onClick={() => onOpenSchedule(barber)}
            >
              <Calendar size={14} />
              Ver Agenda
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="w-full gap-1 ml-2"
              onClick={() => handleToggleStatus(barber.id)}
            >
              <Edit size={14} />
              Editar
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
