
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from "recharts";

interface BarbersChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

export function BarbersChart({ data }: BarbersChartProps) {
  const COLORS = ['#d4af37', '#8884d8', '#82ca9d', '#ffc658', '#ff8042'];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Desempenho por Barbeiro</CardTitle>
        <CardDescription>
          Distribuição de atendimentos entre barbeiros
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name, props) => [value, name]} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
