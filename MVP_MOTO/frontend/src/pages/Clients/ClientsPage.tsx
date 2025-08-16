// Página de Gestão de Clientes
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useState } from 'react';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/hooks/useAuth';
import { DataTable, Column } from '@/components/ui/DataTable';
import { PermissionGuard, ConditionalButton } from '@/components/Auth/PermissionGuard';
import { ClientForm, ClientFormData } from '@/components/Clients/ClientForm';
import { ClientDetails } from '@/components/Clients/ClientDetails';
import { ConfirmModal } from '@/components/ui/Modal';
import { Client } from '@/types';
import {
  Plus,
  Edit,
  Eye,
  Trash2,
  UserCheck,
  UserX,
  Download,
  Search,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const ClientsPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const {
    clients,
    loading,
    pagination,
    filters,
    createClient,
    updateClient,
    deleteClient,
    toggleClientStatus,
    exportClients,
    applyFilters,
    clearFilters,
    goToPage,
    loadClients,
  } = useClients();

  // Estados dos modais
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Estados dos filtros
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState<string>(
    filters.active === undefined ? 'all' : filters.active ? 'active' : 'inactive'
  );
  const [birthMonthFilter, setBirthMonthFilter] = useState<string>(
    filters.birthMonth?.toString() || ''
  );

  // Colunas da tabela
  const columns: Column<Client>[] = [
    {
      key: 'name',
      title: 'Nome',
      sortable: true,
      render: (_, client) => (
        <div>
          <p className="font-medium text-gray-900">{client.name}</p>
          {client.email && (
            <p className="text-sm text-gray-500">{client.email}</p>
          )}
        </div>
      ),
    },
    {
      key: 'cpf',
      title: 'CPF',
      render: (cpf) => cpf || '-',
    },
    {
      key: 'phone',
      title: 'Telefone',
      render: (phone) => phone || '-',
    },
    {
      key: 'birthDate',
      title: 'Aniversário',
      render: (birthDate) => {
        if (!birthDate) return '-';
        return format(new Date(birthDate), 'dd/MM', { locale: ptBR });
      },
    },
    {
      key: 'active',
      title: 'Status',
      render: (active) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            active
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {active ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      title: 'Cadastrado em',
      sortable: true,
      render: (createdAt) => format(new Date(createdAt), 'dd/MM/yyyy', { locale: ptBR }),
    },
    {
      key: 'actions',
      title: 'Ações',
      width: '120px',
      render: (_, client) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewClient(client)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Ver detalhes"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          <ConditionalButton
            permissions={['clients:update']}
            onClick={() => handleEditClient(client)}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
          >
            <Edit className="w-4 h-4" />
          </ConditionalButton>
          
          <ConditionalButton
            permissions={['clients:update']}
            onClick={() => handleToggleStatus(client)}
            className={`p-1 rounded ${
              client.active
                ? 'text-red-600 hover:bg-red-50'
                : 'text-green-600 hover:bg-green-50'
            }`}
          >
            {client.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
          </ConditionalButton>
          
          <ConditionalButton
            permissions={['clients:delete']}
            onClick={() => handleDeleteClient(client)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </ConditionalButton>
        </div>
      ),
    },
  ];

  // Handlers
  const handleCreateClient = () => {
    setSelectedClient(null);
    setShowForm(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setShowForm(true);
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setShowDetails(true);
  };

  const handleDeleteClient = (client: Client) => {
    setSelectedClient(client);
    setShowDeleteConfirm(true);
  };

  const handleToggleStatus = async (client: Client) => {
    await toggleClientStatus(client.id);
  };

  const handleFormSubmit = async (data: ClientFormData) => {
    try {
      setFormLoading(true);
      
      if (selectedClient) {
        await updateClient(selectedClient.id, data);
      } else {
        await createClient(data);
      }
      
      setShowForm(false);
      setSelectedClient(null);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedClient) {
      const success = await deleteClient(selectedClient.id, selectedClient.name);
      if (success) {
        setShowDeleteConfirm(false);
        setSelectedClient(null);
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

    if (statusFilter !== 'all') {
      newFilters.active = statusFilter === 'active';
    }

    if (birthMonthFilter) {
      newFilters.birthMonth = parseInt(birthMonthFilter);
    }

    applyFilters(newFilters);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setBirthMonthFilter('');
    clearFilters();
  };

  const months = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gerencie os clientes da oficina</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <ConditionalButton
            permissions={['clients:read']}
            onClick={exportClients}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </ConditionalButton>
          
          <ConditionalButton
            permissions={['clients:create']}
            onClick={handleCreateClient}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </ConditionalButton>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Nome, CPF, email..."
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
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mês de Aniversário
            </label>
            <select
              value={birthMonthFilter}
              onChange={(e) => setBirthMonthFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todos os meses</option>
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
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
      <PermissionGuard permissions={['clients:read']}>
        <DataTable
          data={clients}
          columns={columns}
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            onChange: goToPage,
          }}
          searchable={false}
          exportable={hasPermission('clients:read')}
          refreshable={true}
          onRefresh={loadClients}
          onExport={exportClients}
          emptyText="Nenhum cliente encontrado"
        />
      </PermissionGuard>

      {/* Modals */}
      <ClientForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedClient(null);
        }}
        onSubmit={handleFormSubmit}
        client={selectedClient}
        loading={formLoading}
      />

      <ClientDetails
        isOpen={showDetails}
        onClose={() => {
          setShowDetails(false);
          setSelectedClient(null);
        }}
        clientId={selectedClient?.id || null}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedClient(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Excluir Cliente"
        message={`Tem certeza que deseja excluir o cliente "${selectedClient?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        type="danger"
        loading={loading}
      />
    </div>
  );
};