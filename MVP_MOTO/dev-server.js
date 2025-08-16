const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

// Middlewares básicos
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Dados de teste
const testData = {
  users: [
    {
      id: '1',
      email: 'admin@oficina.com',
      name: 'Administrador',
      role: 'admin'
    }
  ],
  clients: [
    {
      id: '1',
      name: 'João Silva',
      phone: '(11) 99999-9999',
      email: 'joao@email.com',
      cpf: '123.456.789-00'
    },
    {
      id: '2',
      name: 'Maria Santos',
      phone: '(11) 88888-8888',
      email: 'maria@email.com',
      cpf: '987.654.321-00'
    }
  ],
  products: [
    {
      id: '1',
      code: 'OIL001',
      name: 'Óleo Motor 20W50',
      price: 25.90,
      type: 'product',
      stock: 50
    },
    {
      id: '2',
      code: 'SRV001',
      name: 'Troca de Óleo',
      price: 45.00,
      type: 'service',
      stock: null
    }
  ],
  vehicles: [
    {
      id: '1',
      plate: 'ABC-1234',
      brand: 'Honda',
      model: 'CG 160',
      year: 2020,
      client_id: '1'
    }
  ]
};

// Rotas da API
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Servidor de desenvolvimento funcionando'
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'API Sistema de Gestão de Oficina Mecânica de Motos - Desenvolvimento',
    version: '1.0.0-dev',
    endpoints: {
      auth: '/api/auth/login',
      clients: '/api/clients',
      products: '/api/products',
      vehicles: '/api/vehicles'
    }
  });
});

// Autenticação simples
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:', email);
  
  if (email === 'admin@oficina.com' && password === '123456') {
    res.json({
      success: true,
      data: {
        user: testData.users[0],
        token: 'fake-jwt-token-for-development',
        refreshToken: 'fake-refresh-token'
      },
      message: 'Login realizado com sucesso'
    });
  } else {
    res.status(401).json({
      error: {
        message: 'Email ou senha inválidos',
        code: 'INVALID_CREDENTIALS'
      }
    });
  }
});

// CRUD Clientes
app.get('/api/clients', (req, res) => {
  res.json({
    success: true,
    data: testData.clients,
    message: 'Clientes listados com sucesso'
  });
});

app.post('/api/clients', (req, res) => {
  const newClient = {
    id: String(testData.clients.length + 1),
    ...req.body
  };
  testData.clients.push(newClient);
  
  res.status(201).json({
    success: true,
    data: newClient,
    message: 'Cliente criado com sucesso'
  });
});

app.put('/api/clients/:id', (req, res) => {
  const { id } = req.params;
  const clientIndex = testData.clients.findIndex(c => c.id === id);
  
  if (clientIndex === -1) {
    return res.status(404).json({
      error: { message: 'Cliente não encontrado' }
    });
  }
  
  testData.clients[clientIndex] = { ...testData.clients[clientIndex], ...req.body };
  
  res.json({
    success: true,
    data: testData.clients[clientIndex],
    message: 'Cliente atualizado com sucesso'
  });
});

app.delete('/api/clients/:id', (req, res) => {
  const { id } = req.params;
  const clientIndex = testData.clients.findIndex(c => c.id === id);
  
  if (clientIndex === -1) {
    return res.status(404).json({
      error: { message: 'Cliente não encontrado' }
    });
  }
  
  testData.clients.splice(clientIndex, 1);
  
  res.json({
    success: true,
    message: 'Cliente removido com sucesso'
  });
});

// CRUD Produtos
app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    data: testData.products,
    message: 'Produtos listados com sucesso'
  });
});

app.post('/api/products', (req, res) => {
  const newProduct = {
    id: String(testData.products.length + 1),
    ...req.body
  };
  testData.products.push(newProduct);
  
  res.status(201).json({
    success: true,
    data: newProduct,
    message: 'Produto criado com sucesso'
  });
});

// CRUD Veículos
app.get('/api/vehicles', (req, res) => {
  res.json({
    success: true,
    data: testData.vehicles,
    message: 'Veículos listados com sucesso'
  });
});

app.post('/api/vehicles', (req, res) => {
  const newVehicle = {
    id: String(testData.vehicles.length + 1),
    ...req.body
  };
  testData.vehicles.push(newVehicle);
  
  res.status(201).json({
    success: true,
    data: newVehicle,
    message: 'Veículo criado com sucesso'
  });
});

// Rotas de dashboard/estatísticas
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalClients: testData.clients.length,
      totalProducts: testData.products.length,
      totalVehicles: testData.vehicles.length,
      totalServiceOrders: 5,
      totalSales: 12,
      monthlyRevenue: 15420.50
    },
    message: 'Estatísticas carregadas'
  });
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({
    error: {
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    }
  });
});

// 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Rota não encontrada',
      code: 'NOT_FOUND'
    }
  });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor de desenvolvimento rodando na porta ${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   Email: admin@oficina.com`);
  console.log(`   Senha: 123456`);
  console.log(`👥 Clientes: http://localhost:${PORT}/api/clients`);
  console.log(`📦 Produtos: http://localhost:${PORT}/api/products`);
  console.log(`🏍️  Veículos: http://localhost:${PORT}/api/vehicles`);
  console.log('⏳ Aguardando requisições...');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Parando servidor...');
  server.close(() => {
    console.log('✅ Servidor parado');
    process.exit(0);
  });
});