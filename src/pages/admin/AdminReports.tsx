
import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { DownloadIcon } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Mock data for reports
const revenueData = [
  { name: 'Jan', value: 12400 },
  { name: 'Fev', value: 13800 },
  { name: 'Mar', value: 15200 },
  { name: 'Abr', value: 16100 },
  { name: 'Mai', value: 14900 },
  { name: 'Jun', value: 16800 },
  { name: 'Jul', value: 17500 },
  { name: 'Ago', value: 19200 },
  { name: 'Set', value: 18400 },
  { name: 'Out', value: 21000 },
  { name: 'Nov', value: 22300 },
  { name: 'Dez', value: 24800 },
];

const appointmentsData = [
  { name: 'Jan', value: 124 },
  { name: 'Fev', value: 138 },
  { name: 'Mar', value: 152 },
  { name: 'Abr', value: 161 },
  { name: 'Mai', value: 149 },
  { name: 'Jun', value: 168 },
  { name: 'Jul', value: 175 },
  { name: 'Ago', value: 192 },
  { name: 'Set', value: 184 },
  { name: 'Out', value: 210 },
  { name: 'Nov', value: 223 },
  { name: 'Dez', value: 248 },
];

const userTypesData = [
  { name: 'Clientes', value: 845 },
  { name: 'Barbeiros', value: 124 },
  { name: 'Proprietários', value: 57 },
  { name: 'Administradores', value: 8 },
];

const barbershopStatusData = [
  { name: 'Ativas', value: 42 },
  { name: 'Inativas', value: 8 },
  { name: 'Bloqueadas', value: 3 },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export default function AdminReports() {
  const [periodFilter, setPeriodFilter] = useState('year');
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
            <p className="text-muted-foreground">
              Análise de dados e estatísticas
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Este mês</SelectItem>
                <SelectItem value="quarter">Este trimestre</SelectItem>
                <SelectItem value="year">Este ano</SelectItem>
                <SelectItem value="all">Todo período</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="flex items-center gap-2">
              <DownloadIcon className="h-4 w-4" />
              Exportar Relatório
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="financial">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="financial">Financeiro</TabsTrigger>
            <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="barbershops">Barbearias</TabsTrigger>
          </TabsList>
          
          <TabsContent value="financial" className="mt-4 space-y-6">
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
                    <BarChart data={revenueData}>
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
          </TabsContent>
          
          <TabsContent value="appointments" className="mt-4 space-y-6">
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
                    <LineChart data={appointmentsData}>
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
          </TabsContent>
          
          <TabsContent value="users" className="mt-4 space-y-6">
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
                        data={userTypesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={(entry) => `${entry.name}: ${entry.value}`}
                      >
                        {userTypesData.map((entry, index) => (
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
          </TabsContent>
          
          <TabsContent value="barbershops" className="mt-4 space-y-6">
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
                        data={barbershopStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={(entry) => `${entry.name}: ${entry.value}`}
                      >
                        {barbershopStatusData.map((entry, index) => (
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
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
