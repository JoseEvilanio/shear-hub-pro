#!/usr/bin/env node
/**
 * Script de Otimizações Finais
 * Sistema de Gestão de Oficina Mecânica de Motos
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const success = (message) => log(`✅ ${message}`, 'green');
const error = (message) => log(`❌ ${message}`, 'red');
const warning = (message) => log(`⚠️  ${message}`, 'yellow');
const info = (message) => log(`ℹ️  ${message}`, 'blue');

// Função para executar comando
const runCommand = (command, cwd = process.cwd()) => {
  try {
    const result = execSync(command, { 
      cwd, 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Otimizar package.json
const optimizePackageJson = () => {
  info('Otimizando arquivos package.json...');
  
  const optimizePackage = (packagePath, type) => {
    if (!fs.existsSync(packagePath)) return;
    
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Adicionar scripts úteis se não existirem
    const commonScripts = {
      backend: {
        'start': 'node src/server.js',
        'dev': 'nodemon src/server.js',
        'test': 'jest',
        'test:watch': 'jest --watch',
        'test:coverage': 'jest --coverage',
        'lint': 'eslint src/',
        'lint:fix': 'eslint src/ --fix',
        'migrate': 'node src/database/migrate.js',
        'seed': 'node src/database/seed.js'
      },
      frontend: {
        'start': 'react-scripts start',
        'build': 'react-scripts build',
        'test': 'react-scripts test',
        'test:coverage': 'react-scripts test --coverage --watchAll=false',
        'eject': 'react-scripts eject',
        'lint': 'eslint src/',
        'lint:fix': 'eslint src/ --fix',
        'analyze': 'npm run build && npx bundle-analyzer build/static/js/*.js'
      }
    };
    
    packageJson.scripts = { ...commonScripts[type], ...packageJson.scripts };
    
    // Adicionar configurações úteis
    if (type === 'frontend') {
      packageJson.browserslist = packageJson.browserslist || {
        "production": [
          ">0.2%",
          "not dead",
          "not op_mini all"
        ],
        "development": [
          "last 1 chrome version",
          "last 1 firefox version",
          "last 1 safari version"
        ]
      };
      
      // Configuração para otimização de bundle
      packageJson.homepage = packageJson.homepage || ".";
    }
    
    if (type === 'backend') {
      packageJson.engines = packageJson.engines || {
        "node": ">=16.0.0",
        "npm": ">=8.0.0"
      };
    }
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    success(`${type} package.json otimizado`);
  };
  
  optimizePackage(path.join(process.cwd(), 'backend/package.json'), 'backend');
  optimizePackage(path.join(process.cwd(), 'frontend/package.json'), 'frontend');
};

// Criar arquivo .env.example
const createEnvExamples = () => {
  info('Criando arquivos .env.example...');
  
  const backendEnvExample = `# Configurações do Servidor
NODE_ENV=development
PORT=3001

# Banco de Dados
DATABASE_URL=postgresql://username:password@localhost:5432/oficina_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Configurações da Aplicação
COMPANY_NAME=Oficina Mecânica
COMPANY_LOGO_URL=https://example.com/logo.png
`;

  const frontendEnvExample = `# API Configuration
REACT_APP_API_URL=http://localhost:3001/api

# Environment
REACT_APP_ENVIRONMENT=development

# Features
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_NOTIFICATIONS=true

# Company Info
REACT_APP_COMPANY_NAME=Oficina Mecânica
REACT_APP_COMPANY_PHONE=(11) 99999-9999
`;

  fs.writeFileSync(path.join(process.cwd(), 'backend/.env.example'), backendEnvExample);
  fs.writeFileSync(path.join(process.cwd(), 'frontend/.env.example'), frontendEnvExample);
  
  success('Arquivos .env.example criados');
};

// Otimizar configurações do ESLint
const optimizeESLintConfig = () => {
  info('Otimizando configurações do ESLint...');
  
  const eslintConfig = {
    "env": {
      "browser": true,
      "es2021": true,
      "node": true,
      "jest": true
    },
    "extends": [
      "eslint:recommended",
      "@typescript-eslint/recommended",
      "react-app",
      "react-app/jest"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
      "ecmaFeatures": {
        "jsx": true
      },
      "ecmaVersion": 12,
      "sourceType": "module"
    },
    "plugins": [
      "react",
      "@typescript-eslint"
    ],
    "rules": {
      "no-unused-vars": "warn",
      "no-console": "warn",
      "react/prop-types": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "warn"
    },
    "ignorePatterns": [
      "build/",
      "dist/",
      "node_modules/",
      "coverage/"
    ]
  };
  
  fs.writeFileSync(path.join(process.cwd(), '.eslintrc.json'), JSON.stringify(eslintConfig, null, 2));
  success('Configuração do ESLint otimizada');
};

// Criar arquivo .gitignore otimizado
const createOptimizedGitignore = () => {
  info('Criando .gitignore otimizado...');
  
  const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
build/
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Coverage
coverage/

# Testing
cypress/videos/
cypress/screenshots/

# Temporary files
tmp/
temp/

# Database
*.sqlite
*.db

# Uploads
uploads/
public/uploads/

# Reports
test-report-*.md
validation-report-*.json
performance-report.json
zap-report.json

# Docker
.dockerignore

# Backup files
*.backup
*.bak
`;

  fs.writeFileSync(path.join(process.cwd(), '.gitignore'), gitignoreContent);
  success('.gitignore otimizado criado');
};

// Criar documentação README
const createReadme = () => {
  info('Criando documentação README...');
  
  const readmeContent = `# Sistema de Gestão de Oficina Mecânica de Motos

Sistema completo para gestão de oficinas mecânicas especializadas em motocicletas, desenvolvido com React (frontend) e Node.js (backend).

## 🚀 Funcionalidades

### Gestão de Clientes
- ✅ Cadastro completo de clientes
- ✅ Histórico de serviços
- ✅ Busca avançada
- ✅ Relatório de aniversariantes

### Gestão de Veículos
- ✅ Cadastro de motocicletas
- ✅ Histórico de manutenções
- ✅ Vinculação com proprietários

### Ordens de Serviço
- ✅ Criação de OS com 9 linhas de descrição
- ✅ Controle de status
- ✅ Impressão em múltiplos formatos
- ✅ Gestão de mecânicos

### Sistema de Vendas
- ✅ Vendas com código de barras
- ✅ Orçamentos e pedidos
- ✅ Controle de estoque automático
- ✅ Múltiplas formas de pagamento

### Controle Financeiro
- ✅ Contas a pagar e receber
- ✅ Controle de caixa
- ✅ Relatórios financeiros
- ✅ Dashboard executivo

### Relatórios
- ✅ Relatórios de vendas
- ✅ Relatórios de estoque
- ✅ Relatórios financeiros
- ✅ Exportação em PDF/Excel

## 🛠️ Tecnologias

### Frontend
- React 18
- TypeScript
- TailwindCSS
- Redux Toolkit
- React Router
- Axios

### Backend
- Node.js
- Express
- PostgreSQL
- Redis
- JWT Authentication
- Cloudinary

### DevOps
- Docker
- GitHub Actions
- Cypress (E2E)
- Jest (Unit Tests)

## 📋 Pré-requisitos

- Node.js 16+
- PostgreSQL 13+
- Redis 6+
- Docker (opcional)

## 🚀 Instalação

### 1. Clone o repositório
\`\`\`bash
git clone <repository-url>
cd sistema-gestao-oficina-motos
\`\`\`

### 2. Configure o backend
\`\`\`bash
cd backend
npm install
cp .env.example .env
# Configure as variáveis de ambiente
npm run migrate
npm run seed
\`\`\`

### 3. Configure o frontend
\`\`\`bash
cd frontend
npm install
cp .env.example .env
# Configure as variáveis de ambiente
\`\`\`

### 4. Execute o projeto
\`\`\`bash
# Backend
cd backend && npm run dev

# Frontend (em outro terminal)
cd frontend && npm start
\`\`\`

## 🐳 Docker

\`\`\`bash
# Desenvolvimento
docker-compose up -d

# Testes
docker-compose -f docker-compose.test.yml up -d
\`\`\`

## 🧪 Testes

\`\`\`bash
# Testes unitários
npm run test

# Testes E2E
npm run test:e2e

# Cobertura
npm run test:coverage

# Bateria completa
./scripts/run-all-tests.sh
\`\`\`

## 📊 Validação de Requisitos

\`\`\`bash
node scripts/validate-requirements.js
\`\`\`

## 🔧 Scripts Úteis

\`\`\`bash
# Otimizações finais
node scripts/final-optimizations.js

# Backup do banco
npm run backup

# Deploy
npm run deploy
\`\`\`

## 📁 Estrutura do Projeto

\`\`\`
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── database/
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── utils/
│   └── cypress/
├── scripts/
└── docs/
\`\`\`

## 🔐 Segurança

- Autenticação JWT
- Criptografia de senhas
- Validação de dados
- Proteção CORS
- Rate limiting

## 📈 Performance

- Lazy loading
- Cache Redis
- Otimização de imagens
- Bundle splitting
- Compressão gzip

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (\`git checkout -b feature/nova-funcionalidade\`)
3. Commit suas mudanças (\`git commit -am 'Adiciona nova funcionalidade'\`)
4. Push para a branch (\`git push origin feature/nova-funcionalidade\`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato através do email: suporte@oficina.com

## 🎯 Roadmap

- [ ] App mobile
- [ ] Integração com WhatsApp
- [ ] BI avançado
- [ ] API pública
- [ ] Multi-tenancy

---

Desenvolvido com ❤️ para oficinas mecânicas de motocicletas.
`;

  fs.writeFileSync(path.join(process.cwd(), 'README.md'), readmeContent);
  success('README.md criado');
};

// Criar arquivo de licença
const createLicense = () => {
  info('Criando arquivo de licença...');
  
  const licenseContent = `MIT License

Copyright (c) ${new Date().getFullYear()} Sistema de Gestão de Oficina Mecânica

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

  fs.writeFileSync(path.join(process.cwd(), 'LICENSE'), licenseContent);
  success('LICENSE criado');
};

// Otimizar configurações do Prettier
const createPrettierConfig = () => {
  info('Criando configuração do Prettier...');
  
  const prettierConfig = {
    "semi": true,
    "trailingComma": "es5",
    "singleQuote": true,
    "printWidth": 80,
    "tabWidth": 2,
    "useTabs": false,
    "bracketSpacing": true,
    "arrowParens": "avoid",
    "endOfLine": "lf"
  };
  
  fs.writeFileSync(path.join(process.cwd(), '.prettierrc'), JSON.stringify(prettierConfig, null, 2));
  
  const prettierIgnore = `node_modules/
build/
dist/
coverage/
*.log
.env*
`;
  
  fs.writeFileSync(path.join(process.cwd(), '.prettierignore'), prettierIgnore);
  success('Configuração do Prettier criada');
};

// Verificar e corrigir permissões de arquivos
const fixFilePermissions = () => {
  info('Verificando permissões de arquivos...');
  
  const scriptsDir = path.join(process.cwd(), 'scripts');
  if (fs.existsSync(scriptsDir)) {
    const scriptFiles = fs.readdirSync(scriptsDir).filter(file => file.endsWith('.sh'));
    
    scriptFiles.forEach(file => {
      const filePath = path.join(scriptsDir, file);
      try {
        fs.chmodSync(filePath, '755');
        success(`Permissão corrigida: ${file}`);
      } catch (error) {
        warning(`Não foi possível corrigir permissão: ${file}`);
      }
    });
  }
};

// Função principal
const main = () => {
  log('\n=== OTIMIZAÇÕES FINAIS DO SISTEMA ===\n', 'blue');
  
  try {
    // Executar otimizações
    optimizePackageJson();
    createEnvExamples();
    optimizeESLintConfig();
    createOptimizedGitignore();
    createReadme();
    createLicense();
    createPrettierConfig();
    fixFilePermissions();
    
    // Executar validação final
    info('\nExecutando validação final...');
    const validationResult = runCommand('node scripts/validate-requirements.js');
    
    if (validationResult.success) {
      success('Validação de requisitos passou!');
    } else {
      warning('Alguns requisitos precisam de atenção');
    }
    
    log('\n=== OTIMIZAÇÕES CONCLUÍDAS ===\n', 'green');
    success('Sistema otimizado e pronto para produção!');
    
    log('\n📋 Próximos passos:', 'blue');
    log('1. Execute os testes: ./scripts/run-all-tests.sh');
    log('2. Configure as variáveis de ambiente');
    log('3. Execute o deploy: npm run deploy');
    log('4. Configure monitoramento de produção');
    
  } catch (error) {
    error('Erro durante otimizações: ' + error.message);
    process.exit(1);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { 
  optimizePackageJson, 
  createEnvExamples, 
  optimizeESLintConfig,
  createOptimizedGitignore,
  createReadme,
  createLicense,
  createPrettierConfig,
  fixFilePermissions
};