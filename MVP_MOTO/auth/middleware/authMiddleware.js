// Middleware de Autenticação
// Sistema de Gestão de Oficina Mecânica de Motos

const AuthService = require('../services/AuthService');
const User = require('../models/User');

// Middleware para verificar autenticação
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                error: 'Token de acesso não fornecido',
                code: 'NO_TOKEN'
            });
        }

        const token = authHeader.split(' ')[1]; // Bearer TOKEN
        
        if (!token) {
            return res.status(401).json({
                error: 'Formato de token inválido',
                code: 'INVALID_TOKEN_FORMAT'
            });
        }

        // Verificar token
        const decoded = AuthService.verifyAccessToken(token);
        
        // Buscar usuário no banco para verificar se ainda está ativo
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({
                error: 'Usuário não encontrado',
                code: 'USER_NOT_FOUND'
            });
        }

        if (!user.active) {
            return res.status(401).json({
                error: 'Usuário desativado',
                code: 'USER_INACTIVE'
            });
        }

        // Adicionar dados do usuário à requisição
        req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            permissions: user.getPermissions()
        };

        next();

    } catch (error) {
        let errorCode = 'AUTH_ERROR';
        let statusCode = 401;

        if (error.message === 'Token expirado') {
            errorCode = 'TOKEN_EXPIRED';
        } else if (error.message === 'Token inválido') {
            errorCode = 'INVALID_TOKEN';
        }

        return res.status(statusCode).json({
            error: error.message,
            code: errorCode
        });
    }
};

// Middleware para verificar autorização por role
const authorize = (requiredRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Usuário não autenticado',
                code: 'NOT_AUTHENTICATED'
            });
        }

        // Se requiredRoles for string, converter para array
        const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
        
        // Verificar se usuário tem pelo menos uma das roles necessárias
        const hasRequiredRole = roles.some(role => 
            User.hasPermission(req.user.role, role)
        );

        if (!hasRequiredRole) {
            return res.status(403).json({
                error: 'Acesso negado. Permissão insuficiente.',
                code: 'INSUFFICIENT_PERMISSIONS',
                required: roles,
                current: req.user.role
            });
        }

        next();
    };
};

// Middleware para verificar permissão específica
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Usuário não autenticado',
                code: 'NOT_AUTHENTICATED'
            });
        }

        if (!req.user.permissions.includes(permission)) {
            return res.status(403).json({
                error: 'Acesso negado. Permissão específica necessária.',
                code: 'PERMISSION_DENIED',
                required: permission,
                available: req.user.permissions
            });
        }

        next();
    };
};

// Middleware para verificar se é o próprio usuário ou admin
const requireOwnershipOrAdmin = (userIdParam = 'id') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Usuário não autenticado',
                code: 'NOT_AUTHENTICATED'
            });
        }

        const targetUserId = req.params[userIdParam];
        const isOwner = req.user.id === targetUserId;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                error: 'Acesso negado. Você só pode acessar seus próprios dados.',
                code: 'OWNERSHIP_REQUIRED'
            });
        }

        next();
    };
};

// Middleware para rate limiting de login
const loginRateLimit = async (req, res, next) => {
    try {
        const { email } = req.body;
        const ipAddress = req.ip || req.connection.remoteAddress;

        if (email) {
            await AuthService.checkSuspiciousActivity(email, ipAddress);
        }

        next();

    } catch (error) {
        return res.status(429).json({
            error: error.message,
            code: 'RATE_LIMIT_EXCEEDED'
        });
    }
};

// Middleware para extrair informações do cliente
const extractClientInfo = (req, res, next) => {
    req.clientInfo = {
        ipAddress: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'],
        userAgent: req.headers['user-agent'] || 'Unknown'
    };
    next();
};

// Middleware opcional de autenticação (não falha se não autenticado)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            req.user = null;
            return next();
        }

        const token = authHeader.split(' ')[1];
        
        if (!token) {
            req.user = null;
            return next();
        }

        // Verificar token
        const decoded = AuthService.verifyAccessToken(token);
        
        // Buscar usuário no banco
        const user = await User.findById(decoded.id);
        
        if (user && user.active) {
            req.user = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                permissions: user.getPermissions()
            };
        } else {
            req.user = null;
        }

        next();

    } catch (error) {
        // Em caso de erro, continua sem usuário autenticado
        req.user = null;
        next();
    }
};

// Middleware para verificar se usuário é admin
const requireAdmin = authorize('admin');

// Middleware para verificar se usuário é admin ou manager
const requireManager = authorize(['admin', 'manager']);

// Middleware para verificar se usuário é admin, manager ou operator
const requireOperator = authorize(['admin', 'manager', 'operator']);

module.exports = {
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
};