// Serviço de Impressão
// Sistema de Gestão de Oficina Mecânica de Motos

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { query } = require('../../database/connection');

class PrintingService {
    constructor() {
        this.templatesPath = path.join(__dirname, '../templates');
        this.outputPath = path.join(__dirname, '../output');
        
        // Criar diretórios se não existirem
        this.ensureDirectories();
        
        // Configurações padrão
        this.defaultConfig = {
            company: {
                name: 'Oficina de Motos',
                cnpj: '',
                address: '',
                phone: '',
                email: ''
            },
            fonts: {
                regular: 'Helvetica',
                bold: 'Helvetica-Bold',
                italic: 'Helvetica-Oblique'
            },
            colors: {
                primary: '#2563eb',
                secondary: '#64748b',
                success: '#16a34a',
                warning: '#d97706',
                danger: '#dc2626'
            }
        };
    }

    // Garantir que diretórios existam
    ensureDirectories() {
        [this.templatesPath, this.outputPath].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    // Obter configurações da empresa
    async getCompanyConfig() {
        try {
            const configs = await query(`
                SELECT key, value 
                FROM system_config 
                WHERE category = 'company' AND is_public = true
            `);

            const companyConfig = { ...this.defaultConfig.company };
            configs.rows.forEach(config => {
                const key = config.key.replace('company_', '');
                companyConfig[key] = config.value || companyConfig[key];
            });

            return companyConfig;
        } catch (error) {
            console.warn('Erro ao obter configurações da empresa:', error.message);
            return this.defaultConfig.company;
        }
    }

    // Gerar PDF de Ordem de Serviço
    async generateServiceOrderPDF(serviceOrderId, options = {}) {
        try {
            // Buscar dados da OS
            const serviceOrderData = await this.getServiceOrderData(serviceOrderId);
            const companyConfig = await this.getCompanyConfig();

            const doc = new PDFDocument({
                size: 'A4',
                margin: 50,
                info: {
                    Title: `Ordem de Serviço ${serviceOrderData.number}`,
                    Author: companyConfig.name,
                    Subject: 'Ordem de Serviço',
                    Creator: 'Sistema de Gestão de Oficina'
                }
            });

            const filename = `OS_${serviceOrderData.number}_${Date.now()}.pdf`;
            const filepath = path.join(this.outputPath, filename);
            
            doc.pipe(fs.createWriteStream(filepath));

            // Cabeçalho da empresa
            this.addCompanyHeader(doc, companyConfig);

            // Título do documento
            doc.fontSize(18)
               .fillColor(this.defaultConfig.colors.primary)
               .text('ORDEM DE SERVIÇO', 50, 150, { align: 'center' })
               .fontSize(14)
               .fillColor('black')
               .text(`Nº ${serviceOrderData.number}`, 50, 175, { align: 'center' });

            // Informações do cliente e veículo
            this.addServiceOrderClientInfo(doc, serviceOrderData, 210);

            // Descrição dos serviços (9 linhas)
            this.addServiceOrderDescription(doc, serviceOrderData, 320);

            // Itens e valores
            this.addServiceOrderItems(doc, serviceOrderData, 480);

            // Rodapé
            this.addServiceOrderFooter(doc, serviceOrderData, companyConfig);

            doc.end();

            return {
                filename,
                filepath,
                type: 'service_order',
                format: 'pdf'
            };

        } catch (error) {
            throw new Error(`Erro ao gerar PDF da OS: ${error.message}`);
        }
    }

    // Gerar PDF de Venda
    async generateSalePDF(saleId, options = {}) {
        try {
            const saleData = await this.getSaleData(saleId);
            const companyConfig = await this.getCompanyConfig();

            const doc = new PDFDocument({
                size: 'A4',
                margin: 50
            });

            const filename = `${saleData.type.toUpperCase()}_${saleData.number}_${Date.now()}.pdf`;
            const filepath = path.join(this.outputPath, filename);
            
            doc.pipe(fs.createWriteStream(filepath));

            // Cabeçalho
            this.addCompanyHeader(doc, companyConfig);

            // Título
            const title = saleData.type === 'sale' ? 'NOTA DE VENDA' : 'ORÇAMENTO';
            doc.fontSize(18)
               .fillColor(this.defaultConfig.colors.primary)
               .text(title, 50, 150, { align: 'center' })
               .fontSize(14)
               .fillColor('black')
               .text(`Nº ${saleData.number}`, 50, 175, { align: 'center' });

            // Informações do cliente
            this.addSaleClientInfo(doc, saleData, 210);

            // Itens da venda
            this.addSaleItems(doc, saleData, 280);

            // Totais e pagamento
            this.addSaleTotals(doc, saleData, 500);

            // Rodapé
            this.addSaleFooter(doc, saleData, companyConfig);

            doc.end();

            return {
                filename,
                filepath,
                type: 'sale',
                format: 'pdf'
            };

        } catch (error) {
            throw new Error(`Erro ao gerar PDF da venda: ${error.message}`);
        }
    }

    // Gerar cupom não fiscal (impressora matricial)
    async generateNonFiscalReceipt(saleId, options = {}) {
        try {
            const saleData = await this.getSaleData(saleId);
            const companyConfig = await this.getCompanyConfig();

            const receipt = this.formatMatrixReceipt(saleData, companyConfig);
            
            const filename = `CUPOM_${saleData.number}_${Date.now()}.txt`;
            const filepath = path.join(this.outputPath, filename);
            
            fs.writeFileSync(filepath, receipt, 'utf8');

            return {
                filename,
                filepath,
                type: 'receipt',
                format: 'txt',
                content: receipt
            };

        } catch (error) {
            throw new Error(`Erro ao gerar cupom: ${error.message}`);
        }
    }

    // Gerar recibo de pagamento
    async generatePaymentReceipt(paymentData, options = {}) {
        try {
            const companyConfig = await this.getCompanyConfig();

            const doc = new PDFDocument({
                size: [400, 600], // Formato de recibo
                margin: 30
            });

            const filename = `RECIBO_${paymentData.id}_${Date.now()}.pdf`;
            const filepath = path.join(this.outputPath, filename);
            
            doc.pipe(fs.createWriteStream(filepath));

            // Cabeçalho simplificado
            doc.fontSize(12)
               .text(companyConfig.name, 30, 30, { align: 'center' })
               .text(companyConfig.address, 30, 50, { align: 'center' })
               .text(`Tel: ${companyConfig.phone}`, 30, 70, { align: 'center' });

            // Título
            doc.fontSize(16)
               .text('RECIBO', 30, 110, { align: 'center' })
               .fontSize(10)
               .text(`Nº ${paymentData.id}`, 30, 135, { align: 'center' });

            // Dados do recibo
            let y = 170;
            doc.fontSize(10)
               .text(`Recebi de: ${paymentData.clientName}`, 30, y)
               .text(`A quantia de: R$ ${paymentData.amount.toFixed(2)}`, 30, y + 20)
               .text(`Referente a: ${paymentData.description}`, 30, y + 40)
               .text(`Data: ${new Date(paymentData.date).toLocaleDateString('pt-BR')}`, 30, y + 60)
               .text(`Forma de pagamento: ${this.getPaymentMethodName(paymentData.paymentMethod)}`, 30, y + 80);

            // Assinatura
            doc.text('_'.repeat(40), 30, y + 140)
               .text('Assinatura', 30, y + 160);

            doc.end();

            return {
                filename,
                filepath,
                type: 'receipt',
                format: 'pdf'
            };

        } catch (error) {
            throw new Error(`Erro ao gerar recibo: ${error.message}`);
        }
    }

    // Buscar dados da OS
    async getServiceOrderData(serviceOrderId) {
        const result = await query(`
            SELECT 
                so.*,
                c.name as client_name,
                c.phone as client_phone,
                c.email as client_email,
                c.address as client_address,
                v.plate as vehicle_plate,
                v.brand as vehicle_brand,
                v.model as vehicle_model,
                v.year as vehicle_year,
                v.color as vehicle_color,
                m.name as mechanic_name,
                u.name as created_by
            FROM service_orders so
            JOIN clients c ON so.client_id = c.id
            JOIN vehicles v ON so.vehicle_id = v.id
            LEFT JOIN mechanics m ON so.mechanic_id = m.id
            LEFT JOIN users u ON so.user_id = u.id
            WHERE so.id = $1
        `, [serviceOrderId]);

        if (result.rows.length === 0) {
            throw new Error('Ordem de serviço não encontrada');
        }

        const serviceOrder = result.rows[0];

        // Buscar itens da OS
        const itemsResult = await query(`
            SELECT 
                soi.*,
                p.name as product_name,
                p.unit as product_unit
            FROM service_order_items soi
            JOIN products p ON soi.product_id = p.id
            WHERE soi.service_order_id = $1
            ORDER BY soi.created_at
        `, [serviceOrderId]);

        serviceOrder.items = itemsResult.rows;
        return serviceOrder;
    }

    // Buscar dados da venda
    async getSaleData(saleId) {
        const result = await query(`
            SELECT 
                s.*,
                c.name as client_name,
                c.phone as client_phone,
                c.email as client_email,
                c.address as client_address,
                u.name as seller_name
            FROM sales s
            LEFT JOIN clients c ON s.client_id = c.id
            LEFT JOIN users u ON s.user_id = u.id
            WHERE s.id = $1
        `, [saleId]);

        if (result.rows.length === 0) {
            throw new Error('Venda não encontrada');
        }

        const sale = result.rows[0];

        // Buscar itens da venda
        const itemsResult = await query(`
            SELECT 
                si.*,
                p.name as product_name,
                p.unit as product_unit
            FROM sale_items si
            JOIN products p ON si.product_id = p.id
            WHERE si.sale_id = $1
            ORDER BY si.created_at
        `, [saleId]);

        sale.items = itemsResult.rows;
        return sale;
    }

    // Adicionar cabeçalho da empresa
    addCompanyHeader(doc, companyConfig) {
        doc.fontSize(16)
           .fillColor(this.defaultConfig.colors.primary)
           .text(companyConfig.name, 50, 50, { align: 'center' });

        if (companyConfig.cnpj) {
            doc.fontSize(10)
               .fillColor('black')
               .text(`CNPJ: ${companyConfig.cnpj}`, 50, 75, { align: 'center' });
        }

        if (companyConfig.address) {
            doc.text(companyConfig.address, 50, 90, { align: 'center' });
        }

        if (companyConfig.phone || companyConfig.email) {
            const contact = [companyConfig.phone, companyConfig.email].filter(Boolean).join(' - ');
            doc.text(contact, 50, 105, { align: 'center' });
        }

        // Linha separadora
        doc.moveTo(50, 130)
           .lineTo(545, 130)
           .stroke();
    }

    // Adicionar informações do cliente na OS
    addServiceOrderClientInfo(doc, data, y) {
        doc.fontSize(12)
           .fillColor(this.defaultConfig.colors.primary)
           .text('DADOS DO CLIENTE', 50, y);

        doc.fontSize(10)
           .fillColor('black')
           .text(`Nome: ${data.client_name}`, 50, y + 20)
           .text(`Telefone: ${data.client_phone || 'Não informado'}`, 50, y + 35)
           .text(`Email: ${data.client_email || 'Não informado'}`, 50, y + 50);

        doc.fontSize(12)
           .fillColor(this.defaultConfig.colors.primary)
           .text('DADOS DO VEÍCULO', 300, y);

        doc.fontSize(10)
           .fillColor('black')
           .text(`Placa: ${data.vehicle_plate}`, 300, y + 20)
           .text(`Marca/Modelo: ${data.vehicle_brand} ${data.vehicle_model}`, 300, y + 35)
           .text(`Ano: ${data.vehicle_year || 'N/I'} - Cor: ${data.vehicle_color || 'N/I'}`, 300, y + 50);

        // Informações da OS
        doc.fontSize(10)
           .text(`Data: ${new Date(data.created_at).toLocaleDateString('pt-BR')}`, 50, y + 75)
           .text(`Status: ${this.getStatusName(data.status)}`, 200, y + 75)
           .text(`Mecânico: ${data.mechanic_name || 'Não atribuído'}`, 350, y + 75);
    }

    // Adicionar descrição dos serviços (9 linhas)
    addServiceOrderDescription(doc, data, y) {
        doc.fontSize(12)
           .fillColor(this.defaultConfig.colors.primary)
           .text('DESCRIÇÃO DOS SERVIÇOS', 50, y);

        const descriptions = [
            data.description_line_1,
            data.description_line_2,
            data.description_line_3,
            data.description_line_4,
            data.description_line_5,
            data.description_line_6,
            data.description_line_7,
            data.description_line_8,
            data.description_line_9
        ];

        doc.fontSize(10)
           .fillColor('black');

        descriptions.forEach((desc, index) => {
            const lineY = y + 20 + (index * 15);
            doc.text(`${index + 1}. ${desc || ''}`, 50, lineY);
        });
    }

    // Adicionar itens da OS
    addServiceOrderItems(doc, data, y) {
        if (data.items && data.items.length > 0) {
            doc.fontSize(12)
               .fillColor(this.defaultConfig.colors.primary)
               .text('PEÇAS E MATERIAIS UTILIZADOS', 50, y);

            // Cabeçalho da tabela
            doc.fontSize(9)
               .fillColor('black')
               .text('Item', 50, y + 25)
               .text('Qtd', 350, y + 25)
               .text('Valor Unit.', 400, y + 25)
               .text('Total', 480, y + 25);

            // Linha do cabeçalho
            doc.moveTo(50, y + 40)
               .lineTo(545, y + 40)
               .stroke();

            let itemY = y + 50;
            data.items.forEach((item, index) => {
                doc.text(item.product_name, 50, itemY)
                   .text(item.quantity.toString(), 350, itemY)
                   .text(`R$ ${parseFloat(item.unit_price).toFixed(2)}`, 400, itemY)
                   .text(`R$ ${parseFloat(item.total_price).toFixed(2)}`, 480, itemY);
                itemY += 15;
            });
        }

        // Totais
        const totalsY = y + 120;
        doc.fontSize(10)
           .text(`Mão de obra: R$ ${parseFloat(data.labor_amount || 0).toFixed(2)}`, 350, totalsY)
           .text(`Peças: R$ ${parseFloat(data.parts_amount || 0).toFixed(2)}`, 350, totalsY + 15)
           .text(`Desconto: R$ ${parseFloat(data.discount_amount || 0).toFixed(2)}`, 350, totalsY + 30);

        doc.fontSize(12)
           .fillColor(this.defaultConfig.colors.primary)
           .text(`TOTAL: R$ ${parseFloat(data.total_amount || 0).toFixed(2)}`, 350, totalsY + 50);
    }

    // Adicionar rodapé da OS
    addServiceOrderFooter(doc, data, companyConfig) {
        const footerY = 700;
        
        doc.fontSize(8)
           .fillColor('black')
           .text('Declaro que os serviços foram executados conforme descrito acima.', 50, footerY)
           .text('_'.repeat(30) + '    ' + '_'.repeat(30), 50, footerY + 30)
           .text('Assinatura do Cliente', 50, footerY + 45)
           .text('Assinatura do Responsável', 300, footerY + 45);

        // Informações adicionais
        if (companyConfig.phone) {
            doc.text(`Dúvidas? Ligue: ${companyConfig.phone}`, 50, footerY + 70, { align: 'center' });
        }
    }

    // Adicionar informações do cliente na venda
    addSaleClientInfo(doc, data, y) {
        doc.fontSize(12)
           .fillColor(this.defaultConfig.colors.primary)
           .text('DADOS DO CLIENTE', 50, y);

        doc.fontSize(10)
           .fillColor('black')
           .text(`Nome: ${data.client_name || 'Cliente não identificado'}`, 50, y + 20)
           .text(`Telefone: ${data.client_phone || 'Não informado'}`, 50, y + 35);

        doc.text(`Data: ${new Date(data.sale_date).toLocaleDateString('pt-BR')}`, 350, y + 20)
           .text(`Vendedor: ${data.seller_name || 'Sistema'}`, 350, y + 35);
    }

    // Adicionar itens da venda
    addSaleItems(doc, data, y) {
        doc.fontSize(12)
           .fillColor(this.defaultConfig.colors.primary)
           .text('ITENS', 50, y);

        // Cabeçalho da tabela
        doc.fontSize(9)
           .fillColor('black')
           .text('Produto', 50, y + 25)
           .text('Qtd', 300, y + 25)
           .text('Valor Unit.', 350, y + 25)
           .text('Desconto', 420, y + 25)
           .text('Total', 480, y + 25);

        // Linha do cabeçalho
        doc.moveTo(50, y + 40)
           .lineTo(545, y + 40)
           .stroke();

        let itemY = y + 50;
        data.items.forEach((item) => {
            doc.text(item.product_name, 50, itemY)
               .text(item.quantity.toString(), 300, itemY)
               .text(`R$ ${parseFloat(item.unit_price).toFixed(2)}`, 350, itemY)
               .text(`R$ ${parseFloat(item.discount_amount || 0).toFixed(2)}`, 420, itemY)
               .text(`R$ ${parseFloat(item.total_price).toFixed(2)}`, 480, itemY);
            itemY += 15;
        });
    }

    // Adicionar totais da venda
    addSaleTotals(doc, data, y) {
        doc.fontSize(10)
           .fillColor('black')
           .text(`Subtotal: R$ ${parseFloat(data.subtotal || 0).toFixed(2)}`, 350, y)
           .text(`Desconto: R$ ${parseFloat(data.discount_amount || 0).toFixed(2)}`, 350, y + 15);

        doc.fontSize(14)
           .fillColor(this.defaultConfig.colors.primary)
           .text(`TOTAL: R$ ${parseFloat(data.total_amount || 0).toFixed(2)}`, 350, y + 35);

        doc.fontSize(10)
           .fillColor('black')
           .text(`Forma de pagamento: ${this.getPaymentMethodName(data.payment_method)}`, 50, y + 60);

        if (data.installments > 1) {
            doc.text(`Parcelado em: ${data.installments}x`, 50, y + 75);
        }
    }

    // Adicionar rodapé da venda
    addSaleFooter(doc, data, companyConfig) {
        const footerY = 650;
        
        if (data.type === 'quote') {
            doc.fontSize(10)
               .fillColor(this.defaultConfig.colors.warning)
               .text('ORÇAMENTO - Válido por 30 dias', 50, footerY, { align: 'center' });
        }

        doc.fontSize(8)
           .fillColor('black')
           .text('Obrigado pela preferência!', 50, footerY + 30, { align: 'center' });
    }

    // Formatar cupom para impressora matricial (80 colunas)
    formatMatrixReceipt(saleData, companyConfig) {
        const line = '='.repeat(48);
        const halfLine = '-'.repeat(48);
        
        let receipt = '';
        
        // Cabeçalho
        receipt += this.centerText(companyConfig.name, 48) + '\n';
        if (companyConfig.cnpj) {
            receipt += this.centerText(`CNPJ: ${companyConfig.cnpj}`, 48) + '\n';
        }
        if (companyConfig.address) {
            receipt += this.centerText(companyConfig.address, 48) + '\n';
        }
        if (companyConfig.phone) {
            receipt += this.centerText(`Tel: ${companyConfig.phone}`, 48) + '\n';
        }
        
        receipt += line + '\n';
        receipt += this.centerText('CUPOM NAO FISCAL', 48) + '\n';
        receipt += this.centerText(`Nº ${saleData.number}`, 48) + '\n';
        receipt += line + '\n';
        
        // Data e vendedor
        receipt += `Data: ${new Date(saleData.sale_date).toLocaleDateString('pt-BR')}\n`;
        receipt += `Vendedor: ${saleData.seller_name || 'Sistema'}\n`;
        
        if (saleData.client_name) {
            receipt += `Cliente: ${saleData.client_name}\n`;
        }
        
        receipt += halfLine + '\n';
        
        // Itens
        receipt += 'ITEM                     QTD  VL.UNIT   TOTAL\n';
        receipt += halfLine + '\n';
        
        saleData.items.forEach(item => {
            const name = item.product_name.substring(0, 20).padEnd(20);
            const qty = item.quantity.toString().padStart(4);
            const price = parseFloat(item.unit_price).toFixed(2).padStart(8);
            const total = parseFloat(item.total_price).toFixed(2).padStart(8);
            
            receipt += `${name} ${qty} ${price} ${total}\n`;
        });
        
        receipt += halfLine + '\n';
        
        // Totais
        receipt += `Subtotal:${parseFloat(saleData.subtotal || 0).toFixed(2).padStart(32)}\n`;
        if (parseFloat(saleData.discount_amount || 0) > 0) {
            receipt += `Desconto:${parseFloat(saleData.discount_amount).toFixed(2).padStart(32)}\n`;
        }
        receipt += `TOTAL:   ${parseFloat(saleData.total_amount).toFixed(2).padStart(32)}\n`;
        
        receipt += halfLine + '\n';
        
        // Pagamento
        receipt += `Pagamento: ${this.getPaymentMethodName(saleData.payment_method)}\n`;
        if (saleData.installments > 1) {
            receipt += `Parcelado em: ${saleData.installments}x\n`;
        }
        
        receipt += line + '\n';
        receipt += this.centerText('Obrigado pela preferencia!', 48) + '\n';
        receipt += line + '\n';
        
        // Espaços para corte
        receipt += '\n\n\n';
        
        return receipt;
    }

    // Centralizar texto
    centerText(text, width) {
        const padding = Math.max(0, Math.floor((width - text.length) / 2));
        return ' '.repeat(padding) + text;
    }

    // Obter nome do status
    getStatusName(status) {
        const statusNames = {
            'pending': 'Pendente',
            'in_progress': 'Em Andamento',
            'waiting_parts': 'Aguardando Peças',
            'completed': 'Concluído',
            'delivered': 'Entregue',
            'cancelled': 'Cancelado'
        };
        return statusNames[status] || status;
    }

    // Obter nome do método de pagamento
    getPaymentMethodName(method) {
        const methodNames = {
            'cash': 'Dinheiro',
            'card': 'Cartão',
            'pix': 'PIX',
            'installment': 'Parcelado'
        };
        return methodNames[method] || method || 'Não informado';
    }

    // Listar arquivos gerados
    async listGeneratedFiles(limit = 50) {
        try {
            const files = fs.readdirSync(this.outputPath)
                .map(filename => {
                    const filepath = path.join(this.outputPath, filename);
                    const stats = fs.statSync(filepath);
                    return {
                        filename,
                        filepath,
                        size: stats.size,
                        createdAt: stats.birthtime,
                        modifiedAt: stats.mtime
                    };
                })
                .sort((a, b) => b.createdAt - a.createdAt)
                .slice(0, limit);

            return files;
        } catch (error) {
            throw new Error(`Erro ao listar arquivos: ${error.message}`);
        }
    }

    // Limpar arquivos antigos
    async cleanupOldFiles(daysOld = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const files = fs.readdirSync(this.outputPath);
            let deletedCount = 0;

            files.forEach(filename => {
                const filepath = path.join(this.outputPath, filename);
                const stats = fs.statSync(filepath);
                
                if (stats.birthtime < cutoffDate) {
                    fs.unlinkSync(filepath);
                    deletedCount++;
                }
            });

            return { deletedCount, cutoffDate };
        } catch (error) {
            throw new Error(`Erro na limpeza de arquivos: ${error.message}`);
        }
    }

    // Obter estatísticas de impressão
    async getPrintingStats() {
        try {
            const files = await this.listGeneratedFiles(1000);
            
            const stats = {
                totalFiles: files.length,
                totalSize: files.reduce((sum, file) => sum + file.size, 0),
                byType: {},
                byDate: {},
                recentFiles: files.slice(0, 10)
            };

            // Agrupar por tipo
            files.forEach(file => {
                const type = file.filename.split('_')[0];
                if (!stats.byType[type]) {
                    stats.byType[type] = { count: 0, size: 0 };
                }
                stats.byType[type].count++;
                stats.byType[type].size += file.size;
            });

            // Agrupar por data (últimos 7 dias)
            files.forEach(file => {
                const date = file.createdAt.toISOString().split('T')[0];
                if (!stats.byDate[date]) {
                    stats.byDate[date] = { count: 0, size: 0 };
                }
                stats.byDate[date].count++;
                stats.byDate[date].size += file.size;
            });

            return stats;
        } catch (error) {
            throw new Error(`Erro ao obter estatísticas: ${error.message}`);
        }
    }
}

module.exports = new PrintingService();