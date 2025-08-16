// Sidebar de Navegação
// Sistema de Gestão de Oficina Mecânica de Motos

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store';
import { toggleSidebar } from '@/store/slices/uiSlice';
import {
  Home,
  Users,
  Car,
  Package,
  Wrench,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Settings,
  User,
  Truck,
  FileText,
  ChevronLeft,
  ChevronRight,
  Warehouse,
  Bell,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  permissions?: string[];
  badge?: string | number;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/',
  },
  {
    id: 'clients',
    label: 'Clientes',
    icon: Users,
    path: '/clients',
    permissions: ['clients:read'],
  },
  {
    id: 'vehicles',
    label: 'Veículos',
    icon: Car,
    path: '/vehicles',
    permissions: ['vehicles:read'],
  },
  {
    id: 'products',
    label: 'Produtos',
    icon: Package,
    path: '/products',
    permissions: ['products:read'],
  },
  {
    id: 'inventory',
    label: 'Estoque',
    icon: Warehouse,
    path: '/inventory',
    permissions: ['inventory:read'],
  },
  {
    id: 'service-orders',
    label: 'Ordens de Serviço',
    icon: Wrench,
    path: '/service-orders',
    permissions: ['service_orders:read'],
  },
  {
    id: 'sales',
    label: 'Vendas',
    icon: ShoppingCart,
    path: '/sales',
    permissions: ['sales:read'],
  },
  {
    id: 'financial',
    label: 'Financeiro',
    icon: DollarSign,
    path: '/financial',
    permissions: ['financial:read'],
  },
  {
    id: 'reports',
    label: 'Relatórios',
    icon: BarChart3,
    path: '/reports',
    permissions: ['reports:read'],
  },
  {
    id: 'mechanics',
    label: 'Mecânicos',
    icon: User,
    path: '/mechanics',
    permissions: ['mechanics:read'],
  },
  {
    id: 'suppliers',
    label: 'Fornecedores',
    icon: Truck,
    path: '/suppliers',
    permissions: ['suppliers:read'],
  },
  {
    id: 'printing',
    label: 'Impressão',
    icon: FileText,
    path: '/printing',
    permissions: ['service_orders:read', 'sales:read'],
  },
  {
    id: 'notifications',
    label: 'Notificações',
    icon: Bell,
    path: '/notifications',
  },
  {
    id: 'settings',
    label: 'Configurações',
    icon: Settings,
    path: '/settings',
    permissions: ['config:read'],
  },
];

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  // Verificar se o usuário tem permissão para acessar um item
  const hasPermission = (permissions?: string[]): boolean => {
    if (!permissions || permissions.length === 0) return true;
    if (!user) return false;
    
    // Admin tem acesso a tudo
    if (user.role === 'admin') return true;
    
    // Verificar permissões específicas (implementar lógica de permissões)
    // Por enquanto, usar lógica simples baseada em roles
    const rolePermissions = {
      manager: ['clients:read', 'vehicles:read', 'products:read', 'inventory:read', 'service_orders:read', 'sales:read', 'financial:read', 'reports:read', 'mechanics:read', 'suppliers:read'],
      operator: ['clients:read', 'vehicles:read', 'products:read', 'inventory:read', 'service_orders:read', 'sales:read'],
      mechanic: ['service_orders:read', 'clients:read', 'vehicles:read', 'products:read', 'inventory:read'],
    };
    
    const userPermissions = rolePermissions[user.role as keyof typeof rolePermissions] || [];
    return permissions.some(permission => userPermissions.includes(permission));
  };

  const filteredMenuItems = menuItems.filter(item => hasPermission(item.permissions));

  return (
    <div className={cn(
      'fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-lg transition-all duration-300 z-30',
      sidebarOpen ? 'w-64' : 'w-16'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {sidebarOpen && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Oficina</h1>
              <p className="text-xs text-gray-500">Gestão de Motos</p>
            </div>
          </div>
        )}
        
        <button
          onClick={handleToggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title={sidebarOpen ? 'Recolher menu' : 'Expandir menu'}
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));

            return (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors group',
                    isActive
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <Icon className={cn(
                    'flex-shrink-0 w-5 h-5',
                    isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                  )} />
                  
                  {sidebarOpen && (
                    <>
                      <span className="ml-3 truncate">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-primary-100 text-primary-600 text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info */}
      {sidebarOpen && user && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user.role}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};