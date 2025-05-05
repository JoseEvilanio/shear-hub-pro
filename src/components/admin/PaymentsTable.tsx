
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaymentStats } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ExternalLink } from "lucide-react";

interface PaymentsTableProps {
  payments: PaymentStats[];
}

export function PaymentsTable({ payments }: PaymentsTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-500">Pago</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500">Pendente</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falha</Badge>;
      case 'refunded':
        return <Badge variant="secondary">Reembolsado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Barbearia</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Método</TableHead>
            <TableHead className="text-right">Fatura</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="font-medium">{payment.barbershop_name}</TableCell>
              <TableCell>{formatCurrency(payment.amount)}</TableCell>
              <TableCell>{getPaymentStatusBadge(payment.status)}</TableCell>
              <TableCell>
                {format(new Date(payment.payment_date), "dd/MM/yyyy", { locale: ptBR })}
              </TableCell>
              <TableCell>
                {payment.payment_method || 'Não informado'}
              </TableCell>
              <TableCell className="text-right">
                {payment.invoice_url ? (
                  <a
                    href={payment.invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Ver fatura
                    </Button>
                  </a>
                ) : (
                  <span className="text-muted-foreground text-sm">Não disponível</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
