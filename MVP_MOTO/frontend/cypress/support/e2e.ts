// Suporte para Testes E2E
// Sistema de Gestão de Oficina Mecânica de Motos

import './commands';
import '@cypress/code-coverage/support';

// Configurações globais
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignorar erros específicos que não afetam os testes
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  
  if (err.message.includes('Non-Error promise rejection captured')) {
    return false;
  }
  
  // Permitir que outros erros falhem os testes
  return true;
});

// Configurar interceptadores globais
beforeEach(() => {
  // Interceptar chamadas de API
  cy.intercept('GET', '/api/auth/me', { fixture: 'user.json' }).as('getUser');
  cy.intercept('GET', '/api/clients*', { fixture: 'clients.json' }).as('getClients');
  cy.intercept('GET', '/api/products*', { fixture: 'products.json' }).as('getProducts');
  cy.intercept('GET', '/api/service-orders*', { fixture: 'serviceOrders.json' }).as('getServiceOrders');
  cy.intercept('GET', '/api/sales*', { fixture: 'sales.json' }).as('getSales');
  cy.intercept('GET', '/api/inventory*', { fixture: 'inventory.json' }).as('getInventory');
  
  // Limpar localStorage e sessionStorage
  cy.clearLocalStorage();
  cy.clearCookies();
  
  // Configurar viewport padrão
  cy.viewport(1280, 720);
});

// Comandos para limpeza após cada teste
afterEach(() => {
  // Capturar screenshot em caso de falha
  cy.screenshot({ capture: 'runner', onlyOnFailure: true });
});

// Configurações de acessibilidade
import 'cypress-axe';

// Configurações de tempo
Cypress.config('defaultCommandTimeout', 10000);
Cypress.config('requestTimeout', 10000);
Cypress.config('responseTimeout', 10000);