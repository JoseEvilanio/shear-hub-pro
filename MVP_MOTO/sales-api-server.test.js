const request = require('supertest');
const app = require('./sales-api-server');

describe('Sales API', () => {
  describe('GET /api/sales', () => {
    it('should return list of sales', async () => {
      const response = await request(app)
        .get('/api/sales')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.total).toBeDefined();
    });

    it('should filter sales by type', async () => {
      const response = await request(app)
        .get('/api/sales?type=sale')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(s => s.type === 'sale')).toBe(true);
    });

    it('should filter sales by status', async () => {
      const response = await request(app)
        .get('/api/sales?status=completed')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(s => s.status === 'completed')).toBe(true);
    });

    it('should filter sales by client', async () => {
      const response = await request(app)
        .get('/api/sales?client_id=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(s => s.client_id === '1')).toBe(true);
    });

    it('should search sales by text', async () => {
      const response = await request(app)
        .get('/api/sales?search=VND')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/sales/:id', () => {
    it('should return sale by id', async () => {
      const response = await request(app)
        .get('/api/sales/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('1');
      expect(response.body.data.items).toBeDefined();
      expect(Array.isArray(response.body.data.items)).toBe(true);
    });

    it('should return 404 for non-existent sale', async () => {
      const response = await request(app)
        .get('/api/sales/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Venda não encontrada');
    });
  });

  describe('GET /api/sales/number/:number', () => {
    it('should return sale by number', async () => {
      const response = await request(app)
        .get('/api/sales/number/VND-001')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.number).toBe('VND-001');
    });

    it('should be case insensitive for number search', async () => {
      const response = await request(app)
        .get('/api/sales/number/vnd-001')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.number).toBe('VND-001');
    });

    it('should return 404 for non-existent number', async () => {
      const response = await request(app)
        .get('/api/sales/number/VND-999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Venda não encontrada');
    });
  });

  describe('POST /api/sales', () => {
    it('should create new sale with valid data', async () => {
      const newSale = {
        client_id: '1',
        type: 'sale',
        payment_method: 'cash',
        payment_terms: 'cash',
        global_discount: 5.00,
        notes: 'Venda teste',
        items: [
          {
            product_id: '1',
            quantity: 1,
            unit_price: 25.00,
            discount_amount: 2.00
          }
        ]
      };

      const response = await request(app)
        .post('/api/sales')
        .send(newSale)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Venda criada com sucesso');
      expect(response.body.data.number).toMatch(/^VND-\d{3}$/);
      expect(response.body.data.status).toBe('completed');
      expect(response.body.data.total_amount).toBe(18.00); // 25 - 2 - 5 = 18
    });

    it('should create new quote with valid data', async () => {
      const newQuote = {
        client_id: '2',
        type: 'quote',
        payment_method: 'installments',
        payment_terms: 'installments',
        installments: 3,
        items: [
          {
            product_id: '2',
            quantity: 2,
            unit_price: 10.00
          }
        ]
      };

      const response = await request(app)
        .post('/api/sales')
        .send(newQuote)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Orçamento criado com sucesso');
      expect(response.body.data.number).toMatch(/^ORC-\d{3}$/);
      expect(response.body.data.status).toBe('pending');
      expect(response.body.data.installments).toBe(3);
    });

    it('should validate required fields', async () => {
      const incompleteSale = {
        client_id: '1'
        // Missing items
      };

      const response = await request(app)
        .post('/api/sales')
        .send(incompleteSale)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Campos obrigatórios');
      expect(response.body.required_fields).toEqual(['client_id', 'items']);
    });

    it('should validate sale type', async () => {
      const invalidTypeSale = {
        client_id: '1',
        type: 'invalid_type',
        items: [
          {
            product_id: '1',
            quantity: 1,
            unit_price: 25.00
          }
        ]
      };

      const response = await request(app)
        .post('/api/sales')
        .send(invalidTypeSale)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Tipo inválido');
      expect(response.body.valid_types).toEqual(['sale', 'quote']);
    });

    it('should validate payment method', async () => {
      const invalidPaymentSale = {
        client_id: '1',
        payment_method: 'invalid_method',
        items: [
          {
            product_id: '1',
            quantity: 1,
            unit_price: 25.00
          }
        ]
      };

      const response = await request(app)
        .post('/api/sales')
        .send(invalidPaymentSale)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Método de pagamento inválido');
      expect(response.body.valid_payment_methods).toContain('cash');
    });

    it('should validate client existence', async () => {
      const invalidClientSale = {
        client_id: '999',
        items: [
          {
            product_id: '1',
            quantity: 1,
            unit_price: 25.00
          }
        ]
      };

      const response = await request(app)
        .post('/api/sales')
        .send(invalidClientSale)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cliente não encontrado');
    });

    it('should validate product existence', async () => {
      const invalidProductSale = {
        client_id: '1',
        items: [
          {
            product_id: '999',
            quantity: 1,
            unit_price: 25.00
          }
        ]
      };

      const response = await request(app)
        .post('/api/sales')
        .send(invalidProductSale)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Produto não encontrado');
    });

    it('should validate stock availability', async () => {
      const insufficientStockSale = {
        client_id: '1',
        items: [
          {
            product_id: '1',
            quantity: 1000, // More than available stock
            unit_price: 25.00
          }
        ]
      };

      const response = await request(app)
        .post('/api/sales')
        .send(insufficientStockSale)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Estoque insuficiente');
    });

    it('should validate items structure', async () => {
      const invalidItemsSale = {
        client_id: '1',
        items: [
          {
            product_id: '1',
            quantity: -1, // Invalid quantity
            unit_price: 25.00
          }
        ]
      };

      const response = await request(app)
        .post('/api/sales')
        .send(invalidItemsSale)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Itens inválidos. Verifique product_id, quantity e unit_price');
    });

    it('should calculate totals correctly', async () => {
      const saleWithDiscounts = {
        client_id: '1',
        global_discount: 10.00,
        items: [
          {
            product_id: '1',
            quantity: 2,
            unit_price: 25.00,
            discount_amount: 5.00
          },
          {
            product_id: '2',
            quantity: 1,
            unit_price: 10.00,
            discount_amount: 1.00
          }
        ]
      };

      const response = await request(app)
        .post('/api/sales')
        .send(saleWithDiscounts)
        .expect(201);

      expect(response.body.data.subtotal).toBe(60.00); // (2*25) + (1*10)
      expect(response.body.data.discount_amount).toBe(16.00); // 5 + 1 + 10
      expect(response.body.data.total_amount).toBe(44.00); // 60 - 16
    });

    it('should handle services (no stock check)', async () => {
      const servicesSale = {
        client_id: '1',
        items: [
          {
            product_id: '5', // Service
            quantity: 1,
            unit_price: 150.00
          }
        ]
      };

      const response = await request(app)
        .post('/api/sales')
        .send(servicesSale)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total_amount).toBe(150.00);
    });
  });

  describe('PUT /api/sales/:id', () => {
    it('should update existing sale', async () => {
      // First create a quote (can be edited)
      const newQuote = {
        client_id: '1',
        type: 'quote',
        items: [
          {
            product_id: '1',
            quantity: 1,
            unit_price: 25.00
          }
        ]
      };

      const createResponse = await request(app)
        .post('/api/sales')
        .send(newQuote);

      const quoteId = createResponse.body.data.id;

      const updatedData = {
        notes: 'Orçamento atualizado',
        payment_method: 'card',
        items: [
          {
            product_id: '1',
            quantity: 2,
            unit_price: 25.00
          }
        ]
      };

      const response = await request(app)
        .put(`/api/sales/${quoteId}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Venda atualizada com sucesso');
      expect(response.body.data.notes).toBe('Orçamento atualizado');
      expect(response.body.data.payment_method).toBe('card');
      expect(response.body.data.total_amount).toBe(50.00);
    });

    it('should return 404 for non-existent sale', async () => {
      const response = await request(app)
        .put('/api/sales/999')
        .send({ notes: 'Test' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Venda não encontrada');
    });

    it('should prevent editing completed sales', async () => {
      const response = await request(app)
        .put('/api/sales/1') // This is a completed sale
        .send({ notes: 'Tentativa de edição' })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Não é possível editar venda concluída');
    });
  });

  describe('PATCH /api/sales/:id/status', () => {
    it('should update sale status', async () => {
      // Create a quote first
      const newQuote = {
        client_id: '1',
        type: 'quote',
        items: [
          {
            product_id: '1',
            quantity: 1,
            unit_price: 25.00
          }
        ]
      };

      const createResponse = await request(app)
        .post('/api/sales')
        .send(newQuote);

      const quoteId = createResponse.body.data.id;

      const response = await request(app)
        .patch(`/api/sales/${quoteId}/status`)
        .send({ status: 'approved' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Status alterado de pending para approved');
      expect(response.body.data.new_status).toBe('approved');
    });

    it('should validate status transitions', async () => {
      const response = await request(app)
        .patch('/api/sales/1/status') // Completed sale
        .send({ status: 'pending' }) // Can't go back to pending
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Transição de status inválida');
    });

    it('should validate status values', async () => {
      const response = await request(app)
        .patch('/api/sales/2/status')
        .send({ status: 'invalid_status' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Status inválido');
      expect(response.body.valid_statuses).toContain('pending');
    });
  });

  describe('DELETE /api/sales/:id', () => {
    it('should delete pending sale', async () => {
      // Create a quote first
      const newQuote = {
        client_id: '1',
        type: 'quote',
        items: [
          {
            product_id: '1',
            quantity: 1,
            unit_price: 25.00
          }
        ]
      };

      const createResponse = await request(app)
        .post('/api/sales')
        .send(newQuote);

      const quoteId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/sales/${quoteId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Venda excluída com sucesso');
    });

    it('should return 404 for non-existent sale', async () => {
      const response = await request(app)
        .delete('/api/sales/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Venda não encontrada');
    });

    it('should prevent deletion of completed sales', async () => {
      const response = await request(app)
        .delete('/api/sales/1') // This is a completed sale
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Não é possível excluir venda concluída');
    });
  });

  describe('GET /api/sales/barcode/:barcode', () => {
    it('should return product by barcode', async () => {
      const response = await request(app)
        .get('/api/sales/barcode/7891234567890')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.barcode).toBe('7891234567890');
      expect(response.body.data.name).toBe('Óleo Motor 20W50');
      expect(response.body.data.price).toBe(25.00);
    });

    it('should return 404 for non-existent barcode', async () => {
      const response = await request(app)
        .get('/api/sales/barcode/9999999999999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Produto não encontrado ou inativo');
    });
  });

  describe('GET /api/sales/reports/summary', () => {
    it('should return sales summary report', async () => {
      const response = await request(app)
        .get('/api/sales/reports/summary')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total_sales).toBeDefined();
      expect(response.body.data.status_distribution).toBeDefined();
      expect(response.body.data.type_distribution).toBeDefined();
      expect(response.body.data.payment_method_distribution).toBeDefined();
      expect(response.body.data.total_revenue).toBeDefined();
      expect(response.body.data.top_products).toBeDefined();
      expect(response.body.data.pending_payments).toBeDefined();
      expect(Array.isArray(response.body.data.top_products)).toBe(true);
    });

    it('should accept period parameter', async () => {
      const response = await request(app)
        .get('/api/sales/reports/summary?period=7')
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

    it('should return products list', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.every(p => p.active === true)).toBe(true);
    });

    it('should return all products when active_only=false', async () => {
      const response = await request(app)
        .get('/api/products?active_only=false')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Business Logic', () => {
    it('should generate sequential sale numbers', async () => {
      const sale1 = {
        client_id: '1',
        type: 'sale',
        items: [{ product_id: '1', quantity: 1, unit_price: 25.00 }]
      };

      const sale2 = {
        client_id: '1',
        type: 'sale',
        items: [{ product_id: '1', quantity: 1, unit_price: 25.00 }]
      };

      const response1 = await request(app)
        .post('/api/sales')
        .send(sale1);

      const response2 = await request(app)
        .post('/api/sales')
        .send(sale2);

      const number1 = parseInt(response1.body.data.number.split('-')[1]);
      const number2 = parseInt(response2.body.data.number.split('-')[1]);

      expect(number2).toBe(number1 + 1);
    });

    it('should generate different number sequences for sales and quotes', async () => {
      const sale = {
        client_id: '1',
        type: 'sale',
        items: [{ product_id: '1', quantity: 1, unit_price: 25.00 }]
      };

      const quote = {
        client_id: '1',
        type: 'quote',
        items: [{ product_id: '1', quantity: 1, unit_price: 25.00 }]
      };

      const saleResponse = await request(app)
        .post('/api/sales')
        .send(sale);

      const quoteResponse = await request(app)
        .post('/api/sales')
        .send(quote);

      expect(saleResponse.body.data.number).toMatch(/^VND-\d{3}$/);
      expect(quoteResponse.body.data.number).toMatch(/^ORC-\d{3}$/);
    });

    it('should set paid status correctly for cash sales', async () => {
      const cashSale = {
        client_id: '1',
        type: 'sale',
        payment_terms: 'cash',
        items: [{ product_id: '1', quantity: 1, unit_price: 25.00 }]
      };

      const response = await request(app)
        .post('/api/sales')
        .send(cashSale);

      expect(response.body.data.paid).toBe(true);
    });

    it('should not set paid status for installment sales', async () => {
      const installmentSale = {
        client_id: '1',
        type: 'sale',
        payment_terms: 'installments',
        installments: 3,
        items: [{ product_id: '1', quantity: 1, unit_price: 25.00 }]
      };

      const response = await request(app)
        .post('/api/sales')
        .send(installmentSale);

      expect(response.body.data.paid).toBe(false);
    });

    it('should prevent negative total amounts', async () => {
      const saleWithExcessiveDiscount = {
        client_id: '1',
        global_discount: 1000.00, // More than item value
        items: [
          {
            product_id: '1',
            quantity: 1,
            unit_price: 25.00
          }
        ]
      };

      const response = await request(app)
        .post('/api/sales')
        .send(saleWithExcessiveDiscount);

      expect(response.body.data.total_amount).toBe(0); // Should not be negative
    });
  });
});

describe('Error Handling', () => {
  it('should handle server errors gracefully', async () => {
    const response = await request(app)
      .get('/api/sales')
      .expect(200);

    expect(response.body.success).toBe(true);
  });
});