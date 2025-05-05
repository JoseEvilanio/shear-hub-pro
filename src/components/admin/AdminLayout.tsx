
import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  CreditCard, 
  BarChart, 
  Bell, 
  Settings, 
  ChevronRight,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { withSuperUserProtection } from '@/contexts/SuperUserContext';

interface AdminLayoutProps {
  children: ReactNode;
}

function AdminLayoutBase({ children }: AdminLayoutProps) {
  const location = useLocation();
  
  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Barbearias', path: '/admin/barbearias', icon: <Store size={20} /> },
    { name: 'Usuários', path: '/admin/usuarios', icon: <Users size={20} /> },
    { name: 'Superusuários', path: '/admin/superusers', icon: <Shield size={20} /> },
    { name: 'Pagamentos', path: '/admin/pagamentos', icon: <CreditCard size={20} /> },
    { name: 'Relatórios', path: '/admin/relatorios', icon: <BarChart size={20} /> },
    { name: 'Notificações', path: '/admin/notificacoes', icon: <Bell size={20} /> },
    { name: 'Configurações', path: '/admin/configuracoes', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Side Navigation */}
      <aside className="w-64 border-r border-border bg-card min-h-screen">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <Avatar className="bg-primary text-primary-foreground">
            <AvatarFallback>SA</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-bold">Super Admin</h2>
            <p className="text-xs text-muted-foreground">Painel administrativo</p>
          </div>
        </div>
        
        <nav className="mt-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link 
                  to={item.path} 
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                    location.pathname === item.path 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                  )}
                >
                  {item.icon}
                  <span>{item.name}</span>
                  {location.pathname === item.path && (
                    <ChevronRight className="ml-auto h-4 w-4" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <main className="w-full p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

// Wrap with superuser protection
export const AdminLayout = withSuperUserProtection(AdminLayoutBase);
