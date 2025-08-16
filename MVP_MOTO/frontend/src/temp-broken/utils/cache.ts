// Sistema de Cache
// Sistema de Gestão de Oficina Mecânica de Motos

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live em milissegundos
}

interface CacheOptions {
  ttl?: number; // Padrão: 5 minutos
  maxSize?: number; // Padrão: 100 itens
  persistent?: boolean; // Usar localStorage
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutos
  private maxSize = 100;
  private persistent = false;

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.ttl || this.defaultTTL;
    this.maxSize = options.maxSize || this.maxSize;
    this.persistent = options.persistent || false;

    // Carregar cache do localStorage se persistente
    if (this.persistent) {
      this.loadFromStorage();
    }

    // Limpeza automática a cada minuto
    setInterval(() => this.cleanup(), 60000);
  }

  // Definir item no cache
  set<T>(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };

    // Remover itens antigos se exceder o tamanho máximo
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, item);

    // Salvar no localStorage se persistente
    if (this.persistent) {
      this.saveToStorage();
    }
  }

  // Obter item do cache
  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Verificar se expirou
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      if (this.persistent) {
        this.saveToStorage();
      }
      return null;
    }

    return item.data as T;
  }

  // Verificar se existe no cache
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // Remover item do cache
  delete(key: string): boolean {
    const result = this.cache.delete(key);
    if (this.persistent && result) {
      this.saveToStorage();
    }
    return result;
  }

  // Limpar todo o cache
  clear(): void {
    this.cache.clear();
    if (this.persistent) {
      localStorage.removeItem('app-cache');
    }
  }

  // Obter ou definir (padrão para APIs)
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    this.set(key, data, ttl);
    return data;
  }

  // Invalidar cache por padrão
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));
  }

  // Limpeza de itens expirados
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));

    if (this.persistent && keysToDelete.length > 0) {
      this.saveToStorage();
    }
  }

  // Salvar no localStorage
  private saveToStorage(): void {
    try {
      const cacheData = Array.from(this.cache.entries());
      localStorage.setItem('app-cache', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Erro ao salvar cache no localStorage:', error);
    }
  }

  // Carregar do localStorage
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('app-cache');
      if (stored) {
        const cacheData = JSON.parse(stored);
        this.cache = new Map(cacheData);
        // Limpar itens expirados após carregar
        this.cleanup();
      }
    } catch (error) {
      console.warn('Erro ao carregar cache do localStorage:', error);
    }
  }

  // Estatísticas do cache
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Instâncias de cache especializadas
export const apiCache = new CacheManager({
  ttl: 5 * 60 * 1000, // 5 minutos
  maxSize: 200,
  persistent: true,
});

export const uiCache = new CacheManager({
  ttl: 30 * 60 * 1000, // 30 minutos
  maxSize: 50,
  persistent: false,
});

export const imageCache = new CacheManager({
  ttl: 60 * 60 * 1000, // 1 hora
  maxSize: 100,
  persistent: true,
});

// Utilitários de cache para APIs
export const cacheKeys = {
  // Clientes
  clients: (filters?: any) => `clients:${JSON.stringify(filters || {})}`,
  client: (id: string) => `client:${id}`,
  
  // Produtos
  products: (filters?: any) => `products:${JSON.stringify(filters || {})}`,
  product: (id: string) => `product:${id}`,
  
  // Estoque
  inventory: (filters?: any) => `inventory:${JSON.stringify(filters || {})}`,
  inventoryItem: (id: string) => `inventory:${id}`,
  
  // Ordens de Serviço
  serviceOrders: (filters?: any) => `service-orders:${JSON.stringify(filters || {})}`,
  serviceOrder: (id: string) => `service-order:${id}`,
  
  // Vendas
  sales: (filters?: any) => `sales:${JSON.stringify(filters || {})}`,
  sale: (id: string) => `sale:${id}`,
  
  // Financeiro
  financial: (type: string, filters?: any) => `financial:${type}:${JSON.stringify(filters || {})}`,
  
  // Relatórios
  reports: (type: string, filters?: any) => `reports:${type}:${JSON.stringify(filters || {})}`,
  
  // Configurações
  settings: (type?: string) => `settings${type ? `:${type}` : ''}`,
  
  // Notificações
  notifications: (filters?: any) => `notifications:${JSON.stringify(filters || {})}`,
  notificationStats: () => 'notification-stats',
};

// Hook para usar cache em componentes React
export const useCache = (cacheInstance: CacheManager = apiCache) => {
  const get = <T>(key: string): T | null => {
    return cacheInstance.get<T>(key);
  };

  const set = <T>(key: string, data: T, ttl?: number): void => {
    cacheInstance.set(key, data, ttl);
  };

  const getOrSet = async <T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> => {
    return cacheInstance.getOrSet(key, fetcher, ttl);
  };

  const invalidate = (key: string): boolean => {
    return cacheInstance.delete(key);
  };

  const invalidatePattern = (pattern: string): void => {
    cacheInstance.invalidatePattern(pattern);
  };

  const clear = (): void => {
    cacheInstance.clear();
  };

  return {
    get,
    set,
    getOrSet,
    invalidate,
    invalidatePattern,
    clear,
    stats: cacheInstance.getStats(),
  };
};

// Middleware para interceptar requisições e aplicar cache
export const withCache = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl?: number
): T => {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    return apiCache.getOrSet(key, () => fn(...args), ttl);
  }) as T;
};

// Decorador para métodos de classe
export const cached = (keyPrefix: string, ttl?: number) => {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const key = `${keyPrefix}:${JSON.stringify(args)}`;
      return apiCache.getOrSet(key, () => method.apply(this, args), ttl);
    };

    return descriptor;
  };
};