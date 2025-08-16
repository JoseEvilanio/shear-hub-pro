// Sistema de Autenticação - Ponto de Entrada
// Sistema de Gestão de Oficina Mecânica de Motos

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Importar componentes do sistema de autenticação
const User = require('./models/User');
const AuthService = require('./services/AuthService');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const {
    authenticate,
    authorize,
    requirePermission,
    requireOwnershipOrAdmin,
    loginRateLimit,
    extractClientInfo,
    optionalAuth,
    requireAdmin,
    requireManager,
    requireOperator
} = require('./middleware/authMiddleware');

// Configurar rate limiting global
const globalRateLimit = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // máximo 100 requests por IP
    message: {
        error: 'Muitas requisições deste IP, tente novamente mais tarde.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Configurar rate limiting específico para autenticação
const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // máximo 20 tentativas de auth por IP
    message: {
        error: 'Muitas tentativas de autenticação, tente novamente em 15 minutos.',
        code: 'AUTH_RATE_LIMIT_EXCEEDED'
    },
    skip: (req) => {
        // Pular rate limit para verificação de token
        return req.path === '/verify' && req.method === 'GET';
    }
});

// Função para configurar middleware de autenticação em uma aplicação Express
function setupAuth(app) {
    // Middleware de segurança
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
            },
        },
    }));

    // CORS
    app.use(cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Rate limiting global
    app.use(globalRateLimit);

    // Middleware para parsing JSON
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Middleware para extrair IP real
    app.use((req, res, next) => {
        req.ip = req.headers['x-forwarded-for'] || 
                 req.headers['x-real-ip'] || 
                 req.connection.remoteAddress || 
                 req.socket.remoteAddress ||
                 (req.connection.socket ? req.connection.socket.remoteAddress : null);
        next();
    });

    // Rotas de autenticação com rate limiting específico
    app.use('/api/auth', authRateLimit, authRoutes);
    app.use('/api/users', userRoutes);

    // Middleware de tratamento de erros
    app.use((error, req, res, next) => {
        console.error('Erro na aplicação:', error);

        // Erro de validação do JWT
        if (error.name === 'UnauthorizedError') {
            return res.status(401).json({
                error: 'Token inválido',
                code: 'INVALID_TOKEN'
            });
        }

        // Erro de rate limiting
        if (error.status === 429) {
            return res.status(429).json({
                error: 'Muitas requisições',
                code: 'RATE_LIMIT_EXCEEDED'
            });
        }

        // Erro genérico
        res.status(500).json({
            error: process.env.NODE_ENV === 'production' 
                ? 'Erro interno do servidor' 
                : error.message,
            code: 'INTERNAL_SERVER_ERROR'
        });
    });

    return app;
}

// Função para inicializar sistema de autenticação
async function initializeAuth() {
    try {
        console.log('🔐 Inicializando sistema de autenticação...');

        // Verificar se existe pelo menos um usuário admin
        const adminCount = await User.count({ role: 'admin' });
        
        if (adminCount === 0) {
            console.log('⚠️  Nenhum administrador encontrado. Criando usuário admin padrão...');
            
            const adminUser = new User({
                email: 'admin@oficina.com',
                name: 'Administrador',
                role: 'admin',
                active: true
            });

            await adminUser.create('admin123');
            
            console.log('✅ Usuário administrador criado:');
            console.log('   Email: admin@oficina.com');
            console.log('   Senha: admin123');
            console.log('   ⚠️  ALTERE A SENHA PADRÃO IMEDIATAMENTE!');
        }

        // Limpar tokens expirados
        await AuthService.cleanupExpiredTokens();
        
        console.log('✅ Sistema de autenticação inicializado com sucesso');
        return true;

    } catch (error) {
        console.error('❌ Erro ao inicializar sistema de autenticação:', error.message);
        throw error;
    }
}

// Função para agendar limpeza automática de tokens
function scheduleTokenCleanup() {
    // Limpar tokens expirados a cada hora
    setInterval(async () => {
        try {
            const deletedCount = await AuthService.cleanupExpiredTokens();
            if (deletedCount > 0) {
                console.log(`🧹 Limpeza automática: ${deletedCount} tokens expirados removidos`);
            }
        } catch (error) {
            console.error('❌ Erro na limpeza automática de tokens:', error.message);
        }
    }, 60 * 60 * 1000); // 1 hora
}

// Função para obter estatísticas de autenticação
async function getAuthStats() {
    try {
        const [
            totalUsers,
            activeUsers,
            activeSessions
        ] = await Promise.all([
            User.count(),
            User.count({ active: true }),
            AuthService.getActiveSessions() // Implementar método global se necessário
        ]);

        return {
            users: {
                total: totalUsers,
                active: activeUsers,
                inactive: totalUsers - activeUsers
            },
            sessions: {
                active: activeSessions ? activeSessions.length : 0
            }
        };
    } catch (error) {
        console.error('Erro ao obter estatísticas de autenticação:', error.message);
        return null;
    }
}

// Exportar tudo
module.exports = {
    // Modelos
    User,
    
    // Serviços
    AuthService,
    
    // Middleware
    authenticate,
    authorize,
    requirePermission,
    requireOwnershipOrAdmin,
    loginRateLimit,
    extractClientInfo,
    optionalAuth,
    requireAdmin,
    requireManager,
    requireOperator,
    
    // Rotas
    authRoutes,
    userRoutes,
    
    // Funções de configuração
    setupAuth,
    initializeAuth,
    scheduleTokenCleanup,
    getAuthStats,
    
    // Rate limiting
    globalRateLimit,
    authRateLimit
};