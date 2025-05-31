
import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { PaymentsTable } from '@/components/admin/PaymentsTable';
import { adminApi } from '@/services/admin-api';
import { PaymentStats } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw } from 'lucide-react';

export default function AdminPayments() {
  const [payments, setPayments] = useState<PaymentStats[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getPayments();
      setPayments(data);
      setFilteredPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {
    let filtered = [...payments];
    
    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(
        (payment) => 
          payment.barbershop_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((payment) => payment.status === statusFilter);
    }
    
    setFilteredPayments(filtered);
  }, [payments, searchTerm, statusFilter]);

  // Calculate total amounts by status
  const totalAmounts = payments.reduce((totals, payment) => {
    if (payment.status) {
      totals[payment.status] = (totals[payment.status] || 0) + payment.amount;
    }
    return totals;
  }, {} as Record<string, number>);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Gerenciar Pagamentos</h2>
          <Button 
            variant="outline" 
            className="flex items-center gap-2" 
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
            <div className="text-sm font-medium">Total Pago</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalAmounts.paid || 0)}
            </div>
          </div>
          
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
            <div className="text-sm font-medium">Pendente</div>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(totalAmounts.pending || 0)}
            </div>
          </div>
          
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
            <div className="text-sm font-medium">Falhas</div>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalAmounts.failed || 0)}
            </div>
          </div>
          
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
            <div className="text-sm font-medium">Reembolsado</div>
            <div className="text-2xl font-bold text-slate-600">
              {formatCurrency(totalAmounts.refunded || 0)}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Buscar por barbearia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:w-1/3"
          />
          
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value)}
          >
            <SelectTrigger className="md:w-1/4">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="paid">Pagos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="failed">Falhas</SelectItem>
                <SelectItem value="refunded">Reembolsados</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              Mostrando {filteredPayments.length} de {payments.length} pagamentos
            </div>
            
            <PaymentsTable payments={filteredPayments} />
            
            {filteredPayments.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                Nenhum pagamento encontrado com os filtros selecionados.
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
