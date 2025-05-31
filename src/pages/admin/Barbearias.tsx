
import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { BarbershopsTable } from '@/components/admin/BarbershopsTable';
import { adminApi } from '@/services/admin-api';
import { BarbershopStats } from '@/types/admin';
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

export default function AdminBarbershops() {
  const [barbershops, setBarbershops] = useState<BarbershopStats[]>([]);
  const [filteredBarbershops, setFilteredBarbershops] = useState<BarbershopStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getBarbershops();
      setBarbershops(data);
      setFilteredBarbershops(data);
    } catch (error) {
      console.error('Error fetching barbershops:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {
    let filtered = [...barbershops];
    
    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(
        (shop) => 
          shop.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          shop.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((shop) => shop.status === statusFilter);
    }
    
    // Apply payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter((shop) => shop.payment_status === paymentFilter);
    }
    
    setFilteredBarbershops(filtered);
  }, [barbershops, searchTerm, statusFilter, paymentFilter]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Gerenciar Barbearias</h2>
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
        
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Buscar barbearias..."
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
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
                <SelectItem value="blocked">Bloqueados</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <Select
            value={paymentFilter}
            onValueChange={(value) => setPaymentFilter(value)}
          >
            <SelectTrigger className="md:w-1/4">
              <SelectValue placeholder="Filtrar por pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Todos os pagamentos</SelectItem>
                <SelectItem value="active">Em dia</SelectItem>
                <SelectItem value="late">Atrasado</SelectItem>
                <SelectItem value="blocked">Bloqueado</SelectItem>
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
              Mostrando {filteredBarbershops.length} de {barbershops.length} barbearias
            </div>
            
            <BarbershopsTable 
              barbershops={filteredBarbershops} 
              onRefresh={fetchData} 
            />
            
            {filteredBarbershops.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                Nenhuma barbearia encontrada com os filtros selecionados.
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
