// Sistema de Impressão - Ponto de Entrada
// Sistema de Gestão de Oficina Mecânica de Motos

const PrintingService = require('./services/PrintingService');
const PrintingController = require('./controllers/PrintingController');
const printingRoutes = require('./routes/printingRoutes');
const fs = require('fs');
const path = require('path');

// Função para inicializar sistema de impressão
async function initializePrinting() {
    try {
        console.log('🖨️  Inicializando sistema de impressão...');
        
        // Verificar dependências
        await validatePrintingDependencies();
        
        // Criar diretórios necessários
        ensurePrintingDirectories();
        
        // Configurar limpeza automática
        if (process.env.NODE_ENV === 'production') {
            scheduleAutomaticCleanup();
        }
        
        console.log('✅ Sistema de impressão inicializado com sucesso');
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao inicializar sistema de impressão:', error.message);
        throw error;
    }
}

// Validar dependências do sistema de impressão
async function validatePrintingDependencies() {
    const requiredPackages = ['pdfkit'];
    const missingPackages = [];
    
    for (const pkg of requiredPackages) {
        try {
            require.resolve(pkg);
        } catch (error) {
            missingPackages.push(pkg);
        }
    }
    
    if (missingPackages.length > 0) {
        throw new Error(`Pacotes necessários não encontrados: ${missingPackages.join(', ')}`);
    }
    
    console.log('✅ Dependências de impressão validadas');
}

// Garantir que diretórios necessários existam
function ensurePrintingDirectories() {
    const directories = [
        path.join(__dirname, 'templates'),
        path.join(__dirname, 'output'),
        path.join(__dirname, 'temp')
    ];
    
    directories.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`📁 Diretório criado: ${dir}`);
        }
    });
}

// Agendar limpeza automática de arquivos
function scheduleAutomaticCleanup() {
    // Executar limpeza diariamente às 3h
    const scheduleCleanup = () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(3, 0, 0, 0);
        
        const msUntilTomorrow = tomorrow.getTime() - now.getTime();
        
        setTimeout(() => {
            performAutomaticCleanup();
            // Reagendar para o próximo dia
            setInterval(performAutomaticCleanup, 24 * 60 * 60 * 1000);
        }, msUntilTomorrow);
    };
    
    scheduleCleanup();
    console.log('🗑️  Limpeza automática de arquivos agendada');
}

// Executar limpeza automática
async function performAutomaticCleanup() {
    try {
        console.log('🧹 Executando limpeza automática de arquivos de impressão...');
        
        const result = await PrintingService.cleanupOldFiles(30); // 30 dias
        
        if (result.deletedCount > 0) {
            console.log(`✅ Limpeza concluída: ${result.deletedCount} arquivos removidos`);
        } else {
            console.log('✅ Limpeza concluída: nenhum arquivo antigo encontrado');
        }
        
    } catch (error) {
        console.error('❌ Erro na limpeza automática:', error.message);
    }
}

// Função para gerar documento de forma simplificada
async function quickPrint(type, id, options = {}) {
    try {
        const { format = 'pdf', printerType = 'laser' } = options;
        
        let result;
        
        switch (type.toLowerCase()) {
            case 'service_order':
            case 'os':
                result = await PrintingService.generateServiceOrderPDF(id, { printerType });
                break;
                
            case 'sale':
            case 'venda':
                if (format === 'receipt' || format === 'cupom') {
                    result = await PrintingService.generateNonFiscalReceipt(id, { printerType });
                } else {
                    result = await PrintingService.generateSalePDF(id, { printerType });
                }
                break;
                
            case 'receipt':
            case 'cupom':
                result = await PrintingService.generateNonFiscalReceipt(id, { printerType });
                break;
                
            default:
                throw new Error(`Tipo de documento não suportado: ${type}`);
        }
        
        return result;
        
    } catch (error) {
        throw new Error(`Erro na impressão rápida: ${error.message}`);
    }
}

// Função para obter configurações de impressão
function getPrintingConfig() {
    return {
        supportedFormats: {
            serviceOrder: ['pdf'],
            sale: ['pdf', 'receipt'],
            receipt: ['txt', 'pdf']
        },
        printerTypes: {
            laser: {
                name: 'Impressora Laser/Jato de Tinta',
                description: 'Para documentos em papel A4',
                formats: ['pdf'],
                paperSizes: ['A4', 'Letter'],
                features: ['color', 'duplex', 'highQuality']
            },
            matrix: {
                name: 'Impressora Matricial',
                description: 'Para cupons em papel contínuo (80 colunas)',
                formats: ['txt'],
                paperSizes: ['80mm', '76mm'],
                features: ['continuous', 'carbonCopy']
            },
            thermal: {
                name: 'Impressora Térmica',
                description: 'Para cupons térmicos (58mm/80mm)',
                formats: ['txt'],
                paperSizes: ['58mm', '80mm'],
                features: ['thermal', 'fast', 'quiet']
            }
        },
        templates: {
            serviceOrder: {
                sections: ['header', 'client', 'vehicle', 'description', 'items', 'totals', 'footer'],
                customizable: true
            },
            sale: {
                sections: ['header', 'client', 'items', 'totals', 'payment', 'footer'],
                customizable: true
            },
            receipt: {
                sections: ['header', 'items', 'totals', 'payment', 'footer'],
                customizable: false
            }
        },
        limits: {
            maxFileSize: 10 * 1024 * 1024, // 10MB
            maxFileAge: 30, // dias
            maxFilesPerDay: 1000
        }
    };
}

// Função para validar configuração de impressão
function validatePrintingConfig(config) {
    const errors = [];
    
    if (!config.type || !['service_order', 'sale', 'receipt'].includes(config.type)) {
        errors.push('Tipo de documento inválido');
    }
    
    if (!config.format || !['pdf', 'txt', 'receipt'].includes(config.format)) {
        errors.push('Formato inválido');
    }
    
    if (!config.printerType || !['laser', 'matrix', 'thermal'].includes(config.printerType)) {
        errors.push('Tipo de impressora inválido');
    }
    
    return errors;
}

// Função para obter estatísticas do sistema
async function getPrintingSystemStats() {
    try {
        const [
            serviceStats,
            diskUsage
        ] = await Promise.all([
            PrintingService.getPrintingStats(),
            getDiskUsage()
        ]);
        
        return {
            service: serviceStats,
            disk: diskUsage,
            system: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                version: process.version
            },
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('Erro ao obter estatísticas do sistema:', error.message);
        return null;
    }
}

// Função para obter uso de disco
function getDiskUsage() {
    try {
        const outputPath = path.join(__dirname, 'output');
        
        if (!fs.existsSync(outputPath)) {
            return { used: 0, files: 0 };
        }
        
        const files = fs.readdirSync(outputPath);
        let totalSize = 0;
        
        files.forEach(file => {
            const filePath = path.join(outputPath, file);
            const stats = fs.statSync(filePath);
            totalSize += stats.size;
        });
        
        return {
            used: totalSize,
            files: files.length,
            path: outputPath
        };
        
    } catch (error) {
        return { used: 0, files: 0, error: error.message };
    }
}

// Função para criar template personalizado
function createCustomTemplate(type, template) {
    const templatePath = path.join(__dirname, 'templates', `${type}_custom.json`);
    
    try {
        fs.writeFileSync(templatePath, JSON.stringify(template, null, 2));
        return { success: true, path: templatePath };
    } catch (error) {
        throw new Error(`Erro ao criar template: ${error.message}`);
    }
}

// Função para listar templates disponíveis
function listAvailableTemplates() {
    const templatesPath = path.join(__dirname, 'templates');
    
    try {
        if (!fs.existsSync(templatesPath)) {
            return [];
        }
        
        const files = fs.readdirSync(templatesPath)
            .filter(file => file.endsWith('.json'))
            .map(file => {
                const filePath = path.join(templatesPath, file);
                const stats = fs.statSync(filePath);
                
                return {
                    name: file.replace('.json', ''),
                    path: filePath,
                    size: stats.size,
                    modified: stats.mtime
                };
            });
        
        return files;
        
    } catch (error) {
        console.error('Erro ao listar templates:', error.message);
        return [];
    }
}

// Exportar tudo
module.exports = {
    // Serviços
    PrintingService,
    
    // Controllers
    PrintingController,
    
    // Rotas
    printingRoutes,
    
    // Funções de configuração
    initializePrinting,
    validatePrintingDependencies,
    ensurePrintingDirectories,
    scheduleAutomaticCleanup,
    
    // Funções utilitárias
    quickPrint,
    getPrintingConfig,
    validatePrintingConfig,
    getPrintingSystemStats,
    getDiskUsage,
    
    // Funções de template
    createCustomTemplate,
    listAvailableTemplates,
    
    // Funções de manutenção
    performAutomaticCleanup
};