// Serviço de Vendas
// Sistema de Gestão de Oficina Mecânica de Motos

import { apiClient, ApiResponse, PaginatedApiResponse } from './api';
import { Sale } from '@/types';

export interface SalesFilters {
  search?: string;
  type?: SaleType;
  status?: SaleStatus;
  clientId?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  paid?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateSaleData {
  clientId?: string;
  type: SaleType;
  items: SaleItemData[];
  discountAmount?: number;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export interface UpdateSaleData extends Partial<CreateSaleData> {
  status?: SaleStatus;
  paid?: boolean;
}

export interface SaleItemData {
  productId: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
}

export type SaleType = 'sale' | 'quote';
export type SaleStatus = 'draft' | 'pending' | 'confirmed' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'pix' | 'installment' | 'check';

export const SALE_TYPE_LABELS: Record<SaleType, string> = {
  sale: 'Venda',
  quote: 'Orçamento',
};

export const SALE_STATUS_LABELS: Record<SaleStatus, string> = {
  draft: 'Rascunho',
  pending: 'Pendente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
};

export const SALE_STATUS_COLORS: Record<SaleStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Dinheiro',
  card: 'Cartão',
  pix: 'PIX',
  installment: 'Parcelado',
  check: 'Cheque',
};

class SalesService {
  // Listar vendas com filtros e paginação
  async getSales(filters: SalesFilters = {}): Promise<PaginatedApiResponse<Sale>> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.clientId) params.append('clientId', filters.clientId);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.paid !== undefined) params.append('paid', filters.paid.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    const url = queryString ? `/sales?${queryString}` : '/sales';
    
    return await apiClient.get<PaginatedApiResponse<Sale>>(url);
  }

  // Obter venda por ID
  async getSaleById(id: string): Promise<Sale> {
    const response = await apiClient.get<ApiResponse<Sale>>(`/sales/${id}`);
    return response.data;
  }

  // Criar nova venda
  async createSale(data: CreateSaleData): Promise<Sale> {
    const response = await apiClient.post<ApiResponse<Sale>>('/sales', data);
    return response.data;
  }

  // Atualizar venda
  async updateSale(id: string, data: UpdateSaleData): Promise<Sale> {
    const response = await apiClient.put<ApiResponse<Sale>>(`/sales/${id}`, data);
    return response.data;
  }

  // Alterar status da venda
  async updateSaleStatus(id: string, status: SaleStatus): Promise<Sale> {
    const response = await apiClient.patch<ApiResponse<Sale>>(`/sales/${id}/status`, {
      status,
    });
    return response.data;
  }

  // Confirmar venda (baixa no estoque)
  async confirmSale(id: string): Promise<Sale> {
    const response = await apiClient.post<ApiResponse<Sale>>(`/sales/${id}/confirm`);
    return response.data;
  }

  // Cancelar venda
  async cancelSale(id: string, reason?: string): Promise<Sale> {
    const response = await apiClient.post<ApiResponse<Sale>>(`/sales/${id}/cancel`, {
      reason,
    });
    return response.data;
  }

  // Converter orçamento em venda
  async convertQuoteToSale(id: string): Promise<Sale> {
    const response = await apiClient.post<ApiResponse<Sale>>(`/sales/${id}/convert-to-sale`);
    return response.data;
  }

  // Marcar como pago
  async markAsPaid(id: string, paymentMethod: PaymentMethod): Promise<Sale> {
    const response = await apiClient.post<ApiResponse<Sale>>(`/sales/${id}/mark-paid`, {
      paymentMethod,
    });
    return response.data;
  }

  // Excluir venda
  async deleteSale(id: string): Promise<void> {
    await apiClient.delete(`/sales/${id}`);
  }

  // Adicionar item à venda
  async addSaleItem(saleId: string, item: SaleItemData): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(`/sales/${saleId}/items`, item);
    return response.data;
  }

  // Remover item da venda
  async removeSaleItem(saleId: string, itemId: string): Promise<void> {
    await apiClient.delete(`/sales/${saleId}/items/${itemId}`);
  }

  // Atualizar item da venda
  async updateSaleItem(saleId: string, itemId: string, item: Partial<SaleItemData>): Promise<any> {
    const response = await apiClient.put<ApiResponse<any>>(`/sales/${saleId}/items/${itemId}`, item);
    return response.data;
  }

  // Buscar produto por código de barras
  async getProductByBarcode(barcode: string): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(`/products/barcode/${barcode}`);
    return response.data;
  }

  // Aplicar desconto
  async applyDiscount(saleId: string, discountAmount: number, itemId?: string): Promise<Sale> {
    const response = await apiClient.post<ApiResponse<Sale>>(`/sales/${saleId}/discount`, {
      discountAmount,
      itemId,
    });
    return response.data;
  }

  // Imprimir comprovante
  async printReceipt(id: string, printerType: 'laser' | 'inkjet' | 'matrix' = 'laser'): Promise<void> {
    await apiClient.download(`/sales/${id}/print?type=${printerType}`, `Venda-${id}.pdf`);
  }

  // Imprimir cupom não fiscal
  async printNonFiscalReceipt(id: string): Promise<void> {
    await apiClient.download(`/sales/${id}/print-non-fiscal`, `Cupom-${id}.pdf`);
  }

  // Obter relatório de vendas
  async getSalesReport(filters: SalesFilters = {}): Promise<any> {
    const params = new URLSearchParams();
    
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);

    const queryString = params.toString();
    const url = queryString ? `/sales/report?${queryString}` : '/sales/report';
    
    const response = await apiClient.get<ApiResponse<any>>(url);
    return response.data;
  }

  // Exportar vendas
  async exportSales(filters: SalesFilters = {}): Promise<void> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);

    const queryString = params.toString();
    const url = queryString ? `/sales/export?${queryString}` : '/sales/export';
    
    await apiClient.download(url, 'vendas.xlsx');
  }

  // Gerar número da venda
  async generateSaleNumber(): Promise<string> {
    const response = await apiClient.get<ApiResponse<{ number: string }>>('/sales/generate-number');
    return response.data.number;
  }

  // Calcular total da venda
  calculateSaleTotal(items: any[], discountAmount: number = 0): number {
    const subtotal = items.reduce((total, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      const itemDiscount = item.discountAmount || 0;
      return total + (itemTotal - itemDiscount);
    }, 0);
    
    return Math.max(0, subtotal - discountAmount);
  }

  // Calcular subtotal
  calculateSubtotal(items: any[]): number {
    return items.reduce((total, item) => {
      return total + (item.quantity * item.unitPrice);
    }, 0);
  }

  // Calcular desconto total
  calculateTotalDiscount(items: any[], generalDiscount: number = 0): number {
    const itemDiscounts = items.reduce((total, item) => {
      return total + (item.discountAmount || 0);
    }, 0);
    
    return itemDiscounts + generalDiscount;
  }

  // Verificar se pode editar venda
  canEditSale(status: SaleStatus): boolean {
    return ['draft', 'pending'].includes(status);
  }

  // Verificar se pode cancelar venda
  canCancelSale(status: SaleStatus): boolean {
    return ['draft', 'pending', 'confirmed'].includes(status);
  }

  // Verificar se pode converter orçamento
  canConvertQuote(type: SaleType, status: SaleStatus): boolean {
    return type === 'quote' && ['draft', 'pending'].includes(status);
  }

  // Formatar número da venda
  formatSaleNumber(number: string): string {
    // Formato: VD001/2024
    return number;
  }

  // Validar código de barras
  validateBarcode(barcode: string): boolean {
    // Validação básica de código de barras
    return /^\d{8,14}$/.test(barcode.replace(/\D/g, ''));
  }
}

export const salesService = new SalesService();