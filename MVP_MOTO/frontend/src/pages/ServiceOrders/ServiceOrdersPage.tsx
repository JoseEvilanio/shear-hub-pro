// Página de Gestão de Ordens de Serviço
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useState } from 'react';
import { useServiceOrders } from '@/hooks/useServiceOrders';
import { useAuth } from '@/hooks/useAuth';
import { DataTable, Column } from '@/components/ui/DataTable';
import { PermissionGuard, ConditionalButton } from '@/components/Auth/PermissionGuard';
import { ServiceOrderForm, ServiceOrderFormData } from '@/components/ServiceOrders/ServiceOrderForm';
import { ServiceOrderDetails } from '@/components/ServiceOrders/ServiceOrderDetails';
import { ConfirmModal } from '@/components/ui/Modal';
import { ServiceOrder } from '@/types';
import { SERVICE_ORDER_STATUS_LABELS, SERVICE_ORDER_STATUS_COLORS } from '@/services/serviceOrderService';
import {
  Plus,
  Edit,
  Eye,
  Trash2,
  Download,
  Search,
  Filter,
  RefreshCw,
  Printer,
  CheckCircle,
  Truck,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const ServiceOrdersPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const {
    serviceOrders,
    loading,
    pagination,
    filters,
    createServiceOrder,
    updateServiceOrder,
    deleteServiceOrder,
    updateServiceOrderStatus,
    completeServiceOrder,
    deliverServiceOrder,
    cancelServiceOrder,
    printServiceOrder,
    exportServiceOrders,
    applyFilters,
    clearFilters,
    goToPage,
    loadServiceOrders,
  } = useServiceOrders();

  // Estados dos modais
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [selectedServiceOrder, setSelectedServiceOrder] = useState<ServiceOrder | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [formLoading, setFormLoading] = useState(false);

  // Estados dos filtros
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || '');
  const [dateFromFilter, setDateFromFilter] = useState(filters.dateFrom || '');
  const [dateToFilter, setDateToFilter] = useState(filters.dateTo || '');

  // Colunas da tabela
  const columns: Column<ServiceOrder>[] = [
    {
      key: 'number',
      title: 'Número',
      sortable: true,
      render: (number) => (
        <span className="font-mono font-medium">{number}</span>
      ),
    },
    {
      key: 'client',
      title: 'Cliente',
      render: (_, serviceOrder) => (
        <div>
          <p className="font-medium text-gray-900">{serviceOrder.client?.name}</p>
          {serviceOrder.client?.phone && (
            <p className="text-sm text-gray-500">{serviceOrder.client.phone}</p>
          )}
        </div>
      ),
    },
    {
      key: 'vehicle',
      title: 'Veículo',
      render: (_, serviceOrder) => (
        <div>
          <p className="font-medium text-gray-900">{serviceOrder.vehicle?.plate}</p>
          <p className="text-sm text-gray-500">
            {serviceOrder.vehicle?.brand} {serviceOrder.vehicle?.model}
          </p>
        </div>
      ),
    },
    {
      key: 'mechanic',
      title: 'Mecânico',
      render: (_, serviceOrder) => serviceOrder.mechanic?.name || '-',
    },
    {
      key: 'status',
      title: 'Status',
      render: (status) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            SERVICE_ORDER_STATUS_COLORS[status as keyof typeof SERVICE_ORDER_STATUS_COLORS]
          }`}
        >
          {SERVICE_ORDER_STATUS_LABELS[status as keyof typeof SERVICE_ORDER_STATUS_LABELS]}
        </span>
      ),
    },
    {
      key: 'totalAmount',
      title: 'Total',
      sortable: true,
      render: (totalAmount) => (
        <span className="font-medium">
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(totalAmount)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      title: 'Criada em',
      sortable: true,
      render: (createdAt) => format(new Date(createdAt), 'dd/MM/yyyy', { locale: ptBR }),
    },
    {
      key: 'actions',
      title: 'Ações',
      width: '160px',
      render: (_, serviceOrder) => (
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleViewServiceOrder(serviceOrder)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Ver detalhes"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          <ConditionalButton
            permissions={['service_orders:update']}
            onClick={() => handleEditServiceOrder(serviceOrder)}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
          >
            <Edit className="w-4 h-4" />
          </ConditionalButton>
          
          <ConditionalButton
            permissions={['service_orders:update']}
            onClick={() => handlePrintServiceOrder(serviceOrder.id)}
            className="p-1 text-purple-600 hover:bg-purple-50 rounded"
          >
            <Printer className="w-4 h-4" />
          </ConditionalButton>
          
          {/* Ações de status rápidas */}
          {serviceOrder.status === 'in_progress' && (
            <ConditionalButton
              permissions={['service_orders:update']}
              onClick={() => handleQuickStatusChange(serviceOrder, 'completed')}
              className="p-1 text-green-600 hover:bg-green-50 rounded"
            >
              <CheckCircle className="w-4 h-4" />
            </ConditionalButton>
          )}
          
          {serviceOrder.status === 'completed' && (
            <ConditionalButton
              permissions={['service_orders:update']}
              onClick={() => handleQuickStatusChange(serviceOrder, 'delivered')}
              className="p-1 text-purple-600 hover:bg-purple-50 rounded"
            >
              <Truck className="w-4 h-4" />
            </ConditionalButton>
          )}
          
          <ConditionalButton
            permissions={['service_orders:delete']}
            onClick={() => handleDeleteServiceOrder(serviceOrder)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </ConditionalButton>
        </div>
      ),
    },
  ];

  // Handlers
  const handleCreateServiceOrder = () => {
    setSelectedServiceOrder(null);
    setShowForm(true);
  };

  const handleEditServiceOrder = (serviceOrder: ServiceOrder) => {
    setSelectedServiceOrder(serviceOrder);
    setShowForm(true);
  };

  const handleViewServiceOrder = (serviceOrder: ServiceOrder) => {
    setSelectedServiceOrder(serviceOrder);
    setShowDetails(true);
  };

  const handleDeleteServiceOrder = (serviceOrder: ServiceOrder) => {
    setSelectedServiceOrder(serviceOrder);
    setShowDeleteConfirm(true);
  };

  const handleQuickStatusChange = (serviceOrder: ServiceOrder, status: string) => {
    setSelectedServiceOrder(serviceOrder);
    setSelectedStatus(status);
    setShowStatusConfirm(true);
  };

  const handlePrintServiceOrder = async (serviceOrderId: string) => {
    await printServiceOrder(serviceOrderId);
  };

  const handleFormSubmit = async (data: ServiceOrderFormData) => {
    try {
      setFormLoading(true);
      
      if (selectedServiceOrder) {
        await updateServiceOrder(selectedServiceOrder.id, data);
      } else {
        await createServiceOrder(data);
      }
      
      setShowForm(false);
      setSelectedServiceOrder(null);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedServiceOrder) {
      const success = await deleteServiceOrder(selectedServiceOrder.id, selectedServiceOrder.number);
      if (success) {
        setShowDeleteConfirm(false);
        setSelectedServiceOrder(null);
      }
    }
  };

  const handleStatusConfirm = async () => {
    if (selectedServiceOrder && selectedStatus) {
      let success = false;
      
      switch (selectedStatus) {
        case 'completed':
          success = await completeServiceOrder(selectedServiceOrder.id);
          break;
        case 'delivered':
          success = await deliverServiceOrder(selectedServiceOrder.id);
          break;
        case 'cancelled':
          success = await cancelServiceOrder(selectedServiceOrder.id);
          break;
        default:
          success = await updateServiceOrderStatus(selectedServiceOrder.id, selectedStatus as any);
      }
      
      if (success) {
        setShowStatusConfirm(false);
        setSelectedServiceOrder(null);
        setSelectedStatus('');
      }
    }
  };

  const handleApplyFilters = () => {
    const newFilters: any = {
      page: 1,
    };

    if (searchTerm.trim()) {
      newFilters.search = searchTerm.trim();
    }

    if (statusFilter) {
      newFilters.status = statusFilter;
    }

    if (dateFromFilter) {
      newFilters.dateFrom = dateFromFilter;
    }

    if (dateToFilter) {
      newFilters.dateTo = dateToFilter;
    }

    applyFilters(newFilters);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDateFromFilter('');
    setDateToFilter('');
    clearFilters();
  };

  const statusOptions = [
    { value: 'pending', label: 'Pendente' },
    { value: 'in_progress', label: 'Em Andamento' },
    { value: 'waiting_parts', label: 'Aguardando Peças' },
    { value: 'completed', label: 'Concluída' },
    { value: 'delivered', label: 'Entregue' },
    { value: 'cancelled', label: 'Cancelada' },
  ];

  const getStatusConfirmMessage = () => {
    const statusMessages = {
      completed: 'finalizar',
      delivered: 'marcar como entregue',
      cancelled: 'cancelar',
      in_progress: 'iniciar',
      waiting_parts: 'marcar como aguardando peças',
    };
    
    return statusMessages[selectedStatus as keyof typeof statusMessages] || 'alterar status';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ordens de Serviço</h1>
          <p className="text-gray-600">Gerencie as ordens de serviço da oficina</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <ConditionalButton
            permissions={['service_orders:read']}
            onClick={exportServiceOrders}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </ConditionalButton>
          
          <ConditionalButton
            permissions={['service_orders:create']}
            onClick={handleCreateServiceOrder}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova OS
          </ConditionalButton>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Número, cliente, veículo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Inicial
            </label>
            <input
              type="date"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Final
            </label>
            <input
              type="date"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-end space-x-2">
            <button
              onClick={handleApplyFilters}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtrar
            </button>
            <button
              onClick={handleClearFilters}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <PermissionGuard permissions={['service_orders:read']}>
        <DataTable
          data={serviceOrders}
          columns={columns}
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            onChange: goToPage,
          }}
          searchable={false}
          exportable={hasPermission('service_orders:read')}
          refreshable={true}
          onRefresh={loadServiceOrders}
          onExport={exportServiceOrders}
          emptyText="Nenhuma ordem de serviço encontrada"
        />
      </PermissionGuard>

      {/* Modals */}
      <ServiceOrderForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedServiceOrder(null);
        }}
        onSubmit={handleFormSubmit}
        serviceOrder={selectedServiceOrder}
        loading={formLoading}
      />

      <ServiceOrderDetails
        isOpen={showDetails}
        onClose={() => {
          setShowDetails(false);
          setSelectedServiceOrder(null);
        }}
        serviceOrderId={selectedServiceOrder?.id || null}
        onEdit={handleEditServiceOrder}
        onStatusChange={(id, status) => handleQuickStatusChange({ id } as ServiceOrder, status)}
        onPrint={handlePrintServiceOrder}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedServiceOrder(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Excluir Ordem de Serviço"
        message={`Tem certeza que deseja excluir a OS "${selectedServiceOrder?.number}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        type="danger"
        loading={loading}
      />

      <ConfirmModal
        isOpen={showStatusConfirm}
        onClose={() => {
          setShowStatusConfirm(false);
          setSelectedServiceOrder(null);
          setSelectedStatus('');
        }}
        onConfirm={handleStatusConfirm}
        title="Alterar Status"
        message={`Tem certeza que deseja ${getStatusConfirmMessage()} a OS "${selectedServiceOrder?.number}"?`}
        confirmText="Confirmar"
        type="warning"
        loading={loading}
      />
    </div>
  );
};