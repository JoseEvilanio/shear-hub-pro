
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";

import Login from "./pages/Login";
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

// Create a client
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/agendamentos" element={<Appointments />} />
            <Route path="/dashboard/barbeiros" element={<Barbers />} />
            <Route path="/dashboard/clientes" element={<Clients />} />
            <Route path="/dashboard/servicos" element={<Services />} />
            <Route path="/dashboard/fidelidade" element={<Loyalty />} />
            <Route path="/dashboard/pagamentos" element={<Payments />} />
            <Route path="/dashboard/relatorios" element={<Reports />} />
            <Route path="/dashboard/configuracoes" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
