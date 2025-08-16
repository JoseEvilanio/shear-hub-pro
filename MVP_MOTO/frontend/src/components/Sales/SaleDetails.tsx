// Detalhes da Venda
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { salesService, SALE_TYPE_LABELS, SALE_STATUS_LABELS, SALE_STATUS_COLORS, PAYMENT_METHOD_LABELS } from '@/services/salesService';
import { Sale } from '@/types';
import {
  FileText,
  User,
  Calendar,
  DollarSign,
  Package,
  CreditCard,
  Printer,
  Edit,
  CheckCircle,
  XCircle,
  RefreshCw,
  Receipt,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SaleDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  saleId: string | null;
  onEdit?: (sale: Sale) => void;
  onStatusChange?: (saleId: string, status: string) => void;
  onPrint?: (saleId: string) => void;
}

export const SaleDetails: React.FC<SaleDetailsProps> = ({
  isOpen,
  onClose,
  saleId,
  onEdit,
  onStatusChange,
  onPrint,
}) => {
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && saleId) {
      loadSaleDetails();
    }
  }, [isOpen, saleId]);

  const loadSaleDetails = async () => {
    if (!saleId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await salesService.getSaleById(saleId);
      setSale(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar detalhes da venda');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const canEdit = (status: string) => {
    return salesService.canEditSale(status as any);
  };

  const canCancel = (status: string) => {
    return salesService.canCancelSale(status as any);
  };

  const canConvert = (type: string, status: string) => {
    return salesService.canConvertQuote(type as any, status as any);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes da Venda"
      size="xl"
    >
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadSaleDetails}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Tentar Novamente
          </button>
        </div>
      ) : sale ? (
        <div className="space-y-6">
          {/* Header com número e status */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <div>
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-bold text-gray-900">
                  {SALE_TYPE_LABELS[sale.type as keyof typeof SALE_TYPE_LABELS]} #{sale.number}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    SALE_STATUS_COLORS[sale.status as keyof typeof SALE_STATUS_COLORS]
                  }`}
                >
                  {SALE_STATUS_LABELS[sale.status as keyof typeof SALE_STATUS_LABELS]}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Criada em {formatDateTime(sale.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(sale.totalAmount)}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                {sale.paid ? (
                  <span className="flex items-center text-sm text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Pago
                  </span>
                ) : (
                  <span className="flex items-center text-sm text-red-600">
                    <XCircle className="w-4 h-4 mr-1" />
                    Pendente
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Informações do Cliente */}
          {sale.client && (
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Cliente
              </h4>
              <div className="space-y-2">
                <p className="font-medium">{sale.client.name}</p>
                {sale.client.phone && (
                  <p className="text-sm text-gray-600">{sale.client.phone}</p>
                )}
                {sale.client.email && (
                  <p className="text-sm text-gray-600">{sale.client.email}</p>
                )}
              </div>
            </div>
          )}

          {/* Informações de Pagamento */}
          {sale.type === 'sale' && (
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Pagamento
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Forma de Pagamento</p>
                  <p className="font-medium">
                    {sale.paymentMethod 
                      ? PAYMENT_METHOD_LABELS[sale.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS]
                      : 'Não informado'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status do Pagamento</p>
                  <p className={`font-medium ${sale.paid ? 'text-green-600' : 'text-red-600'}`}>
                    {sale.paid ? 'Pago' : 'Pendente'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Itens da Venda */}
          {sale.items && sale.items.length > 0 && (
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Itens ({sale.items.length})
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Produto</th>
                      <th className="px-3 py-2 text-center">Qtd</th>
                      <th className="px-3 py-2 text-right">Valor Unit.</th>
                      <th className="px-3 py-2 text-right">Desconto</th>
                      <th className="px-3 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sale.items.map((item: any) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2">
                          <div>
                            <p className="font-medium">{item.product?.name}</p>
                            <p className="text-gray-500 text-xs">Código: {item.product?.code}</p>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center">{item.quantity}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-3 py-2 text-right">
                          {item.discountAmount > 0 ? (
                            <span className="text-red-600">-{formatCurrency(item.discountAmount)}</span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-3 py-2 text-right font-medium">
                          {formatCurrency(item.totalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Resumo Financeiro */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Resumo Financeiro
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(sale.subtotal)}</span>
              </div>
              {sale.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Desconto Geral:</span>
                  <span>-{formatCurrency(sale.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                <span>Total:</span>
                <span>{formatCurrency(sale.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Observações */}
          {sale.notes && (
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Observações
              </h4>
              <p className="text-gray-700">{sale.notes}</p>
            </div>
          )}

          {/* Histórico */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Histórico
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">
                    {SALE_TYPE_LABELS[sale.type as keyof typeof SALE_TYPE_LABELS]} Criada
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDateTime(sale.createdAt)}
                  </p>
                </div>
              </div>
              
              {sale.updatedAt !== sale.createdAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Última Atualização</p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(sale.updatedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              {canEdit(sale.status) && onEdit && (
                <button
                  onClick={() => onEdit(sale)}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </button>
              )}
              
              {onPrint && (
                <button
                  onClick={() => onPrint(sale.id)}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </button>
              )}

              {sale.type === 'sale' && (
                <button
                  onClick={() => onPrint && onPrint(sale.id)}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Cupom
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Ações específicas por tipo e status */}
              {canConvert(sale.type, sale.status) && (
                <button
                  onClick={() => onStatusChange?.(sale.id, 'convert')}
                  className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Converter em Venda
                </button>
              )}

              {sale.status === 'pending' && (
                <button
                  onClick={() => onStatusChange?.(sale.id, 'confirmed')}
                  className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmar
                </button>
              )}

              {!sale.paid && sale.type === 'sale' && (sale.status as any) === 'confirmed' && (
                <button
                  onClick={() => onStatusChange?.(sale.id, 'mark_paid')}
                  className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Marcar como Pago
                </button>
              )}

              {canCancel(sale.status) && (
                <button
                  onClick={() => onStatusChange?.(sale.id, 'cancelled')}
                  className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};