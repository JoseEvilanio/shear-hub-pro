const request = require('supertest');
const app = require('./service-orders-api-server');

describe('Service Orders API', () => {
  describe('GET /api/service-orders', () => {
    it('should return list of service orders', async () => {
      const response = await request(app)
        .get('/api/service-orders')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.total).toBeDefined();
    });

    it('should filter service orders by status', async () => {
      const response = await request(app)
        .get('/api/service-orders?status=completed')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(o => o.status === 'completed')).toBe(true);
    });

    it('should filter service orders by mechanic', async () => {
      const response = await request(app)
        .get('/api/service-orders?mechanic_id=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(o => o.mechanic_id === '1')).toBe(true);
    });

    it('should filter service orders by client', async () => {
      const response = await request(app)
        .get('/api/service-orders?client_id=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(o => o.client_id === '1')).toBe(true);
    });

    it('should search service orders by text', async () => {
      const response = await request(app)
        .get('/api/service-orders?search=Troca')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/service-orders/:id', () => {
    it('should return service order by id', async () => {
      const response = await request(app)
        .get('/api/service-orders/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('1');
      expect(response.body.data.number).toBeDefined();
      expect(response.body.data.items).toBeDefined();
      expect(Array.isArray(response.body.data.items)).toBe(true);
    });

    it('should return 404 for non-existent service order', async () => {
      const response = await request(app)
        .get('/api/service-orders/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Ordem de serviço não encontrada');
    });
  });

  describe('GET /api/service-orders/number/:number', () => {
    it('should return service order by number', async () => {
      const response = await request(app)
        .get('/api/service-orders/number/OS-001')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.number).toBe('OS-001');
    });

    it('should be case insensitive for number search', async () => {
      const response = await request(app)
        .get('/api/service-orders/number/os-001')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.number).toBe('OS-001');
    });

    it('should return 404 for non-existent number', async () => {
      const response = await request(app)
        .get('/api/service-orders/number/OS-999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Ordem de serviço não encontrada');
    });
  });

  describe('POST /api/service-orders', () => {
    it('should create new service order with valid data', async () => {
      const newOrder = {
        client_id: '1',
        vehicle_id: '1',
        mechanic_id: '1',
        description_line_1: 'Teste de criação de OS',
        description_line_2: 'Segunda linha de descrição',
        priority: 'normal',
        labor_cost: 100.00,
        items: [
          {
            product_id: '1',
            quantity: 1,
            unit_price: 25.00
          }
        ]
      };

      const response = await request(app)
        .post('/api/service-orders')
        .send(newOrder)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Ordem de serviço criada com sucesso');
      expect(response.body.data.number).toMatch(/^OS-\d{3}$/);
      expect(response.body.data.status).toBe('pending');
      expect(response.body.data.total_amount).toBe(125.00); // 100 labor + 25 parts
    });

    it('should validate required fields', async () => {
      const incompleteOrder = {
        client_id: '1',
        vehicle_id: '1'
        // Missing mechanic_id and description_line_1
      };

      const response = await request(app)
        .post('/api/service-orders')
        .send(incompleteOrder)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Campos obrigatórios');
      expect(response.body.required_fields).toEqual(['client_id', 'vehicle_id', 'mechanic_id', 'description_line_1']);
    });

    it('should validate priority', async () => {
      const invalidPriorityOrder = {
        client_id: '1',
        vehicle_id: '1',
        mechanic_id: '1',
        description_line_1: 'Teste',
        priority: 'invalid_priority'
      };

      const response = await request(app)
        .post('/api/service-orders')
        .send(invalidPriorityOrder)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Prioridade inválida');
      expect(response.body.valid_priorities).toEqual(['low', 'normal', 'high', 'urgent']);
    });

    it('should validate client existence', async () => {
      const invalidClientOrder = {
        client_id: '999',
        vehicle_id: '1',
        mechanic_id: '1',
        description_line_1: 'Teste'
      };

      const response = await request(app)
        .post('/api/service-orders')
        .send(invalidClientOrder)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cliente não encontrado');
    });

    it('should validate vehicle existence', async () => {
      const invalidVehicleOrder = {
        client_id: '1',
        vehicle_id: '999',
        mechanic_id: '1',
        description_line_1: 'Teste'
      };

      const response = await request(app)
        .post('/api/service-orders')
        .send(invalidVehicleOrder)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Veículo não encontrado');
    });

    it('should validate vehicle belongs to client', async () => {
      const mismatchedOrder = {
        client_id: '1',
        vehicle_id: '2', // Vehicle belongs to client 2
        mechanic_id: '1',
        description_line_1: 'Teste'
      };

      const response = await request(app)
        .post('/api/service-orders')
        .send(mismatchedOrder)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Veículo não pertence ao cliente informado');
    });

    it('should validate mechanic existence and active status', async () => {
      const invalidMechanicOrder = {
        client_id: '1',
        vehicle_id: '1',
        mechanic_id: '999',
        description_line_1: 'Teste'
      };

      const response = await request(app)
        .post('/api/service-orders')
        .send(invalidMechanicOrder)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Mecânico não encontrado');
    });

    it('should calculate totals correctly', async () => {
      const orderWithItems = {
        client_id: '1',
        vehicle_id: '1',
        mechanic_id: '1',
        description_line_1: 'Teste cálculo',
        labor_cost: 50.00,
        items: [
          {
            product_id: '1',
            quantity: 2,
            unit_price: 25.00
          },
          {
            product_id: '2',
            quantity: 1,
            unit_price: 10.00
          }
        ]
      };

      const response = await request(app)
        .post('/api/service-orders')
        .send(orderWithItems)
        .expect(201);

      expect(response.body.data.parts_cost).toBe(60.00); // (2*25) + (1*10)
      expect(response.body.data.labor_cost).toBe(50.00);
      expect(response.body.data.total_amount).toBe(110.00);
    });
  });

  describe('PUT /api/service-orders/:id', () => {
    it('should update existing service order', async () => {
      const updatedData = {
        description_line_1: 'Descrição atualizada',
        description_line_2: 'Segunda linha atualizada',
        priority: 'high',
        labor_cost: 150.00
      };

      const response = await request(app)
        .put('/api/service-orders/1')
        .send(updatedData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Ordem de serviço atualizada com sucesso');
      expect(response.body.data.description_line_1).toBe('Descrição atualizada');
      expect(response.body.data.priority).toBe('high');
    });

    it('should return 404 for non-existent service order', async () => {
      const response = await request(app)
        .put('/api/service-orders/999')
        .send({ description_line_1: 'Teste' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Ordem de serviço não encontrada');
    });

    it('should prevent editing delivered or cancelled orders', async () => {
      // First, let's create an order and set it to delivered
      const newOrder = {
        client_id: '1',
        vehicle_id: '1',
        mechanic_id: '1',
        description_line_1: 'Teste para entrega'
      };

      const createResponse = await request(app)
        .post('/api/service-orders')
        .send(newOrder);

      const orderId = createResponse.body.data.id;

      // Change status to in_progress first
      await request(app)
        .patch(`/api/service-orders/${orderId}/status`)
        .send({ status: 'in_progress' });

      // Change status to completed
      await request(app)
        .patch(`/api/service-orders/${orderId}/status`)
        .send({ status: 'completed' });

      // Then to delivered
      const deliveredResponse = await request(app)
        .patch(`/api/service-orders/${orderId}/status`)
        .send({ status: 'delivered' });

      expect(deliveredResponse.body.success).toBe(true);

      // Now try to edit - should fail
      const response = await request(app)
        .put(`/api/service-orders/${orderId}`)
        .send({ description_line_1: 'Tentativa de edição' })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Não é possível editar ordem de serviço entregue ou cancelada');
    });
  });

  describe('PATCH /api/service-orders/:id/status', () => {
    it('should update service order status', async () => {
      // Create a new order first
      const newOrder = {
        client_id: '1',
        vehicle_id: '1',
        mechanic_id: '1',
        description_line_1: 'Teste mudança de status'
      };

      const createResponse = await request(app)
        .post('/api/service-orders')
        .send(newOrder);

      const orderId = createResponse.body.data.id;

      const response = await request(app)
        .patch(`/api/service-orders/${orderId}/status`)
        .send({ status: 'in_progress' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Status alterado de pending para in_progress');
      expect(response.body.data.new_status).toBe('in_progress');
    });

    it('should validate status transitions', async () => {
      // Try invalid transition from pending to delivered
      const newOrder = {
        client_id: '1',
        vehicle_id: '1',
        mechanic_id: '1',
        description_line_1: 'Teste transição inválida'
      };

      const createResponse = await request(app)
        .post('/api/service-orders')
        .send(newOrder);

      const orderId = createResponse.body.data.id;

      const response = await request(app)
        .patch(`/api/service-orders/${orderId}/status`)
        .send({ status: 'delivered' }) // Can't go directly from pending to delivered
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Transição de status inválida');
    });

    it('should validate status values', async () => {
      const response = await request(app)
        .patch('/api/service-orders/1/status')
        .send({ status: 'invalid_status' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Status inválido');
      expect(response.body.valid_statuses).toContain('pending');
    });

    it('should set completion date when status becomes completed', async () => {
      // Create a new order and move it to in_progress first
      const newOrder = {
        client_id: '1',
        vehicle_id: '1',
        mechanic_id: '1',
        description_line_1: 'Teste conclusão'
      };

      const createResponse = await request(app)
        .post('/api/service-orders')
        .send(newOrder);

      const orderId = createResponse.body.data.id;

      // Move to in_progress
      await request(app)
        .patch(`/api/service-orders/${orderId}/status`)
        .send({ status: 'in_progress' });

      // Move to completed
      const response = await request(app)
        .patch(`/api/service-orders/${orderId}/status`)
        .send({ status: 'completed' })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Check if completion date was set
      const getResponse = await request(app)
        .get(`/api/service-orders/${orderId}`);

      expect(getResponse.body.data.actual_completion).toBeTruthy();
    });
  });

  describe('DELETE /api/service-orders/:id', () => {
    it('should delete pending service order', async () => {
      // Create a new order first
      const newOrder = {
        client_id: '1',
        vehicle_id: '1',
        mechanic_id: '1',
        description_line_1: 'Teste exclusão'
      };

      const createResponse = await request(app)
        .post('/api/service-orders')
        .send(newOrder);

      const orderId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/service-orders/${orderId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Ordem de serviço excluída com sucesso');
    });

    it('should return 404 for non-existent service order', async () => {
      const response = await request(app)
        .delete('/api/service-orders/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Ordem de serviço não encontrada');
    });

    it('should prevent deletion of in-progress orders', async () => {
      const response = await request(app)
        .delete('/api/service-orders/2') // This order is in_progress
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Não é possível excluir ordem de serviço em andamento, concluída ou entregue');
    });
  });

  describe('GET /api/service-orders/reports/summary', () => {
    it('should return service orders summary report', async () => {
      const response = await request(app)
        .get('/api/service-orders/reports/summary')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total_orders).toBeDefined();
      expect(response.body.data.status_distribution).toBeDefined();
      expect(response.body.data.mechanic_distribution).toBeDefined();
      expect(response.body.data.priority_distribution).toBeDefined();
      expect(response.body.data.total_revenue).toBeDefined();
      expect(response.body.data.overdue_orders).toBeDefined();
      expect(response.body.data.average_completion_time_hours).toBeDefined();
    });

    it('should accept period parameter', async () => {
      const response = await request(app)
        .get('/api/service-orders/reports/summary?period=7')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.period_days).toBe(7);
    });
  });

  describe('Reference endpoints', () => {
    it('should return clients list', async () => {
      const response = await request(app)
        .get('/api/clients')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return vehicles list', async () => {
      const response = await request(app)
        .get('/api/vehicles')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter vehicles by client', async () => {
      const response = await request(app)
        .get('/api/vehicles?client_id=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(v => v.client_id === '1')).toBe(true);
    });

    it('should return mechanics list', async () => {
      const response = await request(app)
        .get('/api/mechanics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.every(m => m.active === true)).toBe(true);
    });

    it('should return products list', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Business Logic', () => {
    it('should generate sequential OS numbers', async () => {
      const order1 = {
        client_id: '1',
        vehicle_id: '1',
        mechanic_id: '1',
        description_line_1: 'Primeira OS'
      };

      const order2 = {
        client_id: '1',
        vehicle_id: '1',
        mechanic_id: '1',
        description_line_1: 'Segunda OS'
      };

      const response1 = await request(app)
        .post('/api/service-orders')
        .send(order1);

      const response2 = await request(app)
        .post('/api/service-orders')
        .send(order2);

      const number1 = parseInt(response1.body.data.number.split('-')[1]);
      const number2 = parseInt(response2.body.data.number.split('-')[1]);

      expect(number2).toBe(number1 + 1);
    });

    it('should handle items without products gracefully', async () => {
      const orderWithInvalidProduct = {
        client_id: '1',
        vehicle_id: '1',
        mechanic_id: '1',
        description_line_1: 'Teste produto inexistente',
        items: [
          {
            product_id: '999', // Non-existent product
            quantity: 1,
            unit_price: 50.00
          }
        ]
      };

      const response = await request(app)
        .post('/api/service-orders')
        .send(orderWithInvalidProduct)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items[0].product_name).toBe('Produto não encontrado');
    });

    it('should validate items structure', async () => {
      const orderWithInvalidItems = {
        client_id: '1',
        vehicle_id: '1',
        mechanic_id: '1',
        description_line_1: 'Teste itens inválidos',
        items: [
          {
            product_id: '1',
            quantity: -1, // Invalid quantity
            unit_price: 25.00
          }
        ]
      };

      const response = await request(app)
        .post('/api/service-orders')
        .send(orderWithInvalidItems)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Itens inválidos. Verifique product_id, quantity e unit_price');
    });
  });
});

describe('Error Handling', () => {
  it('should handle server errors gracefully', async () => {
    const response = await request(app)
      .get('/api/service-orders')
      .expect(200);

    expect(response.body.success).toBe(true);
  });
});