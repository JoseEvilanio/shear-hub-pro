// Rotas de Autenticação
// Sistema de Gestão de Oficina Mecânica de Motos

const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/AuthController');
const {
    authenticate,
    loginRateLimit,
    extractClientInfo
} = require('../middleware/authMiddleware');

// Aplicar middleware de extração de informações do cliente em todas as rotas
router.use(extractClientInfo);

// Rotas públicas (não requerem autenticação)

/**
 * @route POST /api/auth/login
 * @desc Login do usuário
 * @access Public
 * @body {string} email - Email do usuário
 * @body {string} password - Senha do usuário
 */
router.post('/login', loginRateLimit, AuthController.login);

/**
 * @route POST /api/auth/refresh
 * @desc Renovar token de acesso
 * @access Public
 * @body {string} refreshToken - Token de renovação
 */
router.post('/refresh', AuthController.refreshToken);

/**
 * @route POST /api/auth/logout
 * @desc Logout do usuário
 * @access Public
 * @body {string} refreshToken - Token de renovação (opcional)
 */
router.post('/logout', AuthController.logout);

// Rotas protegidas (requerem autenticação)

/**
 * @route GET /api/auth/profile
 * @desc Obter perfil do usuário atual
 * @access Private
 */
router.get('/profile', authenticate, AuthController.getProfile);

/**
 * @route PUT /api/auth/profile
 * @desc Atualizar perfil do usuário atual
 * @access Private
 * @body {string} name - Nome do usuário
 * @body {string} email - Email do usuário
 */
router.put('/profile', authenticate, AuthController.updateProfile);

/**
 * @route POST /api/auth/change-password
 * @desc Alterar senha do usuário atual
 * @access Private
 * @body {string} currentPassword - Senha atual
 * @body {string} newPassword - Nova senha
 */
router.post('/change-password', authenticate, AuthController.changePassword);

/**
 * @route POST /api/auth/logout-all
 * @desc Logout de todos os dispositivos
 * @access Private
 */
router.post('/logout-all', authenticate, AuthController.logoutAll);

/**
 * @route GET /api/auth/sessions
 * @desc Obter sessões ativas do usuário
 * @access Private
 */
router.get('/sessions', authenticate, AuthController.getActiveSessions);

/**
 * @route DELETE /api/auth/sessions/:tokenPrefix
 * @desc Revogar sessão específica
 * @access Private
 * @param {string} tokenPrefix - Prefixo do token da sessão
 */
router.delete('/sessions/:tokenPrefix', authenticate, AuthController.revokeSession);

/**
 * @route GET /api/auth/verify
 * @desc Verificar se token é válido
 * @access Private
 */
router.get('/verify', authenticate, AuthController.verifyToken);

/**
 * @route GET /api/auth/permissions
 * @desc Obter permissões do usuário atual
 * @access Private
 */
router.get('/permissions', authenticate, AuthController.getPermissions);

module.exports = router;