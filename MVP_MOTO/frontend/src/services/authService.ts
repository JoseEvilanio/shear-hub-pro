// Serviço de Autenticação
// Sistema de Gestão de Oficina Mecânica de Motos

import { apiClient, ApiResponse } from './api';
import { LoginCredentials, LoginResponse, User } from '@/types';

class AuthService {
  // Login
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    return response.data;
  }

  // Logout
  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/auth/logout', { refreshToken });
  }

  // Renovar token
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  }

  // Obter usuário atual
  async getCurrentUser(): Promise<{ user: User; permissions: string[] }> {
    const response = await apiClient.get<ApiResponse<{ user: User; permissions: string[] }>>('/auth/profile');
    return response.data;
  }

  // Atualizar perfil
  async updateProfile(data: { name: string; email: string }): Promise<{ user: User }> {
    const response = await apiClient.put<ApiResponse<{ user: User }>>('/auth/profile', data);
    return response.data;
  }

  // Alterar senha
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  // Obter sessões ativas
  async getActiveSessions(): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<{ sessions: any[] }>>('/auth/sessions');
    return response.data.sessions;
  }

  // Revogar sessão
  async revokeSession(tokenPrefix: string): Promise<void> {
    await apiClient.delete(`/auth/sessions/${tokenPrefix}`);
  }

  // Logout de todos os dispositivos
  async logoutAll(): Promise<void> {
    await apiClient.post('/auth/logout-all');
  }

  // Verificar token
  async verifyToken(): Promise<{ user: User; valid: boolean }> {
    const response = await apiClient.get<ApiResponse<{ user: User; valid: boolean }>>('/auth/verify');
    return response.data;
  }

  // Obter permissões
  async getPermissions(): Promise<{ role: string; permissions: string[] }> {
    const response = await apiClient.get<ApiResponse<{ role: string; permissions: string[] }>>('/auth/permissions');
    return response.data;
  }
}

export const authService = new AuthService();