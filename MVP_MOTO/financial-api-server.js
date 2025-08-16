const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3012;

// Middleware
app.use(cors());
app.use(express.json());

// Dados simulados para demonstração
let accountsPayable = [
  {
    id: '1',
    supplier_id: '1',
    supplier_name: 'Fornecedor ABC Ltda',
    description: 'Compra de peças - NF 12345',
    amount: 1500.00,
    due_date: '2024-02-15',
    paid: false,
    paid_date: null,
    paid_amount: 0.00,
    category: 'inventory',
    reference_type: 'purchase',
    reference_id: 'PUR-001',
    notes: 'Pagamento em 30 dias',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    supplier_id: '2',
    supplier_name: 'Energia Elétrica S.A.',
    description: 'Conta de energia elétrica - Janeiro/2024',
    amount: 450.00,
    due_date: '2024-02-10',
    paid: true,
    paid_date: '2024-02-08',
    paid_amount: 450.00,
    category: 'utilities',
    reference_type: 'utility',
    reference_id: 'UTIL-001',
    notes: 'Pago com desconto de 2%',
    created_at: '2024-01-20T14:30:00Z',
    updated_at: '2024-02-08T09:15:00Z'
  }
];

let accountsReceivable = [
  {
    id: '1',
    client_id: '1',
    client_name: 'João Silva',
    sale_id: '1',
    sale_number: 'VND-001',
    description: 'Venda a prazo - 3x sem juros',
    amount: 300.00,
    due_date: '2024-02-25',
    received: false,
    received_date: null,
    received_amount: 0.00,
    installment_number: 1,
    total_installments: 3,
    category: 'sale',
    reference_type: 'sale',
    reference_id: 'VND-001',
    notes: 'Primeira parcela de 3',
    created_at: '2024-01-25T16:00:00Z',
    updated_at: '2024-01-25T16:00:00Z'
  },
  {
    id: '2',
    client_id: '1',
    client_name: 'João Silva',
    sale_id: '1',
    sale_number: 'VND-001',
    description: 'Venda a prazo - 3x sem juros',
    amount: 300.00,
    due_date: '2024-03-25',
    received: false,
    received_date: null,
    received_amount: 0.00,
    installment_number: 2,
    total_installments: 3,
    category: 'sale',
    reference_type: 'sale',
    reference_id: 'VND-001',
    notes: 'Segunda parcela de 3',
    created_at: '2024-01-25T16:00:00Z',
    updated_at: '2024-01-25T16:00:00Z'
  }
];

let cashMovements = [
  {
    id: '1',
    type: 'income',
    amount: 450.00,
    description: 'Recebimento de venda à vista',
    category: 'sale',
    reference_type: 'sale',
    reference_id: 'VND-002',
    payment_method: 'cash',
    user_id: 'admin',
    user_name: 'Administrador',
    created_at: '2024-02-01T10:30:00Z'
  },
  {
    id: '2',
    type: 'expense',
    amount: 450.00,
    description: 'Pagamento conta de energia',
    category: 'utilities',
    reference_type: 'accounts_payable',
    reference_id: '2',
    payment_method: 'bank_transfer',
    user_id: 'admin',
    user_name: 'Administrador',
    created_at: '2024-02-08T09:15:00Z'
  },
  {
    id: '3',
    type: 'income',
    amount: 85.00,
    description: 'Recebimento de OS finalizada',
    category: 'service',
    reference_type: 'service_order',
    reference_id: 'OS-001',
    payment_method: 'pix',
    user_id: 'admin',
    user_name: 'Administrador',
    created_at: '2024-02-10T14:20:00Z'
  }
];

// Categorias válidas
const validCategories = {
  payable: ['inventory', 'utilities', 'rent', 'salary', 'maintenance', 'other'],
  receivable: ['sale', 'service', 'other'],
  cash: ['sale', 'service', 'utilities', 'rent', 'salary', 'maintenance', 'other']
};

const validPaymentMethods = ['cash', 'card', 'pix', 'bank_transfer', 'check'];
const validMovementTypes = ['income', 'expense'];

// Dados simulados de referência
let suppliers = [
  { id: '1', name: 'Fornecedor ABC Ltda', cnpj: '12.345.678/0001-90' },
  { id: '2', name: 'Energia Elétrica S.A.', cnpj: '98.765.432/0001-10' }
];

let clients = [
  { id: '1', name: 'João Silva', cpf: '123.456.789-01' },
  { id: '2', name: 'Maria Santos', cpf: '987.654.321-02' }
];

let nextPayableId = 3;
let nextReceivableId = 3;
let nextCashMovementId = 4;

// Função para calcular saldo de caixa
function calculateCashBalance(endDate = null) {
  const cutoffDate = endDate ? new Date(endDate) : new Date();
  
  const relevantMovements = cashMovements.filter(movement => 
    new Date(movement.created_at) <= cutoffDate
  );

  const income = relevantMovements
    .filter(m => m.type === 'income')
    .reduce((sum, m) => sum + m.amount, 0);

  const expenses = relevantMovements
    .filter(m => m.type === 'expense')
    .reduce((sum, m) => sum + m.amount, 0);

  return income - expenses;
}

// Função para gerar contas a receber de uma venda a prazo
function generateAccountsReceivable(sale) {
  if (sale.payment_terms !== 'installments' || sale.installments <= 1) {
    return [];
  }

  const installmentAmount = sale.total_amount / sale.installments;
  const accounts = [];

  for (let i = 1; i <= sale.installments; i++) {
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + i);

    accounts.push({
      id: (++nextReceivableId).toString(),
      client_id: sale.client_id,
      client_name: sale.client_name,
      sale_id: sale.id,
      sale_number: sale.number,
      description: `Venda a prazo - ${sale.installments}x sem juros`,
      amount: installmentAmount,
      due_date: dueDate.toISOString().split('T')[0],
      received: false,
      received_date: null,
      received_amount: 0.00,
      installment_number: i,
      total_installments: sale.installments,
      category: 'sale',
      reference_type: 'sale',
      reference_id: sale.number,
      notes: `Parcela ${i} de ${sale.installments}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  return accounts;
}

// GET /api/financial/accounts-payable - Listar contas a pagar
app.get('/api/financial/accounts-payable', (req, res) => {
  try {
    const { 
      status, 
      supplier_id, 
      category,
      due_date_from,
      due_date_to,
      overdue_only,
      search 
    } = req.query;
    
    let filteredAccounts = [...accountsPayable];

    // Filtro por status
    if (status === 'paid') {
      filteredAccounts = filteredAccounts.filter(account => account.paid);
    } else if (status === 'pending') {
      filteredAccounts = filteredAccounts.filter(account => !account.paid);
    }

    // Filtro por fornecedor
    if (supplier_id) {
      filteredAccounts = filteredAccounts.filter(account => account.supplier_id === supplier_id);
    }

    // Filtro por categoria
    if (category && validCategories.payable.includes(category)) {
      filteredAccounts = filteredAccounts.filter(account => account.category === category);
    }

    // Filtro por período de vencimento
    if (due_date_from) {
      filteredAccounts = filteredAccounts.filter(account => 
        account.due_date >= due_date_from
      );
    }
    if (due_date_to) {
      filteredAccounts = filteredAccounts.filter(account => 
        account.due_date <= due_date_to
      );
    }

    // Filtro apenas vencidas
    if (overdue_only === 'true') {
      const today = new Date().toISOString().split('T')[0];
      filteredAccounts = filteredAccounts.filter(account => 
        !account.paid && account.due_date < today
      );
    }

    // Busca geral
    if (search) {
      const searchLower = search.toLowerCase();
      filteredAccounts = filteredAccounts.filter(account =>
        account.supplier_name.toLowerCase().includes(searchLower) ||
        account.description.toLowerCase().includes(searchLower) ||
        (account.notes && account.notes.toLowerCase().includes(searchLower))
      );
    }

    // Ordenar por data de vencimento
    filteredAccounts.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

    res.json({
      success: true,
      data: filteredAccounts,
      total: filteredAccounts.length,
      filters_applied: {
        status, supplier_id, category, due_date_from, due_date_to, overdue_only, search
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// GET /api/financial/accounts-receivable - Listar contas a receber
app.get('/api/financial/accounts-receivable', (req, res) => {
  try {
    const { 
      status, 
      client_id, 
      category,
      due_date_from,
      due_date_to,
      overdue_only,
      search 
    } = req.query;
    
    let filteredAccounts = [...accountsReceivable];

    // Filtro por status
    if (status === 'received') {
      filteredAccounts = filteredAccounts.filter(account => account.received);
    } else if (status === 'pending') {
      filteredAccounts = filteredAccounts.filter(account => !account.received);
    }

    // Filtro por cliente
    if (client_id) {
      filteredAccounts = filteredAccounts.filter(account => account.client_id === client_id);
    }

    // Filtro por categoria
    if (category && validCategories.receivable.includes(category)) {
      filteredAccounts = filteredAccounts.filter(account => account.category === category);
    }

    // Filtro por período de vencimento
    if (due_date_from) {
      filteredAccounts = filteredAccounts.filter(account => 
        account.due_date >= due_date_from
      );
    }
    if (due_date_to) {
      filteredAccounts = filteredAccounts.filter(account => 
        account.due_date <= due_date_to
      );
    }

    // Filtro apenas vencidas
    if (overdue_only === 'true') {
      const today = new Date().toISOString().split('T')[0];
      filteredAccounts = filteredAccounts.filter(account => 
        !account.received && account.due_date < today
      );
    }

    // Busca geral
    if (search) {
      const searchLower = search.toLowerCase();
      filteredAccounts = filteredAccounts.filter(account =>
        account.client_name.toLowerCase().includes(searchLower) ||
        account.description.toLowerCase().includes(searchLower) ||
        (account.sale_number && account.sale_number.toLowerCase().includes(searchLower))
      );
    }

    // Ordenar por data de vencimento
    filteredAccounts.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

    res.json({
      success: true,
      data: filteredAccounts,
      total: filteredAccounts.length,
      filters_applied: {
        status, client_id, category, due_date_from, due_date_to, overdue_only, search
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// GET /api/financial/cash-movements - Listar movimentos de caixa
app.get('/api/financial/cash-movements', (req, res) => {
  try {
    const { 
      type, 
      category,
      payment_method,
      date_from,
      date_to,
      search 
    } = req.query;
    
    let filteredMovements = [...cashMovements];

    // Filtro por tipo
    if (type && validMovementTypes.includes(type)) {
      filteredMovements = filteredMovements.filter(movement => movement.type === type);
    }

    // Filtro por categoria
    if (category && validCategories.cash.includes(category)) {
      filteredMovements = filteredMovements.filter(movement => movement.category === category);
    }

    // Filtro por método de pagamento
    if (payment_method && validPaymentMethods.includes(payment_method)) {
      filteredMovements = filteredMovements.filter(movement => movement.payment_method === payment_method);
    }

    // Filtro por período
    if (date_from) {
      filteredMovements = filteredMovements.filter(movement => 
        movement.created_at >= date_from + 'T00:00:00Z'
      );
    }
    if (date_to) {
      filteredMovements = filteredMovements.filter(movement => 
        movement.created_at <= date_to + 'T23:59:59Z'
      );
    }

    // Busca geral
    if (search) {
      const searchLower = search.toLowerCase();
      filteredMovements = filteredMovements.filter(movement =>
        movement.description.toLowerCase().includes(searchLower) ||
        movement.user_name.toLowerCase().includes(searchLower)
      );
    }

    // Ordenar por data (mais recentes primeiro)
    filteredMovements.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({
      success: true,
      data: filteredMovements,
      total: filteredMovements.length,
      filters_applied: {
        type, category, payment_method, date_from, date_to, search
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// POST /api/financial/accounts-payable - Criar conta a pagar
app.post('/api/financial/accounts-payable', (req, res) => {
  try {
    const {
      supplier_id,
      description,
      amount,
      due_date,
      category = 'other',
      reference_type,
      reference_id,
      notes
    } = req.body;

    // Validações obrigatórias
    if (!supplier_id || !description || !amount || !due_date) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: supplier_id, description, amount, due_date',
        required_fields: ['supplier_id', 'description', 'amount', 'due_date']
      });
    }

    // Validar categoria
    if (!validCategories.payable.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Categoria inválida',
        valid_categories: validCategories.payable
      });
    }

    // Verificar se fornecedor existe
    const supplier = suppliers.find(s => s.id === supplier_id);
    if (!supplier) {
      return res.status(400).json({
        success: false,
        message: 'Fornecedor não encontrado'
      });
    }

    // Validar valor
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valor deve ser maior que zero'
      });
    }

    // Criar nova conta a pagar
    const newAccount = {
      id: (++nextPayableId).toString(),
      supplier_id,
      supplier_name: supplier.name,
      description: description.trim(),
      amount: parseFloat(amount),
      due_date,
      paid: false,
      paid_date: null,
      paid_amount: 0.00,
      category,
      reference_type: reference_type || null,
      reference_id: reference_id || null,
      notes: notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    accountsPayable.push(newAccount);

    res.status(201).json({
      success: true,
      message: 'Conta a pagar criada com sucesso',
      data: newAccount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// POST /api/financial/accounts-receivable - Criar conta a receber
app.post('/api/financial/accounts-receivable', (req, res) => {
  try {
    const {
      client_id,
      description,
      amount,
      due_date,
      category = 'other',
      reference_type,
      reference_id,
      notes
    } = req.body;

    // Validações obrigatórias
    if (!client_id || !description || !amount || !due_date) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: client_id, description, amount, due_date',
        required_fields: ['client_id', 'description', 'amount', 'due_date']
      });
    }

    // Validar categoria
    if (!validCategories.receivable.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Categoria inválida',
        valid_categories: validCategories.receivable
      });
    }

    // Verificar se cliente existe
    const client = clients.find(c => c.id === client_id);
    if (!client) {
      return res.status(400).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    // Validar valor
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valor deve ser maior que zero'
      });
    }

    // Criar nova conta a receber
    const newAccount = {
      id: (++nextReceivableId).toString(),
      client_id,
      client_name: client.name,
      sale_id: null,
      sale_number: null,
      description: description.trim(),
      amount: parseFloat(amount),
      due_date,
      received: false,
      received_date: null,
      received_amount: 0.00,
      installment_number: 1,
      total_installments: 1,
      category,
      reference_type: reference_type || null,
      reference_id: reference_id || null,
      notes: notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    accountsReceivable.push(newAccount);

    res.status(201).json({
      success: true,
      message: 'Conta a receber criada com sucesso',
      data: newAccount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// POST /api/financial/cash-movements - Registrar movimento de caixa
app.post('/api/financial/cash-movements', (req, res) => {
  try {
    const {
      type,
      amount,
      description,
      category = 'other',
      reference_type,
      reference_id,
      payment_method = 'cash'
    } = req.body;

    // Validações obrigatórias
    if (!type || !amount || !description) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: type, amount, description',
        required_fields: ['type', 'amount', 'description']
      });
    }

    // Validar tipo
    if (!validMovementTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo inválido',
        valid_types: validMovementTypes
      });
    }

    // Validar categoria
    if (!validCategories.cash.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Categoria inválida',
        valid_categories: validCategories.cash
      });
    }

    // Validar método de pagamento
    if (!validPaymentMethods.includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: 'Método de pagamento inválido',
        valid_payment_methods: validPaymentMethods
      });
    }

    // Validar valor
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valor deve ser maior que zero'
      });
    }

    // Criar novo movimento
    const newMovement = {
      id: (++nextCashMovementId).toString(),
      type,
      amount: parseFloat(amount),
      description: description.trim(),
      category,
      reference_type: reference_type || null,
      reference_id: reference_id || null,
      payment_method,
      user_id: 'admin', // TODO: pegar do token JWT
      user_name: 'Administrador',
      created_at: new Date().toISOString()
    };

    cashMovements.push(newMovement);

    res.status(201).json({
      success: true,
      message: 'Movimento de caixa registrado com sucesso',
      data: newMovement,
      current_balance: calculateCashBalance()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// PATCH /api/financial/accounts-payable/:id/pay - Marcar conta como paga
app.patch('/api/financial/accounts-payable/:id/pay', (req, res) => {
  try {
    const { id } = req.params;
    const { paid_amount, payment_method = 'cash', notes } = req.body;

    const accountIndex = accountsPayable.findIndex(a => a.id === id);
    if (accountIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Conta a pagar não encontrada'
      });
    }

    const account = accountsPayable[accountIndex];
    
    if (account.paid) {
      return res.status(409).json({
        success: false,
        message: 'Conta já foi paga'
      });
    }

    const amountToPay = paid_amount || account.amount;

    // Validar valor do pagamento
    if (amountToPay <= 0 || amountToPay > account.amount) {
      return res.status(400).json({
        success: false,
        message: 'Valor de pagamento inválido'
      });
    }

    // Atualizar conta
    accountsPayable[accountIndex].paid = true;
    accountsPayable[accountIndex].paid_date = new Date().toISOString().split('T')[0];
    accountsPayable[accountIndex].paid_amount = amountToPay;
    accountsPayable[accountIndex].updated_at = new Date().toISOString();
    if (notes) accountsPayable[accountIndex].notes = notes;

    // Registrar movimento de caixa
    const cashMovement = {
      id: (++nextCashMovementId).toString(),
      type: 'expense',
      amount: amountToPay,
      description: `Pagamento: ${account.description}`,
      category: account.category,
      reference_type: 'accounts_payable',
      reference_id: id,
      payment_method,
      user_id: 'admin',
      user_name: 'Administrador',
      created_at: new Date().toISOString()
    };

    cashMovements.push(cashMovement);

    res.json({
      success: true,
      message: 'Conta marcada como paga',
      data: accountsPayable[accountIndex],
      cash_movement: cashMovement,
      current_balance: calculateCashBalance()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// PATCH /api/financial/accounts-receivable/:id/receive - Marcar conta como recebida
app.patch('/api/financial/accounts-receivable/:id/receive', (req, res) => {
  try {
    const { id } = req.params;
    const { received_amount, payment_method = 'cash', notes } = req.body;

    const accountIndex = accountsReceivable.findIndex(a => a.id === id);
    if (accountIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Conta a receber não encontrada'
      });
    }

    const account = accountsReceivable[accountIndex];
    
    if (account.received) {
      return res.status(409).json({
        success: false,
        message: 'Conta já foi recebida'
      });
    }

    const amountToReceive = received_amount || account.amount;

    // Validar valor do recebimento
    if (amountToReceive <= 0 || amountToReceive > account.amount) {
      return res.status(400).json({
        success: false,
        message: 'Valor de recebimento inválido'
      });
    }

    // Atualizar conta
    accountsReceivable[accountIndex].received = true;
    accountsReceivable[accountIndex].received_date = new Date().toISOString().split('T')[0];
    accountsReceivable[accountIndex].received_amount = amountToReceive;
    accountsReceivable[accountIndex].updated_at = new Date().toISOString();
    if (notes) accountsReceivable[accountIndex].notes = notes;

    // Registrar movimento de caixa
    const cashMovement = {
      id: (++nextCashMovementId).toString(),
      type: 'income',
      amount: amountToReceive,
      description: `Recebimento: ${account.description}`,
      category: account.category,
      reference_type: 'accounts_receivable',
      reference_id: id,
      payment_method,
      user_id: 'admin',
      user_name: 'Administrador',
      created_at: new Date().toISOString()
    };

    cashMovements.push(cashMovement);

    res.json({
      success: true,
      message: 'Conta marcada como recebida',
      data: accountsReceivable[accountIndex],
      cash_movement: cashMovement,
      current_balance: calculateCashBalance()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// GET /api/financial/dashboard - Dashboard financeiro
app.get('/api/financial/dashboard', (req, res) => {
  try {
    const { period = '30' } = req.query;
    const periodDays = parseInt(period);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - periodDays);

    // Saldo atual
    const currentBalance = calculateCashBalance();

    // Contas a pagar
    const totalPayable = accountsPayable
      .filter(a => !a.paid)
      .reduce((sum, a) => sum + a.amount, 0);

    const overduePayable = accountsPayable.filter(a => {
      const today = new Date().toISOString().split('T')[0];
      return !a.paid && a.due_date < today;
    });

    // Contas a receber
    const totalReceivable = accountsReceivable
      .filter(a => !a.received)
      .reduce((sum, a) => sum + a.amount, 0);

    const overdueReceivable = accountsReceivable.filter(a => {
      const today = new Date().toISOString().split('T')[0];
      return !a.received && a.due_date < today;
    });

    // Movimentos do período
    const periodMovements = cashMovements.filter(m => 
      new Date(m.created_at) >= cutoffDate
    );

    const periodIncome = periodMovements
      .filter(m => m.type === 'income')
      .reduce((sum, m) => sum + m.amount, 0);

    const periodExpenses = periodMovements
      .filter(m => m.type === 'expense')
      .reduce((sum, m) => sum + m.amount, 0);

    // Fluxo de caixa por categoria
    const incomeByCategory = {};
    const expensesByCategory = {};

    periodMovements.forEach(movement => {
      if (movement.type === 'income') {
        incomeByCategory[movement.category] = 
          (incomeByCategory[movement.category] || 0) + movement.amount;
      } else {
        expensesByCategory[movement.category] = 
          (expensesByCategory[movement.category] || 0) + movement.amount;
      }
    });

    // Próximos vencimentos (7 dias)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    const upcomingPayable = accountsPayable.filter(a => 
      !a.paid && a.due_date >= today && a.due_date <= nextWeekStr
    );

    const upcomingReceivable = accountsReceivable.filter(a => 
      !a.received && a.due_date >= today && a.due_date <= nextWeekStr
    );

    res.json({
      success: true,
      data: {
        period_days: periodDays,
        current_balance: currentBalance,
        accounts_payable: {
          total_pending: totalPayable,
          overdue_count: overduePayable.length,
          overdue_amount: overduePayable.reduce((sum, a) => sum + a.amount, 0),
          upcoming_count: upcomingPayable.length,
          upcoming_amount: upcomingPayable.reduce((sum, a) => sum + a.amount, 0)
        },
        accounts_receivable: {
          total_pending: totalReceivable,
          overdue_count: overdueReceivable.length,
          overdue_amount: overdueReceivable.reduce((sum, a) => sum + a.amount, 0),
          upcoming_count: upcomingReceivable.length,
          upcoming_amount: upcomingReceivable.reduce((sum, a) => sum + a.amount, 0)
        },
        cash_flow: {
          period_income: periodIncome,
          period_expenses: periodExpenses,
          period_balance: periodIncome - periodExpenses,
          income_by_category: incomeByCategory,
          expenses_by_category: expensesByCategory
        },
        upcoming_due: {
          payable: upcomingPayable.map(a => ({
            id: a.id,
            supplier_name: a.supplier_name,
            description: a.description,
            amount: a.amount,
            due_date: a.due_date
          })),
          receivable: upcomingReceivable.map(a => ({
            id: a.id,
            client_name: a.client_name,
            description: a.description,
            amount: a.amount,
            due_date: a.due_date
          }))
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// GET /api/suppliers - Endpoint para listar fornecedores
app.get('/api/suppliers', (req, res) => {
  try {
    res.json({
      success: true,
      data: suppliers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// GET /api/clients - Endpoint para listar clientes
app.get('/api/clients', (req, res) => {
  try {
    res.json({
      success: true,
      data: clients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`💳 Servidor Financeiro rodando na porta ${PORT}`);
  console.log(`📋 Endpoints disponíveis:`);
  console.log(`   GET    /api/financial/accounts-payable - Listar contas a pagar`);
  console.log(`   GET    /api/financial/accounts-receivable - Listar contas a receber`);
  console.log(`   GET    /api/financial/cash-movements - Listar movimentos de caixa`);
  console.log(`   POST   /api/financial/accounts-payable - Criar conta a pagar`);
  console.log(`   POST   /api/financial/accounts-receivable - Criar conta a receber`);
  console.log(`   POST   /api/financial/cash-movements - Registrar movimento de caixa`);
  console.log(`   PATCH  /api/financial/accounts-payable/:id/pay - Marcar como paga`);
  console.log(`   PATCH  /api/financial/accounts-receivable/:id/receive - Marcar como recebida`);
  console.log(`   GET    /api/financial/dashboard - Dashboard financeiro`);
  console.log(`   GET    /api/suppliers - Listar fornecedores`);
  console.log(`   GET    /api/clients - Listar clientes`);
});

module.exports = app;