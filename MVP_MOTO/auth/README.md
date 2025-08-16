# Sistema de Autenticação - Oficina de Motos

Sistema completo de autenticação e autorização baseado em JWT com diferentes níveis de acesso para o Sistema de Gestão de Oficina Mecânica de Motos.

## 📋 Funcionalidades

### 🔐 Autenticação
- Login com email e senha
- Tokens JWT com expiração configurável
- Refresh tokens para renovação automática
- Logout individual e de todos os dispositivos
- Rate limiting para prevenir ataques de força bruta
- Log de tentativas de login (sucessos e falhas)

### 👥 Autorização
- Sistema de roles hierárquico (admin, manager, operator, mechanic)
- Permissões granulares por funcionalidade
- Middleware flexível para proteção de rotas
- Verificação de propriedade de recursos

### 🛡️ Segurança
- Senhas criptografadas com bcrypt (12 rounds)
- Validação de força de senha
- Proteção contra ataques de timing
- Headers de segurança com Helmet
- CORS configurável
- Rate limiting global e específico

## 🏗️ Arquitetura

```
auth/
├── models/
│   └── User.js                 # Modelo de usuário
├── services/
│   └── AuthService.js          # Lógica de autenticação
├── controllers/
│   ├── AuthController.js       # Endpoints de autenticação
│   └── UserController.js       # Endpoints de usuários
├── middleware/
│   └── authMiddleware.js       # Middlewares de auth
├── routes/
│   ├── authRoutes.js          # Rotas de autenticação
│   └── userRoutes.js          # Rotas de usuários
├── tests/
│   ├── User.test.js           # Testes do modelo
│   └── AuthService.test.js    # Testes do serviço
└── index.js                   # Ponto de entrada
```

## 🚀 Instalação e Configuração

### 1. Instalar Dependências

```bash
cd auth
npm install
```

### 2. Configurar Variáveis de Ambiente

```env
# JWT Configuration
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Bcrypt Configuration
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
FRONTEND_URL=http://localhost:3000
```

### 3. Executar Migrations

As tabelas necessárias são criadas automaticamente pelas migrations:
- `users` - Usuários do sistema
- `refresh_tokens` - Tokens de renovação
- `login_attempts` - Log de tentativas de login

### 4. Inicializar Sistema

```javascript
const { initializeAuth, setupAuth } = require('./auth');

// Inicializar sistema de autenticação
await initializeAuth();

// Configurar middleware na aplicação Express
const app = express();
setupAuth(app);
```

## 📚 Uso da API

### Autenticação

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@oficina.com",
  "password": "admin123"
}
```

**Resposta:**
```json
{
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@oficina.com",
      "name": "Administrador",
      "role": "admin"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "abc123def456...",
    "expiresIn": "24h"
  }
}
```

#### Renovar Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "abc123def456..."
}
```

#### Logout
```http
POST /api/auth/logout
Content-Type: application/json

{
  "refreshToken": "abc123def456..."
}
```

#### Obter Perfil
```http
GET /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Usuários (Admin/Manager)

#### Listar Usuários
```http
GET /api/users?page=1&limit=10&role=operator&search=joão
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### Criar Usuário
```http
POST /api/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "email": "novo@oficina.com",
  "password": "SenhaSegura123!",
  "name": "Novo Usuário",
  "role": "operator"
}
```

## 🔒 Sistema de Permissões

### Roles Hierárquicas

1. **Admin** - Acesso total ao sistema
2. **Manager** - Gestão operacional e relatórios
3. **Operator** - Operações básicas
4. **Mechanic** - Acesso a ordens de serviço

### Permissões por Role

#### Admin
- Todas as permissões do sistema
- Gestão de usuários
- Configurações do sistema
- Acesso a logs de auditoria

#### Manager
- Gestão de clientes, fornecedores, produtos
- Relatórios e dashboards
- Gestão financeira
- Ordens de serviço e vendas

#### Operator
- Cadastro de clientes e veículos
- Criação de OS e vendas
- Consulta de produtos e estoque

#### Mechanic
- Visualização de OS atribuídas
- Atualização de status de OS
- Consulta de clientes e veículos

### Uso de Middleware

```javascript
const { authenticate, requireAdmin, requireManager } = require('./auth');

// Rota protegida - qualquer usuário autenticado
app.get('/api/protected', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// Rota apenas para admin
app.post('/api/admin-only', authenticate, requireAdmin, (req, res) => {
  // Lógica apenas para admin
});

// Rota para admin ou manager
app.get('/api/management', authenticate, requireManager, (req, res) => {
  // Lógica para gestão
});

// Verificação de permissão específica
app.get('/api/users', authenticate, requirePermission('users:read'), (req, res) => {
  // Lógica para listar usuários
});
```

## 🧪 Testes

### Executar Testes

```bash
# Todos os testes
npm test

# Testes em modo watch
npm run test:watch

# Testes com coverage
npm run test:coverage
```

### Estrutura de Testes

- **User.test.js** - Testes do modelo User
- **AuthService.test.js** - Testes do serviço de autenticação
- Cobertura de testes > 90%

## 🔧 Middleware Disponível

### authenticate
Verifica se o usuário está autenticado com token JWT válido.

```javascript
app.get('/protected', authenticate, (req, res) => {
  // req.user contém dados do usuário
});
```

### authorize(roles)
Verifica se o usuário tem uma das roles necessárias.

```javascript
app.get('/admin', authenticate, authorize('admin'), handler);
app.get('/management', authenticate, authorize(['admin', 'manager']), handler);
```

### requirePermission(permission)
Verifica se o usuário tem permissão específica.

```javascript
app.get('/users', authenticate, requirePermission('users:read'), handler);
```

### requireOwnershipOrAdmin(userIdParam)
Verifica se é o próprio usuário ou admin.

```javascript
app.get('/users/:id', authenticate, requireOwnershipOrAdmin('id'), handler);
```

### loginRateLimit
Rate limiting específico para tentativas de login.

```javascript
app.post('/login', loginRateLimit, AuthController.login);
```

## 📊 Monitoramento e Logs

### Logs de Tentativas de Login
Todas as tentativas de login são registradas com:
- Email utilizado
- Sucesso/falha
- IP do cliente
- User agent
- Timestamp

### Limpeza Automática
- Refresh tokens expirados são limpos automaticamente
- Logs de login são mantidos por 30 dias
- Limpeza executada a cada hora

### Estatísticas
```javascript
const { getAuthStats } = require('./auth');

const stats = await getAuthStats();
console.log(stats);
// {
//   users: { total: 10, active: 8, inactive: 2 },
//   sessions: { active: 15 }
// }
```

## 🛡️ Segurança

### Validação de Senha
Senhas devem ter:
- Mínimo 8 caracteres
- Pelo menos 1 letra minúscula
- Pelo menos 1 letra maiúscula
- Pelo menos 1 número
- Pelo menos 1 caractere especial

### Rate Limiting
- Global: 100 requests por 15 minutos por IP
- Auth: 20 tentativas por 15 minutos por IP
- Login: 5 tentativas por 15 minutos por email/IP

### Headers de Segurança
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

## 🔄 Fluxo de Autenticação

```mermaid
sequenceDiagram
    participant C as Cliente
    participant A as API
    participant D as Database
    
    C->>A: POST /auth/login
    A->>D: Verificar usuário
    D-->>A: Dados do usuário
    A->>A: Verificar senha
    A->>A: Gerar tokens
    A->>D: Salvar refresh token
    A-->>C: Access + Refresh tokens
    
    Note over C: Token expira
    
    C->>A: POST /auth/refresh
    A->>D: Verificar refresh token
    D-->>A: Token válido
    A->>A: Gerar novo access token
    A->>D: Salvar novo refresh token
    A-->>C: Novos tokens
```

## 🚨 Tratamento de Erros

### Códigos de Erro Comuns

- `NO_TOKEN` - Token não fornecido
- `INVALID_TOKEN` - Token inválido
- `TOKEN_EXPIRED` - Token expirado
- `USER_NOT_FOUND` - Usuário não encontrado
- `USER_INACTIVE` - Usuário desativado
- `INSUFFICIENT_PERMISSIONS` - Permissão insuficiente
- `RATE_LIMIT_EXCEEDED` - Limite de requisições excedido

### Exemplo de Resposta de Erro

```json
{
  "error": "Token expirado",
  "code": "TOKEN_EXPIRED"
}
```

## 📝 Changelog

### v1.0.0
- Sistema completo de autenticação JWT
- Modelo User com validações
- Sistema de roles e permissões
- Middleware de autorização
- Rate limiting
- Testes unitários
- Documentação completa

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.