// Hook para gerenciamento de clientes
// Sistema de Gestão de Oficina Mecânica de Motos

import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';
import { clientService, ClientFilters, CreateClientData, UpdateClientData } from '@/services/clientService';
import { Client } from '@/types';

export const useClients = (initialFilters: ClientFilters = {}) => {
  const dispatch = useAppDispatch();
  
  // Estados
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [filters, setFilters] = useState<ClientFilters>({
    page: 1,
    limit: 10,
    ...initialFilters,
  });

  // Carregar clientes
  const loadClients = useCallback(async (newFilters?: ClientFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentFilters = newFilters || filters;
      const response = await clientService.getClients(currentFilters);
      
      setClients(response.data.items);
      setPagination(response.data.pagination);
      
      if (newFilters) {
        setFilters(currentFilters);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao carregar clientes';
      setError(errorMessage);
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao carregar clientes',
        message: errorMessage,
      }));
    } finally {
      setLoading(false);
    }
  }, [filters, dispatch]);

  // Criar cliente
  const createClient = async (data: CreateClientData): Promise<Client | null> => {
    try {
      setLoading(true);
      const newClient = await clientService.createClient(data);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Cliente criado',
        message: `Cliente ${newClient.name} foi criado com sucesso`,
      }));
      
      // Recarregar lista
      await loadClients();
      
      return newClient;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao criar cliente';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao criar cliente',
        message: errorMessage,
      }));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar cliente
  const updateClient = async (id: string, data: UpdateClientData): Promise<Client | null> => {
    try {
      setLoading(true);
      const updatedClient = await clientService.updateClient(id, data);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Cliente atualizado',
        message: `Cliente ${updatedClient.name} foi atualizado com sucesso`,
      }));
      
      // Atualizar na lista local
      setClients(prev => prev.map(client => 
        client.id === id ? updatedClient : client
      ));
      
      return updatedClient;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao atualizar cliente';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao atualizar cliente',
        message: errorMessage,
      }));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Excluir cliente
  const deleteClient = async (id: string, clientName: string): Promise<boolean> => {
    try {
      setLoading(true);
      await clientService.deleteClient(id);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Cliente excluído',
        message: `Cliente ${clientName} foi excluído com sucesso`,
      }));
      
      // Remover da lista local
      setClients(prev => prev.filter(client => client.id !== id));
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao excluir cliente';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao excluir cliente',
        message: errorMessage,
      }));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Alternar status do cliente
  const toggleClientStatus = async (id: string): Promise<boolean> => {
    try {
      const updatedClient = await clientService.toggleClientStatus(id);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Status alterado',
        message: `Cliente ${updatedClient.name} foi ${updatedClient.active ? 'ativado' : 'desativado'}`,
      }));
      
      // Atualizar na lista local
      setClients(prev => prev.map(client => 
        client.id === id ? updatedClient : client
      ));
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao alterar status';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao alterar status',
        message: errorMessage,
      }));
      return false;
    }
  };

  // Buscar cliente por CPF
  const searchClientByCpf = async (cpf: string): Promise<Client | null> => {
    try {
      return await clientService.getClientByCpf(cpf);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao buscar cliente';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao buscar cliente',
        message: errorMessage,
      }));
      return null;
    }
  };

  // Exportar clientes
  const exportClients = async (): Promise<void> => {
    try {
      await clientService.exportClients(filters);
      dispatch(addNotification({
        type: 'success',
        title: 'Exportação concluída',
        message: 'Lista de clientes exportada com sucesso',
      }));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao exportar clientes';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao exportar',
        message: errorMessage,
      }));
    }
  };

  // Aplicar filtros
  const applyFilters = (newFilters: Partial<ClientFilters>) => {
    const updatedFilters = {
      ...filters,
      ...newFilters,
      page: newFilters.page || 1, // Reset para primeira página quando filtros mudam
    };
    loadClients(updatedFilters);
  };

  // Limpar filtros
  const clearFilters = () => {
    const defaultFilters = {
      page: 1,
      limit: filters.limit,
    };
    loadClients(defaultFilters);
  };

  // Ir para página
  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      applyFilters({ page });
    }
  };

  // Alterar tamanho da página
  const changePageSize = (limit: number) => {
    applyFilters({ limit, page: 1 });
  };

  // Carregar na inicialização
  useEffect(() => {
    loadClients();
  }, []);

  return {
    // Estados
    clients,
    loading,
    error,
    pagination,
    filters,
    
    // Ações
    loadClients,
    createClient,
    updateClient,
    deleteClient,
    toggleClientStatus,
    searchClientByCpf,
    exportClients,
    
    // Filtros e paginação
    applyFilters,
    clearFilters,
    goToPage,
    changePageSize,
    
    // Utilitários
    validateCpf: clientService.validateCpf,
    formatCpf: clientService.formatCpf,
    formatPhone: clientService.formatPhone,
  };
};