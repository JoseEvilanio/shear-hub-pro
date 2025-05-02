
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Download, LineChart, PieChart, Calendar } from "lucide-react";
import { mockReports } from "@/data/mock-reports";

// Import Recharts components
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from "recharts";

const Reports = () => {
  // Colors for charts
  const COLORS = ['#d4af37', '#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
            <p className="text-muted-foreground">
              Análise de desempenho e estatísticas da sua barbearia
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Período
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Faturamento Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">R$ {mockReports.monthlyRevenue.toFixed(2)}</p>
              <p className={`text-xs ${mockReports.revenueChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                {mockReports.revenueChange >= 0 ? "+" : ""}{mockReports.revenueChange}% vs mês anterior
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Agendamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{mockReports.totalAppointments}</p>
              <p className={`text-xs ${mockReports.appointmentsChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                {mockReports.appointmentsChange >= 0 ? "+" : ""}{mockReports.appointmentsChange}% vs mês anterior
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Novos Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{mockReports.newClients}</p>
              <p className={`text-xs ${mockReports.clientsChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                {mockReports.clientsChange >= 0 ? "+" : ""}{mockReports.clientsChange}% vs mês anterior
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Ticket Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">R$ {mockReports.averageTicket.toFixed(2)}</p>
              <p className={`text-xs ${mockReports.ticketChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                {mockReports.ticketChange >= 0 ? "+" : ""}{mockReports.ticketChange}% vs mês anterior
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="revenue" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="revenue">
              <LineChart className="h-4 w-4 mr-2" />
              Faturamento
            </TabsTrigger>
            <TabsTrigger value="services">
              <BarChart className="h-4 w-4 mr-2" />
              Serviços
            </TabsTrigger>
            <TabsTrigger value="barbers">
              <PieChart className="h-4 w-4 mr-2" />
              Barbeiros
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle>Faturamento Mensal</CardTitle>
                <CardDescription>
                  Análise de faturamento dos últimos 6 meses
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart
                    data={mockReports.revenueData}
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
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Serviços Populares</CardTitle>
                <CardDescription>
                  Ranking de serviços por popularidade
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={mockReports.serviceData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#d4af37" name="Quantidade" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="barbers">
            <Card>
              <CardHeader>
                <CardTitle>Desempenho por Barbeiro</CardTitle>
                <CardDescription>
                  Distribuição de atendimentos entre barbeiros
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={mockReports.barberData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mockReports.barberData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [value, name]} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
