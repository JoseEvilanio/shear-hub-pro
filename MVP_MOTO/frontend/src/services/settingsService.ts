// Serviço de Configurações
// Sistema de Gestão de Oficina Mecânica de Motos

import { apiClient, ApiResponse } from './api';
import { User } from '@/types';

// Interfaces para Configurações
export interface SystemSettings {
  id: string;
  companyName: string;
  companyDocument: string;
  companyPhone?: string;
  companyEmail?: string;
  companyAddress?: string;
  logoUrl?: string;
  backgroundUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  theme: 'light' | 'dark';
  language: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  enableNotifications: boolean;
  enableBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  maxFileSize: number;
  allowedFileTypes: string[];
  sessionTimeout: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  id: string;
  userId: string;
  theme?: 'light' | 'dark';
  language?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: '12h' | '24h';
  enableNotifications: boolean;
  enableSounds: boolean;
  dashboardLayout: string;
  sidebarCollapsed: boolean;
  preferences: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface BackupInfo {
  id: string;
  filename: string;
  size: number;
  type: 'manual' | 'automatic';
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
}

export interface SystemInfo {
  version: string;
  environment: string;
  database: {
    type: string;
    version: string;
    size: string;
  };
  storage: {
    used: number;
    available: number;
    total: number;
  };
  uptime: number;
  lastBackup?: string;
  activeUsers: number;
}

// Dados para atualização
export interface UpdateSystemSettings {
  companyName?: string;
  companyDocument?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyAddress?: string;
  primaryColor?: string;
  secondaryColor?: string;
  theme?: 'light' | 'dark';
  language?: string;
  timezone?: string;
  currency?: string;
  dateFormat?: string;
  timeFormat?: '12h' | '24h';
  enableNotifications?: boolean;
  enableBackup?: boolean;
  backupFrequency?: 'daily' | 'weekly' | 'monthly';
  maxFileSize?: number;
  allowedFileTypes?: string[];
  sessionTimeout?: number;
  passwordPolicy?: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
  };
}

export interface UpdateUserSettings {
  theme?: 'light' | 'dark';
  language?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: '12h' | '24h';
  enableNotifications?: boolean;
  enableSounds?: boolean;
  dashboardLayout?: string;
  sidebarCollapsed?: boolean;
  preferences?: Record<string, any>;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'operator' | 'mechanic';
  active?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'manager' | 'operator' | 'mechanic';
  active?: boolean;
}

class SettingsService {
  // === CONFIGURAÇÕES DO SISTEMA ===
  
  async getSystemSettings(): Promise<SystemSettings> {
    const response = await apiClient.get<ApiResponse<SystemSettings>>('/settings/system');
    return response.data;
  }

  async updateSystemSettings(data: UpdateSystemSettings): Promise<SystemSettings> {
    const response = await apiClient.put<ApiResponse<SystemSettings>>('/settings/system', data);
    return response.data;
  }

  async uploadLogo(file: File): Promise<{ logoUrl: string }> {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await apiClient.post<ApiResponse<{ logoUrl: string }>>('/settings/system/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async uploadBackground(file: File): Promise<{ backgroundUrl: string }> {
    const formData = new FormData();
    formData.append('background', file);

    const response = await apiClient.post<ApiResponse<{ backgroundUrl: string }>>('/settings/system/background', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async removeLogo(): Promise<void> {
    await apiClient.delete('/settings/system/logo');
  }

  async removeBackground(): Promise<void> {
    await apiClient.delete('/settings/system/background');
  }

  // === CONFIGURAÇÕES DO USUÁRIO ===
  
  async getUserSettings(userId?: string): Promise<UserSettings> {
    const url = userId ? `/settings/user/${userId}` : '/settings/user';
    const response = await apiClient.get<ApiResponse<UserSettings>>(url);
    return response.data;
  }

  async updateUserSettings(data: UpdateUserSettings, userId?: string): Promise<UserSettings> {
    const url = userId ? `/settings/user/${userId}` : '/settings/user';
    const response = await apiClient.put<ApiResponse<UserSettings>>(url, data);
    return response.data;
  }

  // === GESTÃO DE USUÁRIOS ===
  
  async getUsers(filters: {
    search?: string;
    role?: string;
    active?: boolean;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.role) params.append('role', filters.role);
    if (filters.active !== undefined) params.append('active', filters.active.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const url = queryString ? `/settings/users?${queryString}` : '/settings/users';
    
    const response = await apiClient.get<ApiResponse<any>>(url);
    return response.data;
  }

  async getUser(id: string): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(`/settings/users/${id}`);
    return response.data;
  }

  async createUser(data: CreateUserData): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>('/settings/users', data);
    return response.data;
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(`/settings/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/settings/users/${id}`);
  }

  async resetUserPassword(id: string, newPassword: string): Promise<void> {
    await apiClient.post(`/settings/users/${id}/reset-password`, { password: newPassword });
  }

  // === BACKUP E RESTAURAÇÃO ===
  
  async getBackups(): Promise<BackupInfo[]> {
    const response = await apiClient.get<ApiResponse<BackupInfo[]>>('/settings/backups');
    return response.data;
  }

  async createBackup(): Promise<BackupInfo> {
    const response = await apiClient.post<ApiResponse<BackupInfo>>('/settings/backups');
    return response.data;
  }

  async downloadBackup(id: string): Promise<void> {
    await apiClient.download(`/settings/backups/${id}/download`, `backup-${id}.zip`);
  }

  async deleteBackup(id: string): Promise<void> {
    await apiClient.delete(`/settings/backups/${id}`);
  }

  async restoreBackup(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('backup', file);

    await apiClient.post('/settings/backups/restore', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // === INFORMAÇÕES DO SISTEMA ===
  
  async getSystemInfo(): Promise<SystemInfo> {
    const response = await apiClient.get<ApiResponse<SystemInfo>>('/settings/system/info');
    return response.data;
  }

  // === UTILITÁRIOS ===
  
  validatePassword(password: string, policy: SystemSettings['passwordPolicy']): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < policy.minLength) {
      errors.push(`Senha deve ter pelo menos ${policy.minLength} caracteres`);
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula');
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra minúscula');
    }

    if (policy.requireNumbers && !/\d/.test(password)) {
      errors.push('Senha deve conter pelo menos um número');
    }

    if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Senha deve conter pelo menos um caractere especial');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  getAvailableThemes(): Array<{ value: string; label: string }> {
    return [
      { value: 'light', label: 'Claro' },
      { value: 'dark', label: 'Escuro' },
    ];
  }

  getAvailableLanguages(): Array<{ value: string; label: string }> {
    return [
      { value: 'pt-BR', label: 'Português (Brasil)' },
      { value: 'en-US', label: 'English (US)' },
      { value: 'es-ES', label: 'Español' },
    ];
  }

  getAvailableTimezones(): Array<{ value: string; label: string }> {
    return [
      { value: 'America/Sao_Paulo', label: 'São Paulo (GMT-3)' },
      { value: 'America/New_York', label: 'New York (GMT-5)' },
      { value: 'Europe/London', label: 'London (GMT+0)' },
      { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' },
    ];
  }

  getAvailableDateFormats(): Array<{ value: string; label: string }> {
    return [
      { value: 'DD/MM/YYYY', label: '31/12/2024' },
      { value: 'MM/DD/YYYY', label: '12/31/2024' },
      { value: 'YYYY-MM-DD', label: '2024-12-31' },
      { value: 'DD-MM-YYYY', label: '31-12-2024' },
    ];
  }

  getAvailableCurrencies(): Array<{ value: string; label: string }> {
    return [
      { value: 'BRL', label: 'Real (R$)' },
      { value: 'USD', label: 'Dólar ($)' },
      { value: 'EUR', label: 'Euro (€)' },
    ];
  }

  getUserRoles(): Array<{ value: string; label: string; description: string }> {
    return [
      { 
        value: 'admin', 
        label: 'Administrador', 
        description: 'Acesso total ao sistema' 
      },
      { 
        value: 'manager', 
        label: 'Gerente', 
        description: 'Acesso a relatórios e configurações' 
      },
      { 
        value: 'operator', 
        label: 'Operador', 
        description: 'Acesso a vendas e atendimento' 
      },
      { 
        value: 'mechanic', 
        label: 'Mecânico', 
        description: 'Acesso a ordens de serviço' 
      },
    ];
  }
}

export const settingsService = new SettingsService();