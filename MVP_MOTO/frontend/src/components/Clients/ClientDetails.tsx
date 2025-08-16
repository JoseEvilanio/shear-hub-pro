// Detalhes do Cliente
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { clientService } from '@/services/clientService';
import { Client } from '@/types';
import {
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  FileText,
  Car,
  Wrench,
  ShoppingCart,
  DollarSign,
  Clock,

} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ClientDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string | null;
}

interface ClientHistory {
  client: Client;
  vehicles: any[];
  serviceOrders: any[];
  sales: any[];
  totalSpent: number;
  lastVisit?: string;
}

export const ClientDetails: React.FC<ClientDetailsProps> = ({
  isOpen,
  onClose,
  clientId,
}) => {
  const [history, setHistory] = useState<ClientHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && clientId) {
      loadClientHistory();
    }
  }, [isOpen, clientId]);

  const loadClientHistory = async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await clientService.getClientHistory(clientId);
      setHistory(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar histórico do cliente');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
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

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes do Cliente"
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
            onClick={loadClientHistory}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Tentar Novamente
          </button>
        </div>
      ) : history ? (
        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Informações Pessoais
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nome</p>
                <p className="font-medium">{history.client.name}</p>
              </div>
              
              {history.client.cpf && (
                <div>
                  <p className="text-sm text-gray-600">CPF</p>
                  <p className="font-medium">{history.client.cpf}</p>
                </div>
              )}
              
              {history.client.phone && (
                <div>
                  <p className="text-sm text-gray-600">Telefone</p>
                  <p className="font-medium flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {history.client.phone}
                  </p>
                </div>
              )}
              
              {history.client.email && (
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    {history.client.email}
                  </p>
                </div>
              )}
              
              {history.client.birthDate && (
                <div>
                  <p className="text-sm text-gray-600">Data de Nascimento</p>
                  <p className="font-medium flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(history.client.birthDate)}
                  </p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-600">Cliente desde</p>
                <p className="font-medium">{formatDate(history.client.createdAt)}</p>
              </div>
            </div>
            
            {history.client.address && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">Endereço</p>
                <p className="font-medium flex items-start">
                  <MapPin className="w-4 h-4 mr-1 mt-0.5" />
                  {history.client.address}
                </p>
              </div>
            )}
            
            {history.client.notes && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">Observações</p>
                <p className="font-medium flex items-start">
                  <FileText className="w-4 h-4 mr-1 mt-0.5" />
                  {history.client.notes}
                </p>
              </div>
            )}
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <Car className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm text-blue-600">Veículos</p>
                  <p className="text-2xl font-bold text-blue-900">{history.vehicles.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <Wrench className="w-8 h-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm text-green-600">Ordens de Serviço</p>
                  <p className="text-2xl font-bold text-green-900">{history.serviceOrders.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <ShoppingCart className="w-8 h-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm text-purple-600">Vendas</p>
                  <p className="text-2xl font-bold text-purple-900">{history.sales.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm text-yellow-600">Total Gasto</p>
                  <p className="text-lg font-bold text-yellow-900">{formatCurrency(history.totalSpent)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Última Visita */}
          {history.lastVisit && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-gray-600 mr-2" />
                <span className="text-sm text-gray-600">Última visita:</span>
                <span className="ml-2 font-medium">{formatDateTime(history.lastVisit)}</span>
              </div>
            </div>
          )}

          {/* Veículos */}
          {history.vehicles.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Car className="w-5 h-5 mr-2" />
                Veículos ({history.vehicles.length})
              </h3>
              <div className="space-y-2">
                {history.vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="bg-white border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
                        <p className="text-sm text-gray-600">
                          Placa: {vehicle.plate} • Ano: {vehicle.year}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        vehicle.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {vehicle.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Histórico Recente */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ordens de Serviço Recentes */}
            {history.serviceOrders.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Wrench className="w-5 h-5 mr-2" />
                  Ordens de Serviço Recentes
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {history.serviceOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="bg-white border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">OS #{order.number}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          order.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {formatDateTime(order.createdAt)}
                      </p>
                      <p className="text-sm font-medium">
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vendas Recentes */}
            {history.sales.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Vendas Recentes
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {history.sales.slice(0, 5).map((sale) => (
                    <div key={sale.id} className="bg-white border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Venda #{sale.number}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          sale.paid 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {sale.paid ? 'Pago' : 'Pendente'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {formatDateTime(sale.createdAt)}
                      </p>
                      <p className="text-sm font-medium">
                        {formatCurrency(sale.totalAmount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
};