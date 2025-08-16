#!/usr/bin/env node
/**
 * Script de Validação de Requisitos Funcionais
 * Sistema de Gestão de Oficina Mecânica de Motos
 */

const fs = require('fs');
const path = require('path');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const success = (message) => log(`✅ ${message}`, 'green');
const error = (message) => log(`❌ ${message}`, 'red');
const warning = (message) => log(`⚠️  ${message}`, 'yellow');
const info = (message) => log(`ℹ️  ${message}`, 'blue');

// Definição dos requisitos funcionais
const requirements = {
  '1.1': {
    description: 'Sistema deve permitir cadastro completo de clientes',
    files: [
      'frontend/src/components/Clients/ClientForm.tsx',
      'frontend/src/pages/Clients/ClientsPage.tsx',
      'frontend/src/services/clientService.ts'
    ],
    endpoints: ['/api/clients'],
    components: ['ClientForm', 'ClientList']
  },
  '1.2': {
    description: 'Sistema deve validar dados obrigatórios do cliente',
    files: [
      'frontend/src/components/Clients/ClientForm.tsx',
      'frontend/src/services/clientService.ts'
    ],
    validations: ['name', 'email', 'phone']
  },
  '1.3': {
    description: 'Sistema deve permitir busca de clientes por nome, telefone ou email',
    files: [
      'frontend/src/pages/Clients/ClientsPage.tsx',
      'frontend/src/services/clientService.ts'
    ],
    features: ['search', 'filter']
  },
  '1.4': {
    description: 'Sistema deve exibir histórico completo do cliente',
    files: [
      'frontend/src/components/Clients/ClientDetails.tsx',
      'frontend/src/services/clientService.ts'
    ],
    features: ['history', 'timeline']
  },
  '2.1': {
    description: 'Sistema deve permitir cadastro de fornecedores',
    files: [
      'suppliers-api-server.js',
      'frontend/src/services/api.ts'
    ]
  },
  '3.1': {
    description: 'Sistema deve permitir cadastro de mecânicos',
    files: [
      'mechanics-api-server.js',
      'frontend/src/services/api.ts'
    ]
  },
  '4.1': {
    description: 'Sistema deve permitir cadastro de veículos',
    files: [
      'vehicles-api-server.js',
      'frontend/src/services/api.ts'
    ]
  },
  '5.1': {
    description: 'Sistema deve permitir cadastro de produtos e serviços',
    files: [
      'products-api-server.js',
      'frontend/src/services/api.ts'
    ]
  },
  '6.1': {
    description: 'Sistema deve permitir criação de ordens de serviço',
    files: [
      'service-orders-api-server.js',
      'frontend/src/components/ServiceOrders/ServiceOrderForm.tsx',
      'frontend/src/services/serviceOrderService.ts'
    ]
  },
  '6.2': {
    description: 'OS deve ter 9 linhas de descrição de serviços',
    files: [
      'frontend/src/components/ServiceOrders/ServiceOrderForm.tsx',
      'service-orders-api-server.js'
    ],
    features: ['9-lines-description']
  },
  '7.1': {
    description: 'Sistema deve permitir vendas com alternância pedido/orçamento',
    files: [
      'sales-api-server.js',
      'frontend/src/components/Sales/SalesForm.tsx',
      'frontend/src/services/salesService.ts'
    ]
  },
  '8.1': {
    description: 'Sistema deve controlar estoque automaticamente',
    files: [
      'inventory-api-server.js',
      'frontend/src/components/Inventory/InventoryList.tsx',
      'frontend/src/services/inventoryService.ts'
    ]
  },
  '9.1': {
    description: 'Sistema deve gerenciar contas a pagar e receber',
    files: [
      'financial-api-server.js',
      'frontend/src/components/Financial/FinancialDashboard.tsx',
      'frontend/src/services/financialService.ts'
    ]
  },
  '10.1': {
    description: 'Sistema deve gerar relatórios de aniversariantes',
    files: [
      'reports/controllers/ReportsController.js',
      'frontend/src/components/Reports/BirthdayReport.tsx'
    ]
  },
  '11.1': {
    description: 'Sistema deve permitir personalização de logotipo',
    files: [
      'frontend/src/components/Settings/CompanySettings.tsx',
      'frontend/src/services/settingsService.ts'
    ]
  },
  '12.1': {
    description: 'Sistema deve ter autenticação por usuário e senha',
    files: [
      'backend/src/middleware/authMiddleware.ts',
      'backend/src/controllers/AuthController.ts',
      'frontend/src/pages/Auth/LoginPage.tsx'
    ]
  },
  '13.1': {
    description: 'Sistema deve imprimir OS em impressora matricial 80 colunas',
    files: [
      'backend/src/services/printService.ts',
      'printing/services/PrintingService.js'
    ]
  }
};

// Função para verificar se arquivo existe
const fileExists = (filePath) => {
  const fullPath = path.join(process.cwd(), filePath);
  return fs.existsSync(fullPath);
};

// Função para verificar conteúdo do arquivo
const checkFileContent = (filePath, patterns) => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) return false;
    
    const content = fs.readFileSync(fullPath, 'utf8');
    return patterns.every(pattern => {
      const regex = new RegExp(pattern, 'i');
      return regex.test(content);
    });
  } catch (error) {
    return false;
  }
};

// Função para validar um requisito
const validateRequirement = (reqId, requirement) => {
  const results = {
    id: reqId,
    description: requirement.description,
    passed: true,
    issues: []
  };

  // Verificar arquivos obrigatórios
  if (requirement.files) {
    requirement.files.forEach(file => {
      if (!fileExists(file)) {
        results.passed = false;
        results.issues.push(`Arquivo não encontrado: ${file}`);
      }
    });
  }

  // Verificar validações específicas
  if (requirement.validations) {
    requirement.files?.forEach(file => {
      if (fileExists(file)) {
        const missingValidations = requirement.validations.filter(validation => {
          return !checkFileContent(file, [validation, 'required', 'validate']);
        });
        
        if (missingValidations.length > 0) {
          results.issues.push(`Validações faltando em ${file}: ${missingValidations.join(', ')}`);
        }
      }
    });
  }

  // Verificar features específicas
  if (requirement.features) {
    requirement.files?.forEach(file => {
      if (fileExists(file)) {
        const missingFeatures = requirement.features.filter(feature => {
          const patterns = {
            'search': ['search', 'filter', 'query'],
            'filter': ['filter', 'where', 'search'],
            'history': ['history', 'timeline', 'log'],
            '9-lines-description': ['description.*line', 'line.*description', 'textarea.*rows.*9']
          };
          
          const featurePatterns = patterns[feature] || [feature];
          return !checkFileContent(file, featurePatterns);
        });
        
        if (missingFeatures.length > 0) {
          results.issues.push(`Features faltando em ${file}: ${missingFeatures.join(', ')}`);
        }
      }
    });
  }

  return results;
};

// Função para verificar estrutura do projeto
const checkProjectStructure = () => {
  info('Verificando estrutura do projeto...');
  
  const requiredDirs = [
    'backend/src/models',
    'backend/src/controllers',
    'backend/src/services',
    'backend/src/middleware',
    'frontend/src/pages',
    'frontend/src/components',
    'frontend/src/services',
    'frontend/src/hooks'
  ];

  const missingDirs = requiredDirs.filter(dir => !fs.existsSync(path.join(process.cwd(), dir)));
  
  if (missingDirs.length > 0) {
    error(`Diretórios faltando: ${missingDirs.join(', ')}`);
    return false;
  }
  
  success('Estrutura do projeto OK');
  return true;
};

// Função para verificar dependências
const checkDependencies = () => {
  info('Verificando dependências...');
  
  const backendPackage = path.join(process.cwd(), 'backend/package.json');
  const frontendPackage = path.join(process.cwd(), 'frontend/package.json');
  
  if (!fs.existsSync(backendPackage) || !fs.existsSync(frontendPackage)) {
    error('Arquivos package.json não encontrados');
    return false;
  }
  
  try {
    const backendDeps = JSON.parse(fs.readFileSync(backendPackage, 'utf8'));
    const frontendDeps = JSON.parse(fs.readFileSync(frontendPackage, 'utf8'));
    
    // Verificar dependências críticas do backend
    const requiredBackendDeps = [
      'express', 'pg', 'bcryptjs', 'jsonwebtoken', 'joi', 'cors'
    ];
    
    const missingBackendDeps = requiredBackendDeps.filter(dep => 
      !backendDeps.dependencies?.[dep] && !backendDeps.devDependencies?.[dep]
    );
    
    // Verificar dependências críticas do frontend
    const requiredFrontendDeps = [
      'react', 'react-dom', 'react-router-dom', '@reduxjs/toolkit', 'axios'
    ];
    
    const missingFrontendDeps = requiredFrontendDeps.filter(dep => 
      !frontendDeps.dependencies?.[dep] && !frontendDeps.devDependencies?.[dep]
    );
    
    if (missingBackendDeps.length > 0) {
      error(`Dependências backend faltando: ${missingBackendDeps.join(', ')}`);
    }
    
    if (missingFrontendDeps.length > 0) {
      error(`Dependências frontend faltando: ${missingFrontendDeps.join(', ')}`);
    }
    
    if (missingBackendDeps.length === 0 && missingFrontendDeps.length === 0) {
      success('Dependências OK');
      return true;
    }
    
  } catch (error) {
    error('Erro ao verificar dependências: ' + error.message);
  }
  
  return false;
};

// Função para gerar relatório
const generateReport = (results) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(process.cwd(), `validation-report-${timestamp}.json`);
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
      passRate: Math.round((results.filter(r => r.passed).length / results.length) * 100)
    },
    results: results
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  info(`Relatório salvo em: ${reportPath}`);
  
  return report;
};

// Função principal
const main = () => {
  log('\n=== VALIDAÇÃO DE REQUISITOS FUNCIONAIS ===\n', 'cyan');
  
  // Verificar estrutura do projeto
  if (!checkProjectStructure()) {
    process.exit(1);
  }
  
  // Verificar dependências
  if (!checkDependencies()) {
    warning('Algumas dependências estão faltando, mas continuando...');
  }
  
  // Validar cada requisito
  info('\nValidando requisitos funcionais...\n');
  
  const results = [];
  let passedCount = 0;
  let failedCount = 0;
  
  Object.entries(requirements).forEach(([reqId, requirement]) => {
    const result = validateRequirement(reqId, requirement);
    results.push(result);
    
    if (result.passed) {
      success(`${reqId}: ${result.description}`);
      passedCount++;
    } else {
      error(`${reqId}: ${result.description}`);
      result.issues.forEach(issue => {
        log(`  - ${issue}`, 'red');
      });
      failedCount++;
    }
  });
  
  // Gerar relatório
  const report = generateReport(results);
  
  // Resumo final
  log('\n=== RESUMO DA VALIDAÇÃO ===\n', 'cyan');
  log(`Total de requisitos: ${report.summary.total}`, 'blue');
  log(`Requisitos atendidos: ${report.summary.passed}`, 'green');
  log(`Requisitos com problemas: ${report.summary.failed}`, 'red');
  log(`Taxa de aprovação: ${report.summary.passRate}%`, 'magenta');
  
  if (report.summary.passRate >= 90) {
    log('\n🎉 SISTEMA APROVADO! Taxa de aprovação excelente!', 'green');
    process.exit(0);
  } else if (report.summary.passRate >= 80) {
    log('\n✅ SISTEMA APROVADO! Taxa de aprovação boa, mas há espaço para melhorias.', 'yellow');
    process.exit(0);
  } else {
    log('\n❌ SISTEMA REPROVADO! Taxa de aprovação baixa, correções necessárias.', 'red');
    process.exit(1);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { validateRequirement, checkProjectStructure, checkDependencies };