// Suporte para Testes de Componentes
// Sistema de Gestão de Oficina Mecânica de Motos

import './commands';
import { mount } from 'cypress/react18';

// Adicionar comando de mount
Cypress.Commands.add('mount', mount);

// Configurações globais para testes de componentes
beforeEach(() => {
  // Mock de APIs para testes de componentes
  cy.intercept('GET', '/api/**', { statusCode: 200, body: {} });
});

// Configurar providers necessários para componentes
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '../../src/store';

// Wrapper para componentes que precisam de providers
export const ComponentWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );
};

// Comando para montar componentes com providers
Cypress.Commands.add('mountWithProviders', (component: React.ReactElement) => {
  return cy.mount(
    <ComponentWrapper>
      {component}
    </ComponentWrapper>
  );
});

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
      mountWithProviders(component: React.ReactElement): Chainable<void>;
    }
  }
}