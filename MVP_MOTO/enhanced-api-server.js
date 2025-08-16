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

// Funções utilitárias
const validateCPF = (cpf) => {
  if (!cpf) return true; // CPF é opcional
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  return cleanCPF.length === 11;
};

const validateEmail = (email) => {
  if (!email) return true; // Email é opcional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const formatCPF = (cpf) => {
  if (!cpf) return null;
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  if (cleanCPF.length === 11) {
    return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return cpf;
};

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

// Rotas de autenticação (mantidas do servidor anterior)
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

// ==================== MÓDULO DE CLIENTES COMPLETO ====================

// 1. Listar clientes com busca e filtros
app.get('/api/clients', authMiddleware, async (req, res) => {
  console.log('📥 Lista de clientes requisitada por:', req.user.email);
  
  try {
    const { 
      search, 
      page = 1, 
      limit = 10, 
      sortBy = 'name', 
      sortOrder = 'asc',
      birthMonth 
    } = req.query;

    let query = supabase.from('clients').select('*', { count: 'exact' });

    // Aplicar busca
    if (search) {
      query = query.or(`name.ilike.%${search}%,cpf.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Filtro por mês de aniversário
    if (birthMonth) {
      query = query.filter('birth_date', 'not.is', null);
      // Filtrar por mês usando função SQL
      query = query.filter('birth_date', 'gte', `2000-${birthMonth.padStart(2, '0')}-01`);
      query = query.filter('birth_date', 'lt', `2000-${(parseInt(birthMonth) + 1).toString().padStart(2, '0')}-01`);
    }

    // Aplicar ordenação
    const ascending = sortOrder === 'asc';
    query = query.order(sortBy, { ascending });

    // Aplicar paginação
    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;
    query = query.range(from, to);

    const { data: clients, error, count } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: clients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit),
        hasNext: (page * limit) < count,
        hasPrev: page > 1
      },
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

// 2. Buscar cliente por ID
app.get('/api/clients/:id', authMiddleware, async (req, res) => {
  console.log('📥 Cliente por ID requisitado:', req.params.id);
  
  try {
    const { id } = req.params;

    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: {
            message: 'Cliente não encontrado',
            code: 'CLIENT_NOT_FOUND'
          }
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data: client,
      message: 'Cliente encontrado'
    });

  } catch (error) {
    console.error('❌ Erro ao buscar cliente:', error);
    res.status(500).json({
      error: {
        message: 'Erro ao buscar cliente',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// 3. Criar cliente
app.post('/api/clients', authMiddleware, async (req, res) => {
  console.log('📥 Criação de cliente requisitada por:', req.user.email);
  
  try {
    const { name, cpf, phone, email, birth_date, address } = req.body;

    // Validações
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        error: {
          message: 'Nome é obrigatório',
          code: 'MISSING_NAME'
        }
      });
    }

    if (cpf && !validateCPF(cpf)) {
      return res.status(400).json({
        error: {
          message: 'CPF inválido',
          code: 'INVALID_CPF'
        }
      });
    }

    if (email && !validateEmail(email)) {
      return res.status(400).json({
        error: {
          message: 'Email inválido',
          code: 'INVALID_EMAIL'
        }
      });
    }

    // Verificar se CPF já existe (se fornecido)
    if (cpf) {
      const formattedCPF = formatCPF(cpf);
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('cpf', formattedCPF)
        .single();

      if (existingClient) {
        return res.status(409).json({
          error: {
            message: 'CPF já cadastrado',
            code: 'CPF_ALREADY_EXISTS'
          }
        });
      }
    }

    // Verificar se email já existe (se fornecido)
    if (email) {
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      if (existingClient) {
        return res.status(409).json({
          error: {
            message: 'Email já cadastrado',
            code: 'EMAIL_ALREADY_EXISTS'
          }
        });
      }
    }

    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        name: name.trim(),
        cpf: cpf ? formatCPF(cpf) : null,
        phone: phone?.trim() || null,
        email: email?.toLowerCase().trim() || null,
        birth_date: birth_date || null,
        address: address?.trim() || null
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

// 4. Atualizar cliente
app.put('/api/clients/:id', authMiddleware, async (req, res) => {
  console.log('📥 Atualização de cliente requisitada:', req.params.id);
  
  try {
    const { id } = req.params;
    const { name, cpf, phone, email, birth_date, address } = req.body;

    // Verificar se cliente existe
    const { data: existingClient, error: findError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (findError) {
      if (findError.code === 'PGRST116') {
        return res.status(404).json({
          error: {
            message: 'Cliente não encontrado',
            code: 'CLIENT_NOT_FOUND'
          }
        });
      }
      throw findError;
    }

    // Validações
    if (name !== undefined && (!name || name.trim().length === 0)) {
      return res.status(400).json({
        error: {
          message: 'Nome é obrigatório',
          code: 'MISSING_NAME'
        }
      });
    }

    if (cpf !== undefined && cpf && !validateCPF(cpf)) {
      return res.status(400).json({
        error: {
          message: 'CPF inválido',
          code: 'INVALID_CPF'
        }
      });
    }

    if (email !== undefined && email && !validateEmail(email)) {
      return res.status(400).json({
        error: {
          message: 'Email inválido',
          code: 'INVALID_EMAIL'
        }
      });
    }

    // Verificar duplicatas (apenas se os valores mudaram)
    if (cpf !== undefined && cpf && formatCPF(cpf) !== existingClient.cpf) {
      const formattedCPF = formatCPF(cpf);
      const { data: duplicateCPF } = await supabase
        .from('clients')
        .select('id')
        .eq('cpf', formattedCPF)
        .neq('id', id)
        .single();

      if (duplicateCPF) {
        return res.status(409).json({
          error: {
            message: 'CPF já cadastrado',
            code: 'CPF_ALREADY_EXISTS'
          }
        });
      }
    }

    if (email !== undefined && email && email.toLowerCase() !== existingClient.email) {
      const { data: duplicateEmail } = await supabase
        .from('clients')
        .select('id')
        .eq('email', email.toLowerCase())
        .neq('id', id)
        .single();

      if (duplicateEmail) {
        return res.status(409).json({
          error: {
            message: 'Email já cadastrado',
            code: 'EMAIL_ALREADY_EXISTS'
          }
        });
      }
    }

    // Preparar dados para atualização
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (cpf !== undefined) updateData.cpf = cpf ? formatCPF(cpf) : null;
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (email !== undefined) updateData.email = email?.toLowerCase().trim() || null;
    if (birth_date !== undefined) updateData.birth_date = birth_date || null;
    if (address !== undefined) updateData.address = address?.trim() || null;

    const { data: client, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: client,
      message: 'Cliente atualizado com sucesso'
    });

    console.log('✅ Cliente atualizado:', client.name);

  } catch (error) {
    console.error('❌ Erro ao atualizar cliente:', error);
    res.status(500).json({
      error: {
        message: 'Erro ao atualizar cliente',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// 5. Deletar cliente
app.delete('/api/clients/:id', authMiddleware, async (req, res) => {
  console.log('📥 Exclusão de cliente requisitada:', req.params.id);
  
  try {
    const { id } = req.params;

    // Verificar se cliente existe
    const { data: existingClient, error: findError } = await supabase
      .from('clients')
      .select('name')
      .eq('id', id)
      .single();

    if (findError) {
      if (findError.code === 'PGRST116') {
        return res.status(404).json({
          error: {
            message: 'Cliente não encontrado',
            code: 'CLIENT_NOT_FOUND'
          }
        });
      }
      throw findError;
    }

    // Verificar se cliente tem dependências (veículos, OS, vendas)
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('id')
      .eq('client_id', id)
      .limit(1);

    if (vehicles && vehicles.length > 0) {
      return res.status(409).json({
        error: {
          message: 'Não é possível excluir cliente com veículos cadastrados',
          code: 'CLIENT_HAS_VEHICLES'
        }
      });
    }

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Cliente excluído com sucesso'
    });

    console.log('✅ Cliente excluído:', existingClient.name);

  } catch (error) {
    console.error('❌ Erro ao excluir cliente:', error);
    res.status(500).json({
      error: {
        message: 'Erro ao excluir cliente',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// 6. Buscar histórico do cliente (OS e vendas)
app.get('/api/clients/:id/history', authMiddleware, async (req, res) => {
  console.log('📥 Histórico do cliente requisitado:', req.params.id);
  
  try {
    const { id } = req.params;

    // Verificar se cliente existe
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('name')
      .eq('id', id)
      .single();

    if (clientError) {
      if (clientError.code === 'PGRST116') {
        return res.status(404).json({
          error: {
            message: 'Cliente não encontrado',
            code: 'CLIENT_NOT_FOUND'
          }
        });
      }
      throw clientError;
    }

    // Buscar veículos do cliente
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('*')
      .eq('client_id', id)
      .order('created_at', { ascending: false });

    // Buscar vendas do cliente (simulado - tabela ainda não implementada)
    const sales = [];

    // Buscar ordens de serviço (simulado - tabela ainda não implementada)
    const serviceOrders = [];

    res.json({
      success: true,
      data: {
        client: client.name,
        vehicles: vehicles || [],
        sales,
        serviceOrders,
        summary: {
          totalVehicles: vehicles?.length || 0,
          totalSales: sales.length,
          totalServiceOrders: serviceOrders.length
        }
      },
      message: 'Histórico do cliente recuperado'
    });

  } catch (error) {
    console.error('❌ Erro ao buscar histórico:', error);
    res.status(500).json({
      error: {
        message: 'Erro ao buscar histórico do cliente',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// 7. Relatório de aniversariantes
app.get('/api/clients/reports/birthdays', authMiddleware, async (req, res) => {
  console.log('📥 Relatório de aniversariantes requisitado');
  
  try {
    const { month } = req.query;
    
    let query = supabase
      .from('clients')
      .select('id, name, phone, email, birth_date')
      .not('birth_date', 'is', null);

    if (month) {
      // Filtrar por mês específico
      const monthNum = parseInt(month);
      if (monthNum >= 1 && monthNum <= 12) {
        // Usar função SQL para extrair o mês
        query = query.filter('birth_date', 'gte', `2000-${monthNum.toString().padStart(2, '0')}-01`);
        query = query.filter('birth_date', 'lt', `2000-${(monthNum + 1).toString().padStart(2, '0')}-01`);
      }
    }

    query = query.order('birth_date', { ascending: true });

    const { data: clients, error } = await query;

    if (error) {
      throw error;
    }

    // Agrupar por mês
    const clientsByMonth = {};
    clients?.forEach(client => {
      const birthDate = new Date(client.birth_date);
      const month = birthDate.getMonth() + 1;
      const day = birthDate.getDate();
      
      if (!clientsByMonth[month]) {
        clientsByMonth[month] = [];
      }
      
      clientsByMonth[month].push({
        ...client,
        day,
        monthName: new Date(2000, month - 1, 1).toLocaleDateString('pt-BR', { month: 'long' })
      });
    });

    res.json({
      success: true,
      data: {
        clientsByMonth,
        total: clients?.length || 0
      },
      message: 'Relatório de aniversariantes gerado'
    });

  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);
    res.status(500).json({
      error: {
        message: 'Erro ao gerar relatório de aniversariantes',
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
  console.log(`🚀 Servidor API Enhanced rodando na porta ${PORT}`);
  console.log(`📊 Health: http://127.0.0.1:${PORT}/health`);
  console.log(`🔐 Login: POST http://127.0.0.1:${PORT}/api/auth/login`);
  console.log(`👥 Clientes: http://127.0.0.1:${PORT}/api/clients`);
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

console.log('🔍 Servidor Enhanced inicializado com sucesso!');