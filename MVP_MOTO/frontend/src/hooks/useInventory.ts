// Hook para gerenciamento de estoque
// Sistema de Gestão de Oficina Mecânica de Motos

import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';
import { 
  inventoryService, 
  InventoryFilters, 
  StockEntry,
  StockAdjustment,
  InventoryMovement 
} from '@/services/inventoryService';
import { Product } from '@/types';

export const useInventory = (initialFilters: InventoryFilters = {}) => {
  const dispatch = useAppDispatch();
  
  // Estados
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
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
  const [filters, setFilters] = useState<InventoryFilters>({
    page: 1,
    limit: 10,
    ...initialFilters,
  });

  // Estados para alertas
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // Carregar produtos do estoque
  const loadInventory = useCallback(async (newFilters?: InventoryFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentFilters = newFilters || filters;
      const response = await inventoryService.getInventory(currentFilters);
      
      setProducts(response.data.items);
      setPagination(response.data.pagination);
      
      if (newFilters) {
        setFilters(currentFilters);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao carregar estoque';
      setError(errorMessage);
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao carregar estoque',
        message: errorMessage,
      }));
    } finally {
      setLoading(false);
    }
  }, [filters, dispatch]);

  // Carregar movimentações
  const loadMovements = async (movementFilters: any = {}) => {
    try {
      const response = await inventoryService.getMovements(movementFilters);
      setMovements(response.data.items);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao carregar movimentações';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao carregar movimentações',
        message: errorMessage,
      }));
    }
  };

  // Carregar alertas de estoque
  const loadStockAlerts = async () => {
    try {
      const [lowStock, outOfStock] = await Promise.all([
        inventoryService.getLowStockProducts(),
        inventoryService.getOutOfStockProducts(),
      ]);
      
      setLowStockProducts(lowStock);
      setOutOfStockProducts(outOfStock);
    } catch (err: any) {
      console.error('Erro ao carregar alertas de estoque:', err);
    }
  };

  // Carregar categorias
  const loadCategories = async () => {
    try {
      const categoriesData = await inventoryService.getCategories();
      setCategories(categoriesData);
    } catch (err: any) {
      console.error('Erro ao carregar categorias:', err);
    }
  };

  // Registrar entrada de estoque
  const registerEntry = async (data: StockEntry): Promise<boolean> => {
    try {
      setLoading(true);
      await inventoryService.registerEntry(data);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Entrada registrada',
        message: `Entrada de ${data.quantity} unidades registrada com sucesso`,
      }));
      
      // Recarregar estoque
      await loadInventory();
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao registrar entrada';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao registrar entrada',
        message: errorMessage,
      }));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Registrar saída de estoque
  const registerExit = async (productId: string, quantity: number, reason: string, notes?: string): Promise<boolean> => {
    try {
      setLoading(true);
      await inventoryService.registerExit(productId, quantity, reason, notes);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Saída registrada',
        message: `Saída de ${quantity} unidades registrada com sucesso`,
      }));
      
      // Recarregar estoque
      await loadInventory();
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao registrar saída';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao registrar saída',
        message: errorMessage,
      }));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Ajustar estoque
  const adjustStock = async (data: StockAdjustment): Promise<boolean> => {
    try {
      setLoading(true);
      await inventoryService.adjustStock(data);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Estoque ajustado',
        message: `Estoque ajustado para ${data.newQuantity} unidades`,
      }));
      
      // Recarregar estoque
      await loadInventory();
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao ajustar estoque';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao ajustar estoque',
        message: errorMessage,
      }));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Transferir estoque
  const transferStock = async (fromProductId: string, toProductId: string, quantity: number, notes?: string): Promise<boolean> => {
    try {
      setLoading(true);
      await inventoryService.transferStock(fromProductId, toProductId, quantity, notes);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Transferência realizada',
        message: `${quantity} unidades transferidas com sucesso`,
      }));
      
      // Recarregar estoque
      await loadInventory();
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao transferir estoque';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao transferir estoque',
        message: errorMessage,
      }));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Obter detalhes do produto
  const getProductInventory = async (productId: string): Promise<any | null> => {
    try {
      return await inventoryService.getProductInventory(productId);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao carregar detalhes do produto';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao carregar produto',
        message: errorMessage,
      }));
      return null;
    }
  };

  // Exportar estoque
  const exportInventory = async (): Promise<void> => {
    try {
      await inventoryService.exportInventory(filters);
      dispatch(addNotification({
        type: 'success',
        title: 'Exportação concluída',
        message: 'Relatório de estoque exportado com sucesso',
      }));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao exportar estoque';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao exportar',
        message: errorMessage,
      }));
    }
  };

  // Aplicar filtros
  const applyFilters = (newFilters: Partial<InventoryFilters>) => {
    const updatedFilters = {
      ...filters,
      ...newFilters,
      page: newFilters.page || 1, // Reset para primeira página quando filtros mudam
    };
    loadInventory(updatedFilters);
  };

  // Limpar filtros
  const clearFilters = () => {
    const defaultFilters = {
      page: 1,
      limit: filters.limit,
    };
    loadInventory(defaultFilters);
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

  // Carregar dados iniciais
  useEffect(() => {
    loadInventory();
    loadStockAlerts();
    loadCategories();
  }, []);

  return {
    // Estados
    products,
    movements,
    loading,
    error,
    pagination,
    filters,
    lowStockProducts,
    outOfStockProducts,
    categories,
    
    // Ações
    loadInventory,
    loadMovements,
    loadStockAlerts,
    registerEntry,
    registerExit,
    adjustStock,
    transferStock,
    getProductInventory,
    exportInventory,
    
    // Filtros e paginação
    applyFilters,
    clearFilters,
    goToPage,
    changePageSize,
    
    // Utilitários do serviço
    calculateStockValue: inventoryService.calculateStockValue,
    isLowStock: inventoryService.isLowStock,
    isOutOfStock: inventoryService.isOutOfStock,
    calculateStockDays: inventoryService.calculateStockDays,
    suggestReorderQuantity: inventoryService.suggestReorderQuantity,
    formatMovementType: inventoryService.formatMovementType,
    getMovementTypeColor: inventoryService.getMovementTypeColor,
    validateMovementQuantity: inventoryService.validateMovementQuantity,
  };
};