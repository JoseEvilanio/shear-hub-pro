// Página Principal Financeira
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useState, useEffect } from 'react';
import { useFinancial } from '@/hooks/useFinancial';
import { FinancialDashboard } from '@/components/Financial/FinancialDashboard';
import { AccountsPayable } from '@/components/Financial/AccountsPayable';
import { AccountsReceivable } from '@/components/Financial/AccountsReceivable';
import { CashControl } from '@/components/Financial/CashControl';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  Download,
} from 'lucide-react';

type TabType = 'dashboard' | 'receivable' | 'payable' | 'cash';

export const FinancialPage: React.FC = () => {
  const {
    // Estados do Dashboard
    dashboard,
    dashboardLoading,
    
    // Estados das Contas a Pagar
    accountsPayable,
    payableLoading,
    
    // Estados das Contas a Receber
    accountsReceivable,
    receivableLoading,
    
    // Estados das Movimentações de Caixa
    cashMovements,
    cashLoading,
    
    // Estados gerais
    error,
    incomeCategories,
    expenseCategories,
    
    // Ações
    loadDashboard,
    loadAccountsPayable,
    loadAccountsReceivable,
    loadCashMovements,
    payAccount,
    receivePayment,
    createCashMovement,
    updateCashMovement,
    deleteCashMovement,
    exportFinancialReport,
    
    // Utilitários
    formatStatus,
    getStatusColor,
    formatPaymentMethod,
    isOverdue,
    getDaysLate,
    calculateLateFee,
  } = useFinancial();

  // Estados locais
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [dateFilter, setDateFilter] = useState({
    dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
  });

  // Carregar dados quando a aba mudar
  useEffect(() => {
    switch (activeTab) {
      case 'receivable':
        loadAccountsReceivable();
        break;
      case 'payable':
        loadAccountsPayable();
        break;
      case 'cash':
        loadCashMovements();
        break;
    }
  }, [activeTab]);

  const handleDateFilterChange = (newDateFilter: { dateFrom: string; dateTo: string }) => {
    setDateFilter(newDateFilter);
    loadDashboard(newDateFilter);
  };

  const tabs = [
    {
      id: 'dashboard' as TabType,
      name: 'Dashboard',
      icon: DollarSign,
    },
    {
      id: 'receivable' as TabType,
      name: 'Contas a Receber',
      icon: TrendingUp,
      count: accountsReceivable.filter(acc => acc.status === 'pending').length,
    },
    {
      id: 'payable' as TabType,
      name: 'Contas a Pagar',
      icon: TrendingDown,
      count: accountsPayable.filter(acc => acc.status === 'pending').length,
    },
    {
      id: 'cash' as TabType,
      name: 'Controle de Caixa',
      icon: Wallet,
      count: cashMovements.length,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
              <p className="text-gray-600">Gerencie contas, caixa e relatórios financeiros</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Filtro de Data */}
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  value={dateFilter.dateFrom}
                  onChange={(e) => handleDateFilterChange({ ...dateFilter, dateFrom: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <span className="text-gray-500">até</span>
                <input
                  type="date"
                  value={dateFilter.dateTo}
                  onChange={(e) => handleDateFilterChange({ ...dateFilter, dateTo: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <button
                onClick={() => exportFinancialReport('cash-flow', dateFilter)}
                className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    isActive
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.name}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="ml-2 px-2 py-1 text-xs bg-primary-100 text-primary-600 rounded-full">
                      {tab.count}
                    </span>
                  )}
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
          <FinancialDashboard
            data={dashboard}
            loading={dashboardLoading}
          />
        )}

        {activeTab === 'receivable' && (
          <AccountsReceivable
            accounts={accountsReceivable}
            loading={receivableLoading}
            onReceivePayment={receivePayment}
            formatStatus={formatStatus}
            getStatusColor={getStatusColor}
            formatPaymentMethod={formatPaymentMethod}
            isOverdue={isOverdue}
            getDaysLate={getDaysLate}
            calculateLateFee={calculateLateFee}
          />
        )}

        {activeTab === 'payable' && (
          <AccountsPayable
            accounts={accountsPayable}
            loading={payableLoading}
            onPayAccount={payAccount}
            formatStatus={formatStatus}
            getStatusColor={getStatusColor}
            formatPaymentMethod={formatPaymentMethod}
            isOverdue={isOverdue}
            getDaysLate={getDaysLate}
            calculateLateFee={calculateLateFee}
          />
        )}

        {activeTab === 'cash' && (
          <CashControl
            movements={cashMovements}
            loading={cashLoading}
            onCreateMovement={createCashMovement}
            onUpdateMovement={updateCashMovement}
            onDeleteMovement={deleteCashMovement}
            incomeCategories={incomeCategories}
            expenseCategories={expenseCategories}
            formatPaymentMethod={formatPaymentMethod}
          />
        )}
      </div>
    </div>
  );
};