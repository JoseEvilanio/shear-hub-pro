import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  CreditCard, 
  BarChart, 
  Bell, 
  Settings, 
  ChevronRight,
  Shield,
  Loader2,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { withSuperUserProtection } from '@/contexts/SuperUserContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSuperUser, setIsSuperUser] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const checkSuperUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/login');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        setIsSuperUser(profile?.role === 'superuser');
      } catch (error) {
        console.error('Error checking superuser status:', error);
        toast.error('Erro ao verificar permissões');
      } finally {
        setLoading(false);
      }
    };

    checkSuperUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Você saiu da sua conta");
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Erro ao fazer logout');
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-background">
        <div className="flex h-16 items-center border-b px-4">
          <Link to="/admin" className="flex items-center gap-2 font-semibold">
            <Shield className="h-6 w-6" />
            <span>Admin</span>
          </Link>
        </div>
        <nav className="space-y-1 p-4">
          <Link
            to="/admin"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
              location.pathname === "/admin" && "bg-accent"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            to="/admin/barbearias"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
              location.pathname === "/admin/barbearias" && "bg-accent"
            )}
          >
            <Store className="h-4 w-4" />
            Barbearias
          </Link>
          <Link
            to="/admin/usuarios"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
              location.pathname === "/admin/usuarios" && "bg-accent"
            )}
          >
            <Users className="h-4 w-4" />
            Usuários
          </Link>
          <Link
            to="/admin/pagamentos"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
              location.pathname === "/admin/pagamentos" && "bg-accent"
            )}
          >
            <CreditCard className="h-4 w-4" />
            Pagamentos
          </Link>
          <Link
            to="/admin/relatorios"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
              location.pathname === "/admin/relatorios" && "bg-accent"
            )}
          >
            <BarChart className="h-4 w-4" />
            Relatórios
          </Link>
          <Link
            to="/admin/notificacoes"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
              location.pathname === "/admin/notificacoes" && "bg-accent"
            )}
          >
            <Bell className="h-4 w-4" />
            Notificações
          </Link>
          <Link
            to="/admin/configuracoes"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
              location.pathname === "/admin/configuracoes" && "bg-accent"
            )}
          >
            <Settings className="h-4 w-4" />
            Configurações
          </Link>
          {isSuperUser && (
            <Link
              to="/admin/superusuarios"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                location.pathname === "/admin/superusuarios" && "bg-accent"
              )}
            >
              <Shield className="h-4 w-4" />
              Superusuários
            </Link>
          )}
        </nav>
        <div className="mt-auto border-t p-4">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-500 transition-all hover:bg-accent",
              isLoggingOut && "opacity-50 cursor-not-allowed"
            )}
          >
            {isLoggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            {isLoggingOut ? "Saindo..." : "Sair"}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

// Export both the base component and the protected version
export const ProtectedAdminLayout = withSuperUserProtection(AdminLayout);
