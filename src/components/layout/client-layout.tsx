
import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
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

  const menuItems = [
    { name: "Início", path: "/cliente", icon: <Home /> },
    { name: "Barbearias", path: "/cliente/barbearias", icon: <Scissors /> },
    { name: "Meus Agendamentos", path: "/cliente/agendamentos", icon: <Calendar /> },
    { name: "Fidelidade", path: "/cliente/fidelidade", icon: <Star /> },
    { name: "Pagamentos", path: "/cliente/pagamentos", icon: <CreditCard /> },
    { name: "Perfil", path: "/cliente/perfil", icon: <User /> },
  ];

  const handleLogout = () => {
    // Em uma aplicação real, implementaria a lógica de logout aqui
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

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header mobile */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
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
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt="Avatar" />
                <AvatarFallback className="bg-barber-gold">JD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">João Silva</p>
                <p className="text-xs leading-none text-muted-foreground">
                  joao@example.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/cliente/perfil">Perfil</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={handleLogout}
            >
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      
      {/* Sidebar and content */}
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r lg:block">
          <div className="sticky top-16 h-[calc(100vh-4rem)] py-6 pl-6 pr-4">
            <ScrollArea className="h-full">
              <div className="space-y-1">
                <NavItems />
              </div>
              <div className="mt-6">
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-destructive justify-start hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut />
                  Sair
                </Button>
              </div>
            </ScrollArea>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 h-[calc(100vh-4rem)] overflow-auto">
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
