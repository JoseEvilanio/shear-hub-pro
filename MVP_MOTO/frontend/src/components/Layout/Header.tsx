// Header da Aplicação
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useState, useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { logoutAsync } from '@/store/slices/authSlice';
import { toggleTheme, addNotification } from '@/store/slices/uiSlice';
import {
  Search,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
  Key,
} from 'lucide-react';
import { NotificationBadge } from '@/components/Notifications';
import { SessionManager } from '@/components/Auth/SessionManager';
import { ChangePasswordModal } from '@/components/Auth/ChangePasswordModal';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';

export const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { theme } = useAppSelector((state) => state.ui);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sessionManagerOpen, setSessionManagerOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fechar menus ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
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
    }
  };

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
    dispatch(addNotification({
      type: 'info',
      title: `Tema alterado para ${theme === 'light' ? 'escuro' : 'claro'}`,
    }));
  };

  const handleOpenNotificationCenter = () => {
    navigate('/notifications');
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar clientes, OS, produtos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={handleToggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title={`Alternar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-gray-600" />
            ) : (
              <Sun className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* Notifications */}
          <NotificationBadge onOpenCenter={handleOpenNotificationCenter} />

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {/* User Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      // Navegar para perfil
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="w-4 h-4 mr-3" />
                    Meu Perfil
                  </button>
                  
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      setChangePasswordOpen(true);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Key className="w-4 h-4 mr-3" />
                    Alterar Senha
                  </button>
                  
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      setSessionManagerOpen(true);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Shield className="w-4 h-4 mr-3" />
                    Gerenciar Sessões
                  </button>
                  
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      // Navegar para configurações
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Configurações
                  </button>
                  
                  <hr className="my-1" />
                  
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
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
    </header>
  );
};