// Configuração do Swagger para Documentação da API
// Sistema de Gestão de Oficina Mecânica de Motos

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Gestão de Oficina Mecânica de Motos',
      version: '1.0.0',
      description: `
        API completa para gestão de oficina mecânica especializada em motocicletas.
        
        ## Funcionalidades Principais
        - Gestão de clientes e veículos
        - Ordens de serviço e agendamentos
        - Controle de estoque e produtos
        - Sistema de vendas e orçamentos
        - Gestão financeira e relatórios
        - Sistema de notificações
        - Auditoria e logs
        
        ## Autenticação
        A API utiliza JWT (JSON Web Tokens) para autenticação. 
        Inclua o token no header Authorization: Bearer {token}
      `,
      contact: {
        name: 'Suporte Técnico',
        email: 'suporte@oficina-motos.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Servidor de Desenvolvimento',
      },
      {
        url: 'https://oficina-motos-backend.railway.app/api',
        description: 'Servidor de Produção',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        // Schemas de autenticação
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'admin@oficina.com',
            },
            password: {
              type: 'string',
              minLength: 6,
              example: 'admin123',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                token: { type: 'string' },
                refreshToken: { type: 'string' },
              },
            },
          },
        },

        // Schema de usuário
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'João Silva' },
            email: { type: 'string', format: 'email' },
            role: { 
              type: 'string', 
              enum: ['admin', 'manager', 'operator', 'mechanic'],
              example: 'admin',
            },
            active: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // Schema de cliente
        Client: {
          type: 'object',
          required: ['name', 'email', 'phone'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Maria Santos' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string', example: '(11) 99999-9999' },
            cpf: { type: 'string', example: '123.456.789-00' },
            address: { type: 'string', example: 'Rua das Flores, 123' },
            city: { type: 'string', example: 'São Paulo' },
            state: { type: 'string', example: 'SP' },
            zipCode: { type: 'string', example: '01234-567' },
            birthDate: { type: 'string', format: 'date' },
            notes: { type: 'string' },
            active: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // Schema de veículo
        Vehicle: {
          type: 'object',
          required: ['clientId', 'plate', 'brand', 'model', 'year'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            clientId: { type: 'string', format: 'uuid' },
            plate: { type: 'string', example: 'ABC-1234' },
            brand: { type: 'string', example: 'Honda' },
            model: { type: 'string', example: 'CG 160' },
            year: { type: 'integer', example: 2022 },
            color: { type: 'string', example: 'Vermelha' },
            engineNumber: { type: 'string' },
            chassisNumber: { type: 'string' },
            fuelType: { 
              type: 'string', 
              enum: ['gasoline', 'ethanol', 'flex', 'electric'],
              example: 'flex',
            },
            mileage: { type: 'integer', example: 15000 },
            notes: { type: 'string' },
            active: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // Schema de produto
        Product: {
          type: 'object',
          required: ['name', 'code', 'category', 'unitPrice', 'costPrice'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Óleo Motor 20W50' },
            code: { type: 'string', example: 'OIL001' },
            barcode: { type: 'string', example: '7891234567890' },
            category: { type: 'string', example: 'Lubrificantes' },
            description: { type: 'string' },
            unitPrice: { type: 'number', format: 'decimal', example: 25.90 },
            costPrice: { type: 'number', format: 'decimal', example: 18.50 },
            minStock: { type: 'integer', example: 10 },
            unit: { type: 'string', example: 'Litro' },
            supplier: { type: 'string', example: 'Distribuidora ABC' },
            imageUrl: { type: 'string', format: 'uri' },
            active: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // Schema de ordem de serviço
        ServiceOrder: {
          type: 'object',
          required: ['clientId', 'description'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            orderNumber: { type: 'string', example: 'OS-2024-001' },
            clientId: { type: 'string', format: 'uuid' },
            vehicleId: { type: 'string', format: 'uuid' },
            mechanicId: { type: 'string', format: 'uuid' },
            status: {
              type: 'string',
              enum: ['pending', 'in_progress', 'waiting_parts', 'completed', 'cancelled'],
              example: 'pending',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              example: 'medium',
            },
            description: { type: 'string', example: 'Troca de óleo e filtro' },
            observations: { type: 'string' },
            estimatedCompletion: { type: 'string', format: 'date-time' },
            completedAt: { type: 'string', format: 'date-time' },
            laborCost: { type: 'number', format: 'decimal', example: 50.00 },
            partsCost: { type: 'number', format: 'decimal', example: 35.40 },
            totalAmount: { type: 'number', format: 'decimal', example: 85.40 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // Schema de venda
        Sale: {
          type: 'object',
          required: ['clientId', 'type'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            saleNumber: { type: 'string', example: 'VD-2024-001' },
            clientId: { type: 'string', format: 'uuid' },
            type: {
              type: 'string',
              enum: ['sale', 'quote'],
              example: 'sale',
            },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'cancelled'],
              example: 'completed',
            },
            subtotal: { type: 'number', format: 'decimal', example: 67.30 },
            discountType: {
              type: 'string',
              enum: ['percentage', 'value'],
              example: 'percentage',
            },
            discountValue: { type: 'number', format: 'decimal', example: 10 },
            discountAmount: { type: 'number', format: 'decimal', example: 6.73 },
            totalAmount: { type: 'number', format: 'decimal', example: 60.57 },
            paymentMethod: {
              type: 'string',
              enum: ['cash', 'card', 'pix', 'installment'],
              example: 'cash',
            },
            paymentStatus: {
              type: 'string',
              enum: ['pending', 'paid', 'partial', 'overdue'],
              example: 'paid',
            },
            validUntil: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // Schema de resposta padrão
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            message: { type: 'string' },
            error: { type: 'string' },
          },
        },

        // Schema de resposta paginada
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                items: { type: 'array', items: {} },
                pagination: {
                  type: 'object',
                  properties: {
                    page: { type: 'integer', example: 1 },
                    limit: { type: 'integer', example: 20 },
                    total: { type: 'integer', example: 100 },
                    totalPages: { type: 'integer', example: 5 },
                    hasNext: { type: 'boolean', example: true },
                    hasPrev: { type: 'boolean', example: false },
                  },
                },
              },
            },
          },
        },

        // Schema de erro
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Recurso não encontrado' },
            code: { type: 'string', example: 'NOT_FOUND' },
            details: { type: 'object' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Autenticação',
        description: 'Endpoints de autenticação e autorização',
      },
      {
        name: 'Clientes',
        description: 'Gestão de clientes',
      },
      {
        name: 'Veículos',
        description: 'Gestão de veículos',
      },
      {
        name: 'Produtos',
        description: 'Gestão de produtos e serviços',
      },
      {
        name: 'Estoque',
        description: 'Controle de estoque',
      },
      {
        name: 'Ordens de Serviço',
        description: 'Gestão de ordens de serviço',
      },
      {
        name: 'Vendas',
        description: 'Sistema de vendas e orçamentos',
      },
      {
        name: 'Financeiro',
        description: 'Gestão financeira',
      },
      {
        name: 'Relatórios',
        description: 'Geração de relatórios',
      },
      {
        name: 'Notificações',
        description: 'Sistema de notificações',
      },
      {
        name: 'Sistema',
        description: 'Endpoints do sistema',
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/models/*.ts',
  ],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  // Configurar Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2563eb }
    `,
    customSiteTitle: 'API - Oficina Motos',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
  }));

  // Endpoint para obter specs em JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log('📚 Documentação da API disponível em /api-docs');
};

export { specs };