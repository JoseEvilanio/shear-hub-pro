// Otimização de Queries e Performance
// Sistema de Gestão de Oficina Mecânica de Motos

import { Pool, PoolClient } from 'pg';

interface QueryStats {
  query: string;
  executionTime: number;
  rowCount: number;
  timestamp: Date;
}

interface IndexSuggestion {
  table: string;
  columns: string[];
  reason: string;
  estimatedImprovement: string;
}

class QueryOptimizer {
  private queryStats: QueryStats[] = [];
  private slowQueryThreshold = 1000; // 1 segundo

  // Executar query com monitoramento de performance
  async executeOptimizedQuery<T = any>(
    pool: Pool,
    query: string,
    params: any[] = []
  ): Promise<{ rows: T[]; stats: QueryStats }> {
    const startTime = Date.now();
    
    try {
      const result = await pool.query(query, params);
      const executionTime = Date.now() - startTime;
      
      const stats: QueryStats = {
        query: this.sanitizeQuery(query),
        executionTime,
        rowCount: result.rowCount || 0,
        timestamp: new Date(),
      };

      // Armazenar estatísticas
      this.queryStats.push(stats);

      // Log queries lentas
      if (executionTime > this.slowQueryThreshold) {
        console.warn(`Slow query detected (${executionTime}ms):`, query);
      }

      return { rows: result.rows, stats };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(`Query failed after ${executionTime}ms:`, query, error);
      throw error;
    }
  }

  // Executar query com cache
  async executeWithCache<T = any>(
    pool: Pool,
    cacheKey: string,
    query: string,
    params: any[] = [],
    ttl: number = 300000 // 5 minutos
  ): Promise<T[]> {
    // Implementar cache aqui (Redis ou memória)
    // Por enquanto, executar diretamente
    const result = await this.executeOptimizedQuery<T>(pool, query, params);
    return result.rows;
  }

  // Analisar plano de execução
  async analyzeQuery(
    pool: Pool,
    query: string,
    params: any[] = []
  ): Promise<any> {
    const explainQuery = `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`;
    const result = await pool.query(explainQuery, params);
    return result.rows[0]['QUERY PLAN'];
  }

  // Obter queries mais lentas
  getSlowQueries(limit: number = 10): QueryStats[] {
    return this.queryStats
      .filter(stat => stat.executionTime > this.slowQueryThreshold)
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, limit);
  }

  // Obter estatísticas gerais
  getQueryStats() {
    const totalQueries = this.queryStats.length;
    const slowQueries = this.queryStats.filter(
      stat => stat.executionTime > this.slowQueryThreshold
    ).length;
    
    const avgExecutionTime = totalQueries > 0
      ? this.queryStats.reduce((sum, stat) => sum + stat.executionTime, 0) / totalQueries
      : 0;

    return {
      totalQueries,
      slowQueries,
      slowQueryPercentage: totalQueries > 0 ? (slowQueries / totalQueries) * 100 : 0,
      avgExecutionTime,
      slowQueryThreshold: this.slowQueryThreshold,
    };
  }

  // Sugerir índices baseado nas queries executadas
  suggestIndexes(): IndexSuggestion[] {
    const suggestions: IndexSuggestion[] = [];

    // Analisar queries para sugerir índices
    const queryPatterns = this.analyzeQueryPatterns();

    // Sugestões baseadas em padrões comuns
    queryPatterns.forEach(pattern => {
      if (pattern.type === 'WHERE_CLAUSE' && pattern.frequency > 5) {
        suggestions.push({
          table: pattern.table,
          columns: pattern.columns,
          reason: `Coluna(s) frequentemente usada(s) em WHERE (${pattern.frequency} vezes)`,
          estimatedImprovement: 'Alto',
        });
      }

      if (pattern.type === 'ORDER_BY' && pattern.frequency > 3) {
        suggestions.push({
          table: pattern.table,
          columns: pattern.columns,
          reason: `Coluna(s) frequentemente usada(s) em ORDER BY (${pattern.frequency} vezes)`,
          estimatedImprovement: 'Médio',
        });
      }

      if (pattern.type === 'JOIN' && pattern.frequency > 2) {
        suggestions.push({
          table: pattern.table,
          columns: pattern.columns,
          reason: `Coluna(s) frequentemente usada(s) em JOIN (${pattern.frequency} vezes)`,
          estimatedImprovement: 'Alto',
        });
      }
    });

    return suggestions;
  }

  // Analisar padrões de queries
  private analyzeQueryPatterns() {
    const patterns: any[] = [];
    
    // Implementar análise de padrões
    // Por enquanto, retornar padrões mockados
    return [
      {
        type: 'WHERE_CLAUSE',
        table: 'clients',
        columns: ['email'],
        frequency: 10,
      },
      {
        type: 'ORDER_BY',
        table: 'service_orders',
        columns: ['created_at'],
        frequency: 8,
      },
      {
        type: 'JOIN',
        table: 'service_orders',
        columns: ['client_id'],
        frequency: 6,
      },
    ];
  }

  // Limpar query para logging
  private sanitizeQuery(query: string): string {
    return query.replace(/\s+/g, ' ').trim().substring(0, 200);
  }

  // Limpar estatísticas antigas
  clearOldStats(olderThanHours: number = 24) {
    const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    this.queryStats = this.queryStats.filter(stat => stat.timestamp > cutoff);
  }
}

// Instância global do otimizador
export const queryOptimizer = new QueryOptimizer();

// Queries otimizadas comuns
export const optimizedQueries = {
  // Clientes
  clients: {
    findAll: (filters: any = {}) => {
      let query = `
        SELECT c.*, 
               COUNT(so.id) as service_orders_count,
               MAX(so.created_at) as last_service_date
        FROM clients c
        LEFT JOIN service_orders so ON c.id = so.client_id
      `;
      
      const conditions: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (filters.search) {
        conditions.push(`(c.name ILIKE $${paramIndex} OR c.email ILIKE $${paramIndex} OR c.phone ILIKE $${paramIndex})`);
        params.push(`%${filters.search}%`);
        paramIndex++;
      }

      if (filters.city) {
        conditions.push(`c.city = $${paramIndex}`);
        params.push(filters.city);
        paramIndex++;
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      query += `
        GROUP BY c.id
        ORDER BY c.name
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      
      params.push(filters.limit || 20, filters.offset || 0);

      return { query, params };
    },

    findById: (id: string) => ({
      query: `
        SELECT c.*,
               COUNT(so.id) as service_orders_count,
               SUM(so.total_amount) as total_spent,
               MAX(so.created_at) as last_service_date
        FROM clients c
        LEFT JOIN service_orders so ON c.id = so.client_id
        WHERE c.id = $1
        GROUP BY c.id
      `,
      params: [id],
    }),
  },

  // Ordens de Serviço
  serviceOrders: {
    findAll: (filters: any = {}) => {
      let query = `
        SELECT so.*,
               c.name as client_name,
               c.phone as client_phone,
               v.plate as vehicle_plate,
               v.model as vehicle_model,
               m.name as mechanic_name
        FROM service_orders so
        JOIN clients c ON so.client_id = c.id
        LEFT JOIN vehicles v ON so.vehicle_id = v.id
        LEFT JOIN mechanics m ON so.mechanic_id = m.id
      `;

      const conditions: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (filters.status) {
        conditions.push(`so.status = $${paramIndex}`);
        params.push(filters.status);
        paramIndex++;
      }

      if (filters.mechanic_id) {
        conditions.push(`so.mechanic_id = $${paramIndex}`);
        params.push(filters.mechanic_id);
        paramIndex++;
      }

      if (filters.client_id) {
        conditions.push(`so.client_id = $${paramIndex}`);
        params.push(filters.client_id);
        paramIndex++;
      }

      if (filters.date_from) {
        conditions.push(`so.created_at >= $${paramIndex}`);
        params.push(filters.date_from);
        paramIndex++;
      }

      if (filters.date_to) {
        conditions.push(`so.created_at <= $${paramIndex}`);
        params.push(filters.date_to);
        paramIndex++;
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      query += `
        ORDER BY so.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      params.push(filters.limit || 20, filters.offset || 0);

      return { query, params };
    },

    findWithDetails: (id: string) => ({
      query: `
        SELECT so.*,
               c.name as client_name,
               c.email as client_email,
               c.phone as client_phone,
               c.address as client_address,
               v.plate as vehicle_plate,
               v.model as vehicle_model,
               v.year as vehicle_year,
               v.color as vehicle_color,
               m.name as mechanic_name,
               m.specialties as mechanic_specialties,
               json_agg(
                 json_build_object(
                   'id', soi.id,
                   'product_id', soi.product_id,
                   'product_name', p.name,
                   'quantity', soi.quantity,
                   'unit_price', soi.unit_price,
                   'total_price', soi.total_price
                 )
               ) as items
        FROM service_orders so
        JOIN clients c ON so.client_id = c.id
        LEFT JOIN vehicles v ON so.vehicle_id = v.id
        LEFT JOIN mechanics m ON so.mechanic_id = m.id
        LEFT JOIN service_order_items soi ON so.id = soi.service_order_id
        LEFT JOIN products p ON soi.product_id = p.id
        WHERE so.id = $1
        GROUP BY so.id, c.id, v.id, m.id
      `,
      params: [id],
    }),
  },

  // Produtos e Estoque
  products: {
    findWithStock: (filters: any = {}) => {
      let query = `
        SELECT p.*,
               COALESCE(stock.current_quantity, 0) as current_stock,
               COALESCE(stock.reserved_quantity, 0) as reserved_stock,
               COALESCE(stock.available_quantity, 0) as available_stock,
               CASE 
                 WHEN COALESCE(stock.current_quantity, 0) <= p.min_stock THEN true
                 ELSE false
               END as low_stock
        FROM products p
        LEFT JOIN (
          SELECT product_id,
                 SUM(CASE WHEN movement_type = 'IN' THEN quantity ELSE -quantity END) as current_quantity,
                 SUM(CASE WHEN movement_type = 'RESERVED' THEN quantity ELSE 0 END) as reserved_quantity,
                 SUM(CASE WHEN movement_type = 'IN' THEN quantity ELSE -quantity END) - 
                 SUM(CASE WHEN movement_type = 'RESERVED' THEN quantity ELSE 0 END) as available_quantity
          FROM inventory_movements
          GROUP BY product_id
        ) stock ON p.id = stock.product_id
      `;

      const conditions: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (filters.search) {
        conditions.push(`(p.name ILIKE $${paramIndex} OR p.code ILIKE $${paramIndex} OR p.barcode ILIKE $${paramIndex})`);
        params.push(`%${filters.search}%`);
        paramIndex++;
      }

      if (filters.category) {
        conditions.push(`p.category = $${paramIndex}`);
        params.push(filters.category);
        paramIndex++;
      }

      if (filters.low_stock) {
        conditions.push(`COALESCE(stock.current_quantity, 0) <= p.min_stock`);
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      query += `
        ORDER BY p.name
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      params.push(filters.limit || 20, filters.offset || 0);

      return { query, params };
    },
  },

  // Relatórios
  reports: {
    salesByPeriod: (startDate: string, endDate: string) => ({
      query: `
        SELECT DATE(s.created_at) as sale_date,
               COUNT(s.id) as total_sales,
               SUM(s.total_amount) as total_revenue,
               AVG(s.total_amount) as avg_sale_value
        FROM sales s
        WHERE s.created_at >= $1 AND s.created_at <= $2
        GROUP BY DATE(s.created_at)
        ORDER BY sale_date
      `,
      params: [startDate, endDate],
    }),

    topProducts: (startDate: string, endDate: string, limit: number = 10) => ({
      query: `
        SELECT p.name,
               p.code,
               SUM(si.quantity) as total_sold,
               SUM(si.total_price) as total_revenue
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        JOIN sales s ON si.sale_id = s.id
        WHERE s.created_at >= $1 AND s.created_at <= $2
        GROUP BY p.id, p.name, p.code
        ORDER BY total_sold DESC
        LIMIT $3
      `,
      params: [startDate, endDate, limit],
    }),

    clientsWithMostServices: (limit: number = 10) => ({
      query: `
        SELECT c.name,
               c.email,
               c.phone,
               COUNT(so.id) as service_count,
               SUM(so.total_amount) as total_spent,
               MAX(so.created_at) as last_service
        FROM clients c
        JOIN service_orders so ON c.id = so.client_id
        GROUP BY c.id, c.name, c.email, c.phone
        ORDER BY service_count DESC
        LIMIT $1
      `,
      params: [limit],
    }),
  },
};

// Middleware para logging de queries
export const queryLogger = (pool: Pool) => {
  const originalQuery = pool.query.bind(pool);
  
  pool.query = async function(text: string, params?: any[]) {
    const start = Date.now();
    
    try {
      const result = await originalQuery(text, params);
      const duration = Date.now() - start;
      
      if (duration > 1000) {
        console.warn(`Slow query (${duration}ms):`, text.substring(0, 100));
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`Query failed (${duration}ms):`, text.substring(0, 100), error);
      throw error;
    }
  };
  
  return pool;
};

// Função para criar índices recomendados
export const createRecommendedIndexes = async (pool: Pool) => {
  const indexes = [
    // Clientes
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_email ON clients(email)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_phone ON clients(phone)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_name_gin ON clients USING gin(to_tsvector(\'portuguese\', name))',
    
    // Ordens de Serviço
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_orders_client_id ON service_orders(client_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_orders_mechanic_id ON service_orders(mechanic_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_orders_status ON service_orders(status)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_orders_created_at ON service_orders(created_at DESC)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_orders_status_created_at ON service_orders(status, created_at DESC)',
    
    // Produtos
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_code ON products(code)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_barcode ON products(barcode)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category ON products(category)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_name_gin ON products USING gin(to_tsvector(\'portuguese\', name))',
    
    // Estoque
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_movements_product_id ON inventory_movements(product_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_movements_created_at ON inventory_movements(created_at DESC)',
    
    // Vendas
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_client_id ON sales(client_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id)',
    
    // Veículos
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vehicles_client_id ON vehicles(client_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vehicles_plate ON vehicles(plate)',
  ];

  for (const indexQuery of indexes) {
    try {
      await pool.query(indexQuery);
      console.log(`Índice criado: ${indexQuery.split(' ')[5]}`);
    } catch (error) {
      console.warn(`Erro ao criar índice: ${indexQuery}`, error);
    }
  }
};