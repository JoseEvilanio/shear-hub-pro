// Hook para gerenciamento de relatórios
// Sistema de Gestão de Oficina Mecânica de Motos

import { useState, useCallback } from 'react';
import { useAppDispatch } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';
import { 
  reportsService,
  BirthdayReport,
  SalesReport,
  ServiceOrdersReport,
  InventoryReport,
  FinancialReport,
  DashboardMetrics,
  ReportFilters,
} from '@/services/reportsService';

export const useReports = () => {
  const dispatch = useAppDispatch();
  
  // Estados dos relatórios
  const [birthdayReport, setBirthdayReport] = useState<BirthdayReport | null>(null);
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [serviceOrdersReport, setServiceOrdersReport] = useState<ServiceOrdersReport | null>(null);
  const [inventoryReport, setInventoryReport] = useState<InventoryReport | null>(null);
  const [financialReport, setFinancialReport] = useState<FinancialReport | null>(null);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);

  // Estados de loading
  const [birthdayLoading, setBirthdayLoading] = useState(false);
  const [salesLoading, setSalesLoading] = useState(false);
  const [serviceOrdersLoading, setServiceOrdersLoading] = useState(false);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [financialLoading, setFinancialLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Estado de erro
  const [error, setError] = useState<string | null>(null);

  // === RELATÓRIO DE ANIVERSARIANTES ===
  
  const loadBirthdayReport = useCallback(async (month?: number) => {
    try {
      setBirthdayLoading(true);
      setError(null);
      
      const data = await reportsService.getBirthdayReport(month);
      setBirthdayReport(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao carregar relatório de aniversariantes';
      setError(errorMessage);
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao carregar relatório',
        message: errorMessage,
      }));
    } finally {
      setBirthdayLoading(false);
    }
  }, [dispatch]);

  const exportBirthdayReport = async (month?: number): Promise<void> => {
    try {
      await reportsService.exportBirthdayReport(month);
      dispatch(addNotification({
        type: 'success',
        title: 'Exportação concluída',
        message: 'Relatório de aniversariantes exportado com sucesso',
      }));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao exportar relatório';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao exportar',
        message: errorMessage,
      }));
    }
  };

  // === RELATÓRIO DE VENDAS ===
  
  const loadSalesReport = useCallback(async (filters: ReportFilters = {}) => {
    try {
      setSalesLoading(true);
      setError(null);
      
      const data = await reportsService.getSalesReport(filters);
      setSalesReport(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao carregar relatório de vendas';
      setError(errorMessage);
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao carregar relatório',
        message: errorMessage,
      }));
    } finally {
      setSalesLoading(false);
    }
  }, [dispatch]);

  const exportSalesReport = async (filters: ReportFilters = {}): Promise<void> => {
    try {
      await reportsService.exportSalesReport(filters);
      dispatch(addNotification({
        type: 'success',
        title: 'Exportação concluída',
        message: 'Relatório de vendas exportado com sucesso',
      }));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao exportar relatório';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao exportar',
        message: errorMessage,
      }));
    }
  };

  // === RELATÓRIO DE ORDENS DE SERVIÇO ===
  
  const loadServiceOrdersReport = useCallback(async (filters: ReportFilters = {}) => {
    try {
      setServiceOrdersLoading(true);
      setError(null);
      
      const data = await reportsService.getServiceOrdersReport(filters);
      setServiceOrdersReport(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao carregar relatório de ordens de serviço';
      setError(errorMessage);
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao carregar relatório',
        message: errorMessage,
      }));
    } finally {
      setServiceOrdersLoading(false);
    }
  }, [dispatch]);

  const exportServiceOrdersReport = async (filters: ReportFilters = {}): Promise<void> => {
    try {
      await reportsService.exportServiceOrdersReport(filters);
      dispatch(addNotification({
        type: 'success',
        title: 'Exportação concluída',
        message: 'Relatório de ordens de serviço exportado com sucesso',
      }));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao exportar relatório';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao exportar',
        message: errorMessage,
      }));
    }
  };

  // === RELATÓRIO DE ESTOQUE ===
  
  const loadInventoryReport = useCallback(async (filters: ReportFilters = {}) => {
    try {
      setInventoryLoading(true);
      setError(null);
      
      const data = await reportsService.getInventoryReport(filters);
      setInventoryReport(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao carregar relatório de estoque';
      setError(errorMessage);
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao carregar relatório',
        message: errorMessage,
      }));
    } finally {
      setInventoryLoading(false);
    }
  }, [dispatch]);

  const exportInventoryReport = async (filters: ReportFilters = {}): Promise<void> => {
    try {
      await reportsService.exportInventoryReport(filters);
      dispatch(addNotification({
        type: 'success',
        title: 'Exportação concluída',
        message: 'Relatório de estoque exportado com sucesso',
      }));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao exportar relatório';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao exportar',
        message: errorMessage,
      }));
    }
  };

  // === RELATÓRIO FINANCEIRO ===
  
  const loadFinancialReport = useCallback(async (filters: ReportFilters = {}) => {
    try {
      setFinancialLoading(true);
      setError(null);
      
      const data = await reportsService.getFinancialReport(filters);
      setFinancialReport(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao carregar relatório financeiro';
      setError(errorMessage);
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao carregar relatório',
        message: errorMessage,
      }));
    } finally {
      setFinancialLoading(false);
    }
  }, [dispatch]);

  const exportFinancialReport = async (filters: ReportFilters = {}): Promise<void> => {
    try {
      await reportsService.exportFinancialReport(filters);
      dispatch(addNotification({
        type: 'success',
        title: 'Exportação concluída',
        message: 'Relatório financeiro exportado com sucesso',
      }));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao exportar relatório';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao exportar',
        message: errorMessage,
      }));
    }
  };

  // === MÉTRICAS DO DASHBOARD ===
  
  const loadDashboardMetrics = useCallback(async () => {
    try {
      setDashboardLoading(true);
      setError(null);
      
      const data = await reportsService.getDashboardMetrics();
      setDashboardMetrics(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao carregar métricas do dashboard';
      setError(errorMessage);
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao carregar métricas',
        message: errorMessage,
      }));
    } finally {
      setDashboardLoading(false);
    }
  }, [dispatch]);

  return {
    // Estados dos relatórios
    birthdayReport,
    salesReport,
    serviceOrdersReport,
    inventoryReport,
    financialReport,
    dashboardMetrics,
    
    // Estados de loading
    birthdayLoading,
    salesLoading,
    serviceOrdersLoading,
    inventoryLoading,
    financialLoading,
    dashboardLoading,
    
    // Estado de erro
    error,
    
    // Ações de carregamento
    loadBirthdayReport,
    loadSalesReport,
    loadServiceOrdersReport,
    loadInventoryReport,
    loadFinancialReport,
    loadDashboardMetrics,
    
    // Ações de exportação
    exportBirthdayReport,
    exportSalesReport,
    exportServiceOrdersReport,
    exportInventoryReport,
    exportFinancialReport,
    
    // Utilitários do serviço
    formatCurrency: reportsService.formatCurrency,
    formatDate: reportsService.formatDate,
    formatPercentage: reportsService.formatPercentage,
    calculateGrowth: reportsService.calculateGrowth,
    getGrowthColor: reportsService.getGrowthColor,
    getStatusColor: reportsService.getStatusColor,
    formatStatus: reportsService.formatStatus,
    generateChartColors: reportsService.generateChartColors,
  };
};