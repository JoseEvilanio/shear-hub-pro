// Controller de Autenticação
// Sistema de Gestão de Oficina Mecânica de Motos

const AuthService = require('../services/AuthService');
const User = require('../models/User');

class AuthController {
    // Login
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const { ipAddress, userAgent } = req.clientInfo;

            // Validar dados obrigatórios
            if (!email || !password) {
                return res.status(400).json({
                    error: 'Email e senha são obrigatórios',
                    code: 'MISSING_CREDENTIALS'
                });
            }

            // Fazer login
            const result = await AuthService.login(email, password, ipAddress, userAgent);

            res.json({
                message: 'Login realizado com sucesso',
                data: result
            });

        } catch (error) {
            let statusCode = 401;
            let errorCode = 'LOGIN_FAILED';

            if (error.message.includes('Muitas tentativas')) {
                statusCode = 429;
                errorCode = 'TOO_MANY_ATTEMPTS';
            }

            res.status(statusCode).json({
                error: error.message,
                code: errorCode
            });
        }
    }

    // Renovar token
    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            const { ipAddress, userAgent } = req.clientInfo;

            if (!refreshToken) {
                return res.status(400).json({
                    error: 'Refresh token é obrigatório',
                    code: 'MISSING_REFRESH_TOKEN'
                });
            }

            const result = await AuthService.refreshToken(refreshToken, ipAddress, userAgent);

            res.json({
                message: 'Token renovado com sucesso',
                data: result
            });

        } catch (error) {
            res.status(401).json({
                error: error.message,
                code: 'REFRESH_FAILED'
            });
        }
    }

    // Logout
    async logout(req, res) {
        try {
            const { refreshToken } = req.body;

            const result = await AuthService.logout(refreshToken);

            res.json(result);

        } catch (error) {
            res.status(500).json({
                error: error.message,
                code: 'LOGOUT_FAILED'
            });
        }
    }

    // Logout de todos os dispositivos
    async logoutAll(req, res) {
        try {
            const userId = req.user.id;

            const result = await AuthService.logoutAll(userId);

            res.json(result);

        } catch (error) {
            res.status(500).json({
                error: error.message,
                code: 'LOGOUT_ALL_FAILED'
            });
        }
    }

    // Obter perfil do usuário atual
    async getProfile(req, res) {
        try {
            const user = await User.findById(req.user.id);
            
            if (!user) {
                return res.status(404).json({
                    error: 'Usuário não encontrado',
                    code: 'USER_NOT_FOUND'
                });
            }

            res.json({
                message: 'Perfil obtido com sucesso',
                data: {
                    user: user.toJSON(),
                    permissions: user.getPermissions()
                }
            });

        } catch (error) {
            res.status(500).json({
                error: error.message,
                code: 'PROFILE_FETCH_FAILED'
            });
        }
    }

    // Atualizar perfil do usuário atual
    async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const { name, email } = req.body;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    error: 'Usuário não encontrado',
                    code: 'USER_NOT_FOUND'
                });
            }

            // Atualizar dados (sem role - apenas admin pode alterar)
            await user.update({ name, email });

            res.json({
                message: 'Perfil atualizado com sucesso',
                data: {
                    user: user.toJSON()
                }
            });

        } catch (error) {
            res.status(400).json({
                error: error.message,
                code: 'PROFILE_UPDATE_FAILED'
            });
        }
    }

    // Alterar senha
    async changePassword(req, res) {
        try {
            const userId = req.user.id;
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    error: 'Senha atual e nova senha são obrigatórias',
                    code: 'MISSING_PASSWORDS'
                });
            }

            const result = await AuthService.changePassword(userId, currentPassword, newPassword);

            res.json(result);

        } catch (error) {
            res.status(400).json({
                error: error.message,
                code: 'PASSWORD_CHANGE_FAILED'
            });
        }
    }

    // Obter sessões ativas
    async getActiveSessions(req, res) {
        try {
            const userId = req.user.id;
            const sessions = await AuthService.getActiveSessions(userId);

            res.json({
                message: 'Sessões ativas obtidas com sucesso',
                data: {
                    sessions,
                    total: sessions.length
                }
            });

        } catch (error) {
            res.status(500).json({
                error: error.message,
                code: 'SESSIONS_FETCH_FAILED'
            });
        }
    }

    // Revogar sessão específica
    async revokeSession(req, res) {
        try {
            const userId = req.user.id;
            const { tokenPrefix } = req.params;

            if (!tokenPrefix) {
                return res.status(400).json({
                    error: 'Prefixo do token é obrigatório',
                    code: 'MISSING_TOKEN_PREFIX'
                });
            }

            const result = await AuthService.revokeSession(userId, tokenPrefix);

            res.json(result);

        } catch (error) {
            res.status(400).json({
                error: error.message,
                code: 'SESSION_REVOKE_FAILED'
            });
        }
    }

    // Verificar token (endpoint para validação)
    async verifyToken(req, res) {
        try {
            // Se chegou até aqui, o token é válido (middleware authenticate)
            res.json({
                message: 'Token válido',
                data: {
                    user: req.user,
                    valid: true
                }
            });

        } catch (error) {
            res.status(401).json({
                error: error.message,
                code: 'TOKEN_INVALID'
            });
        }
    }

    // Obter permissões do usuário
    async getPermissions(req, res) {
        try {
            const user = await User.findById(req.user.id);
            
            if (!user) {
                return res.status(404).json({
                    error: 'Usuário não encontrado',
                    code: 'USER_NOT_FOUND'
                });
            }

            res.json({
                message: 'Permissões obtidas com sucesso',
                data: {
                    role: user.role,
                    permissions: user.getPermissions()
                }
            });

        } catch (error) {
            res.status(500).json({
                error: error.message,
                code: 'PERMISSIONS_FETCH_FAILED'
            });
        }
    }
}

module.exports = new AuthController();