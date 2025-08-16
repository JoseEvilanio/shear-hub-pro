// Hook para gerenciamento de ordens de serviço
// Sistema de Gestão de Oficina Mecânica de Motos

import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';
import { 
  serviceOrderService, 
  ServiceOrderFilters, 
  CreateServiceOrderData, 
  UpdateServiceOrderData,
  ServiceOrderStatus 
} from '@/services/serviceOrderService';
import { ServiceOrder } from '@/types';

export const useServiceOrders = (initialFilters: ServiceOrderFilters = {}) => {
  const dispatch = useAppDispatch();
  
  // Estados
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
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
  const [filters, setFilters] = useState<ServiceOrderFilters>({
    page: 1,
    limit: 10,
    ...initialFilters,
  });

  // Carregar ordens de serviço
  const loadServiceOrders = useCallback(async (newFilters?: ServiceOrderFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentFilters = newFilters || filters;
      const response = await serviceOrderService.getServiceOrders(currentFilters);
      
      setServiceOrders(response.data.items);
      setPagination(response.data.pagination);
      
      if (newFilters) {
        setFilters(currentFilters);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao carregar ordens de serviço';
      setError(errorMessage);
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao carregar ordens de serviço',
        message: errorMessage,
      }));
    } finally {
      setLoading(false);
    }
  }, [filters, dispatch]);

  // Obter ordem de serviço por ID
  const getServiceOrderById = async (id: string): Promise<ServiceOrder | null> => {
    try {
      return await serviceOrderService.getServiceOrderById(id);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao carregar ordem de serviço';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao carregar ordem de serviço',
        message: errorMessage,
      }));
      return null;
    }
  };

  // Criar ordem de serviço
  const createServiceOrder = async (data: CreateServiceOrderData): Promise<ServiceOrder | null> => {
    try {
      setLoading(true);
      const newServiceOrder = await serviceOrderService.createServiceOrder(data);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Ordem de serviço criada',
        message: `OS ${newServiceOrder.number} foi criada com sucesso`,
      }));
      
      // Recarregar lista
      await loadServiceOrders();
      
      return newServiceOrder;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao criar ordem de serviço';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao criar ordem de serviço',
        message: errorMessage,
      }));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar ordem de serviço
  const updateServiceOrder = async (id: string, data: UpdateServiceOrderData): Promise<ServiceOrder | null> => {
    try {
      setLoading(true);
      const updatedServiceOrder = await serviceOrderService.updateServiceOrder(id, data);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Ordem de serviço atualizada',
        message: `OS ${updatedServiceOrder.number} foi atualizada com sucesso`,
      }));
      
      // Atualizar na lista local
      setServiceOrders(prev => prev.map(so => 
        so.id === id ? updatedServiceOrder : so
      ));
      
      return updatedServiceOrder;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao atualizar ordem de serviço';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao atualizar ordem de serviço',
        message: errorMessage,
      }));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Alterar status da ordem de serviço
  const updateServiceOrderStatus = async (id: string, status: ServiceOrderStatus): Promise<boolean> => {
    try {
      const updatedServiceOrder = await serviceOrderService.updateServiceOrderStatus(id, status);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Status alterado',
        message: `OS ${updatedServiceOrder.number} teve o status alterado para ${status}`,
      }));
      
      // Atualizar na lista local
      setServiceOrders(prev => prev.map(so => 
        so.id === id ? updatedServiceOrder : so
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

  // Excluir ordem de serviço
  const deleteServiceOrder = async (id: string, serviceOrderNumber: string): Promise<boolean> => {
    try {
      setLoading(true);
      await serviceOrderService.deleteServiceOrder(id);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Ordem de serviço excluída',
        message: `OS ${serviceOrderNumber} foi excluída com sucesso`,
      }));
      
      // Remover da lista local
      setServiceOrders(prev => prev.filter(so => so.id !== id));
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao excluir ordem de serviço';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao excluir ordem de serviço',
        message: errorMessage,
      }));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Finalizar ordem de serviço
  const completeServiceOrder = async (id: string): Promise<boolean> => {
    try {
      const updatedServiceOrder = await serviceOrderService.completeServiceOrder(id);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Ordem de serviço finalizada',
        message: `OS ${updatedServiceOrder.number} foi finalizada com sucesso`,
      }));
      
      // Atualizar na lista local
      setServiceOrders(prev => prev.map(so => 
        so.id === id ? updatedServiceOrder : so
      ));
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao finalizar ordem de serviço';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao finalizar ordem de serviço',
        message: errorMessage,
      }));
      return false;
    }
  };

  // Entregar ordem de serviço
  const deliverServiceOrder = async (id: string): Promise<boolean> => {
    try {
      const updatedServiceOrder = await serviceOrderService.deliverServiceOrder(id);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Ordem de serviço entregue',
        message: `OS ${updatedServiceOrder.number} foi marcada como entregue`,
      }));
      
      // Atualizar na lista local
      setServiceOrders(prev => prev.map(so => 
        so.id === id ? updatedServiceOrder : so
      ));
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao entregar ordem de serviço';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao entregar ordem de serviço',
        message: errorMessage,
      }));
      return false;
    }
  };

  // Cancelar ordem de serviço
  const cancelServiceOrder = async (id: string, reason?: string): Promise<boolean> => {
    try {
      const updatedServiceOrder = await serviceOrderService.cancelServiceOrder(id, reason);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Ordem de serviço cancelada',
        message: `OS ${updatedServiceOrder.number} foi cancelada`,
      }));
      
      // Atualizar na lista local
      setServiceOrders(prev => prev.map(so => 
        so.id === id ? updatedServiceOrder : so
      ));
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao cancelar ordem de serviço';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao cancelar ordem de serviço',
        message: errorMessage,
      }));
      return false;
    }
  };

  // Imprimir ordem de serviço
  const printServiceOrder = async (id: string, printerType: 'laser' | 'inkjet' | 'matrix' = 'laser'): Promise<void> => {
    try {
      await serviceOrderService.printServiceOrder(id, printerType);
      dispatch(addNotification({
        type: 'success',
        title: 'Impressão iniciada',
        message: 'A ordem de serviço está sendo impressa',
      }));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao imprimir ordem de serviço';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao imprimir',
        message: errorMessage,
      }));
    }
  };

  // Exportar ordens de serviço
  const exportServiceOrders = async (): Promise<void> => {
    try {
      await serviceOrderService.exportServiceOrders(filters);
      dispatch(addNotification({
        type: 'success',
        title: 'Exportação concluída',
        message: 'Lista de ordens de serviço exportada com sucesso',
      }));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao exportar ordens de serviço';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao exportar',
        message: errorMessage,
      }));
    }
  };

  // Gerar número da ordem de serviço
  const generateServiceOrderNumber = async (): Promise<string | null> => {
    try {
      return await serviceOrderService.generateServiceOrderNumber();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao gerar número da OS';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao gerar número',
        message: errorMessage,
      }));
      return null;
    }
  };

  // Aplicar filtros
  const applyFilters = (newFilters: Partial<ServiceOrderFilters>) => {
    const updatedFilters = {
      ...filters,
      ...newFilters,
      page: newFilters.page || 1, // Reset para primeira página quando filtros mudam
    };
    loadServiceOrders(updatedFilters);
  };

  // Limpar filtros
  const clearFilters = () => {
    const defaultFilters = {
      page: 1,
      limit: filters.limit,
    };
    loadServiceOrders(defaultFilters);
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
    loadServiceOrders();
  }, []);

  return {
    // Estados
    serviceOrders,
    loading,
    error,
    pagination,
    filters,
    
    // Ações CRUD
    loadServiceOrders,
    getServiceOrderById,
    createServiceOrder,
    updateServiceOrder,
    deleteServiceOrder,
    
    // Ações de status
    updateServiceOrderStatus,
    completeServiceOrder,
    deliverServiceOrder,
    cancelServiceOrder,
    
    // Outras ações
    printServiceOrder,
    exportServiceOrders,
    generateServiceOrderNumber,
    
    // Filtros e paginação
    applyFilters,
    clearFilters,
    goToPage,
    changePageSize,
    
    // Utilitários do serviço
    getNextStatuses: serviceOrderService.getNextStatuses,
    canEditServiceOrder: serviceOrderService.canEditServiceOrder,
    canCancelServiceOrder: serviceOrderService.canCancelServiceOrder,
    calculateTotal: serviceOrderService.calculateServiceOrderTotal,
    formatNumber: serviceOrderService.formatServiceOrderNumber,
  };
};