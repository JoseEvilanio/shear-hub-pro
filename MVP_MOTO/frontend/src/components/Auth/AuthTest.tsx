// Componente de Teste de Autenticação
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PermissionGuard, ConditionalButton } from './PermissionGuard';
import { SessionManager } from './SessionManager';
import { ChangePasswordModal } from './ChangePasswordModal';
import { AuthFeedback } from './AuthFeedback';
import { Shield, Key, Users, Settings, Eye } from 'lucide-react';

export const AuthTest: React.FC = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    hasPermission,
    isAdmin,
    isManager,
    isOperator,
    isMechanic,
  } = useAuth();

  const [sessionManagerOpen, setSessionManagerOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <AuthFeedback
        type="warning"
        title="Não autenticado"
        message="Você precisa fazer login para ver este conteúdo."
      />
    );
  }

  if (isLoading) {
    return (
      <AuthFeedback
        type="info"
        title="Carregando"
        message="Verificando suas permissões..."
      />
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Teste de Autenticação
        </h2>

        {/* Informações do usuário */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Informações do Usuário</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Nome:</strong> {user?.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> <span className="capitalize">{user?.role}</span></p>
              <p><strong>Status:</strong> {user?.active ? 'Ativo' : 'Inativo'}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Status de Roles</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Admin:</strong> {isAdmin ? '✅' : '❌'}</p>
              <p><strong>Manager:</strong> {isManager ? '✅' : '❌'}</p>
              <p><strong>Operator:</strong> {isOperator ? '✅' : '❌'}</p>
              <p><strong>Mechanic:</strong> {isMechanic ? '✅' : '❌'}</p>
            </div>
          </div>
        </div>

        {/* Teste de permissões */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Teste de Permissões</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div className="p-2 bg-gray-50 rounded">
              <strong>clients:read:</strong> {hasPermission('clients:read') ? '✅' : '❌'}
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <strong>clients:create:</strong> {hasPermission('clients:create') ? '✅' : '❌'}
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <strong>sales:read:</strong> {hasPermission('sales:read') ? '✅' : '❌'}
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <strong>reports:read:</strong> {hasPermission('reports:read') ? '✅' : '❌'}
            </div>
          </div>
        </div>

        {/* Botões condicionais */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Botões Condicionais</h3>
          <div className="flex flex-wrap gap-2">
            <ConditionalButton
              permissions={['clients:create']}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Users className="w-4 h-4 mr-2" />
              Criar Cliente
            </ConditionalButton>

            <ConditionalButton
              role="admin"
              className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Settings className="w-4 h-4 mr-2" />
              Admin Only
            </ConditionalButton>

            <ConditionalButton
              permissions={['reports:read']}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver Relatórios
            </ConditionalButton>
          </div>
        </div>

        {/* Ações de autenticação */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Ações de Autenticação</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setChangePasswordOpen(true)}
              className="flex items-center px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              <Key className="w-4 h-4 mr-2" />
              Alterar Senha
            </button>

            <button
              onClick={() => setSessionManagerOpen(true)}
              className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Shield className="w-4 h-4 mr-2" />
              Gerenciar Sessões
            </button>
          </div>
        </div>

        {/* Componentes protegidos */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Componentes Protegidos</h3>
          
          <PermissionGuard permissions={['clients:read']}>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">
                ✅ Você pode ver este conteúdo porque tem permissão 'clients:read'
              </p>
            </div>
          </PermissionGuard>

          <PermissionGuard role="admin">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                ✅ Você pode ver este conteúdo porque é admin
              </p>
            </div>
          </PermissionGuard>

          <PermissionGuard permissions={['nonexistent:permission']}>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">
                Você não deveria ver isso (permissão inexistente)
              </p>
            </div>
          </PermissionGuard>

          <PermissionGuard role="superadmin">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">
                Você não deveria ver isso (role inexistente)
              </p>
            </div>
          </PermissionGuard>
        </div>
      </div>

      {/* Modals */}
      <SessionManager
        isOpen={sessionManagerOpen}
        onClose={() => setSessionManagerOpen(false)}
      />
      
      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </div>
  );
};