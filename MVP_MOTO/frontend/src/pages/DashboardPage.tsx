// Página do Dashboard
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useEffect } from 'react';
import { useAppSelector } from '@/store';
import { useReports } from '@/hooks/useReports';
import {
  Users,
  Wrench,
  ShoppingCart,
  DollarSign,
  Package,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Activity,
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';



interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
}) => {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-600 bg-blue-50',
    green: 'bg-green-500 text-green-600 bg-green-50',
    yellow: 'bg-yellow-500 text-yellow-600 bg-yellow-50',
    red: 'bg-red-500 text-red-600 bg-red-50',
    purple: 'bg-purple-500 text-purple-600 bg-purple-50',
    indigo: 'bg-indigo-500 text-indigo-600 bg-indigo-50',
  };

  const [bgColor, , cardBg] = colorClasses[color].split(' ');

  return (
    <div className={`${cardBg} rounded-lg p-6 border border-gray-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp
                className={`w-4 h-4 mr-1 ${
                  trend.isPositive ? 'text-green-500' : 'text-red-500 rotate-180'
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${bgColor}`}>
          <Icon className={`w-6 h-6 text-white`} />
        </div>
      </div>
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { dashboardMetrics, dashboardLoading, loadDashboardMetrics } = useReports();

  useEffect(() => {
    loadDashboardMetrics();
  }, [loadDashboardMetrics]);

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bem-vindo, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-1">
              Aqui está um resumo das atividades da sua oficina
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Último acesso: {user?.lastLogin ? 
                new Date(user.lastLogin).toLocaleString('pt-BR') : 
                'Primeiro acesso'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {dashboardMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total de Clientes"
            value={dashboardMetrics.clients.total}
            subtitle={`${dashboardMetrics.clients.newThisMonth} novos este mês`}
            icon={Users}
            color="blue"
            trend={{ value: 12, isPositive: true }}
          />
          
          <StatCard
            title="Vendas do Mês"
            value={dashboardMetrics.sales.thisMonth.count}
            subtitle={`R$ ${dashboardMetrics.sales.thisMonth.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={ShoppingCart}
            color="indigo"
            trend={{ value: dashboardMetrics.sales.growth.count, isPositive: dashboardMetrics.sales.growth.count >= 0 }}
          />
          
          <StatCard
            title="Ordens de Serviço"
            value={dashboardMetrics.serviceOrders.total}
            subtitle={`${dashboardMetrics.serviceOrders.pending} pendentes, ${dashboardMetrics.serviceOrders.inProgress} em andamento`}
            icon={Wrench}
            color="purple"
          />
          
          <StatCard
            title="Saldo em Caixa"
            value={`R$ ${dashboardMetrics.financial.cashBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            subtitle={dashboardMetrics.financial.accountsPayable > 0 ? `R$ ${dashboardMetrics.financial.accountsPayable.toFixed(2)} a pagar` : 'Sem pendências'}
            icon={DollarSign}
            color={dashboardMetrics.financial.cashBalance >= 0 ? 'green' : 'red'}
          />
          
          <StatCard
            title="Estoque"
            value={`${dashboardMetrics.inventory.lowStock} baixo`}
            subtitle={dashboardMetrics.inventory.outOfStock > 0 ? `${dashboardMetrics.inventory.outOfStock} em falta` : 'Sem produtos em falta'}
            icon={Package}
            color={dashboardMetrics.inventory.lowStock > 10 ? 'red' : 'yellow'}
          />

          <StatCard
            title="Aniversariantes"
            value={dashboardMetrics.clients.birthdaysThisMonth}
            subtitle="clientes este mês"
            icon={Calendar}
            color="purple"
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Atividade Recente</h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {/* Placeholder para atividades recentes */}
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm text-gray-600">
                  OS #001/2024 foi concluída por João Silva
                </p>
                <span className="text-xs text-gray-400">há 2 horas</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm text-gray-600">
                  Nova venda #VD002/2024 registrada
                </p>
                <span className="text-xs text-gray-400">há 4 horas</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <p className="text-sm text-gray-600">
                  Produto "Óleo Motor" com estoque baixo
                </p>
                <span className="text-xs text-gray-400">há 6 horas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Alertas</h3>
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboardMetrics && dashboardMetrics.inventory.lowStock > 0 && (
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Estoque Baixo
                    </p>
                    <p className="text-sm text-yellow-700">
                      {dashboardMetrics.inventory.lowStock} produtos com estoque abaixo do mínimo
                    </p>
                  </div>
                </div>
              )}
              
              {dashboardMetrics && dashboardMetrics.financial.accountsPayable > 0 && (
                <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Contas a Pagar
                    </p>
                    <p className="text-sm text-red-700">
                      R$ {dashboardMetrics.financial.accountsPayable.toFixed(2)} em contas pendentes
                    </p>
                  </div>
                </div>
              )}
              
              {dashboardMetrics && dashboardMetrics.clients.birthdaysThisMonth > 0 && (
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Aniversariantes
                    </p>
                    <p className="text-sm text-blue-700">
                      {dashboardMetrics.clients.birthdaysThisMonth} clientes fazem aniversário este mês
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};