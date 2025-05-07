
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReportSummaryCardProps {
  title: string;
  value: string | number;
  change: number;
  period: string;
}

export function ReportSummaryCard({ title, value, change, period }: ReportSummaryCardProps) {
  const formattedValue = typeof value === 'number' ? `R$ ${value.toFixed(2)}` : value;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md">{title} {
          period === 'week' ? 'Semanal' : 
          period === 'month' ? 'Mensal' : 
          period === 'quarter' ? 'Trimestral' : 'Anual'
        }</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{formattedValue}</p>
        <p className={`text-xs ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
          {change >= 0 ? "+" : ""}{change}% vs período anterior
        </p>
      </CardContent>
    </Card>
  );
}

interface ReportSummaryCardsProps {
  reportPeriod: string;
  revenueData: {
    value: number;
    change: number;
  };
  appointmentsData: {
    value: number;
    change: number;
  };
  clientsData: {
    value: number;
    change: number;
  };
  ticketData: {
    value: number;
    change: number;
  };
}

export function ReportSummaryCards({
  reportPeriod,
  revenueData,
  appointmentsData,
  clientsData,
  ticketData
}: ReportSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
      <ReportSummaryCard
        title="Faturamento"
        value={revenueData.value}
        change={revenueData.change}
        period={reportPeriod}
      />
      
      <ReportSummaryCard
        title="Agendamentos"
        value={appointmentsData.value}
        change={appointmentsData.change}
        period={reportPeriod}
      />
      
      <ReportSummaryCard
        title="Novos Clientes"
        value={clientsData.value}
        change={clientsData.change}
        period={reportPeriod}
      />
      
      <ReportSummaryCard
        title="Ticket Médio"
        value={ticketData.value}
        change={ticketData.change}
        period={reportPeriod}
      />
    </div>
  );
}
