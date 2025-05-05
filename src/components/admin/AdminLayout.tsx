
import { ReactNode } from 'react';
import { withSuperUserProtection } from '@/contexts/SuperUserContext';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  CreditCard, 
  Bell, 
  Settings, 
  LogOut,
  BarChart4
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminLayoutProps {
  children: ReactNode;
}

function AdminLayoutBase({ children }: AdminLayoutProps) {
  const location = useLocation();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logout efetuado com sucesso!');
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 transition-transform bg-gray-900 text-white">
        <div className="h-full px-3 py-4 overflow-y-auto">
          <div className="flex items-center mb-5 p-2">
            <h1 className="text-xl font-bold text-center w-full text-barber-gold">
              ShearHub Admin
            </h1>
          </div>

          <nav className="space-y-1">
            {[
              {
                name: 'Dashboard',
                href: '/admin',
                icon: LayoutDashboard
              },
              {
                name: 'Barbearias',
                href: '/admin/barbearias',
                icon: Store
              },
              {
                name: 'Usuários',
                href: '/admin/usuarios',
                icon: Users
              },
              {
                name: 'Pagamentos',
                href: '/admin/pagamentos',
                icon: CreditCard
              },
              {
                name: 'Relatórios',
                href: '/admin/relatorios',
                icon: BarChart4
              },
              {
                name: 'Notificações',
                href: '/admin/notificacoes',
                icon: Bell
              },
              {
                name: 'Configurações',
                href: '/admin/configuracoes',
                icon: Settings
              },
            ].map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-4 py-2 text-sm font-medium rounded-lg",
                    isActive
                      ? "bg-barber-gold text-black"
                      : "text-gray-300 hover:bg-gray-700"
                  )}
                >
                  <item.icon className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <Button
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:bg-gray-700 hover:text-white mt-6"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sair
            </Button>
          </nav>
        </div>
      </aside>

      <div className="ml-64 flex-1 overflow-auto">
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export const AdminLayout = withSuperUserProtection(AdminLayoutBase);
