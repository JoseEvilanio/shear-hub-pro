// Controller de Usuários
// Sistema de Gestão de Oficina Mecânica de Motos

const User = require('../models/User');
const AuthService = require('../services/AuthService');

class UserController {
    // Listar usuários
    async index(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                role,
                active,
                search
            } = req.query;

            const offset = (page - 1) * limit;
            
            const filters = {
                limit: parseInt(limit),
                offset: parseInt(offset)
            };

            if (role) filters.role = role;
            if (active !== undefined) filters.active = active === 'true';
            if (search) filters.search = search;

            const [users, total] = await Promise.all([
                User.findAll(filters),
                User.count(filters)
            ]);

            const totalPages = Math.ceil(total / limit);

            res.json({
                message: 'Usuários listados com sucesso',
                data: {
                    users: users.map(user => user.toJSON()),
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        totalPages,
                        hasNext: page < totalPages,
                        hasPrev: page > 1
                    }
                }
            });

        } catch (error) {
            res.status(500).json({
                error: error.message,
                code: 'USERS_FETCH_FAILED'
            });
        }
    }

    // Obter usuário por ID
    async show(req, res) {
        try {
            const { id } = req.params;
            
            const user = await User.findById(id);
            
            if (!user) {
                return res.status(404).json({
                    error: 'Usuário não encontrado',
                    code: 'USER_NOT_FOUND'
                });
            }

            res.json({
                message: 'Usuário obtido com sucesso',
                data: {
                    user: user.toJSON(),
                    permissions: user.getPermissions()
                }
            });

        } catch (error) {
            res.status(500).json({
                error: error.message,
                code: 'USER_FETCH_FAILED'
            });
        }
    }

    // Criar usuário
    async create(req, res) {
        try {
            const { email, password, name, role = 'operator', active = true } = req.body;

            // Validar dados obrigatórios
            if (!email || !password || !name) {
                return res.status(400).json({
                    error: 'Email, senha e nome são obrigatórios',
                    code: 'MISSING_REQUIRED_FIELDS'
                });
            }

            // Validar força da senha
            const passwordErrors = AuthService.validatePasswordStrength(password);
            if (passwordErrors.length > 0) {
                return res.status(400).json({
                    error: `Senha fraca: ${passwordErrors.join(', ')}`,
                    code: 'WEAK_PASSWORD'
                });
            }

            // Criar usuário
            const user = new User({ email, name, role, active });
            await user.create(password);

            res.status(201).json({
                message: 'Usuário criado com sucesso',
                data: {
                    user: user.toJSON()
                }
            });

        } catch (error) {
            res.status(400).json({
                error: error.message,
                code: 'USER_CREATE_FAILED'
            });
        }
    }

    // Atualizar usuário
    async update(req, res) {
        try {
            const { id } = req.params;
            const { email, name, role, active } = req.body;

            const user = await User.findById(id);
            
            if (!user) {
                return res.status(404).json({
                    error: 'Usuário não encontrado',
                    code: 'USER_NOT_FOUND'
                });
            }

            // Verificar se não está tentando alterar o próprio role (exceto admin)
            if (req.user.id === id && role && req.user.role !== 'admin') {
                return res.status(403).json({
                    error: 'Você não pode alterar seu próprio nível de acesso',
                    code: 'CANNOT_CHANGE_OWN_ROLE'
                });
            }

            // Atualizar dados
            await user.update({ email, name, role, active });

            res.json({
                message: 'Usuário atualizado com sucesso',
                data: {
                    user: user.toJSON()
                }
            });

        } catch (error) {
            res.status(400).json({
                error: error.message,
                code: 'USER_UPDATE_FAILED'
            });
        }
    }

    // Desativar usuário
    async deactivate(req, res) {
        try {
            const { id } = req.params;

            // Não permitir desativar a si mesmo
            if (req.user.id === id) {
                return res.status(403).json({
                    error: 'Você não pode desativar sua própria conta',
                    code: 'CANNOT_DEACTIVATE_SELF'
                });
            }

            const user = await User.findById(id);
            
            if (!user) {
                return res.status(404).json({
                    error: 'Usuário não encontrado',
                    code: 'USER_NOT_FOUND'
                });
            }

            await user.deactivate();

            // Revogar todas as sessões do usuário
            await AuthService.logoutAll(id);

            res.json({
                message: 'Usuário desativado com sucesso',
                data: {
                    user: user.toJSON()
                }
            });

        } catch (error) {
            res.status(500).json({
                error: error.message,
                code: 'USER_DEACTIVATE_FAILED'
            });
        }
    }

    // Ativar usuário
    async activate(req, res) {
        try {
            const { id } = req.params;

            const user = await User.findById(id);
            
            if (!user) {
                return res.status(404).json({
                    error: 'Usuário não encontrado',
                    code: 'USER_NOT_FOUND'
                });
            }

            await user.activate();

            res.json({
                message: 'Usuário ativado com sucesso',
                data: {
                    user: user.toJSON()
                }
            });

        } catch (error) {
            res.status(500).json({
                error: error.message,
                code: 'USER_ACTIVATE_FAILED'
            });
        }
    }

    // Resetar senha (apenas admin)
    async resetPassword(req, res) {
        try {
            const { id } = req.params;
            const { newPassword } = req.body;

            if (!newPassword) {
                return res.status(400).json({
                    error: 'Nova senha é obrigatória',
                    code: 'MISSING_NEW_PASSWORD'
                });
            }

            const result = await AuthService.resetPassword(id, newPassword, req.user.id);

            res.json(result);

        } catch (error) {
            res.status(400).json({
                error: error.message,
                code: 'PASSWORD_RESET_FAILED'
            });
        }
    }

    // Obter estatísticas de usuários
    async getStats(req, res) {
        try {
            const [
                totalUsers,
                activeUsers,
                adminUsers,
                managerUsers,
                operatorUsers,
                mechanicUsers
            ] = await Promise.all([
                User.count(),
                User.count({ active: true }),
                User.count({ role: 'admin' }),
                User.count({ role: 'manager' }),
                User.count({ role: 'operator' }),
                User.count({ role: 'mechanic' })
            ]);

            res.json({
                message: 'Estatísticas obtidas com sucesso',
                data: {
                    total: totalUsers,
                    active: activeUsers,
                    inactive: totalUsers - activeUsers,
                    byRole: {
                        admin: adminUsers,
                        manager: managerUsers,
                        operator: operatorUsers,
                        mechanic: mechanicUsers
                    }
                }
            });

        } catch (error) {
            res.status(500).json({
                error: error.message,
                code: 'STATS_FETCH_FAILED'
            });
        }
    }

    // Obter roles disponíveis
    async getRoles(req, res) {
        try {
            const roles = [
                {
                    value: 'admin',
                    label: 'Administrador',
                    description: 'Acesso total ao sistema'
                },
                {
                    value: 'manager',
                    label: 'Gerente',
                    description: 'Acesso a gestão e relatórios'
                },
                {
                    value: 'operator',
                    label: 'Operador',
                    description: 'Acesso a operações básicas'
                },
                {
                    value: 'mechanic',
                    label: 'Mecânico',
                    description: 'Acesso a ordens de serviço'
                }
            ];

            res.json({
                message: 'Roles obtidas com sucesso',
                data: { roles }
            });

        } catch (error) {
            res.status(500).json({
                error: error.message,
                code: 'ROLES_FETCH_FAILED'
            });
        }
    }
}

module.exports = new UserController();