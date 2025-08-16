import { supabase, supabaseAdmin } from '../config/database';
import { SupabaseClient } from '@supabase/supabase-js';

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateData {
  [key: string]: any;
}

export interface UpdateData {
  [key: string]: any;
}

export interface QueryOptions {
  select?: string;
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export class BaseRepository<T extends BaseEntity> {
  protected tableName: string;
  protected client: SupabaseClient;

  constructor(tableName: string, useAdmin: boolean = false) {
    this.tableName = tableName;
    this.client = useAdmin ? supabaseAdmin : supabase;
  }

  /**
   * Buscar todos os registros
   */
  async findAll(options: QueryOptions = {}): Promise<T[]> {
    const {
      select = '*',
      limit,
      offset,
      orderBy = 'created_at',
      orderDirection = 'desc',
      filters = {}
    } = options;

    let query = this.client
      .from(this.tableName)
      .select(select)
      .order(orderBy, { ascending: orderDirection === 'asc' });

    // Aplicar filtros
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    if (limit) {
      query = query.limit(limit);
    }

    if (offset) {
      query = query.range(offset, offset + (limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar ${this.tableName}: ${error.message}`);
    }

    return data as unknown as T[];
  }

  /**
   * Buscar por ID
   */
  async findById(id: string, select: string = '*'): Promise<T | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select(select)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Registro não encontrado
      }
      throw new Error(`Erro ao buscar ${this.tableName} por ID: ${error.message}`);
    }

    return data as unknown as T;
  }

  /**
   * Buscar um registro por filtros
   */
  async findOne(filters: Record<string, any>, select: string = '*'): Promise<T | null> {
    let query = this.client
      .from(this.tableName)
      .select(select);

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Registro não encontrado
      }
      throw new Error(`Erro ao buscar ${this.tableName}: ${error.message}`);
    }

    return data as unknown as T;
  }

  /**
   * Criar novo registro
   */
  async create(data: CreateData): Promise<T> {
    const { data: result, error } = await this.client
      .from(this.tableName)
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar ${this.tableName}: ${error.message}`);
    }

    return result as unknown as T;
  }

  /**
   * Atualizar registro
   */
  async update(id: string, data: UpdateData): Promise<T> {
    const { data: result, error } = await this.client
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar ${this.tableName}: ${error.message}`);
    }

    return result as unknown as T;
  }

  /**
   * Deletar registro
   */
  async delete(id: string): Promise<boolean> {
    const { error } = await this.client
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar ${this.tableName}: ${error.message}`);
    }

    return true;
  }

  /**
   * Contar registros
   */
  async count(filters: Record<string, any> = {}): Promise<number> {
    let query = this.client
      .from(this.tableName)
      .select('*', { count: 'exact', head: true });

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    const { count, error } = await query;

    if (error) {
      throw new Error(`Erro ao contar ${this.tableName}: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Verificar se existe
   */
  async exists(filters: Record<string, any>): Promise<boolean> {
    const count = await this.count(filters);
    return count > 0;
  }

  /**
   * Buscar com paginação
   */
  async paginate(page: number = 1, pageSize: number = 10, options: QueryOptions = {}) {
    const offset = (page - 1) * pageSize;
    const total = await this.count(options.filters || {});
    const data = await this.findAll({
      ...options,
      limit: pageSize,
      offset
    });

    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page * pageSize < total,
        hasPrev: page > 1
      }
    };
  }
}