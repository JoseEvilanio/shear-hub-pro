// Página Principal de Configurações
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { SystemSettings } from '@/components/Settings/SystemSettings';
import { UserManagement } from '@/components/Settings/UserManagement';
import { BackupRestore } from '@/components/Settings/BackupRestore';
import {
  Settings,
  Building,
  Users,
  Database,
  Info,
  Shield,
} from 'lucide-react';

type TabType = 'system' | 'users' | 'backup' | 'info';

export const SettingsPage: React.FC = () => {
  const {
    // Estados
    systemSettings,
    users,
    backups,
    systemInfo,
    usersPagination,
    
    // Estados de loading
    systemLoading,
    usersLoading,
    backupsLoading,
    systemInfoLoading,
    
    // Estado de erro
    error,
    
    // Ações das configurações do sistema
    loadSystemSettings,
    updateSystemSettings,
    uploadLogo,
    uploadBackground,
    removeLogo,
    removeBackground,
    
    // Ações de gestão de usuários
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    resetUserPassword,
    
    // Ações de backup
    loadBackups,
    createBackup,
    downloadBackup,
    deleteBackup,
    restoreBackup,
    
    // Ações de informações do sistema
    loadSystemInfo,
    
    // Utilitários
    formatFileSize,
    formatUptime,
    getAvailableThemes,
    getAvailableLanguages,
    getAvailableTimezones,
    getAvailableDateFormats,
    getAvailableCurrencies,
    getUserRoles,
    validatePassword,
  } = useSettings();

  // Estados locais
  const [activeTab, setActiveTab] = useState<TabType>('system');

  // Carregar dados iniciais
  useEffect(() => {
    loadSystemSettings();
  }, [loadSystemSettings]);

  // Carregar dados quando a aba mudar
  useEffect(() => {
    switch (activeTab) {
      case 'users':
        loadUsers();
        break;
      case 'backup':
        loadBackups();
        break;
      case 'info':
        loadSystemInfo();
        break;
    }
  }, [activeTab]);

  const tabs = [
    {
      id: 'system' as TabType,
      name: 'Sistema',
      icon: Building,
      description: 'Configurações gerais da empresa',
    },
    {
      id: 'users' as TabType,
      name: 'Usuários',
      icon: Users,
      description: 'Gestão de usuários e permissões',
      count: users.length,
    },
    {
      id: 'backup' as TabType,
      name: 'Backup',
      icon: Database,
      description: 'Backup e restauração de dados',
      count: backups.length,
    },
    {
      id: 'info' as TabType,
      name: 'Informações',
      icon: Info,
      description: 'Informações do sistema',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
              <p className="text-gray-600">Gerencie configurações do sistema, usuários e backups</p>
            </div>
            
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-primary-600 mr-2" />
              <span className="text-sm text-gray-600">Área Administrativa</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    isActive
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  title={tab.description}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.name}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="ml-2 px-2 py-1 text-xs bg-primary-100 text-primary-600 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {activeTab === 'system' && (
          <SystemSettings
            data={systemSettings}
            loading={systemLoading}
            onUpdate={updateSystemSettings}
            onUploadLogo={uploadLogo}
            onUploadBackground={uploadBackground}
            onRemoveLogo={removeLogo}
            onRemoveBackground={removeBackground}
            getAvailableThemes={getAvailableThemes}
            getAvailableLanguages={getAvailableLanguages}
            getAvailableTimezones={getAvailableTimezones}
            getAvailableDateFormats={getAvailableDateFormats}
            getAvailableCurrencies={getAvailableCurrencies}
          />
        )}

        {activeTab === 'users' && (
          <UserManagement
            users={users}
            loading={usersLoading}
            pagination={usersPagination}
            onLoadUsers={loadUsers}
            onCreate={createUser}
            onUpdate={updateUser}
            onDelete={deleteUser}
            onResetPassword={resetUserPassword}
            getUserRoles={getUserRoles}
            validatePassword={validatePassword}
          />
        )}

        {activeTab === 'backup' && (
          <BackupRestore
            backups={backups}
            loading={backupsLoading}
            onLoadBackups={loadBackups}
            onCreate={createBackup}
            onDownload={downloadBackup}
            onDelete={deleteBackup}
            onRestore={restoreBackup}
            formatFileSize={formatFileSize}
          />
        )}

        {activeTab === 'info' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {systemInfoLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : systemInfo ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Informações do Sistema
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm text-gray-500">Versão:</span>
                        <p className="font-medium">{systemInfo.version}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Ambiente:</span>
                        <p className="font-medium capitalize">{systemInfo.environment}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Tempo Online:</span>
                        <p className="font-medium">{formatUptime(systemInfo.uptime)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Usuários Ativos:</span>
                        <p className="font-medium">{systemInfo.activeUsers}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm text-gray-500">Banco de Dados:</span>
                        <p className="font-medium">{systemInfo.database.type} {systemInfo.database.version}</p>
                        <p className="text-sm text-gray-500">Tamanho: {systemInfo.database.size}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Armazenamento:</span>
                        <p className="font-medium">
                          {formatFileSize(systemInfo.storage.used)} / {formatFileSize(systemInfo.storage.total)}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{
                              width: `${(systemInfo.storage.used / systemInfo.storage.total) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>
                      {systemInfo.lastBackup && (
                        <div>
                          <span className="text-sm text-gray-500">Último Backup:</span>
                          <p className="font-medium">
                            {new Intl.DateTimeFormat('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }).format(new Date(systemInfo.lastBackup))}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Informações não disponíveis
                </h3>
                <p className="text-gray-500">
                  Não foi possível carregar as informações do sistema.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};