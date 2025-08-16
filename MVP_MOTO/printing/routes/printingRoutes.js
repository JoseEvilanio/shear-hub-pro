// Rotas de Impressão
// Sistema de Gestão de Oficina Mecânica de Motos

const express = require('express');
const router = express.Router();

const PrintingController = require('../controllers/PrintingController');
const {
    authenticate,
    requireOperator
} = require('../../auth/middleware/authMiddleware');

// Todas as rotas requerem autenticação
router.use(authenticate);

/**
 * @route GET /api/printing/config
 * @desc Obter configurações de impressão
 * @access Private (Operator+)
 */
router.get('/config', requireOperator, PrintingController.getPrintingConfig);

/**
 * @route GET /api/printing/stats
 * @desc Obter estatísticas de impressão
 * @access Private (Operator+)
 */
router.get('/stats', requireOperator, PrintingController.getStats);

/**
 * @route POST /api/printing/test
 * @desc Testar impressão
 * @access Private (Operator+)
 * @body {string} type - Tipo de teste (receipt, pdf)
 * @body {string} printerType - Tipo de impressora (matrix, laser, thermal)
 */
router.post('/test', requireOperator, PrintingController.testPrint);

/**
 * @route GET /api/printing/files
 * @desc Listar arquivos gerados
 * @access Private (Operator+)
 * @query {number} limit - Limite de arquivos (padrão: 50)
 * @query {string} type - Filtrar por tipo (OS, VD, CUPOM, RECIBO)
 */
router.get('/files', requireOperator, PrintingController.listFiles);

/**
 * @route DELETE /api/printing/files/cleanup
 * @desc Limpar arquivos antigos
 * @access Private (Operator+)
 * @query {number} days - Dias para considerar arquivo antigo (padrão: 30)
 */
router.delete('/files/cleanup', requireOperator, PrintingController.cleanupFiles);

/**
 * @route POST /api/printing/service-orders/:id
 * @desc Imprimir ordem de serviço
 * @access Private (Operator+)
 * @param {string} id - ID da ordem de serviço
 * @query {string} format - Formato (pdf)
 * @query {string} printerType - Tipo de impressora (laser, matrix)
 */
router.post('/service-orders/:id', requireOperator, PrintingController.printServiceOrder);

/**
 * @route POST /api/printing/sales/:id
 * @desc Imprimir venda/orçamento
 * @access Private (Operator+)
 * @param {string} id - ID da venda
 * @query {string} format - Formato (pdf, receipt)
 * @query {string} printerType - Tipo de impressora (laser, matrix)
 */
router.post('/sales/:id', requireOperator, PrintingController.printSale);

/**
 * @route POST /api/printing/receipts/:id
 * @desc Gerar cupom não fiscal
 * @access Private (Operator+)
 * @param {string} id - ID da venda
 * @query {string} printerType - Tipo de impressora (matrix, thermal)
 * @query {boolean} preview - Visualizar conteúdo (true/false)
 */
router.post('/receipts/:id', requireOperator, PrintingController.generateReceipt);

/**
 * @route POST /api/printing/payment-receipts
 * @desc Gerar recibo de pagamento
 * @access Private (Operator+)
 * @body {string} id - ID único do recibo
 * @body {string} clientName - Nome do cliente
 * @body {number} amount - Valor recebido
 * @body {string} description - Descrição do pagamento
 * @body {string} date - Data do pagamento
 * @body {string} paymentMethod - Método de pagamento
 */
router.post('/payment-receipts', requireOperator, PrintingController.generatePaymentReceipt);

/**
 * @route GET /api/printing/files/:filename/download
 * @desc Download de arquivo gerado
 * @access Private (Operator+)
 * @param {string} filename - Nome do arquivo
 */
router.get('/files/:filename/download', requireOperator, PrintingController.downloadFile);

/**
 * @route GET /api/printing/files/:filename/view
 * @desc Visualizar arquivo no navegador
 * @access Private (Operator+)
 * @param {string} filename - Nome do arquivo
 */
router.get('/files/:filename/view', requireOperator, PrintingController.viewFile);

/**
 * @route DELETE /api/printing/files/:filename
 * @desc Deletar arquivo específico
 * @access Private (Operator+)
 * @param {string} filename - Nome do arquivo
 */
router.delete('/files/:filename', requireOperator, PrintingController.deleteFile);

module.exports = router;