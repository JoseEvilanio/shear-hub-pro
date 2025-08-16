// Página de Gestão de Vendas
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useState } from 'react';
import { useSales } from '@/hooks/useSales';
import { useAuth } from '@/hooks/useAuth';
import { DataTable, Column } from '@/components/ui/DataTable';
import { PermissionGuard, ConditionalButton } from '@/components/Auth/PermissionGuard';
import { SalesForm, SalesFormData } from '@/components/Sales/SalesForm';
import { SaleDetails } from '@/components/Sales/SaleDetails';
import { ConfirmModal } from '@/components/ui/Modal';
import { Sale } from '@/types';
import { 
  SALE_TYPE_LABELS, 
  SALE_STATUS_LABELS, 
  SALE_STATUS_COLORS,
  PaymentMethod 
} from '@/services/salesService';
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
  XCircle,
  DollarSign,
  Receipt,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const SalesPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const {
    sales,
    loading,
    pagination,
    filters,
    createSale,
    updateSale,
    deleteSale,
    updateSaleStatus,
    confirmSale,
    cancelSale,
    convertQuoteToSale,
    markAsPaid,
    printReceipt,
    printNonFiscalReceipt,
    exportSales,
    applyFilters,
    clearFilters,
    goToPage,
    loadSales,
  } = useSales();

  // Estados dos modais
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('cash');
  const [formLoading, setFormLoading] = useState(false);

  // Estados dos filtros
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [typeFilter, setTypeFilter] = useState(filters.type || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || '');
  const [paidFilter, setPaidFilter] = useState<string>(
    filters.paid === undefined ? 'all' : filters.paid ? 'paid' : 'unpaid'
  );
  const [dateFromFilter, setDateFromFilter] = useState(filters.dateFrom || '');
  const [dateToFilter, setDateToFilter] = useState(filters.dateTo || '');

  // Colunas da tabela
  const columns: Column<Sale>[] = [
    {
      key: 'number',
      title: 'Número',
      sortable: true,
      render: (number, sale) => (
        <div>
          <span className="font-mono font-medium">{number}</span>
          <div className="text-xs text-gray-500">
            {SALE_TYPE_LABELS[sale.type as keyof typeof SALE_TYPE_LABELS]}
          </div>
        </div>
      ),
    },
    {
      key: 'client',
      title: 'Cliente',
      render: (_, sale) => (
        <div>
          {sale.client ? (
            <>
              <p className="font-medium text-gray-900">{sale.client.name}</p>
              {sale.client.phone && (
                <p className="text-sm text-gray-500">{sale.client.phone}</p>
              )}
            </>
          ) : (
            <span className="text-gray-500 italic">Sem cliente</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (status) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            SALE_STATUS_COLORS[status as keyof typeof SALE_STATUS_COLORS]
          }`}
        >
          {SALE_STATUS_LABELS[status as keyof typeof SALE_STATUS_LABELS]}
        </span>
      ),
    },
    {
      key: 'paid',
      title: 'Pagamento',
      render: (paid, sale) => (
        <div className="flex items-center space-x-2">
          {sale.type === 'sale' ? (
            paid ? (
              <span className="flex items-center text-green-600 text-sm">
                <CheckCircle className="w-4 h-4 mr-1" />
                Pago
              </span>
            ) : (
              <span className="flex items-center text-red-600 text-sm">
                <XCircle className="w-4 h-4 mr-1" />
                Pendente
              </span>
            )
          ) : (
            <span className="text-gray-500 text-sm">N/A</span>
          )}
        </div>
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
      width: '180px',
      render: (_, sale) => (
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleViewSale(sale)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Ver detalhes"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          <ConditionalButton
            permissions={['sales:update']}
            onClick={() => handleEditSale(sale)}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
          >
            <Edit className="w-4 h-4" />
          </ConditionalButton>
          
          <ConditionalButton
            permissions={['sales:update']}
            onClick={() => handlePrintSale(sale.id)}
            className="p-1 text-purple-600 hover:bg-purple-50 rounded"
          >
            <Printer className="w-4 h-4" />
          </ConditionalButton>

          {sale.type === 'sale' && (
            <ConditionalButton
              permissions={['sales:update']}
              onClick={() => handlePrintNonFiscal(sale.id)}
              className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
            >
              <Receipt className="w-4 h-4" />
            </ConditionalButton>
          )}
          
          {/* Ações rápidas baseadas no status */}
          {sale.type === 'quote' && ['draft', 'pending'].includes(sale.status) && (
            <ConditionalButton
              permissions={['sales:update']}
              onClick={() => handleQuickAction(sale, 'convert')}
              className="p-1 text-green-600 hover:bg-green-50 rounded"
            >
              <RefreshCw className="w-4 h-4" />
            </ConditionalButton>
          )}
          
          {sale.status === 'pending' && (
            <ConditionalButton
              permissions={['sales:update']}
              onClick={() => handleQuickAction(sale, 'confirm')}
              className="p-1 text-green-600 hover:bg-green-50 rounded"
            >
              <CheckCircle className="w-4 h-4" />
            </ConditionalButton>
          )}
          
          {!sale.paid && sale.type === 'sale' && (sale.status as any) === 'confirmed' && (
            <ConditionalButton
              permissions={['sales:update']}
              onClick={() => handleMarkAsPaid(sale)}
              className="p-1 text-purple-600 hover:bg-purple-50 rounded"
            >
              <DollarSign className="w-4 h-4" />
            </ConditionalButton>
          )}
          
          <ConditionalButton
            permissions={['sales:delete']}
            onClick={() => handleDeleteSale(sale)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </ConditionalButton>
        </div>
      ),
    },
  ];

  // Handlers
  const handleCreateSale = () => {
    setSelectedSale(null);
    setShowForm(true);
  };

  const handleEditSale = (sale: Sale) => {
    setSelectedSale(sale);
    setShowForm(true);
  };

  const handleViewSale = (sale: Sale) => {
    setSelectedSale(sale);
    setShowDetails(true);
  };

  const handleDeleteSale = (sale: Sale) => {
    setSelectedSale(sale);
    setShowDeleteConfirm(true);
  };

  const handleQuickAction = (sale: Sale, action: string) => {
    setSelectedSale(sale);
    setSelectedAction(action);
    setShowStatusConfirm(true);
  };

  const handleMarkAsPaid = (sale: Sale) => {
    setSelectedSale(sale);
    setShowPaymentModal(true);
  };

  const handlePrintSale = async (saleId: string) => {
    await printReceipt(saleId);
  };

  const handlePrintNonFiscal = async (saleId: string) => {
    await printNonFiscalReceipt(saleId);
  };

  const handleFormSubmit = async (data: SalesFormData) => {
    try {
      setFormLoading(true);
      
      if (selectedSale) {
        await updateSale(selectedSale.id, data);
      } else {
        await createSale(data);
      }
      
      setShowForm(false);
      setSelectedSale(null);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedSale) {
      const success = await deleteSale(selectedSale.id, selectedSale.number);
      if (success) {
        setShowDeleteConfirm(false);
        setSelectedSale(null);
      }
    }
  };

  const handleStatusConfirm = async () => {
    if (selectedSale && selectedAction) {
      let success = false;
      
      switch (selectedAction) {
        case 'confirm':
          success = await confirmSale(selectedSale.id);
          break;
        case 'cancel':
          success = await cancelSale(selectedSale.id);
          break;
        case 'convert':
          success = await convertQuoteToSale(selectedSale.id);
          break;
        default:
          success = await updateSaleStatus(selectedSale.id, selectedAction as any);
      }
      
      if (success) {
        setShowStatusConfirm(false);
        setSelectedSale(null);
        setSelectedAction('');
      }
    }
  };

  const handlePaymentConfirm = async () => {
    if (selectedSale) {
      const success = await markAsPaid(selectedSale.id, selectedPaymentMethod);
      if (success) {
        setShowPaymentModal(false);
        setSelectedSale(null);
        setSelectedPaymentMethod('cash');
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

    if (typeFilter) {
      newFilters.type = typeFilter;
    }

    if (statusFilter) {
      newFilters.status = statusFilter;
    }

    if (paidFilter !== 'all') {
      newFilters.paid = paidFilter === 'paid';
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
    setTypeFilter('');
    setStatusFilter('');
    setPaidFilter('all');
    setDateFromFilter('');
    setDateToFilter('');
    clearFilters();
  };

  const getActionConfirmMessage = () => {
    const actionMessages = {
      confirm: 'confirmar',
      cancel: 'cancelar',
      convert: 'converter em venda',
    };
    
    return actionMessages[selectedAction as keyof typeof actionMessages] || 'alterar';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendas</h1>
          <p className="text-gray-600">Gerencie vendas e orçamentos da oficina</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <ConditionalButton
            permissions={['sales:read']}
            onClick={exportSales}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </ConditionalButton>
          
          <ConditionalButton
            permissions={['sales:create']}
            onClick={handleCreateSale}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Venda
          </ConditionalButton>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Número, cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="sale">Vendas</option>
              <option value="quote">Orçamentos</option>
            </select>
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
              <option value="draft">Rascunho</option>
              <option value="pending">Pendente</option>
              <option value="confirmed">Confirmada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pagamento
            </label>
            <select
              value={paidFilter}
              onChange={(e) => setPaidFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="paid">Pagos</option>
              <option value="unpaid">Pendentes</option>
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

          <div className="flex items-end space-x-2">
            <div className="flex-1">
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
      <PermissionGuard permissions={['sales:read']}>
        <DataTable
          data={sales}
          columns={columns}
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            onChange: goToPage,
          }}
          searchable={false}
          exportable={hasPermission('sales:read')}
          refreshable={true}
          onRefresh={loadSales}
          onExport={exportSales}
          emptyText="Nenhuma venda encontrada"
        />
      </PermissionGuard>

      {/* Modals */}
      <SalesForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedSale(null);
        }}
        onSubmit={handleFormSubmit}
        sale={selectedSale}
        loading={formLoading}
      />

      <SaleDetails
        isOpen={showDetails}
        onClose={() => {
          setShowDetails(false);
          setSelectedSale(null);
        }}
        saleId={selectedSale?.id || null}
        onEdit={handleEditSale}
        onStatusChange={(id, action) => handleQuickAction({ id } as Sale, action)}
        onPrint={handlePrintSale}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedSale(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Excluir Venda"
        message={`Tem certeza que deseja excluir a ${selectedSale?.type === 'sale' ? 'venda' : 'orçamento'} "${selectedSale?.number}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        type="danger"
        loading={loading}
      />

      <ConfirmModal
        isOpen={showStatusConfirm}
        onClose={() => {
          setShowStatusConfirm(false);
          setSelectedSale(null);
          setSelectedAction('');
        }}
        onConfirm={handleStatusConfirm}
        title="Confirmar Ação"
        message={`Tem certeza que deseja ${getActionConfirmMessage()} a ${selectedSale?.type === 'sale' ? 'venda' : 'orçamento'} "${selectedSale?.number}"?`}
        confirmText="Confirmar"
        type="warning"
        loading={loading}
      />

      {/* Modal de Pagamento */}
      <ConfirmModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedSale(null);
          setSelectedPaymentMethod('cash');
        }}
        onConfirm={handlePaymentConfirm}
        title="Marcar como Pago"
        message={`Marcar a venda "${selectedSale?.number}" como paga?`}
        confirmText="Marcar como Pago"
        type="info"
        loading={loading}
      />
    </div>
  );
};