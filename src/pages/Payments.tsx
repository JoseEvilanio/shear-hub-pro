
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BanknoteIcon, CreditCard, DollarSign, FileText, Filter, Search, Loader2 } from "lucide-react"; // Added Loader2
import { Input } from "@/components/ui/input";
// import { mockPayments } from "@/data/mock-payments"; // Remove mock data
import { useState, useEffect } from "react"; // Import useEffect
import { PaymentAddModal } from "@/components/payments/payment-add-modal";
import { PaymentReportModal } from "@/components/payments/payment-report-modal";
import { supabase } from "@/integrations/supabase/client"; // Import supabase
import { toast } from "sonner"; // For error notifications

// Define an interface for the payment data
interface Payment {
  id: string; // Assuming ID is a string from Supabase (e.g., UUID or auto-incremented int displayed as string)
  created_at: string; // Supabase TIMESTAMPTZ will be a string
  client_name: string;
  service_name: string;
  payment_method: string;
  amount: number;
  status: 'paid' | 'pending' | string; // Allow string for flexibility if other statuses exist
  // user_id: string; // If needed for other logic, but fetched by user_id already
  // barbershop_id: string; // If needed for other logic
}

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Usuário não autenticado.");
          setIsLoading(false);
          return;
        }

        // Fetch payments associated with the user's barbershop.
        // This assumes payments are linked via user_id of the recorder (owner)
        // or a barbershop_id linked to that user. For this example, using user_id.
        // TODO: Adjust if payments should be fetched via a barbershop_id that's not directly user.id
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', user.id) // Assuming payments are associated with the user who created them
          .order('created_at', { ascending: false });

        if (error) {
          toast.error(error.message || "Erro ao buscar pagamentos.");
          console.error("Error fetching payments:", error);
          setPayments([]);
        } else {
          setPayments(data as Payment[]);
        }
      } catch (error: any) {
        toast.error("Ocorreu um erro inesperado ao buscar pagamentos.");
        console.error("Unexpected error fetching payments:", error);
        setPayments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Calculate summary metrics
  const totalRevenue = payments.reduce((acc, payment) => acc + payment.amount, 0);
  const totalPaid = payments.filter(p => p.status === "paid").reduce((acc, p) => acc + p.amount, 0);
  const totalPending = payments.filter(p => p.status === "pending").reduce((acc, p) => acc + p.amount, 0);

  // Filter payments based on search
  const filteredPayments = payments.filter(payment =>
    payment.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.service_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-150px)]">
          <Loader2 className="h-16 w-16 animate-spin text-barber-gold" />
        </div>
      </DashboardLayout>
    );
  }

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
            <PaymentAddModal open={false} onClose={function (): void {
              throw new Error("Function not implemented.");
            } } />
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
            <TableHead>Data</TableHead> {/* Will display full timestamp, formatting needed */}
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
                <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell> {/* Basic date formatting */}
                <TableCell>{payment.client_name}</TableCell>
                <TableCell>{payment.service_name}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {payment.payment_method === "credit" && <CreditCard className="h-4 w-4 mr-2 text-blue-500" />}
                    {payment.payment_method === "cash" && <BanknoteIcon className="h-4 w-4 mr-2 text-green-500" />}
                    {payment.payment_method === "pix" && <DollarSign className="h-4 w-4 mr-2 text-emerald-500" />} {/* Assuming PIX icon */}
                    {payment.payment_method === "debit" && <CreditCard className="h-4 w-4 mr-2 text-purple-500" />}
                    {payment.payment_method === "credit" ? "Cartão de Crédito" : 
                     payment.payment_method === "cash" ? "Dinheiro" :
                     payment.payment_method === "pix" ? "PIX" :
                     payment.payment_method === "debit" ? "Cartão de Débito" : payment.payment_method}
                  </div>
                </TableCell>
                <TableCell>R$ {Number(payment.amount).toFixed(2)}</TableCell> {/* Ensure amount is number */}
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
