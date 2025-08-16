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

// Tipos de produto válidos
const PRODUCT_TYPES = ['product', 'service'];

// Funções utilitárias
const validatePrice = (price) => {
  return !isNaN(price) && parseFloat(price) >= 0;
};

const formatPrice = (price) => {
  return parseFloat(price).toFixed(2);
};

const validateBarcode = (barcode) => {
  if (!barcode) return true; // Código de barras é opcional
  // Validação básica - pode ser expandida conforme necessário
  return /^[0-9]{8,13}$/.test(barcode);
};

const generateProductCode = async () => {
  // Gerar código único baseado em timestamp e número aleatório
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const code = `PRD${timestamp}${random}`;
  
  // Verificar se já existe
  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('code', code)
    .single();
    
  if (existing) {
    // Se existir, tentar novamente
    return generateProductCode();
  }
  
  return code;
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
    modules: ['auth', 'clients', 'suppliers', 'mechanics', 'vehicles', 'products'],
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

// ==================== MÓDULO DE PRODUTOS E SERVIÇOS COMPLETO ====================

// 1. Listar produtos e serviços com busca e filtros
app.get('/api/products', authMiddleware, async (req, res) => {
  console.log('📥 Lista de produtos requisitada por:', req.user.email);
  try {
    const { 
      search, 
      page = 1, 
      limit = 10, 
      sortBy = 'name', 
      sortOrder = 'asc',
      type,
      active,
      min_price,
      max_price
    } = req.query;

    let query = supabase.from('products').select('*', { count: 'exact' });

    // Aplicar busca
    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%,barcode.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Filtrar por tipo
    if (type && PRODUCT_TYPES.includes(type)) {
      query = query.eq('type', type);
    }

    // Filtrar por ativo/inativo
    if (active !== undefined) {
      query = query.eq('active', active === 'true');
    }

    // Filtrar por faixa de preço
    if (min_price !== undefined && validatePrice(min_price)) {
      query = query.gte('price', parseFloat(min_price));
    }
    if (max_price !== undefined && validatePrice(max_price)) {
      query = query.lte('price', parseFloat(max_price));
    }

    // Aplicar ordenação
    const ascending = sortOrder === 'asc';
    query = query.order(sortBy, { ascending });

    // Aplicar paginação
    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;
    query = query.range(from, to);

    const { data: products, error, count } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit),
        hasNext: (page * limit) < count,
        hasPrev: page > 1
      },
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

// 2. Buscar produto por ID
app.get('/api/products/:id', authMiddleware, async (req, res) => {
  console.log('📥 Produto por ID requisitado:', req.params.id);
  try {
    const { id } = req.params;

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: {
            message: 'Produto não encontrado',
            code: 'PRODUCT_NOT_FOUND'
          }
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data: product,
      message: 'Produto encontrado'
    });
  } catch (error) {
    console.error('❌ Erro ao buscar produto:', error);
    res.status(500).json({
      error: {
        message: 'Erro ao buscar produto',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// 3. Buscar produto por código
app.get('/api/products/search/code/:code', authMiddleware, async (req, res) => {
  console.log('📥 Busca de produto por código:', req.params.code);
  try {
    const { code } = req.params;

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: {
            message: 'Produto não encontrado',
            code: 'PRODUCT_NOT_FOUND'
          }
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data: product,
      message: 'Produto encontrado'
    });
  } catch (error) {
    console.error('❌ Erro ao buscar produto por código:', error);
    res.status(500).json({
      error: {
        message: 'Erro ao buscar produto por código',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// 4. Buscar produto por código de barras
app.get('/api/products/search/barcode/:barcode', authMiddleware, async (req, res) => {
  console.log('📥 Busca de produto por código de barras:', req.params.barcode);
  try {
    const { barcode } = req.params;

    if (!validateBarcode(barcode)) {
      return res.status(400).json({
        error: {
          message: 'Código de barras inválido',
          code: 'INVALID_BARCODE'
        }
      });
    }

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('barcode', barcode)
      .eq('active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: {
            message: 'Produto não encontrado',
            code: 'PRODUCT_NOT_FOUND'
          }
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data: product,
      message: 'Produto encontrado'
    });
  } catch (error) {
    console.error('❌ Erro ao buscar produto por código de barras:', error);
    res.status(500).json({
      error: {
        message: 'Erro ao buscar produto por código de barras',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// 5. Criar produto ou serviço
app.post('/api/products', authMiddleware, managerMiddleware, async (req, res) => {
  console.log('📥 Criação de produto requisitada por:', req.user.email);
  try {
    const { 
      code,
      barcode, 
      name, 
      description, 
      price, 
      image_url,
      type = 'product'
    } = req.body;

    // Validações obrigatórias
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        error: {
          message: 'Nome é obrigatório',
          code: 'MISSING_NAME'
        }
      });
    }

    if (price === undefined || !validatePrice(price)) {
      return res.status(400).json({
        error: {
          message: 'Preço deve ser um número válido maior ou igual a zero',
          code: 'INVALID_PRICE'
        }
      });
    }

    if (!PRODUCT_TYPES.includes(type)) {
      return res.status(400).json({
        error: {
          message: 'Tipo deve ser "product" ou "service"',
          code: 'INVALID_TYPE'
        }
      });
    }

    // Validar código de barras se fornecido
    if (barcode && !validateBarcode(barcode)) {
      return res.status(400).json({
        error: {
          message: 'Código de barras inválido',
          code: 'INVALID_BARCODE'
        }
      });
    }

    // Gerar código se não fornecido
    const productCode = code ? code.toUpperCase() : await generateProductCode();

    // Verificar se código já existe
    const { data: existingCode } = await supabase
      .from('products')
      .select('id')
      .eq('code', productCode)
      .single();

    if (existingCode) {
      return res.status(409).json({
        error: {
          message: 'Código já existe',
          code: 'CODE_ALREADY_EXISTS'
        }
      });
    }

    // Verificar se código de barras já existe (se fornecido)
    if (barcode) {
      const { data: existingBarcode } = await supabase
        .from('products')
        .select('id')
        .eq('barcode', barcode)
        .single();

      if (existingBarcode) {
        return res.status(409).json({
          error: {
            message: 'Código de barras já existe',
            code: 'BARCODE_ALREADY_EXISTS'
          }
        });
      }
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        code: productCode,
        barcode: barcode || null,
        name: name.trim(),
        description: description?.trim() || null,
        price: formatPrice(price),
        image_url: image_url?.trim() || null,
        type,
        active: true
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      data: product,
      message: `${type === 'product' ? 'Produto' : 'Serviço'} criado com sucesso`
    });

    console.log('✅ Produto criado:', product.code, '-', product.name);
  } catch (error) {
    console.error('❌ Erro ao criar produto:', error);
    res.status(500).json({
      error: {
        message: 'Erro ao criar produto',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// 6. Atualizar produto
app.put('/api/products/:id', authMiddleware, managerMiddleware, async (req, res) => {
  console.log('📥 Atualização de produto requisitada:', req.params.id);
  try {
    const { id } = req.params;
    const { 
      code,
      barcode, 
      name, 
      description, 
      price, 
      image_url,
      type,
      active
    } = req.body;

    // Verificar se produto existe
    const { data: existingProduct, error: findError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (findError) {
      if (findError.code === 'PGRST116') {
        return res.status(404).json({
          error: {
            message: 'Produto não encontrado',
            code: 'PRODUCT_NOT_FOUND'
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

    if (price !== undefined && !validatePrice(price)) {
      return res.status(400).json({
        error: {
          message: 'Preço deve ser um número válido maior ou igual a zero',
          code: 'INVALID_PRICE'
        }
      });
    }

    if (type !== undefined && !PRODUCT_TYPES.includes(type)) {
      return res.status(400).json({
        error: {
          message: 'Tipo deve ser "product" ou "service"',
          code: 'INVALID_TYPE'
        }
      });
    }

    if (barcode !== undefined && barcode && !validateBarcode(barcode)) {
      return res.status(400).json({
        error: {
          message: 'Código de barras inválido',
          code: 'INVALID_BARCODE'
        }
      });
    }

    // Verificar duplicatas (apenas se os valores mudaram)
    if (code !== undefined && code.toUpperCase() !== existingProduct.code) {
      const { data: duplicateCode } = await supabase
        .from('products')
        .select('id')
        .eq('code', code.toUpperCase())
        .neq('id', id)
        .single();

      if (duplicateCode) {
        return res.status(409).json({
          error: {
            message: 'Código já existe',
            code: 'CODE_ALREADY_EXISTS'
          }
        });
      }
    }

    if (barcode !== undefined && barcode && barcode !== existingProduct.barcode) {
      const { data: duplicateBarcode } = await supabase
        .from('products')
        .select('id')
        .eq('barcode', barcode)
        .neq('id', id)
        .single();

      if (duplicateBarcode) {
        return res.status(409).json({
          error: {
            message: 'Código de barras já existe',
            code: 'BARCODE_ALREADY_EXISTS'
          }
        });
      }
    }

    // Preparar dados para atualização
    const updateData = {};
    if (code !== undefined) updateData.code = code.toUpperCase();
    if (barcode !== undefined) updateData.barcode = barcode || null;
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (price !== undefined) updateData.price = formatPrice(price);
    if (image_url !== undefined) updateData.image_url = image_url?.trim() || null;
    if (type !== undefined) updateData.type = type;
    if (active !== undefined) updateData.active = active;

    const { data: product, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: product,
      message: 'Produto atualizado com sucesso'
    });

    console.log('✅ Produto atualizado:', product.code);
  } catch (error) {
    console.error('❌ Erro ao atualizar produto:', error);
    res.status(500).json({
      error: {
        message: 'Erro ao atualizar produto',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// 7. Deletar produto (soft delete)
app.delete('/api/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  console.log('📥 Exclusão de produto requisitada:', req.params.id);
  try {
    const { id } = req.params;

    // Verificar se produto existe
    const { data: existingProduct, error: findError } = await supabase
      .from('products')
      .select('code, name, type')
      .eq('id', id)
      .single();

    if (findError) {
      if (findError.code === 'PGRST116') {
        return res.status(404).json({
          error: {
            message: 'Produto não encontrado',
            code: 'PRODUCT_NOT_FOUND'
          }
        });
      }
      throw findError;
    }

    // Verificar se produto tem dependências (vendas, ordens de serviço)
    // TODO: Implementar verificação quando as tabelas estiverem prontas

    // Fazer soft delete (marcar como inativo)
    const { error } = await supabase
      .from('products')
      .update({ active: false })
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: `${existingProduct.type === 'product' ? 'Produto' : 'Serviço'} desativado com sucesso`
    });

    console.log('✅ Produto desativado:', existingProduct.code, '-', existingProduct.name);
  } catch (error) {
    console.error('❌ Erro ao desativar produto:', error);
    res.status(500).json({
      error: {
        message: 'Erro ao desativar produto',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// 8. Listar apenas produtos
app.get('/api/products/type/products', authMiddleware, async (req, res) => {
  console.log('📥 Lista de produtos (apenas) requisitada');
  try {
    const { limit = 50, active = 'true' } = req.query;

    let query = supabase
      .from('products')
      .select('*')
      .eq('type', 'product');

    if (active !== undefined) {
      query = query.eq('active', active === 'true');
    }

    query = query
      .order('name', { ascending: true })
      .limit(parseInt(limit));

    const { data: products, error } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: products,
      message: 'Produtos listados'
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

// 9. Listar apenas serviços
app.get('/api/products/type/services', authMiddleware, async (req, res) => {
  console.log('📥 Lista de serviços (apenas) requisitada');
  try {
    const { limit = 50, active = 'true' } = req.query;

    let query = supabase
      .from('products')
      .select('*')
      .eq('type', 'service');

    if (active !== undefined) {
      query = query.eq('active', active === 'true');
    }

    query = query
      .order('name', { ascending: true })
      .limit(parseInt(limit));

    const { data: services, error } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: services,
      message: 'Serviços listados'
    });
  } catch (error) {
    console.error('❌ Erro ao listar serviços:', error);
    res.status(500).json({
      error: {
        message: 'Erro ao buscar serviços',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// 10. Relatório de produtos e serviços
app.get('/api/products/reports/summary', authMiddleware, managerMiddleware, async (req, res) => {
  console.log('📥 Relatório de produtos requisitado');
  try {
    // Contar total de produtos ativos
    const { count: totalProducts, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'product')
      .eq('active', true);

    if (productsError) {
      throw productsError;
    }

    // Contar total de serviços ativos
    const { count: totalServices, error: servicesError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'service')
      .eq('active', true);

    if (servicesError) {
      throw servicesError;
    }

    // Contar total de inativos
    const { count: totalInactive, error: inactiveError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('active', false);

    if (inactiveError) {
      throw inactiveError;
    }

    // Produtos mais caros
    const { data: expensiveProducts, error: expensiveError } = await supabase
      .from('products')
      .select('code, name, price, type')
      .eq('active', true)
      .order('price', { ascending: false })
      .limit(5);

    if (expensiveError) {
      throw expensiveError;
    }

    // Produtos mais baratos
    const { data: cheapProducts, error: cheapError } = await supabase
      .from('products')
      .select('code, name, price, type')
      .eq('active', true)
      .order('price', { ascending: true })
      .limit(5);

    if (cheapError) {
      throw cheapError;
    }

    // Produtos recentes (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { data: recentProducts, error: recentError } = await supabase
      .from('products')
      .select('code, name, type, price, created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentError) {
      throw recentError;
    }

    // Estatísticas de preço
    const { data: priceStats, error: priceError } = await supabase
      .from('products')
      .select('price')
      .eq('active', true);

    if (priceError) {
      throw priceError;
    }

    let avgPrice = 0;
    let minPrice = 0;
    let maxPrice = 0;

    if (priceStats && priceStats.length > 0) {
      const prices = priceStats.map(p => parseFloat(p.price));
      avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      minPrice = Math.min(...prices);
      maxPrice = Math.max(...prices);
    }

    res.json({
      success: true,
      data: {
        summary: {
          totalProducts: totalProducts || 0,
          totalServices: totalServices || 0,
          totalActive: (totalProducts || 0) + (totalServices || 0),
          totalInactive: totalInactive || 0,
          total: (totalProducts || 0) + (totalServices || 0) + (totalInactive || 0),
          priceStats: {
            average: parseFloat(avgPrice.toFixed(2)),
            minimum: minPrice,
            maximum: maxPrice
          }
        },
        expensiveProducts: expensiveProducts || [],
        cheapProducts: cheapProducts || [],
        recentProducts: recentProducts || []
      },
      message: 'Relatório de produtos gerado'
    });
  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);
    res.status(500).json({
      error: {
        message: 'Erro ao gerar relatório de produtos',
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
  console.log(`🚀 Servidor API com Produtos e Serviços rodando na porta ${PORT}`);
  console.log(`� Healtho: http://127.0.0.1:${PORT}/health`);
  console.log(`🔐 Login: POST http://127.0.0.1:${PORT}/api/auth/login`);
  console.log(`👥 Clientes: http://127.0.0.1:${PORT}/api/clients`);
  console.log(`🏢 Fornecedores: http://127.0.0.1:${PORT}/api/suppliers`);
  console.log(`🔧 Mecânicos: http://127.0.0.1:${PORT}/api/mechanics`);
  console.log(`� Veículoso: http://127.0.0.1:${PORT}/api/vehicles`);
  console.log(`📦 Produtos: http://127.0.0.1:${PORT}/api/products`);
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

console.log('🔍 Servidor com Produtos e Serviços inicializado com sucesso!');