// Testes do Controller de Impressão
// Sistema de Gestão de Oficina Mecânica de Motos

const PrintingController = require('../controllers/PrintingController');
const PrintingService = require('../services/PrintingService');
const fs = require('fs');

// Mocks
jest.mock('../services/PrintingService');
jest.mock('fs');

describe('PrintingController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: {},
            query: {},
            body: {},
            user: { id: 'user-123', role: 'operator' }
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            setHeader: jest.fn(),
            send: jest.fn(),
            pipe: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('printServiceOrder', () => {
        test('deve imprimir OS em PDF com sucesso', async () => {
            req.params.id = 'so-123';
            req.query.format = 'pdf';

            const mockResult = {
                filename: 'OS_001_123.pdf',
                filepath: '/path/to/file.pdf',
                type: 'service_order',
                format: 'pdf'
            };

            PrintingService.generateServiceOrderPDF.mockResolvedValue(mockResult);

            await PrintingController.printServiceOrder(req, res);

            expect(PrintingService.generateServiceOrderPDF).toHaveBeenCalledWith('so-123', { printerType: 'laser' });
            expect(res.json).toHaveBeenCalledWith({
                message: 'Ordem de serviço gerada com sucesso',
                data: mockResult
            });
        });

        test('deve rejeitar requisição sem ID', async () => {
            await PrintingController.printServiceOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'ID da ordem de serviço é obrigatório',
                code: 'MISSING_SERVICE_ORDER_ID'
            });
        });

        test('deve rejeitar formato não suportado', async () => {
            req.params.id = 'so-123';
            req.query.format = 'invalid';

            await PrintingController.printServiceOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Formato não suportado',
                code: 'UNSUPPORTED_FORMAT'
            });
        });

        test('deve tratar erro do serviço', async () => {
            req.params.id = 'so-123';
            PrintingService.generateServiceOrderPDF.mockRejectedValue(new Error('Service error'));

            await PrintingController.printServiceOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Service error',
                code: 'SERVICE_ORDER_PRINT_FAILED'
            });
        });
    });

    describe('printSale', () => {
        test('deve imprimir venda em PDF', async () => {
            req.params.id = 'sale-123';
            req.query.format = 'pdf';

            const mockResult = {
                filename: 'VD_001_123.pdf',
                type: 'sale',
                format: 'pdf'
            };

            PrintingService.generateSalePDF.mockResolvedValue(mockResult);

            await PrintingController.printSale(req, res);

            expect(PrintingService.generateSalePDF).toHaveBeenCalledWith('sale-123', { printerType: 'laser' });
            expect(res.json).toHaveBeenCalledWith({
                message: 'Documento de venda gerado com sucesso',
                data: mockResult
            });
        });

        test('deve gerar cupom não fiscal', async () => {
            req.params.id = 'sale-123';
            req.query.format = 'receipt';

            const mockResult = {
                filename: 'CUPOM_001_123.txt',
                type: 'receipt',
                format: 'txt'
            };

            PrintingService.generateNonFiscalReceipt.mockResolvedValue(mockResult);

            await PrintingController.printSale(req, res);

            expect(PrintingService.generateNonFiscalReceipt).toHaveBeenCalledWith('sale-123', { printerType: 'laser' });
        });
    });

    describe('generateReceipt', () => {
        test('deve gerar cupom não fiscal', async () => {
            req.params.id = 'sale-123';

            const mockResult = {
                filename: 'CUPOM_001_123.txt',
                content: 'Conteúdo do cupom',
                type: 'receipt',
                format: 'txt'
            };

            PrintingService.generateNonFiscalReceipt.mockResolvedValue(mockResult);

            await PrintingController.generateReceipt(req, res);

            expect(res.json).toHaveBeenCalledWith({
                message: 'Cupom não fiscal gerado com sucesso',
                data: mockResult
            });
        });

        test('deve mostrar preview do cupom', async () => {
            req.params.id = 'sale-123';
            req.query.preview = 'true';

            const mockResult = {
                content: 'Conteúdo do cupom para preview'
            };

            PrintingService.generateNonFiscalReceipt.mockResolvedValue(mockResult);

            await PrintingController.generateReceipt(req, res);

            expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain; charset=utf-8');
            expect(res.send).toHaveBeenCalledWith('Conteúdo do cupom para preview');
        });
    });

    describe('generatePaymentReceipt', () => {
        test('deve gerar recibo de pagamento', async () => {
            req.body = {
                id: 'payment-123',
                clientName: 'João Silva',
                amount: 100.00,
                description: 'Pagamento de serviço',
                date: '2024-01-15',
                paymentMethod: 'cash'
            };

            const mockResult = {
                filename: 'RECIBO_payment-123_123.pdf',
                type: 'receipt',
                format: 'pdf'
            };

            PrintingService.generatePaymentReceipt.mockResolvedValue(mockResult);

            await PrintingController.generatePaymentReceipt(req, res);

            expect(PrintingService.generatePaymentReceipt).toHaveBeenCalledWith(req.body);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Recibo de pagamento gerado com sucesso',
                data: mockResult
            });
        });

        test('deve validar campos obrigatórios', async () => {
            req.body = {
                id: 'payment-123'
                // Faltando campos obrigatórios
            };

            await PrintingController.generatePaymentReceipt(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: expect.stringContaining('Campos obrigatórios'),
                code: 'MISSING_PAYMENT_DATA'
            });
        });
    });

    describe('downloadFile', () => {
        test('deve fazer download de arquivo', async () => {
            req.params.filename = 'test.pdf';
            
            fs.existsSync.mockReturnValue(true);
            fs.createReadStream.mockReturnValue({
                pipe: jest.fn()
            });

            await PrintingController.downloadFile(req, res);

            expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
            expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="test.pdf"');
        });

        test('deve retornar erro se arquivo não existe', async () => {
            req.params.filename = 'nonexistent.pdf';
            fs.existsSync.mockReturnValue(false);

            await PrintingController.downloadFile(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Arquivo não encontrado',
                code: 'FILE_NOT_FOUND'
            });
        });
    });

    describe('listFiles', () => {
        test('deve listar arquivos gerados', async () => {
            const mockFiles = [
                { filename: 'OS_001.pdf', size: 1024, createdAt: new Date() },
                { filename: 'VD_002.pdf', size: 2048, createdAt: new Date() }
            ];

            PrintingService.listGeneratedFiles.mockResolvedValue(mockFiles);

            await PrintingController.listFiles(req, res);

            expect(res.json).toHaveBeenCalledWith({
                message: 'Arquivos listados com sucesso',
                data: {
                    files: mockFiles,
                    total: 2
                }
            });
        });

        test('deve filtrar arquivos por tipo', async () => {
            req.query.type = 'OS';
            
            const mockFiles = [
                { filename: 'OS_001.pdf', size: 1024, createdAt: new Date() },
                { filename: 'VD_002.pdf', size: 2048, createdAt: new Date() }
            ];

            PrintingService.listGeneratedFiles.mockResolvedValue(mockFiles);

            await PrintingController.listFiles(req, res);

            expect(res.json).toHaveBeenCalledWith({
                message: 'Arquivos listados com sucesso',
                data: {
                    files: [mockFiles[0]], // Apenas arquivos OS
                    total: 1
                }
            });
        });
    });

    describe('getStats', () => {
        test('deve obter estatísticas de impressão', async () => {
            const mockStats = {
                totalFiles: 10,
                totalSize: 10240,
                byType: { OS: { count: 5, size: 5120 } }
            };

            PrintingService.getPrintingStats.mockResolvedValue(mockStats);

            await PrintingController.getStats(req, res);

            expect(res.json).toHaveBeenCalledWith({
                message: 'Estatísticas obtidas com sucesso',
                data: mockStats
            });
        });
    });

    describe('testPrint', () => {
        test('deve executar teste de impressão de cupom', async () => {
            req.body = { type: 'receipt', printerType: 'matrix' };

            const mockReceipt = 'Conteúdo do cupom de teste';
            PrintingService.formatMatrixReceipt.mockReturnValue(mockReceipt);
            PrintingService.getCompanyConfig.mockResolvedValue({});

            await PrintingController.testPrint(req, res);

            expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain; charset=utf-8');
            expect(res.send).toHaveBeenCalledWith(mockReceipt);
        });

        test('deve rejeitar tipo de teste não suportado', async () => {
            req.body = { type: 'invalid' };

            await PrintingController.testPrint(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Tipo de teste não suportado',
                code: 'UNSUPPORTED_TEST_TYPE'
            });
        });
    });
});