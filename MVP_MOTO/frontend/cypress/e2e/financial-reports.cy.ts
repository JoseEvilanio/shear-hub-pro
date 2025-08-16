// Testes E2E - Relatórios Financeiros
// Sistema de Gestão de Oficina Mecânica de Motos

describe('Relatórios Financeiros - Fluxo Completo', () => {
  beforeEach(() => {
    cy.clearDb();
    cy.seedDb();
    cy.login();
    cy.visitFinancial();
  });

  describe('Dashboard Financeiro', () => {
    it('deve exibir resumo financeiro do período', () => {
      cy.get('[data-testid="financial-dashboard"]').should('be.visible');
      
      // Verificar cards de resumo
      cy.get('[data-testid="total-revenue"]').should('be.visible');
      cy.get('[data-testid="total-expenses"]').should('be.visible');
      cy.get('[data-testid="net-profit"]').should('be.visible');
      cy.get('[data-testid="pending-receivables"]').should('be.visible');
      
      // Verificar valores
      cy.get('[data-testid="total-revenue"]').should('contain.text', 'R$');
      cy.get('[data-testid="net-profit"]').should('contain.text', 'R$');
    });

    it('deve permitir alterar período do dashboard', () => {
      // Alterar para período mensal
      cy.get('[data-testid="period-selector"]').click();
      cy.get('[data-testid="period-month"]').click();
      
      cy.waitForPageLoad();
      
      // Verificar que dados foram atualizados
      cy.get('[data-testid="period-label"]').should('contain.text', 'Mensal');
      cy.get('[data-testid="total-revenue"]').should('be.visible');
    });

    it('deve exibir gráficos de receitas e despesas', () => {
      // Verificar gráfico de receitas
      cy.get('[data-testid="revenue-chart"]').should('be.visible');
      cy.get('[data-testid="revenue-chart"] canvas').should('exist');
      
      // Verificar gráfico de despesas
      cy.get('[data-testid="expenses-chart"]').should('be.visible');
      cy.get('[data-testid="expenses-chart"] canvas').should('exist');
      
      // Verificar gráfico de fluxo de caixa
      cy.get('[data-testid="cashflow-chart"]').should('be.visible');
    });
  });

  describe('Contas a Receber', () => {
    it('deve exibir lista de contas a receber', () => {
      cy.get('[data-testid="receivables-tab"]').click();
      
      cy.get('[data-testid="receivables-table"]').should('be.visible');
      cy.get('[data-testid^="receivable-row-"]').should('have.length.at.least', 1);
      
      // Verificar colunas
      cy.get('[data-testid="receivables-header"]').within(() => {
        cy.contains('Cliente').should('be.visible');
        cy.contains('Valor').should('be.visible');
        cy.contains('Vencimento').should('be.visible');
        cy.contains('Status').should('be.visible');
      });
    });

    it('deve permitir filtrar contas por status', () => {
      cy.get('[data-testid="receivables-tab"]').click();
      
      // Filtrar por vencidas
      cy.get('[data-testid="status-filter"]').click();
      cy.get('[data-testid="status-overdue"]').click();
      
      cy.get('[data-testid^="receivable-row-"]').each(($row) => {
        cy.wrap($row).find('[data-testid="status-badge"]').should('contain.text', 'Vencida');
      });
    });

    it('deve permitir registrar recebimento', () => {
      cy.get('[data-testid="receivables-tab"]').click();
      
      // Selecionar primeira conta
      cy.get('[data-testid="receivable-row-0"]').click();
      cy.get('[data-testid="receive-payment"]').click();
      
      // Preencher dados do recebimento
      cy.get('[data-testid="payment-modal"]').should('be.visible');
      cy.get('[data-testid="received-amount"]').should('have.value', '150.00'); // Valor original
      cy.get('[data-testid="payment-method"]').select('cash');
      cy.get('[data-testid="payment-date"]').type('2024-01-25');
      
      // Confirmar recebimento
      cy.get('[data-testid="confirm-payment"]').click();
      
      cy.checkNotification('success', 'Recebimento registrado com sucesso');
      
      // Verificar que conta foi marcada como paga
      cy.get('[data-testid="receivable-row-0"]')
        .find('[data-testid="status-badge"]')
        .should('contain.text', 'Paga');
    });

    it('deve permitir recebimento parcial', () => {
      cy.get('[data-testid="receivables-tab"]').click();
      cy.get('[data-testid="receivable-row-0"]').click();
      cy.get('[data-testid="receive-payment"]').click();
      
      // Alterar valor para parcial
      cy.get('[data-testid="received-amount"]').clear().type('75.00'); // Metade do valor
      cy.get('[data-testid="payment-method"]').select('cash');
      
      cy.get('[data-testid="confirm-payment"]').click();
      
      cy.checkNotification('success', 'Recebimento parcial registrado');
      
      // Verificar que conta ficou como parcialmente paga
      cy.get('[data-testid="receivable-row-0"]')
        .find('[data-testid="status-badge"]')
        .should('contain.text', 'Parcial');
      
      // Verificar valor restante
      cy.get('[data-testid="receivable-row-0"]')
        .find('[data-testid="remaining-amount"]')
        .should('contain.text', 'R$ 75,00');
    });

    it('deve gerar relatório de contas a receber', () => {
      cy.get('[data-testid="receivables-tab"]').click();
      cy.get('[data-testid="generate-receivables-report"]').click();
      
      // Configurar relatório
      cy.get('[data-testid="report-modal"]').should('be.visible');
      cy.get('[data-testid="report-period-from"]').type('2024-01-01');
      cy.get('[data-testid="report-period-to"]').type('2024-01-31');
      cy.get('[data-testid="include-paid"]').check();
      
      cy.get('[data-testid="generate-report"]').click();
      
      cy.checkNotification('success', 'Relatório gerado com sucesso');
      cy.readFile('cypress/downloads/contas-receber-*.pdf').should('exist');
    });
  });

  describe('Contas a Pagar', () => {
    it('deve exibir lista de contas a pagar', () => {
      cy.get('[data-testid="payables-tab"]').click();
      
      cy.get('[data-testid="payables-table"]').should('be.visible');
      cy.get('[data-testid^="payable-row-"]').should('have.length.at.least', 1);
    });

    it('deve permitir registrar nova conta a pagar', () => {
      cy.get('[data-testid="payables-tab"]').click();
      cy.get('[data-testid="add-payable"]').click();
      
      // Preencher formulário
      cy.get('[data-testid="payable-modal"]').should('be.visible');
      cy.get('[data-testid="supplier-select"]').select('Distribuidora ABC');
      cy.get('[data-testid="description"]').type('Compra de produtos');
      cy.get('[data-testid="amount"]').type('500.00');
      cy.get('[data-testid="due-date"]').type('2024-02-15');
      cy.get('[data-testid="category"]').select('inventory');
      
      cy.get('[data-testid="save-payable"]').click();
      
      cy.checkNotification('success', 'Conta a pagar registrada');
      
      // Verificar na lista
      cy.get('[data-testid^="payable-row-"]').should('contain.text', 'Distribuidora ABC');
    });

    it('deve permitir registrar pagamento', () => {
      cy.get('[data-testid="payables-tab"]').click();
      cy.get('[data-testid="payable-row-0"]').click();
      cy.get('[data-testid="make-payment"]').click();
      
      // Confirmar pagamento
      cy.get('[data-testid="payment-modal"]').should('be.visible');
      cy.get('[data-testid="payment-amount"]').should('not.be.empty');
      cy.get('[data-testid="payment-method"]').select('bank_transfer');
      cy.get('[data-testid="payment-date"]').type('2024-01-25');
      
      cy.get('[data-testid="confirm-payment"]').click();
      
      cy.checkNotification('success', 'Pagamento registrado com sucesso');
    });
  });

  describe('Fluxo de Caixa', () => {
    it('deve exibir fluxo de caixa diário', () => {
      cy.get('[data-testid="cashflow-tab"]').click();
      
      cy.get('[data-testid="cashflow-table"]').should('be.visible');
      cy.get('[data-testid="opening-balance"]').should('be.visible');
      cy.get('[data-testid="closing-balance"]').should('be.visible');
      
      // Verificar movimentações
      cy.get('[data-testid^="cashflow-entry-"]').should('have.length.at.least', 1);
    });

    it('deve permitir registrar entrada manual', () => {
      cy.get('[data-testid="cashflow-tab"]').click();
      cy.get('[data-testid="add-cash-entry"]').click();
      
      // Preencher entrada
      cy.get('[data-testid="cash-entry-modal"]').should('be.visible');
      cy.get('[data-testid="entry-type"]').select('income');
      cy.get('[data-testid="amount"]').type('200.00');
      cy.get('[data-testid="description"]').type('Serviço avulso');
      cy.get('[data-testid="category"]').select('services');
      
      cy.get('[data-testid="save-entry"]').click();
      
      cy.checkNotification('success', 'Entrada registrada no caixa');
      
      // Verificar atualização do saldo
      cy.get('[data-testid="closing-balance"]').should('contain.text', 'R$');
    });

    it('deve permitir registrar saída manual', () => {
      cy.get('[data-testid="cashflow-tab"]').click();
      cy.get('[data-testid="add-cash-entry"]').click();
      
      // Preencher saída
      cy.get('[data-testid="entry-type"]').select('expense');
      cy.get('[data-testid="amount"]').type('50.00');
      cy.get('[data-testid="description"]').type('Combustível');
      cy.get('[data-testid="category"]').select('operational');
      
      cy.get('[data-testid="save-entry"]').click();
      
      cy.checkNotification('success', 'Saída registrada no caixa');
    });

    it('deve gerar relatório de fluxo de caixa', () => {
      cy.get('[data-testid="cashflow-tab"]').click();
      cy.get('[data-testid="generate-cashflow-report"]').click();
      
      // Configurar período
      cy.get('[data-testid="report-period-from"]').type('2024-01-01');
      cy.get('[data-testid="report-period-to"]').type('2024-01-31');
      cy.get('[data-testid="group-by-category"]').check();
      
      cy.get('[data-testid="generate-report"]').click();
      
      cy.checkNotification('success', 'Relatório de fluxo de caixa gerado');
    });
  });

  describe('Relatórios Gerenciais', () => {
    it('deve gerar DRE (Demonstrativo de Resultado)', () => {
      cy.get('[data-testid="reports-tab"]').click();
      cy.get('[data-testid="dre-report"]').click();
      
      // Configurar período
      cy.get('[data-testid="dre-period-from"]').type('2024-01-01');
      cy.get('[data-testid="dre-period-to"]').type('2024-01-31');
      
      cy.get('[data-testid="generate-dre"]').click();
      
      // Verificar estrutura do DRE
      cy.get('[data-testid="dre-result"]').should('be.visible');
      cy.get('[data-testid="gross-revenue"]').should('be.visible');
      cy.get('[data-testid="net-revenue"]').should('be.visible');
      cy.get('[data-testid="cost-of-goods"]').should('be.visible');
      cy.get('[data-testid="gross-profit"]').should('be.visible');
      cy.get('[data-testid="operational-expenses"]').should('be.visible');
      cy.get('[data-testid="net-profit"]').should('be.visible');
      
      // Exportar DRE
      cy.get('[data-testid="export-dre"]').click();
      cy.readFile('cypress/downloads/dre-*.pdf').should('exist');
    });

    it('deve gerar relatório de vendas por período', () => {
      cy.get('[data-testid="reports-tab"]').click();
      cy.get('[data-testid="sales-report"]').click();
      
      // Configurar relatório
      cy.get('[data-testid="sales-period-from"]').type('2024-01-01');
      cy.get('[data-testid="sales-period-to"]').type('2024-01-31');
      cy.get('[data-testid="group-by"]').select('day');
      cy.get('[data-testid="include-charts"]').check();
      
      cy.get('[data-testid="generate-sales-report"]').click();
      
      // Verificar relatório
      cy.get('[data-testid="sales-report-result"]').should('be.visible');
      cy.get('[data-testid="sales-summary"]').should('be.visible');
      cy.get('[data-testid="sales-chart"]').should('be.visible');
      
      // Verificar dados
      cy.get('[data-testid="total-sales"]').should('contain.text', 'R$');
      cy.get('[data-testid="average-ticket"]').should('contain.text', 'R$');
    });

    it('deve gerar relatório de produtos mais vendidos', () => {
      cy.get('[data-testid="reports-tab"]').click();
      cy.get('[data-testid="top-products-report"]').click();
      
      // Configurar período e limite
      cy.get('[data-testid="products-period-from"]').type('2024-01-01');
      cy.get('[data-testid="products-period-to"]').type('2024-01-31');
      cy.get('[data-testid="top-limit"]').select('10');
      
      cy.get('[data-testid="generate-products-report"]').click();
      
      // Verificar lista de produtos
      cy.get('[data-testid="top-products-list"]').should('be.visible');
      cy.get('[data-testid^="product-rank-"]').should('have.length.at.least', 1);
      
      // Verificar informações do produto
      cy.get('[data-testid="product-rank-1"]').within(() => {
        cy.get('[data-testid="product-name"]').should('be.visible');
        cy.get('[data-testid="quantity-sold"]').should('be.visible');
        cy.get('[data-testid="total-revenue"]').should('be.visible');
      });
    });

    it('deve gerar relatório de clientes', () => {
      cy.get('[data-testid="reports-tab"]').click();
      cy.get('[data-testid="clients-report"]').click();
      
      // Configurar relatório
      cy.get('[data-testid="clients-period-from"]').type('2024-01-01');
      cy.get('[data-testid="clients-period-to"]').type('2024-01-31');
      cy.get('[data-testid="sort-by"]').select('total_spent');
      cy.get('[data-testid="include-inactive"]').uncheck();
      
      cy.get('[data-testid="generate-clients-report"]').click();
      
      // Verificar relatório
      cy.get('[data-testid="clients-report-result"]').should('be.visible');
      cy.get('[data-testid="clients-summary"]').should('be.visible');
      
      // Verificar métricas
      cy.get('[data-testid="total-clients"]').should('contain.text', '3');
      cy.get('[data-testid="active-clients"]').should('be.visible');
      cy.get('[data-testid="average-spent"]').should('contain.text', 'R$');
    });
  });

  describe('Análises Avançadas', () => {
    it('deve exibir análise de lucratividade por produto', () => {
      cy.get('[data-testid="analytics-tab"]').click();
      cy.get('[data-testid="product-profitability"]').click();
      
      // Configurar análise
      cy.get('[data-testid="profitability-period-from"]').type('2024-01-01');
      cy.get('[data-testid="profitability-period-to"]').type('2024-01-31');
      
      cy.get('[data-testid="analyze-profitability"]').click();
      
      // Verificar resultados
      cy.get('[data-testid="profitability-results"]').should('be.visible');
      cy.get('[data-testid^="product-profitability-"]').should('have.length.at.least', 1);
      
      // Verificar métricas por produto
      cy.get('[data-testid="product-profitability-1"]').within(() => {
        cy.get('[data-testid="product-name"]').should('be.visible');
        cy.get('[data-testid="cost-price"]').should('be.visible');
        cy.get('[data-testid="sale-price"]').should('be.visible');
        cy.get('[data-testid="profit-margin"]').should('be.visible');
        cy.get('[data-testid="total-profit"]').should('be.visible');
      });
    });

    it('deve exibir análise de sazonalidade', () => {
      cy.get('[data-testid="analytics-tab"]').click();
      cy.get('[data-testid="seasonality-analysis"]').click();
      
      // Configurar análise para 12 meses
      cy.get('[data-testid="analysis-period"]').select('12_months');
      
      cy.get('[data-testid="analyze-seasonality"]').click();
      
      // Verificar gráfico de sazonalidade
      cy.get('[data-testid="seasonality-chart"]').should('be.visible');
      cy.get('[data-testid="seasonality-insights"]').should('be.visible');
      
      // Verificar insights
      cy.get('[data-testid="best-month"]').should('be.visible');
      cy.get('[data-testid="worst-month"]').should('be.visible');
      cy.get('[data-testid="growth-trend"]').should('be.visible');
    });

    it('deve exibir análise de inadimplência', () => {
      cy.get('[data-testid="analytics-tab"]').click();
      cy.get('[data-testid="default-analysis"]').click();
      
      cy.get('[data-testid="analyze-defaults"]').click();
      
      // Verificar métricas de inadimplência
      cy.get('[data-testid="default-rate"]').should('be.visible');
      cy.get('[data-testid="overdue-amount"]').should('be.visible');
      cy.get('[data-testid="average-delay"]').should('be.visible');
      
      // Verificar lista de maiores devedores
      cy.get('[data-testid="top-debtors"]').should('be.visible');
      cy.get('[data-testid^="debtor-"]').should('have.length.at.least', 1);
    });
  });

  describe('Exportação e Integração', () => {
    it('deve exportar dados para Excel', () => {
      cy.get('[data-testid="export-button"]').click();
      cy.get('[data-testid="export-format"]').select('excel');
      cy.get('[data-testid="export-data"]').select('all_financial');
      cy.get('[data-testid="export-period-from"]').type('2024-01-01');
      cy.get('[data-testid="export-period-to"]').type('2024-01-31');
      
      cy.get('[data-testid="confirm-export"]').click();
      
      cy.checkNotification('success', 'Dados exportados com sucesso');
      cy.readFile('cypress/downloads/dados-financeiros-*.xlsx').should('exist');
    });

    it('deve exportar para sistema contábil', () => {
      cy.get('[data-testid="export-button"]').click();
      cy.get('[data-testid="export-format"]').select('accounting_system');
      cy.get('[data-testid="accounting-system"]').select('sped');
      
      cy.get('[data-testid="confirm-export"]').click();
      
      cy.checkNotification('success', 'Arquivo SPED gerado com sucesso');
    });

    it('deve permitir backup dos dados financeiros', () => {
      cy.get('[data-testid="backup-button"]').click();
      cy.get('[data-testid="backup-type"]').select('financial_only');
      cy.get('[data-testid="include-attachments"]').check();
      
      cy.get('[data-testid="create-backup"]').click();
      
      cy.checkNotification('success', 'Backup criado com sucesso');
      cy.readFile('cypress/downloads/backup-financeiro-*.zip').should('exist');
    });
  });

  describe('Performance e Responsividade', () => {
    it('deve carregar relatórios rapidamente', () => {
      const startTime = Date.now();
      
      cy.get('[data-testid="reports-tab"]').click();
      cy.get('[data-testid="sales-report"]').click();
      cy.get('[data-testid="generate-sales-report"]').click();
      
      cy.get('[data-testid="sales-report-result"]').should('be.visible');
      
      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(5000); // Menos de 5 segundos
      });
    });

    it('deve funcionar em dispositivos móveis', () => {
      cy.viewport(375, 667);
      
      // Verificar adaptação mobile
      cy.get('[data-testid="financial-dashboard"]').should('be.visible');
      cy.get('[data-testid="mobile-menu"]').should('be.visible');
      
      // Verificar que cards se adaptam
      cy.get('[data-testid="total-revenue"]').should('be.visible');
    });
  });

  describe('Segurança e Auditoria', () => {
    it('deve registrar log de ações financeiras', () => {
      // Realizar ação que deve ser logada
      cy.get('[data-testid="receivables-tab"]').click();
      cy.get('[data-testid="receivable-row-0"]').click();
      cy.get('[data-testid="receive-payment"]').click();
      cy.get('[data-testid="payment-method"]').select('cash');
      cy.get('[data-testid="confirm-payment"]').click();
      
      // Verificar logs
      cy.get('[data-testid="audit-logs"]').click();
      cy.get('[data-testid="log-entry-0"]').should('contain.text', 'Recebimento registrado');
      cy.get('[data-testid="log-entry-0"]').should('contain.text', 'Admin Teste');
    });

    it('deve validar permissões para ações sensíveis', () => {
      // Tentar ação que requer permissão especial
      cy.get('[data-testid="delete-financial-record"]').click();
      
      // Verificar solicitação de confirmação adicional
      cy.get('[data-testid="permission-modal"]').should('be.visible');
      cy.get('[data-testid="confirm-password"]').type('admin123');
      cy.get('[data-testid="confirm-action"]').click();
      
      cy.checkNotification('success', 'Ação autorizada');
    });
  });
});