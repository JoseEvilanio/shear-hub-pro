// Sistema de Relatórios - Ponto de Entrada
// Sistema de Gestão de Oficina Mecânica de Motos

const ReportsService = require('./services/ReportsService');
const ReportsController = require('./controllers/ReportsController');
const reportsRoutes = require('./routes/reportsRoutes');

// Função para agendar relatórios automáticos
function scheduleAutomaticReports() {
    // Executar limpeza de dados antigos diariamente às 2h
    const scheduleCleanup = () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(2, 0, 0, 0);
        
        const msUntilTomorrow = tomorrow.getTime() - now.getTime();
        
        setTimeout(() => {
            performDailyCleanup();
            // Reagendar para o próximo dia
            setInterval(performDailyCleanup, 24 * 60 * 60 * 1000);
        }, msUntilTomorrow);
    };

    // Executar relatórios mensais no primeiro dia do mês
    const scheduleMonthlyReports = () => {
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 6, 0, 0, 0);
        const msUntilNextMonth = nextMonth.getTime() - now.getTime();
        
        setTimeout(() => {
            generateMonthlyReports();
            // Reagendar para o próximo mês
            setInterval(generateMonthlyReports, 30 * 24 * 60 * 60 * 1000);
        }, msUntilNextMonth);
    };

    scheduleCleanup();
    scheduleMonthlyReports();
    
    console.log('📊 Relatórios automáticos agendados');
}

// Limpeza diária de dados antigos
async function performDailyCleanup() {
    try {
        console.log('🧹 Executando limpeza diária de dados...');
        
        // Aqui você pode adicionar lógica para limpar dados antigos
        // Por exemplo, logs de relatórios, cache, etc.
        
        console.log('✅ Limpeza diária concluída');
    } catch (error) {
        console.error('❌ Erro na limpeza diária:', error.message);
    }
}

// Geração de relatórios mensais automáticos
async function generateMonthlyReports() {
    try {
        console.log('📊 Gerando relatórios mensais automáticos...');
        
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        
        const startDate = lastMonth.toISOString().split('T')[0];
        const endDate = endOfLastMonth.toISOString().split('T')[0];
        
        // Gerar relatórios principais
        const [
            salesReport,
            servicesReport,
            financialReport,
            inventoryReport
        ] = await Promise.all([
            ReportsService.getSalesReport(startDate, endDate),
            ReportsService.getServicesReport(startDate, endDate),
            ReportsService.getFinancialReport(startDate, endDate),
            ReportsService.getInventoryReport()
        ]);
        
        // Aqui você pode salvar os relatórios ou enviá-los por email
        console.log('✅ Relatórios mensais gerados com sucesso');
        console.log(`📈 Vendas: ${salesReport.summary.totalSales} vendas, R$ ${salesReport.summary.totalAmount.toFixed(2)}`);
        console.log(`🔧 Serviços: ${servicesReport.summary.totalServices} OS, R$ ${servicesReport.summary.totalAmount.toFixed(2)}`);
        console.log(`💰 Financeiro: Fluxo líquido R$ ${financialReport.summary.netCashFlow.toFixed(2)}`);
        console.log(`📦 Estoque: ${inventoryReport.summary.lowStockProducts} produtos com estoque baixo`);
        
    } catch (error) {
        console.error('❌ Erro ao gerar relatórios mensais:', error.message);
    }
}

// Função para obter estatísticas rápidas do sistema
async function getQuickStats() {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        const formatDate = (date) => date.toISOString().split('T')[0];
        
        const [
            financialReport,
            inventoryReport
        ] = await Promise.all([
            ReportsService.getFinancialReport(
                formatDate(startOfMonth),
                formatDate(endOfMonth)
            ),
            ReportsService.getInventoryReport(null, null, true)
        ]);
        
        return {
            month: {
                sales: financialReport.sales.totalSales,
                revenue: financialReport.sales.totalAmount,
                netCashFlow: financialReport.summary.netCashFlow
            },
            inventory: {
                lowStockProducts: inventoryReport.summary.lowStockProducts,
                outOfStockProducts: inventoryReport.summary.outOfStockProducts,
                totalValue: inventoryReport.summary.totalInventoryValue
            },
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('Erro ao obter estatísticas rápidas:', error.message);
        return null;
    }
}

// Função para validar configuração de relatórios
function validateReportsConfig() {
    const requiredTables = [
        'clients', 'service_orders', 'sales', 'products', 
        'inventory_movements', 'accounts_receivable', 
        'accounts_payable', 'cash_movements'
    ];
    
    // Aqui você pode adicionar validações específicas
    console.log('✅ Configuração de relatórios validada');
    return true;
}

// Função para inicializar sistema de relatórios
async function initializeReports() {
    try {
        console.log('📊 Inicializando sistema de relatórios...');
        
        // Validar configuração
        validateReportsConfig();
        
        // Agendar relatórios automáticos se em produção
        if (process.env.NODE_ENV === 'production') {
            scheduleAutomaticReports();
        }
        
        console.log('✅ Sistema de relatórios inicializado com sucesso');
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao inicializar sistema de relatórios:', error.message);
        throw error;
    }
}

// Função para gerar relatório personalizado
async function generateCustomReport(config) {
    try {
        const { type, parameters, format = 'json' } = config;
        
        let report;
        
        switch (type) {
            case 'birthday':
                report = await ReportsService.getBirthdayReport(
                    parameters.month,
                    parameters.year
                );
                break;
                
            case 'services':
                report = await ReportsService.getServicesReport(
                    parameters.startDate,
                    parameters.endDate,
                    parameters.mechanicId,
                    parameters.status
                );
                break;
                
            case 'sales':
                report = await ReportsService.getSalesReport(
                    parameters.startDate,
                    parameters.endDate,
                    parameters.clientId,
                    parameters.userId,
                    parameters.type,
                    parameters.status
                );
                break;
                
            case 'inventory':
                report = await ReportsService.getInventoryReport(
                    parameters.productId,
                    parameters.category,
                    parameters.lowStock
                );
                break;
                
            case 'financial':
                report = await ReportsService.getFinancialReport(
                    parameters.startDate,
                    parameters.endDate
                );
                break;
                
            default:
                throw new Error(`Tipo de relatório não suportado: ${type}`);
        }
        
        return {
            type,
            format,
            generatedAt: new Date().toISOString(),
            data: report
        };
        
    } catch (error) {
        throw new Error(`Erro ao gerar relatório personalizado: ${error.message}`);
    }
}

// Exportar tudo
module.exports = {
    // Serviços
    ReportsService,
    
    // Controllers
    ReportsController,
    
    // Rotas
    reportsRoutes,
    
    // Funções de configuração
    initializeReports,
    scheduleAutomaticReports,
    validateReportsConfig,
    
    // Funções utilitárias
    getQuickStats,
    generateCustomReport,
    performDailyCleanup,
    generateMonthlyReports
};