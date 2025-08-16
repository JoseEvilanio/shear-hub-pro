// Serviço de Auditoria e Logs
// Sistema de Gestão de Oficina Mecânica de Motos

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { Request } from 'express';

interface AuditLog {
  id?: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
  metadata?: any;
}

interface LogFilters {
  userId?: string;
  action?: string;
  resource?: string;
  dateFrom?: Date;
  dateTo?: Date;
  success?: boolean;
  page?: number;
  limit?: number;
}

class AuditService {
  private logger: winston.Logger;
  private auditLogger: winston.Logger;

  constructor() {
    this.initializeLoggers();
  }

  // Inicializar loggers
  private initializeLoggers(): void {
    // Logger principal da aplicação
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'oficina-motos' },
      transports: [
        // Console para desenvolvimento
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),

        // Arquivo para erros
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: '20m',
          maxFiles: '14d',
        }),

        // Arquivo para logs gerais
        new DailyRotateFile({
          filename: 'logs/combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '30d',
        }),
      ],
    });

    // Logger específico para auditoria
    this.auditLogger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new DailyRotateFile({
          filename: 'logs/audit-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '50m',
          maxFiles: '90d', // Manter logs de auditoria por 90 dias
        }),
      ],
    });
  }

  // Log de informação
  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  // Log de erro
  error(message: string, error?: Error, meta?: any): void {
    this.logger.error(message, { error: error?.stack, ...meta });
  }

  // Log de aviso
  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  // Log de debug
  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  // Registrar ação de auditoria
  async logAudit(auditData: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    const auditLog: AuditLog = {
      ...auditData,
      timestamp: new Date(),
    };

    // Log no arquivo de auditoria
    this.auditLogger.info('AUDIT', auditLog);

    // Salvar no banco de dados (implementar se necessário)
    try {
      await this.saveAuditToDatabase(auditLog);
    } catch (error) {
      this.error('Erro ao salvar log de auditoria no banco', error);
    }
  }

  // Salvar log de auditoria no banco de dados
  private async saveAuditToDatabase(auditLog: AuditLog): Promise<void> {
    // Implementar salvamento no banco de dados
    // Por enquanto, apenas log no arquivo
  }

  // Log de login
  async logLogin(
    userId: string,
    userName: string,
    success: boolean,
    req: Request,
    errorMessage?: string
  ): Promise<void> {
    await this.logAudit({
      userId,
      userName,
      action: 'LOGIN',
      resource: 'auth',
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent') || '',
      success,
      errorMessage,
    });
  }

  // Log de logout
  async logLogout(
    userId: string,
    userName: string,
    req: Request
  ): Promise<void> {
    await this.logAudit({
      userId,
      userName,
      action: 'LOGOUT',
      resource: 'auth',
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent') || '',
      success: true,
    });
  }

  // Log de criação de recurso
  async logCreate(
    userId: string,
    userName: string,
    resource: string,
    resourceId: string,
    newValues: any,
    req: Request
  ): Promise<void> {
    await this.logAudit({
      userId,
      userName,
      action: 'CREATE',
      resource,
      resourceId,
      newValues,
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent') || '',
      success: true,
    });
  }

  // Log de atualização de recurso
  async logUpdate(
    userId: string,
    userName: string,
    resource: string,
    resourceId: string,
    oldValues: any,
    newValues: any,
    req: Request
  ): Promise<void> {
    await this.logAudit({
      userId,
      userName,
      action: 'UPDATE',
      resource,
      resourceId,
      oldValues,
      newValues,
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent') || '',
      success: true,
    });
  }

  // Log de exclusão de recurso
  async logDelete(
    userId: string,
    userName: string,
    resource: string,
    resourceId: string,
    oldValues: any,
    req: Request
  ): Promise<void> {
    await this.logAudit({
      userId,
      userName,
      action: 'DELETE',
      resource,
      resourceId,
      oldValues,
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent') || '',
      success: true,
    });
  }

  // Log de visualização de recurso sensível
  async logView(
    userId: string,
    userName: string,
    resource: string,
    resourceId: string,
    req: Request,
    metadata?: any
  ): Promise<void> {
    await this.logAudit({
      userId,
      userName,
      action: 'VIEW',
      resource,
      resourceId,
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent') || '',
      success: true,
      metadata,
    });
  }

  // Log de exportação de dados
  async logExport(
    userId: string,
    userName: string,
    resource: string,
    req: Request,
    metadata?: any
  ): Promise<void> {
    await this.logAudit({
      userId,
      userName,
      action: 'EXPORT',
      resource,
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent') || '',
      success: true,
      metadata,
    });
  }

  // Log de tentativa de acesso negado
  async logAccessDenied(
    userId: string,
    userName: string,
    resource: string,
    action: string,
    req: Request,
    reason?: string
  ): Promise<void> {
    await this.logAudit({
      userId,
      userName,
      action: `ACCESS_DENIED_${action}`,
      resource,
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent') || '',
      success: false,
      errorMessage: reason,
    });
  }

  // Log de alteração de configuração
  async logConfigChange(
    userId: string,
    userName: string,
    configKey: string,
    oldValue: any,
    newValue: any,
    req: Request
  ): Promise<void> {
    await this.logAudit({
      userId,
      userName,
      action: 'CONFIG_CHANGE',
      resource: 'configuration',
      resourceId: configKey,
      oldValues: { [configKey]: oldValue },
      newValues: { [configKey]: newValue },
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent') || '',
      success: true,
    });
  }

  // Log de backup
  async logBackup(
    userId: string,
    userName: string,
    backupType: string,
    success: boolean,
    metadata?: any,
    errorMessage?: string
  ): Promise<void> {
    await this.logAudit({
      userId,
      userName,
      action: 'BACKUP',
      resource: 'system',
      ipAddress: 'system',
      userAgent: 'system',
      success,
      errorMessage,
      metadata: { backupType, ...metadata },
    });
  }

  // Log de restore
  async logRestore(
    userId: string,
    userName: string,
    restoreType: string,
    success: boolean,
    req: Request,
    metadata?: any,
    errorMessage?: string
  ): Promise<void> {
    await this.logAudit({
      userId,
      userName,
      action: 'RESTORE',
      resource: 'system',
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent') || '',
      success,
      errorMessage,
      metadata: { restoreType, ...metadata },
    });
  }

  // Obter IP do cliente
  private getClientIP(req: Request): string {
    return (
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection as any)?.socket?.remoteAddress ||
      'unknown'
    );
  }

  // Buscar logs de auditoria (implementar com banco de dados)
  async searchAuditLogs(filters: LogFilters): Promise<{
    logs: AuditLog[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    // Por enquanto, retornar dados mockados
    // Implementar busca real no banco de dados
    return {
      logs: [],
      total: 0,
      page: filters.page || 1,
      totalPages: 0,
    };
  }

  // Gerar relatório de auditoria
  async generateAuditReport(
    filters: LogFilters,
    format: 'json' | 'csv' | 'pdf' = 'json'
  ): Promise<any> {
    const { logs } = await this.searchAuditLogs(filters);

    switch (format) {
      case 'csv':
        return this.generateCSVReport(logs);
      case 'pdf':
        return this.generatePDFReport(logs);
      default:
        return logs;
    }
  }

  // Gerar relatório CSV
  private generateCSVReport(logs: AuditLog[]): string {
    const headers = [
      'Timestamp',
      'User',
      'Action',
      'Resource',
      'Resource ID',
      'IP Address',
      'Success',
      'Error Message',
    ];

    const rows = logs.map(log => [
      log.timestamp.toISOString(),
      log.userName,
      log.action,
      log.resource,
      log.resourceId || '',
      log.ipAddress,
      log.success ? 'Yes' : 'No',
      log.errorMessage || '',
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }

  // Gerar relatório PDF (implementar com biblioteca PDF)
  private async generatePDFReport(logs: AuditLog[]): Promise<Buffer> {
    // Implementar geração de PDF
    // Por enquanto, retornar buffer vazio
    return Buffer.from('PDF Report - To be implemented');
  }

  // Limpar logs antigos
  async cleanupOldLogs(daysToKeep: number = 90): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // Implementar limpeza no banco de dados
    this.info(`Limpeza de logs iniciada - mantendo logs dos últimos ${daysToKeep} dias`);
  }

  // Obter estatísticas de auditoria
  async getAuditStats(): Promise<any> {
    // Implementar estatísticas reais
    return {
      totalLogs: 0,
      logsByAction: {},
      logsByResource: {},
      logsByUser: {},
      successRate: 0,
      topUsers: [],
      topActions: [],
      recentActivity: [],
    };
  }

  // Detectar atividades suspeitas
  async detectSuspiciousActivity(): Promise<any[]> {
    // Implementar detecção de atividades suspeitas
    // - Múltiplas tentativas de login falhadas
    // - Acessos fora do horário normal
    // - Múltiplas ações em sequência rápida
    // - Acessos de IPs desconhecidos
    return [];
  }

  // Middleware para logging automático de requisições
  createRequestLogger() {
    return (req: Request, res: any, next: any) => {
      const startTime = Date.now();

      // Log da requisição
      this.info('HTTP Request', {
        method: req.method,
        url: req.url,
        ip: this.getClientIP(req),
        userAgent: req.get('User-Agent'),
        userId: (req as any).user?.id,
      });

      // Override do res.json para capturar a resposta
      const originalJson = res.json;
      res.json = function(body: any) {
        const duration = Date.now() - startTime;
        
        // Log da resposta
        auditService.info('HTTP Response', {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration,
          userId: (req as any).user?.id,
        });

        return originalJson.call(this, body);
      };

      next();
    };
  }
}

export const auditService = new AuditService();
export { AuditService, AuditLog, LogFilters };