import { supabase } from "@/integrations/supabase/client";
import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Home,
  Scissors,
  Calendar,
  Star,
  CreditCard,
  User,
  LogOut,
  Menu
} from "lucide-react";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Você precisa estar logado para acessar esta área");
          navigate("/login");
          return;
        }

        // Buscar dados do perfil do usuário
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("first_name, last_name, email, role")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Erro ao buscar perfil:", error);
          // Se o perfil não existir, criar um novo
          if (error.code === 'PGRST116') {
            const { error: insertError } = await supabase
              .from("profiles")
              .insert({
                id: session.user.id,
                email: session.user.email,
                role: 'client',
                first_name: session.user.email?.split('@')[0] || '',
                last_name: ''
              });
            
            if (insertError) {
              console.error("Erro ao criar perfil:", insertError);
              toast.error("Erro ao criar perfil do usuário");
              return;
            }
            
            setUserName(session.user.email?.split('@')[0] || "Usuário");
            return;
          }
          
          toast.error("Erro ao carregar perfil");
          return;
        }

        if (profile) {
          // Verificar se o usuário tem permissão de cliente
          if (profile.role !== 'client') {
            toast.error("Acesso restrito apenas para clientes");
            navigate("/login");
            return;
          }
          
          const displayName = profile.first_name 
            ? `${profile.first_name} ${profile.last_name || ''}`.trim()
            : profile.email?.split('@')[0] || "Usuário";
            
          setUserName(displayName);
        }
      } catch (error) {
        console.error("Erro na autenticação:", error);
        toast.error("Sessão expirada. Faça login novamente.");
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="ml-2 text-lg">Carregando...</span>
      </div>
    );
  }

  const menuItems = [
    { name: "Início", path: "/cliente", icon: <Home /> },
    { name: "Barbearias", path: "/cliente/barbearias", icon: <Scissors /> },
    { name: "Meus Agendamentos", path: "/cliente/agendamentos", icon: <Calendar /> },
    { name: "Fidelidade", path: "/cliente/fidelidade", icon: <Star /> },
    { name: "Pagamentos", path: "/cliente/pagamentos", icon: <CreditCard /> },
    { name: "Perfil", path: "/cliente/perfil", icon: <User /> },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Você saiu da sua conta");
    navigate("/login");
  };

  const NavItems = () => (
    <>
      {menuItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
            location.pathname === item.path ? "bg-accent text-primary font-medium" : ""
          )}
          onClick={() => setOpen(false)}
        >
          {item.icon}
          {item.name}
        </Link>
      ))}
    </>
  );

  const UserAvatar = () => (
    <Avatar className="h-8 w-8">
      <AvatarFallback className="bg-barber-gold">
        {userName ? userName.substring(0,2).toUpperCase() : "US"}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <nav className="grid gap-2 py-4">
                <NavItems />
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-destructive justify-start hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut />
                  Sair
                </Button>
              </nav>
            </SheetContent>
          </Sheet>

          <Link to="/cliente" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-barber-gold to-yellow-400">
              ShearHub
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <UserAvatar />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1 items-center">
                  <Avatar className="w-16 h-16 mb-2">
                    <AvatarFallback className="bg-barber-gold text-2xl">
                      {userName ? userName.substring(0,2).toUpperCase() : "US"}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium leading-none">{userName}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/cliente/perfil">Meu Perfil</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Sidebar e conteúdo principal */}
      <div className="flex flex-1">
        {/* Sidebar fixa para desktop */}
        <aside className="hidden lg:flex flex-col w-64 bg-barber-black text-white border-r border-barber-gray min-h-[calc(100vh-4rem)]">
          <div className="flex items-center gap-2 px-6 py-6 border-b border-barber-gray">
            <UserAvatar />
            <div className="ml-3">
              <div className="font-semibold text-lg text-barber-gold">{userName}</div>
              <div className="text-xs text-muted-foreground">Cliente</div>
            </div>
          </div>
          <nav className="flex-1 flex flex-col gap-1 px-4 py-6">
            <NavItems />
          </nav>
          <div className="px-4 pb-6 mt-auto">
            <Button
              variant="ghost"
              className="flex items-center gap-3 w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut />
              Sair
            </Button>
          </div>
        </aside>

        {/* Conteúdo principal */}
        <main className="flex-1 h-[calc(100vh-4rem)] overflow-auto bg-background">
          <ScrollArea className="h-full">
            <div className="container max-w-7xl py-6 lg:py-8">
              {children}
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}

