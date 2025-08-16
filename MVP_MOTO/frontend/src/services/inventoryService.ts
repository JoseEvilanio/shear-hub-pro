// Serviço de Controle de Estoque
// Sistema de Gestão de Oficina Mecânica de Motos

import { apiClient, ApiResponse, PaginatedApiResponse } from './api';
import { Product } from '@/types';

export interface InventoryFilters {
  search?: string;
  category?: string;
  lowStock?: boolean;
  outOfStock?: boolean;
  type?: 'product' | 'service';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface InventoryMovement {
  id: string;
  productId: string;
  product?: Product;
  type: MovementType;
  quantity: number;
  unitCost?: number;
  reference?: string;
  referenceId?: string;
  notes?: string;
  createdAt: string;
  createdBy?: string;
}

export interface CreateMovementData {
  productId: string;
  type: MovementType;
  quantity: number;
  unitCost?: number;
  reference?: string;
  referenceId?: string;
  notes?: string;
}

export interface StockEntry {
  productId: string;
  quantity: number;
  unitCost: number;
  supplier?: string;
  invoiceNumber?: string;
  notes?: string;
}

export interface StockAdjustment {
  productId: string;
  newQuantity: number;
  reason: string;
  notes?: string;
}

export type MovementType = 'entry' | 'exit' | 'adjustment' | 'sale' | 'service_order' | 'loss' | 'transfer';

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  entry: 'Entrada',
  exit: 'Saída',
  adjustment: 'Ajuste',
  sale: 'Venda',
  service_order: 'Ordem de Serviço',
  loss: 'Perda',
  transfer: 'Transferência',
};

export const MOVEMENT_TYPE_COLORS: Record<MovementType, string> = {
  entry: 'text-green-600',
  exit: 'text-red-600',
  adjustment: 'text-blue-600',
  sale: 'text-purple-600',
  service_order: 'text-orange-600',
  loss: 'text-red-800',
  transfer: 'text-indigo-600',
};

class InventoryService {
  // Listar produtos com informações de estoque
  async getInventory(filters: InventoryFilters = {}): Promise<PaginatedApiResponse<Product>> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.lowStock) params.append('lowStock', 'true');
    if (filters.outOfStock) params.append('outOfStock', 'true');
    if (filters.type) params.append('type', filters.type);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    const url = queryString ? `/inventory?${queryString}` : '/inventory';
    
    return await apiClient.get<PaginatedApiResponse<Product>>(url);
  }

  // Obter detalhes do produto com histórico de movimentações
  async getProductInventory(productId: string): Promise<{
    product: Product;
    movements: InventoryMovement[];
    currentStock: number;
    averageCost: number;
    totalValue: number;
  }> {
    const response = await apiClient.get<ApiResponse<any>>(`/inventory/products/${productId}`);
    return response.data;
  }

  // Listar movimentações de estoque
  async getMovements(filters: {
    productId?: string;
    type?: MovementType;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedApiResponse<InventoryMovement>> {
    const params = new URLSearchParams();
    
    if (filters.productId) params.append('productId', filters.productId);
    if (filters.type) params.append('type', filters.type);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const url = queryString ? `/inventory/movements?${queryString}` : '/inventory/movements';
    
    return await apiClient.get<PaginatedApiResponse<InventoryMovement>>(url);
  }

  // Registrar entrada de estoque
  async registerEntry(data: StockEntry): Promise<InventoryMovement> {
    const response = await apiClient.post<ApiResponse<InventoryMovement>>('/inventory/entries', data);
    return response.data;
  }

  // Registrar saída de estoque
  async registerExit(productId: string, quantity: number, reason: string, notes?: string): Promise<InventoryMovement> {
    const response = await apiClient.post<ApiResponse<InventoryMovement>>('/inventory/exits', {
      productId,
      quantity,
      reason,
      notes,
    });
    return response.data;
  }

  // Ajustar estoque
  async adjustStock(data: StockAdjustment): Promise<InventoryMovement> {
    const response = await apiClient.post<ApiResponse<InventoryMovement>>('/inventory/adjustments', data);
    return response.data;
  }

  // Transferir estoque entre produtos
  async transferStock(fromProductId: string, toProductId: string, quantity: number, notes?: string): Promise<InventoryMovement[]> {
    const response = await apiClient.post<ApiResponse<InventoryMovement[]>>('/inventory/transfers', {
      fromProductId,
      toProductId,
      quantity,
      notes,
    });
    return response.data;
  }

  // Obter produtos com estoque baixo
  async getLowStockProducts(): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<Product[]>>('/inventory/low-stock');
    return response.data;
  }

  // Obter produtos em falta
  async getOutOfStockProducts(): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<Product[]>>('/inventory/out-of-stock');
    return response.data;
  }

  // Obter relatório de estoque
  async getStockReport(filters: {
    category?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}): Promise<{
    totalProducts: number;
    totalValue: number;
    lowStockCount: number;
    outOfStockCount: number;
    topMovements: InventoryMovement[];
    categoryBreakdown: Array<{
      category: string;
      count: number;
      value: number;
    }>;
  }> {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);

    const queryString = params.toString();
    const url = queryString ? `/inventory/report?${queryString}` : '/inventory/report';
    
    const response = await apiClient.get<ApiResponse<any>>(url);
    return response.data;
  }

  // Exportar relatório de estoque
  async exportInventory(filters: InventoryFilters = {}): Promise<void> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.lowStock) params.append('lowStock', 'true');
    if (filters.outOfStock) params.append('outOfStock', 'true');
    if (filters.type) params.append('type', filters.type);

    const queryString = params.toString();
    const url = queryString ? `/inventory/export?${queryString}` : '/inventory/export';
    
    await apiClient.download(url, 'estoque.xlsx');
  }

  // Obter categorias de produtos
  async getCategories(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>('/inventory/categories');
    return response.data;
  }

  // Calcular valor total do estoque
  calculateStockValue(products: Product[]): number {
    return products.reduce((total, product) => {
      const cost = product.cost || product.price;
      return total + (product.stockQuantity * cost);
    }, 0);
  }

  // Verificar se produto está com estoque baixo
  isLowStock(product: Product): boolean {
    return product.stockQuantity <= product.minStock;
  }

  // Verificar se produto está em falta
  isOutOfStock(product: Product): boolean {
    return product.stockQuantity <= 0;
  }

  // Calcular dias de estoque
  calculateStockDays(product: Product, averageDailyUsage: number): number {
    if (averageDailyUsage <= 0) return Infinity;
    return Math.floor(product.stockQuantity / averageDailyUsage);
  }

  // Sugerir quantidade de reposição
  suggestReorderQuantity(product: Product, leadTimeDays: number = 7, averageDailyUsage: number = 1): number {
    const safetyStock = Math.ceil(averageDailyUsage * leadTimeDays * 1.2); // 20% de margem de segurança
    const maxStock = product.maxStock || (product.minStock * 3);
    const currentStock = product.stockQuantity;
    
    if (currentStock >= maxStock) return 0;
    
    const suggestedQuantity = maxStock - currentStock + safetyStock;
    return Math.max(0, suggestedQuantity);
  }

  // Formatar tipo de movimentação
  formatMovementType(type: MovementType): string {
    return MOVEMENT_TYPE_LABELS[type] || type;
  }

  // Obter cor do tipo de movimentação
  getMovementTypeColor(type: MovementType): string {
    return MOVEMENT_TYPE_COLORS[type] || 'text-gray-600';
  }

  // Validar quantidade de movimentação
  validateMovementQuantity(quantity: number, currentStock: number, movementType: MovementType): {
    valid: boolean;
    message?: string;
  } {
    if (quantity <= 0) {
      return {
        valid: false,
        message: 'Quantidade deve ser maior que zero',
      };
    }

    if (['exit', 'sale', 'service_order', 'loss'].includes(movementType) && quantity > currentStock) {
      return {
        valid: false,
        message: 'Quantidade insuficiente em estoque',
      };
    }

    return { valid: true };
  }
}

export const inventoryService = new InventoryService();