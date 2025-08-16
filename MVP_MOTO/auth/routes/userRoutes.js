// Rotas de Usuários
// Sistema de Gestão de Oficina Mecânica de Motos

const express = require('express');
const router = express.Router();

const UserController = require('../controllers/UserController');
const {
    authenticate,
    requireAdmin,
    requireManager,
    requireOwnershipOrAdmin
} = require('../middleware/authMiddleware');

// Todas as rotas requerem autenticação
router.use(authenticate);

/**
 * @route GET /api/users/stats
 * @desc Obter estatísticas de usuários
 * @access Private (Admin/Manager)
 */
router.get('/stats', requireManager, UserController.getStats);

/**
 * @route GET /api/users/roles
 * @desc Obter roles disponíveis
 * @access Private (Admin/Manager)
 */
router.get('/roles', requireManager, UserController.getRoles);

/**
 * @route GET /api/users
 * @desc Listar usuários
 * @access Private (Admin/Manager)
 * @query {number} page - Página (padrão: 1)
 * @query {number} limit - Limite por página (padrão: 10)
 * @query {string} role - Filtrar por role
 * @query {boolean} active - Filtrar por status ativo
 * @query {string} search - Buscar por nome ou email
 */
router.get('/', requireManager, UserController.index);

/**
 * @route POST /api/users
 * @desc Criar novo usuário
 * @access Private (Admin)
 * @body {string} email - Email do usuário
 * @body {string} password - Senha do usuário
 * @body {string} name - Nome do usuário
 * @body {string} role - Role do usuário (opcional, padrão: operator)
 * @body {boolean} active - Status ativo (opcional, padrão: true)
 */
router.post('/', requireAdmin, UserController.create);

/**
 * @route GET /api/users/:id
 * @desc Obter usuário por ID
 * @access Private (Owner/Admin/Manager)
 * @param {string} id - ID do usuário
 */
router.get('/:id', requireOwnershipOrAdmin(), UserController.show);

/**
 * @route PUT /api/users/:id
 * @desc Atualizar usuário
 * @access Private (Admin)
 * @param {string} id - ID do usuário
 * @body {string} email - Email do usuário
 * @body {string} name - Nome do usuário
 * @body {string} role - Role do usuário
 * @body {boolean} active - Status ativo
 */
router.put('/:id', requireAdmin, UserController.update);

/**
 * @route POST /api/users/:id/deactivate
 * @desc Desativar usuário
 * @access Private (Admin)
 * @param {string} id - ID do usuário
 */
router.post('/:id/deactivate', requireAdmin, UserController.deactivate);

/**
 * @route POST /api/users/:id/activate
 * @desc Ativar usuário
 * @access Private (Admin)
 * @param {string} id - ID do usuário
 */
router.post('/:id/activate', requireAdmin, UserController.activate);

/**
 * @route POST /api/users/:id/reset-password
 * @desc Resetar senha do usuário
 * @access Private (Admin)
 * @param {string} id - ID do usuário
 * @body {string} newPassword - Nova senha
 */
router.post('/:id/reset-password', requireAdmin, UserController.resetPassword);

module.exports = router;