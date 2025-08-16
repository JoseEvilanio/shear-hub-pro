// Controller de Relatórios
// Sistema de Gestão de Oficina Mecânica de Motos

const ReportsService = require('../services/ReportsService');

class ReportsController {
    // Relatório de aniversariantes
    async getBirthdayReport(req, res) {
        try {
            const { month, year } = req.query;

            // Validar mês se fornecido
            if (month && (month < 1 || month > 12)) {
                return res.status(400).json({
                    error: 'Mês deve estar entre 1 e 12',
                    code: 'INVALID_MONTH'
                });
            }

            // Validar ano se fornecido
            if (year && (year < 1900 || year > new Date().getFullYear() + 10)) {
                return res.status(400).json({
                    error: 'Ano inválido',
                    code: 'INVALID_YEAR'
                });
            }

            const report = await ReportsService.getBirthdayReport(
                month ? parseInt(month) : null,
                year ? parseInt(year) : null
            );

            res.json({
                message: 'Relatório de aniversariantes gerado com sucesso',
                data: report
            });

        } catch (error) {
            res.status(500).json({
                error: error.message,
                code: 'BIRTHDAY_REPORT_FAILED'
            });
        }
    }

    // Relatório de serviços por período
    async getServicesReport(req, res) {
        try {
            const { startDate, endDate, mechanicId, status } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({
                    error: 'Data inicial e final são obrigatórias',
                    code: 'MISSING_DATE_RANGE'
                });
            }

            // Validar período
            ReportsService.validateDateRange(startDate, endDate);

            const report = await ReportsService.getServicesReport(
                startDate,
                endDate,
                mechanicId || null,
                status || null
            );

            res.json({
                message: 'Relatório de serviços gerado com sucesso',
                data: report
            });

        } catch (error) {
            res.status(400).json({
                error: error.message,
                code: 'SERVICES_REPORT_FAILED'
            });
        }
    }

    // Relatório de vendas detalhado
    async getSalesReport(req, res) {
        try {
            const { startDate, endDate, clientId, userId, type, status } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({
                    error: 'Data inicial e final são obrigatórias',
                    code: 'MISSING_DATE_RANGE'
                });
            }

            // Validar período
            ReportsService.validateDateRange(startDate, endDate);

            // Validar tipo se fornecido
            if (type && !['sale', 'quote'].includes(type)) {
                return res.status(400).json({
                    error: 'Tipo deve ser "sale" ou "quote"',
                    code: 'INVALID_TYPE'
                });
            }

            // Validar status se fornecido
            if (status && !['pending', 'completed', 'cancelled'].includes(status)) {
                return res.status(400).json({
                    error: 'Status deve ser "pending", "completed" ou "cancelled"',
                    code: 'INVALID_STATUS'
                });
            }

            const report = await ReportsService.getSalesReport(
                startDate,
                endDate,
                clientId || null,
                userId || null,
                type || null,
                status || null
            );

            res.json({
                message: 'Relatório de vendas gerado com sucesso',
                data: report
            });

        } catch (error) {
            res.status(400).json({
                error: error.message,
                code: 'SALES_REPORT_FAILED'
            });
        }
    }

    // Relatório de estoque atual
    async getInventoryReport(req, res) {
        try {
            const { productId, category, lowStock } = req.query;

            const report = await ReportsService.getInventoryReport(
                productId || null,
                category || null,
                lowStock === 'true'
            );

            res.json({
                message: 'Relatório de estoque gerado com sucesso',
                data: report
            });

        } catch (error) {
            res.status(500).json({
                error: error.message,
                code: 'INVENTORY_REPORT_FAILED'
            });
        }
    }

    // Relatório de movimentações de estoque
    async getInventoryMovementsReport(req, res) {
        try {
            const { startDate, endDate, productId, type } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({
                    error: 'Data inicial e final são obrigatórias',
                    code: 'MISSING_DATE_RANGE'
                });
            }

            // Validar período
            ReportsService.validateDateRange(startDate, endDate);

            // Validar tipo se fornecido
            if (type && !['in', 'out', 'adjustment'].includes(type)) {
                return res.status(400).json({
                    error: 'Tipo deve ser "in", "out" ou "adjustment"',
                    code: 'INVALID_TYPE'
                });
            }

            const report = await ReportsService.getInventoryMovementsReport(
                startDate,
                endDate,
                productId || null,
                type || null
            );

            res.json({
                message: 'Relatório de movimentações de estoque gerado com sucesso',
                data: report
            });

        } catch (error) {
            res.status(400).json({
                error: error.message,
                code: 'INVENTORY_MOVEMENTS_REPORT_FAILED'
            });
        }
    }

    // Relatório financeiro consolidado
    async getFinancialReport(req, res) {
        try {
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({
                    error: 'Data inicial e final são obrigatórias',
                    code: 'MISSING_DATE_RANGE'
                });
            }

            // Validar período
            ReportsService.validateDateRange(startDate, endDate);

            const report = await ReportsService.getFinancialReport(startDate, endDate);

            res.json({
                message: 'Relatório financeiro gerado com sucesso',
                data: report
            });

        } catch (error) {
            res.status(400).json({
                error: error.message,
                code: 'FINANCIAL_REPORT_FAILED'
            });
        }
    }

    // Dashboard com métricas principais
    async getDashboard(req, res) {
        try {
            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            const startOfYear = new Date(today.getFullYear(), 0, 1);
            const endOfYear = new Date(today.getFullYear(), 11, 31);

            const formatDate = (date) => date.toISOString().split('T')[0];

            // Buscar dados em paralelo
            const [
                monthlyFinancial,
                yearlyFinancial,
                inventoryReport,
                birthdayReport
            ] = await Promise.all([
                ReportsService.getFinancialReport(
                    formatDate(startOfMonth),
                    formatDate(endOfMonth)
                ),
                ReportsService.getFinancialReport(
                    formatDate(startOfYear),
                    formatDate(endOfYear)
                ),
                ReportsService.getInventoryReport(null, null, true), // Apenas produtos com estoque baixo
                ReportsService.getBirthdayReport(today.getMonth() + 1) // Aniversariantes do mês atual
            ]);

            const dashboard = {
                period: {
                    month: {
                        start: formatDate(startOfMonth),
                        end: formatDate(endOfMonth)
                    },
                    year: {
                        start: formatDate(startOfYear),
                        end: formatDate(endOfYear)
                    }
                },
                financial: {
                    monthly: {
                        sales: monthlyFinancial.sales,
                        netCashFlow: monthlyFinancial.summary.netCashFlow,
                        netResult: monthlyFinancial.summary.netResult,
                        overdueReceivable: monthlyFinancial.receivable.overdueAmount,
                        overduePayable: monthlyFinancial.payable.overdueAmount
                    },
                    yearly: {
                        sales: yearlyFinancial.sales,
                        netCashFlow: yearlyFinancial.summary.netCashFlow,
                        netResult: yearlyFinancial.summary.netResult
                    }
                },
                inventory: {
                    lowStockProducts: inventoryReport.summary.lowStockProducts,
                    outOfStockProducts: inventoryReport.summary.outOfStockProducts,
                    totalInventoryValue: inventoryReport.summary.totalInventoryValue,
                    lowStockItems: inventoryReport.data.slice(0, 10) // Top 10 produtos com estoque baixo
                },
                clients: {
                    birthdaysThisMonth: birthdayReport.summary.totalClients,
                    upcomingBirthdays: birthdayReport.data.length > 0 ? 
                        birthdayReport.data[0].clients.slice(0, 5) : [] // Próximos 5 aniversários
                }
            };

            res.json({
                message: 'Dashboard gerado com sucesso',
                data: dashboard
            });

        } catch (error) {
            res.status(500).json({
                error: error.message,
                code: 'DASHBOARD_FAILED'
            });
        }
    }

    // Exportar relatório (preparação para PDF/Excel)
    async exportReport(req, res) {
        try {
            const { type, format = 'json', ...params } = req.query;

            if (!type) {
                return res.status(400).json({
                    error: 'Tipo de relatório é obrigatório',
                    code: 'MISSING_REPORT_TYPE'
                });
            }

            let report;
            let filename;

            switch (type) {
                case 'birthday':
                    report = await ReportsService.getBirthdayReport(
                        params.month ? parseInt(params.month) : null,
                        params.year ? parseInt(params.year) : null
                    );
                    filename = `aniversariantes_${params.month || 'todos'}_${params.year || 'todos'}`;
                    break;

                case 'services':
                    if (!params.startDate || !params.endDate) {
                        return res.status(400).json({
                            error: 'Data inicial e final são obrigatórias',
                            code: 'MISSING_DATE_RANGE'
                        });
                    }
                    report = await ReportsService.getServicesReport(
                        params.startDate,
                        params.endDate,
                        params.mechanicId || null,
                        params.status || null
                    );
                    filename = `servicos_${params.startDate}_${params.endDate}`;
                    break;

                case 'sales':
                    if (!params.startDate || !params.endDate) {
                        return res.status(400).json({
                            error: 'Data inicial e final são obrigatórias',
                            code: 'MISSING_DATE_RANGE'
                        });
                    }
                    report = await ReportsService.getSalesReport(
                        params.startDate,
                        params.endDate,
                        params.clientId || null,
                        params.userId || null,
                        params.type || null,
                        params.status || null
                    );
                    filename = `vendas_${params.startDate}_${params.endDate}`;
                    break;

                case 'inventory':
                    report = await ReportsService.getInventoryReport(
                        params.productId || null,
                        params.category || null,
                        params.lowStock === 'true'
                    );
                    filename = `estoque_${new Date().toISOString().split('T')[0]}`;
                    break;

                case 'financial':
                    if (!params.startDate || !params.endDate) {
                        return res.status(400).json({
                            error: 'Data inicial e final são obrigatórias',
                            code: 'MISSING_DATE_RANGE'
                        });
                    }
                    report = await ReportsService.getFinancialReport(
                        params.startDate,
                        params.endDate
                    );
                    filename = `financeiro_${params.startDate}_${params.endDate}`;
                    break;

                default:
                    return res.status(400).json({
                        error: 'Tipo de relatório inválido',
                        code: 'INVALID_REPORT_TYPE'
                    });
            }

            // Por enquanto, retornar JSON
            // TODO: Implementar exportação para PDF/Excel
            if (format === 'json') {
                res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
                res.setHeader('Content-Type', 'application/json');
                res.json(report);
            } else {
                return res.status(400).json({
                    error: 'Formato de exportação não suportado ainda',
                    code: 'UNSUPPORTED_FORMAT'
                });
            }

        } catch (error) {
            res.status(400).json({
                error: error.message,
                code: 'EXPORT_FAILED'
            });
        }
    }

    // Listar tipos de relatórios disponíveis
    async getAvailableReports(req, res) {
        try {
            const reports = [
                {
                    type: 'birthday',
                    name: 'Relatório de Aniversariantes',
                    description: 'Lista de clientes aniversariantes por mês',
                    parameters: [
                        { name: 'month', type: 'number', required: false, description: 'Mês (1-12)' },
                        { name: 'year', type: 'number', required: false, description: 'Ano' }
                    ]
                },
                {
                    type: 'services',
                    name: 'Relatório de Serviços',
                    description: 'Relatório detalhado de ordens de serviço por período',
                    parameters: [
                        { name: 'startDate', type: 'date', required: true, description: 'Data inicial' },
                        { name: 'endDate', type: 'date', required: true, description: 'Data final' },
                        { name: 'mechanicId', type: 'uuid', required: false, description: 'ID do mecânico' },
                        { name: 'status', type: 'string', required: false, description: 'Status da OS' }
                    ]
                },
                {
                    type: 'sales',
                    name: 'Relatório de Vendas',
                    description: 'Relatório detalhado de vendas e orçamentos',
                    parameters: [
                        { name: 'startDate', type: 'date', required: true, description: 'Data inicial' },
                        { name: 'endDate', type: 'date', required: true, description: 'Data final' },
                        { name: 'clientId', type: 'uuid', required: false, description: 'ID do cliente' },
                        { name: 'userId', type: 'uuid', required: false, description: 'ID do vendedor' },
                        { name: 'type', type: 'string', required: false, description: 'Tipo (sale/quote)' },
                        { name: 'status', type: 'string', required: false, description: 'Status' }
                    ]
                },
                {
                    type: 'inventory',
                    name: 'Relatório de Estoque',
                    description: 'Relatório atual do estoque com movimentações',
                    parameters: [
                        { name: 'productId', type: 'uuid', required: false, description: 'ID do produto' },
                        { name: 'category', type: 'string', required: false, description: 'Categoria' },
                        { name: 'lowStock', type: 'boolean', required: false, description: 'Apenas estoque baixo' }
                    ]
                },
                {
                    type: 'financial',
                    name: 'Relatório Financeiro',
                    description: 'Relatório consolidado financeiro',
                    parameters: [
                        { name: 'startDate', type: 'date', required: true, description: 'Data inicial' },
                        { name: 'endDate', type: 'date', required: true, description: 'Data final' }
                    ]
                }
            ];

            res.json({
                message: 'Tipos de relatórios disponíveis',
                data: { reports }
            });

        } catch (error) {
            res.status(500).json({
                error: error.message,
                code: 'REPORTS_LIST_FAILED'
            });
        }
    }
}

module.exports = new ReportsController();