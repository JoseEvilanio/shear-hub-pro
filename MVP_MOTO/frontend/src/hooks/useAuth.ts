// Hook personalizado para autenticação
// Sistema de Gestão de Oficina Mecânica de Motos

import { useAppSelector, useAppDispatch } from '@/store';
import { loginAsync, logoutAsync, refreshTokenAsync, getCurrentUserAsync, changePasswordAsync } from '@/store/slices/authSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { LoginCredentials } from '@/types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);

  const login = async (credentials: LoginCredentials) => {
    try {
      const result = await dispatch(loginAsync(credentials)).unwrap();
      dispatch(addNotification({
        type: 'success',
        title: 'Login realizado com sucesso',
        message: `Bem-vindo, ${result.user.name}!`,
      }));
      return result;
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Erro no login',
        message: error as string,
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await dispatch(logoutAsync()).unwrap();
      dispatch(addNotification({
        type: 'success',
        title: 'Logout realizado com sucesso',
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Erro no logout',
        message: 'Ocorreu um erro ao fazer logout',
      }));
      throw error;
    }
  };

  const refreshToken = async () => {
    try {
      return await dispatch(refreshTokenAsync()).unwrap();
    } catch (error) {
      throw error;
    }
  };

  const getCurrentUser = async () => {
    try {
      return await dispatch(getCurrentUserAsync()).unwrap();
    } catch (error) {
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await dispatch(changePasswordAsync({ currentPassword, newPassword })).unwrap();
      dispatch(addNotification({
        type: 'success',
        title: 'Senha alterada com sucesso',
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao alterar senha',
        message: error as string,
      }));
      throw error;
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!authState.user) return false;
    
    // Admin tem todas as permissões
    if (authState.user.role === 'admin') return true;

    // Mapeamento de permissões por role
    const rolePermissions = {
      manager: [
        'clients:read', 'clients:create', 'clients:update', 'clients:delete',
        'vehicles:read', 'vehicles:create', 'vehicles:update', 'vehicles:delete',
        'products:read', 'products:create', 'products:update', 'products:delete',
        'service_orders:read', 'service_orders:create', 'service_orders:update', 'service_orders:delete',
        'sales:read', 'sales:create', 'sales:update', 'sales:delete',
        'financial:read', 'financial:create', 'financial:update',
        'reports:read',
        'mechanics:read', 'mechanics:update',
        'suppliers:read', 'suppliers:create', 'suppliers:update', 'suppliers:delete'
      ],
      operator: [
        'clients:read', 'clients:create', 'clients:update',
        'vehicles:read', 'vehicles:create', 'vehicles:update',
        'products:read',
        'service_orders:read', 'service_orders:create', 'service_orders:update',
        'sales:read', 'sales:create', 'sales:update'
      ],
      mechanic: [
        'service_orders:read', 'service_orders:update',
        'clients:read',
        'vehicles:read',
        'products:read'
      ]
    };

    const userPermissions = rolePermissions[authState.user.role as keyof typeof rolePermissions] || [];
    return userPermissions.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    if (!authState.user) return false;
    return authState.user.role === role || authState.user.role === 'admin';
  };

  const canAccess = (requiredPermissions: string[] = [], requiredRole?: string): boolean => {
    if (!authState.user) return false;

    // Verificar role se especificada
    if (requiredRole && !hasRole(requiredRole)) return false;

    // Verificar permissões se especificadas
    if (requiredPermissions.length > 0) {
      return requiredPermissions.some(permission => hasPermission(permission));
    }

    return true;
  };

  return {
    // Estado
    ...authState,
    
    // Ações
    login,
    logout,
    refreshToken,
    getCurrentUser,
    changePassword,
    
    // Verificações
    hasPermission,
    hasRole,
    canAccess,
    
    // Utilitários
    isAdmin: authState.user?.role === 'admin',
    isManager: authState.user?.role === 'manager',
    isOperator: authState.user?.role === 'operator',
    isMechanic: authState.user?.role === 'mechanic',
  };
};