// Serviço de Clientes
// Sistema de Gestão de Oficina Mecânica de Motos

import { apiClient, ApiResponse, PaginatedApiResponse } from './api';
import { Client } from '@/types';

export interface ClientFilters {
  search?: string;
  active?: boolean;
  birthMonth?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateClientData {
  name: string;
  cpf?: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  address?: string;
  notes?: string;
}

export interface UpdateClientData extends Partial<CreateClientData> {
  active?: boolean;
}

class ClientService {
  // Listar clientes com filtros e paginação
  async getClients(filters: ClientFilters = {}): Promise<PaginatedApiResponse<Client>> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.active !== undefined) params.append('active', filters.active.toString());
    if (filters.birthMonth) params.append('birthMonth', filters.birthMonth.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    const url = queryString ? `/clients?${queryString}` : '/clients';
    
    return await apiClient.get<PaginatedApiResponse<Client>>(url);
  }

  // Obter cliente por ID
  async getClientById(id: string): Promise<Client> {
    const response = await apiClient.get<ApiResponse<Client>>(`/clients/${id}`);
    return response.data;
  }

  // Criar novo cliente
  async createClient(data: CreateClientData): Promise<Client> {
    const response = await apiClient.post<ApiResponse<Client>>('/clients', data);
    return response.data;
  }

  // Atualizar cliente
  async updateClient(id: string, data: UpdateClientData): Promise<Client> {
    const response = await apiClient.put<ApiResponse<Client>>(`/clients/${id}`, data);
    return response.data;
  }

  // Excluir cliente (soft delete)
  async deleteClient(id: string): Promise<void> {
    await apiClient.delete(`/clients/${id}`);
  }

  // Ativar/desativar cliente
  async toggleClientStatus(id: string): Promise<Client> {
    const response = await apiClient.patch<ApiResponse<Client>>(`/clients/${id}/toggle-status`);
    return response.data;
  }

  // Buscar clientes por CPF
  async getClientByCpf(cpf: string): Promise<Client | null> {
    try {
      const response = await apiClient.get<ApiResponse<Client>>(`/clients/cpf/${cpf}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  // Obter histórico completo do cliente
  async getClientHistory(id: string): Promise<{
    client: Client;
    vehicles: any[];
    serviceOrders: any[];
    sales: any[];
    totalSpent: number;
    lastVisit?: string;
  }> {
    const response = await apiClient.get<ApiResponse<any>>(`/clients/${id}/history`);
    return response.data;
  }

  // Obter aniversariantes do mês
  async getBirthdayClients(month?: number): Promise<Client[]> {
    const currentMonth = month || new Date().getMonth() + 1;
    const response = await apiClient.get<ApiResponse<Client[]>>(`/clients/birthdays/${currentMonth}`);
    return response.data;
  }

  // Exportar clientes
  async exportClients(filters: ClientFilters = {}): Promise<void> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.active !== undefined) params.append('active', filters.active.toString());
    if (filters.birthMonth) params.append('birthMonth', filters.birthMonth.toString());

    const queryString = params.toString();
    const url = queryString ? `/clients/export?${queryString}` : '/clients/export';
    
    await apiClient.download(url, 'clientes.xlsx');
  }

  // Validar CPF
  validateCpf(cpf: string): boolean {
    // Remove caracteres não numéricos
    const cleanCpf = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cleanCpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCpf)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.charAt(10))) return false;
    
    return true;
  }

  // Formatar CPF
  formatCpf(cpf: string): string {
    const cleanCpf = cpf.replace(/\D/g, '');
    return cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  // Formatar telefone
  formatPhone(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 11) {
      return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleanPhone.length === 10) {
      return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  }
}

export const clientService = new ClientService();