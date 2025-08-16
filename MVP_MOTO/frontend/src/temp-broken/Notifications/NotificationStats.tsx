// Estatísticas de Notificações
// Sistema de Gestão de Oficina Mecânica de Motos

import React from 'react';
import { NotificationStats } from '@/services/notificationService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  Bell,
  BellRing,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';

interface NotificationStatsProps {
  stats: NotificationStats | null;
  loading?: boolean;
  formatType: (type: string) => string;
  formatCategory: (category: string) => string;
  formatPriority: (priority: string) => string;
  getTypeColor: (type: string) => string;
  getPriorityColor: (priority: string) => string;
}

export const NotificationStatsComponent: React.FC<NotificationStatsProps> = ({
  stats,
  loading = false,
  formatType,
  formatCategory,
  formatPriority,
  getTypeColor,
  getPriorityColor,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Estatísticas não disponíveis
        </h3>
        <p className="text-gray-500">
          Não foi possível carregar as estatísticas de notificações.
        </p>
      </div>
    );
  }

  const unreadPercentage = stats.total > 0 ? (stats.unread / stats.total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Total de notificações
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Não Lidas</p>
              <p className="text-2xl font-bold text-red-600">{stats.unread}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <BellRing className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Requerem atenção
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Leitura</p>
              <p className="text-2xl font-bold text-green-600">
                {(100 - unreadPercentage).toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Notificações lidas
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Atividade</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.byType.length}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Tipos diferentes
          </p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Por Tipo */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Por Tipo</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {stats.byType.map((item) => {
              const percentage = stats.total > 0 ? (item.count / stats.total) * 100 : 0;
              
              return (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getTypeColor(item.type).split(' ')[1]}`}></div>
                    <span className="text-sm font-medium text-gray-700">
                      {formatType(item.type)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getTypeColor(item.type).split(' ')[1]}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              );
            })}\n          </div>
        </div>

        {/* Por Categoria */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Por Categoria</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {stats.byCategory.map((item) => {
              const percentage = stats.total > 0 ? (item.count / stats.total) * 100 : 0;
              
              return (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium text-gray-700">
                      {formatCategory(item.category)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Por Prioridade */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Por Prioridade</h3>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.byPriority.map((item) => {
            const percentage = stats.total > 0 ? (item.count / stats.total) * 100 : 0;
            
            return (
              <div key={item.priority} className="text-center">
                <div className={`p-4 rounded-lg ${getPriorityColor(item.priority)}`}>
                  <p className="text-2xl font-bold">
                    {item.count}
                  </p>
                  <p className="text-sm font-medium">
                    {formatPriority(item.priority)}
                  </p>
                </div>
                
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getPriorityColor(item.priority).split(' ')[1]}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              📊 Distribuição de Tipos
            </h4>
            <p className="text-sm text-blue-700">
              {stats.byType.length > 0 && (
                <>
                  O tipo mais comum é <strong>{formatType(stats.byType[0].type)}</strong> com{' '}
                  {stats.byType[0].count} notificações ({((stats.byType[0].count / stats.total) * 100).toFixed(1)}%).
                </>
              )}
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">
              ✅ Taxa de Engajamento
            </h4>
            <p className="text-sm text-green-700">
              {unreadPercentage < 20 ? (
                'Excelente! Você está acompanhando bem suas notificações.'
              ) : unreadPercentage < 50 ? (
                'Bom engajamento. Considere revisar as notificações não lidas.'
              ) : (
                'Muitas notificações não lidas. Considere ajustar suas configurações.'
              )}
            </p>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">
              🎯 Categoria Principal
            </h4>
            <p className="text-sm text-yellow-700">
              {stats.byCategory.length > 0 && (
                <>
                  A categoria <strong>{formatCategory(stats.byCategory[0].category)}</strong> representa{' '}
                  {((stats.byCategory[0].count / stats.total) * 100).toFixed(1)}% das suas notificações.
                </>
              )}
            </p>
          </div>
          
          <div className="p-4 bg-red-50 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">
              🚨 Prioridades Altas
            </h4>
            <p className="text-sm text-red-700">
              {(() => {
                const highPriority = stats.byPriority.find(p => p.priority === 'high')?.count || 0;
                const urgent = stats.byPriority.find(p => p.priority === 'urgent')?.count || 0;
                const total = highPriority + urgent;
                
                if (total === 0) {
                  return 'Nenhuma notificação de alta prioridade pendente.';
                } else {
                  return `${total} notificações de alta prioridade requerem sua atenção.`;
                }
              })()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};