import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { SuperUserProvider } from "@/contexts/SuperUserContext";
import { lazy, Suspense } from "react";

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
import { ClientLayout } from "@/components/layout/client-layout";

// Superuser Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBarbershops from "./pages/admin/AdminBarbershops";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminReports from "./pages/admin/AdminReports";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminSettings from "./pages/admin/AdminSettings";
import SuperUserManager from "./pages/admin/SuperUserManager";

// Lazy load client pages
const ClientHome = lazy(() => import("@/pages/cliente/ClientHome"));
const ClientBarberShops = lazy(() => import("@/pages/cliente/ClientBarberShops"));
const ClientBarberShopDetail = lazy(() => import("@/pages/cliente/ClientBarberShopDetail"));
const ClientAppointments = lazy(() => import("@/pages/cliente/ClientAppointments"));
const ClientPayments = lazy(() => import("@/pages/cliente/ClientPayments"));
const ClientProfile = lazy(() => import("@/pages/cliente/ClientProfile"));
const ClientBookingForm = lazy(() => import("@/pages/cliente/ClientBookingForm"));
const ClientLoyalty = lazy(() => import("@/pages/cliente/ClientLoyalty"));

// Create a client
const queryClient = new QueryClient();

// Layout wrapper para as rotas do cliente
const ClientLayoutWrapper = () => {
  return (
    <ClientLayout>
      <Suspense fallback={<div>Carregando...</div>}>
        <Outlet />
      </Suspense>
    </ClientLayout>
  );
};

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
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/agendamentos" element={<Appointments />} />
              <Route path="/dashboard/barbeiros" element={<Barbers />} />
              <Route path="/dashboard/clientes" element={<Clients />} />
              <Route path="/dashboard/servicos" element={<Services />} />
              <Route path="/dashboard/fidelidade" element={<Loyalty />} />
              <Route path="/dashboard/pagamentos" element={<Payments />} />
              <Route path="/dashboard/relatorios" element={<Reports />} />
              <Route path="/dashboard/configuracoes" element={<Settings />} />
              
              {/* Rotas do Cliente */}
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
              <Route path="/admin/barbershops" element={<AdminBarbershops />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/payments" element={<AdminPayments />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/notifications" element={<AdminNotifications />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/superuser" element={<SuperUserManager />} />

              {/* Rota 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SuperUserProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
