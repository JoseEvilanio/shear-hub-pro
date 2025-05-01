
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { DashboardCards } from "@/components/dashboard/dashboard-cards";
import { AppointmentCalendar } from "@/components/dashboard/appointment-calendar";
import { BarbersSummary } from "@/components/dashboard/barbers-summary";
import { Plus } from "lucide-react";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Bem-vindo ao seu painel de gerenciamento ShearHub
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Barbeiro
            </Button>
            <Button className="bg-barber-gold hover:bg-barber-gold/80">
              <Plus className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Button>
          </div>
        </div>

        <DashboardCards />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <AppointmentCalendar />
          </div>
          <div className="md:col-span-1">
            <BarbersSummary />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
