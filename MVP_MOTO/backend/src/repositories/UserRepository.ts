import { BaseRepository, BaseEntity } from './BaseRepository';

export interface User extends BaseEntity {
  email: string;
  password_hash: string;
  name: string;
  role: 'admin' | 'manager' | 'operator' | 'mechanic';
  active: boolean;
}

export interface CreateUserData {
  email: string;
  password_hash: string;
  name: string;
  role?: 'admin' | 'manager' | 'operator' | 'mechanic';
  active?: boolean;
}

export interface UpdateUserData {
  email?: string;
  password_hash?: string;
  name?: string;
  role?: 'admin' | 'manager' | 'operator' | 'mechanic';
  active?: boolean;
}

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users', true); // Usar admin client para operações de usuário
  }

  /**
   * Buscar usuário por email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email });
  }

  /**
   * Buscar usuários ativos
   */
  async findActive(): Promise<User[]> {
    return this.findAll({
      filters: { active: true },
      orderBy: 'name',
      orderDirection: 'asc'
    });
  }

  /**
   * Buscar usuários por role
   */
  async findByRole(role: string): Promise<User[]> {
    return this.findAll({
      filters: { role, active: true },
      orderBy: 'name',
      orderDirection: 'asc'
    });
  }

  /**
   * Verificar se email já existe
   */
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const filters: Record<string, any> = { email };
    
    if (excludeId) {
      // Para verificação durante update, excluir o próprio registro
      const { data, error } = await this.client
        .from(this.tableName)
        .select('id')
        .eq('email', email)
        .neq('id', excludeId);
      
      if (error) {
        throw new Error(`Erro ao verificar email: ${error.message}`);
      }
      
      return data.length > 0;
    }
    
    return this.exists(filters);
  }

  /**
   * Ativar/desativar usuário
   */
  async toggleActive(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return this.update(id, { active: !user.active });
  }

  /**
   * Atualizar senha
   */
  async updatePassword(id: string, passwordHash: string): Promise<User> {
    return this.update(id, { password_hash: passwordHash });
  }

  /**
   * Buscar usuários com paginação e filtros
   */
  async findWithFilters(
    page: number = 1,
    pageSize: number = 10,
    filters: {
      search?: string;
      role?: string;
      active?: boolean;
    } = {}
  ) {
    const { search, role, active } = filters;
    
    // Para busca por texto, precisamos usar uma query mais complexa
    if (search) {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .or(`name.ilike.%${search}%,email.ilike.%${search}%`)
        .eq(role ? 'role' : 'id', role || 'id')
        .eq(active !== undefined ? 'active' : 'id', active !== undefined ? active : 'id')
        .order('name', { ascending: true })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) {
        throw new Error(`Erro ao buscar usuários: ${error.message}`);
      }

      // Contar total para paginação
      const { count } = await this.client
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .or(`name.ilike.%${search}%,email.ilike.%${search}%`)
        .eq(role ? 'role' : 'id', role || 'id')
        .eq(active !== undefined ? 'active' : 'id', active !== undefined ? active : 'id');

      return {
        data: data as User[],
        pagination: {
          page,
          pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize),
          hasNext: page * pageSize < (count || 0),
          hasPrev: page > 1
        }
      };
    }

    // Usar método base para filtros simples
    const queryFilters: Record<string, any> = {};
    if (role) queryFilters['role'] = role;
    if (active !== undefined) queryFilters['active'] = active;

    return this.paginate(page, pageSize, {
      filters: queryFilters,
      orderBy: 'name',
      orderDirection: 'asc'
    });
  }
}