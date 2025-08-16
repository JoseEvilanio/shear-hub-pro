const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Dados de teste (simulando banco de dados)
const users = [
  {
    id: '1',
    email: 'admin@oficina.com',
    password_hash: '$2a$10$ppvD5CTXe8uM8QB9sEbmheRGgpNtZ6b8lKPdUznI3D1tyHec6Ce5O', // 123456
    name: 'Administrador',
    role: 'admin'
  }
];

// Configurações JWT
const JWT_SECRET = 'oficina-motos-super-secret-key-2024';
const JWT_EXPIRES_IN = '24h';

// Rotas
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
      health: '/health'
    },
  });
});

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

    // Buscar usuário
    const user = users.find(u => u.email === email);
    if (!user) {
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
      return res.status(401).json({
        error: {
          message: 'Email ou senha inválidos',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // Gerar token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    // Remover senha da resposta
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
        refreshToken: token // Simplificado para teste
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

app.post('/api/auth/verify', (req, res) => {
  console.log('📥 Verificação de token requisitada');
  
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: {
          message: 'Token não fornecido',
          code: 'MISSING_TOKEN'
        }
      });
    }

    const payload = jwt.verify(token, JWT_SECRET);

    res.json({
      success: true,
      data: payload,
      message: 'Token válido'
    });

    console.log('✅ Token verificado para:', payload.email);

  } catch (error) {
    console.error('❌ Erro na verificação:', error);
    res.status(401).json({
      error: {
        message: 'Token inválido ou expirado',
        code: 'INVALID_TOKEN'
      }
    });
  }
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err);
  res.status(500).json({
    error: {
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    }
  });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Rota não encontrada',
      code: 'NOT_FOUND'
    }
  });
});

const PORT = 5000;

const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Servidor API rodando na porta ${PORT}`);
  console.log(`📊 Health: http://127.0.0.1:${PORT}/health`);
  console.log(`🔐 Login: POST http://127.0.0.1:${PORT}/api/auth/login`);
  console.log('⏳ Aguardando requisições...');
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