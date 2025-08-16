// Rotas de Relatórios
// Sistema de Gestão de Oficina Mecânica de Motos

const express = require('express');
const router = express.Router();

const ReportsController = require('../controllers/ReportsController');
const {
    authenticate,
    requirePermission,
    requireManager
} = require('../../auth/middleware/authMiddleware');

// Todas as rotas requerem autenticação
router.use(authenticate);

/**
 * @route GET /api/reports
 * @desc Listar tipos de relatórios disponíveis
 * @access Private (Manager+)
 */
router.get('/', requireManager, ReportsController.getAvailableReports);

/**
 * @route GET /api/reports/dashboard
 * @desc Dashboard com métricas principais
 * @access Private (Manager+)
 */
router.get('/dashboard', requireManager, ReportsController.getDashboard);

/**
 * @route GET /api/reports/birthday
 * @desc Relatório de aniversariantes
 * @access Private (Manager+)
 * @query {number} month - Mês (1-12, opcional)
 * @query {number} year - Ano (opcional)
 */
router.get('/birthday', requireManager, ReportsController.getBirthdayReport);

/**
 * @route GET /api/reports/services
 * @desc Relatório de serviços por período
 * @access Private (Manager+)
 * @query {string} startDate - Data inicial (obrigatório)
 * @query {string} endDate - Data final (obrigatório)
 * @query {string} mechanicId - ID do mecânico (opcional)
 * @query {string} status - Status da OS (opcional)
 */
router.get('/services', requireManager, ReportsController.getServicesReport);

/**
 * @route GET /api/reports/sales
 * @desc Relatório de vendas detalhado
 * @access Private (Manager+)
 * @query {string} startDate - Data inicial (obrigatório)
 * @query {string} endDate - Data final (obrigatório)
 * @query {string} clientId - ID do cliente (opcional)
 * @query {string} userId - ID do vendedor (opcional)
 * @query {string} type - Tipo: sale ou quote (opcional)
 * @query {string} status - Status (opcional)
 */
router.get('/sales', requireManager, ReportsController.getSalesReport);

/**
 * @route GET /api/reports/inventory
 * @desc Relatório de estoque atual
 * @access Private (Manager+)
 * @query {string} productId - ID do produto (opcional)
 * @query {string} category - Categoria (opcional)
 * @query {boolean} lowStock - Apenas produtos com estoque baixo (opcional)
 */
router.get('/inventory', requireManager, ReportsController.getInventoryReport);

/**
 * @route GET /api/reports/inventory/movements
 * @desc Relatório de movimentações de estoque
 * @access Private (Manager+)
 * @query {string} startDate - Data inicial (obrigatório)
 * @query {string} endDate - Data final (obrigatório)
 * @query {string} productId - ID do produto (opcional)
 * @query {string} type - Tipo: in, out ou adjustment (opcional)
 */
router.get('/inventory/movements', requireManager, ReportsController.getInventoryMovementsReport);

/**
 * @route GET /api/reports/financial
 * @desc Relatório financeiro consolidado
 * @access Private (Manager+)
 * @query {string} startDate - Data inicial (obrigatório)
 * @query {string} endDate - Data final (obrigatório)
 */
router.get('/financial', requireManager, ReportsController.getFinancialReport);

/**
 * @route GET /api/reports/export
 * @desc Exportar relatório em diferentes formatos
 * @access Private (Manager+)
 * @query {string} type - Tipo do relatório (obrigatório)
 * @query {string} format - Formato: json, pdf, excel (padrão: json)
 * @query {...} - Parâmetros específicos do relatório
 */
router.get('/export', requireManager, ReportsController.exportReport);

module.exports = router;