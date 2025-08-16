// Componente de Proteção por Permissões
// Sistema de Gestão de Oficina Mecânica de Motos

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Lock } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  permissions?: string[];
  role?: string;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permissions = [],
  role,
  fallback,
  showFallback = true,
}) => {
  const { canAccess, user } = useAuth();

  const hasAccess = canAccess(permissions, role);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (!showFallback) {
      return null;
    }

    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Acesso Restrito
          </h3>
          <p className="text-gray-600 mb-4">
            Você não tem permissão para acessar este conteúdo.
          </p>
          <div className="text-sm text-gray-500">
            <p>Seu nível: <span className="font-medium capitalize">{user?.role}</span></p>
            {role && (
              <p>Nível necessário: <span className="font-medium capitalize">{role}</span></p>
            )}
            {permissions.length > 0 && (
              <p>Permissões necessárias: <span className="font-medium">{permissions.join(', ')}</span></p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Hook para usar dentro de componentes
export const usePermissionGuard = (permissions: string[] = [], role?: string) => {
  const { canAccess } = useAuth();
  return canAccess(permissions, role);
};

// Componente para botões condicionais
interface ConditionalButtonProps {
  children: React.ReactNode;
  permissions?: string[];
  role?: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const ConditionalButton: React.FC<ConditionalButtonProps> = ({
  children,
  permissions = [],
  role,
  className,
  onClick,
  disabled = false,
  type = 'button',
}) => {
  const hasAccess = usePermissionGuard(permissions, role);

  if (!hasAccess) {
    return null;
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
};

// Componente para links condicionais
interface ConditionalLinkProps {
  children: React.ReactNode;
  permissions?: string[];
  role?: string;
  to?: string;
  className?: string;
  onClick?: () => void;
}

export const ConditionalLink: React.FC<ConditionalLinkProps> = ({
  children,
  permissions = [],
  role,
  className,
  onClick,
}) => {
  const hasAccess = usePermissionGuard(permissions, role);

  if (!hasAccess) {
    return null;
  }

  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
};