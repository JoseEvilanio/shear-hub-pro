// Página Principal de Relatórios
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useState, useEffect } from 'react';
import { useReports } from '@/hooks/useReports';
import { DashboardMetrics } from '@/components/Reports/DashboardMetrics';
import { BirthdayReport } from '@/components/Reports/BirthdayReport';
import { SalesReport } from '@/components/Reports/SalesReport';
import {
  BarChart3,
  Gift,
  ShoppingCart,
  Wrench,
  Package,
  DollarSign,
  Calendar,
} from 'lucide-react';

type TabType = 'dashboard' | 'birthdays' | 'sales' | 'service-orders' | 'inventory' | 'financial';

export const ReportsPage: React.FC = () => {
  const {
    // Estados dos relatórios
    dashboardMetrics,
    birthdayReport,
    salesReport,
    
    // Estados de loading
    dashboardLoading,
    birthdayLoading,
    salesLoading,
    
    // Estado de erro
    error,
    
    // Ações de carregamento
    loadDashboardMetrics,
    loadBirthdayReport,
    loadSalesReport,
    loadServiceOrdersReport,
    loadInventoryReport,
    loadFinancialReport,
    
    // Ações de exportação
    exportBirthdayReport,
    exportSalesReport,
  } = useReports();

  // Estados locais
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Carregar dados iniciais
  useEffect(() => {
    loadDashboardMetrics();
  }, [loadDashboardMetrics]);

  // Carregar dados quando a aba mudar
  useEffect(() => {
    switch (activeTab) {
      case 'birthdays':
        loadBirthdayReport();
        break;
      case 'sales':
        loadSalesReport();
        break;
      case 'service-orders':
        loadServiceOrdersReport();
        break;
      case 'inventory':
        loadInventoryReport();
        break;
      case 'financial':
        loadFinancialReport();
        break;
    }
  }, [activeTab]);

  const tabs = [
    {
      id: 'dashboard' as TabType,
      name: 'Dashboard',
      icon: BarChart3,
      description: 'Visão geral das métricas principais',
    },
    {
      id: 'birthdays' as TabType,
      name: 'Aniversariantes',
      icon: Gift,
      description: 'Clientes com aniversário no mês',
    },
    {
      id: 'sales' as TabType,
      name: 'Vendas',
      icon: ShoppingCart,
      description: 'Relatórios de vendas e faturamento',
    },
    {
      id: 'service-orders' as TabType,
      name: 'Ordens de Serviço',
      icon: Wrench,
      description: 'Relatórios de serviços prestados',
    },
    {
      id: 'inventory' as TabType,
      name: 'Estoque',
      icon: Package,
      description: 'Relatórios de produtos e movimentações',
    },
    {
      id: 'financial' as TabType,
      name: 'Financeiro',
      icon: DollarSign,
      description: 'Relatórios financeiros e fluxo de caixa',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
              <p className="text-gray-600">Análises e métricas do seu negócio</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Atualizado em tempo real</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    isActive
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  title={tab.description}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <DashboardMetrics
            data={dashboardMetrics}
            loading={dashboardLoading}
          />
        )}

        {activeTab === 'birthdays' && (
          <BirthdayReport
            data={birthdayReport}
            loading={birthdayLoading}
            onMonthChange={loadBirthdayReport}
            onExport={exportBirthdayReport}
          />
        )}

        {activeTab === 'sales' && (
          <SalesReport
            data={salesReport}
            loading={salesLoading}
            onFiltersChange={loadSalesReport}
            onExport={exportSalesReport}
          />
        )}

        {activeTab === 'service-orders' && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Relatório de Ordens de Serviço
            </h3>
            <p className="text-gray-500">
              Relatório em desenvolvimento. Em breve você poderá visualizar análises detalhadas das ordens de serviço.
            </p>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Relatório de Estoque
            </h3>
            <p className="text-gray-500">
              Relatório em desenvolvimento. Em breve você poderá visualizar análises detalhadas do estoque.
            </p>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Relatório Financeiro
            </h3>
            <p className="text-gray-500">
              Relatório em desenvolvimento. Em breve você poderá visualizar análises detalhadas financeiras.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};