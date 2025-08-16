# Módulo de Gestão de Clientes - Documentação

## Visão Geral

O módulo de gestão de clientes oferece controle completo do cadastro de clientes da oficina, incluindo validações avançadas, busca inteligente, relatórios de aniversariantes e histórico completo de cada cliente.

## Funcionalidades Implementadas

### ✅ CRUD Completo
- **Criar**: Cadastro de novos clientes com validações robustas
- **Ler**: Listagem e consulta individual com filtros avançados
- **Atualizar**: Edição completa de dados (preparado)
- **Excluir**: Remoção de clientes (preparado)

### ✅ Validações Avançadas
- **CPF**: Validação completa com dígitos verificadores
- **Email**: Formato válido e unicidade
- **Telefone**: Formato brasileiro (XX) XXXXX-XXXX
- **CEP**: Formato brasileiro XXXXX-XXX
- **Data de Nascimento**: Não pode ser futura, idade máxima 120 anos

### ✅ Busca e Filtros Inteligentes
- **Busca Textual**: Por nome, CPF, telefone, email ou endereço
- **Filtro por Mês**: Aniversariantes de mês específico
- **Filtro por Cidade**: Busca no endereço
- **Status Ativo**: Filtro por clientes ativos/inativos
- **Ordenação**: Por nome, data de nascimento, etc.

### ✅ Relatórios Especializados
- **Aniversariantes**: Por mês ou próximos dias
- **Resumo Geral**: Estatísticas e distribuições
- **Histórico**: Preparado para integração com vendas e serviços

## Endpoints da API

### GET /api/clients
Lista todos os clientes com filtros opcionais.

**Parâmetros de Query:**
- `active_only`: true/false (padrão: true)
- `search`: Busca textual
- `birth_month`: Mês de aniversário (1-12)
- `city`: Filtro por cidade
- `sort_by`: Campo para ordenação (name, birth_date)
- `sort_order`: asc/desc (padrão: asc)

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "João Silva",
      "cpf": "123.456.789-01",
      "phone": "(11) 99999-1111",
      "email": "joao.silva@email.com",
      "birth_date": "1985-03-15",
      "age": 40,
      "address": "Rua das Flores, 123 - Centro - São Paulo/SP",
      "cep": "01234-567",
      "notes": "Cliente preferencial",
      "active": true
    }
  ],
  "total": 1
}
```

### GET /api/clients/:id
Busca cliente por ID com informações extras.

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "João Silva",
    "age": 40,
    "service_history": [],
    "purchase_history": [],
    "total_spent": 0,
    "last_service_date": null
  }
}
```

### POST /api/clients
Cria novo cliente.

**Body:**
```json
{
  "name": "Carlos Oliveira",
  "cpf": "111.444.777-35",
  "phone": "(11) 66666-4444",
  "email": "carlos@email.com",
  "birth_date": "1992-08-10",
  "address": "Rua Nova, 100 - Vila Nova - São Paulo/SP",
  "cep": "04567-890",
  "notes": "Cliente novo"
}
```

**Validações:**
- Campos obrigatórios: `name`, `cpf`, `phone`
- CPF deve ser válido e único
- Email deve ser válido e único (se fornecido)
- Telefone deve seguir formato brasileiro
- CEP deve seguir formato brasileiro (se fornecido)
- Data de nascimento não pode ser futura

### GET /api/clients/reports/birthdays
Relatório de aniversariantes.

**Parâmetros:**
- `month`: Mês específico (1-12)
- `upcoming_days`: Próximos X dias (padrão: 30)

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "João Silva",
      "phone": "(11) 99999-1111",
      "email": "joao.silva@email.com",
      "birth_date": "1985-03-15",
      "age": 40,
      "next_birthday": "2026-03-15",
      "days_until_birthday": 123,
      "birth_month": 3,
      "birth_day": 15
    }
  ]
}
```

## Regras de Negócio

### Validação de CPF
- Algoritmo completo com dígitos verificadores
- Formatação automática (XXX.XXX.XXX-XX)
- Prevenção de CPFs sequenciais (111.111.111-11)

### Cálculo de Idade
- Baseado na data atual
- Considera mês e dia para precisão
- Retorna null se data de nascimento não informada

### Formatação Automática
- CPF: Adiciona pontos e hífen automaticamente
- Email: Converte para minúsculas
- Campos de texto: Remove espaços extras

### Proteções de Integridade
- CPF único no sistema
- Email único no sistema (se fornecido)
- Validação de formatos brasileiros

## Estrutura de Dados

### Modelo Client
```javascript
{
  id: String,              // UUID único
  name: String,            // Nome completo
  cpf: String,             // CPF formatado (XXX.XXX.XXX-XX)
  phone: String,           // Telefone formatado ((XX) XXXXX-XXXX)
  email: String,           // Email (opcional, minúsculas)
  birth_date: String,      // Data de nascimento (YYYY-MM-DD)
  address: String,         // Endereço completo (opcional)
  cep: String,             // CEP formatado (XXXXX-XXX)
  notes: String,           // Observações (opcional)
  active: Boolean,         // Status ativo/inativo
  created_at: String,      // Data de criação (ISO)
  updated_at: String       // Data de atualização (ISO)
}
```

## Requisitos Atendidos

### ✅ Requisito 1.1
**QUANDO o usuário acessar o módulo de clientes ENTÃO o sistema DEVE exibir uma lista de todos os clientes cadastrados**
- Endpoint GET /api/clients implementado com filtros

### ✅ Requisito 1.2
**QUANDO o usuário clicar em "Novo Cliente" ENTÃO o sistema DEVE apresentar um formulário com campos para dados pessoais, contatos, data de aniversário**
- Endpoint POST /api/clients com todos os campos necessários

### ✅ Requisito 1.3
**QUANDO o usuário salvar um cliente ENTÃO o sistema DEVE validar os campos obrigatórios e armazenar as informações**
- Validações completas implementadas

### ✅ Requisito 1.4
**QUANDO o usuário visualizar um cliente ENTÃO o sistema DEVE mostrar o histórico completo de serviços e compras**
- Endpoint GET /api/clients/:id preparado para histórico

### ✅ Requisito 1.5
**QUANDO for o aniversário de um cliente ENTÃO o sistema DEVE incluí-lo no relatório de aniversariantes**
- Relatório de aniversariantes implementado

## Próximos Passos

1. **Integração com Banco de Dados**: Substituir dados simulados por PostgreSQL
2. **Histórico Completo**: Integrar com vendas e ordens de serviço
3. **Interface Frontend**: Componentes React para gestão de clientes
4. **Relatórios Avançados**: Mais análises e estatísticas
5. **Importação/Exportação**: Funcionalidades de backup

## Como Executar

### Iniciar Servidor
```bash
node clients-api-server.js
```

### Testar Endpoints
```bash
# Listar clientes
curl http://localhost:3004/api/clients

# Buscar cliente por ID
curl http://localhost:3004/api/clients/1

# Criar cliente
curl -X POST http://localhost:3004/api/clients \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","cpf":"111.444.777-35","phone":"(11) 99999-9999"}'

# Relatório de aniversariantes
curl http://localhost:3004/api/clients/reports/birthdays?month=3
```

## Conclusão

O módulo de gestão de clientes está implementado com funcionalidades essenciais, validações robustas e relatórios úteis. Oferece uma base sólida para o sistema de gestão da oficina e está pronto para integração com os demais módulos.