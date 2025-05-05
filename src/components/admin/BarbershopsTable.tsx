
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarbershopStats } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { adminApi } from "@/services/admin-api";
import { useState } from "react";
import { Eye, Lock, Unlock } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface BarbershopsTableProps {
  barbershops: BarbershopStats[];
  onRefresh: () => void;
}

export function BarbershopsTable({ barbershops, onRefresh }: BarbershopsTableProps) {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [selectedBarbershop, setSelectedBarbershop] = useState<BarbershopStats | null>(null);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };
  
  const handleToggleStatus = async (id: string, currentStatus: 'active' | 'inactive' | 'blocked') => {
    setLoading(prev => ({ ...prev, [id]: true }));
    
    try {
      const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
      await adminApi.updateBarbershopStatus(id, newStatus);
      
      toast.success(
        newStatus === 'active'
          ? 'Barbearia desbloqueada com sucesso'
          : 'Barbearia bloqueada com sucesso'
      );
      
      onRefresh();
    } catch (error) {
      console.error('Error updating barbershop status:', error);
      toast.error('Erro ao atualizar status da barbearia');
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Ativa</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500">Inativa</Badge>;
      case 'blocked':
        return <Badge variant="destructive">Bloqueada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Em dia</Badge>;
      case 'late':
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500">Atrasado</Badge>;
      case 'blocked':
        return <Badge variant="destructive">Bloqueado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {barbershops.map((barbershop) => (
              <TableRow key={barbershop.id}>
                <TableCell className="font-medium">{barbershop.name}</TableCell>
                <TableCell>{barbershop.city}</TableCell>
                <TableCell>{getStatusBadge(barbershop.status)}</TableCell>
                <TableCell>{getPaymentStatusBadge(barbershop.payment_status)}</TableCell>
                <TableCell>
                  {barbershop.next_payment_date 
                    ? format(new Date(barbershop.next_payment_date), "dd/MM/yyyy", { locale: ptBR })
                    : 'Não definido'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSelectedBarbershop(barbershop)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Detalhes da Barbearia</DialogTitle>
                        </DialogHeader>
                        {selectedBarbershop && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <Card>
                              <CardHeader>
                                <CardTitle>Informações Gerais</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <div>
                                  <p className="text-sm font-medium">Nome:</p>
                                  <p>{selectedBarbershop.name}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Cidade:</p>
                                  <p>{selectedBarbershop.city}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Status:</p>
                                  <p>{getStatusBadge(selectedBarbershop.status)}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Status de Pagamento:</p>
                                  <p>{getPaymentStatusBadge(selectedBarbershop.payment_status)}</p>
                                </div>
                              </CardContent>
                            </Card>
                            
                            <Card>
                              <CardHeader>
                                <CardTitle>Métricas</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <div>
                                  <p className="text-sm font-medium">Clientes:</p>
                                  <p>{selectedBarbershop.clientCount}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Barbeiros:</p>
                                  <p>{selectedBarbershop.barberCount}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Agendamentos:</p>
                                  <p>{selectedBarbershop.appointmentCount}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Faturamento:</p>
                                  <p>{formatCurrency(selectedBarbershop.revenue)}</p>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant={barbershop.status === 'blocked' ? "default" : "destructive"}
                      size="icon"
                      disabled={loading[barbershop.id]}
                      onClick={() => handleToggleStatus(barbershop.id, barbershop.status)}
                    >
                      {barbershop.status === 'blocked' ? (
                        <Unlock className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
