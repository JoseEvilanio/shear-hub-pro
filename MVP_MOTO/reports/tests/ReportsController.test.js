// Testes do Controller de Relatórios
// Sistema de Gestão de Oficina Mecânica de Motos

const ReportsController = require('../controllers/ReportsController');
const ReportsService = require('../services/ReportsService');

// Mock do serviço
jest.mock('../services/ReportsService');

describe('ReportsController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            query: {},
            user: { id: 'user-123', role: 'manager' }
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            setHeader: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('getBirthdayReport', () => {
        test('deve gerar relatório de aniversariantes com sucesso', async () => {
            const mockReport = {
                summary: { totalClients: 5 },
                data: []
            };

            ReportsService.getBirthdayReport.mockResolvedValue(mockReport);

            await ReportsController.getBirthdayReport(req, res);

            expect(ReportsService.getBirthdayReport).toHaveBeenCalledWith(null, null);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Relatório de aniversariantes gerado com sucesso',
                data: mockReport
            });
        });

        test('deve validar mês inválido', async () => {
            req.query.month = '13';

            await ReportsController.getBirthdayReport(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Mês deve estar entre 1 e 12',
                code: 'INVALID_MONTH'
            });
        });

        test('deve tratar erro do serviço', async () => {
            ReportsService.getBirthdayReport.mockRejectedValue(new Error('Service error'));

            await ReportsController.getBirthdayReport(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Service error',
                code: 'BIRTHDAY_REPORT_FAILED'
            });
        });
    });

    describe('getServicesReport', () => {
        test('deve gerar relatório de serviços com sucesso', async () => {
            req.query = {
                startDate: '2023-01-01',
                endDate: '2023-01-31'
            };

            const mockReport = {
                summary: { totalServices: 10 },
                data: []
            };

            ReportsService.getServicesReport.mockResolvedValue(mockReport);
            ReportsService.validateDateRange.mockReturnValue(true);

            await ReportsController.getServicesReport(req, res);

            expect(ReportsService.getServicesReport).toHaveBeenCalledWith(
                '2023-01-01',
                '2023-01-31',
                null,
                null
            );
            expect(res.json).toHaveBeenCalledWith({
                message: 'Relatório de serviços gerado com sucesso',
                data: mockReport
            });
        });

        test('deve rejeitar requisição sem datas', async () => {
            await ReportsController.getServicesReport(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Data inicial e final são obrigatórias',
                code: 'MISSING_DATE_RANGE'
            });
        });
    });

    describe('getSalesReport', () => {
        test('deve gerar relatório de vendas com sucesso', async () => {
            req.query = {
                startDate: '2023-01-01',
                endDate: '2023-01-31',
                type: 'sale'
            };

            const mockReport = {
                summary: { totalSales: 20 },
                data: []
            };

            ReportsService.getSalesReport.mockResolvedValue(mockReport);
            ReportsService.validateDateRange.mockReturnValue(true);

            await ReportsController.getSalesReport(req, res);

            expect(ReportsService.getSalesReport).toHaveBeenCalledWith(
                '2023-01-01',
                '2023-01-31',
                null,
                null,
                'sale',
                null
            );
        });

        test('deve validar tipo inválido', async () => {
            req.query = {
                startDate: '2023-01-01',
                endDate: '2023-01-31',
                type: 'invalid'
            };

            await ReportsController.getSalesReport(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Tipo deve ser "sale" ou "quote"',
                code: 'INVALID_TYPE'
            });
        });
    });

    describe('getInventoryReport', () => {
        test('deve gerar relatório de estoque com sucesso', async () => {
            req.query = { lowStock: 'true' };

            const mockReport = {
                summary: { totalProducts: 50 },
                data: []
            };

            ReportsService.getInventoryReport.mockResolvedValue(mockReport);

            await ReportsController.getInventoryReport(req, res);

            expect(ReportsService.getInventoryReport).toHaveBeenCalledWith(
                null,
                null,
                true
            );
            expect(res.json).toHaveBeenCalledWith({
                message: 'Relatório de estoque gerado com sucesso',
                data: mockReport
            });
        });
    });

    describe('getDashboard', () => {
        test('deve gerar dashboard com sucesso', async () => {
            const mockFinancial = {
                sales: { totalSales: 10 },
                summary: { netCashFlow: 1000 }
            };
            const mockInventory = {
                summary: { lowStockProducts: 5 },
                data: []
            };
            const mockBirthday = {
                summary: { totalClients: 3 },
                data: []
            };

            ReportsService.getFinancialReport
                .mockResolvedValueOnce(mockFinancial)
                .mockResolvedValueOnce(mockFinancial);
            ReportsService.getInventoryReport.mockResolvedValue(mockInventory);
            ReportsService.getBirthdayReport.mockResolvedValue(mockBirthday);

            await ReportsController.getDashboard(req, res);

            expect(res.json).toHaveBeenCalledWith({
                message: 'Dashboard gerado com sucesso',
                data: expect.objectContaining({
                    financial: expect.any(Object),
                    inventory: expect.any(Object),
                    clients: expect.any(Object)
                })
            });
        });
    });

    describe('exportReport', () => {
        test('deve exportar relatório em JSON', async () => {
            req.query = {
                type: 'birthday',
                format: 'json'
            };

            const mockReport = { data: [] };
            ReportsService.getBirthdayReport.mockResolvedValue(mockReport);

            await ReportsController.exportReport(req, res);

            expect(res.setHeader).toHaveBeenCalledWith(
                'Content-Disposition',
                expect.stringContaining('aniversariantes')
            );
            expect(res.json).toHaveBeenCalledWith(mockReport);
        });

        test('deve rejeitar tipo de relatório não fornecido', async () => {
            await ReportsController.exportReport(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Tipo de relatório é obrigatório',
                code: 'MISSING_REPORT_TYPE'
            });
        });

        test('deve rejeitar formato não suportado', async () => {
            req.query = {
                type: 'birthday',
                format: 'pdf'
            };

            await ReportsController.exportReport(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Formato de exportação não suportado ainda',
                code: 'UNSUPPORTED_FORMAT'
            });
        });
    });

    describe('getAvailableReports', () => {
        test('deve listar relatórios disponíveis', async () => {
            await ReportsController.getAvailableReports(req, res);

            expect(res.json).toHaveBeenCalledWith({
                message: 'Tipos de relatórios disponíveis',
                data: {
                    reports: expect.arrayContaining([
                        expect.objectContaining({
                            type: 'birthday',
                            name: expect.any(String)
                        })
                    ])
                }
            });
        });
    });
});