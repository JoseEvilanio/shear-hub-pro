// Testes do Serviço de Autenticação
// Sistema de Gestão de Oficina Mecânica de Motos

const AuthService = require('../services/AuthService');
const User = require('../models/User');
const { query } = require('../../database/connection');

// Mocks
jest.mock('../models/User');
jest.mock('../../database/connection');
jest.mock('jsonwebtoken');
jest.mock('crypto');

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Mock do JWT
        jwt.sign.mockReturnValue('mock-jwt-token');
        jwt.verify.mockReturnValue({
            id: 'user-id-123',
            email: 'test@example.com',
            role: 'operator'
        });

        // Mock do crypto
        crypto.randomBytes.mockReturnValue({
            toString: () => 'mock-refresh-token'
        });
    });

    describe('Login', () => {
        test('deve fazer login com credenciais válidas', async () => {
            const mockUser = {
                id: 'user-id-123',
                email: 'test@example.com',
                name: 'Test User',
                role: 'operator',
                active: true,
                verifyPassword: jest.fn().mockResolvedValue(true),
                updateLastLogin: jest.fn().mockResolvedValue(),
                getPermissions: jest.fn().mockReturnValue(['clients:read']),
                toJSON: jest.fn().mockReturnValue({
                    id: 'user-id-123',
                    email: 'test@example.com',
                    name: 'Test User',
                    role: 'operator'
                })
            };

            User.findByEmail.mockResolvedValue(mockUser);
            query.mockResolvedValue({ rows: [] }); // saveRefreshToken
            query.mockResolvedValue({ rows: [] }); // logLoginAttempt

            const result = await AuthService.login('test@example.com', 'password123');

            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(result.accessToken).toBe('mock-jwt-token');
            expect(mockUser.verifyPassword).toHaveBeenCalledWith('password123');
            expect(mockUser.updateLastLogin).toHaveBeenCalled();
        });

        test('deve rejeitar credenciais inválidas', async () => {
            User.findByEmail.mockResolvedValue(null);

            await expect(AuthService.login('test@example.com', 'wrongpassword'))
                .rejects.toThrow('Credenciais inválidas');
        });

        test('deve rejeitar usuário desativado', async () => {
            const mockUser = {
                active: false
            };

            User.findByEmail.mockResolvedValue(mockUser);

            await expect(AuthService.login('test@example.com', 'password123'))
                .rejects.toThrow('Usuário desativado');
        });

        test('deve rejeitar senha incorreta', async () => {
            const mockUser = {
                active: true,
                verifyPassword: jest.fn().mockResolvedValue(false)
            };

            User.findByEmail.mockResolvedValue(mockUser);
            query.mockResolvedValue({ rows: [] }); // logLoginAttempt

            await expect(AuthService.login('test@example.com', 'wrongpassword'))
                .rejects.toThrow('Credenciais inválidas');

            expect(mockUser.verifyPassword).toHaveBeenCalledWith('wrongpassword');
        });
    });

    describe('Refresh Token', () => {
        test('deve renovar token com refresh token válido', async () => {
            const mockTokenData = {
                rows: [{
                    id: 'user-id-123',
                    email: 'test@example.com',
                    name: 'Test User',
                    role: 'operator',
                    active: true
                }]
            };

            const mockUser = {
                id: 'user-id-123',
                active: true,
                getPermissions: jest.fn().mockReturnValue(['clients:read']),
                toJSON: jest.fn().mockReturnValue({
                    id: 'user-id-123',
                    email: 'test@example.com'
                })
            };

            query.mockResolvedValueOnce(mockTokenData); // buscar refresh token
            query.mockResolvedValueOnce({ rows: [] }); // revogar token antigo
            query.mockResolvedValueOnce({ rows: [] }); // salvar novo token
            User.mockImplementation(() => mockUser);

            const result = await AuthService.refreshToken('valid-refresh-token');

            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(result.accessToken).toBe('mock-jwt-token');
        });

        test('deve rejeitar refresh token inválido', async () => {
            query.mockResolvedValueOnce({ rows: [] }); // token não encontrado

            await expect(AuthService.refreshToken('invalid-refresh-token'))
                .rejects.toThrow('Refresh token inválido ou expirado');
        });
    });

    describe('Verificação de Token', () => {
        test('deve verificar token válido', () => {
            const mockDecoded = {
                id: 'user-id-123',
                email: 'test@example.com',
                role: 'operator'
            };

            jwt.verify.mockReturnValue(mockDecoded);

            const result = AuthService.verifyAccessToken('valid-token');

            expect(result).toEqual(mockDecoded);
            expect(jwt.verify).toHaveBeenCalledWith(
                'valid-token',
                expect.any(String),
                expect.objectContaining({
                    issuer: 'oficina-motos',
                    audience: 'oficina-motos-app'
                })
            );
        });

        test('deve rejeitar token expirado', () => {
            const error = new Error('Token expired');
            error.name = 'TokenExpiredError';
            jwt.verify.mockImplementation(() => {
                throw error;
            });

            expect(() => AuthService.verifyAccessToken('expired-token'))
                .toThrow('Token expirado');
        });

        test('deve rejeitar token inválido', () => {
            const error = new Error('Invalid token');
            error.name = 'JsonWebTokenError';
            jwt.verify.mockImplementation(() => {
                throw error;
            });

            expect(() => AuthService.verifyAccessToken('invalid-token'))
                .toThrow('Token inválido');
        });
    });

    describe('Validação de Senha', () => {
        test('deve aceitar senha forte', () => {
            const errors = AuthService.validatePasswordStrength('StrongP@ssw0rd');
            expect(errors).toHaveLength(0);
        });

        test('deve rejeitar senha muito curta', () => {
            const errors = AuthService.validatePasswordStrength('123');
            expect(errors).toContain('Senha deve ter pelo menos 8 caracteres');
        });

        test('deve rejeitar senha sem minúscula', () => {
            const errors = AuthService.validatePasswordStrength('PASSWORD123!');
            expect(errors).toContain('Senha deve conter pelo menos uma letra minúscula');
        });

        test('deve rejeitar senha sem maiúscula', () => {
            const errors = AuthService.validatePasswordStrength('password123!');
            expect(errors).toContain('Senha deve conter pelo menos uma letra maiúscula');
        });

        test('deve rejeitar senha sem número', () => {
            const errors = AuthService.validatePasswordStrength('Password!');
            expect(errors).toContain('Senha deve conter pelo menos um número');
        });

        test('deve rejeitar senha sem caractere especial', () => {
            const errors = AuthService.validatePasswordStrength('Password123');
            expect(errors).toContain('Senha deve conter pelo menos um caractere especial');
        });
    });

    describe('Logout', () => {
        test('deve fazer logout com sucesso', async () => {
            query.mockResolvedValue({ rows: [] }); // revokeRefreshToken

            const result = await AuthService.logout('refresh-token');

            expect(result).toEqual({ message: 'Logout realizado com sucesso' });
        });

        test('deve fazer logout mesmo sem refresh token', async () => {
            const result = await AuthService.logout();

            expect(result).toEqual({ message: 'Logout realizado com sucesso' });
        });
    });

    describe('Logout All', () => {
        test('deve revogar todas as sessões do usuário', async () => {
            query.mockResolvedValue({ rows: [] });

            const result = await AuthService.logoutAll('user-id-123');

            expect(result).toEqual({ message: 'Logout de todos os dispositivos realizado com sucesso' });
            expect(query).toHaveBeenCalledWith(
                'UPDATE refresh_tokens SET revoked = true WHERE user_id = $1',
                ['user-id-123']
            );
        });
    });

    describe('Alteração de Senha', () => {
        test('deve alterar senha com dados válidos', async () => {
            const mockUser = {
                changePassword: jest.fn().mockResolvedValue()
            };

            User.findById.mockResolvedValue(mockUser);
            query.mockResolvedValue({ rows: [] }); // logoutAll

            const result = await AuthService.changePassword('user-id-123', 'oldPassword', 'NewP@ssw0rd123');

            expect(result).toEqual({ message: 'Senha alterada com sucesso' });
            expect(mockUser.changePassword).toHaveBeenCalledWith('oldPassword', 'NewP@ssw0rd123');
        });

        test('deve rejeitar senha fraca', async () => {
            const mockUser = {};
            User.findById.mockResolvedValue(mockUser);

            await expect(AuthService.changePassword('user-id-123', 'oldPassword', 'weak'))
                .rejects.toThrow('Senha fraca');
        });
    });

    describe('Sessões Ativas', () => {
        test('deve retornar sessões ativas do usuário', async () => {
            const mockSessions = {
                rows: [
                    {
                        token: 'abcdef1234567890abcdef1234567890',
                        ip_address: '192.168.1.1',
                        user_agent: 'Mozilla/5.0',
                        created_at: new Date(),
                        expires_at: new Date()
                    }
                ]
            };

            query.mockResolvedValue(mockSessions);

            const sessions = await AuthService.getActiveSessions('user-id-123');

            expect(sessions).toHaveLength(1);
            expect(sessions[0].token).toBe('abcdef12...');
            expect(sessions[0].ipAddress).toBe('192.168.1.1');
        });
    });

    describe('Limpeza de Tokens', () => {
        test('deve limpar tokens expirados', async () => {
            query.mockResolvedValue({ rows: [] });

            await AuthService.cleanupExpiredTokens();

            expect(query).toHaveBeenCalledWith(
                'DELETE FROM refresh_tokens WHERE expires_at < NOW() OR revoked = true',
                []
            );
        });

        test('deve limpar tokens de usuário específico', async () => {
            query.mockResolvedValue({ rows: [] });

            await AuthService.cleanupExpiredTokens('user-id-123');

            expect(query).toHaveBeenCalledWith(
                'DELETE FROM refresh_tokens WHERE expires_at < NOW() OR revoked = true AND user_id = $1',
                ['user-id-123']
            );
        });
    });
});