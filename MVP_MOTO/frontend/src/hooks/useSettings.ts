// Hook para gerenciamento de configurações
// Sistema de Gestão de Oficina Mecânica de Motos

import { useState, useCallback } from 'react';
import { useAppDispatch } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';
import { 
  settingsService,
  SystemSettings,
  UserSettings,
  BackupInfo,
  SystemInfo,
  UpdateSystemSettings,
  UpdateUserSettings,
  CreateUserData,
  UpdateUserData,
} from '@/services/settingsService';
import { User } from '@/types';

export const useSettings = () => {
  const dispatch = useAppDispatch();
  
  // Estados das configurações
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);

  // Estados de loading
  const [systemLoading, setSystemLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [backupsLoading, setBackupsLoading] = useState(false);
  const [systemInfoLoading, setSystemInfoLoading] = useState(false);

  // Estados de paginação
  const [usersPagination, setUsersPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Estado de erro
  const [error, setError] = useState<string | null>(null);

  // === CONFIGURAÇÕES DO SISTEMA ===
  
  const loadSystemSettings = useCallback(async () => {
    try {
      setSystemLoading(true);
      setError(null);
      
      const data = await settingsService.getSystemSettings();
      setSystemSettings(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao carregar configurações do sistema';
      setError(errorMessage);
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao carregar configurações',
        message: errorMessage,
      }));
    } finally {
      setSystemLoading(false);
    }
  }, [dispatch]);

  const updateSystemSettings = async (data: UpdateSystemSettings): Promise<boolean> => {
    try {
      setSystemLoading(true);
      const updatedSettings = await settingsService.updateSystemSettings(data);
      setSystemSettings(updatedSettings);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Configurações atualizadas',
        message: 'Configurações do sistema atualizadas com sucesso',
      }));
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao atualizar configurações';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao atualizar',
        message: errorMessage,
      }));
      return false;
    } finally {
      setSystemLoading(false);
    }
  };

  const uploadLogo = async (file: File): Promise<boolean> => {
    try {
      const result = await settingsService.uploadLogo(file);
      
      if (systemSettings) {
        setSystemSettings({
          ...systemSettings,
          logoUrl: result.logoUrl,
        });
      }
      
      dispatch(addNotification({
        type: 'success',
        title: 'Logo atualizado',
        message: 'Logo da empresa atualizado com sucesso',
      }));
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao fazer upload do logo';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro no upload',
        message: errorMessage,
      }));
      return false;
    }
  };

  const uploadBackground = async (file: File): Promise<boolean> => {
    try {
      const result = await settingsService.uploadBackground(file);
      
      if (systemSettings) {
        setSystemSettings({
          ...systemSettings,
          backgroundUrl: result.backgroundUrl,
        });
      }
      
      dispatch(addNotification({
        type: 'success',
        title: 'Fundo atualizado',
        message: 'Fundo de tela atualizado com sucesso',
      }));
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao fazer upload do fundo';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro no upload',
        message: errorMessage,
      }));
      return false;
    }
  };

  const removeLogo = async (): Promise<boolean> => {
    try {
      await settingsService.removeLogo();
      
      if (systemSettings) {
        setSystemSettings({
          ...systemSettings,
          logoUrl: undefined,
        });
      }
      
      dispatch(addNotification({
        type: 'success',
        title: 'Logo removido',
        message: 'Logo da empresa removido com sucesso',
      }));
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao remover logo';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao remover',
        message: errorMessage,
      }));
      return false;
    }
  };

  const removeBackground = async (): Promise<boolean> => {
    try {
      await settingsService.removeBackground();
      
      if (systemSettings) {
        setSystemSettings({
          ...systemSettings,
          backgroundUrl: undefined,
        });
      }
      
      dispatch(addNotification({
        type: 'success',
        title: 'Fundo removido',
        message: 'Fundo de tela removido com sucesso',
      }));
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao remover fundo';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao remover',
        message: errorMessage,
      }));
      return false;
    }
  };

  // === CONFIGURAÇÕES DO USUÁRIO ===
  
  const loadUserSettings = useCallback(async (userId?: string) => {
    try {
      setUserLoading(true);
      setError(null);
      
      const data = await settingsService.getUserSettings(userId);
      setUserSettings(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao carregar configurações do usuário';
      setError(errorMessage);
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao carregar configurações',
        message: errorMessage,
      }));
    } finally {
      setUserLoading(false);
    }
  }, [dispatch]);

  const updateUserSettings = async (data: UpdateUserSettings, userId?: string): Promise<boolean> => {
    try {
      setUserLoading(true);
      const updatedSettings = await settingsService.updateUserSettings(data, userId);
      setUserSettings(updatedSettings);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Preferências atualizadas',
        message: 'Suas preferências foram atualizadas com sucesso',
      }));
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao atualizar preferências';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao atualizar',
        message: errorMessage,
      }));
      return false;
    } finally {
      setUserLoading(false);
    }
  };

  // === GESTÃO DE USUÁRIOS ===
  
  const loadUsers = useCallback(async (filters: {
    search?: string;
    role?: string;
    active?: boolean;
    page?: number;
    limit?: number;
  } = {}) => {
    try {
      setUsersLoading(true);
      setError(null);
      
      const data = await settingsService.getUsers(filters);
      setUsers(data.users);
      setUsersPagination(data.pagination);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao carregar usuários';
      setError(errorMessage);
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao carregar usuários',
        message: errorMessage,
      }));
    } finally {
      setUsersLoading(false);
    }
  }, [dispatch]);

  const createUser = async (data: CreateUserData): Promise<boolean> => {
    try {
      await settingsService.createUser(data);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Usuário criado',
        message: 'Usuário criado com sucesso',
      }));
      
      // Recarregar lista de usuários
      await loadUsers();
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao criar usuário';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao criar usuário',
        message: errorMessage,
      }));
      return false;
    }
  };

  const updateUser = async (id: string, data: UpdateUserData): Promise<boolean> => {
    try {
      await settingsService.updateUser(id, data);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Usuário atualizado',
        message: 'Usuário atualizado com sucesso',
      }));
      
      // Recarregar lista de usuários
      await loadUsers();
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao atualizar usuário';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao atualizar usuário',
        message: errorMessage,
      }));
      return false;
    }
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      await settingsService.deleteUser(id);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Usuário excluído',
        message: 'Usuário excluído com sucesso',
      }));
      
      // Recarregar lista de usuários
      await loadUsers();
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao excluir usuário';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao excluir usuário',
        message: errorMessage,
      }));
      return false;
    }
  };

  const resetUserPassword = async (id: string, newPassword: string): Promise<boolean> => {
    try {
      await settingsService.resetUserPassword(id, newPassword);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Senha redefinida',
        message: 'Senha do usuário redefinida com sucesso',
      }));
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao redefinir senha';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao redefinir senha',
        message: errorMessage,
      }));
      return false;
    }
  };

  // === BACKUP E RESTAURAÇÃO ===
  
  const loadBackups = useCallback(async () => {
    try {
      setBackupsLoading(true);
      setError(null);
      
      const data = await settingsService.getBackups();
      setBackups(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao carregar backups';
      setError(errorMessage);
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao carregar backups',
        message: errorMessage,
      }));
    } finally {
      setBackupsLoading(false);
    }
  }, [dispatch]);

  const createBackup = async (): Promise<boolean> => {
    try {
      await settingsService.createBackup();
      
      dispatch(addNotification({
        type: 'success',
        title: 'Backup iniciado',
        message: 'Backup do sistema iniciado com sucesso',
      }));
      
      // Recarregar lista de backups
      await loadBackups();
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao criar backup';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao criar backup',
        message: errorMessage,
      }));
      return false;
    }
  };

  const downloadBackup = async (id: string): Promise<void> => {
    try {
      await settingsService.downloadBackup(id);
      dispatch(addNotification({
        type: 'success',
        title: 'Download iniciado',
        message: 'Download do backup iniciado',
      }));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao baixar backup';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro no download',
        message: errorMessage,
      }));
    }
  };

  const deleteBackup = async (id: string): Promise<boolean> => {
    try {
      await settingsService.deleteBackup(id);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Backup excluído',
        message: 'Backup excluído com sucesso',
      }));
      
      // Recarregar lista de backups
      await loadBackups();
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao excluir backup';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao excluir backup',
        message: errorMessage,
      }));
      return false;
    }
  };

  const restoreBackup = async (file: File): Promise<boolean> => {
    try {
      await settingsService.restoreBackup(file);
      
      dispatch(addNotification({
        type: 'success',
        title: 'Restauração iniciada',
        message: 'Restauração do backup iniciada com sucesso',
      }));
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao restaurar backup';
      dispatch(addNotification({
        type: 'error',
        title: 'Erro na restauração',
        message: errorMessage,
      }));
      return false;
    }
  };

  // === INFORMAÇÕES DO SISTEMA ===
  
  const loadSystemInfo = useCallback(async () => {
    try {
      setSystemInfoLoading(true);
      setError(null);
      
      const data = await settingsService.getSystemInfo();
      setSystemInfo(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao carregar informações do sistema';
      setError(errorMessage);
      dispatch(addNotification({
        type: 'error',
        title: 'Erro ao carregar informações',
        message: errorMessage,
      }));
    } finally {
      setSystemInfoLoading(false);
    }
  }, [dispatch]);

  return {
    // Estados
    systemSettings,
    userSettings,
    users,
    backups,
    systemInfo,
    usersPagination,
    
    // Estados de loading
    systemLoading,
    userLoading,
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
    
    // Ações das configurações do usuário
    loadUserSettings,
    updateUserSettings,
    
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
    
    // Utilitários do serviço
    validatePassword: settingsService.validatePassword,
    formatFileSize: settingsService.formatFileSize,
    formatUptime: settingsService.formatUptime,
    getAvailableThemes: settingsService.getAvailableThemes,
    getAvailableLanguages: settingsService.getAvailableLanguages,
    getAvailableTimezones: settingsService.getAvailableTimezones,
    getAvailableDateFormats: settingsService.getAvailableDateFormats,
    getAvailableCurrencies: settingsService.getAvailableCurrencies,
    getUserRoles: settingsService.getUserRoles,
  };
};