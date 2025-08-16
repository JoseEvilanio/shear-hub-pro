// Testes E2E - Gestão de Estoque
// Sistema de Gestão de Oficina Mecânica de Motos

describe('Gestão de Estoque - Fluxo Completo', () => {
  beforeEach(() => {
    cy.clearDb();
    cy.seedDb();
    cy.login();
    cy.visitInventory();
  });

  describe('Visualização do Estoque', () => {
    it('deve exibir a lista de produtos em estoque', () => {
      cy.get('[data-testid="inventory-page"]').should('be.visible');
      cy.get('[data-testid="page-title"]').should('contain.text', 'Controle de Estoque');
      
      // Verificar tabela de produtos
      cy.get('[data-testid="inventory-table"]').should('be.visible');
      cy.get('[data-testid^="product-row-"]').should('have.length.at.least', 1);
      
      // Verificar colunas
      cy.get('[data-testid="table-header"]').within(() => {
        cy.contains('Produto').should('be.visible');
        cy.contains('Código').should('be.visible');
        cy.contains('Categoria').should('be.visible');
        cy.contains('Estoque Atual').should('be.visible');
        cy.contains('Estoque Mínimo').should('be.visible');
        cy.contains('Status').should('be.visible');
      });
    });

    it('deve destacar produtos com estoque baixo', () => {
      // Produto com estoque baixo (Pastilha: 3 unidades, mínimo 8)
      cy.get('[data-testid="product-row-3"]').should('have.class', 'low-stock');
      cy.get('[data-testid="product-row-3"]')
        .find('[data-testid="stock-status"]')
        .should('contain.text', 'Estoque Baixo');
    });

    it('deve permitir buscar produtos', () => {
      // Buscar por nome
      cy.searchInTable('Óleo');
      cy.get('[data-testid^="product-row-"]').should('have.length', 1);
      cy.get('[data-testid="product-row-0"]').should('contain.text', 'Óleo Motor 20W50');
      
      // Buscar por código
      cy.searchInTable('FIL001');
      cy.get('[data-testid="product-row-0"]').should('contain.text', 'Filtro de Ar Honda CG');
    });

    it('deve permitir filtrar por categoria', () => {
      cy.get('[data-testid="category-filter"]').click();
      cy.get('[data-testid="category-option-Lubrificantes"]').click();
      
      cy.get('[data-testid^="product-row-"]').each(($row) => {
        cy.wrap($row).find('[data-testid="product-category"]').should('contain.text', 'Lubrificantes');
      });
    });

    it('deve permitir filtrar por status de estoque', () => {
      cy.get('[data-testid="stock-status-filter"]').click();
      cy.get('[data-testid="status-option-low"]').click();
      
      cy.get('[data-testid^="product-row-"]').each(($row) => {
        cy.wrap($row).should('have.class', 'low-stock');
      });
    });
  });

  describe('Entrada de Produtos', () => {
    it('deve registrar entrada de produtos no estoque', () => {
      // Selecionar produto
      cy.get('[data-testid="product-row-0"]').click();
      cy.get('[data-testid="stock-in-button"]').click();
      
      // Preencher formulário de entrada
      cy.get('[data-testid="stock-movement-modal"]').should('be.visible');
      cy.get('[data-testid="quantity-input"]').type('20');
      cy.get('[data-testid="unit-cost-input"]').type('18.50');
      cy.get('[data-testid="supplier-select"]').select('Distribuidora ABC');
      cy.get('[data-testid="invoice-number"]').type('NF-12345');
      cy.get('[data-testid="notes"]').type('Reposição de estoque mensal');
      
      // Confirmar entrada
      cy.get('[data-testid="confirm-movement"]').click();
      
      // Verificar sucesso
      cy.checkNotification('success', 'Entrada registrada com sucesso');
      
      // Verificar atualização do estoque
      cy.get('[data-testid="product-row-0"]')
        .find('[data-testid="current-stock"]')
        .should('contain.text', '65'); // 45 + 20
    });

    it('deve validar campos obrigatórios na entrada', () => {
      cy.get('[data-testid="product-row-0"]').click();
      cy.get('[data-testid="stock-in-button"]').click();
      
      // Tentar confirmar sem preencher campos
      cy.get('[data-testid="confirm-movement"]').click();
      
      // Verificar mensagens de erro
      cy.get('[data-testid="quantity-error"]').should('contain.text', 'Quantidade é obrigatória');
      cy.get('[data-testid="unit-cost-error"]').should('contain.text', 'Custo unitário é obrigatório');
    });

    it('deve calcular valor total automaticamente', () => {
      cy.get('[data-testid="product-row-0"]').click();
      cy.get('[data-testid="stock-in-button"]').click();
      
      // Preencher quantidade e custo
      cy.get('[data-testid="quantity-input"]').type('10');
      cy.get('[data-testid="unit-cost-input"]').type('20.00');
      
      // Verificar cálculo do total
      cy.get('[data-testid="total-cost"]').should('contain.text', 'R$ 200,00');
    });
  });

  describe('Saída de Produtos', () => {
    it('deve registrar saída manual de produtos', () => {
      // Verificar estoque inicial
      cy.get('[data-testid="product-row-0"]')
        .find('[data-testid="current-stock"]')
        .should('contain.text', '45');
      
      // Registrar saída
      cy.get('[data-testid="product-row-0"]').click();
      cy.get('[data-testid="stock-out-button"]').click();
      
      cy.get('[data-testid="quantity-input"]').type('5');
      cy.get('[data-testid="reason-select"]').select('adjustment');
      cy.get('[data-testid="notes"]').type('Ajuste de inventário');
      
      cy.get('[data-testid="confirm-movement"]').click();
      
      // Verificar atualização
      cy.checkNotification('success', 'Saída registrada com sucesso');
      cy.get('[data-testid="product-row-0"]')
        .find('[data-testid="current-stock"]')
        .should('contain.text', '40'); // 45 - 5
    });

    it('deve impedir saída maior que o estoque disponível', () => {
      cy.get('[data-testid="product-row-0"]').click();
      cy.get('[data-testid="stock-out-button"]').click();
      
      // Tentar saída maior que estoque
      cy.get('[data-testid="quantity-input"]').type('100');
      cy.get('[data-testid="confirm-movement"]').click();
      
      // Verificar erro
      cy.checkNotification('error', 'Quantidade maior que o estoque disponível');
    });
  });

  describe('Histórico de Movimentações', () => {
    it('deve exibir histórico de movimentações do produto', () => {
      cy.get('[data-testid="product-row-0"]').click();
      cy.get('[data-testid="view-history-button"]').click();
      
      // Verificar modal de histórico
      cy.get('[data-testid="movement-history-modal"]').should('be.visible');
      cy.get('[data-testid="history-table"]').should('be.visible');
      
      // Verificar colunas do histórico
      cy.get('[data-testid="history-header"]').within(() => {
        cy.contains('Data').should('be.visible');
        cy.contains('Tipo').should('be.visible');
        cy.contains('Quantidade').should('be.visible');
        cy.contains('Motivo').should('be.visible');
        cy.contains('Usuário').should('be.visible');
      });
      
      // Verificar se há movimentações
      cy.get('[data-testid^="movement-row-"]').should('have.length.at.least', 1);
    });

    it('deve permitir filtrar histórico por período', () => {
      cy.get('[data-testid="product-row-0"]').click();
      cy.get('[data-testid="view-history-button"]').click();
      
      // Filtrar por período
      cy.get('[data-testid="history-date-from"]').type('2024-01-01');
      cy.get('[data-testid="history-date-to"]').type('2024-01-31');
      cy.get('[data-testid="apply-history-filter"]').click();
      
      cy.get('[data-testid^="movement-row-"]').should('have.length.at.least', 1);
    });

    it('deve permitir exportar histórico', () => {
      cy.get('[data-testid="product-row-0"]').click();
      cy.get('[data-testid="view-history-button"]').click();
      
      cy.get('[data-testid="export-history"]').click();
      
      // Verificar download
      cy.readFile('cypress/downloads/historico-movimentacoes-*.xlsx').should('exist');
    });
  });

  describe('Inventário e Ajustes', () => {
    it('deve permitir fazer inventário completo', () => {
      cy.get('[data-testid="inventory-button"]').click();
      cy.get('[data-testid="inventory-modal"]').should('be.visible');
      
      // Confirmar início do inventário
      cy.get('[data-testid="start-inventory"]').click();
      
      // Verificar que produtos estão listados para contagem
      cy.get('[data-testid="inventory-list"]').should('be.visible');
      cy.get('[data-testid^="inventory-item-"]').should('have.length.at.least', 3);
      
      // Fazer contagem de alguns produtos
      cy.get('[data-testid="inventory-item-1"]')
        .find('[data-testid="counted-quantity"]')
        .type('44'); // Diferente do estoque atual (45)
      
      cy.get('[data-testid="inventory-item-2"]')
        .find('[data-testid="counted-quantity"]')
        .type('12'); // Igual ao estoque atual
      
      // Finalizar inventário
      cy.get('[data-testid="finish-inventory"]').click();
      
      // Verificar resumo de diferenças
      cy.get('[data-testid="inventory-summary"]').should('be.visible');
      cy.get('[data-testid="differences-found"]').should('contain.text', '1 diferença encontrada');
      
      // Confirmar ajustes
      cy.get('[data-testid="apply-adjustments"]').click();
      
      cy.checkNotification('success', 'Inventário finalizado com sucesso');
      
      // Verificar ajuste aplicado
      cy.get('[data-testid="product-row-0"]')
        .find('[data-testid="current-stock"]')
        .should('contain.text', '44');
    });

    it('deve permitir ajuste individual de produto', () => {
      cy.get('[data-testid="product-row-0"]').click();
      cy.get('[data-testid="adjust-stock-button"]').click();
      
      cy.get('[data-testid="adjustment-modal"]').should('be.visible');
      cy.get('[data-testid="current-stock-display"]').should('contain.text', '45');
      
      // Definir novo estoque
      cy.get('[data-testid="new-stock-input"]').type('50');
      cy.get('[data-testid="adjustment-reason"]').type('Correção após inventário físico');
      
      cy.get('[data-testid="confirm-adjustment"]').click();
      
      cy.checkNotification('success', 'Estoque ajustado com sucesso');
      
      // Verificar ajuste
      cy.get('[data-testid="product-row-0"]')
        .find('[data-testid="current-stock"]')
        .should('contain.text', '50');
    });
  });

  describe('Alertas de Estoque', () => {
    it('deve exibir dashboard de alertas', () => {
      cy.get('[data-testid="stock-alerts"]').should('be.visible');
      
      // Verificar alertas de estoque baixo
      cy.get('[data-testid="low-stock-alert"]').should('be.visible');
      cy.get('[data-testid="low-stock-count"]').should('contain.text', '1'); // Pastilha de freio
      
      // Verificar produtos em falta
      cy.get('[data-testid="out-of-stock-alert"]').should('be.visible');
      cy.get('[data-testid="out-of-stock-count"]').should('contain.text', '0');
    });

    it('deve permitir configurar alertas por produto', () => {
      cy.get('[data-testid="product-row-0"]').click();
      cy.get('[data-testid="configure-alerts"]').click();
      
      cy.get('[data-testid="alert-config-modal"]').should('be.visible');
      
      // Alterar estoque mínimo
      cy.get('[data-testid="min-stock-input"]').clear().type('15');
      
      // Configurar alerta por email
      cy.get('[data-testid="email-alert-checkbox"]').check();
      cy.get('[data-testid="alert-email"]').type('admin@oficina.com');
      
      cy.get('[data-testid="save-alert-config"]').click();
      
      cy.checkNotification('success', 'Configuração de alertas salva');
    });

    it('deve enviar notificação quando estoque atingir o mínimo', () => {
      // Simular venda que deixa produto com estoque baixo
      cy.visit('/sales');
      cy.get('[data-testid="new-sale-button"]').click();
      cy.get('[data-testid="client-select"]').click();
      cy.get('[data-testid="client-option-1"]').click();
      
      // Vender quantidade que deixa abaixo do mínimo
      cy.addProductToSale('1', 40); // Deixará com 5 (mínimo é 10)
      
      cy.get('[data-testid="payment-method"]').select('cash');
      cy.get('[data-testid="finalize-sale"]').click();
      cy.get('[data-testid="confirm-payment"]').click();
      cy.get('[data-testid="complete-sale"]').click();
      
      // Verificar notificação de estoque baixo
      cy.checkNotification('warning', 'Produto com estoque baixo');
      
      // Voltar ao estoque e verificar alerta
      cy.visitInventory();
      cy.get('[data-testid="product-row-0"]').should('have.class', 'low-stock');
    });
  });

  describe('Relatórios de Estoque', () => {
    it('deve gerar relatório de estoque atual', () => {
      cy.get('[data-testid="reports-button"]').click();
      cy.get('[data-testid="current-stock-report"]').click();
      
      // Configurar relatório
      cy.get('[data-testid="report-modal"]').should('be.visible');
      cy.get('[data-testid="include-photos"]').check();
      cy.get('[data-testid="group-by-category"]').check();
      
      cy.get('[data-testid="generate-report"]').click();
      
      // Verificar geração
      cy.checkNotification('success', 'Relatório gerado com sucesso');
      cy.readFile('cypress/downloads/relatorio-estoque-*.pdf').should('exist');
    });

    it('deve gerar relatório de movimentações', () => {
      cy.get('[data-testid="reports-button"]').click();
      cy.get('[data-testid="movements-report"]').click();
      
      // Configurar período
      cy.get('[data-testid="report-date-from"]').type('2024-01-01');
      cy.get('[data-testid="report-date-to"]').type('2024-01-31');
      
      // Filtrar por tipo
      cy.get('[data-testid="movement-type-filter"]').select('all');
      
      cy.get('[data-testid="generate-report"]').click();
      
      cy.checkNotification('success', 'Relatório de movimentações gerado');
    });

    it('deve gerar relatório de produtos em falta', () => {
      cy.get('[data-testid="reports-button"]').click();
      cy.get('[data-testid="shortage-report"]').click();
      
      cy.get('[data-testid="generate-report"]').click();
      
      // Verificar que relatório foi gerado mesmo sem produtos em falta
      cy.checkNotification('success', 'Relatório gerado com sucesso');
    });
  });

  describe('Integração com Fornecedores', () => {
    it('deve sugerir reposição baseada no estoque mínimo', () => {
      cy.get('[data-testid="replenishment-button"]').click();
      cy.get('[data-testid="replenishment-modal"]').should('be.visible');
      
      // Verificar sugestões
      cy.get('[data-testid="replenishment-suggestions"]').should('be.visible');
      cy.get('[data-testid^="suggestion-"]').should('have.length.at.least', 1);
      
      // Verificar produto com estoque baixo na lista
      cy.get('[data-testid="suggestion-3"]').should('contain.text', 'Pastilha de Freio');
      
      // Selecionar produtos para pedido
      cy.get('[data-testid="suggestion-3"]')
        .find('[data-testid="select-for-order"]')
        .check();
      
      // Gerar pedido de compra
      cy.get('[data-testid="generate-purchase-order"]').click();
      
      cy.checkNotification('success', 'Pedido de compra gerado');
    });

    it('deve permitir importar produtos do fornecedor', () => {
      cy.get('[data-testid="import-products-button"]').click();
      cy.get('[data-testid="import-modal"]').should('be.visible');
      
      // Selecionar fornecedor
      cy.get('[data-testid="supplier-select"]').select('Distribuidora ABC');
      
      // Upload de arquivo
      cy.get('[data-testid="file-upload"]').selectFile('cypress/fixtures/produtos-fornecedor.xlsx');
      
      // Visualizar prévia
      cy.get('[data-testid="preview-import"]').click();
      cy.get('[data-testid="import-preview"]').should('be.visible');
      
      // Confirmar importação
      cy.get('[data-testid="confirm-import"]').click();
      
      cy.checkNotification('success', 'Produtos importados com sucesso');
    });
  });

  describe('Performance e Usabilidade', () => {
    it('deve carregar rapidamente com muitos produtos', () => {
      // Simular lista grande de produtos
      cy.intercept('GET', '/api/inventory*', { 
        fixture: 'largeInventoryList.json' 
      }).as('getLargeInventory');
      
      cy.visitInventory();
      cy.wait('@getLargeInventory');
      
      // Verificar paginação
      cy.get('[data-testid="pagination"]').should('be.visible');
      cy.get('[data-testid="items-per-page"]').select('50');
      
      cy.waitForPageLoad();
    });

    it('deve funcionar offline para consultas', () => {
      // Simular offline
      cy.window().then((win) => {
        cy.stub(win.navigator, 'onLine').value(false);
      });
      
      // Verificar que dados em cache ainda funcionam
      cy.get('[data-testid="inventory-table"]').should('be.visible');
      cy.get('[data-testid="offline-indicator"]').should('be.visible');
    });
  });

  describe('Acessibilidade', () => {
    it('deve ser acessível via teclado', () => {
      // Navegar por teclado
      cy.get('[data-testid="product-row-0"]').focus();
      cy.focused().type('{enter}');
      
      // Verificar que ações estão acessíveis
      cy.get('[data-testid="stock-in-button"]').should('be.visible');
      cy.get('[data-testid="stock-in-button"]').focus();
      cy.focused().should('have.attr', 'data-testid', 'stock-in-button');
    });

    it('deve ter labels apropriados', () => {
      cy.get('[data-testid="product-row-0"]').click();
      cy.get('[data-testid="stock-in-button"]').click();
      
      // Verificar labels dos campos
      cy.get('[data-testid="quantity-input"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="unit-cost-input"]').should('have.attr', 'aria-label');
    });

    it('deve atender padrões de acessibilidade', () => {
      cy.checkAccessibility();
    });
  });
});