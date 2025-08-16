const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3011;

// Middleware
app.use(cors());
app.use(express.json());

// Dados simulados para demonstração
let sales = [
  {
    id: '1',
    number: 'VND-001',
    client_id: '1',
    client_name: 'João Silva',
    user_id: 'admin',
    user_name: 'Administrador',
    type: 'sale', // sale ou quote
    status: 'completed',
    subtotal: 100.00,
    discount_amount: 10.00,
    total_amount: 90.00,
    payment_method: 'cash',
    payment_terms: 'cash', // cash, installments
    installments: 1,
    paid: true,
    notes: 'Venda à vista com desconto',
    created_at: '2024-01-25T10:00:00Z',
    updated_at: '2024-01-25T10:00:00Z',
    items: [
      {
        id: '1',
        product_id: '1',
        product_name: 'Óleo Motor 20W50',
        product_barcode: '7891234567890',
        quantity: 2,
        unit_price: 25.00,
        discount_amount: 5.00,
        total_price: 45.00
      },
      {
        id: '2',
        product_id: '2',
        product_name: 'Filtro de Óleo',
        product_barcode: '7891234567891',
        quantity: 5,
        unit_price: 10.00,
        discount_amount: 5.00,
        total_price: 45.00
      }
    ]
  },
  {
    id: '2',
    number: 'ORC-001',
    client_id: '2',
    client_name: 'Maria Santos',
    user_id: 'admin',
    user_name: 'Administrador',
    type: 'quote',
    status: 'pending',
    subtotal: 150.00,
    discount_amount: 0.00,
    total_amount: 150.00,
    payment_method: 'installments',
    payment_terms: 'installments',
    installments: 3,
    paid: false,
    notes: 'Orçamento para revisão completa',
    created_at: '2024-02-01T14:30:00Z',
    updated_at: '2024-02-01T14:30:00Z',
    items: [
      {
        id: '3',
        product_id: '3',
        product_name: 'Kit Filtros',
        product_barcode: '7891234567892',
        quantity: 1,
        unit_price: 45.00,
        discount_amount: 0.00,
        total_price: 45.00
      },
      {
        id: '4',
        product_id: '4',
        product_name: 'Pastilha de Freio',
        product_barcode: '7891234567893',
        quantity: 1,
        unit_price: 105.00,
        discount_amount: 0.00,
        total_price: 105.00
      }
    ]
  }
];

// Status possíveis para vendas
const validStatuses = [
  'pending',    // Pendente (orçamentos)
  'approved',   // Aprovado (orçamento aprovado)
  'completed',  // Concluída (venda finalizada)
  'cancelled'   // Cancelada
];

const validTypes = ['sale', 'quote']; // sale = venda, quote = orçamento
const validPaymentMethods = ['cash', 'card', 'pix', 'installments', 'bank_transfer'];
const validPaymentTerms = ['cash', 'installments'];

// Dados simulados de referência
let clients = [
  { id: '1', name: 'João Silva', phone: '(11) 99999-1111', email: 'joao@email.com' },
  { id: '2', name: 'Maria Santos', phone: '(11) 99999-2222', email: 'maria@email.com' },
  { id: '3', name: 'Pedro Costa', phone: '(11) 99999-3333', email: 'pedro@email.com' }
];

let products = [
  { 
    id: '1', 
    name: 'Óleo Motor 20W50', 
    barcode: '7891234567890',
    price: 25.00, 
    stock: 50,
    type: 'product',
    active: true
  },
  { 
    id: '2', 
    name: 'Filtro de Óleo', 
    barcode: '7891234567891',
    price: 10.00, 
    stock: 30,
    type: 'product',
    active: true
  },
  { 
    id: '3', 
    name: 'Kit Filtros', 
    barcode: '7891234567892',
    price: 45.00, 
    stock: 20,
    type: 'product',
    active: true
  },
  { 
    id: '4', 
    name: 'Pastilha de Freio', 
    barcode: '7891234567893',
    price: 105.00, 
    stock: 15,
    type: 'product',
    active: true
  },
  { 
    id: '5', 
    name: 'Revisão Completa', 
    barcode: null,
    price: 150.00, 
    stock: null,
    type: 'service',
    active: true
  }
];

let nextId = 3;
let nextSaleNumber = 2;
let nextQuoteNumber = 2;

// Função para gerar próximo número de venda/orçamento
function generateNextNumber(type) {
  if (type === 'sale') {
    return `VND-${String(nextSaleNumber++).padStart(3, '0')}`;
  } else {
    return `ORC-${String(nextQuoteNumber++).padStart(3, '0')}`;
  }
}

// Função para calcular totais da venda
function calculateTotals(items, globalDiscount = 0) {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const itemsDiscount = items.reduce((sum, item) => sum + (item.discount_amount || 0), 0);
  const totalDiscount = itemsDiscount + globalDiscount;
  const total = subtotal - totalDiscount;
  
  return {
    subtotal: subtotal,
    discount_amount: totalDiscount,
    total_amount: Math.max(0, total) // Não permitir total negativo
  };
}

// Função para validar itens da venda
function validateItems(items) {
  if (!Array.isArray(items) || items.length === 0) return false;
  
  return items.every(item => 
    item.product_id && 
    item.quantity > 0 && 
    item.unit_price >= 0 &&
    (item.discount_amount === undefined || item.discount_amount >= 0)
  );
}

// GET /api/sales - Listar todas as vendas
app.get('/api/sales', (req, res) => {
  try {
    const { 
      type, 
      status, 
      client_id, 
      user_id,
      payment_method,
      date_from, 
      date_to,
      search 
    } = req.query;
    
    let filteredSales = [...sales];

    // Filtro por tipo
    if (type && validTypes.includes(type)) {
      filteredSales = filteredSales.filter(sale => sale.type === type);
    }

    // Filtro por status
    if (status && validStatuses.includes(status)) {
      filteredSales = filteredSales.filter(sale => sale.status === status);
    }

    // Filtro por cliente
    if (client_id) {
      filteredSales = filteredSales.filter(sale => sale.client_id === client_id);
    }

    // Filtro por usuário
    if (user_id) {
      filteredSales = filteredSales.filter(sale => sale.user_id === user_id);
    }

    // Filtro por método de pagamento
    if (payment_method && validPaymentMethods.includes(payment_method)) {
      filteredSales = filteredSales.filter(sale => sale.payment_method === payment_method);
    }

    // Filtro por período
    if (date_from) {
      filteredSales = filteredSales.filter(sale => 
        new Date(sale.created_at) >= new Date(date_from)
      );
    }
    if (date_to) {
      filteredSales = filteredSales.filter(sale => 
        new Date(sale.created_at) <= new Date(date_to)
      );
    }

    // Busca geral
    if (search) {
      const searchLower = search.toLowerCase();
      filteredSales = filteredSales.filter(sale =>
        sale.number.toLowerCase().includes(searchLower) ||
        sale.client_name.toLowerCase().includes(searchLower) ||
        (sale.notes && sale.notes.toLowerCase().includes(searchLower))
      );
    }

    // Ordenar por data de criação (mais recentes primeiro)
    filteredSales.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({
      success: true,
      data: filteredSales,
      total: filteredSales.length,
      filters_applied: {
        type, status, client_id, user_id, payment_method, date_from, date_to, search
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// GET /api/sales/:id - Buscar venda por ID
app.get('/api/sales/:id', (req, res) => {
  try {
    const { id } = req.params;
    const sale = sales.find(s => s.id === id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Venda não encontrada'
      });
    }

    res.json({
      success: true,
      data: sale
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// GET /api/sales/number/:number - Buscar venda por número
app.get('/api/sales/number/:number', (req, res) => {
  try {
    const { number } = req.params;
    const sale = sales.find(s => 
      s.number.toLowerCase() === number.toLowerCase()
    );

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Venda não encontrada'
      });
    }

    res.json({
      success: true,
      data: sale
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// POST /api/sales - Criar nova venda
app.post('/api/sales', (req, res) => {
  try {
    const {
      client_id,
      type = 'sale',
      payment_method = 'cash',
      payment_terms = 'cash',
      installments = 1,
      global_discount = 0,
      notes,
      items = []
    } = req.body;

    // Validações obrigatórias
    if (!client_id || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: client_id, items (deve ter pelo menos 1 item)',
        required_fields: ['client_id', 'items']
      });
    }

    // Validar tipo
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo inválido',
        valid_types: validTypes
      });
    }

    // Validar método de pagamento
    if (!validPaymentMethods.includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: 'Método de pagamento inválido',
        valid_payment_methods: validPaymentMethods
      });
    }

    // Verificar se cliente existe
    const client = clients.find(c => c.id === client_id);
    if (!client) {
      return res.status(400).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    // Validar itens
    if (!validateItems(items)) {
      return res.status(400).json({
        success: false,
        message: 'Itens inválidos. Verifique product_id, quantity e unit_price'
      });
    }

    // Verificar estoque para produtos (não serviços)
    for (const item of items) {
      const product = products.find(p => p.id === item.product_id);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Produto não encontrado: ${item.product_id}`
        });
      }
      
      if (!product.active) {
        return res.status(400).json({
          success: false,
          message: `Produto inativo: ${product.name}`
        });
      }

      // Verificar estoque apenas para produtos (não serviços)
      if (product.type === 'product' && product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Estoque insuficiente para ${product.name}. Disponível: ${product.stock}, Solicitado: ${item.quantity}`
        });
      }
    }

    // Processar itens e calcular preços
    const processedItems = items.map((item, index) => {
      const product = products.find(p => p.id === item.product_id);
      return {
        id: (index + 1).toString(),
        product_id: item.product_id,
        product_name: product.name,
        product_barcode: product.barcode,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: item.discount_amount || 0,
        total_price: (item.quantity * item.unit_price) - (item.discount_amount || 0)
      };
    });

    // Calcular totais
    const totals = calculateTotals(processedItems, global_discount);

    // Determinar status inicial
    const initialStatus = type === 'quote' ? 'pending' : 'completed';

    // Criar nova venda
    const newSale = {
      id: (++nextId).toString(),
      number: generateNextNumber(type),
      client_id,
      client_name: client.name,
      user_id: 'admin', // TODO: pegar do token JWT
      user_name: 'Administrador',
      type,
      status: initialStatus,
      subtotal: totals.subtotal,
      discount_amount: totals.discount_amount,
      total_amount: totals.total_amount,
      payment_method,
      payment_terms,
      installments: payment_terms === 'installments' ? installments : 1,
      paid: type === 'sale' && payment_terms === 'cash',
      notes: notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: processedItems
    };

    sales.push(newSale);

    // Se for venda finalizada, dar baixa no estoque
    if (type === 'sale' && initialStatus === 'completed') {
      processedItems.forEach(item => {
        const product = products.find(p => p.id === item.product_id);
        if (product && product.type === 'product') {
          product.stock -= item.quantity;
        }
      });
    }

    res.status(201).json({
      success: true,
      message: type === 'sale' ? 'Venda criada com sucesso' : 'Orçamento criado com sucesso',
      data: newSale
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// PUT /api/sales/:id - Atualizar venda
app.put('/api/sales/:id', (req, res) => {
  try {
    const { id } = req.params;
    const saleIndex = sales.findIndex(s => s.id === id);

    if (saleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Venda não encontrada'
      });
    }

    const currentSale = sales[saleIndex];
    
    // Não permitir edição de vendas concluídas
    if (currentSale.status === 'completed') {
      return res.status(409).json({
        success: false,
        message: 'Não é possível editar venda concluída'
      });
    }

    const {
      client_id,
      payment_method,
      payment_terms,
      installments,
      global_discount,
      notes,
      items
    } = req.body;

    // Validações se campos foram fornecidos
    if (client_id) {
      const client = clients.find(c => c.id === client_id);
      if (!client) {
        return res.status(400).json({
          success: false,
          message: 'Cliente não encontrado'
        });
      }
    }

    if (payment_method && !validPaymentMethods.includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: 'Método de pagamento inválido',
        valid_payment_methods: validPaymentMethods
      });
    }

    if (items && !validateItems(items)) {
      return res.status(400).json({
        success: false,
        message: 'Itens inválidos'
      });
    }

    // Atualizar campos fornecidos
    const updatedSale = { ...currentSale };

    if (client_id) {
      const client = clients.find(c => c.id === client_id);
      updatedSale.client_id = client_id;
      updatedSale.client_name = client.name;
    }

    if (payment_method) updatedSale.payment_method = payment_method;
    if (payment_terms) updatedSale.payment_terms = payment_terms;
    if (installments !== undefined) updatedSale.installments = installments;
    if (notes !== undefined) updatedSale.notes = notes;

    // Atualizar itens e recalcular totais
    if (items) {
      const processedItems = items.map((item, index) => {
        const product = products.find(p => p.id === item.product_id);
        return {
          id: (index + 1).toString(),
          product_id: item.product_id,
          product_name: product ? product.name : 'Produto não encontrado',
          product_barcode: product ? product.barcode : null,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_amount: item.discount_amount || 0,
          total_price: (item.quantity * item.unit_price) - (item.discount_amount || 0)
        };
      });

      updatedSale.items = processedItems;
      const totals = calculateTotals(processedItems, global_discount || 0);
      updatedSale.subtotal = totals.subtotal;
      updatedSale.discount_amount = totals.discount_amount;
      updatedSale.total_amount = totals.total_amount;
    }

    updatedSale.updated_at = new Date().toISOString();

    sales[saleIndex] = updatedSale;

    res.json({
      success: true,
      message: 'Venda atualizada com sucesso',
      data: updatedSale
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// PATCH /api/sales/:id/status - Atualizar apenas status da venda
app.patch('/api/sales/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const saleIndex = sales.findIndex(s => s.id === id);
    if (saleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Venda não encontrada'
      });
    }

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status inválido',
        valid_statuses: validStatuses
      });
    }

    const currentSale = sales[saleIndex];
    const oldStatus = currentSale.status;

    // Regras de transição de status
    const statusTransitions = {
      'pending': ['approved', 'cancelled'],
      'approved': ['completed', 'cancelled'],
      'completed': [], // Status final
      'cancelled': []  // Status final
    };

    if (!statusTransitions[oldStatus].includes(status)) {
      return res.status(409).json({
        success: false,
        message: `Transição de status inválida: ${oldStatus} -> ${status}`,
        allowed_transitions: statusTransitions[oldStatus]
      });
    }

    // Atualizar status
    sales[saleIndex].status = status;
    sales[saleIndex].updated_at = new Date().toISOString();

    // Se aprovado/completado, dar baixa no estoque
    if ((status === 'approved' || status === 'completed') && oldStatus === 'pending') {
      sales[saleIndex].items.forEach(item => {
        const product = products.find(p => p.id === item.product_id);
        if (product && product.type === 'product') {
          product.stock -= item.quantity;
        }
      });
    }

    // Se completado, marcar como pago se for à vista
    if (status === 'completed' && sales[saleIndex].payment_terms === 'cash') {
      sales[saleIndex].paid = true;
    }

    res.json({
      success: true,
      message: `Status alterado de ${oldStatus} para ${status}`,
      data: {
        id: sales[saleIndex].id,
        number: sales[saleIndex].number,
        old_status: oldStatus,
        new_status: status,
        updated_at: sales[saleIndex].updated_at,
        notes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// DELETE /api/sales/:id - Excluir venda
app.delete('/api/sales/:id', (req, res) => {
  try {
    const { id } = req.params;
    const saleIndex = sales.findIndex(s => s.id === id);

    if (saleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Venda não encontrada'
      });
    }

    const sale = sales[saleIndex];

    // Não permitir exclusão de vendas concluídas
    if (sale.status === 'completed') {
      return res.status(409).json({
        success: false,
        message: 'Não é possível excluir venda concluída'
      });
    }

    sales.splice(saleIndex, 1);

    res.json({
      success: true,
      message: 'Venda excluída com sucesso',
      data: sale
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// GET /api/sales/barcode/:barcode - Buscar produto por código de barras
app.get('/api/sales/barcode/:barcode', (req, res) => {
  try {
    const { barcode } = req.params;
    const product = products.find(p => p.barcode === barcode && p.active);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado ou inativo'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// GET /api/sales/reports/summary - Relatório resumo de vendas
app.get('/api/sales/reports/summary', (req, res) => {
  try {
    const { period = '30' } = req.query; // Período em dias
    const periodDays = parseInt(period);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - periodDays);

    const recentSales = sales.filter(sale => 
      new Date(sale.created_at) >= cutoffDate
    );

    // Estatísticas por status
    const statusStats = {};
    validStatuses.forEach(status => {
      statusStats[status] = sales.filter(s => s.status === status).length;
    });

    // Estatísticas por tipo
    const typeStats = {};
    validTypes.forEach(type => {
      typeStats[type] = sales.filter(s => s.type === type).length;
    });

    // Estatísticas por método de pagamento
    const paymentStats = {};
    validPaymentMethods.forEach(method => {
      paymentStats[method] = sales.filter(s => s.payment_method === method).length;
    });

    // Receita total
    const totalRevenue = sales
      .filter(s => s.status === 'completed')
      .reduce((sum, s) => sum + s.total_amount, 0);

    // Receita do período
    const periodRevenue = recentSales
      .filter(s => s.status === 'completed')
      .reduce((sum, s) => sum + s.total_amount, 0);

    // Top produtos vendidos
    const productSales = {};
    sales.forEach(sale => {
      if (sale.status === 'completed') {
        sale.items.forEach(item => {
          if (!productSales[item.product_id]) {
            productSales[item.product_id] = {
              product_id: item.product_id,
              product_name: item.product_name,
              quantity_sold: 0,
              revenue: 0
            };
          }
          productSales[item.product_id].quantity_sold += item.quantity;
          productSales[item.product_id].revenue += item.total_price;
        });
      }
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Vendas pendentes de pagamento
    const pendingPayments = sales.filter(s => 
      s.status === 'completed' && !s.paid
    );

    res.json({
      success: true,
      data: {
        period_days: periodDays,
        total_sales: sales.length,
        recent_sales: recentSales.length,
        status_distribution: statusStats,
        type_distribution: typeStats,
        payment_method_distribution: paymentStats,
        total_revenue: totalRevenue,
        period_revenue: periodRevenue,
        top_products: topProducts,
        pending_payments: {
          count: pendingPayments.length,
          total_amount: pendingPayments.reduce((sum, s) => sum + s.total_amount, 0),
          sales: pendingPayments.map(s => ({
            id: s.id,
            number: s.number,
            client_name: s.client_name,
            total_amount: s.total_amount,
            created_at: s.created_at
          }))
        },
        average_sale_value: sales.length > 0 ? totalRevenue / sales.filter(s => s.status === 'completed').length : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// GET /api/clients - Endpoint para listar clientes
app.get('/api/clients', (req, res) => {
  try {
    res.json({
      success: true,
      data: clients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// GET /api/products - Endpoint para listar produtos
app.get('/api/products', (req, res) => {
  try {
    const { active_only = 'true' } = req.query;
    let filteredProducts = products;
    
    if (active_only === 'true') {
      filteredProducts = products.filter(p => p.active);
    }
    
    res.json({
      success: true,
      data: filteredProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`💰 Servidor de Vendas rodando na porta ${PORT}`);
  console.log(`📋 Endpoints disponíveis:`);
  console.log(`   GET    /api/sales - Listar vendas`);
  console.log(`   GET    /api/sales/:id - Buscar venda por ID`);
  console.log(`   GET    /api/sales/number/:number - Buscar venda por número`);
  console.log(`   POST   /api/sales - Criar venda`);
  console.log(`   PUT    /api/sales/:id - Atualizar venda`);
  console.log(`   PATCH  /api/sales/:id/status - Atualizar status`);
  console.log(`   DELETE /api/sales/:id - Excluir venda`);
  console.log(`   GET    /api/sales/barcode/:barcode - Buscar produto por código de barras`);
  console.log(`   GET    /api/sales/reports/summary - Relatório resumo`);
  console.log(`   GET    /api/clients - Listar clientes`);
  console.log(`   GET    /api/products - Listar produtos`);
});

module.exports = app;