# Sistema de Gestão de Oficina Mecânica de Motos

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
```bash
git clone <repository-url>
cd sistema-gestao-oficina-motos
```

### 2. Configure o backend
```bash
cd backend
npm install
cp .env.example .env
# Configure as variáveis de ambiente
npm run migrate
npm run seed
```

### 3. Configure o frontend
```bash
cd frontend
npm install
cp .env.example .env
# Configure as variáveis de ambiente
```

### 4. Execute o projeto
```bash
# Backend
cd backend && npm run dev

# Frontend (em outro terminal)
cd frontend && npm start
```

## 🐳 Docker

```bash
# Desenvolvimento
docker-compose up -d

# Testes
docker-compose -f docker-compose.test.yml up -d
```

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes E2E
npm run test:e2e

# Cobertura
npm run test:coverage

# Bateria completa
./scripts/run-all-tests.sh
```

## 📊 Validação de Requisitos

```bash
node scripts/validate-requirements.js
```

## 🔧 Scripts Úteis

```bash
# Otimizações finais
node scripts/final-optimizations.js

# Backup do banco
npm run backup

# Deploy
npm run deploy
```

## 📁 Estrutura do Projeto

```
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
```

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
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
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
