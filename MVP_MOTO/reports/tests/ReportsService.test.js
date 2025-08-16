// Testes do Serviço de Relatórios
// Sistema de Gestão de Oficina Mecânica de Motos

const ReportsService = require('../services/ReportsService');
const { query } = require('../../database/connection');

// Mock do banco de dados
jest.mock('../../database/connection');

describe('ReportsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getBirthdayReport', () => {
        test('deve gerar relatório de aniversariantes sem filtros', async () => {
            const mockResult = {
                rows: [
                    {
                        id: 'client-1',
                        name: 'João Silva',
                        phone: '11999999999',
                        email: 'joao@email.com',
                        birth_date: '1985-03-15',
                        day: 15,
                        month: 3,
                        birth_year: 1985,
                        age: 38,
                        total_service_orders: 5,
                        total_spent: 1500.00
                    }
                ]
            };

            query.mockResolvedValue(mockResult);

            const result = await ReportsService.getBirthdayReport();

            expect(result.summary.totalClients).toBe(1);
            expect(result.data).toHaveLength(1);
            expect(result.data[0].monthName).toBe('Março');
        });

        test('deve filtrar por mês específico', async () => {
            query.mockResolvedValue({ rows: [] });

            await ReportsService.getBirthdayReport(3);

            expect(query).toHaveBeenCalledWith(
                expect.stringContaining('EXTRACT(MONTH FROM c.birth_date) = $1'),
                [3]
            );
        });
    });

    describe('getServicesReport', () => {
        test('deve gerar relatório de serviços', async () => {
            const mockResult = {
                rows: [
                    {
                        id: 'so-1',
                        number: 'OS0012023',
                        status: 'completed',
                        total_amount: 250.00,
                        client_name: 'João Silva',
                        mechanic_name: 'Pedro'
                    }
                ]
            };

            query.mockResolvedValue(mockResult);

            const result = await ReportsService.getServicesReport('2023-01-01', '2023-01-31');

            expect(result.summary.totalServices).toBe(1);
            expect(result.summary.totalAmount).toBe(250.00);
        });
    });

    describe('validateDateRange', () => {
        test('deve validar datas válidas', () => {
            expect(() => {
                ReportsService.validateDateRange('2023-01-01', '2023-01-31');
            }).not.toThrow();
        });

        test('deve rejeitar datas inválidas', () => {
            expect(() => {
                ReportsService.validateDateRange('invalid-date', '2023-01-31');
            }).toThrow('Datas inválidas fornecidas');
        });

        test('deve rejeitar período muito longo', () => {
            expect(() => {
                ReportsService.validateDateRange('2020-01-01', '2023-01-01');
            }).toThrow('Período máximo permitido é de 1 ano');
        });
    });

    describe('getMonthName', () => {
        test('deve retornar nome correto do mês', () => {
            expect(ReportsService.getMonthName(1)).toBe('Janeiro');
            expect(ReportsService.getMonthName(12)).toBe('Dezembro');
        });

        test('deve retornar erro para mês inválido', () => {
            expect(ReportsService.getMonthName(13)).toBe('Mês inválido');
        });
    });
});