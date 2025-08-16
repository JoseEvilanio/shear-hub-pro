// Testes E2E - Vendas
// Sistema de Gestão de Oficina Mecânica de Motos

describe('Vendas - Processo Completo', () => {
  beforeEach(() => {
    // Preparar ambiente de teste
    cy.clearDb();
    cy.seedDb();
    cy.login();
    cy.visitSales();
  });

  describe('Listagem de Vendas', () => {
    it('deve exibir a lista de vendas', () => {
      cy.get('[data-testid="sales-page"]').should('be.visible');
      cy.get('[data-testid="page-title"]').should('contain.text', 'Vendas');
      
      // Verificar tabela de vendas
      cy.get('[data-testid="sales-table"]').should('be.visible');
      cy.get('[data-testid^="sale-row-"]').should('have.length.at.least', 1);
      
      // Verificar colunas
      cy.get('[data-testid="table-header"]').within(() => {
        cy.contains('Número').should('be.visible');
        cy.contains('Cliente').should('be.visible');
        cy.contains('Tipo').should('be.visible');
        cy.contains('Valor').should('be.visible');
        cy.contains('Status').should('be.visible');
        cy.contains('Data').should('be.visible');
      });
    });

    it('deve permitir filtrar vendas por período', () => {
      // Filtrar por data
      cy.get('[data-testid="date-filter-from"]').type('2024-01-01');
      cy.get('[data-testid="date-filter-to"]').type('2024-01-31');
      cy.get('[data-testid="apply-filter"]').click();
      
      cy.waitForPageLoad();
      cy.get('[data-testid^="sale-row-"]').should('have.length.at.least', 1);
    });

    it('deve permitir filtrar por tipo de venda', () => {
      // Filtrar por orçamento
      cy.get('[data-testid="type-filter"]').click();
      cy.get('[data-testid="type-option-quote"]').click();
      
      cy.get('[data-testid^="sale-row-"]').each(($row) => {
        cy.wrap($row).find('[data-testid="sale-type"]').should('contain.text', 'Orçamento');
      });
    });
  });

  describe('Nova Venda - Fluxo Completo', () => {
    it('deve criar uma venda completa com sucesso', () => {
      // Iniciar nova venda
      cy.get('[data-testid="new-sale-button"]').click();
      cy.get('[data-testid="sale-form"]').should('be.visible');
      
      // Selecionar cliente
      cy.get('[data-testid="client-select"]').click();
      cy.get('[data-testid="client-option-1"]').click();
      
      // Verificar se dados do cliente foram carregados
      cy.get('[data-testid="client-info"]').should('contain.text', 'João Silva');
      
      // Adicionar produtos
      cy.addProductToSale('1', 2); // Óleo x2
      cy.addProductToSale('2', 1); // Filtro x1
      
      // Verificar cálculo do subtotal
      cy.get('[data-testid="subtotal"]').should('contain.text', 'R$ 67,30'); // (25.90 * 2) + 15.50
      
      // Aplicar desconto
      cy.get('[data-testid="discount-input"]').clear().type('10');
      cy.get('[data-testid="discount-type"]').select('percentage');
      
      // Verificar total com desconto
      cy.get('[data-testid="total-amount"]').should('contain.text', 'R$ 60,57'); // 67.30 - 10%
      
      // Selecionar forma de pagamento
      cy.get('[data-testid="payment-method"]').select('cash');
      
      // Finalizar venda
      cy.get('[data-testid="finalize-sale"]').click();
      
      // Verificar sucesso
      cy.checkNotification('success', 'Venda realizada com sucesso');
      
      // Verificar se voltou para a lista
      cy.url().should('include', '/sales');
      cy.get('[data-testid^="sale-row-"]').first().should('contain.text', 'João Silva');
    });

    it('deve permitir alternar entre venda e orçamento', () => {
      cy.get('[data-testid="new-sale-button"]').click();
      
      // Verificar modo inicial (venda)
      cy.get('[data-testid="sale-type-toggle"]').should('contain.text', 'Venda');
      
      // Alternar para orçamento
      cy.get('[data-testid="toggle-to-quote"]').click();
      cy.get('[data-testid="sale-type-toggle"]').should('contain.text', 'Orçamento');
      
      // Verificar que botão mudou
      cy.get('[data-testid="finalize-sale"]').should('contain.text', 'Gerar Orçamento');
    });

    it('deve validar estoque antes de finalizar venda', () => {
      cy.get('[data-testid="new-sale-button"]').click();
      
      // Selecionar cliente
      cy.get('[data-testid="client-select"]').click();
      cy.get('[data-testid="client-option-1"]').click();
      
      // Tentar adicionar quantidade maior que o estoque
      cy.addProductToSale('3', 10); // Pastilha (estoque: 3)
      
      // Verificar aviso de estoque
      cy.checkNotification('warning', 'Quantidade maior que o estoque disponível');
      
      // Verificar que a quantidade foi ajustada
      cy.get('[data-testid="item-quantity-3"]').should('have.value', '3');
    });

    it('deve calcular corretamente diferentes tipos de desconto', () => {
      cy.get('[data-testid="new-sale-button"]').click();
      cy.get('[data-testid="client-select"]').click();
      cy.get('[data-testid="client-option-1"]').click();
      
      // Adicionar produto
      cy.addProductToSale('1', 1); // Óleo R$ 25,90
      
      // Testar desconto percentual
      cy.get('[data-testid="discount-input"]').clear().type('10');
      cy.get('[data-testid="discount-type"]').select('percentage');
      cy.get('[data-testid="total-amount"]').should('contain.text', 'R$ 23,31'); // 25.90 - 10%
      
      // Testar desconto em valor
      cy.get('[data-testid="discount-type"]').select('value');
      cy.get('[data-testid="total-amount"]').should('contain.text', 'R$ 15,90'); // 25.90 - 10.00
    });
  });

  describe('Leitor de Código de Barras', () => {
    it('deve adicionar produto via código de barras', () => {
      cy.get('[data-testid="new-sale-button"]').click();
      cy.get('[data-testid="client-select"]').click();
      cy.get('[data-testid="client-option-1"]').click();
      
      // Simular leitura de código de barras
      cy.get('[data-testid="barcode-input"]').type('7891234567890{enter}');
      
      // Verificar se produto foi adicionado
      cy.get('[data-testid="sale-items"]').should('contain.text', 'Óleo Motor 20W50');
      cy.get('[data-testid="item-quantity-1"]').should('have.value', '1');
    });

    it('deve exibir erro para código de barras inválido', () => {
      cy.get('[data-testid="new-sale-button"]').click();
      
      // Código de barras inexistente
      cy.get('[data-testid="barcode-input"]').type('1234567890123{enter}');
      
      // Verificar erro
      cy.checkNotification('error', 'Produto não encontrado');
    });

    it('deve permitir alterar quantidade após leitura', () => {
      cy.get('[data-testid="new-sale-button"]').click();
      cy.get('[data-testid="client-select"]').click();
      cy.get('[data-testid="client-option-1"]').click();
      
      // Adicionar produto via código de barras
      cy.get('[data-testid="barcode-input"]').type('7891234567890{enter}');
      
      // Alterar quantidade
      cy.get('[data-testid="item-quantity-1"]').clear().type('3');
      
      // Verificar atualização do total
      cy.get('[data-testid="total-amount"]').should('contain.text', 'R$ 77,70'); // 25.90 * 3
    });
  });

  describe('Formas de Pagamento', () => {
    beforeEach(() => {
      // Preparar venda básica
      cy.get('[data-testid="new-sale-button"]').click();
      cy.get('[data-testid="client-select"]').click();
      cy.get('[data-testid="client-option-1"]').click();
      cy.addProductToSale('1', 1);
    });

    it('deve processar pagamento à vista', () => {
      cy.get('[data-testid="payment-method"]').select('cash');
      cy.get('[data-testid="finalize-sale"]').click();
      
      // Verificar modal de pagamento
      cy.get('[data-testid="payment-modal"]').should('be.visible');
      cy.get('[data-testid="amount-received"]').type('30.00');
      cy.get('[data-testid="confirm-payment"]').click();
      
      // Verificar troco
      cy.get('[data-testid="change-amount"]').should('contain.text', 'R$ 4,10');
      
      // Finalizar
      cy.get('[data-testid="complete-sale"]').click();
      cy.checkNotification('success', 'Venda finalizada com sucesso');
    });

    it('deve processar pagamento no cartão', () => {
      cy.get('[data-testid="payment-method"]').select('card');
      cy.get('[data-testid="finalize-sale"]').click();
      
      // Verificar opções de cartão
      cy.get('[data-testid="card-type"]').select('credit');
      cy.get('[data-testid="installments"]').select('1');
      cy.get('[data-testid="confirm-payment"]').click();
      
      cy.checkNotification('success', 'Pagamento processado com sucesso');
    });

    it('deve processar pagamento a prazo', () => {
      cy.get('[data-testid="payment-method"]').select('installment');
      cy.get('[data-testid="finalize-sale"]').click();
      
      // Configurar parcelas
      cy.get('[data-testid="installment-count"]').select('3');
      cy.get('[data-testid="first-due-date"]').type('2024-02-01');
      cy.get('[data-testid="confirm-payment"]').click();
      
      // Verificar parcelas geradas
      cy.get('[data-testid="installment-preview"]').should('be.visible');
      cy.get('[data-testid^="installment-"]').should('have.length', 3);
      
      cy.get('[data-testid="complete-sale"]').click();
      cy.checkNotification('success', 'Venda a prazo registrada com sucesso');
    });
  });

  describe('Impressão e Documentos', () => {
    it('deve gerar e imprimir cupom fiscal', () => {
      // Completar uma venda
      cy.completeSale();
      
      // Imprimir cupom
      cy.get('[data-testid="print-receipt"]').click();
      
      // Verificar se a janela de impressão abriu
      cy.window().its('print').should('be.called');
    });

    it('deve gerar PDF da venda', () => {
      cy.completeSale();
      
      // Gerar PDF
      cy.get('[data-testid="generate-pdf"]').click();
      
      // Verificar download
      cy.readFile('cypress/downloads/venda-*.pdf').should('exist');
    });

    it('deve enviar comprovante por email', () => {
      cy.completeSale();
      
      // Enviar por email
      cy.get('[data-testid="send-email"]').click();
      cy.get('[data-testid="email-modal"]').should('be.visible');
      cy.get('[data-testid="recipient-email"]').should('have.value', 'joao@email.com');
      cy.get('[data-testid="send-email-confirm"]').click();
      
      cy.checkNotification('success', 'Comprovante enviado por email');
    });
  });

  describe('Gestão de Orçamentos', () => {
    it('deve converter orçamento em venda', () => {
      // Criar orçamento
      cy.get('[data-testid="new-sale-button"]').click();
      cy.get('[data-testid="toggle-to-quote"]').click();
      
      cy.get('[data-testid="client-select"]').click();
      cy.get('[data-testid="client-option-1"]').click();
      cy.addProductToSale('1', 1);
      
      cy.get('[data-testid="finalize-sale"]').click();
      cy.checkNotification('success', 'Orçamento gerado com sucesso');
      
      // Converter em venda
      cy.get('[data-testid="quote-row-0"]').click();
      cy.get('[data-testid="convert-to-sale"]').click();
      
      // Verificar se abriu como venda
      cy.get('[data-testid="sale-type-toggle"]').should('contain.text', 'Venda');
      cy.get('[data-testid="finalize-sale"]').should('contain.text', 'Finalizar Venda');
    });

    it('deve definir validade do orçamento', () => {
      cy.get('[data-testid="new-sale-button"]').click();
      cy.get('[data-testid="toggle-to-quote"]').click();
      
      // Definir validade
      cy.get('[data-testid="quote-validity"]').type('2024-02-15');
      
      cy.get('[data-testid="client-select"]').click();
      cy.get('[data-testid="client-option-1"]').click();
      cy.addProductToSale('1', 1);
      
      cy.get('[data-testid="finalize-sale"]').click();
      
      // Verificar validade na lista
      cy.get('[data-testid="quote-row-0"]').should('contain.text', '15/02/2024');
    });
  });

  describe('Relatórios de Vendas', () => {
    it('deve exibir resumo de vendas do dia', () => {
      cy.get('[data-testid="daily-summary"]').should('be.visible');
      cy.get('[data-testid="daily-sales-count"]').should('contain.text', '2');
      cy.get('[data-testid="daily-sales-total"]').should('contain.text', 'R$ 235,40');
    });

    it('deve permitir exportar relatório de vendas', () => {
      cy.get('[data-testid="export-sales"]').click();
      cy.get('[data-testid="export-format"]').select('excel');
      cy.get('[data-testid="export-period"]').select('month');
      cy.get('[data-testid="confirm-export"]').click();
      
      // Verificar download
      cy.readFile('cypress/downloads/vendas-*.xlsx').should('exist');
    });
  });

  describe('Integração com Estoque', () => {
    it('deve atualizar estoque após venda', () => {
      // Verificar estoque inicial
      cy.visit('/inventory');
      cy.get('[data-testid="product-row-1"]')
        .find('[data-testid="current-stock"]')
        .should('contain.text', '45'); // Estoque inicial do óleo
      
      // Realizar venda
      cy.visitSales();
      cy.get('[data-testid="new-sale-button"]').click();
      cy.get('[data-testid="client-select"]').click();
      cy.get('[data-testid="client-option-1"]').click();
      cy.addProductToSale('1', 2); // Vender 2 unidades
      cy.get('[data-testid="payment-method"]').select('cash');
      cy.get('[data-testid="finalize-sale"]').click();
      cy.get('[data-testid="confirm-payment"]').click();
      cy.get('[data-testid="complete-sale"]').click();
      
      // Verificar estoque atualizado
      cy.visit('/inventory');
      cy.get('[data-testid="product-row-1"]')
        .find('[data-testid="current-stock"]')
        .should('contain.text', '43'); // 45 - 2 = 43
    });

    it('deve alertar sobre produtos com estoque baixo', () => {
      // Produto com estoque baixo (3 unidades, mínimo 8)
      cy.get('[data-testid="new-sale-button"]').click();
      cy.get('[data-testid="client-select"]').click();
      cy.get('[data-testid="client-option-1"]').click();
      
      cy.addProductToSale('3', 1); // Pastilha de freio
      
      // Verificar alerta
      cy.get('[data-testid="low-stock-warning"]').should('be.visible');
      cy.get('[data-testid="low-stock-warning"]').should('contain.text', 'Estoque baixo');
    });
  });

  // Comandos customizados para vendas
  Cypress.Commands.add('addProductToSale', (productId: string, quantity: number) => {
    cy.get('[data-testid="add-product-button"]').click();
    cy.get('[data-testid="product-select"]').click();
    cy.get(`[data-testid="product-option-${productId}"]`).click();
    cy.get('[data-testid="quantity-input"]').clear().type(quantity.toString());
    cy.get('[data-testid="add-item-confirm"]').click();
  });

  Cypress.Commands.add('completeSale', () => {
    cy.get('[data-testid="new-sale-button"]').click();
    cy.get('[data-testid="client-select"]').click();
    cy.get('[data-testid="client-option-1"]').click();
    cy.addProductToSale('1', 1);
    cy.get('[data-testid="payment-method"]').select('cash');
    cy.get('[data-testid="finalize-sale"]').click();
    cy.get('[data-testid="confirm-payment"]').click();
    cy.get('[data-testid="complete-sale"]').click();
  });
});