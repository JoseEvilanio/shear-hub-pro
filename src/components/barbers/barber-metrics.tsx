import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Award } from "lucide-react";

interface BarberMetricsProps {
  barbers: {
    id: number;
    name: string;
    status: string;
    todayAppointments: number;
    monthAppointments: number;
    is_active: boolean;
  }[];
}

export function BarberMetrics({ barbers }: BarberMetricsProps) {
  // Calculate metrics
  const totalBarbers = barbers.length;
  const activeBarbers = barbers.filter(barber => barber.is_active).length;
  
  const totalMonthlyAppointments = barbers.reduce((sum, barber) => sum + barber.monthAppointments, 0);
  const averageAppointments = activeBarbers ? Math.round(totalMonthlyAppointments / activeBarbers) : 0;
  
  const topBarber = barbers.reduce((prev, current) => 
    (prev.monthAppointments > current.monthAppointments) ? prev : current
  );

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Barbeiros Ativos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeBarbers}</div>
          <p className="text-xs text-muted-foreground">
            de {barbers.length} barbeiros cadastrados
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Média de Atendimentos</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageAppointments}</div>
          <p className="text-xs text-muted-foreground">
            por barbeiro este mês
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Barbeiro Destaque</CardTitle>
          <Award className="h-4 w-4 text-barber-gold" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{topBarber.name}</div>
          <p className="text-xs text-muted-foreground">
            {topBarber.monthAppointments} agendamentos este mês
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
