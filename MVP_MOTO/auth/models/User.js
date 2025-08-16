// Modelo User - Sistema de Autenticação
// Sistema de Gestão de Oficina Mecânica de Motos

const bcrypt = require('bcrypt');
const { query } = require('../../database/connection');

class User {
    constructor(data = {}) {
        this.id = data.id;
        this.email = data.email;
        this.password_hash = data.password_hash;
        this.name = data.name;
        this.role = data.role || 'operator';
        this.active = data.active !== undefined ? data.active : true;
        this.last_login = data.last_login;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    // Validar dados do usuário
    validate() {
        const errors = [];

        if (!this.email || !this.email.trim()) {
            errors.push('Email é obrigatório');
        } else if (!this.isValidEmail(this.email)) {
            errors.push('Email deve ter um formato válido');
        }

        if (!this.name || !this.name.trim()) {
            errors.push('Nome é obrigatório');
        } else if (this.name.trim().length < 2) {
            errors.push('Nome deve ter pelo menos 2 caracteres');
        }

        if (!['admin', 'manager', 'operator', 'mechanic'].includes(this.role)) {
            errors.push('Role deve ser: admin, manager, operator ou mechanic');
        }

        return errors;
    }

    // Validar formato de email
    isValidEmail(email) {
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        return emailRegex.test(email);
    }

    // Hash da senha
    async hashPassword(password) {
        if (!password || password.length < 6) {
            throw new Error('Senha deve ter pelo menos 6 caracteres');
        }

        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        this.password_hash = await bcrypt.hash(password, saltRounds);
    }

    // Verificar senha
    async verifyPassword(password) {
        if (!this.password_hash) {
            return false;
        }
        return await bcrypt.compare(password, this.password_hash);
    }

    // Criar usuário
    async create(password) {
        const errors = this.validate();
        if (errors.length > 0) {
            throw new Error(`Dados inválidos: ${errors.join(', ')}`);
        }

        // Verificar se email já existe
        const existingUser = await User.findByEmail(this.email);
        if (existingUser) {
            throw new Error('Email já está em uso');
        }

        // Hash da senha
        await this.hashPassword(password);

        const result = await query(`
            INSERT INTO users (email, password_hash, name, role, active)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [this.email, this.password_hash, this.name, this.role, this.active]);

        const userData = result.rows[0];
        Object.assign(this, userData);
        
        return this;
    }

    // Atualizar usuário
    async update(data = {}) {
        // Atualizar propriedades
        if (data.email !== undefined) this.email = data.email;
        if (data.name !== undefined) this.name = data.name;
        if (data.role !== undefined) this.role = data.role;
        if (data.active !== undefined) this.active = data.active;

        const errors = this.validate();
        if (errors.length > 0) {
            throw new Error(`Dados inválidos: ${errors.join(', ')}`);
        }

        // Verificar se email já existe (exceto o próprio usuário)
        if (data.email) {
            const existingUser = await query(
                'SELECT id FROM users WHERE email = $1 AND id != $2',
                [this.email, this.id]
            );
            if (existingUser.rows.length > 0) {
                throw new Error('Email já está em uso');
            }
        }

        const result = await query(`
            UPDATE users 
            SET email = $1, name = $2, role = $3, active = $4, updated_at = NOW()
            WHERE id = $5
            RETURNING *
        `, [this.email, this.name, this.role, this.active, this.id]);

        if (result.rows.length === 0) {
            throw new Error('Usuário não encontrado');
        }

        Object.assign(this, result.rows[0]);
        return this;
    }

    // Alterar senha
    async changePassword(currentPassword, newPassword) {
        // Verificar senha atual
        const isCurrentPasswordValid = await this.verifyPassword(currentPassword);
        if (!isCurrentPasswordValid) {
            throw new Error('Senha atual incorreta');
        }

        // Hash da nova senha
        await this.hashPassword(newPassword);

        await query(
            'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
            [this.password_hash, this.id]
        );

        return true;
    }

    // Atualizar último login
    async updateLastLogin() {
        this.last_login = new Date();
        await query(
            'UPDATE users SET last_login = NOW() WHERE id = $1',
            [this.id]
        );
    }

    // Desativar usuário
    async deactivate() {
        this.active = false;
        await query(
            'UPDATE users SET active = false, updated_at = NOW() WHERE id = $1',
            [this.id]
        );
    }

    // Ativar usuário
    async activate() {
        this.active = true;
        await query(
            'UPDATE users SET active = true, updated_at = NOW() WHERE id = $1',
            [this.id]
        );
    }

    // Converter para JSON (sem senha)
    toJSON() {
        const { password_hash, ...userWithoutPassword } = this;
        return userWithoutPassword;
    }

    // Métodos estáticos

    // Buscar usuário por ID
    static async findById(id) {
        const result = await query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows.length > 0 ? new User(result.rows[0]) : null;
    }

    // Buscar usuário por email
    static async findByEmail(email) {
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows.length > 0 ? new User(result.rows[0]) : null;
    }

    // Listar usuários com filtros
    static async findAll(filters = {}) {
        let queryText = 'SELECT * FROM users WHERE 1=1';
        const params = [];
        let paramCount = 0;

        if (filters.role) {
            paramCount++;
            queryText += ` AND role = $${paramCount}`;
            params.push(filters.role);
        }

        if (filters.active !== undefined) {
            paramCount++;
            queryText += ` AND active = $${paramCount}`;
            params.push(filters.active);
        }

        if (filters.search) {
            paramCount++;
            queryText += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
            params.push(`%${filters.search}%`);
        }

        queryText += ' ORDER BY name ASC';

        if (filters.limit) {
            paramCount++;
            queryText += ` LIMIT $${paramCount}`;
            params.push(filters.limit);
        }

        if (filters.offset) {
            paramCount++;
            queryText += ` OFFSET $${paramCount}`;
            params.push(filters.offset);
        }

        const result = await query(queryText, params);
        return result.rows.map(row => new User(row));
    }

    // Contar usuários
    static async count(filters = {}) {
        let queryText = 'SELECT COUNT(*) as count FROM users WHERE 1=1';
        const params = [];
        let paramCount = 0;

        if (filters.role) {
            paramCount++;
            queryText += ` AND role = $${paramCount}`;
            params.push(filters.role);
        }

        if (filters.active !== undefined) {
            paramCount++;
            queryText += ` AND active = $${paramCount}`;
            params.push(filters.active);
        }

        if (filters.search) {
            paramCount++;
            queryText += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
            params.push(`%${filters.search}%`);
        }

        const result = await query(queryText, params);
        return parseInt(result.rows[0].count);
    }

    // Verificar se usuário tem permissão
    static hasPermission(userRole, requiredRole) {
        const roleHierarchy = {
            'admin': 4,
            'manager': 3,
            'operator': 2,
            'mechanic': 1
        };

        return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
    }

    // Obter permissões do usuário
    getPermissions() {
        const permissions = {
            admin: [
                'users:create', 'users:read', 'users:update', 'users:delete',
                'clients:create', 'clients:read', 'clients:update', 'clients:delete',
                'suppliers:create', 'suppliers:read', 'suppliers:update', 'suppliers:delete',
                'mechanics:create', 'mechanics:read', 'mechanics:update', 'mechanics:delete',
                'vehicles:create', 'vehicles:read', 'vehicles:update', 'vehicles:delete',
                'products:create', 'products:read', 'products:update', 'products:delete',
                'service_orders:create', 'service_orders:read', 'service_orders:update', 'service_orders:delete',
                'sales:create', 'sales:read', 'sales:update', 'sales:delete',
                'inventory:create', 'inventory:read', 'inventory:update', 'inventory:delete',
                'financial:create', 'financial:read', 'financial:update', 'financial:delete',
                'reports:read', 'config:read', 'config:update'
            ],
            manager: [
                'clients:create', 'clients:read', 'clients:update', 'clients:delete',
                'suppliers:create', 'suppliers:read', 'suppliers:update', 'suppliers:delete',
                'mechanics:read', 'mechanics:update',
                'vehicles:create', 'vehicles:read', 'vehicles:update', 'vehicles:delete',
                'products:create', 'products:read', 'products:update', 'products:delete',
                'service_orders:create', 'service_orders:read', 'service_orders:update', 'service_orders:delete',
                'sales:create', 'sales:read', 'sales:update', 'sales:delete',
                'inventory:create', 'inventory:read', 'inventory:update',
                'financial:create', 'financial:read', 'financial:update',
                'reports:read'
            ],
            operator: [
                'clients:create', 'clients:read', 'clients:update',
                'vehicles:create', 'vehicles:read', 'vehicles:update',
                'products:read',
                'service_orders:create', 'service_orders:read', 'service_orders:update',
                'sales:create', 'sales:read', 'sales:update',
                'inventory:read'
            ],
            mechanic: [
                'clients:read',
                'vehicles:read',
                'products:read',
                'service_orders:read', 'service_orders:update'
            ]
        };

        return permissions[this.role] || [];
    }

    // Verificar se usuário tem permissão específica
    hasPermission(permission) {
        return this.getPermissions().includes(permission);
    }
}

module.exports = User;