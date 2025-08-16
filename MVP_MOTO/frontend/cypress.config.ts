// Configuração do Cypress para Testes E2E
// Sistema de Gestão de Oficina Mecânica de Motos

import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // URL base da aplicação
    baseUrl: 'http://localhost:3000',
    
    // Configurações de viewport
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Configurações de timeout
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    
    // Configurações de retry
    retries: {
      runMode: 2,
      openMode: 0,
    },
    
    // Configurações de vídeo e screenshots
    video: true,
    screenshotOnRunFailure: true,
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    
    // Configurações de fixtures e support
    fixturesFolder: 'cypress/fixtures',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    
    // Configurações do navegador
    chromeWebSecurity: false,
    
    // Configurações de ambiente
    env: {
      // URLs da API
      apiUrl: 'http://localhost:3001/api',
      
      // Credenciais de teste
      testUser: {
        email: 'admin@oficina.com',
        password: 'admin123',
      },
      
      // Configurações de banco de dados de teste
      dbHost: 'localhost',
      dbPort: 5432,
      dbName: 'oficina_test',
      dbUser: 'postgres',
      dbPassword: 'postgres',
    },
    
    setupNodeEvents(on, config) {
      // Plugin para tarefas customizadas
      on('task', {
        // Limpar banco de dados
        clearDatabase() {
          return new Promise((resolve) => {
            // Implementar limpeza do banco
            console.log('Clearing test database...');
            resolve(null);
          });
        },
        
        // Seed do banco de dados
        seedDatabase() {
          return new Promise((resolve) => {
            // Implementar seed do banco
            console.log('Seeding test database...');
            resolve(null);
          });
        },
        
        // Criar usuário de teste
        createTestUser(userData: any) {
          return new Promise((resolve) => {
            // Implementar criação de usuário
            console.log('Creating test user:', userData);
            resolve(userData);
          });
        },
        
        // Log personalizado
        log(message: string) {
          console.log(message);
          return null;
        },
      });
      
      // Plugin para cobertura de código
      require('@cypress/code-coverage/task')(on, config);
      
      return config;
    },
  },
  
  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',
  },
});