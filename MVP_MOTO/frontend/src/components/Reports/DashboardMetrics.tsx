// Dashboard de Métricas Principais
// Sistema de Gestão de Oficina Mecânica de Motos

import React from 'react';
import { DashboardMetrics as MetricsData } from '@/services/reportsService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  ShoppingCart,
  Wrench,
  DollarSign,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Gift,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface DashboardMetricsProps {
  data: MetricsData | null;
  loading?: boolean;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
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
        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Dados não disponíveis
        </h3>
        <p className="text-gray-500">
          Não foi possível carregar as métricas do dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas de Vendas */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Vendas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Hoje</p>
                  <p className="text-xl font-bold text-gray-900">{data.sales.today.count}</p>
                  <p className="text-sm text-gray-600">{formatCurrency(data.sales.today.amount)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Esta Semana</p>
                  <p className="text-xl font-bold text-gray-900">{data.sales.thisWeek.count}</p>
                  <p className="text-sm text-gray-600">{formatCurrency(data.sales.thisWeek.amount)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Este Mês</p>
                  <p className="text-xl font-bold text-gray-900">{data.sales.thisMonth.count}</p>
                  <p className="text-sm text-gray-600">{formatCurrency(data.sales.thisMonth.amount)}</p>
                </div>
              </div>
              {data.sales.growth.count !== 0 && (
                <div className={`flex items-center ${getGrowthColor(data.sales.growth.count)}`}>
                  {React.createElement(getGrowthIcon(data.sales.growth.count) || 'div', {
                    className: 'w-4 h-4 mr-1'
                  })}
                  <span className="text-sm font-medium">
                    {formatPercentage(data.sales.growth.count)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Crescimento</p>
                  <p className={`text-xl font-bold ${getGrowthColor(data.sales.growth.amount)}`}>
                    {formatPercentage(data.sales.growth.amount)}
                  </p>
                  <p className="text-sm text-gray-600">Faturamento</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas de Ordens de Serviço */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ordens de Serviço</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{data.serviceOrders.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wrench className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Em Andamento</p>
                <p className="text-2xl font-bold text-blue-600">{data.serviceOrders.inProgress}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">{data.serviceOrders.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Wrench className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">{data.serviceOrders.total}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas Financeiras */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Financeiro</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${data.financial.cashBalance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <DollarSign className={`w-6 h-6 ${data.financial.cashBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Saldo em Caixa</p>
                <p className={`text-xl font-bold ${data.financial.cashBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(data.financial.cashBalance)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">A Receber</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(data.financial.accountsReceivable)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">A Pagar</p>
                <p className="text-xl font-bold text-red-600">
                  {formatCurrency(data.financial.accountsPayable)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${data.financial.netBalance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <DollarSign className={`w-6 h-6 ${data.financial.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Saldo Líquido</p>
                <p className={`text-xl font-bold ${data.financial.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(data.financial.netBalance)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas de Estoque e Clientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estoque */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Estoque</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Estoque Baixo</p>
                  <p className="text-2xl font-bold text-yellow-600">{data.inventory.lowStock}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Package className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Em Falta</p>
                  <p className="text-2xl font-bold text-red-600">{data.inventory.outOfStock}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Valor Total</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(data.inventory.totalValue)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clientes */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Clientes</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-blue-600">{data.clients.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Gift className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Aniversários</p>
                  <p className="text-2xl font-bold text-purple-600">{data.clients.birthdaysThisMonth}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Novos</p>
                  <p className="text-2xl font-bold text-green-600">{data.clients.newThisMonth}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};