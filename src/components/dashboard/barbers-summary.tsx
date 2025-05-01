
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function BarbersSummary() {
  const barbers = [
    {
      id: 1,
      name: "Carlos Eduardo",
      avatar: "",
      specialty: "Cortes modernos",
      status: "available",
      appointments: 5
    },
    {
      id: 2,
      name: "André Santos",
      avatar: "",
      specialty: "Barba",
      status: "busy",
      appointments: 8
    },
    {
      id: 3,
      name: "Marcos Paulo",
      avatar: "",
      specialty: "Degradê",
      status: "available",
      appointments: 4
    },
    {
      id: 4,
      name: "João Victor",
      avatar: "",
      specialty: "Tratamentos capilares",
      status: "lunch",
      appointments: 3
    }
  ];

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponível';
      case 'busy': return 'Ocupado';
      case 'lunch': return 'Almoço';
      default: return 'Indisponível';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-barber-green text-white';
      case 'busy': return 'bg-barber-red text-white';
      case 'lunch': return 'bg-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Barbeiros</CardTitle>
        <CardDescription>
          Visão geral dos barbeiros e sua disponibilidade
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {barbers.map(barber => (
            <div 
              key={barber.id}
              className="flex items-center justify-between p-2 hover:bg-accent/50 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={barber.avatar} alt={barber.name} />
                  <AvatarFallback className="bg-barber-gold text-white">
                    {barber.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{barber.name}</div>
                  <div className="text-sm text-muted-foreground">{barber.specialty}</div>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <Badge className={getStatusColor(barber.status)}>
                  {getStatusText(barber.status)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {barber.appointments} agendamentos hoje
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
