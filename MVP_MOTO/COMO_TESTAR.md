# 🚀 Como Testar o Sistema de Gestão de Oficina Mecânica de Motos

## ✅ Status Atual
- **Backend API:** ✅ Funcionando na porta 5000
- **Frontend Web:** ✅ Disponível em HTML/JavaScript
- **Banco de Dados:** ✅ Simulado em memória (dados de teste)
- **Autenticação:** ✅ Funcionando

## 🌐 Acessar o Sistema

### Opção 1: Interface Web Completa
1. Abra seu navegador
2. Acesse: **http://localhost:5000/index.html**
3. Use as credenciais:
   - **Email:** admin@oficina.com
   - **Senha:** 123456

### Opção 2: Testar APIs Diretamente

#### Health Check
```bash
curl http://localhost:5000/health
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@oficina.com","password":"123456"}'
```

#### Listar Clientes
```bash
curl http://localhost:5000/api/clients
```

#### Listar Produtos
```bash
curl http://localhost:5000/api/products
```

#### Listar Veículos
```bash
curl http://localhost:5000/api/vehicles
```

## 🎯 Funcionalidades Disponíveis para Teste

### 1. Dashboard
- ✅ Estatísticas gerais
- ✅ Contadores de clientes, produtos, veículos
- ✅ Receita mensal

### 2. Gestão de Clientes
- ✅ Listar clientes
- ✅ Visualizar dados (nome, telefone, email, CPF)
- ✅ Dados de teste pré-carregados

### 3. Gestão de Produtos
- ✅ Listar produtos e serviços
- ✅ Visualizar código, nome, preço, tipo, estoque
- ✅ Diferenciação visual entre produtos e serviços

### 4. Gestão de Veículos
- ✅ Listar veículos
- ✅ Visualizar placa, marca, modelo, ano
- ✅ Dados de teste pré-carregados

### 5. Autenticação
- ✅ Login com email e senha
- ✅ Logout
- ✅ Proteção de rotas
- ✅ Token JWT (simulado)

## 📊 Dados de Teste Disponíveis

### Usuários
- **Admin:** admin@oficina.com / 123456

### Clientes
- João Silva - (11) 99999-9999 - joao@email.com
- Maria Santos - (11) 88888-8888 - maria@email.com

### Produtos
- Óleo Motor 20W50 - R$ 25,90 (Produto)
- Troca de Óleo - R$ 45,00 (Serviço)

### Veículos
- Honda CG 160 - ABC-1234 - 2020

## 🔧 Como Iniciar o Servidor

### Método 1: Comando Direto
```bash
node dev-server.js
```

### Método 2: Script Batch (Windows)
```bash
start-dev.bat
```

### Método 3: Background Process
```powershell
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "dev-server.js"
```

## 🌟 Recursos Implementados

### Interface Web
- ✅ Design responsivo com TailwindCSS
- ✅ Navegação por abas
- ✅ Tabelas de dados
- ✅ Formulário de login
- ✅ Feedback visual de estados

### API Backend
- ✅ RESTful API completa
- ✅ CORS habilitado
- ✅ Middleware de erro
- ✅ Logs de requisições
- ✅ Dados estruturados

### Segurança
- ✅ Autenticação JWT (simulada)
- ✅ Proteção de rotas
- ✅ Validação de dados
- ✅ Headers de segurança

## 🧪 Testes Sugeridos

### 1. Teste de Login
1. Acesse http://localhost:5000/index.html
2. Tente login com credenciais incorretas
3. Faça login com: admin@oficina.com / 123456
4. Verifique se o dashboard carrega

### 2. Teste de Navegação
1. Clique em "Clientes" - deve mostrar lista
2. Clique em "Produtos" - deve mostrar produtos e serviços
3. Clique em "Veículos" - deve mostrar veículos
4. Clique em "Dashboard" - deve voltar ao início

### 3. Teste de Dados
1. Verifique se os contadores no dashboard estão corretos
2. Confirme se as tabelas mostram os dados de teste
3. Observe a diferenciação visual entre produtos e serviços

### 4. Teste de Logout
1. Clique em "Sair" no header
2. Deve voltar para a tela de login
3. Tente acessar diretamente uma URL protegida

## 🚀 Próximos Passos

### Para Desenvolvimento Completo
1. **Banco de Dados Real:** Conectar PostgreSQL
2. **CRUD Completo:** Adicionar, editar, excluir registros
3. **Validações:** Implementar validações de formulário
4. **Upload de Arquivos:** Para fotos de produtos
5. **Relatórios:** Gerar PDFs e relatórios

### Para Produção
1. **Deploy:** Configurar para produção
2. **SSL:** Certificados HTTPS
3. **Backup:** Sistema de backup automático
4. **Monitoramento:** Logs e métricas
5. **Performance:** Cache e otimizações

## 📞 Suporte

Se encontrar algum problema:
1. Verifique se o servidor está rodando na porta 5000
2. Confirme se não há conflitos de porta
3. Verifique o console do navegador para erros JavaScript
4. Observe os logs do servidor no terminal

---

**🎉 Sistema funcionando e pronto para testes!**

**Desenvolvido com ❤️ para oficinas mecânicas de motocicletas**