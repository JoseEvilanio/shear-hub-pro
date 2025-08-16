import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { testConnection } from './config/database';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = parseInt(process.env['PORT'] || '3001');

// Middlewares de segurança
app.use(helmet());
app.use(cors({
  origin: process.env['FRONTEND_URL'] || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Muitas tentativas, tente novamente em 15 minutos.',
});
app.use('/api/', limiter);

// Middlewares gerais
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rota de health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Importar rotas
import authRoutes from './routes/authRoutes';

// Rotas da API
app.use('/api/auth', authRoutes);

// Rota de informações da API
app.get('/api', (_req, res) => {
  res.status(200).json({
    message: 'API Sistema de Gestão de Oficina Mecânica de Motos',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      clients: '/api/clients',
      suppliers: '/api/suppliers',
      mechanics: '/api/mechanics',
      vehicles: '/api/vehicles',
      products: '/api/products',
      serviceOrders: '/api/service-orders',
      sales: '/api/sales',
      inventory: '/api/inventory',
      financial: '/api/financial',
      reports: '/api/reports',
      config: '/api/config',
    },
  });
});

// Middleware de tratamento de erros
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Erro interno do servidor',
      code: err.code || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
    },
  });
});

// Middleware para rotas não encontradas
app.use('*', (_req, res) => {
  res.status(404).json({
    error: {
      message: 'Rota não encontrada',
      code: 'NOT_FOUND',
      timestamp: new Date().toISOString(),
    },
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  
  // Testar conexão com banco de dados
  console.log('\n🔍 Testando conexão com Supabase...');
  await testConnection();
});

export default app;