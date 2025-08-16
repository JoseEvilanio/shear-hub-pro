// Serviço de Relatórios
// Sistema de Gestão de Oficina Mecânica de Motos

import { apiClient, ApiResponse } from './api';
import { Client, ServiceOrder, Sale, Product } from '@/types';

// Interfaces para Relatórios
export interface BirthdayReport {
  clients: Array<Client & {
    daysUntilBirthday: number;
    age: number;
  }>;
  summary: {
    thisMonth: number;
    nextMonth: number;
    total: number;
  };
}

export interface SalesReport {
  sales: Sale[];
  summary: {
    totalSales: number;
    totalAmount: number;
    averageTicket: number;
    topProducts: Array<{
      productId: string;
      productName: string;
      quantity: number;
      totalAmount: number;
    }>;
    salesByDay: Array<{
      date: string;
      count: number;
      amount: number;
    }>;
    salesByPaymentMethod: Array<{
      method: string;
      count: number;
      amount: number;
      percentage: number;
    }>;
  };
}

export interface ServiceOrdersReport {
  serviceOrders: ServiceOrder[];
  summary: {
    totalOrders: number;
    totalAmount: number;
    averageTicket: number;
    ordersByStatus: Array<{
      status: string;
      count: number;
      percentage: number;
    }>;
    ordersByMechanic: Array<{
      mechanicId: string;
      mechanicName: string;
      count: number;
      totalAmount: number;
    }>;
    topServices: Array<{
      description: string;
      count: number;
      totalAmount: number;
    }>;
  };
}

export interface InventoryReport {
  products: Product[];
  summary: {
    totalProducts: number;
    totalValue: number;
    lowStockCount: number;
    outOfStockCount: number;
    topValueProducts: Array<{
      productId: string;
      productName: string;
      stockQuantity: number;
      totalValue: number;
    }>;
    categoryBreakdown: Array<{
      category: string;
      count: number;
      value: number;
      percentage: number;
    }>;
  };
}

export interface FinancialReport {
  summary: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    accountsReceivable: {
      total: number;
      pending: number;
      overdue: number;
    };
    accountsPayable: {
      total: number;
      pending: number;
      overdue: number;
    };
  };
  cashFlow: Array<{
    date: string;
    income: number;
    expense: number;
    balance: number;
  }>;
  topCategories: {
    income: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
    expense: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
  };
}

export interface DashboardMetrics {
  sales: {
    today: { count: number; amount: number };
    thisWeek: { count: number; amount: number };
    thisMonth: { count: number; amount: number };
    growth: { count: number; amount: number };
  };
  serviceOrders: {
    pending: number;
    inProgress: number;
    completed: number;
    total: number;
  };
  financial: {
    cashBalance: number;
    accountsReceivable: number;
    accountsPayable: number;
    netBalance: number;
  };
  inventory: {
    lowStock: number;
    outOfStock: number;
    totalValue: number;
  };
  clients: {
    total: number;
    birthdaysThisMonth: number;
    newThisMonth: number;
  };
}

// Filtros para relatórios
export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  clientId?: string;
  mechanicId?: string;
  status?: string;
  category?: string;
  type?: string;
  groupBy?: 'day' | 'week' | 'month';
}

class ReportsService {
  // === RELATÓRIO DE ANIVERSARIANTES ===
  
  async getBirthdayReport(month?: number): Promise<BirthdayReport> {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());

    const queryString = params.toString();
    const url = queryString ? `/reports/birthdays?${queryString}` : '/reports/birthdays';
    
    const response = await apiClient.get<ApiResponse<BirthdayReport>>(url);
    return response.data;
  }

  // === RELATÓRIO DE VENDAS ===
  
  async getSalesReport(filters: ReportFilters = {}): Promise<SalesReport> {
    const params = new URLSearchParams();
    
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.clientId) params.append('clientId', filters.clientId);
    if (filters.status) params.append('status', filters.status);
    if (filters.groupBy) params.append('groupBy', filters.groupBy);

    const queryString = params.toString();
    const url = queryString ? `/reports/sales?${queryString}` : '/reports/sales';
    
    const response = await apiClient.get<ApiResponse<SalesReport>>(url);
    return response.data;
  }

  // === RELATÓRIO DE ORDENS DE SERVIÇO ===
  
  async getServiceOrdersReport(filters: ReportFilters = {}): Promise<ServiceOrdersReport> {
    const params = new URLSearchParams();
    
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.clientId) params.append('clientId', filters.clientId);
    if (filters.mechanicId) params.append('mechanicId', filters.mechanicId);
    if (filters.status) params.append('status', filters.status);

    const queryString = params.toString();
    const url = queryString ? `/reports/service-orders?${queryString}` : '/reports/service-orders';
    
    const response = await apiClient.get<ApiResponse<ServiceOrdersReport>>(url);
    return response.data;
  }

  // === RELATÓRIO DE ESTOQUE ===
  
  async getInventoryReport(filters: ReportFilters = {}): Promise<InventoryReport> {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.type) params.append('type', filters.type);

    const queryString = params.toString();
    const url = queryString ? `/reports/inventory?${queryString}` : '/reports/inventory';
    
    const response = await apiClient.get<ApiResponse<InventoryReport>>(url);
    return response.data;
  }

  // === RELATÓRIO FINANCEIRO ===
  
  async getFinancialReport(filters: ReportFilters = {}): Promise<FinancialReport> {
    const params = new URLSearchParams();
    
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.groupBy) params.append('groupBy', filters.groupBy);

    const queryString = params.toString();
    const url = queryString ? `/reports/financial?${queryString}` : '/reports/financial';
    
    const response = await apiClient.get<ApiResponse<FinancialReport>>(url);
    return response.data;
  }

  // === MÉTRICAS DO DASHBOARD ===
  
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const response = await apiClient.get<ApiResponse<DashboardMetrics>>('/reports/dashboard');
    return response.data;
  }

  // === EXPORTAÇÕES ===
  
  async exportBirthdayReport(month?: number): Promise<void> {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());

    const queryString = params.toString();
    const url = queryString ? `/reports/birthdays/export?${queryString}` : '/reports/birthdays/export';
    
    await apiClient.download(url, 'aniversariantes.xlsx');
  }

  async exportSalesReport(filters: ReportFilters = {}): Promise<void> {
    const params = new URLSearchParams();
    
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.clientId) params.append('clientId', filters.clientId);
    if (filters.status) params.append('status', filters.status);

    const queryString = params.toString();
    const url = queryString ? `/reports/sales/export?${queryString}` : '/reports/sales/export';
    
    await apiClient.download(url, 'vendas.xlsx');
  }

  async exportServiceOrdersReport(filters: ReportFilters = {}): Promise<void> {
    const params = new URLSearchParams();
    
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.clientId) params.append('clientId', filters.clientId);
    if (filters.mechanicId) params.append('mechanicId', filters.mechanicId);
    if (filters.status) params.append('status', filters.status);

    const queryString = params.toString();
    const url = queryString ? `/reports/service-orders/export?${queryString}` : '/reports/service-orders/export';
    
    await apiClient.download(url, 'ordens-servico.xlsx');
  }

  async exportInventoryReport(filters: ReportFilters = {}): Promise<void> {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.type) params.append('type', filters.type);

    const queryString = params.toString();
    const url = queryString ? `/reports/inventory/export?${queryString}` : '/reports/inventory/export';
    
    await apiClient.download(url, 'estoque.xlsx');
  }

  async exportFinancialReport(filters: ReportFilters = {}): Promise<void> {
    const params = new URLSearchParams();
    
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);

    const queryString = params.toString();
    const url = queryString ? `/reports/financial/export?${queryString}` : '/reports/financial/export';
    
    await apiClient.download(url, 'financeiro.xlsx');
  }

  // === UTILITÁRIOS ===
  
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  formatDate(dateString: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateString));
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  getGrowthColor(growth: number): string {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  }

  getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      pending: 'text-yellow-600 bg-yellow-50',
      in_progress: 'text-blue-600 bg-blue-50',
      completed: 'text-green-600 bg-green-50',
      delivered: 'text-green-600 bg-green-50',
      cancelled: 'text-red-600 bg-red-50',
      paid: 'text-green-600 bg-green-50',
      overdue: 'text-red-600 bg-red-50',
    };
    return colorMap[status] || 'text-gray-600 bg-gray-50';
  }

  formatStatus(status: string): string {
    const statusMap: Record<string, string> = {
      pending: 'Pendente',
      in_progress: 'Em Andamento',
      completed: 'Concluído',
      delivered: 'Entregue',
      cancelled: 'Cancelado',
      paid: 'Pago',
      overdue: 'Em Atraso',
    };
    return statusMap[status] || status;
  }

  // Gerar cores para gráficos
  generateChartColors(count: number): string[] {
    const colors = [
      '#3B82F6', // blue-500
      '#10B981', // emerald-500
      '#F59E0B', // amber-500
      '#EF4444', // red-500
      '#8B5CF6', // violet-500
      '#06B6D4', // cyan-500
      '#84CC16', // lime-500
      '#F97316', // orange-500
      '#EC4899', // pink-500
      '#6366F1', // indigo-500
    ];
    
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length]);
    }
    return result;
  }
}

export const reportsService = new ReportsService();