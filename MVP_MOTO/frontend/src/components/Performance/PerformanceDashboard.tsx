// Dashboard de Performance
// Sistema de Gestão de Oficina Mecânica de Motos

import React, { useState, useEffect } from 'react';
import { performanceMonitor, formatBytes, formatDuration } from '@/utils/performanceMonitor';
import { apiCache, uiCache, imageCache } from '@/utils/cache';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  Activity,
  Zap,
  Database,
  Image,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Wifi,
  HardDrive,
  Cpu,
  RefreshCw,
} from 'lucide-react';

interface PerformanceStats {
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
  };
  components: {
    total: number;
    slow: any[];
    avgRenderTime: number;
  };
  apis: {
    total: number;
    slow: any[];
    avgDuration: number;
  };
  memory: {
    used: number;
    total: number;
    limit: number;
  };
  connection: {
    downlink: number;
    rtt: number;
  };
}

export const PerformanceDashboard: React.FC = () => {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Carregar estatísticas
  const loadStats = async () => {
    try {
      setLoading(true);
      const performanceStats = performanceMonitor.getPerformanceStats();
      setStats(performanceStats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh
  useEffect(() => {
    loadStats();

    if (autoRefresh) {
      const interval = setInterval(loadStats, 10000); // A cada 10 segundos
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Obter cor baseada no valor
  const getScoreColor = (value: number, thresholds: { good: number; needs_improvement: number }) => {
    if (value <= thresholds.good) return 'text-green-600 bg-green-50';
    if (value <= thresholds.needs_improvement) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  // Obter ícone baseado no valor
  const getScoreIcon = (value: number, thresholds: { good: number; needs_improvement: number }) => {
    if (value <= thresholds.good) return CheckCircle;
    if (value <= thresholds.needs_improvement) return AlertTriangle;
    return AlertTriangle;
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Não foi possível carregar as estatísticas de performance</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard de Performance</h2>
          <p className="text-gray-600">Monitoramento em tempo real do sistema</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Auto-refresh</span>
          </label>
          
          <button
            onClick={loadStats}
            disabled={loading}
            className="flex items-center px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Core Web Vitals */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-primary-600" />
          Core Web Vitals
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LCP */}
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-2 rounded-lg ${getScoreColor(stats.coreWebVitals.lcp, { good: 2500, needs_improvement: 4000 })}`}>
              {React.createElement(getScoreIcon(stats.coreWebVitals.lcp, { good: 2500, needs_improvement: 4000 }), { className: 'w-5 h-5 mr-2' })}
              <span className="font-medium">{formatDuration(stats.coreWebVitals.lcp)}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">Largest Contentful Paint</p>
            <p className="text-xs text-gray-500">Boa: ≤2.5s | Precisa melhorar: ≤4.0s</p>
          </div>

          {/* FID */}
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-2 rounded-lg ${getScoreColor(stats.coreWebVitals.fid, { good: 100, needs_improvement: 300 })}`}>
              {React.createElement(getScoreIcon(stats.coreWebVitals.fid, { good: 100, needs_improvement: 300 }), { className: 'w-5 h-5 mr-2' })}
              <span className="font-medium">{formatDuration(stats.coreWebVitals.fid)}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">First Input Delay</p>
            <p className="text-xs text-gray-500">Boa: ≤100ms | Precisa melhorar: ≤300ms</p>
          </div>

          {/* CLS */}
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-2 rounded-lg ${getScoreColor(stats.coreWebVitals.cls, { good: 0.1, needs_improvement: 0.25 })}`}>
              {React.createElement(getScoreIcon(stats.coreWebVitals.cls, { good: 0.1, needs_improvement: 0.25 }), { className: 'w-5 h-5 mr-2' })}
              <span className="font-medium">{stats.coreWebVitals.cls.toFixed(3)}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">Cumulative Layout Shift</p>
            <p className="text-xs text-gray-500">Boa: ≤0.1 | Precisa melhorar: ≤0.25</p>
          </div>
        </div>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Componentes */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Componentes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.components.total}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">
              Tempo médio: {formatDuration(stats.components.avgRenderTime)}
            </p>
            <p className="text-xs text-gray-500">
              Lentos: {stats.components.slow.length}
            </p>
          </div>
        </div>

        {/* APIs */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chamadas API</p>
              <p className="text-2xl font-bold text-gray-900">{stats.apis.total}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Database className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">
              Tempo médio: {formatDuration(stats.apis.avgDuration)}
            </p>
            <p className="text-xs text-gray-500">
              Lentas: {stats.apis.slow.length}
            </p>
          </div>
        </div>

        {/* Memória */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Memória</p>
              <p className="text-2xl font-bold text-gray-900">
                {((stats.memory.used / stats.memory.total) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <HardDrive className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">
              Usado: {formatBytes(stats.memory.used)}
            </p>
            <p className="text-xs text-gray-500">
              Total: {formatBytes(stats.memory.total)}
            </p>
          </div>
        </div>

        {/* Conexão */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conexão</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.connection.downlink.toFixed(1)} Mbps
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Wifi className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">
              RTT: {stats.connection.rtt}ms
            </p>
          </div>
        </div>
      </div>

      {/* Cache Statistics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Database className="w-5 h-5 mr-2 text-primary-600" />
          Estatísticas de Cache
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <Database className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-900">{apiCache.getStats().size}</p>
              <p className="text-sm text-blue-700">Cache API</p>
              <p className="text-xs text-blue-600 mt-1">
                Máx: {apiCache.getStats().maxSize}
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="p-4 bg-green-50 rounded-lg">
              <Cpu className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-900">{uiCache.getStats().size}</p>
              <p className="text-sm text-green-700">Cache UI</p>
              <p className="text-xs text-green-600 mt-1">
                Máx: {uiCache.getStats().maxSize}
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="p-4 bg-purple-50 rounded-lg">
              <Image className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-900">{imageCache.getStats().size}</p>
              <p className="text-sm text-purple-700">Cache Imagens</p>
              <p className="text-xs text-purple-600 mt-1">
                Máx: {imageCache.getStats().maxSize}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Componentes Lentos */}
      {stats.components.slow.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <TrendingDown className="w-5 h-5 mr-2 text-red-600" />
            Componentes com Performance Baixa
          </h3>
          
          <div className="space-y-3">
            {stats.components.slow.slice(0, 5).map((component, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-red-900">{component.componentName}</p>
                  <p className="text-sm text-red-700">
                    Renderizações: {component.renderCount}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-900">
                    {formatDuration(component.renderTime)}
                  </p>
                  <p className="text-xs text-red-600">Tempo médio</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* APIs Lentas */}
      {stats.apis.slow.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-yellow-600" />
            APIs com Performance Baixa
          </h3>
          
          <div className="space-y-3">
            {stats.apis.slow.slice(0, 5).map((api, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-yellow-900">
                    {api.method} {api.endpoint}
                  </p>
                  <p className="text-sm text-yellow-700">
                    Status: {api.status}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-yellow-900">
                    {formatDuration(api.duration)}
                  </p>
                  <p className="text-xs text-yellow-600">
                    {api.size ? formatBytes(api.size) : 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ações de Otimização */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
          Ações de Otimização
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => {
              apiCache.clear();
              uiCache.clear();
              imageCache.clear();
              loadStats();
            }}
            className="flex items-center justify-center px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Database className="w-5 h-5 mr-2" />
            Limpar Cache
          </button>

          <button
            onClick={() => {
              performanceMonitor.clear();
              loadStats();
            }}
            className="flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Activity className="w-5 h-5 mr-2" />
            Limpar Métricas
          </button>

          <button
            onClick={() => {
              const data = performanceMonitor.exportMetrics();
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `performance-metrics-${new Date().toISOString()}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center justify-center px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Exportar Métricas
          </button>

          <button
            onClick={() => {
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(registrations => {
                  registrations.forEach(registration => registration.unregister());
                });
              }
              window.location.reload();
            }}
            className="flex items-center justify-center px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Recarregar App
          </button>
        </div>
      </div>
    </div>
  );
};