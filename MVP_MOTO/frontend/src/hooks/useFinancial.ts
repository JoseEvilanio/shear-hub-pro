// Hook para gerenciamento financeiro
// Sistema de Gestão de Oficina Mecânica de Motos

import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';
import { 
  financialService,
  FinancialDashboard,
  AccountPayable,
  AccountReceivable,
  CashMovement,
  FinancialFilters,
  CreateAccountPayable,
  CreateAccountReceivable,
  CreateCashMovement,
  PaymentData,
} from '@/services/financialService';

export const useFinancial = () => {
  const dispatch = useAppDispatch();
  
  // Estados do Dashboard
  const [dashboard, setDashboard] = useState<FinancialDashboard | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Estados das Contas a Pagar
  const [accountsPayable, setAccountsPayable] = useState<AccountPayable[]>([]);
  const [payableLoading, setPayableLoading] = useState(false);
  const [payablePagination, setPayablePagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Estados das Contas a Receber
  const [accountsReceivable, setAccountsReceivable] = useState<AccountReceivable[]>([]);
  const [receivableLoading, setReceivableLoading] = useState(false);
  const [receivablePagination, setReceivablePagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Estados das Movimentações de Caixa
  const [cashMovements, setCashMovements] = useState<CashMovement[]>([]);
  const [cashLoading, setCashLoading] = useState(false);
  const [cashPagination, setCashPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Estados gerais
  const [error, setError] = useState<string | null>(null);
  const [incomeCategories, setIncomeCategories] = useState<string[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<string[]>([]);

  // === DASHBOARD ===
  
  const loadDashboard = useCallback(async (filters: { dateFrom?: string; dateTo?: string } = {}) => {
    try {
      setDashboardLoading(true);
      setError(null);
      
      const data = await financialService.getDashboard(filters);
      setDashboard(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao carregar dashboard financeiro';
      setError(errorMessage);
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao carregar dashboard',
        message: errorMessage,
      }));
    } finally {
      setDashboardLoading(false);
    }
  }, [dispatch]);

  // === CONTAS A PAGAR ===
  
  const loadAccountsPayable = useCallback(async (filters: FinancialFilters = {}) => {
    try {
      setPayableLoading(true);
      setError(null);
      
      const response = await financialService.getAccountsPayable(filters);
      setAccountsPayable(response.data.items);
      setPayablePagination(response.data.pagination);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao carregar contas a pagar';
      setError(errorMessage);
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao carregar contas a pagar',
        message: errorMessage,
      }));
    } finally {
      setPayableLoading(false);
    }
  }, [dispatch]);

  const createAccountPayable = async (data: CreateAccountPayable): Promise<boolean> => {
    try {
      await financialService.createAccountPayable(data);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Conta a pagar criada',
        message: 'Conta a pagar criada com sucesso',
      }));
      
      // Recarregar dados
      await loadAccountsPayable();
      await loadDashboard();
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao criar conta a pagar';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao criar conta',
        message: errorMessage,
      }));
      return false;
    }
  };

  const updateAccountPayable = async (id: string, data: Partial<CreateAccountPayable>): Promise<boolean> => {
    try {
      await financialService.updateAccountPayable(id, data);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Conta atualizada',
        message: 'Conta a pagar atualizada com sucesso',
      }));
      
      // Recarregar dados
      await loadAccountsPayable();
      await loadDashboard();
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao atualizar conta a pagar';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao atualizar conta',
        message: errorMessage,
      }));
      return false;
    }
  };

  const payAccount = async (id: string, paymentData: PaymentData): Promise<boolean> => {
    try {
      await financialService.payAccount(id, paymentData);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Pagamento realizado',
        message: 'Pagamento registrado com sucesso',
      }));
      
      // Recarregar dados
      await loadAccountsPayable();
      await loadDashboard();
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao registrar pagamento';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro no pagamento',
        message: errorMessage,
      }));
      return false;
    }
  };

  const cancelAccountPayable = async (id: string, reason?: string): Promise<boolean> => {
    try {
      await financialService.cancelAccountPayable(id, reason);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Conta cancelada',
        message: 'Conta a pagar cancelada com sucesso',
      }));
      
      // Recarregar dados
      await loadAccountsPayable();
      await loadDashboard();
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao cancelar conta';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao cancelar',
        message: errorMessage,
      }));
      return false;
    }
  };

  // === CONTAS A RECEBER ===
  
  const loadAccountsReceivable = useCallback(async (filters: FinancialFilters = {}) => {
    try {
      setReceivableLoading(true);
      setError(null);
      
      const response = await financialService.getAccountsReceivable(filters);
      setAccountsReceivable(response.data.items);
      setReceivablePagination(response.data.pagination);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao carregar contas a receber';
      setError(errorMessage);
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao carregar contas a receber',
        message: errorMessage,
      }));
    } finally {
      setReceivableLoading(false);
    }
  }, [dispatch]);

  const createAccountReceivable = async (data: CreateAccountReceivable): Promise<boolean> => {
    try {
      await financialService.createAccountReceivable(data);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Conta a receber criada',
        message: 'Conta a receber criada com sucesso',
      }));
      
      // Recarregar dados
      await loadAccountsReceivable();
      await loadDashboard();
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao criar conta a receber';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao criar conta',
        message: errorMessage,
      }));
      return false;
    }
  };

  const updateAccountReceivable = async (id: string, data: Partial<CreateAccountReceivable>): Promise<boolean> => {
    try {
      await financialService.updateAccountReceivable(id, data);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Conta atualizada',
        message: 'Conta a receber atualizada com sucesso',
      }));
      
      // Recarregar dados
      await loadAccountsReceivable();
      await loadDashboard();
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao atualizar conta a receber';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao atualizar conta',
        message: errorMessage,
      }));
      return false;
    }
  };

  const receivePayment = async (id: string, paymentData: PaymentData): Promise<boolean> => {
    try {
      await financialService.receivePayment(id, paymentData);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Pagamento recebido',
        message: 'Pagamento registrado com sucesso',
      }));
      
      // Recarregar dados
      await loadAccountsReceivable();
      await loadDashboard();
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao registrar recebimento';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro no recebimento',
        message: errorMessage,
      }));
      return false;
    }
  };

  const cancelAccountReceivable = async (id: string, reason?: string): Promise<boolean> => {
    try {
      await financialService.cancelAccountReceivable(id, reason);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Conta cancelada',
        message: 'Conta a receber cancelada com sucesso',
      }));
      
      // Recarregar dados
      await loadAccountsReceivable();
      await loadDashboard();
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao cancelar conta';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao cancelar',
        message: errorMessage,
      }));
      return false;
    }
  };

  // === MOVIMENTAÇÕES DE CAIXA ===
  
  const loadCashMovements = useCallback(async (filters: FinancialFilters = {}) => {
    try {
      setCashLoading(true);
      setError(null);
      
      const response = await financialService.getCashMovements(filters);
      setCashMovements(response.data.items);
      setCashPagination(response.data.pagination);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao carregar movimentações de caixa';
      setError(errorMessage);
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao carregar movimentações',
        message: errorMessage,
      }));
    } finally {
      setCashLoading(false);
    }
  }, [dispatch]);

  const createCashMovement = async (data: CreateCashMovement): Promise<boolean> => {
    try {
      await financialService.createCashMovement(data);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Movimentação criada',
        message: 'Movimentação de caixa criada com sucesso',
      }));
      
      // Recarregar dados
      await loadCashMovements();
      await loadDashboard();
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao criar movimentação';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao criar movimentação',
        message: errorMessage,
      }));
      return false;
    }
  };

  const updateCashMovement = async (id: string, data: Partial<CreateCashMovement>): Promise<boolean> => {
    try {
      await financialService.updateCashMovement(id, data);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Movimentação atualizada',
        message: 'Movimentação de caixa atualizada com sucesso',
      }));
      
      // Recarregar dados
      await loadCashMovements();
      await loadDashboard();
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao atualizar movimentação';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao atualizar',
        message: errorMessage,
      }));
      return false;
    }
  };

  const deleteCashMovement = async (id: string): Promise<boolean> => {
    try {
      await financialService.deleteCashMovement(id);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Movimentação excluída',
        message: 'Movimentação de caixa excluída com sucesso',
      }));
      
      // Recarregar dados
      await loadCashMovements();
      await loadDashboard();
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao excluir movimentação';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao excluir',
        message: errorMessage,
      }));
      return false;
    }
  };

  // === RELATÓRIOS ===
  
  const exportFinancialReport = async (type: 'cash-flow' | 'accounts-payable' | 'accounts-receivable' | 'overdue', filters: FinancialFilters = {}): Promise<void> => {
    try {
      await financialService.exportFinancialReport(type, filters);
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

  // === UTILITÁRIOS ===
  
  const loadCategories = async () => {
    try {
      const [income, expense] = await Promise.all([
        financialService.getIncomeCategories(),
        financialService.getExpenseCategories(),
      ]);
      
      setIncomeCategories(income);
      setExpenseCategories(expense);
    } catch (err: any) {
      console.error('Erro ao carregar categorias:', err);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadDashboard();
    loadCategories();
  }, [loadDashboard]);

  return {
    // Estados do Dashboard
    dashboard,
    dashboardLoading,
    
    // Estados das Contas a Pagar
    accountsPayable,
    payableLoading,
    payablePagination,
    
    // Estados das Contas a Receber
    accountsReceivable,
    receivableLoading,
    receivablePagination,
    
    // Estados das Movimentações de Caixa
    cashMovements,
    cashLoading,
    cashPagination,
    
    // Estados gerais
    error,
    incomeCategories,
    expenseCategories,
    
    // Ações do Dashboard
    loadDashboard,
    
    // Ações das Contas a Pagar
    loadAccountsPayable,
    createAccountPayable,
    updateAccountPayable,
    payAccount,
    cancelAccountPayable,
    
    // Ações das Contas a Receber
    loadAccountsReceivable,
    createAccountReceivable,
    updateAccountReceivable,
    receivePayment,
    cancelAccountReceivable,
    
    // Ações das Movimentações de Caixa
    loadCashMovements,
    createCashMovement,
    updateCashMovement,
    deleteCashMovement,
    
    // Relatórios
    exportFinancialReport,
    
    // Utilitários do serviço
    calculateLateFee: financialService.calculateLateFee,
    isOverdue: financialService.isOverdue,
    getDaysLate: financialService.getDaysLate,
    formatStatus: financialService.formatStatus,
    getStatusColor: financialService.getStatusColor,
    formatPaymentMethod: financialService.formatPaymentMethod,
  };
};