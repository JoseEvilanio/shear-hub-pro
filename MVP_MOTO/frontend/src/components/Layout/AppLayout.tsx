// Layout Principal da Aplicação
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store';
import { getCurrentUserAsync } from '@/store/slices/authSlice';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { NotificationContainer } from '@/components/ui/NotificationContainer';

export const AppLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);
  const { sidebarOpen } = useAppSelector((state) => state.ui);

  useEffect(() => {
    // Se está autenticado mas não tem dados do usuário, buscar
    if (isAuthenticated && !user) {
      dispatch(getCurrentUserAsync());
    }
  }, [dispatch, isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarOpen ? 'ml-64' : 'ml-16'
      }`}>
        {/* Header */}
        <Header />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Notifications */}
      <NotificationContainer />
    </div>
  );
};