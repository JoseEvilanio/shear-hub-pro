# Banco de Dados - Sistema de Gestão de Oficina de Motos

Este diretório contém toda a configuração, migrations, seeds e scripts relacionados ao banco de dados PostgreSQL do sistema.

## 📋 Estrutura do Diretório

```
database/
├── init.sql                 # Script de inicialização do banco
├── connection.js           # Configuração de conexão e pool
├── setup.js               # Script interativo de configuração
├── seeds.sql              # Dados iniciais do sistema
├── package.json           # Dependências e scripts NPM
├── README.md              # Esta documentação
└── migrations/            # Arquivos de migration
    ├── 001_create_users_table.sql
    ├── 002_create_clients_table.sql
    ├── 003_create_suppliers_table.sql
    ├── 004_create_mechanics_table.sql
    ├── 005_create_vehicles_table.sql
    ├── 006_create_products_table.sql
    ├── 007_create_service_orders_table.sql
    ├── 008_create_service_order_items_table.sql
    ├── 009_create_sales_table.sql
    ├── 010_create_sale_items_table.sql
    ├── 011_create_inventory_movements_table.sql
    ├── 012_create_accounts_payable_table.sql
    ├── 013_create_accounts_receivable_table.sql
    ├── 014_create_cash_movements_table.sql
    ├── 015_create_system_config_table.sql
    └── 016_create_audit_log_table.sql
```

## 🚀 Configuração Inicial

### 1. Pré-requisitos

- PostgreSQL 12+ instalado e rodando
- Node.js 16+ instalado
- NPM ou Yarn

### 2. Instalação das Dependências

```bash
cd database
npm install
```

### 3. Configuração do Ambiente

Copie o arquivo `.env.example` para `.env` e configure as variáveis:

```bash
cp ../.env.example ../.env
```

Edite o arquivo `.env` com suas configurações:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=oficina_motos
DB_USER=postgres
DB_PASSWORD=sua_senha
```

### 4. Configuração Completa (Recomendado)

Execute o script interativo de configuração:

```bash
npm run setup
```

Este script irá:
- Testar a conexão com o banco
- Executar o script de inicialização
- Aplicar todas as migrations
- Inserir dados iniciais (seeds)

## 📋 Scripts Disponíveis

### Scripts NPM

```bash
# Configuração completa interativa
npm run setup

# Testar apenas a conexão
npm run test-connection

# Executar apenas migrations
npm run migrate

# Executar apenas seeds
npm run seed

# Inicialização completa (não interativa)
npm run init

# Resetar banco (CUIDADO!)
npm run reset

# Backup do banco
npm run backup

# Restaurar backup
npm run restore backup_file.sql
```

### Scripts Node.js Diretos

```bash
# Testar conexão
node -e "require('./connection').testConnection()"

# Executar migrations
node -e "require('./connection').runMigrations()"

# Executar seeds
node -e "require('./connection').runSeeds()"

# Inicialização completa
node -e "require('./connection').initializeDatabase()"
```

## 🗄️ Estrutura do Banco de Dados

### Principais Tabelas

#### Usuários e Autenticação
- `users` - Usuários do sistema com diferentes níveis de acesso

#### Cadastros Básicos
- `clients` - Clientes da oficina
- `suppliers` - Fornecedores de produtos e serviços
- `mechanics` - Mecânicos da oficina
- `vehicles` - Veículos dos clientes
- `products` - Produtos e serviços

#### Operações
- `service_orders` - Ordens de serviço
- `service_order_items` - Itens das ordens de serviço
- `sales` - Vendas e orçamentos
- `sale_items` - Itens das vendas

#### Controle
- `inventory_movements` - Movimentações de estoque
- `accounts_payable` - Contas a pagar
- `accounts_receivable` - Contas a receber
- `cash_movements` - Movimentações de caixa

#### Sistema
- `system_config` - Configurações do sistema
- `audit_log` - Log de auditoria
- `schema_migrations` - Controle de migrations

### Tipos Enumerados

```sql
-- Níveis de usuário
user_role: 'admin', 'manager', 'operator', 'mechanic'

-- Status de ordens de serviço
service_order_status: 'pending', 'in_progress', 'waiting_parts', 'completed', 'delivered', 'cancelled'

-- Tipos de venda
sale_type: 'sale', 'quote'
sale_status: 'pending', 'completed', 'cancelled'

-- Métodos de pagamento
payment_method: 'cash', 'card', 'pix', 'installment'

-- Tipos de produto
product_type: 'product', 'service'

-- Tipos de movimento
inventory_movement_type: 'in', 'out', 'adjustment'
cash_movement_type: 'in', 'out'
```

## 🔧 Funcionalidades Especiais

### Validações Automáticas

- **CPF**: Validação automática de CPF com dígitos verificadores
- **CNPJ**: Validação automática de CNPJ com dígitos verificadores
- **Placas**: Suporte a formato antigo (ABC1234) e Mercosul (ABC1D23)
- **Emails**: Validação de formato de email
- **Datas**: Validação de datas lógicas

### Triggers Automáticos

- **Timestamps**: Atualização automática de `updated_at`
- **Status de OS**: Atualização automática de datas por status
- **Totais**: Cálculo automático de totais em vendas e OS
- **Estoque**: Atualização automática de estoque nas movimentações
- **Pagamentos**: Atualização automática de status de pagamento

### Funções Utilitárias

```sql
-- Validações
validate_cpf(cpf_text) -> boolean
validate_cnpj(cnpj_text) -> boolean

-- Numeração automática
generate_service_order_number() -> text
generate_sale_number() -> text

-- Configurações
get_config(key) -> text
set_config(key, value, description, type, category, is_public, user_id)

-- Movimentações
create_inventory_movement(product_id, type, quantity, ...)
create_cash_movement(type, amount, description, ...)

-- Contas a receber
generate_accounts_receivable_from_sale(sale_id, installments, first_due_date)

-- Relatórios
get_cash_balance(date) -> decimal
get_cash_flow(start_date, end_date) -> table
```

## 📊 Views e Relatórios

### Views Disponíveis

- `daily_cash_report` - Relatório diário de caixa
- `audit_summary` - Resumo de operações de auditoria

### Consultas Úteis

```sql
-- Produtos com estoque baixo
SELECT * FROM products 
WHERE stock_quantity <= min_stock AND active = true;

-- Contas vencidas
SELECT * FROM accounts_receivable 
WHERE received = false AND due_date < CURRENT_DATE;

-- OS em andamento por mecânico
SELECT m.name, COUNT(*) as os_count
FROM service_orders so
JOIN mechanics m ON so.mechanic_id = m.id
WHERE so.status IN ('pending', 'in_progress')
GROUP BY m.name;

-- Vendas do mês
SELECT DATE_TRUNC('day', sale_date) as day, 
       COUNT(*) as sales_count,
       SUM(total_amount) as total_amount
FROM sales 
WHERE sale_date >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY DATE_TRUNC('day', sale_date)
ORDER BY day;
```

## 🔒 Segurança

### Controle de Acesso

- Senhas criptografadas com bcrypt
- Diferentes níveis de usuário (admin, manager, operator, mechanic)
- Log de auditoria para todas as operações

### Integridade de Dados

- Foreign keys para manter integridade referencial
- Constraints para validar dados
- Triggers para manter consistência

### Backup e Recuperação

```bash
# Backup completo
pg_dump oficina_motos > backup_$(date +%Y%m%d).sql

# Backup apenas dados
pg_dump --data-only oficina_motos > data_backup_$(date +%Y%m%d).sql

# Backup apenas estrutura
pg_dump --schema-only oficina_motos > schema_backup_$(date +%Y%m%d).sql

# Restaurar backup
psql oficina_motos < backup_file.sql
```

## 🐛 Troubleshooting

### Problemas Comuns

#### Erro de Conexão
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solução**: Verifique se o PostgreSQL está rodando e as configurações de conexão estão corretas.

#### Erro de Permissão
```
Error: permission denied for database
```
**Solução**: Verifique se o usuário tem permissões adequadas no banco.

#### Migration Falhou
```
Error: relation already exists
```
**Solução**: Verifique se a migration já foi executada ou se há conflitos de schema.

### Logs e Monitoramento

- Queries lentas (>1s) são logadas automaticamente
- Pool de conexões é monitorado
- Operações de auditoria são registradas

### Limpeza e Manutenção

```sql
-- Limpar logs de auditoria antigos (>6 meses)
SELECT cleanup_audit_log();

-- Reindexar tabelas
REINDEX DATABASE oficina_motos;

-- Analisar estatísticas
ANALYZE;

-- Vacuum para limpeza
VACUUM ANALYZE;
```

## 📈 Performance

### Índices Otimizados

- Índices em chaves estrangeiras
- Índices compostos para consultas frequentes
- Índices de texto para busca
- Índices parciais para consultas específicas

### Configurações Recomendadas

```sql
-- Configurações de performance no postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
```

## 🔄 Migrations

### Criando Nova Migration

1. Crie um arquivo numerado sequencialmente:
   ```
   017_add_new_feature.sql
   ```

2. Inclua comentários descritivos:
   ```sql
   -- Migration: 017_add_new_feature.sql
   -- Descrição: Adiciona nova funcionalidade X
   ```

3. Execute a migration:
   ```bash
   npm run migrate
   ```

### Rollback de Migration

Para reverter uma migration, crie uma nova migration que desfaça as alterações da anterior.

## 📞 Suporte

Para problemas ou dúvidas:

1. Verifique os logs da aplicação
2. Consulte esta documentação
3. Verifique os logs do PostgreSQL
4. Execute o teste de conexão: `npm run test-connection`

## 📝 Changelog

### v1.0.0 (2024-01-XX)
- Estrutura inicial do banco de dados
- 16 migrations principais
- Sistema de auditoria
- Configurações automáticas
- Seeds com dados de exemplo
- Scripts de setup e manutenção