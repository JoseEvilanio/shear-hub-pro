import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Appointment {
  id: string;
  date: string;
  time: string;
  barber_name: string;
  service_name: string;
  status: string;
}

const ClientDashboard = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from('appointments')
          .select(`
            id,
            date,
            time,
            status,
            barbers (
              name
            ),
            services (
              name
            )
          `)
          .eq('client_id', session.user.id)
          .order('date', { ascending: true })
          .limit(5);

        if (error) throw error;

        const formattedAppointments = data.map((appointment: any) => ({
          id: appointment.id,
          date: appointment.date,
          time: appointment.time,
          barber_name: appointment.barbers.name,
          service_name: appointment.services.name,
          status: appointment.status,
        }));

        setAppointments(formattedAppointments);
      } catch (error: any) {
        toast.error(error.message || "Erro ao carregar agendamentos");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Button asChild>
          <Link to="/cliente/barbearias">Encontrar Barbearia</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Próximos Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
            <p className="text-xs text-muted-foreground">
              Agendamentos confirmados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Serviços Realizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter(a => a.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de serviços
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Agendamentos Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter(a => a.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Aguardando confirmação
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Agendamentos Cancelados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter(a => a.status === 'cancelled').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de cancelamentos
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximos Agendamentos</CardTitle>
          <CardDescription>
            Seus próximos agendamentos confirmados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-barber-gold"></div>
            </div>
          ) : appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{appointment.service_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.barber_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {new Date(appointment.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Nenhum agendamento encontrado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDashboard; 