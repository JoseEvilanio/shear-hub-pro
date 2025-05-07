
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

interface RevenueChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  period: string;
}

export function RevenueChart({ data, period }: RevenueChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Faturamento {
          period === 'week' ? 'Semanal' : 
          period === 'month' ? 'Mensal' : 
          period === 'quarter' ? 'Trimestral' : 'Anual'
        }</CardTitle>
        <CardDescription>
          Análise de faturamento dos últimos períodos
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [`R$ ${value}`, "Valor"]} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#d4af37" 
              activeDot={{ r: 8 }} 
              name="Faturamento"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
