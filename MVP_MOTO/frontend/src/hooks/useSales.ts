// Hook para gerenciamento de vendas
// Sistema de Gestão de Oficina Mecânica de Motos

import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';
import { 
  salesService, 
  SalesFilters, 
  CreateSaleData, 
  UpdateSaleData,
  SaleStatus,
  PaymentMethod 
} from '@/services/salesService';
import { Sale } from '@/types';

export const useSales = (initialFilters: SalesFilters = {}) => {
  const dispatch = useAppDispatch();
  
  // Estados
  const [sales, setSales] = useState<Sale[]>([]);
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
  const [filters, setFilters] = useState<SalesFilters>({
    page: 1,
    limit: 10,
    ...initialFilters,
  });

  // Carregar vendas
  const loadSales = useCallback(async (newFilters?: SalesFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentFilters = newFilters || filters;
      const response = await salesService.getSales(currentFilters);
      
      setSales(response.data.items);
      setPagination(response.data.pagination);
      
      if (newFilters) {
        setFilters(currentFilters);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao carregar vendas';
      setError(errorMessage);
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao carregar vendas',
        message: errorMessage,
      }));
    } finally {
      setLoading(false);
    }
  }, [filters, dispatch]);

  // Obter venda por ID
  const getSaleById = async (id: string): Promise<Sale | null> => {
    try {
      return await salesService.getSaleById(id);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao carregar venda';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao carregar venda',
        message: errorMessage,
      }));
      return null;
    }
  };

  // Criar venda
  const createSale = async (data: CreateSaleData): Promise<Sale | null> => {
    try {
      setLoading(true);
      const newSale = await salesService.createSale(data);
      
      dispatch(addNotification({
        type: 'success',
        title: `${data.type === 'sale' ? 'Venda' : 'Orçamento'} criado`,
        message: `${data.type === 'sale' ? 'Venda' : 'Orçamento'} ${newSale.number} foi criado com sucesso`,
      }));
      
      // Recarregar lista
      await loadSales();
      
      return newSale;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao criar venda';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao criar venda',
        message: errorMessage,
      }));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar venda
  const updateSale = async (id: string, data: UpdateSaleData): Promise<Sale | null> => {
    try {
      setLoading(true);
      const updatedSale = await salesService.updateSale(id, data);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Venda atualizada',
        message: `${updatedSale.type === 'sale' ? 'Venda' : 'Orçamento'} ${updatedSale.number} foi atualizado com sucesso`,
      }));
      
      // Atualizar na lista local
      setSales(prev => prev.map(sale => 
        sale.id === id ? updatedSale : sale
      ));
      
      return updatedSale;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao atualizar venda';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao atualizar venda',
        message: errorMessage,
      }));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Alterar status da venda
  const updateSaleStatus = async (id: string, status: SaleStatus): Promise<boolean> => {
    try {
      const updatedSale = await salesService.updateSaleStatus(id, status);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Status alterado',
        message: `${updatedSale.type === 'sale' ? 'Venda' : 'Orçamento'} ${updatedSale.number} teve o status alterado`,
      }));
      
      // Atualizar na lista local
      setSales(prev => prev.map(sale => 
        sale.id === id ? updatedSale : sale
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

  // Confirmar venda
  const confirmSale = async (id: string): Promise<boolean> => {
    try {
      const updatedSale = await salesService.confirmSale(id);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Venda confirmada',
        message: `Venda ${updatedSale.number} foi confirmada e o estoque foi atualizado`,
      }));
      
      // Atualizar na lista local
      setSales(prev => prev.map(sale => 
        sale.id === id ? updatedSale : sale
      ));
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao confirmar venda';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao confirmar venda',
        message: errorMessage,
      }));
      return false;
    }
  };

  // Cancelar venda
  const cancelSale = async (id: string, reason?: string): Promise<boolean> => {
    try {
      const updatedSale = await salesService.cancelSale(id, reason);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Venda cancelada',
        message: `${updatedSale.type === 'sale' ? 'Venda' : 'Orçamento'} ${updatedSale.number} foi cancelado`,
      }));
      
      // Atualizar na lista local
      setSales(prev => prev.map(sale => 
        sale.id === id ? updatedSale : sale
      ));
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao cancelar venda';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao cancelar venda',
        message: errorMessage,
      }));
      return false;
    }
  };

  // Converter orçamento em venda
  const convertQuoteToSale = async (id: string): Promise<boolean> => {
    try {
      const updatedSale = await salesService.convertQuoteToSale(id);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Orçamento convertido',
        message: `Orçamento ${updatedSale.number} foi convertido em venda`,
      }));
      
      // Atualizar na lista local
      setSales(prev => prev.map(sale => 
        sale.id === id ? updatedSale : sale
      ));
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao converter orçamento';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao converter orçamento',
        message: errorMessage,
      }));
      return false;
    }
  };

  // Marcar como pago
  const markAsPaid = async (id: string, paymentMethod: PaymentMethod): Promise<boolean> => {
    try {
      const updatedSale = await salesService.markAsPaid(id, paymentMethod);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Pagamento registrado',
        message: `Venda ${updatedSale.number} foi marcada como paga`,
      }));
      
      // Atualizar na lista local
      setSales(prev => prev.map(sale => 
        sale.id === id ? updatedSale : sale
      ));
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao registrar pagamento';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao registrar pagamento',
        message: errorMessage,
      }));
      return false;
    }
  };

  // Excluir venda
  const deleteSale = async (id: string, saleNumber: string): Promise<boolean> => {
    try {
      setLoading(true);
      await salesService.deleteSale(id);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Venda excluída',
        message: `Venda ${saleNumber} foi excluída com sucesso`,
      }));
      
      // Remover da lista local
      setSales(prev => prev.filter(sale => sale.id !== id));
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao excluir venda';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao excluir venda',
        message: errorMessage,
      }));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Buscar produto por código de barras
  const getProductByBarcode = async (barcode: string): Promise<any | null> => {
    try {
      return await salesService.getProductByBarcode(barcode);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Produto não encontrado';
      dispatch(addNotification({
        type: 'error',
        title: 'Produto não encontrado',
        message: errorMessage,
      }));
      return null;
    }
  };

  // Imprimir comprovante
  const printReceipt = async (id: string, printerType: 'laser' | 'inkjet' | 'matrix' = 'laser'): Promise<void> => {
    try {
      await salesService.printReceipt(id, printerType);
      dispatch(addNotification({
        type: 'success',
        title: 'Impressão iniciada',
        message: 'O comprovante está sendo impresso',
      }));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao imprimir comprovante';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao imprimir',
        message: errorMessage,
      }));
    }
  };

  // Imprimir cupom não fiscal
  const printNonFiscalReceipt = async (id: string): Promise<void> => {
    try {
      await salesService.printNonFiscalReceipt(id);
      dispatch(addNotification({
        type: 'success',
        title: 'Impressão iniciada',
        message: 'O cupom não fiscal está sendo impresso',
      }));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao imprimir cupom';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao imprimir',
        message: errorMessage,
      }));
    }
  };

  // Exportar vendas
  const exportSales = async (): Promise<void> => {
    try {
      await salesService.exportSales(filters);
      dispatch(addNotification({
        type: 'success',
        title: 'Exportação concluída',
        message: 'Lista de vendas exportada com sucesso',
      }));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao exportar vendas';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao exportar',
        message: errorMessage,
      }));
    }
  };

  // Gerar número da venda
  const generateSaleNumber = async (): Promise<string | null> => {
    try {
      return await salesService.generateSaleNumber();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao gerar número da venda';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao gerar número',
        message: errorMessage,
      }));
      return null;
    }
  };

  // Aplicar filtros
  const applyFilters = (newFilters: Partial<SalesFilters>) => {
    const updatedFilters = {
      ...filters,
      ...newFilters,
      page: newFilters.page || 1, // Reset para primeira página quando filtros mudam
    };
    loadSales(updatedFilters);
  };

  // Limpar filtros
  const clearFilters = () => {
    const defaultFilters = {
      page: 1,
      limit: filters.limit,
    };
    loadSales(defaultFilters);
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
    loadSales();
  }, []);

  return {
    // Estados
    sales,
    loading,
    error,
    pagination,
    filters,
    
    // Ações CRUD
    loadSales,
    getSaleById,
    createSale,
    updateSale,
    deleteSale,
    
    // Ações de status
    updateSaleStatus,
    confirmSale,
    cancelSale,
    convertQuoteToSale,
    markAsPaid,
    
    // Outras ações
    getProductByBarcode,
    printReceipt,
    printNonFiscalReceipt,
    exportSales,
    generateSaleNumber,
    
    // Filtros e paginação
    applyFilters,
    clearFilters,
    goToPage,
    changePageSize,
    
    // Utilitários do serviço
    calculateTotal: salesService.calculateSaleTotal,
    calculateSubtotal: salesService.calculateSubtotal,
    calculateTotalDiscount: salesService.calculateTotalDiscount,
    canEditSale: salesService.canEditSale,
    canCancelSale: salesService.canCancelSale,
    canConvertQuote: salesService.canConvertQuote,
    formatNumber: salesService.formatSaleNumber,
    validateBarcode: salesService.validateBarcode,
  };
};