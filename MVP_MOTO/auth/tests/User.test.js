// Testes do Modelo User
// Sistema de Gestão de Oficina Mecânica de Motos

const User = require('../models/User');
const { query } = require('../../database/connection');

// Mock do banco de dados
jest.mock('../../database/connection');

describe('User Model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Validação', () => {
        test('deve validar dados corretos', () => {
            const user = new User({
                email: 'test@example.com',
                name: 'Test User',
                role: 'operator'
            });

            const errors = user.validate();
            expect(errors).toHaveLength(0);
        });

        test('deve retornar erro para email inválido', () => {
            const user = new User({
                email: 'invalid-email',
                name: 'Test User',
                role: 'operator'
            });

            const errors = user.validate();
            expect(errors).toContain('Email deve ter um formato válido');
        });

        test('deve retornar erro para nome vazio', () => {
            const user = new User({
                email: 'test@example.com',
                name: '',
                role: 'operator'
            });

            const errors = user.validate();
            expect(errors).toContain('Nome é obrigatório');
        });

        test('deve retornar erro para role inválida', () => {
            const user = new User({
                email: 'test@example.com',
                name: 'Test User',
                role: 'invalid-role'
            });

            const errors = user.validate();
            expect(errors).toContain('Role deve ser: admin, manager, operator ou mechanic');
        });
    });

    describe('Hash de Senha', () => {
        test('deve fazer hash da senha corretamente', async () => {
            const user = new User({
                email: 'test@example.com',
                name: 'Test User'
            });

            await user.hashPassword('password123');
            
            expect(user.password_hash).toBeDefined();
            expect(user.password_hash).not.toBe('password123');
            expect(user.password_hash.length).toBeGreaterThan(50);
        });

        test('deve rejeitar senha muito curta', async () => {
            const user = new User({
                email: 'test@example.com',
                name: 'Test User'
            });

            await expect(user.hashPassword('123')).rejects.toThrow('Senha deve ter pelo menos 6 caracteres');
        });
    });

    describe('Verificação de Senha', () => {
        test('deve verificar senha correta', async () => {
            const user = new User({
                email: 'test@example.com',
                name: 'Test User'
            });

            await user.hashPassword('password123');
            const isValid = await user.verifyPassword('password123');
            
            expect(isValid).toBe(true);
        });

        test('deve rejeitar senha incorreta', async () => {
            const user = new User({
                email: 'test@example.com',
                name: 'Test User'
            });

            await user.hashPassword('password123');
            const isValid = await user.verifyPassword('wrongpassword');
            
            expect(isValid).toBe(false);
        });
    });

    describe('Criação de Usuário', () => {
        test('deve criar usuário com dados válidos', async () => {
            const mockResult = {
                rows: [{
                    id: 'user-id-123',
                    email: 'test@example.com',
                    name: 'Test User',
                    role: 'operator',
                    active: true,
                    created_at: new Date(),
                    updated_at: new Date()
                }]
            };

            query.mockResolvedValueOnce({ rows: [] }); // findByEmail retorna vazio
            query.mockResolvedValueOnce(mockResult); // INSERT retorna usuário criado

            const user = new User({
                email: 'test@example.com',
                name: 'Test User',
                role: 'operator'
            });

            const createdUser = await user.create('password123');

            expect(createdUser.id).toBe('user-id-123');
            expect(createdUser.email).toBe('test@example.com');
            expect(query).toHaveBeenCalledTimes(2);
        });

        test('deve rejeitar email duplicado', async () => {
            const existingUser = {
                rows: [{
                    id: 'existing-user-id',
                    email: 'test@example.com'
                }]
            };

            query.mockResolvedValueOnce(existingUser); // findByEmail retorna usuário existente

            const user = new User({
                email: 'test@example.com',
                name: 'Test User',
                role: 'operator'
            });

            await expect(user.create('password123')).rejects.toThrow('Email já está em uso');
        });
    });

    describe('Busca de Usuários', () => {
        test('deve encontrar usuário por ID', async () => {
            const mockResult = {
                rows: [{
                    id: 'user-id-123',
                    email: 'test@example.com',
                    name: 'Test User',
                    role: 'operator'
                }]
            };

            query.mockResolvedValueOnce(mockResult);

            const user = await User.findById('user-id-123');

            expect(user).toBeInstanceOf(User);
            expect(user.id).toBe('user-id-123');
            expect(user.email).toBe('test@example.com');
        });

        test('deve retornar null para usuário não encontrado', async () => {
            query.mockResolvedValueOnce({ rows: [] });

            const user = await User.findById('non-existent-id');

            expect(user).toBeNull();
        });

        test('deve encontrar usuário por email', async () => {
            const mockResult = {
                rows: [{
                    id: 'user-id-123',
                    email: 'test@example.com',
                    name: 'Test User',
                    role: 'operator'
                }]
            };

            query.mockResolvedValueOnce(mockResult);

            const user = await User.findByEmail('test@example.com');

            expect(user).toBeInstanceOf(User);
            expect(user.email).toBe('test@example.com');
        });
    });

    describe('Permissões', () => {
        test('deve verificar hierarquia de permissões corretamente', () => {
            expect(User.hasPermission('admin', 'admin')).toBe(true);
            expect(User.hasPermission('admin', 'manager')).toBe(true);
            expect(User.hasPermission('admin', 'operator')).toBe(true);
            expect(User.hasPermission('admin', 'mechanic')).toBe(true);

            expect(User.hasPermission('manager', 'admin')).toBe(false);
            expect(User.hasPermission('manager', 'manager')).toBe(true);
            expect(User.hasPermission('manager', 'operator')).toBe(true);
            expect(User.hasPermission('manager', 'mechanic')).toBe(true);

            expect(User.hasPermission('operator', 'admin')).toBe(false);
            expect(User.hasPermission('operator', 'manager')).toBe(false);
            expect(User.hasPermission('operator', 'operator')).toBe(true);
            expect(User.hasPermission('operator', 'mechanic')).toBe(false);
        });

        test('deve retornar permissões corretas para admin', () => {
            const user = new User({ role: 'admin' });
            const permissions = user.getPermissions();

            expect(permissions).toContain('users:create');
            expect(permissions).toContain('users:delete');
            expect(permissions).toContain('config:update');
        });

        test('deve retornar permissões corretas para operator', () => {
            const user = new User({ role: 'operator' });
            const permissions = user.getPermissions();

            expect(permissions).toContain('clients:create');
            expect(permissions).toContain('sales:create');
            expect(permissions).not.toContain('users:create');
            expect(permissions).not.toContain('config:update');
        });

        test('deve verificar permissão específica', () => {
            const adminUser = new User({ role: 'admin' });
            const operatorUser = new User({ role: 'operator' });

            expect(adminUser.hasPermission('users:create')).toBe(true);
            expect(operatorUser.hasPermission('users:create')).toBe(false);
            expect(operatorUser.hasPermission('clients:create')).toBe(true);
        });
    });

    describe('Serialização', () => {
        test('deve remover senha do JSON', () => {
            const user = new User({
                id: 'user-id-123',
                email: 'test@example.com',
                password_hash: 'hashed-password',
                name: 'Test User',
                role: 'operator'
            });

            const json = user.toJSON();

            expect(json.password_hash).toBeUndefined();
            expect(json.id).toBe('user-id-123');
            expect(json.email).toBe('test@example.com');
            expect(json.name).toBe('Test User');
        });
    });

    describe('Atualização', () => {
        test('deve atualizar dados do usuário', async () => {
            const mockResult = {
                rows: [{
                    id: 'user-id-123',
                    email: 'updated@example.com',
                    name: 'Updated User',
                    role: 'manager',
                    active: true,
                    updated_at: new Date()
                }]
            };

            query.mockResolvedValueOnce({ rows: [] }); // Verificação de email duplicado
            query.mockResolvedValueOnce(mockResult); // UPDATE

            const user = new User({
                id: 'user-id-123',
                email: 'test@example.com',
                name: 'Test User',
                role: 'operator'
            });

            await user.update({
                email: 'updated@example.com',
                name: 'Updated User',
                role: 'manager'
            });

            expect(user.email).toBe('updated@example.com');
            expect(user.name).toBe('Updated User');
            expect(user.role).toBe('manager');
        });
    });
});