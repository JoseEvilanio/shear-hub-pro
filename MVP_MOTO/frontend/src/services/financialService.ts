// Serviço Financeiro
// Sistema de Gestão de Oficina Mecânica de Motos

import { apiClient, ApiResponse, PaginatedApiResponse } from './api';

// Interfaces para Contas a Pagar
export interface AccountPayable {
  id: string;
  supplierId?: string;
  supplier?: {
    id: string;
    name: string;
    cnpj?: string;
  };
  description: string;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  category: string;
  reference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Interfaces para Contas a Receber
export interface AccountReceivable {
  id: string;
  clientId?: string;
  client?: {
    id: string;
    name: string;
    cpf?: string;
  };
  saleId?: string;
  serviceOrderId?: string;
  description: string;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  installment?: number;
  totalInstallments?: number;
  reference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Interface para Movimentação de Caixa
export interface CashMovement {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'pix' | 'bank_transfer' | 'check';
  reference?: string;
  referenceId?: string;
  userId: string;
  user?: {
    id: string;
    name: string;
  };
  date: string;
  notes?: string;
  createdAt: string;
}

// Interface para Dashboard Financeiro
export interface FinancialDashboard {
  cashFlow: {
    income: number;
    expense: number;
    balance: number;
  };
  accountsReceivable: {
    total: number;
    pending: number;
    overdue: number;
    paid: number;
  };
  accountsPayable: {
    total: number;
    pending: number;
    overdue: number;
    paid: number;
  };
  monthlyComparison: {
    currentMonth: {
      income: number;
      expense: number;
      balance: number;
    };
    previousMonth: {
      income: number;
      expense: number;
      balance: number;
    };
    growth: {
      income: number;
      expense: number;
      balance: number;
    };
  };
  topCategories: {
    income: Array<{ category: string; amount: number; percentage: number }>;
    expense: Array<{ category: string; amount: number; percentage: number }>;
  };
}

// Filtros para consultas
export interface FinancialFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  category?: string;
  type?: string;
  clientId?: string;
  supplierId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Interface para criar conta a pagar
export interface CreateAccountPayable {
  supplierId?: string;
  description: string;
  amount: number;
  dueDate: string;
  category: string;
  reference?: string;
  notes?: string;
}

// Interface para criar conta a receber
export interface CreateAccountReceivable {
  clientId?: string;
  saleId?: string;
  serviceOrderId?: string;
  description: string;
  amount: number;
  dueDate: string;
  installment?: number;
  totalInstallments?: number;
  reference?: string;
  notes?: string;
}

// Interface para criar movimentação de caixa
export interface CreateCashMovement {
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'pix' | 'bank_transfer' | 'check';
  reference?: string;
  referenceId?: string;
  date: string;
  notes?: string;
}

// Interface para pagamento
export interface PaymentData {
  paymentDate: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'pix' | 'bank_transfer' | 'check';
  notes?: string;
}

class FinancialService {
  // Dashboard Financeiro
  async getDashboard(filters: { dateFrom?: string; dateTo?: string } = {}): Promise<FinancialDashboard> {
    const params = new URLSearchParams();
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);

    const queryString = params.toString();
    const url = queryString ? `/financial/dashboard?${queryString}` : '/financial/dashboard';
    
    const response = await apiClient.get<ApiResponse<FinancialDashboard>>(url);
    return response.data;
  }

  // === CONTAS A PAGAR ===
  
  // Listar contas a pagar
  async getAccountsPayable(filters: FinancialFilters = {}): Promise<PaginatedApiResponse<AccountPayable>> {
    const params = new URLSearchParams();
    
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.supplierId) params.append('supplierId', filters.supplierId);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    const url = queryString ? `/financial/accounts-payable?${queryString}` : '/financial/accounts-payable';
    
    return await apiClient.get<PaginatedApiResponse<AccountPayable>>(url);
  }

  // Obter conta a pagar por ID
  async getAccountPayable(id: string): Promise<AccountPayable> {
    const response = await apiClient.get<ApiResponse<AccountPayable>>(`/financial/accounts-payable/${id}`);
    return response.data;
  }

  // Criar conta a pagar
  async createAccountPayable(data: CreateAccountPayable): Promise<AccountPayable> {
    const response = await apiClient.post<ApiResponse<AccountPayable>>('/financial/accounts-payable', data);
    return response.data;
  }

  // Atualizar conta a pagar
  async updateAccountPayable(id: string, data: Partial<CreateAccountPayable>): Promise<AccountPayable> {
    const response = await apiClient.put<ApiResponse<AccountPayable>>(`/financial/accounts-payable/${id}`, data);
    return response.data;
  }

  // Pagar conta
  async payAccount(id: string, paymentData: PaymentData): Promise<AccountPayable> {
    const response = await apiClient.post<ApiResponse<AccountPayable>>(`/financial/accounts-payable/${id}/pay`, paymentData);
    return response.data;
  }

  // Cancelar conta a pagar
  async cancelAccountPayable(id: string, reason?: string): Promise<AccountPayable> {
    const response = await apiClient.post<ApiResponse<AccountPayable>>(`/financial/accounts-payable/${id}/cancel`, { reason });
    return response.data;
  }

  // === CONTAS A RECEBER ===
  
  // Listar contas a receber
  async getAccountsReceivable(filters: FinancialFilters = {}): Promise<PaginatedApiResponse<AccountReceivable>> {
    const params = new URLSearchParams();
    
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.clientId) params.append('clientId', filters.clientId);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    const url = queryString ? `/financial/accounts-receivable?${queryString}` : '/financial/accounts-receivable';
    
    return await apiClient.get<PaginatedApiResponse<AccountReceivable>>(url);
  }

  // Obter conta a receber por ID
  async getAccountReceivable(id: string): Promise<AccountReceivable> {
    const response = await apiClient.get<ApiResponse<AccountReceivable>>(`/financial/accounts-receivable/${id}`);
    return response.data;
  }

  // Criar conta a receber
  async createAccountReceivable(data: CreateAccountReceivable): Promise<AccountReceivable> {
    const response = await apiClient.post<ApiResponse<AccountReceivable>>('/financial/accounts-receivable', data);
    return response.data;
  }

  // Atualizar conta a receber
  async updateAccountReceivable(id: string, data: Partial<CreateAccountReceivable>): Promise<AccountReceivable> {
    const response = await apiClient.put<ApiResponse<AccountReceivable>>(`/financial/accounts-receivable/${id}`, data);
    return response.data;
  }

  // Receber pagamento
  async receivePayment(id: string, paymentData: PaymentData): Promise<AccountReceivable> {
    const response = await apiClient.post<ApiResponse<AccountReceivable>>(`/financial/accounts-receivable/${id}/receive`, paymentData);
    return response.data;
  }

  // Cancelar conta a receber
  async cancelAccountReceivable(id: string, reason?: string): Promise<AccountReceivable> {
    const response = await apiClient.post<ApiResponse<AccountReceivable>>(`/financial/accounts-receivable/${id}/cancel`, { reason });
    return response.data;
  }

  // === MOVIMENTAÇÃO DE CAIXA ===
  
  // Listar movimentações de caixa
  async getCashMovements(filters: FinancialFilters = {}): Promise<PaginatedApiResponse<CashMovement>> {
    const params = new URLSearchParams();
    
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.type) params.append('type', filters.type);
    if (filters.category) params.append('category', filters.category);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    const url = queryString ? `/financial/cash-movements?${queryString}` : '/financial/cash-movements';
    
    return await apiClient.get<PaginatedApiResponse<CashMovement>>(url);
  }

  // Criar movimentação de caixa
  async createCashMovement(data: CreateCashMovement): Promise<CashMovement> {
    const response = await apiClient.post<ApiResponse<CashMovement>>('/financial/cash-movements', data);
    return response.data;
  }

  // Atualizar movimentação de caixa
  async updateCashMovement(id: string, data: Partial<CreateCashMovement>): Promise<CashMovement> {
    const response = await apiClient.put<ApiResponse<CashMovement>>(`/financial/cash-movements/${id}`, data);
    return response.data;
  }

  // Excluir movimentação de caixa
  async deleteCashMovement(id: string): Promise<void> {
    await apiClient.delete(`/financial/cash-movements/${id}`);
  }

  // === RELATÓRIOS ===
  
  // Relatório de fluxo de caixa
  async getCashFlowReport(filters: { dateFrom: string; dateTo: string; groupBy?: 'day' | 'week' | 'month' }): Promise<{
    periods: Array<{
      period: string;
      income: number;
      expense: number;
      balance: number;
    }>;
    summary: {
      totalIncome: number;
      totalExpense: number;
      netBalance: number;
    };
  }> {
    const params = new URLSearchParams();
    params.append('dateFrom', filters.dateFrom);
    params.append('dateTo', filters.dateTo);
    if (filters.groupBy) params.append('groupBy', filters.groupBy);

    const response = await apiClient.get<ApiResponse<any>>(`/financial/reports/cash-flow?${params.toString()}`);
    return response.data;
  }

  // Relatório de contas em atraso
  async getOverdueReport(): Promise<{
    accountsPayable: AccountPayable[];
    accountsReceivable: AccountReceivable[];
    summary: {
      totalOverduePayable: number;
      totalOverdueReceivable: number;
      countOverduePayable: number;
      countOverdueReceivable: number;
    };
  }> {
    const response = await apiClient.get<ApiResponse<any>>('/financial/reports/overdue');
    return response.data;
  }

  // Exportar relatórios
  async exportFinancialReport(type: 'cash-flow' | 'accounts-payable' | 'accounts-receivable' | 'overdue', filters: FinancialFilters = {}): Promise<void> {
    const params = new URLSearchParams();
    
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);

    const queryString = params.toString();
    const url = queryString ? `/financial/export/${type}?${queryString}` : `/financial/export/${type}`;
    
    await apiClient.download(url, `relatorio-${type}.xlsx`);
  }

  // === UTILITÁRIOS ===
  
  // Obter categorias de receita
  async getIncomeCategories(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>('/financial/categories/income');
    return response.data;
  }

  // Obter categorias de despesa
  async getExpenseCategories(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>('/financial/categories/expense');
    return response.data;
  }

  // Calcular juros e multa por atraso
  calculateLateFee(amount: number, daysLate: number, interestRate: number = 0.033, fineRate: number = 0.02): {
    fine: number;
    interest: number;
    total: number;
  } {
    const fine = amount * fineRate;
    const interest = amount * (interestRate / 30) * daysLate;
    const total = amount + fine + interest;

    return { fine, interest, total };
  }

  // Verificar se conta está em atraso
  isOverdue(dueDate: string): boolean {
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  }

  // Calcular dias de atraso
  getDaysLate(dueDate: string): number {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  // Formatar status
  formatStatus(status: string): string {
    const statusMap: Record<string, string> = {
      pending: 'Pendente',
      paid: 'Pago',
      overdue: 'Em Atraso',
      cancelled: 'Cancelado',
    };
    return statusMap[status] || status;
  }

  // Obter cor do status
  getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      pending: 'text-yellow-600 bg-yellow-50',
      paid: 'text-green-600 bg-green-50',
      overdue: 'text-red-600 bg-red-50',
      cancelled: 'text-gray-600 bg-gray-50',
    };
    return colorMap[status] || 'text-gray-600 bg-gray-50';
  }

  // Formatar método de pagamento
  formatPaymentMethod(method: string): string {
    const methodMap: Record<string, string> = {
      cash: 'Dinheiro',
      card: 'Cartão',
      pix: 'PIX',
      bank_transfer: 'Transferência',
      check: 'Cheque',
    };
    return methodMap[method] || method;
  }
}

export const financialService = new FinancialService();