import { useEffect, lazy, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
} from "react-router-dom";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { SuperUserProvider } from "@/contexts/SuperUserContext";
import { supabase } from "@/integrations/supabase/client";
import ProprietarioDashboard from "./pages/ProprietarioDashboard";

// AuthCallback component
const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        console.error('Erro ao buscar o role:', error);
        navigate('/login');
        return;
      }

      const role = data.role;

      switch (role) {
        case 'client':
          navigate('/cliente');
          break;
        case 'owner':
          navigate('/dashboard'); // <-- Correção feita aqui
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          navigate('/login');
      }
    };

    checkRoleAndRedirect();
  }, [navigate]);

  return (
    <div>
      <p>Redirecionando...</p>
    </div>
  );
};


// Páginas comuns
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Barbers from "./pages/Barbers";
import Clients from "./pages/Clients";
import Services from "./pages/Services";
import Loyalty from "./pages/Loyalty";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Layout cliente
import { ClientLayout } from "@/components/layout/client-layout";

// Páginas admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import Barbearias from "./pages/admin/Barbearias";
import Usuarios from "./pages/admin/Usuarios";
import Pagamentos from "./pages/admin/Pagamentos";
import Relatorios from "./pages/admin/Relatorios";
import Notificacoes from "./pages/admin/Notificacoes";
import Configuracoes from "./pages/admin/Configuracoes";
import Superusuarios from "./pages/admin/Superusuarios";

// Páginas cliente com lazy load
const ClientHome = lazy(() => import("@/pages/cliente/ClientHome"));
const ClientBarberShops = lazy(() => import("@/pages/cliente/ClientBarberShops"));
const ClientBarberShopDetail = lazy(() => import("@/pages/cliente/ClientBarberShopDetail"));
const ClientAppointments = lazy(() => import("@/pages/cliente/ClientAppointments"));
const ClientPayments = lazy(() => import("@/pages/cliente/ClientPayments"));
const ClientProfile = lazy(() => import("@/pages/cliente/ClientProfile"));
const ClientBookingForm = lazy(() => import("@/pages/cliente/ClientBookingForm"));
const ClientLoyalty = lazy(() => import("@/pages/cliente/ClientLoyalty"));

// Query Client
const queryClient = new QueryClient();

// Wrapper layout cliente
const ClientLayoutWrapper = () => {
  return (
    <ClientLayout>
      <Suspense fallback={<div>Carregando...</div>}>
        <Outlet />
      </Suspense>
    </ClientLayout>
  );
};

// Componente App
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <BrowserRouter>
          <SuperUserProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Dashboard (owner) */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/agendamentos" element={<Appointments />} />
              <Route path="/dashboard/barbeiros" element={<Barbers />} />
              <Route path="/dashboard/clientes" element={<Clients />} />
              <Route path="/dashboard/servicos" element={<Services />} />
              <Route path="/dashboard/fidelidade" element={<Loyalty />} />
              <Route path="/dashboard/pagamentos" element={<Payments />} />
              <Route path="/dashboard/relatorios" element={<Reports />} />
              <Route path="/dashboard/configuracoes" element={<Settings />} />

              {/* Rotas do Cliente com layout */}
              <Route element={<ClientLayoutWrapper />}>
                <Route path="/cliente" element={<ClientHome />} />
                <Route path="/cliente/barbearias" element={<ClientBarberShops />} />
                <Route path="/cliente/barbearia/:id" element={<ClientBarberShopDetail />} />
                <Route path="/cliente/agendamentos" element={<ClientAppointments />} />
                <Route path="/cliente/fidelidade" element={<ClientLoyalty />} />
                <Route path="/cliente/pagamentos" element={<ClientPayments />} />
                <Route path="/cliente/perfil" element={<ClientProfile />} />
                <Route path="/cliente/agenda/:id" element={<ClientBookingForm />} />
              </Route>

              {/* Rotas do Admin */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/barbearias" element={<Barbearias />} />
              <Route path="/admin/usuarios" element={<Usuarios />} />
              <Route path="/admin/pagamentos" element={<Pagamentos />} />
              <Route path="/admin/relatorios" element={<Relatorios />} />
              <Route path="/admin/notificacoes" element={<Notificacoes />} />
              <Route path="/admin/configuracoes" element={<Configuracoes />} />
              <Route path="/admin/superusuarios" element={<Superusuarios />} />
              <Route path="/proprietario" element={<ProprietarioDashboard />} />

              {/* Página 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SuperUserProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
