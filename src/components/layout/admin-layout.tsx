import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!session) {
          navigate('/admin/login');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email, role')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;

        // Verifica se o usuário tem permissão de admin
        if (profile?.role !== 'admin') {
          navigate('/login');
          return;
        }

        setUser({
          ...session.user,
          email: profile?.email || session.user.email
        });
      } catch (error) {
        console.error('Error:', error);
        navigate('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/admin/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-barber-gold"></div>
      </div>
    );
  }

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/barbearias', label: 'Barbearias', icon: '✂️' },
    { path: '/admin/barbeiros', label: 'Barbeiros', icon: '👨‍💼' },
    { path: '/admin/servicos', label: 'Serviços', icon: '🔧' },
    { path: '/admin/agendamentos', label: 'Agendamentos', icon: '📅' },
    { path: '/admin/perfil', label: 'Perfil', icon: '👤' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link to="/admin" className="mr-6 flex items-center space-x-2">
              <span className="font-bold text-xl bg-gradient-to-r from-barber-gold to-barber-gold/80 bg-clip-text text-transparent">
                ShearHub Admin
              </span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <span className="sr-only">Sair</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        {/* Sidebar */}
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <div className="py-6 pr-6 lg:py-8">
            <div className="flex items-center space-x-4 mb-6">
              <Avatar>
                <AvatarFallback className="bg-barber-gold text-background">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Administrador</p>
              </div>
            </div>
            <nav className="grid items-start gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
                    location.pathname === item.path ? 'bg-accent' : ''
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex w-full flex-col overflow-hidden">
          <div className="flex-1 space-y-4 p-8 pt-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 