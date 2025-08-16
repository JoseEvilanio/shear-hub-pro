// Monitor de Performance Frontend
// Sistema de Gestão de Oficina Mecânica de Motos

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: 'timing' | 'counter' | 'gauge';
  tags?: Record<string, string>;
}

interface ComponentMetric {
  componentName: string;
  renderTime: number;
  renderCount: number;
  lastRender: number;
  props?: any;
}

interface APIMetric {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  timestamp: number;
  size?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private componentMetrics = new Map<string, ComponentMetric>();
  private apiMetrics: APIMetric[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
    this.startPeriodicCollection();
  }

  // Inicializar observadores de performance
  private initializeObservers() {
    if (typeof window === 'undefined') return;

    // Observer para navegação
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              this.recordNavigationMetrics(entry as PerformanceNavigationTiming);
            }
          }
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);
      } catch (error) {
        console.warn('Navigation observer not supported:', error);
      }

      // Observer para recursos
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource') {
              this.recordResourceMetrics(entry as PerformanceResourceTiming);
            }
          }
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (error) {
        console.warn('Resource observer not supported:', error);
      }

      // Observer para LCP (Largest Contentful Paint)
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name: 'lcp',
              value: entry.startTime,
              timestamp: Date.now(),
              type: 'timing',
              tags: { type: 'core_web_vital' },
            });
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (error) {
        console.warn('LCP observer not supported:', error);
      }

      // Observer para FID (First Input Delay)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name: 'fid',
              value: entry.processingStart - entry.startTime,
              timestamp: Date.now(),
              type: 'timing',
              tags: { type: 'core_web_vital' },
            });
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (error) {
        console.warn('FID observer not supported:', error);
      }
    }
  }

  // Coletar métricas periodicamente
  private startPeriodicCollection() {
    if (typeof window === 'undefined') return;

    setInterval(() => {
      this.collectMemoryMetrics();
      this.collectConnectionMetrics();
      this.cleanOldMetrics();
    }, 30000); // A cada 30 segundos
  }

  // Registrar métrica
  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Manter apenas as últimas 1000 métricas
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  // Registrar métrica de componente React
  recordComponentMetric(componentName: string, renderTime: number, props?: any) {
    const existing = this.componentMetrics.get(componentName);
    
    if (existing) {
      existing.renderTime = (existing.renderTime + renderTime) / 2; // Média
      existing.renderCount++;
      existing.lastRender = Date.now();
      existing.props = props;
    } else {
      this.componentMetrics.set(componentName, {
        componentName,
        renderTime,
        renderCount: 1,
        lastRender: Date.now(),
        props,
      });
    }

    // Alertar sobre componentes lentos
    if (renderTime > 16) { // Mais de 16ms (60fps)
      console.warn(`Slow component render: ${componentName} took ${renderTime}ms`);
    }
  }

  // Registrar métrica de API
  recordAPIMetric(metric: APIMetric) {
    this.apiMetrics.push(metric);
    
    // Manter apenas as últimas 500 chamadas
    if (this.apiMetrics.length > 500) {
      this.apiMetrics = this.apiMetrics.slice(-500);
    }

    // Alertar sobre APIs lentas
    if (metric.duration > 3000) { // Mais de 3 segundos
      console.warn(`Slow API call: ${metric.method} ${metric.endpoint} took ${metric.duration}ms`);
    }
  }

  // Coletar métricas de navegação
  private recordNavigationMetrics(entry: PerformanceNavigationTiming) {
    const metrics = [
      { name: 'dns_lookup', value: entry.domainLookupEnd - entry.domainLookupStart },
      { name: 'tcp_connect', value: entry.connectEnd - entry.connectStart },
      { name: 'request_response', value: entry.responseEnd - entry.requestStart },
      { name: 'dom_processing', value: entry.domComplete - entry.domLoading },
      { name: 'load_complete', value: entry.loadEventEnd - entry.loadEventStart },
      { name: 'ttfb', value: entry.responseStart - entry.requestStart }, // Time to First Byte
    ];

    metrics.forEach(metric => {
      if (metric.value > 0) {
        this.recordMetric({
          name: metric.name,
          value: metric.value,
          timestamp: Date.now(),
          type: 'timing',
          tags: { type: 'navigation' },
        });
      }
    });
  }

  // Coletar métricas de recursos
  private recordResourceMetrics(entry: PerformanceResourceTiming) {
    const resourceType = this.getResourceType(entry.name);
    
    this.recordMetric({
      name: 'resource_load_time',
      value: entry.responseEnd - entry.startTime,
      timestamp: Date.now(),
      type: 'timing',
      tags: {
        type: 'resource',
        resource_type: resourceType,
        url: entry.name,
      },
    });

    // Alertar sobre recursos lentos
    const loadTime = entry.responseEnd - entry.startTime;
    if (loadTime > 2000) {
      console.warn(`Slow resource load: ${entry.name} took ${loadTime}ms`);
    }
  }

  // Coletar métricas de memória
  private collectMemoryMetrics() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      
      this.recordMetric({
        name: 'memory_used',
        value: memory.usedJSHeapSize,
        timestamp: Date.now(),
        type: 'gauge',
        tags: { type: 'memory' },
      });

      this.recordMetric({
        name: 'memory_total',
        value: memory.totalJSHeapSize,
        timestamp: Date.now(),
        type: 'gauge',
        tags: { type: 'memory' },
      });

      this.recordMetric({
        name: 'memory_limit',
        value: memory.jsHeapSizeLimit,
        timestamp: Date.now(),
        type: 'gauge',
        tags: { type: 'memory' },
      });
    }
  }

  // Coletar métricas de conexão
  private collectConnectionMetrics() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      this.recordMetric({
        name: 'connection_downlink',
        value: connection.downlink,
        timestamp: Date.now(),
        type: 'gauge',
        tags: { 
          type: 'connection',
          effective_type: connection.effectiveType,
        },
      });

      this.recordMetric({
        name: 'connection_rtt',
        value: connection.rtt,
        timestamp: Date.now(),
        type: 'gauge',
        tags: { type: 'connection' },
      });
    }
  }

  // Determinar tipo de recurso
  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  // Limpar métricas antigas
  private cleanOldMetrics() {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    
    this.metrics = this.metrics.filter(metric => metric.timestamp > oneHourAgo);
    this.apiMetrics = this.apiMetrics.filter(metric => metric.timestamp > oneHourAgo);
  }

  // Obter estatísticas de performance
  getPerformanceStats() {
    const now = Date.now();
    const lastHour = now - 60 * 60 * 1000;
    
    const recentMetrics = this.metrics.filter(m => m.timestamp > lastHour);
    const recentAPIMetrics = this.apiMetrics.filter(m => m.timestamp > lastHour);

    // Estatísticas de componentes
    const slowComponents = Array.from(this.componentMetrics.values())
      .filter(c => c.renderTime > 16)
      .sort((a, b) => b.renderTime - a.renderTime)
      .slice(0, 10);

    // Estatísticas de APIs
    const slowAPIs = recentAPIMetrics
      .filter(api => api.duration > 1000)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    // Core Web Vitals
    const lcpMetrics = recentMetrics.filter(m => m.name === 'lcp');
    const fidMetrics = recentMetrics.filter(m => m.name === 'fid');

    const avgLCP = lcpMetrics.length > 0 
      ? lcpMetrics.reduce((sum, m) => sum + m.value, 0) / lcpMetrics.length 
      : 0;

    const avgFID = fidMetrics.length > 0 
      ? fidMetrics.reduce((sum, m) => sum + m.value, 0) / fidMetrics.length 
      : 0;

    return {
      coreWebVitals: {
        lcp: avgLCP,
        fid: avgFID,
        cls: 0, // Implementar CLS se necessário
      },
      components: {
        total: this.componentMetrics.size,
        slow: slowComponents,
        avgRenderTime: Array.from(this.componentMetrics.values())
          .reduce((sum, c) => sum + c.renderTime, 0) / this.componentMetrics.size,
      },
      apis: {
        total: recentAPIMetrics.length,
        slow: slowAPIs,
        avgDuration: recentAPIMetrics.length > 0
          ? recentAPIMetrics.reduce((sum, api) => sum + api.duration, 0) / recentAPIMetrics.length
          : 0,
      },
      memory: this.getLatestMemoryStats(),
      connection: this.getLatestConnectionStats(),
    };
  }

  // Obter estatísticas de memória mais recentes
  private getLatestMemoryStats() {
    const memoryMetrics = this.metrics
      .filter(m => m.tags?.type === 'memory')
      .sort((a, b) => b.timestamp - a.timestamp);

    const used = memoryMetrics.find(m => m.name === 'memory_used')?.value || 0;
    const total = memoryMetrics.find(m => m.name === 'memory_total')?.value || 0;
    const limit = memoryMetrics.find(m => m.name === 'memory_limit')?.value || 0;

    return { used, total, limit };
  }

  // Obter estatísticas de conexão mais recentes
  private getLatestConnectionStats() {
    const connectionMetrics = this.metrics
      .filter(m => m.tags?.type === 'connection')
      .sort((a, b) => b.timestamp - a.timestamp);

    const downlink = connectionMetrics.find(m => m.name === 'connection_downlink')?.value || 0;
    const rtt = connectionMetrics.find(m => m.name === 'connection_rtt')?.value || 0;

    return { downlink, rtt };
  }

  // Exportar métricas para análise externa
  exportMetrics() {
    return {
      metrics: this.metrics,
      componentMetrics: Array.from(this.componentMetrics.entries()),
      apiMetrics: this.apiMetrics,
      stats: this.getPerformanceStats(),
    };
  }

  // Limpar todos os dados
  clear() {
    this.metrics = [];
    this.componentMetrics.clear();
    this.apiMetrics = [];
  }

  // Destruir observadores
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Instância global do monitor
export const performanceMonitor = new PerformanceMonitor();

// HOC para monitorar performance de componentes React
export const withPerformanceMonitoring = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) => {
  return React.memo((props: P) => {
    const name = componentName || WrappedComponent.displayName || WrappedComponent.name;
    const startTime = performance.now();

    React.useEffect(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      performanceMonitor.recordComponentMetric(name, renderTime, props);
    });

    return <WrappedComponent {...props} />;
  });
};

// Hook para monitorar performance de hooks customizados
export const usePerformanceMonitoring = (hookName: string) => {
  const startTime = React.useRef(performance.now());

  React.useEffect(() => {
    const endTime = performance.now();
    const executionTime = endTime - startTime.current;
    
    performanceMonitor.recordMetric({
      name: 'hook_execution_time',
      value: executionTime,
      timestamp: Date.now(),
      type: 'timing',
      tags: { type: 'hook', hook_name: hookName },
    });
  });

  const recordCustomMetric = (name: string, value: number, tags?: Record<string, string>) => {
    performanceMonitor.recordMetric({
      name,
      value,
      timestamp: Date.now(),
      type: 'timing',
      tags: { ...tags, hook: hookName },
    });
  };

  return { recordCustomMetric };
};

// Interceptor para monitorar chamadas de API
export const createAPIInterceptor = () => {
  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const startTime = performance.now();
    const url = typeof input === 'string' ? input : input.toString();
    const method = init?.method || 'GET';

    try {
      const response = await originalFetch(input, init);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Estimar tamanho da resposta
      const contentLength = response.headers.get('content-length');
      const size = contentLength ? parseInt(contentLength, 10) : 0;

      performanceMonitor.recordAPIMetric({
        endpoint: url,
        method,
        duration,
        status: response.status,
        timestamp: Date.now(),
        size,
      });

      return response;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      performanceMonitor.recordAPIMetric({
        endpoint: url,
        method,
        duration,
        status: 0, // Erro de rede
        timestamp: Date.now(),
      });

      throw error;
    }
  };
};

// Inicializar interceptor automaticamente
if (typeof window !== 'undefined') {
  createAPIInterceptor();
}

// Utilitários para formatação
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms.toFixed(1)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};