
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users, UserCheck, BarChart3 } from "lucide-react";

interface ClientMetricsProps {
  clients: any[];
}

export function ClientMetrics({ clients }: ClientMetricsProps) {
  const activeClients = clients.filter(client => client.status === "active").length;
  const totalLoyaltyPoints = clients.reduce((acc, client) => acc + client.loyaltyPoints, 0);
  const totalVisits = clients.reduce((acc, client) => acc + client.totalVisits, 0);
  
  // Find client with most visits
  const mostFrequentClient = [...clients].sort((a, b) => b.totalVisits - a.totalVisits)[0];
  
  // Calculate average visits
  const averageVisits = totalVisits / clients.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Total de Clientes
            </p>
            <p className="text-2xl font-bold">{clients.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {activeClients} ativos / {clients.length - activeClients} inativos
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Pontos de Fidelidade
            </p>
            <p className="text-2xl font-bold">{totalLoyaltyPoints}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Média de {(totalLoyaltyPoints / clients.length).toFixed(1)} por cliente
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
            <Trophy className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Cliente Mais Frequente
            </p>
            <p className="text-2xl font-bold truncate max-w-[160px]">
              {mostFrequentClient?.name || "N/A"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {mostFrequentClient?.totalVisits || 0} visitas totais
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Total de Visitas
            </p>
            <p className="text-2xl font-bold">{totalVisits}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Média de {averageVisits.toFixed(1)} por cliente
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
