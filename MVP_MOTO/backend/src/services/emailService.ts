// Serviço de Envio de Emails
// Sistema de Gestão de Oficina Mecânica de Motos

import nodemailer from 'nodemailer';
import { createTransport, Transporter } from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content?: Buffer | string;
    path?: string;
    contentType?: string;
  }>;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

interface TemplateData {
  [key: string]: any;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: Transporter;
  private templates: Map<string, EmailTemplate> = new Map();

  constructor() {
    this.initializeTransporter();
    this.loadTemplates();
  }

  // Inicializar transportador de email
  private initializeTransporter(): void {
    const emailConfig = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    };

    this.transporter = createTransport(emailConfig);

    // Verificar conexão
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('Erro na configuração de email:', error);
      } else {
        console.log('Servidor de email configurado com sucesso');
      }
    });
  }

  // Carregar templates de email
  private async loadTemplates(): Promise<void> {
    try {
      const templatesDir = path.join(__dirname, '../templates/emails');
      
      // Template de recibo de venda
      this.templates.set('sale-receipt', {
        subject: 'Comprovante de Venda - {{saleNumber}}',
        html: await this.loadTemplate('sale-receipt.hbs'),
      });

      // Template de ordem de serviço
      this.templates.set('service-order', {
        subject: 'Ordem de Serviço - {{orderNumber}}',
        html: await this.loadTemplate('service-order.hbs'),
      });

      // Template de orçamento
      this.templates.set('quote', {
        subject: 'Orçamento - {{quoteNumber}}',
        html: await this.loadTemplate('quote.hbs'),
      });

      // Template de cobrança
      this.templates.set('payment-reminder', {
        subject: 'Lembrete de Pagamento - Vencimento {{dueDate}}',
        html: await this.loadTemplate('payment-reminder.hbs'),
      });

      // Template de aniversário
      this.templates.set('birthday', {
        subject: 'Feliz Aniversário! 🎉',
        html: await this.loadTemplate('birthday.hbs'),
      });

      // Template de boas-vindas
      this.templates.set('welcome', {
        subject: 'Bem-vindo à {{companyName}}!',
        html: await this.loadTemplate('welcome.hbs'),
      });

      // Template de notificação de estoque baixo
      this.templates.set('low-stock', {
        subject: 'Alerta: Produtos com Estoque Baixo',
        html: await this.loadTemplate('low-stock.hbs'),
      });

      console.log('Templates de email carregados com sucesso');
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    }
  }

  // Carregar template individual
  private async loadTemplate(filename: string): Promise<string> {
    try {
      const templatePath = path.join(__dirname, '../templates/emails', filename);
      return await fs.readFile(templatePath, 'utf-8');
    } catch (error) {
      console.error(`Erro ao carregar template ${filename}:`, error);
      return '<p>Template não encontrado</p>';
    }
  }

  // Enviar email simples
  async sendEmail(options: EmailOptions): Promise<any> {
    try {
      const mailOptions = {
        from: `${process.env.COMPANY_NAME || 'Oficina Motos'} <${process.env.EMAIL_USER}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined,
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
        replyTo: options.replyTo || process.env.EMAIL_USER,
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('Email enviado com sucesso:', result.messageId);
      return result;
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw new Error(`Falha no envio de email: ${error.message}`);
    }
  }

  // Enviar email com template
  async sendTemplateEmail(
    templateName: string,
    to: string | string[],
    data: TemplateData,
    attachments?: EmailOptions['attachments']
  ): Promise<any> {
    try {
      const template = this.templates.get(templateName);
      if (!template) {
        throw new Error(`Template '${templateName}' não encontrado`);
      }

      // Compilar template com Handlebars
      const subjectTemplate = handlebars.compile(template.subject);
      const htmlTemplate = handlebars.compile(template.html);

      const subject = subjectTemplate(data);
      const html = htmlTemplate(data);

      return await this.sendEmail({
        to,
        subject,
        html,
        attachments,
      });
    } catch (error) {
      console.error('Erro ao enviar email com template:', error);
      throw new Error(`Falha no envio de email: ${error.message}`);
    }
  }

  // Enviar recibo de venda
  async sendSaleReceipt(
    customerEmail: string,
    saleData: any,
    pdfBuffer?: Buffer
  ): Promise<any> {
    const attachments = pdfBuffer ? [{
      filename: `recibo-${saleData.saleNumber}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    }] : undefined;

    return await this.sendTemplateEmail(
      'sale-receipt',
      customerEmail,
      {
        customerName: saleData.customerName,
        saleNumber: saleData.saleNumber,
        saleDate: new Date(saleData.createdAt).toLocaleDateString('pt-BR'),
        items: saleData.items,
        totalAmount: saleData.totalAmount.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        companyName: process.env.COMPANY_NAME || 'Oficina Motos',
        companyPhone: process.env.COMPANY_PHONE || '',
        companyAddress: process.env.COMPANY_ADDRESS || '',
      },
      attachments
    );
  }

  // Enviar ordem de serviço
  async sendServiceOrder(
    customerEmail: string,
    orderData: any,
    pdfBuffer?: Buffer
  ): Promise<any> {
    const attachments = pdfBuffer ? [{
      filename: `os-${orderData.orderNumber}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    }] : undefined;

    return await this.sendTemplateEmail(
      'service-order',
      customerEmail,
      {
        customerName: orderData.customerName,
        orderNumber: orderData.orderNumber,
        orderDate: new Date(orderData.createdAt).toLocaleDateString('pt-BR'),
        vehicleInfo: `${orderData.vehicleBrand} ${orderData.vehicleModel} - ${orderData.vehiclePlate}`,
        description: orderData.description,
        mechanicName: orderData.mechanicName,
        estimatedCompletion: orderData.estimatedCompletion ? 
          new Date(orderData.estimatedCompletion).toLocaleDateString('pt-BR') : 'A definir',
        totalAmount: orderData.totalAmount.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        companyName: process.env.COMPANY_NAME || 'Oficina Motos',
        companyPhone: process.env.COMPANY_PHONE || '',
        companyAddress: process.env.COMPANY_ADDRESS || '',
      },
      attachments
    );
  }

  // Enviar orçamento
  async sendQuote(
    customerEmail: string,
    quoteData: any,
    pdfBuffer?: Buffer
  ): Promise<any> {
    const attachments = pdfBuffer ? [{
      filename: `orcamento-${quoteData.quoteNumber}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    }] : undefined;

    return await this.sendTemplateEmail(
      'quote',
      customerEmail,
      {
        customerName: quoteData.customerName,
        quoteNumber: quoteData.quoteNumber,
        quoteDate: new Date(quoteData.createdAt).toLocaleDateString('pt-BR'),
        validUntil: quoteData.validUntil ? 
          new Date(quoteData.validUntil).toLocaleDateString('pt-BR') : 'A definir',
        items: quoteData.items,
        totalAmount: quoteData.totalAmount.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        companyName: process.env.COMPANY_NAME || 'Oficina Motos',
        companyPhone: process.env.COMPANY_PHONE || '',
        companyAddress: process.env.COMPANY_ADDRESS || '',
      },
      attachments
    );
  }

  // Enviar lembrete de pagamento
  async sendPaymentReminder(
    customerEmail: string,
    paymentData: any
  ): Promise<any> {
    return await this.sendTemplateEmail(
      'payment-reminder',
      customerEmail,
      {
        customerName: paymentData.customerName,
        invoiceNumber: paymentData.invoiceNumber,
        dueDate: new Date(paymentData.dueDate).toLocaleDateString('pt-BR'),
        amount: paymentData.amount.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        daysOverdue: paymentData.daysOverdue || 0,
        companyName: process.env.COMPANY_NAME || 'Oficina Motos',
        companyPhone: process.env.COMPANY_PHONE || '',
        companyAddress: process.env.COMPANY_ADDRESS || '',
      }
    );
  }

  // Enviar email de aniversário
  async sendBirthdayEmail(
    customerEmail: string,
    customerData: any
  ): Promise<any> {
    return await this.sendTemplateEmail(
      'birthday',
      customerEmail,
      {
        customerName: customerData.name,
        companyName: process.env.COMPANY_NAME || 'Oficina Motos',
        specialOffer: 'Desconto especial de 10% em serviços durante o mês do seu aniversário!',
        companyPhone: process.env.COMPANY_PHONE || '',
        companyAddress: process.env.COMPANY_ADDRESS || '',
      }
    );
  }

  // Enviar email de boas-vindas
  async sendWelcomeEmail(
    customerEmail: string,
    customerData: any
  ): Promise<any> {
    return await this.sendTemplateEmail(
      'welcome',
      customerEmail,
      {
        customerName: customerData.name,
        companyName: process.env.COMPANY_NAME || 'Oficina Motos',
        services: [
          'Manutenção preventiva e corretiva',
          'Venda de peças e acessórios',
          'Diagnóstico eletrônico',
          'Serviços de pintura e funilaria',
        ],
        companyPhone: process.env.COMPANY_PHONE || '',
        companyAddress: process.env.COMPANY_ADDRESS || '',
        companyWebsite: process.env.COMPANY_WEBSITE || '',
      }
    );
  }

  // Enviar alerta de estoque baixo
  async sendLowStockAlert(
    managerEmails: string[],
    lowStockProducts: any[]
  ): Promise<any> {
    return await this.sendTemplateEmail(
      'low-stock',
      managerEmails,
      {
        products: lowStockProducts.map(product => ({
          name: product.name,
          code: product.code,
          currentStock: product.currentStock,
          minStock: product.minStock,
          supplier: product.supplier,
        })),
        totalProducts: lowStockProducts.length,
        companyName: process.env.COMPANY_NAME || 'Oficina Motos',
      }
    );
  }

  // Enviar email em lote
  async sendBulkEmails(
    templateName: string,
    recipients: Array<{ email: string; data: TemplateData }>,
    attachments?: EmailOptions['attachments']
  ): Promise<any[]> {
    const results = [];

    for (const recipient of recipients) {
      try {
        const result = await this.sendTemplateEmail(
          templateName,
          recipient.email,
          recipient.data,
          attachments
        );
        results.push({ email: recipient.email, success: true, result });
      } catch (error) {
        results.push({ 
          email: recipient.email, 
          success: false, 
          error: error.message 
        });
      }

      // Pequena pausa entre envios para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
  }

  // Verificar status do serviço de email
  async checkEmailService(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Serviço de email indisponível:', error);
      return false;
    }
  }

  // Obter estatísticas de email (mock - implementar com provedor real)
  async getEmailStats(): Promise<any> {
    return {
      sent: 0, // Implementar com provedor real
      delivered: 0,
      bounced: 0,
      opened: 0,
      clicked: 0,
    };
  }
}

export const emailService = new EmailService();
export { EmailService };