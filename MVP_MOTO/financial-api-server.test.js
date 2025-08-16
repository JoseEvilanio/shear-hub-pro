const request = require('supertest');
const app = require('./financial-api-server');

describe('Financial API', () => {
  describe('GET /api/financial/accounts-payable', () => {
    it('should return list of accounts payable', async () => {
      const response = await request(app)
        .get('/api/financial/accounts-payable')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.total).toBeDefined();
    });

    it('should filter accounts payable by status', async () => {
      const response = await request(app)
        .get('/api/financial/accounts-payable?status=paid')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(a => a.paid === true)).toBe(true);
    });

    it('should filter accounts payable by supplier', async () => {
      const response = await request(app)
        .get('/api/financial/accounts-payable?supplier_id=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(a => a.supplier_id === '1')).toBe(true);
    });

    it('should filter overdue accounts only', async () => {
      const response = await request(app)
        .get('/api/financial/accounts-payable?overdue_only=true')
        .expect(200);

      expect(response.body.success).toBe(true);
      const today = new Date().toISOString().split('T')[0];
      expect(response.body.data.every(a => !a.paid && a.due_date < today)).toBe(true);
    });

    it('should search accounts payable by text', async () => {
      const response = await request(app)
        .get('/api/financial/accounts-payable?search=energia')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/financial/accounts-receivable', () => {
    it('should return list of accounts receivable', async () => {
      const response = await request(app)
        .get('/api/financial/accounts-receivable')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.total).toBeDefined();
    });

    it('should filter accounts receivable by status', async () => {
      const response = await request(app)
        .get('/api/financial/accounts-receivable?status=pending')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(a => a.received === false)).toBe(true);
    });

    it('should filter accounts receivable by client', async () => {
      const response = await request(app)
        .get('/api/financial/accounts-receivable?client_id=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(a => a.client_id === '1')).toBe(true);
    });
  });

  describe('GET /api/financial/cash-movements', () => {
    it('should return list of cash movements', async () => {
      const response = await request(app)
        .get('/api/financial/cash-movements')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.total).toBeDefined();
    });

    it('should filter cash movements by type', async () => {
      const response = await request(app)
        .get('/api/financial/cash-movements?type=income')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(m => m.type === 'income')).toBe(true);
    });

    it('should filter cash movements by category', async () => {
      const response = await request(app)
        .get('/api/financial/cash-movements?category=sale')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(m => m.category === 'sale')).toBe(true);
    });

    it('should filter cash movements by payment method', async () => {
      const response = await request(app)
        .get('/api/financial/cash-movements?payment_method=cash')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(m => m.payment_method === 'cash')).toBe(true);
    });
  });

  describe('POST /api/financial/accounts-payable', () => {
    it('should create new account payable with valid data', async () => {
      const newAccount = {
        supplier_id: '1',
        description: 'Teste de conta a pagar',
        amount: 500.00,
        due_date: '2024-03-15',
        category: 'maintenance',
        notes: 'Conta de teste'
      };

      const response = await request(app)
        .post('/api/financial/accounts-payable')
        .send(newAccount)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Conta a pagar criada com sucesso');
      expect(response.body.data.supplier_name).toBe('Fornecedor ABC Ltda');
      expect(response.body.data.amount).toBe(500.00);
      expect(response.body.data.paid).toBe(false);
    });

    it('should validate required fields', async () => {
      const incompleteAccount = {
        supplier_id: '1',
        description: 'Teste'
        // Missing amount and due_date
      };

      const response = await request(app)
        .post('/api/financial/accounts-payable')
        .send(incompleteAccount)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Campos obrigatórios');
      expect(response.body.required_fields).toEqual(['supplier_id', 'description', 'amount', 'due_date']);
    });

    it('should validate category', async () => {
      const invalidCategoryAccount = {
        supplier_id: '1',
        description: 'Teste',
        amount: 100.00,
        due_date: '2024-03-15',
        category: 'invalid_category'
      };

      const response = await request(app)
        .post('/api/financial/accounts-payable')
        .send(invalidCategoryAccount)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Categoria inválida');
      expect(response.body.valid_categories).toContain('inventory');
    });

    it('should validate supplier existence', async () => {
      const invalidSupplierAccount = {
        supplier_id: '999',
        description: 'Teste',
        amount: 100.00,
        due_date: '2024-03-15'
      };

      const response = await request(app)
        .post('/api/financial/accounts-payable')
        .send(invalidSupplierAccount)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Fornecedor não encontrado');
    });

    it('should validate amount is positive', async () => {
      const negativeAmountAccount = {
        supplier_id: '1',
        description: 'Teste',
        amount: -100.00,
        due_date: '2024-03-15'
      };

      const response = await request(app)
        .post('/api/financial/accounts-payable')
        .send(negativeAmountAccount)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Valor deve ser maior que zero');
    });
  });

  describe('POST /api/financial/accounts-receivable', () => {
    it('should create new account receivable with valid data', async () => {
      const newAccount = {
        client_id: '1',
        description: 'Teste de conta a receber',
        amount: 300.00,
        due_date: '2024-03-20',
        category: 'service',
        notes: 'Conta de teste'
      };

      const response = await request(app)
        .post('/api/financial/accounts-receivable')
        .send(newAccount)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Conta a receber criada com sucesso');
      expect(response.body.data.client_name).toBe('João Silva');
      expect(response.body.data.amount).toBe(300.00);
      expect(response.body.data.received).toBe(false);
    });

    it('should validate required fields', async () => {
      const incompleteAccount = {
        client_id: '1',
        description: 'Teste'
        // Missing amount and due_date
      };

      const response = await request(app)
        .post('/api/financial/accounts-receivable')
        .send(incompleteAccount)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Campos obrigatórios');
      expect(response.body.required_fields).toEqual(['client_id', 'description', 'amount', 'due_date']);
    });

    it('should validate client existence', async () => {
      const invalidClientAccount = {
        client_id: '999',
        description: 'Teste',
        amount: 100.00,
        due_date: '2024-03-15'
      };

      const response = await request(app)
        .post('/api/financial/accounts-receivable')
        .send(invalidClientAccount)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cliente não encontrado');
    });
  });

  describe('POST /api/financial/cash-movements', () => {
    it('should create new cash movement with valid data', async () => {
      const newMovement = {
        type: 'income',
        amount: 250.00,
        description: 'Teste de movimento',
        category: 'service',
        payment_method: 'pix'
      };

      const response = await request(app)
        .post('/api/financial/cash-movements')
        .send(newMovement)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Movimento de caixa registrado com sucesso');
      expect(response.body.data.type).toBe('income');
      expect(response.body.data.amount).toBe(250.00);
      expect(response.body.current_balance).toBeDefined();
    });

    it('should validate required fields', async () => {
      const incompleteMovement = {
        type: 'income',
        amount: 100.00
        // Missing description
      };

      const response = await request(app)
        .post('/api/financial/cash-movements')
        .send(incompleteMovement)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Campos obrigatórios');
      expect(response.body.required_fields).toEqual(['type', 'amount', 'description']);
    });

    it('should validate movement type', async () => {
      const invalidTypeMovement = {
        type: 'invalid_type',
        amount: 100.00,
        description: 'Teste'
      };

      const response = await request(app)
        .post('/api/financial/cash-movements')
        .send(invalidTypeMovement)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Tipo inválido');
      expect(response.body.valid_types).toEqual(['income', 'expense']);
    });

    it('should validate payment method', async () => {
      const invalidPaymentMovement = {
        type: 'income',
        amount: 100.00,
        description: 'Teste',
        payment_method: 'invalid_method'
      };

      const response = await request(app)
        .post('/api/financial/cash-movements')
        .send(invalidPaymentMovement)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Método de pagamento inválido');
      expect(response.body.valid_payment_methods).toContain('cash');
    });
  });

  describe('PATCH /api/financial/accounts-payable/:id/pay', () => {
    it('should mark account as paid', async () => {
      // First create an account
      const newAccount = {
        supplier_id: '1',
        description: 'Conta para teste de pagamento',
        amount: 200.00,
        due_date: '2024-03-15'
      };

      const createResponse = await request(app)
        .post('/api/financial/accounts-payable')
        .send(newAccount);

      const accountId = createResponse.body.data.id;

      const paymentData = {
        paid_amount: 200.00,
        payment_method: 'bank_transfer',
        notes: 'Pago via transferência'
      };

      const response = await request(app)
        .patch(`/api/financial/accounts-payable/${accountId}/pay`)
        .send(paymentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Conta marcada como paga');
      expect(response.body.data.paid).toBe(true);
      expect(response.body.data.paid_amount).toBe(200.00);
      expect(response.body.cash_movement).toBeDefined();
      expect(response.body.cash_movement.type).toBe('expense');
      expect(response.body.current_balance).toBeDefined();
    });

    it('should return 404 for non-existent account', async () => {
      const response = await request(app)
        .patch('/api/financial/accounts-payable/999/pay')
        .send({ paid_amount: 100.00 })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Conta a pagar não encontrada');
    });

    it('should prevent paying already paid account', async () => {
      const response = await request(app)
        .patch('/api/financial/accounts-payable/2/pay') // This account is already paid
        .send({ paid_amount: 100.00 })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Conta já foi paga');
    });

    it('should validate payment amount', async () => {
      // Create an account first
      const newAccount = {
        supplier_id: '1',
        description: 'Conta para teste de validação',
        amount: 100.00,
        due_date: '2024-03-15'
      };

      const createResponse = await request(app)
        .post('/api/financial/accounts-payable')
        .send(newAccount);

      const accountId = createResponse.body.data.id;

      const response = await request(app)
        .patch(`/api/financial/accounts-payable/${accountId}/pay`)
        .send({ paid_amount: 200.00 }) // More than account amount
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Valor de pagamento inválido');
    });
  });

  describe('PATCH /api/financial/accounts-receivable/:id/receive', () => {
    it('should mark account as received', async () => {
      // First create an account
      const newAccount = {
        client_id: '1',
        description: 'Conta para teste de recebimento',
        amount: 150.00,
        due_date: '2024-03-20'
      };

      const createResponse = await request(app)
        .post('/api/financial/accounts-receivable')
        .send(newAccount);

      const accountId = createResponse.body.data.id;

      const receiveData = {
        received_amount: 150.00,
        payment_method: 'pix',
        notes: 'Recebido via PIX'
      };

      const response = await request(app)
        .patch(`/api/financial/accounts-receivable/${accountId}/receive`)
        .send(receiveData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Conta marcada como recebida');
      expect(response.body.data.received).toBe(true);
      expect(response.body.data.received_amount).toBe(150.00);
      expect(response.body.cash_movement).toBeDefined();
      expect(response.body.cash_movement.type).toBe('income');
      expect(response.body.current_balance).toBeDefined();
    });

    it('should return 404 for non-existent account', async () => {
      const response = await request(app)
        .patch('/api/financial/accounts-receivable/999/receive')
        .send({ received_amount: 100.00 })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Conta a receber não encontrada');
    });
  });

  describe('GET /api/financial/dashboard', () => {
    it('should return financial dashboard data', async () => {
      const response = await request(app)
        .get('/api/financial/dashboard')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.period_days).toBeDefined();
      expect(response.body.data.current_balance).toBeDefined();
      expect(response.body.data.accounts_payable).toBeDefined();
      expect(response.body.data.accounts_receivable).toBeDefined();
      expect(response.body.data.cash_flow).toBeDefined();
      expect(response.body.data.upcoming_due).toBeDefined();

      // Check accounts payable structure
      expect(response.body.data.accounts_payable.total_pending).toBeDefined();
      expect(response.body.data.accounts_payable.overdue_count).toBeDefined();
      expect(response.body.data.accounts_payable.upcoming_count).toBeDefined();

      // Check accounts receivable structure
      expect(response.body.data.accounts_receivable.total_pending).toBeDefined();
      expect(response.body.data.accounts_receivable.overdue_count).toBeDefined();
      expect(response.body.data.accounts_receivable.upcoming_count).toBeDefined();

      // Check cash flow structure
      expect(response.body.data.cash_flow.period_income).toBeDefined();
      expect(response.body.data.cash_flow.period_expenses).toBeDefined();
      expect(response.body.data.cash_flow.period_balance).toBeDefined();
      expect(response.body.data.cash_flow.income_by_category).toBeDefined();
      expect(response.body.data.cash_flow.expenses_by_category).toBeDefined();
    });

    it('should accept period parameter', async () => {
      const response = await request(app)
        .get('/api/financial/dashboard?period=7')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.period_days).toBe(7);
    });
  });

  describe('Reference endpoints', () => {
    it('should return suppliers list', async () => {
      const response = await request(app)
        .get('/api/suppliers')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return clients list', async () => {
      const response = await request(app)
        .get('/api/clients')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Business Logic', () => {
    it('should calculate cash balance correctly', async () => {
      // Get initial balance
      const initialResponse = await request(app)
        .get('/api/financial/dashboard');
      const initialBalance = initialResponse.body.data.current_balance;

      // Add income
      const incomeMovement = {
        type: 'income',
        amount: 100.00,
        description: 'Teste de entrada'
      };

      const incomeResponse = await request(app)
        .post('/api/financial/cash-movements')
        .send(incomeMovement);

      expect(incomeResponse.body.current_balance).toBe(initialBalance + 100.00);

      // Add expense
      const expenseMovement = {
        type: 'expense',
        amount: 50.00,
        description: 'Teste de saída'
      };

      const expenseResponse = await request(app)
        .post('/api/financial/cash-movements')
        .send(expenseMovement);

      expect(expenseResponse.body.current_balance).toBe(initialBalance + 100.00 - 50.00);
    });

    it('should create cash movement when paying account', async () => {
      // Create account
      const newAccount = {
        supplier_id: '1',
        description: 'Conta para teste de movimento',
        amount: 300.00,
        due_date: '2024-03-15'
      };

      const createResponse = await request(app)
        .post('/api/financial/accounts-payable')
        .send(newAccount);

      const accountId = createResponse.body.data.id;

      // Pay account
      const payResponse = await request(app)
        .patch(`/api/financial/accounts-payable/${accountId}/pay`)
        .send({ paid_amount: 300.00, payment_method: 'cash' });

      expect(payResponse.body.cash_movement).toBeDefined();
      expect(payResponse.body.cash_movement.type).toBe('expense');
      expect(payResponse.body.cash_movement.amount).toBe(300.00);
      expect(payResponse.body.cash_movement.reference_type).toBe('accounts_payable');
      expect(payResponse.body.cash_movement.reference_id).toBe(accountId);
    });

    it('should create cash movement when receiving account', async () => {
      // Create account
      const newAccount = {
        client_id: '1',
        description: 'Conta para teste de movimento',
        amount: 200.00,
        due_date: '2024-03-20'
      };

      const createResponse = await request(app)
        .post('/api/financial/accounts-receivable')
        .send(newAccount);

      const accountId = createResponse.body.data.id;

      // Receive account
      const receiveResponse = await request(app)
        .patch(`/api/financial/accounts-receivable/${accountId}/receive`)
        .send({ received_amount: 200.00, payment_method: 'card' });

      expect(receiveResponse.body.cash_movement).toBeDefined();
      expect(receiveResponse.body.cash_movement.type).toBe('income');
      expect(receiveResponse.body.cash_movement.amount).toBe(200.00);
      expect(receiveResponse.body.cash_movement.reference_type).toBe('accounts_receivable');
      expect(receiveResponse.body.cash_movement.reference_id).toBe(accountId);
    });

    it('should use default payment amount when not specified', async () => {
      // Create account
      const newAccount = {
        supplier_id: '1',
        description: 'Conta para teste de valor padrão',
        amount: 400.00,
        due_date: '2024-03-15'
      };

      const createResponse = await request(app)
        .post('/api/financial/accounts-payable')
        .send(newAccount);

      const accountId = createResponse.body.data.id;

      // Pay without specifying amount (should use full amount)
      const payResponse = await request(app)
        .patch(`/api/financial/accounts-payable/${accountId}/pay`)
        .send({ payment_method: 'cash' });

      expect(payResponse.body.data.paid_amount).toBe(400.00);
      expect(payResponse.body.cash_movement.amount).toBe(400.00);
    });
  });
});

describe('Error Handling', () => {
  it('should handle server errors gracefully', async () => {
    const response = await request(app)
      .get('/api/financial/dashboard')
      .expect(200);

    expect(response.body.success).toBe(true);
  });
});