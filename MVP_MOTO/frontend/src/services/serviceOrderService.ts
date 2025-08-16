// Serviço de Ordens de Serviço
// Sistema de Gestão de Oficina Mecânica de Motos

import { apiClient, ApiResponse, PaginatedApiResponse } from './api';
import { ServiceOrder } from '@/types';

export interface ServiceOrderFilters {
  search?: string;
  status?: string;
  clientId?: string;
  mechanicId?: string;
  vehicleId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateServiceOrderData {
  clientId: string;
  vehicleId: string;
  mechanicId?: string;
  descriptionLine1?: string;
  descriptionLine2?: string;
  descriptionLine3?: string;
  descriptionLine4?: string;
  descriptionLine5?: string;
  descriptionLine6?: string;
  descriptionLine7?: string;
  descriptionLine8?: string;
  descriptionLine9?: string;
  items?: ServiceOrderItemData[];
}

export interface UpdateServiceOrderData extends Partial<CreateServiceOrderData> {
  status?: ServiceOrderStatus;
}

export interface ServiceOrderItemData {
  productId: string;
  quantity: number;
  unitPrice: number;
  description?: string;
}

export type ServiceOrderStatus = 
  | 'pending' 
  | 'in_progress' 
  | 'waiting_parts' 
  | 'completed' 
  | 'delivered' 
  | 'cancelled';

export const SERVICE_ORDER_STATUS_LABELS: Record<ServiceOrderStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em Andamento',
  waiting_parts: 'Aguardando Peças',
  completed: 'Concluída',
  delivered: 'Entregue',
  cancelled: 'Cancelada',
};

export const SERVICE_ORDER_STATUS_COLORS: Record<ServiceOrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  waiting_parts: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  delivered: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-red-100 text-red-800',
};

class ServiceOrderService {
  // Listar ordens de serviço com filtros e paginação
  async getServiceOrders(filters: ServiceOrderFilters = {}): Promise<PaginatedApiResponse<ServiceOrder>> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.clientId) params.append('clientId', filters.clientId);
    if (filters.mechanicId) params.append('mechanicId', filters.mechanicId);
    if (filters.vehicleId) params.append('vehicleId', filters.vehicleId);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    const url = queryString ? `/service-orders?${queryString}` : '/service-orders';
    
    return await apiClient.get<PaginatedApiResponse<ServiceOrder>>(url);
  }

  // Obter ordem de serviço por ID
  async getServiceOrderById(id: string): Promise<ServiceOrder> {
    const response = await apiClient.get<ApiResponse<ServiceOrder>>(`/service-orders/${id}`);
    return response.data;
  }

  // Criar nova ordem de serviço
  async createServiceOrder(data: CreateServiceOrderData): Promise<ServiceOrder> {
    const response = await apiClient.post<ApiResponse<ServiceOrder>>('/service-orders', data);
    return response.data;
  }

  // Atualizar ordem de serviço
  async updateServiceOrder(id: string, data: UpdateServiceOrderData): Promise<ServiceOrder> {
    const response = await apiClient.put<ApiResponse<ServiceOrder>>(`/service-orders/${id}`, data);
    return response.data;
  }

  // Alterar status da ordem de serviço
  async updateServiceOrderStatus(id: string, status: ServiceOrderStatus): Promise<ServiceOrder> {
    const response = await apiClient.patch<ApiResponse<ServiceOrder>>(`/service-orders/${id}/status`, {
      status,
    });
    return response.data;
  }

  // Excluir ordem de serviço
  async deleteServiceOrder(id: string): Promise<void> {
    await apiClient.delete(`/service-orders/${id}`);
  }

  // Adicionar item à ordem de serviço
  async addServiceOrderItem(serviceOrderId: string, item: ServiceOrderItemData): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(`/service-orders/${serviceOrderId}/items`, item);
    return response.data;
  }

  // Remover item da ordem de serviço
  async removeServiceOrderItem(serviceOrderId: string, itemId: string): Promise<void> {
    await apiClient.delete(`/service-orders/${serviceOrderId}/items/${itemId}`);
  }

  // Atualizar item da ordem de serviço
  async updateServiceOrderItem(serviceOrderId: string, itemId: string, item: Partial<ServiceOrderItemData>): Promise<any> {
    const response = await apiClient.put<ApiResponse<any>>(`/service-orders/${serviceOrderId}/items/${itemId}`, item);
    return response.data;
  }

  // Finalizar ordem de serviço (baixa automática no estoque)
  async completeServiceOrder(id: string): Promise<ServiceOrder> {
    const response = await apiClient.post<ApiResponse<ServiceOrder>>(`/service-orders/${id}/complete`);
    return response.data;
  }

  // Entregar ordem de serviço
  async deliverServiceOrder(id: string): Promise<ServiceOrder> {
    const response = await apiClient.post<ApiResponse<ServiceOrder>>(`/service-orders/${id}/deliver`);
    return response.data;
  }

  // Cancelar ordem de serviço
  async cancelServiceOrder(id: string, reason?: string): Promise<ServiceOrder> {
    const response = await apiClient.post<ApiResponse<ServiceOrder>>(`/service-orders/${id}/cancel`, {
      reason,
    });
    return response.data;
  }

  // Imprimir ordem de serviço
  async printServiceOrder(id: string, printerType: 'laser' | 'inkjet' | 'matrix' = 'laser'): Promise<void> {
    await apiClient.download(`/service-orders/${id}/print?type=${printerType}`, `OS-${id}.pdf`);
  }

  // Obter relatório de ordens de serviço
  async getServiceOrdersReport(filters: ServiceOrderFilters = {}): Promise<any> {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.mechanicId) params.append('mechanicId', filters.mechanicId);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);

    const queryString = params.toString();
    const url = queryString ? `/service-orders/report?${queryString}` : '/service-orders/report';
    
    const response = await apiClient.get<ApiResponse<any>>(url);
    return response.data;
  }

  // Exportar ordens de serviço
  async exportServiceOrders(filters: ServiceOrderFilters = {}): Promise<void> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.mechanicId) params.append('mechanicId', filters.mechanicId);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);

    const queryString = params.toString();
    const url = queryString ? `/service-orders/export?${queryString}` : '/service-orders/export';
    
    await apiClient.download(url, 'ordens-servico.xlsx');
  }

  // Gerar número da ordem de serviço
  async generateServiceOrderNumber(): Promise<string> {
    const response = await apiClient.get<ApiResponse<{ number: string }>>('/service-orders/generate-number');
    return response.data.number;
  }

  // Obter próximos status possíveis
  getNextStatuses(currentStatus: ServiceOrderStatus): ServiceOrderStatus[] {
    const statusFlow: Record<ServiceOrderStatus, ServiceOrderStatus[]> = {
      pending: ['in_progress', 'cancelled'],
      in_progress: ['waiting_parts', 'completed', 'cancelled'],
      waiting_parts: ['in_progress', 'completed', 'cancelled'],
      completed: ['delivered'],
      delivered: [],
      cancelled: [],
    };

    return statusFlow[currentStatus] || [];
  }

  // Verificar se pode editar ordem de serviço
  canEditServiceOrder(status: ServiceOrderStatus): boolean {
    return ['pending', 'in_progress', 'waiting_parts'].includes(status);
  }

  // Verificar se pode cancelar ordem de serviço
  canCancelServiceOrder(status: ServiceOrderStatus): boolean {
    return ['pending', 'in_progress', 'waiting_parts'].includes(status);
  }

  // Calcular total da ordem de serviço
  calculateServiceOrderTotal(items: any[]): number {
    return items.reduce((total, item) => {
      return total + (item.quantity * item.unitPrice);
    }, 0);
  }

  // Formatar número da ordem de serviço
  formatServiceOrderNumber(number: string): string {
    // Formato: OS001/2024
    return number;
  }
}

export const serviceOrderService = new ServiceOrderService();