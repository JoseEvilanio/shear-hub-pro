// Serviço de Autenticação
// Sistema de Gestão de Oficina Mecânica de Motos

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { query } = require('../../database/connection');

class AuthService {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'sua_chave_secreta_muito_segura_aqui';
        this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
        this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
        
        if (this.jwtSecret === 'sua_chave_secreta_muito_segura_aqui') {
            console.warn('⚠️  AVISO: Usando JWT_SECRET padrão. Configure uma chave segura em produção!');
        }
    }

    // Gerar token JWT
    generateAccessToken(user) {
        const payload = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            permissions: user.getPermissions()
        };

        return jwt.sign(payload, this.jwtSecret, {
            expiresIn: this.jwtExpiresIn,
            issuer: 'oficina-motos',
            audience: 'oficina-motos-app'
        });
    }

    // Gerar refresh token
    generateRefreshToken() {
        return crypto.randomBytes(64).toString('hex');
    }

    // Verificar token JWT
    verifyAccessToken(token) {
        try {
            return jwt.verify(token, this.jwtSecret, {
                issuer: 'oficina-motos',
                audience: 'oficina-motos-app'
            });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token expirado');
            } else if (error.name === 'JsonWebTokenError') {
                throw new Error('Token inválido');
            } else {
                throw new Error('Erro ao verificar token');
            }
        }
    }

    // Fazer login
    async login(email, password, ipAddress = null, userAgent = null) {
        try {
            // Buscar usuário por email
            const user = await User.findByEmail(email);
            if (!user) {
                throw new Error('Credenciais inválidas');
            }

            // Verificar se usuário está ativo
            if (!user.active) {
                throw new Error('Usuário desativado');
            }

            // Verificar senha
            const isPasswordValid = await user.verifyPassword(password);
            if (!isPasswordValid) {
                // Log da tentativa de login inválida
                await this.logLoginAttempt(email, false, ipAddress, userAgent);
                throw new Error('Credenciais inválidas');
            }

            // Gerar tokens
            const accessToken = this.generateAccessToken(user);
            const refreshToken = this.generateRefreshToken();

            // Salvar refresh token no banco
            await this.saveRefreshToken(user.id, refreshToken, ipAddress, userAgent);

            // Atualizar último login
            await user.updateLastLogin();

            // Log da tentativa de login válida
            await this.logLoginAttempt(email, true, ipAddress, userAgent);

            return {
                user: user.toJSON(),
                accessToken,
                refreshToken,
                expiresIn: this.jwtExpiresIn
            };

        } catch (error) {
            throw error;
        }
    }

    // Renovar token usando refresh token
    async refreshToken(refreshToken, ipAddress = null, userAgent = null) {
        try {
            // Buscar refresh token no banco
            const tokenData = await query(`
                SELECT rt.*, u.* 
                FROM refresh_tokens rt
                JOIN users u ON rt.user_id = u.id
                WHERE rt.token = $1 AND rt.expires_at > NOW() AND rt.revoked = false
            `, [refreshToken]);

            if (tokenData.rows.length === 0) {
                throw new Error('Refresh token inválido ou expirado');
            }

            const userData = tokenData.rows[0];
            const user = new User(userData);

            // Verificar se usuário ainda está ativo
            if (!user.active) {
                throw new Error('Usuário desativado');
            }

            // Revogar o refresh token atual
            await this.revokeRefreshToken(refreshToken);

            // Gerar novos tokens
            const newAccessToken = this.generateAccessToken(user);
            const newRefreshToken = this.generateRefreshToken();

            // Salvar novo refresh token
            await this.saveRefreshToken(user.id, newRefreshToken, ipAddress, userAgent);

            return {
                user: user.toJSON(),
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                expiresIn: this.jwtExpiresIn
            };

        } catch (error) {
            throw error;
        }
    }

    // Fazer logout
    async logout(refreshToken) {
        try {
            if (refreshToken) {
                await this.revokeRefreshToken(refreshToken);
            }
            return { message: 'Logout realizado com sucesso' };
        } catch (error) {
            // Mesmo se houver erro, consideramos logout bem-sucedido
            return { message: 'Logout realizado com sucesso' };
        }
    }

    // Logout de todos os dispositivos
    async logoutAll(userId) {
        try {
            await query(
                'UPDATE refresh_tokens SET revoked = true WHERE user_id = $1',
                [userId]
            );
            return { message: 'Logout de todos os dispositivos realizado com sucesso' };
        } catch (error) {
            throw new Error('Erro ao fazer logout de todos os dispositivos');
        }
    }

    // Salvar refresh token no banco
    async saveRefreshToken(userId, token, ipAddress = null, userAgent = null) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

        await query(`
            INSERT INTO refresh_tokens (user_id, token, expires_at, ip_address, user_agent)
            VALUES ($1, $2, $3, $4, $5)
        `, [userId, token, expiresAt, ipAddress, userAgent]);

        // Limpar tokens expirados do usuário
        await this.cleanupExpiredTokens(userId);
    }

    // Revogar refresh token
    async revokeRefreshToken(token) {
        await query(
            'UPDATE refresh_tokens SET revoked = true WHERE token = $1',
            [token]
        );
    }

    // Limpar tokens expirados
    async cleanupExpiredTokens(userId = null) {
        let queryText = 'DELETE FROM refresh_tokens WHERE expires_at < NOW() OR revoked = true';
        const params = [];

        if (userId) {
            queryText += ' AND user_id = $1';
            params.push(userId);
        }

        await query(queryText, params);
    }

    // Log de tentativas de login
    async logLoginAttempt(email, success, ipAddress = null, userAgent = null) {
        try {
            await query(`
                INSERT INTO login_attempts (email, success, ip_address, user_agent, attempted_at)
                VALUES ($1, $2, $3, $4, NOW())
            `, [email, success, ipAddress, userAgent]);
        } catch (error) {
            // Não falhar se não conseguir logar a tentativa
            console.error('Erro ao logar tentativa de login:', error.message);
        }
    }

    // Verificar tentativas de login suspeitas
    async checkSuspiciousActivity(email, ipAddress = null) {
        const timeWindow = 15; // minutos
        const maxAttempts = 5;

        let queryText = `
            SELECT COUNT(*) as attempts
            FROM login_attempts 
            WHERE email = $1 
            AND success = false 
            AND attempted_at > NOW() - INTERVAL '${timeWindow} minutes'
        `;
        const params = [email];

        if (ipAddress) {
            queryText += ' AND ip_address = $2';
            params.push(ipAddress);
        }

        const result = await query(queryText, params);
        const attempts = parseInt(result.rows[0].attempts);

        if (attempts >= maxAttempts) {
            throw new Error(`Muitas tentativas de login falharam. Tente novamente em ${timeWindow} minutos.`);
        }

        return attempts;
    }

    // Validar força da senha
    validatePasswordStrength(password) {
        const errors = [];

        if (!password || password.length < 8) {
            errors.push('Senha deve ter pelo menos 8 caracteres');
        }

        if (!/[a-z]/.test(password)) {
            errors.push('Senha deve conter pelo menos uma letra minúscula');
        }

        if (!/[A-Z]/.test(password)) {
            errors.push('Senha deve conter pelo menos uma letra maiúscula');
        }

        if (!/\d/.test(password)) {
            errors.push('Senha deve conter pelo menos um número');
        }

        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push('Senha deve conter pelo menos um caractere especial');
        }

        return errors;
    }

    // Alterar senha
    async changePassword(userId, currentPassword, newPassword) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('Usuário não encontrado');
            }

            // Validar força da nova senha
            const passwordErrors = this.validatePasswordStrength(newPassword);
            if (passwordErrors.length > 0) {
                throw new Error(`Senha fraca: ${passwordErrors.join(', ')}`);
            }

            // Alterar senha
            await user.changePassword(currentPassword, newPassword);

            // Revogar todos os refresh tokens (forçar novo login)
            await this.logoutAll(userId);

            return { message: 'Senha alterada com sucesso' };

        } catch (error) {
            throw error;
        }
    }

    // Reset de senha (para admin)
    async resetPassword(userId, newPassword, adminUserId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('Usuário não encontrado');
            }

            const admin = await User.findById(adminUserId);
            if (!admin || admin.role !== 'admin') {
                throw new Error('Apenas administradores podem resetar senhas');
            }

            // Validar força da nova senha
            const passwordErrors = this.validatePasswordStrength(newPassword);
            if (passwordErrors.length > 0) {
                throw new Error(`Senha fraca: ${passwordErrors.join(', ')}`);
            }

            // Hash da nova senha
            await user.hashPassword(newPassword);
            await query(
                'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
                [user.password_hash, userId]
            );

            // Revogar todos os refresh tokens do usuário
            await this.logoutAll(userId);

            return { message: 'Senha resetada com sucesso' };

        } catch (error) {
            throw error;
        }
    }

    // Obter sessões ativas do usuário
    async getActiveSessions(userId) {
        const result = await query(`
            SELECT token, ip_address, user_agent, created_at, expires_at
            FROM refresh_tokens 
            WHERE user_id = $1 AND expires_at > NOW() AND revoked = false
            ORDER BY created_at DESC
        `, [userId]);

        return result.rows.map(row => ({
            token: row.token.substring(0, 8) + '...', // Mostrar apenas parte do token
            ipAddress: row.ip_address,
            userAgent: row.user_agent,
            createdAt: row.created_at,
            expiresAt: row.expires_at
        }));
    }

    // Revogar sessão específica
    async revokeSession(userId, tokenPrefix) {
        const result = await query(`
            UPDATE refresh_tokens 
            SET revoked = true 
            WHERE user_id = $1 AND token LIKE $2 AND revoked = false
            RETURNING token
        `, [userId, tokenPrefix + '%']);

        if (result.rows.length === 0) {
            throw new Error('Sessão não encontrada');
        }

        return { message: 'Sessão revogada com sucesso' };
    }
}

module.exports = new AuthService();