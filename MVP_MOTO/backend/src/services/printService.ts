// Serviço de Impressão
// Sistema de Gestão de Oficina Mecânica de Motos

import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

interface PrintOptions {
  printerType: 'thermal' | 'laser' | 'inkjet' | 'matrix';
  paperSize: 'A4' | '80mm' | '58mm';
  copies?: number;
  orientation?: 'portrait' | 'landscape';
}

interface ServiceOrderPrintData {
  orderNumber: string;
  clientName: string;
  clientPhone: string;
  vehicleInfo: string;
  mechanicName: string;
  description: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  laborCost: number;
  partsCost: number;
  totalAmount: number;
  createdAt: string;
  estimatedCompletion?: string;
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    cnpj?: string;
  };
}

interface SalePrintData {
  saleNumber: string;
  clientName: string;
  clientCpf?: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    cnpj?: string;
  };
}

class PrintService {
  // Imprimir ordem de serviço
  async printServiceOrder(
    data: ServiceOrderPrintData,
    options: PrintOptions = { printerType: 'laser', paperSize: 'A4' }
  ): Promise<Buffer> {
    switch (options.printerType) {
      case 'thermal':
        return this.printServiceOrderThermal(data, options);
      case 'matrix':
        return this.printServiceOrderMatrix(data, options);
      default:
        return this.printServiceOrderPDF(data, options);
    }
  }

  // Imprimir venda/cupom
  async printSale(
    data: SalePrintData,
    options: PrintOptions = { printerType: 'thermal', paperSize: '80mm' }
  ): Promise<Buffer> {
    switch (options.printerType) {
      case 'thermal':
        return this.printSaleThermal(data, options);
      case 'matrix':
        return this.printSaleMatrix(data, options);
      default:
        return this.printSalePDF(data, options);
    }
  }

  // Imprimir OS em PDF (laser/jato de tinta)
  private async printServiceOrderPDF(
    data: ServiceOrderPrintData,
    options: PrintOptions
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: options.paperSize === 'A4' ? 'A4' : [226, 842], // 80mm width
        margin: 40,
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc.fontSize(18).font('Helvetica-Bold');
      doc.text(data.companyInfo.name, { align: 'center' });
      
      doc.fontSize(10).font('Helvetica');
      doc.text(data.companyInfo.address, { align: 'center' });
      doc.text(`Tel: ${data.companyInfo.phone}`, { align: 'center' });
      if (data.companyInfo.cnpj) {
        doc.text(`CNPJ: ${data.companyInfo.cnpj}`, { align: 'center' });
      }

      doc.moveDown(2);

      // Título
      doc.fontSize(16).font('Helvetica-Bold');
      doc.text('ORDEM DE SERVIÇO', { align: 'center' });
      
      doc.moveDown(1);

      // Informações da OS
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text(`OS Nº: ${data.orderNumber}`, 40, doc.y);
      doc.text(`Data: ${new Date(data.createdAt).toLocaleDateString('pt-BR')}`, 300, doc.y - 15);

      doc.moveDown(1);

      // Dados do cliente
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('DADOS DO CLIENTE:', 40, doc.y);
      doc.font('Helvetica');
      doc.text(`Nome: ${data.clientName}`);
      doc.text(`Telefone: ${data.clientPhone}`);

      doc.moveDown(1);

      // Dados do veículo
      doc.font('Helvetica-Bold');
      doc.text('DADOS DO VEÍCULO:');
      doc.font('Helvetica');
      doc.text(`Veículo: ${data.vehicleInfo}`);

      doc.moveDown(1);

      // Mecânico responsável
      doc.font('Helvetica-Bold');
      doc.text('MECÂNICO RESPONSÁVEL:');
      doc.font('Helvetica');
      doc.text(`Nome: ${data.mechanicName}`);
      if (data.estimatedCompletion) {
        doc.text(`Previsão: ${new Date(data.estimatedCompletion).toLocaleDateString('pt-BR')}`);
      }

      doc.moveDown(1);

      // Descrição do serviço
      doc.font('Helvetica-Bold');
      doc.text('DESCRIÇÃO DO SERVIÇO:');
      doc.font('Helvetica');
      doc.text(data.description, { width: 500 });

      doc.moveDown(1);

      // Itens/Peças utilizadas
      if (data.items.length > 0) {
        doc.font('Helvetica-Bold');
        doc.text('PEÇAS UTILIZADAS:');
        
        // Cabeçalho da tabela
        const tableTop = doc.y + 10;
        doc.text('Item', 40, tableTop);
        doc.text('Qtd', 300, tableTop);
        doc.text('Valor Unit.', 350, tableTop);
        doc.text('Total', 450, tableTop);
        
        // Linha separadora
        doc.moveTo(40, tableTop + 15).lineTo(520, tableTop + 15).stroke();
        
        let currentY = tableTop + 25;
        doc.font('Helvetica');
        
        data.items.forEach(item => {
          doc.text(item.productName, 40, currentY, { width: 250 });
          doc.text(item.quantity.toString(), 300, currentY);
          doc.text(`R$ ${item.unitPrice.toFixed(2)}`, 350, currentY);
          doc.text(`R$ ${item.totalPrice.toFixed(2)}`, 450, currentY);
          currentY += 20;
        });
        
        doc.moveDown(2);
      }

      // Valores
      const valuesY = doc.y + 20;
      doc.font('Helvetica-Bold');
      doc.text('VALORES:', 40, valuesY);
      
      doc.font('Helvetica');
      doc.text(`Mão de obra: R$ ${data.laborCost.toFixed(2)}`, 40, valuesY + 20);
      doc.text(`Peças: R$ ${data.partsCost.toFixed(2)}`, 40, valuesY + 40);
      
      // Total
      doc.fontSize(14).font('Helvetica-Bold');
      doc.text(`TOTAL: R$ ${data.totalAmount.toFixed(2)}`, 40, valuesY + 70);

      // Assinaturas
      const signatureY = doc.page.height - 150;
      doc.fontSize(10).font('Helvetica');
      doc.text('_________________________', 40, signatureY);
      doc.text('Assinatura do Cliente', 40, signatureY + 20);
      
      doc.text('_________________________', 300, signatureY);
      doc.text('Assinatura do Responsável', 300, signatureY + 20);

      doc.end();
    });
  }

  // Imprimir venda em PDF
  private async printSalePDF(
    data: SalePrintData,
    options: PrintOptions
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: options.paperSize === 'A4' ? 'A4' : [226, 842],
        margin: 20,
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc.fontSize(14).font('Helvetica-Bold');
      doc.text(data.companyInfo.name, { align: 'center' });
      
      doc.fontSize(8).font('Helvetica');
      doc.text(data.companyInfo.address, { align: 'center' });
      doc.text(`Tel: ${data.companyInfo.phone}`, { align: 'center' });
      if (data.companyInfo.cnpj) {
        doc.text(`CNPJ: ${data.companyInfo.cnpj}`, { align: 'center' });
      }

      doc.moveDown(1);

      // Título
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('CUPOM NÃO FISCAL', { align: 'center' });
      
      doc.moveDown(0.5);

      // Informações da venda
      doc.fontSize(8).font('Helvetica');
      doc.text(`Venda: ${data.saleNumber}`);
      doc.text(`Data: ${new Date(data.createdAt).toLocaleString('pt-BR')}`);
      doc.text(`Cliente: ${data.clientName}`);
      if (data.clientCpf) {
        doc.text(`CPF: ${data.clientCpf}`);
      }

      doc.moveDown(0.5);

      // Linha separadora
      doc.text('----------------------------------------');

      // Itens
      data.items.forEach(item => {
        doc.text(`${item.productName}`);
        doc.text(`${item.quantity} x R$ ${item.unitPrice.toFixed(2)} = R$ ${item.totalPrice.toFixed(2)}`);
      });

      doc.text('----------------------------------------');

      // Totais
      doc.text(`Subtotal: R$ ${data.subtotal.toFixed(2)}`);
      if (data.discountAmount > 0) {
        doc.text(`Desconto: R$ ${data.discountAmount.toFixed(2)}`);
      }
      
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text(`TOTAL: R$ ${data.totalAmount.toFixed(2)}`);

      doc.fontSize(8).font('Helvetica');
      doc.text(`Pagamento: ${data.paymentMethod}`);

      doc.moveDown(1);
      doc.text('Obrigado pela preferência!', { align: 'center' });

      doc.end();
    });
  }

  // Imprimir OS para impressora térmica
  private async printServiceOrderThermal(
    data: ServiceOrderPrintData,
    options: PrintOptions
  ): Promise<Buffer> {
    const width = options.paperSize === '80mm' ? 48 : 32; // caracteres por linha
    let content = '';

    // Header
    content += this.centerText(data.companyInfo.name, width) + '\n';
    content += this.centerText(data.companyInfo.address, width) + '\n';
    content += this.centerText(`Tel: ${data.companyInfo.phone}`, width) + '\n';
    if (data.companyInfo.cnpj) {
      content += this.centerText(`CNPJ: ${data.companyInfo.cnpj}`, width) + '\n';
    }
    content += '\n';

    // Título
    content += this.centerText('ORDEM DE SERVICO', width) + '\n';
    content += this.repeatChar('=', width) + '\n';

    // Informações
    content += `OS: ${data.orderNumber}\n`;
    content += `Data: ${new Date(data.createdAt).toLocaleDateString('pt-BR')}\n`;
    content += `Cliente: ${data.clientName}\n`;
    content += `Tel: ${data.clientPhone}\n`;
    content += `Veiculo: ${data.vehicleInfo}\n`;
    content += `Mecanico: ${data.mechanicName}\n`;
    if (data.estimatedCompletion) {
      content += `Previsao: ${new Date(data.estimatedCompletion).toLocaleDateString('pt-BR')}\n`;
    }
    content += '\n';

    // Descrição
    content += 'DESCRICAO:\n';
    content += this.wrapText(data.description, width) + '\n';
    content += '\n';

    // Itens
    if (data.items.length > 0) {
      content += 'PECAS UTILIZADAS:\n';
      content += this.repeatChar('-', width) + '\n';
      
      data.items.forEach(item => {
        content += `${item.productName}\n`;
        content += `${item.quantity} x R$ ${item.unitPrice.toFixed(2)} = R$ ${item.totalPrice.toFixed(2)}\n`;
      });
      content += '\n';
    }

    // Valores
    content += this.repeatChar('-', width) + '\n';
    content += `Mao de obra: R$ ${data.laborCost.toFixed(2)}\n`;
    content += `Pecas: R$ ${data.partsCost.toFixed(2)}\n`;
    content += this.repeatChar('=', width) + '\n';
    content += `TOTAL: R$ ${data.totalAmount.toFixed(2)}\n`;
    content += this.repeatChar('=', width) + '\n';

    // Assinaturas
    content += '\n\n';
    content += '_________________\n';
    content += 'Assinatura Cliente\n';

    return Buffer.from(content, 'utf8');
  }

  // Imprimir venda para impressora térmica
  private async printSaleThermal(
    data: SalePrintData,
    options: PrintOptions
  ): Promise<Buffer> {
    const width = options.paperSize === '80mm' ? 48 : 32;
    let content = '';

    // Header
    content += this.centerText(data.companyInfo.name, width) + '\n';
    content += this.centerText(data.companyInfo.address, width) + '\n';
    content += this.centerText(`Tel: ${data.companyInfo.phone}`, width) + '\n';
    if (data.companyInfo.cnpj) {
      content += this.centerText(`CNPJ: ${data.companyInfo.cnpj}`, width) + '\n';
    }
    content += '\n';

    // Título
    content += this.centerText('CUPOM NAO FISCAL', width) + '\n';
    content += this.repeatChar('=', width) + '\n';

    // Informações
    content += `Venda: ${data.saleNumber}\n`;
    content += `Data: ${new Date(data.createdAt).toLocaleString('pt-BR')}\n`;
    content += `Cliente: ${data.clientName}\n`;
    if (data.clientCpf) {
      content += `CPF: ${data.clientCpf}\n`;
    }
    content += '\n';

    // Itens
    content += this.repeatChar('-', width) + '\n';
    data.items.forEach(item => {
      content += `${item.productName}\n`;
      content += `${item.quantity} x R$ ${item.unitPrice.toFixed(2)} = R$ ${item.totalPrice.toFixed(2)}\n`;
    });

    // Totais
    content += this.repeatChar('-', width) + '\n';
    content += `Subtotal: R$ ${data.subtotal.toFixed(2)}\n`;
    if (data.discountAmount > 0) {
      content += `Desconto: R$ ${data.discountAmount.toFixed(2)}\n`;
    }
    content += this.repeatChar('=', width) + '\n';
    content += `TOTAL: R$ ${data.totalAmount.toFixed(2)}\n`;
    content += this.repeatChar('=', width) + '\n';

    content += `Pagamento: ${data.paymentMethod}\n`;
    content += '\n';
    content += this.centerText('Obrigado pela preferencia!', width) + '\n';

    return Buffer.from(content, 'utf8');
  }

  // Imprimir para impressora matricial (80 colunas)
  private async printServiceOrderMatrix(
    data: ServiceOrderPrintData,
    options: PrintOptions
  ): Promise<Buffer> {
    const width = 80;
    let content = '';

    // Códigos de controle para impressora matricial
    const ESC = '\x1B';
    const BOLD_ON = ESC + 'E';
    const BOLD_OFF = ESC + 'F';
    const CONDENSED_ON = ESC + '\x0F';
    const CONDENSED_OFF = ESC + '\x12';

    // Header
    content += BOLD_ON;
    content += this.centerText(data.companyInfo.name, width) + '\n';
    content += BOLD_OFF;
    content += this.centerText(data.companyInfo.address, width) + '\n';
    content += this.centerText(`Tel: ${data.companyInfo.phone}`, width) + '\n';
    
    // Resto do conteúdo similar ao térmico, mas com 80 colunas
    // ... (implementar formatação específica para matricial)

    return Buffer.from(content, 'utf8');
  }

  // Imprimir venda para impressora matricial
  private async printSaleMatrix(
    data: SalePrintData,
    options: PrintOptions
  ): Promise<Buffer> {
    // Implementar formatação para impressora matricial
    return this.printSaleThermal(data, options);
  }

  // Utilitários de formatação
  private centerText(text: string, width: number): string {
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(padding) + text;
  }

  private repeatChar(char: string, count: number): string {
    return char.repeat(count);
  }

  private wrapText(text: string, width: number): string {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      if ((currentLine + word).length <= width) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });

    if (currentLine) lines.push(currentLine);
    return lines.join('\n');
  }

  // Detectar impressoras disponíveis (Windows)
  async getAvailablePrinters(): Promise<string[]> {
    try {
      // No Windows, usar wmic para listar impressoras
      const { execSync } = require('child_process');
      const output = execSync('wmic printer get name', { encoding: 'utf8' });
      
      const printers = output
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && line !== 'Name')
        .filter(line => !line.includes('Microsoft') && !line.includes('OneNote'));

      return printers;
    } catch (error) {
      console.error('Erro ao detectar impressoras:', error);
      return [];
    }
  }

  // Enviar para impressora específica (Windows)
  async sendToPrinter(
    content: Buffer,
    printerName: string,
    options: PrintOptions
  ): Promise<boolean> {
    try {
      const fs = require('fs');
      const { execSync } = require('child_process');
      
      // Salvar conteúdo em arquivo temporário
      const tempFile = `temp_print_${Date.now()}.txt`;
      fs.writeFileSync(tempFile, content);

      // Enviar para impressora usando comando do Windows
      execSync(`print /D:"${printerName}" "${tempFile}"`);

      // Limpar arquivo temporário
      fs.unlinkSync(tempFile);

      return true;
    } catch (error) {
      console.error('Erro ao enviar para impressora:', error);
      return false;
    }
  }

  // Configurar impressora padrão
  async setDefaultPrinter(printerName: string): Promise<boolean> {
    try {
      const { execSync } = require('child_process');
      execSync(`rundll32 printui.dll,PrintUIEntry /y /n "${printerName}"`);
      return true;
    } catch (error) {
      console.error('Erro ao definir impressora padrão:', error);
      return false;
    }
  }
}

export const printService = new PrintService();
export { PrintService, PrintOptions, ServiceOrderPrintData, SalePrintData };