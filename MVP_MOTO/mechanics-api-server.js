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

const validateCNPJ = (cnpj) => {
  if (!cnpj) return true; // CNPJ é opcional
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  return cleanCNPJ.length === 14;
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

const formatCNPJ = (cnpj) => {
  if (!cnpj) return null;
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  if (cleanCNPJ.length === 14) {
    return cleanCNPJ.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return cnpj;
};

// Especialidades válidas para mecânicos
const VALID_SPECIALTIES = [
  'Motor',
  'Transmissão',
  'Freios',
  'Suspensão',
  'Elétrica',
  'Carburação',
  'Injeção Eletrônica',
  'Pneus e Rodas',
  'Escapamento',
  'Refrigeração',
  'Geral'
];

// Status de disponibilidade
const AVAILABILITY_STATUS = [
  'disponivel',
  'ocupado',
  'ausente',
  'ferias'
];

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

const managerMiddleware = (req, res, next) => {
  if (!req.user || !['admin', 'manager'].includes(req.user.role)) {
    return res.status(403).json({
      error: {
        message: 'Acesso negado. Apenas administradores e gerentes podem acessar este recurso',
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
    modules: ['auth', 'clients', 'suppliers', 'mechanics'],
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

// Rotas de autenticação (mantidas)
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

// ==================== MÓDULO DE MECÂNICOS COMPLETO ====================

// 1. Listar mecânicos com busca e filtros
app.get('/api/mechanics', authMiddleware, async (req, res) => {
  console.log('📥 Lista de mecânicos requisitada por:', req.user.email);
  try {
    const { 
      search, 
      page = 1, 
      limit = 10, 
      sortBy = 'name', 
      sortOrder = 'asc',
      specialty,
      active
    } = req.query;

    let query = supabase.from('mechanics').select('*', { count: 'exact' });

    // Aplicar busca
    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,specialties.ilike.%${search}%`);
    }

    // Filtrar por especialidade
    if (specialty) {
      query = query.ilike('specialties', `%${specialty}%`);
    }

    // Filtrar por ativo/inativo
    if (active !== undefined) {
      query = query.eq('active', active === 'true');
    }

    // Aplicar ordenação
    const ascending = sortOrder === 'asc';
    query = query.order(sortBy, { ascending });

    // Aplicar paginação
    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;
    query = query.range(from, to);

    const { data: mechanics, error, count } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: mechanics,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit),
        hasNext: (page * limit) < count,
        hasPrev: page > 1
      },
      message: 'Mecânicos listados com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao listar mecânicos:', error);
    res.status(500).json({
      error: {
        message: 'Erro ao buscar mecânicos',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// 2. Listar especialidades disponíveis (deve vir antes da rota :id)
app.get('/api/mechanics/specialties', authMiddleware, (req, res) => {
  console.log('📥 Lista de especialidades requisitada');
  res.json({
    success: true,
    data: VALID_SPECIALTIES,
    message: 'Especialidades disponíveis'
  });
});

// 3. Buscar mecânico por ID
app.get('/api/mechanics/:id', authMiddleware, async (req, res) => {
  console.log('📥 Mecânico por ID requisitado:', req.params.id);
  try {
    const { id } = req.params;

    const { data: mechanic, error } = await supabase
      .from('mechanics')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: {
            message: 'Mecânico não encontrado',
            code: 'MECHANIC_NOT_FOUND'
          }
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data: mechanic,
      message: 'Mecânico encontrado'
    });
  } catch (error) {
    console.error('❌ Erro ao buscar mecânico:', error);
    res.status(500).json({
      error: {
        message: 'Erro ao buscar mecânico',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// 4. Criar mecânico
app.post('/api/mechanics', authMiddleware, managerMiddleware, async (req, res) => {
  console.log('📥 Criação de mecânico requisitada por:', req.user.email);
  try {
    const { 
      name, 
      phone, 
      specialties = [] 
    } = req.body;

    // Validações
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        error: {
          message: 'Nome é obrigatório',
          code: 'MISSING_NAME'
        }
      });
    }

    // Validar especialidades (converter array para string)
    let specialtiesString = '';
    if (specialties.length > 0) {
      const invalidSpecialties = specialties.filter(s => !VALID_SPECIALTIES.includes(s));
      if (invalidSpecialties.length > 0) {
        return res.status(400).json({
          error: {
            message: `Especialidades inválidas: ${invalidSpecialties.join(', ')}`,
            code: 'INVALID_SPECIALTIES'
          }
        });
      }
      specialtiesString = specialties.join(', ');
    }

    const { data: mechanic, error } = await supabase
      .from('mechanics')
      .insert({
        name: name.trim(),
        phone: phone?.trim() || null,
        specialties: specialtiesString,
        active: true
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      data: mechanic,
      message: 'Mecânico criado com sucesso'
    });

    console.log('✅ Mecânico criado:', mechanic.name);
  } catch (error) {
    console.error('❌ Erro ao criar mecânico:', error);
    res.status(500).json({
      error: {
        message: 'Erro ao criar mecânico',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// 5. Atualizar mecânico
app.put('/api/mechanics/:id', authMiddleware, managerMiddleware, async (req, res) => {
  console.log('📥 Atualização de mecânico requisitada:', req.params.id);
  try {
    const { id } = req.params;
    const { 
      name, 
      phone, 
      specialties,
      active
    } = req.body;

    // Verificar se mecânico existe
    const { data: existingMechanic, error: findError } = await supabase
      .from('mechanics')
      .select('*')
      .eq('id', id)
      .single();

    if (findError) {
      if (findError.code === 'PGRST116') {
        return res.status(404).json({
          error: {
            message: 'Mecânico não encontrado',
            code: 'MECHANIC_NOT_FOUND'
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

    // Validar especialidades
    let specialtiesString = existingMechanic.specialties;
    if (specialties !== undefined && Array.isArray(specialties)) {
      if (specialties.length > 0) {
        const invalidSpecialties = specialties.filter(s => !VALID_SPECIALTIES.includes(s));
        if (invalidSpecialties.length > 0) {
          return res.status(400).json({
            error: {
              message: `Especialidades inválidas: ${invalidSpecialties.join(', ')}`,
              code: 'INVALID_SPECIALTIES'
            }
          });
        }
        specialtiesString = specialties.join(', ');
      } else {
        specialtiesString = '';
      }
    }

    // Preparar dados para atualização
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (specialties !== undefined) updateData.specialties = specialtiesString;
    if (active !== undefined) updateData.active = active;

    const { data: mechanic, error } = await supabase
      .from('mechanics')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: mechanic,
      message: 'Mecânico atualizado com sucesso'
    });

    console.log('✅ Mecânico atualizado:', mechanic.name);
  } catch (error) {
    console.error('❌ Erro ao atualizar mecânico:', error);
    res.status(500).json({
      error: {
        message: 'Erro ao atualizar mecânico',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// 6. Deletar mecânico (soft delete)
app.delete('/api/mechanics/:id', authMiddleware, adminMiddleware, async (req, res) => {
  console.log('📥 Exclusão de mecânico requisitada:', req.params.id);
  try {
    const { id } = req.params;

    // Verificar se mecânico existe
    const { data: existingMechanic, error: findError } = await supabase
      .from('mechanics')
      .select('name, active')
      .eq('id', id)
      .single();

    if (findError) {
      if (findError.code === 'PGRST116') {
        return res.status(404).json({
          error: {
            message: 'Mecânico não encontrado',
            code: 'MECHANIC_NOT_FOUND'
          }
        });
      }
      throw findError;
    }

    // Verificar se mecânico tem ordens de serviço ativas
    // TODO: Implementar verificação quando a tabela service_orders estiver pronta

    // Fazer soft delete (marcar como inativo)
    const { error } = await supabase
      .from('mechanics')
      .update({ 
        active: false
      })
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Mecânico desativado com sucesso'
    });

    console.log('✅ Mecânico desativado:', existingMechanic.name);
  } catch (error) {
    console.error('❌ Erro ao desativar mecânico:', error);
    res.status(500).json({
      error: {
        message: 'Erro ao desativar mecânico',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// 7. Buscar mecânicos por especialidade
app.get('/api/mechanics/search/specialty/:specialty', authMiddleware, async (req, res) => {
  console.log('📥 Busca de mecânicos por especialidade:', req.params.specialty);
  try {
    const { specialty } = req.params;
    const { limit = 10 } = req.query;

    if (!VALID_SPECIALTIES.includes(specialty)) {
      return res.status(400).json({
        error: {
          message: 'Especialidade inválida',
          code: 'INVALID_SPECIALTY'
        }
      });
    }

    const { data: mechanics, error } = await supabase
      .from('mechanics')
      .select('*')
      .ilike('specialties', `%${specialty}%`)
      .eq('active', true)
      .order('name', { ascending: true })
      .limit(parseInt(limit));

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: mechanics,
      message: `Mecânicos com especialidade em "${specialty}" encontrados`
    });
  } catch (error) {
    console.error('❌ Erro ao buscar mecânicos por especialidade:', error);
    res.status(500).json({
      error: {
        message: 'Erro ao buscar mecânicos por especialidade',
        code: 'DATABASE_ERROR'
      }
    });
  }
});



// 8. Relatório de mecânicos
app.get('/api/mechanics/reports/summary', authMiddleware, managerMiddleware, async (req, res) => {
  console.log('📥 Relatório de mecânicos requisitado');
  try {
    // Contar total de mecânicos ativos
    const { count: totalActive, error: activeError } = await supabase
      .from('mechanics')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);

    if (activeError) {
      throw activeError;
    }

    // Contar total de mecânicos inativos
    const { count: totalInactive, error: inactiveError } = await supabase
      .from('mechanics')
      .select('*', { count: 'exact', head: true })
      .eq('active', false);

    if (inactiveError) {
      throw inactiveError;
    }

    // Contar por especialidade
    const { data: mechanics, error: mechanicsError } = await supabase
      .from('mechanics')
      .select('specialties')
      .eq('active', true);

    if (mechanicsError) {
      throw mechanicsError;
    }

    const specialtyStats = {};
    VALID_SPECIALTIES.forEach(specialty => {
      specialtyStats[specialty] = 0;
    });

    mechanics.forEach(mechanic => {
      if (mechanic.specialties && typeof mechanic.specialties === 'string') {
        const mechanicSpecialties = mechanic.specialties.split(', ');
        mechanicSpecialties.forEach(specialty => {
          const trimmedSpecialty = specialty.trim();
          if (specialtyStats[trimmedSpecialty] !== undefined) {
            specialtyStats[trimmedSpecialty]++;
          }
        });
      }
    });

    // Mecânicos mais recentes (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { data: recentMechanics, error: recentError } = await supabase
      .from('mechanics')
      .select('name, created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentError) {
      throw recentError;
    }

    res.json({
      success: true,
      data: {
        summary: {
          totalActive: totalActive || 0,
          totalInactive: totalInactive || 0,
          total: (totalActive || 0) + (totalInactive || 0),
          specialtyStats
        },
        recentMechanics: recentMechanics || []
      },
      message: 'Relatório de mecânicos gerado'
    });
  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);
    res.status(500).json({
      error: {
        message: 'Erro ao gerar relatório de mecânicos',
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
  console.log(`🚀 Servidor API com Mecânicos rodando na porta ${PORT}`);
  console.log(`📊 Health: http://127.0.0.1:${PORT}/health`);
  console.log(`🔐 Login: POST http://127.0.0.1:${PORT}/api/auth/login`);
  console.log(`👥 Clientes: http://127.0.0.1:${PORT}/api/clients`);
  console.log(`🏢 Fornecedores: http://127.0.0.1:${PORT}/api/suppliers`);
  console.log(`🔧 Mecânicos: http://127.0.0.1:${PORT}/api/mechanics`);
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

console.log('🔍 Servidor com Mecânicos inicializado com sucesso!');