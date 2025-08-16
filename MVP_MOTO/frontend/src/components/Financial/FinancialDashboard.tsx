// Dashboard Financeiro
// Sistema de Gestão de Oficina Mecânica de Motos

import React from 'react';
import { FinancialDashboard as DashboardData } from '@/services/financialService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface FinancialDashboardProps {
  data: DashboardData | null;
  loading?: boolean;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  data,
  loading = false,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (value: number) => {
    if (value > 0) return ArrowUpRight;
    if (value < 0) return ArrowDownRight;
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Dados não disponíveis
        </h3>
        <p className="text-gray-500">
          Não foi possível carregar os dados financeiros.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Receitas */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Receitas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data.cashFlow.income)}
                </p>
              </div>
            </div>
            {data.monthlyComparison.growth.income !== 0 && (
              <div className={`flex items-center ${getGrowthColor(data.monthlyComparison.growth.income)}`}>
                {React.createElement(getGrowthIcon(data.monthlyComparison.growth.income) || 'div', {
                  className: 'w-4 h-4 mr-1'
                })}
                <span className="text-sm font-medium">
                  {formatPercentage(data.monthlyComparison.growth.income)}
                </span>
              </div>
            )}
          </div>
          <div className="text-sm text-gray-600">
            Mês anterior: {formatCurrency(data.monthlyComparison.previousMonth.income)}
          </div>
        </div>

        {/* Despesas */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Despesas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data.cashFlow.expense)}
                </p>
              </div>
            </div>
            {data.monthlyComparison.growth.expense !== 0 && (
              <div className={`flex items-center ${getGrowthColor(-data.monthlyComparison.growth.expense)}`}>
                {React.createElement(getGrowthIcon(-data.monthlyComparison.growth.expense) || 'div', {
                  className: 'w-4 h-4 mr-1'
                })}
                <span className="text-sm font-medium">
                  {formatPercentage(data.monthlyComparison.growth.expense)}
                </span>
              </div>
            )}
          </div>
          <div className="text-sm text-gray-600">
            Mês anterior: {formatCurrency(data.monthlyComparison.previousMonth.expense)}
          </div>
        </div>

        {/* Saldo */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${data.cashFlow.balance >= 0 ? 'bg-blue-100' : 'bg-red-100'}`}>
                <Wallet className={`w-6 h-6 ${data.cashFlow.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Saldo</p>
                <p className={`text-2xl font-bold ${data.cashFlow.balance >= 0 ? 'text-blue-900' : 'text-red-900'}`}>
                  {formatCurrency(data.cashFlow.balance)}
                </p>
              </div>
            </div>
            {data.monthlyComparison.growth.balance !== 0 && (
              <div className={`flex items-center ${getGrowthColor(data.monthlyComparison.growth.balance)}`}>
                {React.createElement(getGrowthIcon(data.monthlyComparison.growth.balance) || 'div', {
                  className: 'w-4 h-4 mr-1'
                })}
                <span className="text-sm font-medium">
                  {formatPercentage(data.monthlyComparison.growth.balance)}
                </span>
              </div>
            )}
          </div>
          <div className="text-sm text-gray-600">
            Mês anterior: {formatCurrency(data.monthlyComparison.previousMonth.balance)}
          </div>
        </div>
      </div>

      {/* Contas a Pagar e Receber */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contas a Receber */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <CreditCard className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Contas a Receber</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(data.accountsReceivable.total)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pendentes</span>
              <span className="font-medium text-yellow-600">
                {formatCurrency(data.accountsReceivable.pending)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Em Atraso</span>
              <span className="font-medium text-red-600">
                {formatCurrency(data.accountsReceivable.overdue)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Recebidas</span>
              <span className="font-medium text-green-600">
                {formatCurrency(data.accountsReceivable.paid)}
              </span>
            </div>
          </div>

          {data.accountsReceivable.overdue > 0 && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                <span className="text-sm font-medium text-red-800">
                  Atenção: Há contas em atraso
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Contas a Pagar */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <CreditCard className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Contas a Pagar</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(data.accountsPayable.total)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pendentes</span>
              <span className="font-medium text-yellow-600">
                {formatCurrency(data.accountsPayable.pending)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Em Atraso</span>
              <span className="font-medium text-red-600">
                {formatCurrency(data.accountsPayable.overdue)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pagas</span>
              <span className="font-medium text-green-600">
                {formatCurrency(data.accountsPayable.paid)}
              </span>
            </div>
          </div>

          {data.accountsPayable.overdue > 0 && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                <span className="text-sm font-medium text-red-800">
                  Atenção: Há contas em atraso
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Principais Categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Receitas */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Principais Receitas
          </h3>
          
          {data.topCategories.income.length > 0 ? (
            <div className="space-y-3">
              {data.topCategories.income.slice(0, 5).map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-900">
                      {category.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(category.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {category.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Nenhuma receita registrada</p>
          )}
        </div>

        {/* Top Despesas */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Principais Despesas
          </h3>
          
          {data.topCategories.expense.length > 0 ? (
            <div className="space-y-3">
              {data.topCategories.expense.slice(0, 5).map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-900">
                      {category.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(category.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {category.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Nenhuma despesa registrada</p>
          )}
        </div>
      </div>
    </div>
  );
};