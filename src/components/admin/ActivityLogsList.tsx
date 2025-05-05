
import { ActivityLog } from "@/types/admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Info } from "lucide-react";

interface ActivityLogsListProps {
  logs: ActivityLog[];
}

export function ActivityLogsList({ logs }: ActivityLogsListProps) {
  const getActionDescription = (action: string) => {
    switch (action) {
      case 'block_barbershop':
        return 'bloqueou uma barbearia';
      case 'unblock_barbershop':
        return 'desbloqueou uma barbearia';
      default:
        return action.replace(/_/g, ' ');
    }
  };

  const getTargetTypeLabel = (type: string) => {
    switch (type) {
      case 'barbershop':
        return 'barbearia';
      case 'user':
        return 'usuário';
      case 'payment':
        return 'pagamento';
      default:
        return type;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logs de Atividade</CardTitle>
        <CardDescription>
          Registro das últimas 100 ações realizadas no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between border-b pb-2 last:border-0"
            >
              <div>
                <p className="font-medium">
                  {log.user_email || 'Usuário'}
                  <span className="font-normal text-muted-foreground ml-2">
                    {getActionDescription(log.action)} ({getTargetTypeLabel(log.target_type)})
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(log.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {format(
                        new Date(log.created_at),
                        "dd/MM/yyyy 'às' HH:mm",
                        { locale: ptBR }
                      )}
                    </p>
                    <p className="text-xs mt-1">ID: {log.target_id}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ))}
          
          {logs.length === 0 && (
            <p className="text-center py-4 text-muted-foreground">
              Nenhuma atividade registrada
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
