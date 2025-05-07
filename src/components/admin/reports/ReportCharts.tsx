
import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Define chart-specific types
interface ChartDataItem {
  name: string;
  value: number;
}

// Define the colors for the pie charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Format currency helper
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Revenue Chart Component
export function RevenueChart({ data }: { data: ChartDataItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Receitas</CardTitle>
        <CardDescription>
          Receita total por período
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis 
                tickFormatter={(value) => 
                  new Intl.NumberFormat('pt-BR', {
                    notation: 'compact',
                    compactDisplay: 'short',
                  }).format(value)
                } 
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Receita']}
              />
              <Legend />
              <Bar dataKey="value" name="Receita" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Appointments Chart Component
export function AppointmentsChart({ data }: { data: ChartDataItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agendamentos</CardTitle>
        <CardDescription>
          Quantidade de agendamentos por período
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                name="Agendamentos" 
                stroke="#00C49F" 
                strokeWidth={2} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Users Distribution Chart Component
export function UsersDistributionChart({ data }: { data: ChartDataItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição de Usuários</CardTitle>
        <CardDescription>
          Usuários por tipo de perfil
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={(entry) => `${entry.name}: ${entry.value}`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Barbershops Status Chart Component
export function BarbershopsStatusChart({ data }: { data: ChartDataItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status das Barbearias</CardTitle>
        <CardDescription>
          Distribuição de barbearias por status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={(entry) => `${entry.name}: ${entry.value}`}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.name === 'Ativas' ? '#00C49F' : 
                      entry.name === 'Inativas' ? '#FFBB28' : 
                      '#FF8042'
                    } 
                  />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Report Tabs Component that combines all charts
interface ReportTabsProps {
  revenueData: ChartDataItem[];
  appointmentsData: ChartDataItem[];
  userTypesData: ChartDataItem[];
  barbershopStatusData: ChartDataItem[];
}

export function ReportTabs({
  revenueData,
  appointmentsData,
  userTypesData,
  barbershopStatusData
}: ReportTabsProps) {
  return (
    <Tabs defaultValue="financial">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
        <TabsTrigger value="financial">Financeiro</TabsTrigger>
        <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
        <TabsTrigger value="users">Usuários</TabsTrigger>
        <TabsTrigger value="barbershops">Barbearias</TabsTrigger>
      </TabsList>
      
      <TabsContent value="financial" className="mt-4 space-y-6">
        <RevenueChart data={revenueData} />
      </TabsContent>
      
      <TabsContent value="appointments" className="mt-4 space-y-6">
        <AppointmentsChart data={appointmentsData} />
      </TabsContent>
      
      <TabsContent value="users" className="mt-4 space-y-6">
        <UsersDistributionChart data={userTypesData} />
      </TabsContent>
      
      <TabsContent value="barbershops" className="mt-4 space-y-6">
        <BarbershopsStatusChart data={barbershopStatusData} />
      </TabsContent>
    </Tabs>
  );
}
