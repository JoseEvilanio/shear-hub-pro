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

// Tipos de movimentação válidos
const MOVEMENT_TYPES = ['entrada', 'saida', 'ajuste', 'transferencia'];
const REFERENCE_TYPES = ['venda', 'compra', 'ajuste', 'ordem_servico', 'transferencia'];

// Funções utilitárias
const validateQuantity = (quantity) => {
  return Number.isInteger(quantity) && quantity > 0;
};

const validatePrice = (price) => {
  return !isNaN(price) && parseFloat(price) >= 0;
};

const formatPrice = (price) => {
  return parseFloat(price).toFixed(2);
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
    modules: ['auth', 'clients', 'suppliers', 'mechanics', 'vehicles', 'products', 'inventory'],
    endpoints: {
      auth: '/api/auth',
      clients: '/api/clients',
      suppliers: '/api/suppliers',
      mechanics: '/api/mechanics',
      vehicles: '/api/vehicles',
      products: '/api/products',
      inventory: '/api/inventory',
      serviceOrders: '/api/service-orders',
      sales: '/api/sales',
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

// ==================== ENDPOINT TEMPORÁRIO PARA VERIFICAR TABELAS ====================
app.get('/api/inventory/check-tables', authMiddleware, async (req, res) => {
  console.log('📥 Verificação de tabelas requisitada');
  try {
    // Tentar buscar uma linha da tabela inventory
    const { data: inventoryCheck, error: inventoryError } = await supabase
      .from('inventory')
      .select('id')
      .limit(1);

    // Tentar buscar uma linha da tabela inventory_movements
    const { data: movementsCheck, error: movementsError } = await supabase
      .from('inventory_movements')
      .select('id')
      .limit(1);

    res.json({
      success: true,
      data: {
        inventory_table: inventoryError ? 'NOT_EXISTS' : 'EXISTS',
        movements_table: movementsError ? 'NOT_EXISTS' : 'EXISTS',
        inventory_error: inventoryError?.message || null,
        movements_error: movementsError?.message || null
      },
      message: 'Verificação de tabelas concluída'
    });
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error);
    res.status(500).json({
      error: {
        message: 'Erro ao verificar tabelas',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// ==================== MÓDULO DE CONTROLE DE ESTOQUE SIMULADO ====================

// Dados simulados de estoque (em produção, isso viria do banco de dados)
let simulatedInventory = [
  {
    id: '1',
    product_id: null, // Será preenchido dinamicamente
    quantity: 25,
    min_stock: 5,
    max_stock: 100,
    location: 'Estoque Principal',
    updated_at: new Date().toISOString()
  },
  {
    id: '2', 
    product_id: null,
    quantity: 30,
    min_stock: 10,
    max_stock: 100,
    location: 'Estoque Principal',
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    product_id: null,
    quantity: 15,
    min_stock: 5,
    max_stock: 50,
    location: 'Estoque Principal',
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    product_id: null,
    quantity: 3, // Estoque baixo
    min_stock: 5,
    max_stock: 50,
    location: 'Estoque Principal',
    updated_at: new Date().toISOString()
  }
];

let simulatedMovements = [];

// 1. Listar estoque atual com informações dos produtos
app.get('/api/inventory', authMiddleware, async (req, res) => {
  console.log('📥 Lista de estoque requisitada por:', req.user.email);
  try {
    const { 
      search, 
      page = 1, 
      limit = 10, 
      sortBy = 'product_name', 
      sortOrder = 'asc',
      low_stock = 'false',
      out_of_stock = 'false'
    } = req.query;

    // Buscar produtos do tipo 'product' para associar ao estoque
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('type', 'product')
      .eq('active', true);

    if (productsError) {
      throw productsError;
    }

    // Associar produtos ao estoque simulado
    let inventory = simulatedInventory.map((item, index) => {
      const product = products[index] || null;
      return {
        ...item,
        product_id: product?.id || null,
        product: product
      };
    }).filter(item => item.product); // Apenas itens com produtos válidos

    // Aplicar filtros
    if (search) {
      inventory = inventory.filter(item => 
        item.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.product?.code?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (low_stock === 'true') {
      inventory = inventory.filter(item => item.quantity <= item.min_stock);
    }

    if (out_of_stock === 'true') {
      inventory = inventory.filter(item => item.quantity === 0);
    }

    // Ordenação
    if (sortBy === 'product_name') {
      inventory.sort((a, b) => {
        const nameA = a.product?.name || '';
        const nameB = b.product?.name || '';
        return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      });
    }

    // Paginação
    const total = inventory.length;
    const from = (page - 1) * limit;
    const to = from + parseInt(limit);
    const paginatedInventory = inventory.slice(from, to);

    res.json({
      success: true,
      data: paginatedInventory,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        totalPages: Math.ceil(total / limit),
        hasNext: to < total,
        hasPrev: page > 1
      },
      message: 'Estoque listado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao listar estoque:', error);
    res.status(500).json({
      error: {
        message: 'Erro ao buscar estoque',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// 2. Buscar estoque de um produto específico
app.get('/api/inventory/product/:product_id', authMiddleware, async (req, res) => {
  console.log('📥 Estoque de produto requisitado:', req.params.product_id);
  try {
    const { product_id } = req.params;

    // Buscar produto
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      return res.status(404).json({
        error: {
          message: 'Produto não encontrado',
          code: 'PRODUCT_NOT_FOUND'
        }
      });
    }

    // Buscar no estoque simulado
    const inventoryItem = simulatedInventory.find(item => item.product_id === product_id);
    
    if (!inventoryItem) {
      return res.status(404).json({
        error: {
          message: 'Produto não encontrado no estoque',
          code: 'INVENTORY_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: {
        ...inventoryItem,
        product
      },
      message: 'Estoque do produto encontrado'
    });
  } catch (error) {
    console.error('❌ Erro ao buscar estoque do produto:', error);
    res.status(500).json({
      error: {
        message: 'Erro ao buscar estoque do produto',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// 3. Registrar movimentação de estoque (entrada/saída/ajuste)
app.post('/api/inventory/movement', authMiddleware, managerMiddleware, async (req, res) => {
  console.log('📥 Movimentação de estoque requisitada por:', req.user.email);
  try {
    const { 
      product_id, 
      movement_type, 
      quantity, 
      unit_cost,
      reason,
      reference_type,
      reference_id,
      notes
    } = req.body;

    // Validações
    if (!product_id || !movement_type || !quantity) {
      return res.status(400).json({
        error: {
          message: 'Produto, tipo de movimentação e quantidade são obrigatórios',
          code: 'MISSING_REQUIRED_FIELDS'
        }
      });
    }

    if (!MOVEMENT_TYPES.includes(movement_type)) {
      return res.status(400).json({
        error: {
          message: 'Tipo de movimentação inválido',
          code: 'INVALID_MOVEMENT_TYPE'
        }
      });
    }

    if (!validateQuantity(quantity)) {
      return res.status(400).json({
        error: {
          message: 'Quantidade deve ser um número inteiro positivo',
          code: 'INVALID_QUANTITY'
        }
      });
    }

    // Verificar se produto existe
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, code, name, type, active')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      return res.status(404).json({
        error: {
          message: 'Produto não encontrado',
          code: 'PRODUCT_NOT_FOUND'
        }
      });
    }

    if (product.type !== 'product') {
      return res.status(400).json({
        error: {
          message: 'Apenas produtos físicos podem ter controle de estoque',
          code: 'INVALID_PRODUCT_TYPE'
        }
      });
    }

    // Buscar no estoque simulado
    let inventoryIndex = simulatedInventory.findIndex(item => item.product_id === product_id);
    
    // Se não existe, criar entrada
    if (inventoryIndex === -1) {
      simulatedInventory.push({
        id: (simulatedInventory.length + 1).toString(),
        product_id,
        quantity: 0,
        min_stock: 5,
        max_stock: 100,
        location: 'Estoque Principal',
        updated_at: new Date().toISOString()
      });
      inventoryIndex = simulatedInventory.length - 1;
    }

    const currentInventory = simulatedInventory[inventoryIndex];
    const previousQuantity = currentInventory.quantity;
    let newQuantity;

    // Calcular nova quantidade
    switch (movement_type) {
      case 'entrada':
        newQuantity = previousQuantity + quantity;
        break;
      case 'saida':
        newQuantity = previousQuantity - quantity;
        if (newQuantity < 0) {
          return res.status(400).json({
            error: {
              message: 'Quantidade insuficiente em estoque',
              code: 'INSUFFICIENT_STOCK'
            }
          });
        }
        break;
      case 'ajuste':
        newQuantity = quantity;
        break;
      case 'transferencia':
        newQuantity = previousQuantity - quantity;
        if (newQuantity < 0) {
          return res.status(400).json({
            error: {
              message: 'Quantidade insuficiente para transferência',
              code: 'INSUFFICIENT_STOCK'
            }
          });
        }
        break;
      default:
        return res.status(400).json({
          error: {
            message: 'Tipo de movimentação não implementado',
            code: 'MOVEMENT_TYPE_NOT_IMPLEMENTED'
          }
        });
    }

    // Atualizar estoque simulado
    simulatedInventory[inventoryIndex].quantity = newQuantity;
    simulatedInventory[inventoryIndex].updated_at = new Date().toISOString();

    // Registrar movimentação
    const movement = {
      id: (simulatedMovements.length + 1).toString(),
      product_id,
      movement_type,
      quantity: movement_type === 'saida' || movement_type === 'transferencia' ? -quantity : quantity,
      previous_quantity: previousQuantity,
      new_quantity: newQuantity,
      unit_cost: unit_cost ? formatPrice(unit_cost) : null,
      total_cost: unit_cost ? formatPrice(unit_cost * quantity) : null,
      reason: reason?.trim() || null,
      reference_type: reference_type || null,
      reference_id: reference_id || null,
      user_id: req.user.userId,
      notes: notes?.trim() || null,
      created_at: new Date().toISOString()
    };

    simulatedMovements.push(movement);

    res.status(201).json({
      success: true,
      data: {
        movement,
        previousQuantity,
        newQuantity,
        product: {
          code: product.code,
          name: product.name
        }
      },
      message: 'Movimentação registrada com sucesso'
    });

    console.log('✅ Movimentação registrada:', product.code, movement_type, quantity);
  } catch (error) {
    console.error('❌ Erro ao registrar movimentação:', error);
    res.status(500).json({
      error: {
        message: 'Erro ao registrar movimentação',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// 4. Listar movimentações de estoque
app.get('/api/inventory/movements', authMiddleware, async (req, res) => {
  console.log('📥 Lista de movimentações requisitada por:', req.user.email);
  try {
    const { 
      product_id,
      movement_type,
      page = 1, 
      limit = 20, 
      sortOrder = 'desc'
    } = req.query;

    let movements = [...simulatedMovements];

    // Aplicar filtros
    if (product_id) {
      movements = movements.filter(m => m.product_id === product_id);
    }

    if (movement_type && MOVEMENT_TYPES.includes(movement_type)) {
      movements = movements.filter(m => m.movement_type === movement_type);
    }

    // Buscar informações dos produtos se houver movimentações
    let products = [];
    if (movements.length > 0) {
      const productIds = [...new Set(movements.map(m => m.product_id))];
      const { data: productsData } = await supabase
        .from('products')
        .select('id, code, name')
        .in('id', productIds);
      products = productsData || [];
    }

    // Enriquecer movimentações com dados dos produtos
    movements = movements.map(movement => ({
      ...movement,
      product: products.find(p => p.id === movement.product_id) || { code: 'N/A', name: 'Produto não encontrado' }
    }));

    // Ordenação por data
    movements.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    // Paginação
    const total = movements.length;
    const from = (page - 1) * limit;
    const to = from + parseInt(limit);
    const paginatedMovements = movements.slice(from, to);

    res.json({
      success: true,
      data: paginatedMovements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        totalPages: Math.ceil(total / limit),
        hasNext: to < total,
        hasPrev: page > 1
      },
      message: 'Movimentações listadas com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao listar movimentações:', error);
    res.status(500).json({
      error: {
        message: 'Erro ao buscar movimentações',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// 5. Atualizar configurações de estoque (min/max)
app.put('/api/inventory/:product_id/config', authMiddleware, managerMiddleware, async (req, res) => {
  console.log('📥 Atualização de configuração de estoque:', req.params.product_id);
  try {
    const { product_id } = req.params;
    const { min_stock, max_stock, location } = req.body;

    // Validações
    if (min_stock !== undefined && (!Number.isInteger(min_stock) || min_stock < 0)) {
      return res.status(400).json({
        error: {
          message: 'Estoque mínimo deve ser um número inteiro não negativo',
          code: 'INVALID_MIN_STOCK'
        }
      });
    }

    if (max_stock !== undefined && (!Number.isInteger(max_stock) || max_stock < 0)) {
      return res.status(400).json({
        error: {
          message: 'Estoque máximo deve ser um número inteiro não negativo',
          code: 'INVALID_MAX_STOCK'
        }
      });
    }

    if (min_stock !== undefined && max_stock !== undefined && min_stock > max_stock) {
      return res.status(400).json({
        error: {
          message: 'Estoque mínimo não pode ser maior que o máximo',
          code: 'INVALID_STOCK_RANGE'
        }
      });
    }

    // Verificar se produto existe
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, code, name, type')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      return res.status(404).json({
        error: {
          message: 'Produto não encontrado',
          code: 'PRODUCT_NOT_FOUND'
        }
      });
    }

    if (product.type !== 'product') {
      return res.status(400).json({
        error: {
          message: 'Apenas produtos físicos podem ter configuração de estoque',
          code: 'INVALID_PRODUCT_TYPE'
        }
      });
    }

    // Preparar dados para atualização
    const updateData = {};
    if (min_stock !== undefined) updateData.min_stock = min_stock;
    if (max_stock !== undefined) updateData.max_stock = max_stock;
    if (location !== undefined) updateData.location = location?.trim() || null;

    const { data: inventory, error } = await supabase
      .from('inventory')
      .update(updateData)
      .eq('product_id', product_id)
      .select(`
        *,
        product:products(id, code, name)
      `)
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: inventory,
      message: 'Configuração de estoque atualizada'
    });

    console.log('✅ Configuração atualizada:', product.code);
  } catch (error) {
    console.error('❌ Erro ao atualizar configuração:', error);
    res.status(500).json({
      error: {
        message: 'Erro ao atualizar configuração de estoque',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// 6. Relatório de estoque simplificado
app.get('/api/inventory/reports/summary', authMiddleware, managerMiddleware, async (req, res) => {
  console.log('📥 Relatório de estoque requisitado');
  try {
    // Buscar produtos para associar ao estoque
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('type', 'product')
      .eq('active', true);

    if (productsError) {
      throw productsError;
    }

    // Associar produtos ao estoque simulado
    let inventory = simulatedInventory.map((item, index) => {
      const product = products[index] || null;
      return {
        ...item,
        product_id: product?.id || null,
        product: product
      };
    }).filter(item => item.product);

    // Calcular estatísticas
    const totalProducts = inventory.length;
    const lowStockProducts = inventory.filter(item => item.quantity <= item.min_stock);
    const outOfStockProducts = inventory.filter(item => item.quantity === 0);
    
    // Calcular valor total do estoque
    let totalValue = 0;
    inventory.forEach(item => {
      if (item.product && item.product.price) {
        totalValue += item.quantity * parseFloat(item.product.price);
      }
    });

    // Movimentações recentes (simuladas)
    const recentMovements = simulatedMovements.slice(-10).map(movement => {
      const product = products.find(p => p.id === movement.product_id);
      return {
        ...movement,
        product: product ? { code: product.code, name: product.name } : null
      };
    });

    // Produtos mais movimentados
    const productMovements = {};
    simulatedMovements.forEach(movement => {
      const productId = movement.product_id;
      if (!productMovements[productId]) {
        const product = products.find(p => p.id === productId);
        productMovements[productId] = {
          product: product ? { code: product.code, name: product.name } : null,
          totalMovements: 0,
          totalQuantity: 0
        };
      }
      productMovements[productId].totalMovements++;
      productMovements[productId].totalQuantity += Math.abs(movement.quantity);
    });

    const topMoved = Object.values(productMovements)
      .filter(item => item.product)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        summary: {
          totalProducts,
          lowStockCount: lowStockProducts.length,
          outOfStockCount: outOfStockProducts.length,
          totalValue: parseFloat(totalValue.toFixed(2)),
          totalMovements: simulatedMovements.length
        },
        lowStockProducts,
        outOfStockProducts,
        recentMovements,
        topMovedProducts: topMoved
      },
      message: 'Relatório de estoque gerado'
    });
  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);
    res.status(500).json({
      error: {
        message: 'Erro ao gerar relatório de estoque',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

// 7. Alertas de estoque baixo
app.get('/api/inventory/alerts/low-stock', authMiddleware, async (req, res) => {
  console.log('📥 Alertas de estoque baixo requisitados');
  try {
    const { data: alerts, error } = await supabase
      .from('inventory')
      .select(`
        *,
        product:products(id, code, name, price, active)
      `)
      .filter('quantity', 'lte', 'min_stock')
      .eq('product.active', true)
      .order('quantity', { ascending: true });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: alerts,
      count: alerts?.length || 0,
      message: 'Alertas de estoque baixo'
    });
  } catch (error) {
    console.error('❌ Erro ao buscar alertas:', error);
    res.status(500).json({
      error: {
        message: 'Erro ao buscar alertas de estoque',
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
  console.log(`🚀 Servidor API com Controle de Estoque rodando na porta ${PORT}`);
  console.log(`📊 Health: http://127.0.0.1:${PORT}/health`);
  console.log(`🔐 Login: POST http://127.0.0.1:${PORT}/api/auth/login`);
  console.log(`👥 Clientes: http://127.0.0.1:${PORT}/api/clients`);
  console.log(`🏢 Fornecedores: http://127.0.0.1:${PORT}/api/suppliers`);
  console.log(`🔧 Mecânicos: http://127.0.0.1:${PORT}/api/mechanics`);
  console.log(`🚗 Veículos: http://127.0.0.1:${PORT}/api/vehicles`);
  console.log(`📦 Produtos: http://127.0.0.1:${PORT}/api/products`);
  console.log(`📊 Estoque: http://127.0.0.1:${PORT}/api/inventory`);
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

console.log('🔍 Servidor com Controle de Estoque inicializado com sucesso!');