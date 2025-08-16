// Controller de Impressão
// Sistema de Gestão de Oficina Mecânica de Motos

const PrintingService = require('../services/PrintingService');
const fs = require('fs');
const path = require('path');

class PrintingController {
    // Imprimir Ordem de Serviço
    async printServiceOrder(req, res) {
        try {
            const { id } = req.params;
            const { format = 'pdf', printerType = 'laser' } = req.query;

            if (!id) {
                return res.status(400).json({
                    error: 'ID da ordem de serviço é obrigatório',
                    code: 'MISSING_SERVICE_ORDER_ID'
                });
            }

            let result;

            switch (format.toLowerCase()) {
                case 'pdf':
                    result = await PrintingService.generateServiceOrderPDF(id, { printerType });
                    break;
                default:
                    return res.status(400).json({
                        error: 'Formato não suportado',
                        code: 'UNSUPPORTED_FORMAT'
                    });
            }

            res.json({
                message: 'Ordem de serviço gerada com sucesso',
                data: result
            });

        } catch (error) {
            res.status(400).json({
                error: error.message,
                code: 'SERVICE_ORDER_PRINT_FAILED'
            });
        }
    }

    // Imprimir Venda/Orçamento
    async printSale(req, res) {
        try {
            const { id } = req.params;
            const { format = 'pdf', printerType = 'laser' } = req.query;

            if (!id) {
                return res.status(400).json({
                    error: 'ID da venda é obrigatório',
                    code: 'MISSING_SALE_ID'
                });
            }

            let result;

            switch (format.toLowerCase()) {
                case 'pdf':
                    result = await PrintingService.generateSalePDF(id, { printerType });
                    break;
                case 'receipt':
                case 'cupom':
                    result = await PrintingService.generateNonFiscalReceipt(id, { printerType });
                    break;
                default:
                    return res.status(400).json({
                        error: 'Formato não suportado',
                        code: 'UNSUPPORTED_FORMAT'
                    });
            }

            res.json({
                message: 'Documento de venda gerado com sucesso',
                data: result
            });

        } catch (error) {
            res.status(400).json({
                error: error.message,
                code: 'SALE_PRINT_FAILED'
            });
        }
    }

    // Gerar cupom não fiscal
    async generateReceipt(req, res) {
        try {
            const { id } = req.params;
            const { printerType = 'matrix' } = req.query;

            if (!id) {
                return res.status(400).json({
                    error: 'ID da venda é obrigatório',
                    code: 'MISSING_SALE_ID'
                });
            }

            const result = await PrintingService.generateNonFiscalReceipt(id, { printerType });

            // Se for requisição para visualizar o conteúdo
            if (req.query.preview === 'true') {
                res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                res.send(result.content);
                return;
            }

            res.json({
                message: 'Cupom não fiscal gerado com sucesso',
                data: result
            });

        } catch (error) {
            res.status(400).json({
                error: error.message,
                code: 'RECEIPT_GENERATION_FAILED'
            });
        }
    }

    // Gerar recibo de pagamento
    async generatePaymentReceipt(req, res) {
        try {
            const paymentData = req.body;

            // Validar dados obrigatórios
            const requiredFields = ['id', 'clientName', 'amount', 'description', 'date'];
            const missingFields = requiredFields.filter(field => !paymentData[field]);

            if (missingFields.length > 0) {
                return res.status(400).json({
                    error: `Campos obrigatórios: ${missingFields.join(', ')}`,
                    code: 'MISSING_PAYMENT_DATA'
                });
            }

            const result = await PrintingService.generatePaymentReceipt(paymentData);

            res.json({
                message: 'Recibo de pagamento gerado com sucesso',
                data: result
            });

        } catch (error) {
            res.status(400).json({
                error: error.message,
                code: 'PAYMENT_RECEIPT_FAILED'
            });
        }
    }

    // Download de arquivo gerado
    async downloadFile(req, res) {
        try {
            const { filename } = req.params;

            if (!filename) {
                return res.status(400).json({
                    error: 'Nome do arquivo é obrigatório',
                    code: 'MISSING_FILENAME'
                });
            }

            const filepath = path.join(PrintingService.outputPath, filename);

            // Verificar se arquivo existe
            if (!fs.existsSync(filepath)) {
                return res.status(404).json({
                    error: 'Arquivo não encontrado',
                    code: 'FILE_NOT_FOUND'
                });
            }

            // Determinar tipo de conteúdo
            const ext = path.extname(filename).toLowerCase();
            let contentType = 'application/octet-stream';
            
            switch (ext) {
                case '.pdf':
                    contentType = 'application/pdf';
                    break;
                case '.txt':
                    contentType = 'text/plain; charset=utf-8';
                    break;
            }

            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            
            const fileStream = fs.createReadStream(filepath);
            fileStream.pipe(res);

        } catch (error) {
            res.status(500).json({
                error: error.message,
                code: 'FILE_DOWNLOAD_FAILED'
            });
        }
    }

    // Visualizar arquivo no navegador
    async viewFile(req, res) {
        try {
            const { filename } = req.params;

            if (!filename) {
                return res.status(400).json({
                    error: 'Nome do arquivo é obrigatório',
                    code: 'MISSING_FILENAME'
                });
            }

            const filepath = path.join(PrintingService.outputPath, filename);

            if (!fs.existsSync(filepath)) {
                return res.status(404).json({
                    error: 'Arquivo não encontrado',
                    code: 'FILE_NOT_FOUND'
                });
            }

            const ext = path.extname(filename).toLowerCase();
            let contentType = 'application/octet-stream';
            
            switch (ext) {
                case '.pdf':
                    contentType = 'application/pdf';
                    break;
                case '.txt':
                    contentType = 'text/plain; charset=utf-8';
                    break;
            }

            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
            
            const fileStream = fs.createReadStream(filepath);
            fileStream.pipe(res);

        } catch (error) {
            res.status(500).json({
                error: error.message,
                code: 'FILE_VIEW_FAILED'
            });
        }
    }

    // Listar arquivos gerados
    async listFiles(req, res) {
        try {
            const { limit = 50, type } = req.query;

            let files = await PrintingService.listGeneratedFiles(parseInt(limit));

            // Filtrar por tipo se especificado
            if (type) {
                files = files.filter(file => file.filename.toLowerCase().startsWith(type.toLowerCase()));
            }

            res.json({
                message: 'Arquivos listados com sucesso',
                data: {
                    files,
                    total: files.length
                }
            });

        } catch (error) {
            res.status(500).json({
                error: error.message,
                code: 'FILES_LIST_FAILED'
            });
        }
    }

    // Obter estatísticas de impressão
    async getStats(req, res) {
        try {
            const stats = await PrintingService.getPrintingStats();

            res.json({
                message: 'Estatísticas obtidas com sucesso',
                data: stats
            });

        } catch (error) {
            res.status(500).json({
                error: error.message,
                code: 'STATS_FAILED'
            });
        }
    }

    // Limpar arquivos antigos
    async cleanupFiles(req, res) {
        try {
            const { days = 30 } = req.query;

            const result = await PrintingService.cleanupOldFiles(parseInt(days));

            res.json({
                message: 'Limpeza de arquivos concluída',
                data: result
            });

        } catch (error) {
            res.status(500).json({
                error: error.message,
                code: 'CLEANUP_FAILED'
            });
        }
    }

    // Deletar arquivo específico
    async deleteFile(req, res) {
        try {
            const { filename } = req.params;

            if (!filename) {
                return res.status(400).json({
                    error: 'Nome do arquivo é obrigatório',
                    code: 'MISSING_FILENAME'
                });
            }

            const filepath = path.join(PrintingService.outputPath, filename);

            if (!fs.existsSync(filepath)) {
                return res.status(404).json({
                    error: 'Arquivo não encontrado',
                    code: 'FILE_NOT_FOUND'
                });
            }

            fs.unlinkSync(filepath);

            res.json({
                message: 'Arquivo deletado com sucesso',
                data: { filename }
            });

        } catch (error) {
            res.status(500).json({
                error: error.message,
                code: 'FILE_DELETE_FAILED'
            });
        }
    }

    // Obter configurações de impressão
    async getPrintingConfig(req, res) {
        try {
            const config = {
                supportedFormats: {
                    serviceOrder: ['pdf'],
                    sale: ['pdf', 'receipt'],
                    receipt: ['txt', 'pdf']
                },
                printerTypes: {
                    laser: {
                        name: 'Impressora Laser/Jato de Tinta',
                        description: 'Para documentos em papel A4',
                        formats: ['pdf']
                    },
                    matrix: {
                        name: 'Impressora Matricial',
                        description: 'Para cupons em papel contínuo (80 colunas)',
                        formats: ['txt']
                    },
                    thermal: {
                        name: 'Impressora Térmica',
                        description: 'Para cupons térmicos (58mm/80mm)',
                        formats: ['txt']
                    }
                },
                outputPath: PrintingService.outputPath,
                maxFileAge: 30, // dias
                maxFileSize: 10 * 1024 * 1024 // 10MB
            };

            res.json({
                message: 'Configurações de impressão obtidas',
                data: config
            });

        } catch (error) {
            res.status(500).json({
                error: error.message,
                code: 'CONFIG_FAILED'
            });
        }
    }

    // Testar impressão
    async testPrint(req, res) {
        try {
            const { type = 'receipt', printerType = 'matrix' } = req.body;

            const testData = {
                id: 'TEST-' + Date.now(),
                number: 'TEST001',
                type: 'sale',
                sale_date: new Date(),
                client_name: 'Cliente Teste',
                seller_name: 'Vendedor Teste',
                subtotal: 100.00,
                discount_amount: 10.00,
                total_amount: 90.00,
                payment_method: 'cash',
                installments: 1,
                items: [
                    {
                        product_name: 'Produto Teste',
                        quantity: 2,
                        unit_price: 50.00,
                        discount_amount: 10.00,
                        total_price: 90.00
                    }
                ]
            };

            let result;

            switch (type) {
                case 'receipt':
                    result = await PrintingService.formatMatrixReceipt(
                        testData, 
                        await PrintingService.getCompanyConfig()
                    );
                    
                    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                    res.send(result);
                    return;

                case 'pdf':
                    // Para teste de PDF, retornar apenas confirmação
                    result = {
                        message: 'Teste de PDF seria gerado aqui',
                        data: testData
                    };
                    break;

                default:
                    return res.status(400).json({
                        error: 'Tipo de teste não suportado',
                        code: 'UNSUPPORTED_TEST_TYPE'
                    });
            }

            res.json({
                message: 'Teste de impressão executado',
                data: result
            });

        } catch (error) {
            res.status(500).json({
                error: error.message,
                code: 'TEST_PRINT_FAILED'
            });
        }
    }
}

module.exports = new PrintingController();