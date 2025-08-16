const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Configurações
const PORT = 5000;
const JWT_SECRET = 'oficina-motos-super-secret-key-2024';
const JWT_EXPIRES_IN = '24h';
const JWT_REFRESH_SECRET = 'oficina-motos-refresh-secret-key-2024';
const JWT_REFRESH_EXPIRES_IN = '7d';

// Configurar Supabase
const supabaseUrl = 'https://cgnkpnrzxptqcronhkmm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnbmtwbnJ6eHB0cWNyb25oa21tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDgzMjQ0NCwiZXhwIjoyMDcwNDA4NDQ0fQ.vaW3pfTAjOAYHk_UUcD6ni6RuACvdQ45H1svQnt7v-4';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Middlewares de segurança
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000',
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

// Middleware de autenticação
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: {
          message: 'Token de acesso não fornecido',
          code: 'MISSING_TOKEN'
        }
      });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({
      error: {
        message: 'Token inválido ou expirado',
        code: 'INVALID_TOKEN'
      }
    });
  }
};

// Middleware de autorização por role
const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: {
        message: 'Acesso negado. Apenas administradores podem acessar este recurso',
        code: 'FORBIDDEN'
      }
    });
  }
  next();
};

// Rotas públicas
app.get('/health', (req, res) => {
  console.log('📥 Health check requisitado');
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/api', (req, res) => {
  console.log('📥 API info requisitada');
  res.json({
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

// Rotas de autenticação
app.post('/api/auth/login', async (req, res) => {
  console.log('📥 Login requisitado:', req.body.email);
  
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: {
          message: 'Email e senha são obrigatórios',
          code: 'MISSING_CREDENTIALS'
        }
      });
    }

    // Buscar usuário no Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('active', true)
      .single();

    if (error || !user) {
      console.log('❌ Usuário não encontrado:', email);
      return res.status(401).json({
        error: {
          message: 'Email ou senha inválidos',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      console.log('❌ Senha inválida para:', email);
      return res.status(401).json({
        error: {
          message: 'Email ou senha inválidos',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // Gerar tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    const refreshToken = jwt.sign(tokenPayload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN
    });

    // Remover senha da resposta
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
        refreshToken
      },
      message: 'Login realizado com sucesso'
    });

    console.log('✅ Login bem-sucedido para:', email);

  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

app.post('/api/auth/verify', authMiddleware, (req, res) => {
  console.log('📥 Verificação de token para:', req.user.email);
  
  res.json({
    success: true,
    data: req.user,
    message: 'Token válido'
  });
});

app.post('/api/auth/refresh', async (req, res) => {
  console.log('📥 Refresh token requisitado');
  
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: {
          message: 'Refresh token é obrigatório',
          code: 'MISSING_REFRESH_TOKEN'
        }
      });
    }

    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    
    // Verificar se usuário ainda existe e está ativo
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', payload.userId)
      .eq('active', true)
      .single();

    if (error || !user) {
      return res.status(401).json({
        error: {
          message: 'Usuário inválido',
          code: 'INVALID_USER'
        }
      });
    }

    // Gerar novos tokens
    const newTokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const newToken = jwt.sign(newTokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    const newRefreshToken = jwt.sign(newTokenPayload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN
    });

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      },
      message: 'Token renovado com sucesso'
    });

    console.log('✅ Token renovado para:', user.email);

  } catch (error) {
    console.error('❌ Erro no refresh:', error);
    res.status(401).json({
      error: {
        message: 'Token de refresh inválido',
        code: 'INVALID_REFRESH_TOKEN'
      }
    });
  }
});

app.post('/api/auth/logout', (req, res) => {
  console.log('📥 Logout requisitado');
  res.json({
    success: true,
    message: 'Logout realizado com sucesso'
  });
});

// Rotas protegidas - Clientes
app.get('/api/clients', authMiddleware, async (req, res) => {
  console.log('📥 Lista de clientes requisitada por:', req.user.email);
  
  try {
    const { data: clients, error } = await supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: clients,
      message: 'Clientes listados com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao listar clientes:', error);
    res.status(500).json({
      error: {
        message: 'Erro ao buscar clientes',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

app.post('/api/clients', authMiddleware, async (req, res) => {
  console.log('📥 Criação de cliente requisitada por:', req.user.email);
  
  try {
    const { name, cpf, phone, email, birth_date, address } = req.body;

    if (!name) {
      return res.status(400).json({
        error: {
          message: 'Nome é obrigatório',
          code: 'MISSING_NAME'
        }
      });
    }

    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        name,
        cpf,
        phone,
        email,
        birth_date,
        address
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      data: client,
      message: 'Cliente criado com sucesso'
    });

    console.log('✅ Cliente criado:', client.name);

  } catch (error) {
    console.error('❌ Erro ao criar cliente:', error);
    res.status(500).json({
      error: {
        message: 'Erro ao criar cliente',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// Rotas protegidas - Produtos
app.get('/api/products', authMiddleware, async (req, res) => {
  console.log('📥 Lista de produtos requisitada por:', req.user.email);
  
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: products,
      message: 'Produtos listados com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao listar produtos:', error);
    res.status(500).json({
      error: {
        message: 'Erro ao buscar produtos',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// Rota de teste de conexão com banco
app.get('/api/test-db', authMiddleware, adminMiddleware, async (req, res) => {
  console.log('📥 Teste de banco requisitado por:', req.user.email);
  
  try {
    // Testar conexão
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name, role')
      .limit(5);

    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, name, phone')
      .limit(5);

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, code, name, price, type')
      .limit(5);

    res.json({
      success: true,
      data: {
        users: usersError ? null : users,
        clients: clientsError ? null : clients,
        products: productsError ? null : products,
        errors: {
          users: usersError?.message,
          clients: clientsError?.message,
          products: productsError?.message
        }
      },
      message: 'Teste de banco executado'
    });

  } catch (error) {
    console.error('❌ Erro no teste de banco:', error);
    res.status(500).json({
      error: {
        message: 'Erro no teste de banco',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err);
  res.status(500).json({
    error: {
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
    },
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Rota não encontrada',
      code: 'NOT_FOUND',
      timestamp: new Date().toISOString(),
    },
  });
});

// Iniciar servidor
const server = app.listen(PORT, '127.0.0.1', async () => {
  console.log(`🚀 Servidor API completo rodando na porta ${PORT}`);
  console.log(`📊 Health: http://127.0.0.1:${PORT}/health`);
  console.log(`🔐 Login: POST http://127.0.0.1:${PORT}/api/auth/login`);
  console.log(`👥 Clientes: GET http://127.0.0.1:${PORT}/api/clients`);
  console.log('⏳ Aguardando requisições...');
  
  // Testar conexão com Supabase
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão com Supabase:', error.message);
    } else {
      console.log('✅ Conexão com Supabase estabelecida');
    }
  } catch (error) {
    console.error('❌ Erro ao testar Supabase:', error);
  }
});

server.on('error', (err) => {
  console.error('❌ Erro no servidor:', err);
});

server.on('connection', (socket) => {
  console.log('🔗 Nova conexão TCP estabelecida');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Parando servidor...');
  server.close(() => {
    console.log('✅ Servidor parado');
    process.exit(0);
  });
});

console.log('🔍 Servidor inicializado com sucesso!');