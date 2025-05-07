
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BanknoteIcon, CreditCard, DollarSign, FileText, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { mockPayments } from "@/data/mock-payments";
import { useState } from "react";
import { PaymentAddModal } from "@/components/payments/payment-add-modal";
import { PaymentReportModal } from "@/components/payments/payment-report-modal";

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate summary metrics
  const totalRevenue = mockPayments.reduce((acc, payment) => acc + payment.amount, 0);
  const totalPaid = mockPayments.filter(p => p.status === "paid").reduce((acc, p) => acc + p.amount, 0);
  const totalPending = mockPayments.filter(p => p.status === "pending").reduce((acc, p) => acc + p.amount, 0);

  // Filter payments based on search
  const filteredPayments = mockPayments.filter(payment =>
    payment.id.toString().includes(searchTerm) ||
    payment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Pagamentos</h2>
            <p className="text-muted-foreground">
              Gerencie os pagamentos e transações da sua barbearia
            </p>
          </div>
          <div className="flex gap-2">
            <PaymentReportModal />
            <PaymentAddModal />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="bg-barber-gold/10 pb-2">
              <CardTitle className="text-2xl">Faturamento Total</CardTitle>
              <CardDescription>Receita de todos os pagamentos</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 mr-3 text-barber-gold" />
                <p className="text-4xl font-bold">R$ {totalRevenue.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-green-100/10 pb-2">
              <CardTitle className="text-2xl">Pagamentos Recebidos</CardTitle>
              <CardDescription>Total de pagamentos confirmados</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 mr-3 text-green-600" />
                <p className="text-4xl font-bold">R$ {totalPaid.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-amber-100/10 pb-2">
              <CardTitle className="text-2xl">Pagamentos Pendentes</CardTitle>
              <CardDescription>Total de pagamentos a receber</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 mr-3 text-amber-600" />
                <p className="text-4xl font-bold">R$ {totalPending.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por ID, cliente ou serviço..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="paid">Pagos</TabsTrigger>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <PaymentsTable payments={filteredPayments} />
          </TabsContent>
          
          <TabsContent value="paid">
            <PaymentsTable payments={filteredPayments.filter(p => p.status === "paid")} />
          </TabsContent>
          
          <TabsContent value="pending">
            <PaymentsTable payments={filteredPayments.filter(p => p.status === "pending")} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

// Payments table component
const PaymentsTable = ({ payments }: { payments: any[] }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Serviço</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                Nenhum pagamento encontrado.
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">{payment.id}</TableCell>
                <TableCell>{payment.date}</TableCell>
                <TableCell>{payment.client}</TableCell>
                <TableCell>{payment.service}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {payment.method === "credit" && <CreditCard className="h-4 w-4 mr-2" />}
                    {payment.method === "cash" && <BanknoteIcon className="h-4 w-4 mr-2" />}
                    {payment.method === "credit" ? "Cartão de Crédito" : "Dinheiro"}
                  </div>
                </TableCell>
                <TableCell>R$ {payment.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    payment.status === "paid" 
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                  }`}>
                    {payment.status === "paid" ? "Pago" : "Pendente"}
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <FileText className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Payments;
