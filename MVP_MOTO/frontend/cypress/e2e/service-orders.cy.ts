// Testes E2E - Ordens de Serviço
// Sistema de Gestão de Oficina Mecânica de Motos

describe('Ordens de Serviço - Fluxo Completo', () => {
  beforeEach(() => {
    // Limpar e preparar banco de dados
    cy.clearDb();
    cy.seedDb();
    
    // Fazer login
    cy.login();
    
    // Navegar para ordens de serviço
    cy.visitServiceOrders();
  });

  describe('Listagem de Ordens de Serviço', () => {
    it('deve exibir a lista de ordens de serviço', () => {
      // Verificar se a página carregou
      cy.get('[data-testid="service-orders-page"]').should('be.visible');
      cy.get('[data-testid="page-title"]').should('contain.text', 'Ordens de Serviço');
      
      // Verificar se a tabela está visível
      cy.get('[data-testid="service-orders-table"]').should('be.visible');
      
      // Verificar se há ordens de serviço na lista
      cy.get('[data-testid^="service-order-row-"]').should('have.length.at.least', 1);
      
      // Verificar colunas da tabela
      cy.get('[data-testid="table-header"]').within(() => {
        cy.contains('Número').should('be.visible');
        cy.contains('Cliente').should('be.visible');
        cy.contains('Veículo').should('be.visible');
        cy.contains('Status').should('be.visible');
        cy.contains('Valor').should('be.visible');
        cy.contains('Data').should('be.visible');
      });
    });

    it('deve permitir buscar ordens de serviço', () => {
      // Buscar por número da OS
      cy.searchInTable('OS-2024-001');
      
      // Verificar se apenas a OS buscada aparece
      cy.get('[data-testid^="service-order-row-"]').should('have.length', 1);
      cy.get('[data-testid="service-order-row-0"]').should('contain.text', 'OS-2024-001');
      
      // Limpar busca
      cy.get('[data-testid="clear-search"]').click();
      cy.get('[data-testid^="service-order-row-"]').should('have.length.at.least', 2);
    });

    it('deve permitir filtrar por status', () => {
      // Filtrar por status "Em Andamento"
      cy.get('[data-testid="status-filter"]').click();
      cy.get('[data-testid="status-option-in_progress"]').click();
      
      // Verificar se apenas OSs em andamento aparecem
      cy.get('[data-testid^="service-order-row-"]').each(($row) => {
        cy.wrap($row).find('[data-testid="status-badge"]').should('contain.text', 'Em Andamento');
      });
    });

    it('deve permitir ordenar por data', () => {
      // Ordenar por data (mais recente primeiro)
      cy.sortTableBy('createdAt');
      
      // Verificar se a ordenação foi aplicada
      cy.get('[data-testid="service-order-row-0"]').should('contain.text', 'OS-2024-002');
    });
  });

  describe('Criação de Ordem de Serviço', () => {
    it('deve criar uma nova ordem de serviço com sucesso', () => {
      // Abrir modal de criação
      cy.get('[data-testid="create-service-order-button"]').click();
      cy.get('[data-testid="service-order-modal"]').should('be.visible');
      
      // Preencher formulário
      const orderData = {
        clientId: '1',
        vehicleId: '1',
        mechanicId: '1',
        description: 'Troca de óleo e revisão geral',
        priority: 'medium',
        estimatedCompletion: '2024-02-01',
      };
      
      cy.fillServiceOrderForm(orderData);
      
      // Adicionar itens
      cy.get('[data-testid="add-item-button"]').click();
      cy.get('[data-testid="product-select"]').click();
      cy.get('[data-testid="product-option-1"]').click();
      cy.get('[data-testid="quantity-input"]').clear().type('1');
      cy.get('[data-testid="confirm-item-button"]').click();
      
      // Salvar ordem de serviço
      cy.get('[data-testid="save-service-order"]').click();
      
      // Verificar sucesso
      cy.checkNotification('success', 'Ordem de serviço criada com sucesso');
      cy.get('[data-testid="service-order-modal"]').should('not.exist');
      
      // Verificar se a nova OS aparece na lista
      cy.get('[data-testid^="service-order-row-"]').should('contain.text', orderData.description);
    });

    it('deve validar campos obrigatórios', () => {
      // Abrir modal de criação
      cy.get('[data-testid="create-service-order-button"]').click();
      
      // Tentar salvar sem preencher campos obrigatórios
      cy.get('[data-testid="save-service-order"]').click();
      
      // Verificar mensagens de erro
      cy.get('[data-testid="client-error"]').should('contain.text', 'Cliente é obrigatório');
      cy.get('[data-testid="description-error"]').should('contain.text', 'Descrição é obrigatória');
    });

    it('deve calcular o valor total automaticamente', () => {
      // Abrir modal de criação
      cy.get('[data-testid="create-service-order-button"]').click();
      
      // Preencher dados básicos
      cy.fillServiceOrderForm({
        clientId: '1',
        description: 'Teste de cálculo',
      });
      
      // Adicionar mão de obra
      cy.get('[data-testid="labor-cost-input"]').clear().type('50.00');
      
      // Adicionar item
      cy.get('[data-testid="add-item-button"]').click();
      cy.get('[data-testid="product-select"]').click();
      cy.get('[data-testid="product-option-1"]').click(); // Óleo R$ 25,90
      cy.get('[data-testid="quantity-input"]').clear().type('2');
      cy.get('[data-testid="confirm-item-button"]').click();
      
      // Verificar cálculo do total
      cy.get('[data-testid="total-amount"]').should('contain.text', 'R$ 101,80'); // 50 + (25.90 * 2)
    });
  });

  describe('Edição de Ordem de Serviço', () => {
    it('deve editar uma ordem de serviço existente', () => {
      // Selecionar primeira OS da lista
      cy.get('[data-testid="service-order-row-0"]').click();
      cy.get('[data-testid="edit-service-order"]').click();
      
      // Verificar se o modal abriu com dados preenchidos
      cy.get('[data-testid="service-order-modal"]').should('be.visible');
      cy.get('[data-testid="service-description-input"]').should('not.be.empty');
      
      // Alterar descrição
      const newDescription = 'Descrição atualizada - Teste E2E';
      cy.get('[data-testid="service-description-input"]').clear().type(newDescription);
      
      // Salvar alterações
      cy.get('[data-testid="save-service-order"]').click();
      
      // Verificar sucesso
      cy.checkNotification('success', 'Ordem de serviço atualizada com sucesso');
      
      // Verificar se a alteração foi aplicada
      cy.get('[data-testid^="service-order-row-"]').should('contain.text', newDescription);
    });

    it('deve alterar o status da ordem de serviço', () => {
      // Selecionar OS em andamento
      cy.get('[data-testid="service-order-row-0"]').click();
      cy.get('[data-testid="change-status-button"]').click();
      
      // Alterar para "Concluída"
      cy.get('[data-testid="status-select"]').click();
      cy.get('[data-testid="status-option-completed"]').click();
      cy.get('[data-testid="confirm-status-change"]').click();
      
      // Verificar alteração
      cy.checkNotification('success', 'Status alterado com sucesso');
      cy.get('[data-testid="service-order-row-0"]')
        .find('[data-testid="status-badge"]')
        .should('contain.text', 'Concluída');
    });
  });

  describe('Visualização de Detalhes', () => {
    it('deve exibir detalhes completos da ordem de serviço', () => {
      // Clicar na primeira OS
      cy.get('[data-testid="service-order-row-0"]').click();
      
      // Verificar se o painel de detalhes abriu
      cy.get('[data-testid="service-order-details"]').should('be.visible');
      
      // Verificar informações do cliente
      cy.get('[data-testid="client-info"]').within(() => {
        cy.should('contain.text', 'João Silva');
        cy.should('contain.text', '(11) 99999-9999');
      });
      
      // Verificar informações do veículo
      cy.get('[data-testid="vehicle-info"]').within(() => {
        cy.should('contain.text', 'ABC-1234');
        cy.should('contain.text', 'Honda CG 160');
      });
      
      // Verificar itens da OS
      cy.get('[data-testid="service-items"]').should('be.visible');
      cy.get('[data-testid^="item-row-"]').should('have.length.at.least', 1);
      
      // Verificar valores
      cy.get('[data-testid="labor-cost"]').should('be.visible');
      cy.get('[data-testid="parts-cost"]').should('be.visible');
      cy.get('[data-testid="total-amount"]').should('be.visible');
    });

    it('deve permitir imprimir a ordem de serviço', () => {
      // Selecionar OS
      cy.get('[data-testid="service-order-row-0"]').click();
      
      // Clicar em imprimir
      cy.get('[data-testid="print-service-order"]').click();
      
      // Verificar se a janela de impressão abriu
      cy.window().its('print').should('be.called');
    });
  });

  describe('Exclusão de Ordem de Serviço', () => {
    it('deve excluir uma ordem de serviço', () => {
      // Contar OSs iniciais
      cy.get('[data-testid^="service-order-row-"]').then(($rows) => {
        const initialCount = $rows.length;
        
        // Selecionar primeira OS
        cy.get('[data-testid="service-order-row-0"]').click();
        cy.get('[data-testid="delete-service-order"]').click();
        
        // Confirmar exclusão
        cy.get('[data-testid="confirm-delete-modal"]').should('be.visible');
        cy.get('[data-testid="confirm-delete-button"]').click();
        
        // Verificar sucesso
        cy.checkNotification('success', 'Ordem de serviço excluída com sucesso');
        
        // Verificar se a OS foi removida da lista
        cy.get('[data-testid^="service-order-row-"]').should('have.length', initialCount - 1);
      });
    });

    it('deve cancelar a exclusão quando solicitado', () => {
      // Selecionar primeira OS
      cy.get('[data-testid="service-order-row-0"]').click();
      cy.get('[data-testid="delete-service-order"]').click();
      
      // Cancelar exclusão
      cy.get('[data-testid="confirm-delete-modal"]').should('be.visible');
      cy.get('[data-testid="cancel-delete-button"]').click();
      
      // Verificar se o modal foi fechado
      cy.get('[data-testid="confirm-delete-modal"]').should('not.exist');
      
      // Verificar se a OS ainda está na lista
      cy.get('[data-testid="service-order-row-0"]').should('exist');
    });
  });

  describe('Responsividade', () => {
    it('deve funcionar corretamente em dispositivos móveis', () => {
      // Alterar viewport para mobile
      cy.viewport(375, 667);
      
      // Verificar se a página se adapta
      cy.get('[data-testid="service-orders-page"]').should('be.visible');
      
      // Verificar se o menu mobile funciona
      cy.get('[data-testid="mobile-menu-button"]').click();
      cy.get('[data-testid="mobile-menu"]').should('be.visible');
      
      // Verificar se a tabela se adapta (pode virar cards)
      cy.get('[data-testid="service-orders-table"]').should('be.visible');
    });
  });

  describe('Acessibilidade', () => {
    it('deve atender aos padrões de acessibilidade', () => {
      // Verificar acessibilidade da página
      cy.checkAccessibility();
      
      // Verificar navegação por teclado
      cy.get('[data-testid="create-service-order-button"]').focus();
      cy.focused().should('have.attr', 'data-testid', 'create-service-order-button');
      
      // Verificar labels dos formulários
      cy.get('[data-testid="create-service-order-button"]').click();
      cy.get('[data-testid="client-select"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="service-description-input"]').should('have.attr', 'aria-label');
    });
  });

  describe('Performance', () => {
    it('deve carregar a página em tempo adequado', () => {
      // Medir tempo de carregamento
      const startTime = Date.now();
      
      cy.visitServiceOrders();
      cy.waitForPageLoad();
      
      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(3000); // Menos de 3 segundos
      });
    });

    it('deve lidar com grandes volumes de dados', () => {
      // Simular muitas OSs
      cy.intercept('GET', '/api/service-orders*', { 
        fixture: 'largeServiceOrdersList.json' 
      }).as('getLargeList');
      
      cy.visitServiceOrders();
      cy.wait('@getLargeList');
      
      // Verificar se a paginação funciona
      cy.get('[data-testid="pagination"]').should('be.visible');
      cy.get('[data-testid="next-page"]').click();
      cy.waitForPageLoad();
    });
  });
});