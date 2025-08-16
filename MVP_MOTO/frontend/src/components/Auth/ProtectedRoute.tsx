// Componente de Rota Protegida
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store';
import { getCurrentUserAsync } from '@/store/slices/authSlice';
import { PageLoading } from '@/components/ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRole,
}) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { isAuthenticated, user, isLoading, accessToken } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Se tem token mas não tem usuário, tentar buscar dados do usuário
    if (accessToken && !user && !isLoading) {
      dispatch(getCurrentUserAsync());
    }
  }, [dispatch, accessToken, user, isLoading]);

  // Se não está autenticado, redirecionar para login
  if (!isAuthenticated || !accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se está carregando dados do usuário, mostrar loading
  if (isLoading || !user) {
    return <PageLoading message="Verificando permissões..." />;
  }

  // Verificar role se especificada
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">
            Você não tem permissão para acessar esta página.
          </p>
          <p className="text-sm text-gray-500">
            Nível necessário: {requiredRole} | Seu nível: {user.role}
          </p>
        </div>
      </div>
    );
  }

  // Verificar permissões específicas se especificadas
  if (requiredPermissions.length > 0) {
    // Implementar lógica de verificação de permissões
    // Por enquanto, usar lógica simples baseada em roles
    const rolePermissions = {
      admin: ['*'], // Admin tem todas as permissões
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

    const userPermissions = rolePermissions[user.role as keyof typeof rolePermissions] || [];
    const hasPermission = userPermissions.includes('*') || 
      requiredPermissions.some(permission => userPermissions.includes(permission));

    if (!hasPermission) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
            <p className="text-gray-600 mb-4">
              Você não tem as permissões necessárias para acessar esta página.
            </p>
            <p className="text-sm text-gray-500">
              Permissões necessárias: {requiredPermissions.join(', ')}
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};