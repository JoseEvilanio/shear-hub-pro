// Detalhes da Ordem de Serviço
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { serviceOrderService, SERVICE_ORDER_STATUS_LABELS, SERVICE_ORDER_STATUS_COLORS } from '@/services/serviceOrderService';
import { ServiceOrder } from '@/types';
import {
  FileText,
  User,
  Car,
  Wrench,

  Package,
  Clock,
  Printer,
  Edit,
  CheckCircle,
  Truck,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ServiceOrderDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  serviceOrderId: string | null;
  onEdit?: (serviceOrder: ServiceOrder) => void;
  onStatusChange?: (serviceOrderId: string, status: string) => void;
  onPrint?: (serviceOrderId: string) => void;
}

export const ServiceOrderDetails: React.FC<ServiceOrderDetailsProps> = ({
  isOpen,
  onClose,
  serviceOrderId,
  onEdit,
  onStatusChange,
  onPrint,
}) => {
  const [serviceOrder, setServiceOrder] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && serviceOrderId) {
      loadServiceOrderDetails();
    }
  }, [isOpen, serviceOrderId]);

  const loadServiceOrderDetails = async () => {
    if (!serviceOrderId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await serviceOrderService.getServiceOrderById(serviceOrderId);
      setServiceOrder(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar detalhes da ordem de serviço');
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

  const getDescriptionLines = (serviceOrder: ServiceOrder) => {
    const lines = [
      serviceOrder.descriptionLine1,
      serviceOrder.descriptionLine2,
      serviceOrder.descriptionLine3,
      serviceOrder.descriptionLine4,
      serviceOrder.descriptionLine5,
      serviceOrder.descriptionLine6,
      serviceOrder.descriptionLine7,
      serviceOrder.descriptionLine8,
      serviceOrder.descriptionLine9,
    ].filter(line => line && line.trim());

    return lines;
  };

  const getNextStatuses = (currentStatus: string) => {
    return serviceOrderService.getNextStatuses(currentStatus as any);
  };

  const canEdit = (status: string) => {
    return serviceOrderService.canEditServiceOrder(status as any);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes da Ordem de Serviço"
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
            onClick={loadServiceOrderDetails}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Tentar Novamente
          </button>
        </div>
      ) : serviceOrder ? (
        <div className="space-y-6">
          {/* Header com número e status */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                OS #{serviceOrder.number}
              </h3>
              <p className="text-sm text-gray-600">
                Criada em {formatDateTime(serviceOrder.createdAt)}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  SERVICE_ORDER_STATUS_COLORS[serviceOrder.status as keyof typeof SERVICE_ORDER_STATUS_COLORS]
                }`}
              >
                {SERVICE_ORDER_STATUS_LABELS[serviceOrder.status as keyof typeof SERVICE_ORDER_STATUS_LABELS]}
              </span>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(serviceOrder.totalAmount)}
                </p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>
          </div>

          {/* Informações do Cliente e Veículo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cliente */}
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Cliente
              </h4>
              <div className="space-y-2">
                <p className="font-medium">{serviceOrder.client?.name}</p>
                {serviceOrder.client?.phone && (
                  <p className="text-sm text-gray-600">{serviceOrder.client.phone}</p>
                )}
                {serviceOrder.client?.email && (
                  <p className="text-sm text-gray-600">{serviceOrder.client.email}</p>
                )}
              </div>
            </div>

            {/* Veículo */}
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Car className="w-5 h-5 mr-2" />
                Veículo
              </h4>
              <div className="space-y-2">
                <p className="font-medium">{serviceOrder.vehicle?.plate}</p>
                <p className="text-sm text-gray-600">
                  {serviceOrder.vehicle?.brand} {serviceOrder.vehicle?.model}
                </p>
                {serviceOrder.vehicle?.year && (
                  <p className="text-sm text-gray-600">Ano: {serviceOrder.vehicle.year}</p>
                )}
              </div>
            </div>
          </div>

          {/* Mecânico */}
          {serviceOrder.mechanic && (
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Wrench className="w-5 h-5 mr-2" />
                Mecânico Responsável
              </h4>
              <p className="font-medium">{serviceOrder.mechanic.name}</p>
              {serviceOrder.mechanic.specialties && (
                <p className="text-sm text-gray-600">
                  Especialidades: {serviceOrder.mechanic.specialties}
                </p>
              )}
            </div>
          )}

          {/* Descrição do Serviço */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Descrição do Serviço
            </h4>
            <div className="space-y-2">
              {getDescriptionLines(serviceOrder).map((line, index) => (
                <div key={index} className="flex">
                  <span className="text-sm text-gray-500 w-16 flex-shrink-0">
                    Linha {index + 1}:
                  </span>
                  <span className="text-sm text-gray-900">{line}</span>
                </div>
              ))}
              {getDescriptionLines(serviceOrder).length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  Nenhuma descrição informada
                </p>
              )}
            </div>
          </div>

          {/* Itens da OS */}
          {serviceOrder.items && serviceOrder.items.length > 0 && (
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Itens Utilizados
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Produto/Serviço</th>
                      <th className="px-3 py-2 text-center">Qtd</th>
                      <th className="px-3 py-2 text-right">Valor Unit.</th>
                      <th className="px-3 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {serviceOrder.items.map((item: any) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2">
                          <div>
                            <p className="font-medium">{item.product?.name}</p>
                            {item.description && (
                              <p className="text-gray-500 text-xs">{item.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center">{item.quantity}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
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

          {/* Histórico de Status */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Histórico
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">OS Criada</p>
                  <p className="text-xs text-gray-500">
                    {formatDateTime(serviceOrder.createdAt)}
                  </p>
                </div>
              </div>
              
              {serviceOrder.updatedAt !== serviceOrder.createdAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Última Atualização</p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(serviceOrder.updatedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              {canEdit(serviceOrder.status) && onEdit && (
                <button
                  onClick={() => onEdit(serviceOrder)}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </button>
              )}
              
              {onPrint && (
                <button
                  onClick={() => onPrint(serviceOrder.id)}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Ações de Status */}
              {getNextStatuses(serviceOrder.status).map((status) => {
                const statusConfig = {
                  completed: { icon: CheckCircle, label: 'Finalizar', color: 'bg-green-600 hover:bg-green-700' },
                  delivered: { icon: Truck, label: 'Entregar', color: 'bg-purple-600 hover:bg-purple-700' },
                  cancelled: { icon: XCircle, label: 'Cancelar', color: 'bg-red-600 hover:bg-red-700' },
                  in_progress: { icon: Clock, label: 'Iniciar', color: 'bg-blue-600 hover:bg-blue-700' },
                  waiting_parts: { icon: Package, label: 'Aguardar Peças', color: 'bg-orange-600 hover:bg-orange-700' },
                };

                const config = statusConfig[status as keyof typeof statusConfig];
                if (!config) return null;

                const Icon = config.icon;

                return (
                  <button
                    key={status}
                    onClick={() => onStatusChange?.(serviceOrder.id, status)}
                    className={`flex items-center px-3 py-2 text-white rounded-lg ${config.color}`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};