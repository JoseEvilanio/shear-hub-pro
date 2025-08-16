// Comandos Customizados do Cypress
// Sistema de Gestão de Oficina Mecânica de Motos

/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      // Autenticação
      login(email?: string, password?: string): Chainable<void>;
      logout(): Chainable<void>;
      
      // Navegação
      visitDashboard(): Chainable<void>;
      visitClients(): Chainable<void>;
      visitServiceOrders(): Chainable<void>;
      visitSales(): Chainable<void>;
      visitInventory(): Chainable<void>;
      visitFinancial(): Chainable<void>;
      visitReports(): Chainable<void>;
      
      // Formulários
      fillClientForm(clientData: any): Chainable<void>;
      fillServiceOrderForm(orderData: any): Chainable<void>;
      fillSaleForm(saleData: any): Chainable<void>;
      fillProductForm(productData: any): Chainable<void>;
      
      // Utilitários
      waitForPageLoad(): Chainable<void>;
      waitForApiCalls(): Chainable<void>;
      checkAccessibility(): Chainable<void>;
      takeScreenshot(name: string): Chainable<void>;
      
      // Banco de dados
      clearDb(): Chainable<void>;
      seedDb(): Chainable<void>;
      createTestUser(userData: any): Chainable<void>;
      
      // Elementos específicos
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
      getByRole(role: string, options?: any): Chainable<JQuery<HTMLElement>>;
      
      // Tabelas
      searchInTable(searchTerm: string): Chainable<void>;
      sortTableBy(column: string): Chainable<void>;
      selectTableRow(index: number): Chainable<void>;
      
      // Modais
      openModal(modalName: string): Chainable<void>;
      closeModal(): Chainable<void>;
      confirmModal(): Chainable<void>;
      cancelModal(): Chainable<void>;
      
      // Notificações
      checkNotification(type: 'success' | 'error' | 'warning' | 'info', message?: string): Chainable<void>;
      dismissNotification(): Chainable<void>;
    }
  }
}

// Comando de login
Cypress.Commands.add('login', (email?: string, password?: string) => {
  const testEmail = email || Cypress.env('testUser').email;
  const testPassword = password || Cypress.env('testUser').password;
  
  cy.visit('/login');
  cy.get('[data-testid="email-input"]').type(testEmail);
  cy.get('[data-testid="password-input"]').type(testPassword);
  cy.get('[data-testid="login-button"]').click();
  
  // Aguardar redirecionamento para dashboard
  cy.url().should('not.include', '/login');
  cy.waitForPageLoad();
});

// Comando de logout
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/login');
});

// Comandos de navegação
Cypress.Commands.add('visitDashboard', () => {
  cy.visit('/');
  cy.waitForPageLoad();
});

Cypress.Commands.add('visitClients', () => {
  cy.visit('/clients');
  cy.waitForPageLoad();
});

Cypress.Commands.add('visitServiceOrders', () => {
  cy.visit('/service-orders');
  cy.waitForPageLoad();
});

Cypress.Commands.add('visitSales', () => {
  cy.visit('/sales');
  cy.waitForPageLoad();
});

Cypress.Commands.add('visitInventory', () => {
  cy.visit('/inventory');
  cy.waitForPageLoad();
});

Cypress.Commands.add('visitFinancial', () => {
  cy.visit('/financial');
  cy.waitForPageLoad();
});

Cypress.Commands.add('visitReports', () => {
  cy.visit('/reports');
  cy.waitForPageLoad();
});

// Comando para preencher formulário de cliente
Cypress.Commands.add('fillClientForm', (clientData) => {
  if (clientData.name) {
    cy.get('[data-testid="client-name-input"]').clear().type(clientData.name);
  }
  if (clientData.email) {
    cy.get('[data-testid="client-email-input"]').clear().type(clientData.email);
  }
  if (clientData.phone) {
    cy.get('[data-testid="client-phone-input"]').clear().type(clientData.phone);
  }
  if (clientData.address) {
    cy.get('[data-testid="client-address-input"]').clear().type(clientData.address);
  }
  if (clientData.city) {
    cy.get('[data-testid="client-city-input"]').clear().type(clientData.city);
  }
});

// Comando para preencher formulário de ordem de serviço
Cypress.Commands.add('fillServiceOrderForm', (orderData) => {
  if (orderData.clientId) {
    cy.get('[data-testid="client-select"]').click();
    cy.get(`[data-testid="client-option-${orderData.clientId}"]`).click();
  }
  if (orderData.vehicleId) {
    cy.get('[data-testid="vehicle-select"]').click();
    cy.get(`[data-testid="vehicle-option-${orderData.vehicleId}"]`).click();
  }
  if (orderData.mechanicId) {
    cy.get('[data-testid="mechanic-select"]').click();
    cy.get(`[data-testid="mechanic-option-${orderData.mechanicId}"]`).click();
  }
  if (orderData.description) {
    cy.get('[data-testid="service-description-input"]').clear().type(orderData.description);
  }
});

// Comando para aguardar carregamento da página
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('[data-testid="loading-spinner"]', { timeout: 1000 }).should('not.exist');
  cy.get('body').should('be.visible');
});

// Comando para aguardar chamadas de API
Cypress.Commands.add('waitForApiCalls', () => {
  cy.wait(['@getUser', '@getClients', '@getProducts'], { timeout: 10000 });
});

// Comando para verificar acessibilidade
Cypress.Commands.add('checkAccessibility', () => {
  cy.injectAxe();
  cy.checkA11y(null, null, (violations) => {
    violations.forEach((violation) => {
      cy.log(`Accessibility violation: ${violation.description}`);
    });
  });
});

// Comando para capturar screenshot
Cypress.Commands.add('takeScreenshot', (name: string) => {
  cy.screenshot(name, { capture: 'fullPage' });
});

// Comandos de banco de dados
Cypress.Commands.add('clearDb', () => {
  cy.task('clearDatabase');
});

Cypress.Commands.add('seedDb', () => {
  cy.task('seedDatabase');
});

Cypress.Commands.add('createTestUser', (userData) => {
  cy.task('createTestUser', userData);
});

// Comando para buscar por test-id
Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});

// Comando para buscar por role
Cypress.Commands.add('getByRole', (role: string, options?: any) => {
  return cy.get(`[role="${role}"]`, options);
});

// Comandos para tabelas
Cypress.Commands.add('searchInTable', (searchTerm: string) => {
  cy.get('[data-testid="table-search-input"]').clear().type(searchTerm);
  cy.get('[data-testid="search-button"]').click();
  cy.waitForPageLoad();
});

Cypress.Commands.add('sortTableBy', (column: string) => {
  cy.get(`[data-testid="sort-${column}"]`).click();
  cy.waitForPageLoad();
});

Cypress.Commands.add('selectTableRow', (index: number) => {
  cy.get(`[data-testid="table-row-${index}"]`).click();
});

// Comandos para modais
Cypress.Commands.add('openModal', (modalName: string) => {
  cy.get(`[data-testid="open-${modalName}-modal"]`).click();
  cy.get(`[data-testid="${modalName}-modal"]`).should('be.visible');
});

Cypress.Commands.add('closeModal', () => {
  cy.get('[data-testid="close-modal"]').click();
  cy.get('[data-testid*="modal"]').should('not.exist');
});

Cypress.Commands.add('confirmModal', () => {
  cy.get('[data-testid="confirm-button"]').click();
});

Cypress.Commands.add('cancelModal', () => {
  cy.get('[data-testid="cancel-button"]').click();
});

// Comandos para notificações
Cypress.Commands.add('checkNotification', (type: 'success' | 'error' | 'warning' | 'info', message?: string) => {
  cy.get(`[data-testid="notification-${type}"]`).should('be.visible');
  if (message) {
    cy.get(`[data-testid="notification-${type}"]`).should('contain.text', message);
  }
});

Cypress.Commands.add('dismissNotification', () => {
  cy.get('[data-testid="dismiss-notification"]').click();
  cy.get('[data-testid*="notification"]').should('not.exist');
});

export {};