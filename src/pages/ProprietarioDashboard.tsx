import React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

const ProprietarioDashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Painel do Proprietário</h2>
        <p className="text-muted-foreground">
          Bem-vindo ao painel do proprietário! Aqui você pode gerenciar sua barbearia, agendamentos e equipe.
        </p>
        {/* Adicione widgets e funcionalidades específicas do proprietário aqui */}
      </div>
    </DashboardLayout>
  );
};

export default ProprietarioDashboard;