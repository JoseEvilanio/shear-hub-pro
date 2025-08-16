# Sistema de Relatórios - Oficina de Motos

Sistema completo de relatórios e analytics para o Sistema de Gestão de Oficina Mecânica de Motos, fornecendo insights detalhados sobre vendas, serviços, estoque e finanças.

## 📊 Funcionalidades

### 📈 Relatórios Disponíveis
- **Aniversariantes** - Lista de clientes por mês de aniversário
- **Serviços** - Relatório detalhado de ordens de serviço por período
- **Vendas** - Análise completa de vendas e orçamentos
- **Estoque** - Situação atual e movimentações de estoque
- **Financeiro** - Consolidado de contas a pagar/receber e fluxo de caixa
- **Dashboard** - Métricas principais em tempo real

### 🔍 Recursos Avançados
- Filtros múltiplos e personalizáveis
- Estatísticas e breakdowns automáticos
- Validação de períodos e parâmetros
- Exportação em diferentes formatos
- Relatórios automáticos agendados
- Cache inteligente para performance

## 🏗️ Arquitetura

```
reports/
├── services/
│   └── ReportsService.js      # Lógica de negócio dos relatórios
├── controllers/
│   └── ReportsController.js   # Endpoints da API
├── routes/
│   └── reportsRoutes.js       # Rotas HTTP
├── tests/
│   ├── ReportsService.test.js # Testes do serviço
│   └── ReportsController.test.js # Testes do controller
└── index.js                   # Ponto de entrada
```

## 🚀 Instalação e Uso

### 1. Instalar Dependências

```bash
cd reports
npm install
```

### 2. Integrar com a Aplicação

```javascript
const { initializeReports, reportsRoutes } = require('./reports');

// Inicializar sistema de relatórios
await initializeReports();

// Adicionar rotas à aplicação Express
app.use('/api/reports', reportsRoutes);
```

## 📚 API de Relatórios

### Dashboard Principal

```http
GET /api/reports/dashboard
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "message": "Dashboard gerado com sucesso",
  "data": {
    "financial": {
      "monthly": {
        "sales": { "totalSales": 45, "totalAmount": 12500.00 },
        "netCashFlow": 8500.00,
        "overdueReceivable": 1200.00
      }
    },
    "inventory": {
      "lowStockProducts": 8,
      "outOfStockProducts": 2,
      "totalInventoryValue": 45000.00
    },
    "clients": {
      "birthdaysThisMonth": 12
    }
  }
}
```

### Relatório de Aniversariantes

```http
GET /api/reports/birthday?month=3&year=2024
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "message": "Relatório de aniversariantes gerado com sucesso",
  "data": {
    "summary": {
      "totalClients": 15,
      "month": "Março",
      "year": "2024"
    },
    "data": [
      {
        "month": 3,
        "monthName": "Março",
        "totalClients": 15,
        "clients": [
          {
            "id": "uuid",
            "name": "João Silva",
            "phone": "(11) 99999-9999",
            "birthDate": "1985-03-15",
            "age": 38,
            "totalServiceOrders": 5,
            "totalSpent": 1500.00
          }
        ]
      }
    ]
  }
}
```

### Relatório de Serviços

```http
GET /api/reports/services?startDate=2024-01-01&endDate=2024-01-31&mechanicId=uuid&status=completed
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "message": "Relatório de serviços gerado com sucesso",
  "data": {
    "summary": {
      "period": { "startDate": "2024-01-01", "endDate": "2024-01-31" },
      "totalServices": 25,
      "totalAmount": 8750.00,
      "averageAmount": 350.00,
      "averageHours": 3.5,
      "statusBreakdown": {
        "completed": { "count": 20, "amount": 7000.00 },
        "in_progress": { "count": 5, "amount": 1750.00 }
      }
    },
    "data": [
      {
        "id": "uuid",
        "number": "OS0012024",
        "status": "completed",
        "totalAmount": 450.00,
        "hoursWorked": 4.0,
        "client": { "name": "Maria Santos" },
        "vehicle": { "plate": "ABC1234", "brand": "Honda" },
        "mechanic": "Pedro Silva"
      }
    ]
  }
}
```

### Relatório de Vendas

```http
GET /api/reports/sales?startDate=2024-01-01&endDate=2024-01-31&type=sale&status=completed
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "message": "Relatório de vendas gerado com sucesso",
  "data": {
    "summary": {
      "totalSales": 45,
      "totalAmount": 15750.00,
      "averageTicket": 350.00,
      "typeBreakdown": {
        "sale": { "count": 40, "amount": 14250.00 },
        "quote": { "count": 5, "amount": 1500.00 }
      },
      "paymentMethodBreakdown": {
        "cash": { "count": 20, "amount": 7000.00 },
        "card": { "count": 15, "amount": 5250.00 },
        "installment": { "count": 10, "amount": 3500.00 }
      }
    },
    "data": [
      {
        "id": "uuid",
        "number": "VD0012024",
        "type": "sale",
        "totalAmount": 350.00,
        "paymentMethod": "card",
        "client": { "name": "Carlos Pereira" },
        "seller": "Ana Costa"
      }
    ]
  }
}
```

### Relatório de Estoque

```http
GET /api/reports/inventory?lowStock=true&category=Lubrificantes
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "message": "Relatório de estoque gerado com sucesso",
  "data": {
    "summary": {
      "totalProducts": 150,
      "lowStockProducts": 12,
      "outOfStockProducts": 3,
      "totalInventoryValue": 45000.00,
      "categoryBreakdown": {
        "Lubrificantes": { "count": 25, "totalValue": 8500.00 },
        "Filtros": { "count": 30, "totalValue": 4200.00 }
      }
    },
    "data": [
      {
        "id": "uuid",
        "name": "Óleo Motor 20W50",
        "category": "Lubrificantes",
        "stockQuantity": 5,
        "minStock": 10,
        "stockStatus": "low",
        "inventoryValue": 450.00,
        "movements": {
          "totalIn": 50,
          "totalOut": 45,
          "lastMovementDate": "2024-01-15T10:30:00Z"
        }
      }
    ]
  }
}
```

### Relatório Financeiro

```http
GET /api/reports/financial?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "message": "Relatório financeiro gerado com sucesso",
  "data": {
    "summary": {
      "period": { "startDate": "2024-01-01", "endDate": "2024-01-31" },
      "netCashFlow": 8500.00,
      "netResult": 12000.00
    },
    "sales": {
      "totalSales": 45,
      "totalAmount": 15750.00,
      "paidAmount": 14250.00,
      "pendingAmount": 1500.00
    },
    "receivable": {
      "totalReceivable": 25,
      "totalAmount": 8500.00,
      "receivedAmount": 7200.00,
      "overdueAmount": 800.00
    },
    "payable": {
      "totalPayable": 15,
      "totalAmount": 5200.00,
      "paidAmount": 4800.00,
      "overdueAmount": 200.00
    },
    "cash": {
      "totalIn": 18500.00,
      "totalOut": 10000.00,
      "netFlow": 8500.00
    }
  }
}
```

## 📤 Exportação de Relatórios

### Exportar em JSON

```http
GET /api/reports/export?type=sales&format=json&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer {token}
```

### Tipos de Exportação Suportados

- **JSON** - Formato estruturado para integração
- **PDF** - Documento formatado (em desenvolvimento)
- **Excel** - Planilha para análise (em desenvolvimento)

## 🔧 Configuração Avançada

### Relatórios Automáticos

```javascript
const { scheduleAutomaticReports } = require('./reports');

// Agendar relatórios automáticos
scheduleAutomaticReports();
```

**Funcionalidades:**
- Relatórios mensais automáticos
- Limpeza diária de dados antigos
- Notificações de estoque baixo
- Alertas de contas vencidas

### Estatísticas Rápidas

```javascript
const { getQuickStats } = require('./reports');

const stats = await getQuickStats();
console.log(stats);
// {
//   month: { sales: 45, revenue: 15750.00 },
//   inventory: { lowStockProducts: 8 },
//   timestamp: "2024-01-31T10:30:00Z"
// }
```

### Relatório Personalizado

```javascript
const { generateCustomReport } = require('./reports');

const report = await generateCustomReport({
  type: 'sales',
  parameters: {
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    type: 'sale'
  },
  format: 'json'
});
```

## 📊 Métricas e KPIs

### Vendas
- Total de vendas por período
- Ticket médio
- Conversão orçamento → venda
- Breakdown por vendedor
- Análise de sazonalidade

### Serviços
- Tempo médio de execução
- Produtividade por mecânico
- Taxa de retrabalho
- Margem de lucro por serviço

### Estoque
- Giro de estoque
- Produtos mais vendidos
- Análise ABC
- Previsão de reposição

### Financeiro
- Fluxo de caixa
- Inadimplência
- Margem de contribuição
- ROI por categoria

## 🧪 Testes

### Executar Testes

```bash
# Todos os testes
npm test

# Testes em modo watch
npm run test:watch

# Cobertura de testes
npm run test:coverage
```

### Estrutura de Testes

- **ReportsService.test.js** - Testes da lógica de negócio
- **ReportsController.test.js** - Testes dos endpoints
- Cobertura > 85% das funcionalidades

## 🔒 Segurança e Permissões

### Controle de Acesso

- **Manager+** - Acesso a todos os relatórios
- **Operator** - Apenas relatórios básicos
- **Mechanic** - Apenas seus próprios serviços

### Validações

- Períodos máximos (1 ano)
- Parâmetros obrigatórios
- Sanitização de inputs
- Rate limiting para exportações

## 📈 Performance

### Otimizações

- Índices otimizados no banco
- Cache de consultas frequentes
- Paginação automática
- Lazy loading de dados

### Monitoramento

- Log de consultas lentas (>2s)
- Métricas de uso por relatório
- Alertas de performance

## 🔄 Integração

### Com Outros Módulos

```javascript
// Integração com sistema de vendas
const salesData = await ReportsService.getSalesReport(startDate, endDate);

// Integração com estoque
const lowStockAlert = await ReportsService.getInventoryReport(null, null, true);

// Integração com financeiro
const cashFlow = await ReportsService.getFinancialReport(startDate, endDate);
```

### Webhooks (Futuro)

- Notificação de relatórios prontos
- Alertas automáticos
- Integração com BI externo

## 📝 Changelog

### v1.0.0
- Sistema completo de relatórios
- 5 tipos principais de relatórios
- Dashboard interativo
- Exportação em JSON
- Relatórios automáticos
- Testes unitários completos
- Documentação detalhada

## 🚀 Roadmap

### v1.1.0
- Exportação PDF/Excel
- Gráficos e visualizações
- Relatórios customizáveis
- API de webhooks

### v1.2.0
- Machine Learning para previsões
- Relatórios de tendências
- Integração com BI tools
- Mobile dashboard

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.