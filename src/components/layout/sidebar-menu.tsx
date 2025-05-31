
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Calendar, 
  Users, 
  Scissors, 
  Award, 
  CreditCard, 
  BarChart, 
  Settings, 
  Menu,
  LogOut,
  Home
} from "lucide-react";
import { useState } from "react";

import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function SidebarMenu() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Você saiu da sua conta");
    navigate("/login");
  };

  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Calendar, label: "Agendamentos", href: "/dashboard/agendamentos" },
    { icon: Users, label: "Barbeiros", href: "/dashboard/barbeiros" },
    { icon: Users, label: "Clientes", href: "/dashboard/clientes" },
    { icon: Scissors, label: "Serviços", href: "/dashboard/servicos" },
    { icon: Award, label: "Fidelidade", href: "/dashboard/fidelidade" },
    { icon: CreditCard, label: "Pagamentos", href: "/dashboard/pagamentos" },
    { icon: BarChart, label: "Relatórios", href: "/dashboard/relatorios" },
    { icon: Settings, label: "Configurações", href: "/dashboard/configuracoes" },
  ];

  return (
    <div 
      className={cn(
        "bg-barber-black text-white h-screen flex flex-col border-r border-barber-gray transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-barber-gray">
        <div className={cn("flex items-center", collapsed && "justify-center w-full")}>
          {!collapsed && (
            <span className="text-xl font-bold text-barber-gold">ShearHub</span>
          )}
          {collapsed && (
            <span className="text-xl font-bold text-barber-gold">SH</span>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className={cn("text-white hover:bg-barber-gray", collapsed && "hidden")}
        >
          <Menu size={18} />
        </Button>
      </div>

      <div className="flex flex-col flex-grow py-4 overflow-y-auto">
        {menuItems.map((item, index) => (
          <Link 
            key={index} 
            to={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-sm hover:bg-barber-gray transition-colors",
              collapsed ? "justify-center" : ""
            )}
          >
            <item.icon size={18} className="text-barber-gold" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-barber-gray mt-auto flex items-center justify-between">
        {!collapsed && <ThemeToggle />}
        <Button 
          variant="ghost" 
          size="icon"
          className={cn("text-white hover:bg-barber-gray", collapsed && "mx-auto")}
          onClick={handleLogout}
        >
          <LogOut size={18} />
        </Button>
      </div>
    </div>
  );
}
