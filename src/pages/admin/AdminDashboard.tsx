import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatsCards } from '@/components/admin/StatsCards';
import { BarbershopsTable } from '@/components/admin/BarbershopsTable';
import { ActivityLogsList } from '@/components/admin/ActivityLogsList';
import { adminApi } from '@/services/admin-api';
import { AppStats, BarbershopStats, ActivityLog } from '@/types/admin';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AppStats | null>(null);
  const [barbershops, setBarbershops] = useState<BarbershopStats[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [appStats, barbershopsData, logsData] = await Promise.all([
        adminApi.getAppStats(),
        adminApi.getBarbershops(),
        adminApi.getActivityLogs()
      ]);
      
      setStats(appStats);
      setBarbershops(barbershopsData);
      setLogs(logsData);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
      setError('Erro ao carregar os dados. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);

  // Get barbershops with late payments or issues
  const latePaymentBarbershops = barbershops.filter(
    (shop) => shop.payment_status === 'late' || shop.status === 'blocked'
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Painel de Controle</h2>
          <Button 
            variant="outline" 
            className="flex items-center gap-2" 
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Stats */}
        {stats && <StatsCards stats={stats} />}

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Late payments alerts */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Barbearias com Alertas</CardTitle>
              <CardDescription>
                Barbearias com pagamentos atrasados ou bloqueadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {latePaymentBarbershops.length > 0 ? (
                <div className="space-y-4">
                  <BarbershopsTable 
                    barbershops={latePaymentBarbershops.slice(0, 5)} 
                    onRefresh={fetchData} 
                  />
                  {latePaymentBarbershops.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center">
                      Mostrando 5 de {latePaymentBarbershops.length} barbearias com alertas
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Não há barbearias com alertas no momento
                </p>
              )}
            </CardContent>
          </Card>

          {/* Activity Logs */}
          <div className="lg:col-span-1">
            <ActivityLogsList logs={logs.slice(0, 10)} />
          </div>

          {/* Recent barbershops */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Barbearias Recentes</CardTitle>
              <CardDescription>
                Lista das barbearias mais recentemente cadastradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarbershopsTable 
                barbershops={
                  [...barbershops]
                    .sort((a, b) => {
                      // Check if created_at exists before using it
                      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                      return dateB - dateA;
                    })
                    .slice(0, 5)
                } 
                onRefresh={fetchData} 
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
