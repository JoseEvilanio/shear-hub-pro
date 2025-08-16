// Testes do Serviço de Impressão
// Sistema de Gestão de Oficina Mecânica de Motos

const PrintingService = require('../services/PrintingService');
const { query } = require('../../database/connection');
const fs = require('fs');
const path = require('path');

// Mocks
jest.mock('../../database/connection');
jest.mock('fs');
jest.mock('pdfkit');

describe('PrintingService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Mock do fs
        fs.existsSync.mockReturnValue(true);
        fs.mkdirSync.mockReturnValue(true);
        fs.writeFileSync.mockReturnValue(true);
        fs.createWriteStream.mockReturnValue({
            write: jest.fn(),
            end: jest.fn()
        });
    });

    describe('getCompanyConfig', () => {
        test('deve obter configurações da empresa', async () => {
            const mockConfigs = {
                rows: [
                    { key: 'company_name', value: 'Oficina Teste' },
                    { key: 'company_cnpj', value: '12.345.678/0001-90' },
                    { key: 'company_phone', value: '(11) 99999-9999' }
                ]
            };

            query.mockResolvedValue(mockConfigs);

            const config = await PrintingService.getCompanyConfig();

            expect(config.name).toBe('Oficina Teste');
            expect(config.cnpj).toBe('12.345.678/0001-90');
            expect(config.phone).toBe('(11) 99999-9999');
        });

        test('deve usar configurações padrão em caso de erro', async () => {
            query.mockRejectedValue(new Error('Database error'));

            const config = await PrintingService.getCompanyConfig();

            expect(config.name).toBe('Oficina de Motos');
        });
    });

    describe('getServiceOrderData', () => {
        test('deve buscar dados da OS com sucesso', async () => {
            const mockServiceOrder = {
                rows: [{
                    id: 'so-123',
                    number: 'OS0012024',
                    client_name: 'João Silva',
                    vehicle_plate: 'ABC1234',
                    total_amount: 500.00
                }]
            };

            const mockItems = {
                rows: [{
                    product_name: 'Óleo Motor',
                    quantity: 2,
                    unit_price: 25.00,
                    total_price: 50.00
                }]
            };

            query.mockResolvedValueOnce(mockServiceOrder);
            query.mockResolvedValueOnce(mockItems);

            const result = await PrintingService.getServiceOrderData('so-123');

            expect(result.number).toBe('OS0012024');
            expect(result.client_name).toBe('João Silva');
            expect(result.items).toHaveLength(1);
        });

        test('deve lançar erro se OS não encontrada', async () => {
            query.mockResolvedValue({ rows: [] });

            await expect(PrintingService.getServiceOrderData('invalid-id'))
                .rejects.toThrow('Ordem de serviço não encontrada');
        });
    });

    describe('getSaleData', () => {
        test('deve buscar dados da venda com sucesso', async () => {
            const mockSale = {
                rows: [{
                    id: 'sale-123',
                    number: 'VD0012024',
                    type: 'sale',
                    client_name: 'Maria Santos',
                    total_amount: 300.00
                }]
            };

            const mockItems = {
                rows: [{
                    product_name: 'Filtro de Óleo',
                    quantity: 1,
                    unit_price: 15.00,
                    total_price: 15.00
                }]
            };

            query.mockResolvedValueOnce(mockSale);
            query.mockResolvedValueOnce(mockItems);

            const result = await PrintingService.getSaleData('sale-123');

            expect(result.number).toBe('VD0012024');
            expect(result.type).toBe('sale');
            expect(result.items).toHaveLength(1);
        });
    });

    describe('formatMatrixReceipt', () => {
        test('deve formatar cupom para impressora matricial', () => {
            const saleData = {
                number: 'VD001',
                sale_date: '2024-01-15',
                client_name: 'João Silva',
                seller_name: 'Vendedor',
                subtotal: 100.00,
                discount_amount: 10.00,
                total_amount: 90.00,
                payment_method: 'cash',
                installments: 1,
                items: [{
                    product_name: 'Produto Teste',
                    quantity: 2,
                    unit_price: 50.00,
                    total_price: 90.00
                }]
            };

            const companyConfig = {
                name: 'Oficina Teste',
                cnpj: '12.345.678/0001-90',
                phone: '(11) 99999-9999'
            };

            const receipt = PrintingService.formatMatrixReceipt(saleData, companyConfig);

            expect(receipt).toContain('Oficina Teste');
            expect(receipt).toContain('CUPOM NAO FISCAL');
            expect(receipt).toContain('VD001');
            expect(receipt).toContain('João Silva');
            expect(receipt).toContain('Produto Teste');
            expect(receipt).toContain('90.00');
        });
    });

    describe('centerText', () => {
        test('deve centralizar texto corretamente', () => {
            const result = PrintingService.centerText('TESTE', 10);
            expect(result).toBe('   TESTE');
        });

        test('deve lidar com texto maior que largura', () => {
            const result = PrintingService.centerText('TEXTO MUITO LONGO', 10);
            expect(result).toBe('TEXTO MUITO LONGO');
        });
    });

    describe('getStatusName', () => {
        test('deve retornar nome correto do status', () => {
            expect(PrintingService.getStatusName('pending')).toBe('Pendente');
            expect(PrintingService.getStatusName('completed')).toBe('Concluído');
            expect(PrintingService.getStatusName('unknown')).toBe('unknown');
        });
    });

    describe('getPaymentMethodName', () => {
        test('deve retornar nome correto do método de pagamento', () => {
            expect(PrintingService.getPaymentMethodName('cash')).toBe('Dinheiro');
            expect(PrintingService.getPaymentMethodName('card')).toBe('Cartão');
            expect(PrintingService.getPaymentMethodName('pix')).toBe('PIX');
            expect(PrintingService.getPaymentMethodName(null)).toBe('Não informado');
        });
    });

    describe('listGeneratedFiles', () => {
        test('deve listar arquivos gerados', async () => {
            const mockFiles = ['OS_001_123.pdf', 'VD_002_456.pdf'];
            const mockStats = {
                size: 1024,
                birthtime: new Date(),
                mtime: new Date()
            };

            fs.readdirSync.mockReturnValue(mockFiles);
            fs.statSync.mockReturnValue(mockStats);

            const files = await PrintingService.listGeneratedFiles(10);

            expect(files).toHaveLength(2);
            expect(files[0].filename).toBe('OS_001_123.pdf');
            expect(files[0].size).toBe(1024);
        });
    });

    describe('cleanupOldFiles', () => {
        test('deve limpar arquivos antigos', async () => {
            const mockFiles = ['old_file.pdf', 'new_file.pdf'];
            const oldDate = new Date();
            oldDate.setDate(oldDate.getDate() - 40);
            const newDate = new Date();

            fs.readdirSync.mockReturnValue(mockFiles);
            fs.statSync
                .mockReturnValueOnce({ birthtime: oldDate })
                .mockReturnValueOnce({ birthtime: newDate });
            fs.unlinkSync.mockReturnValue(true);

            const result = await PrintingService.cleanupOldFiles(30);

            expect(result.deletedCount).toBe(1);
            expect(fs.unlinkSync).toHaveBeenCalledWith(
                expect.stringContaining('old_file.pdf')
            );
        });
    });

    describe('getPrintingStats', () => {
        test('deve obter estatísticas de impressão', async () => {
            const mockFiles = [
                {
                    filename: 'OS_001_123.pdf',
                    size: 1024,
                    createdAt: new Date()
                },
                {
                    filename: 'VD_002_456.pdf',
                    size: 2048,
                    createdAt: new Date()
                }
            ];

            // Mock do método listGeneratedFiles
            jest.spyOn(PrintingService, 'listGeneratedFiles')
                .mockResolvedValue(mockFiles);

            const stats = await PrintingService.getPrintingStats();

            expect(stats.totalFiles).toBe(2);
            expect(stats.totalSize).toBe(3072);
            expect(stats.byType.OS).toEqual({ count: 1, size: 1024 });
            expect(stats.byType.VD).toEqual({ count: 1, size: 2048 });
        });
    });
});