const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3010;

// Middleware
app.use(cors());
app.use(express.json());

// Dados simulados para demonstração
let serviceOrders = [
  {
    id: '1',
    number: 'OS-001',
    client_id: '1',
    client_name: 'João Silva',
    vehicle_id: '1',
    vehicle_plate: 'ABC-1234',
    vehicle_info: 'Honda CG 160 - 2020',
    mechanic_id: '1',
    mechanic_name: 'Carlos Mecânico',
    description_line_1: 'Troca de óleo do motor',
    description_line_2: 'Substituição do filtro de óleo',
    description_line_3: 'Verificação dos níveis de fluidos',
    description_line_4: 'Inspeção visual dos pneus',
    description_line_5: 'Teste de funcionamento dos freios',
    description_line_6: '',
    description_line_7: '',
    description_line_8: '',
    description_line_9: '',
    status: 'completed',
    priority: 'normal',
    estimated_completion: '2024-01-20T17:00:00Z',
    actual_completion: '2024-01-20T16:30:00Z',
    labor_cost: 50.00,
    parts_cost: 35.00,
    total_amount: 85.00,
    created_at: '2024-01-20T09:00:00Z',
    updated_at: '2024-01-20T16:30:00Z',
    created_by: 'admin',
    items: [
      {
        id: '1',
        product_id: '1',
        product_name: 'Óleo Motor 20W50',
        quantity: 1,
        unit_price: 25.00,
        total_price: 25.00
      },
      {
        id: '2',
        product_id: '2',
        product_name: 'Filtro de Óleo',
        quantity: 1,
        unit_price: 10.00,
        total_price: 10.00
      }
    ]
  },
  {
    id: '2',
    number: 'OS-002',
    client_id: '2',
    client_name: 'Maria Santos',
    vehicle_id: '2',
    vehicle_plate: 'XYZ-5678',
    vehicle_info: 'Yamaha Factor 125 - 2019',
    mechanic_id: '2',
    mechanic_name: 'Ana Técnica',
    description_line_1: 'Revisão geral dos 10.000km',
    description_line_2: 'Troca de óleo e filtros',
    description_line_3: 'Regulagem de freios',
    description_line_4: 'Verificação da corrente',
    description_line_5: 'Limpeza do carburador',
    description_line_6: 'Teste de funcionamento elétrico',
    description_line_7: '',
    description_line_8: '',
    description_line_9: '',
    status: 'in_progress',
    priority: 'high',
    estimated_completion: '2024-02-15T18:00:00Z',
    actual_completion: null,
    labor_cost: 80.00,
    parts_cost: 70.00,
    total_amount: 150.00,
    created_at: '2024-02-15T08:00:00Z',
    updated_at: '2024-02-15T14:30:00Z',
    created_by: 'admin',
    items: [
      {
        id: '3',
        product_id: '1',
        product_name: 'Óleo Motor 20W50',
        quantity: 1,
        unit_price: 25.00,
        total_price: 25.00
      },
      {
        id: '4',
        product_id: '3',
        product_name: 'Kit Filtros',
        quantity: 1,
        unit_price: 45.00,
        total_price: 45.00
      }
    ]
  }
];

// Status possíveis para OS
const validStatuses = [
  'pending',      // Pendente
  'in_progress',  // Em andamento
  'waiting_parts', // Aguardando peças
  'waiting_approval', // Aguardando aprovação
  'completed',    // Concluída
  'delivered',    // Entregue
  'cancelled'     // Cancelada
];

const validPriorities = ['low', 'normal', 'high', 'urgent'];

// Dados simulados de referência
let clients = [
  { id: '1', name: 'João Silva', phone: '(11) 99999-1111' },
  { id: '2', name: 'Maria Santos', phone: '(11) 99999-2222' },
  { id: '3', name: 'Pedro Costa', phone: '(11) 99999-3333' }
];

let vehicles = [
  { id: '1', plate: 'ABC-1234', brand: 'Honda', model: 'CG 160', year: 2020, client_id: '1' },
  { id: '2', plate: 'XYZ-5678', brand: 'Yamaha', model: 'Factor 125', year: 2019, client_id: '2' }
];

let mechanics = [
  { id: '1', name: 'Carlos Mecânico', specialties: ['Motor', 'Transmissão'], active: true },
  { id: '2', name: 'Ana Técnica', specialties: ['Elétrica', 'Freios'], active: true }
];

let products = [
  { id: '1', name: 'Óleo Motor 20W50', price: 25.00, stock: 50 },
  { id: '2', name: 'Filtro de Óleo', price: 10.00, stock: 30 },
  { id: '3', name: 'Kit Filtros', price: 45.00, stock: 20 }
];

let nextId = 3;
let nextNumber = 3;

// Função para gerar próximo número de OS
function generateNextOSNumber() {
  return `OS-${String(nextNumber++).padStart(3, '0')}`;
}

// Função para calcular totais da OS
function calculateTotals(items, laborCost = 0) {
  const partsCost = items.reduce((sum, item) => sum + item.total_price, 0);
  return {
    parts_cost: partsCost,
    labor_cost: laborCost,
    total_amount: partsCost + laborCost
  };
}

// Função para validar itens da OS
function validateItems(items) {
  if (!Array.isArray(items)) return false;
  
  return items.every(item => 
    item.product_id && 
    item.quantity > 0 && 
    item.unit_price >= 0
  );
}

// GET /api/service-orders - Listar todas as OS
app.get('/api/service-orders', (req, res) => {
  try {
    const { 
      status, 
      mechanic_id, 
      client_id, 
      vehicle_id,
      priority,
      date_from, 
      date_to,
      search 
    } = req.query;
    
    let filteredOrders = [...serviceOrders];

    // Filtro por status
    if (status) {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }

    // Filtro por mecânico
    if (mechanic_id) {
      filteredOrders = filteredOrders.filter(order => order.mechanic_id === mechanic_id);
    }

    // Filtro por cliente
    if (client_id) {
      filteredOrders = filteredOrders.filter(order => order.client_id === client_id);
    }

    // Filtro por veículo
    if (vehicle_id) {
      filteredOrders = filteredOrders.filter(order => order.vehicle_id === vehicle_id);
    }

    // Filtro por prioridade
    if (priority) {
      filteredOrders = filteredOrders.filter(order => order.priority === priority);
    }

    // Filtro por período
    if (date_from) {
      filteredOrders = filteredOrders.filter(order => 
        new Date(order.created_at) >= new Date(date_from)
      );
    }
    if (date_to) {
      filteredOrders = filteredOrders.filter(order => 
        new Date(order.created_at) <= new Date(date_to)
      );
    }

    // Busca geral
    if (search) {
      const searchLower = search.toLowerCase();
      filteredOrders = filteredOrders.filter(order =>
        order.number.toLowerCase().includes(searchLower) ||
        order.client_name.toLowerCase().includes(searchLower) ||
        order.vehicle_plate.toLowerCase().includes(searchLower) ||
        order.mechanic_name.toLowerCase().includes(searchLower) ||
        (order.description_line_1 && order.description_line_1.toLowerCase().includes(searchLower))
      );
    }

    // Ordenar por data de criação (mais recentes primeiro)
    filteredOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({
      success: true,
      data: filteredOrders,
      total: filteredOrders.length,
      filters_applied: {
        status, mechanic_id, client_id, vehicle_id, priority, date_from, date_to, search
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

// GET /api/service-orders/:id - Buscar OS por ID
app.get('/api/service-orders/:id', (req, res) => {
  try {
    const { id } = req.params;
    const order = serviceOrders.find(o => o.id === id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Ordem de serviço não encontrada'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// GET /api/service-orders/number/:number - Buscar OS por número
app.get('/api/service-orders/number/:number', (req, res) => {
  try {
    const { number } = req.params;
    const order = serviceOrders.find(o => 
      o.number.toLowerCase() === number.toLowerCase()
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Ordem de serviço não encontrada'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// POST /api/service-orders - Criar nova OS
app.post('/api/service-orders', (req, res) => {
  try {
    const {
      client_id,
      vehicle_id,
      mechanic_id,
      description_line_1,
      description_line_2,
      description_line_3,
      description_line_4,
      description_line_5,
      description_line_6,
      description_line_7,
      description_line_8,
      description_line_9,
      priority = 'normal',
      estimated_completion,
      labor_cost = 0,
      items = []
    } = req.body;

    // Validações obrigatórias
    if (!client_id || !vehicle_id || !mechanic_id || !description_line_1) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: client_id, vehicle_id, mechanic_id, description_line_1',
        required_fields: ['client_id', 'vehicle_id', 'mechanic_id', 'description_line_1']
      });
    }

    // Validar prioridade
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Prioridade inválida',
        valid_priorities: validPriorities
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

    // Verificar se veículo existe e pertence ao cliente
    const vehicle = vehicles.find(v => v.id === vehicle_id);
    if (!vehicle) {
      return res.status(400).json({
        success: false,
        message: 'Veículo não encontrado'
      });
    }
    if (vehicle.client_id !== client_id) {
      return res.status(400).json({
        success: false,
        message: 'Veículo não pertence ao cliente informado'
      });
    }

    // Verificar se mecânico existe e está ativo
    const mechanic = mechanics.find(m => m.id === mechanic_id);
    if (!mechanic) {
      return res.status(400).json({
        success: false,
        message: 'Mecânico não encontrado'
      });
    }
    if (!mechanic.active) {
      return res.status(400).json({
        success: false,
        message: 'Mecânico não está ativo'
      });
    }

    // Validar itens se fornecidos
    if (items.length > 0 && !validateItems(items)) {
      return res.status(400).json({
        success: false,
        message: 'Itens inválidos. Verifique product_id, quantity e unit_price'
      });
    }

    // Processar itens e calcular preços
    const processedItems = items.map((item, index) => {
      const product = products.find(p => p.id === item.product_id);
      return {
        id: (index + 1).toString(),
        product_id: item.product_id,
        product_name: product ? product.name : 'Produto não encontrado',
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price
      };
    });

    // Calcular totais
    const totals = calculateTotals(processedItems, labor_cost);

    // Criar nova OS
    const newOrder = {
      id: (++nextId).toString(),
      number: generateNextOSNumber(),
      client_id,
      client_name: client.name,
      vehicle_id,
      vehicle_plate: vehicle.plate,
      vehicle_info: `${vehicle.brand} ${vehicle.model} - ${vehicle.year}`,
      mechanic_id,
      mechanic_name: mechanic.name,
      description_line_1: description_line_1 || '',
      description_line_2: description_line_2 || '',
      description_line_3: description_line_3 || '',
      description_line_4: description_line_4 || '',
      description_line_5: description_line_5 || '',
      description_line_6: description_line_6 || '',
      description_line_7: description_line_7 || '',
      description_line_8: description_line_8 || '',
      description_line_9: description_line_9 || '',
      status: 'pending',
      priority,
      estimated_completion,
      actual_completion: null,
      labor_cost: totals.labor_cost,
      parts_cost: totals.parts_cost,
      total_amount: totals.total_amount,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'admin', // TODO: pegar do token JWT
      items: processedItems
    };

    serviceOrders.push(newOrder);

    res.status(201).json({
      success: true,
      message: 'Ordem de serviço criada com sucesso',
      data: newOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// PUT /api/service-orders/:id - Atualizar OS
app.put('/api/service-orders/:id', (req, res) => {
  try {
    const { id } = req.params;
    const orderIndex = serviceOrders.findIndex(o => o.id === id);

    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Ordem de serviço não encontrada'
      });
    }

    const currentOrder = serviceOrders[orderIndex];
    
    // Não permitir edição de OS entregues ou canceladas
    if (['delivered', 'cancelled'].includes(currentOrder.status)) {
      return res.status(409).json({
        success: false,
        message: 'Não é possível editar ordem de serviço entregue ou cancelada'
      });
    }

    const {
      client_id,
      vehicle_id,
      mechanic_id,
      description_line_1,
      description_line_2,
      description_line_3,
      description_line_4,
      description_line_5,
      description_line_6,
      description_line_7,
      description_line_8,
      description_line_9,
      priority,
      estimated_completion,
      labor_cost,
      items
    } = req.body;

    // Validações se campos foram fornecidos
    if (client_id) {
      const client = clients.find(c => c.id === client_id);
      if (!client) {
        return res.status(400).json({
          success: false,
          message: 'Cliente não encontrado'
        });
      }
    }

    if (vehicle_id) {
      const vehicle = vehicles.find(v => v.id === vehicle_id);
      if (!vehicle) {
        return res.status(400).json({
          success: false,
          message: 'Veículo não encontrado'
        });
      }
      if (client_id && vehicle.client_id !== client_id) {
        return res.status(400).json({
          success: false,
          message: 'Veículo não pertence ao cliente informado'
        });
      }
    }

    if (mechanic_id) {
      const mechanic = mechanics.find(m => m.id === mechanic_id);
      if (!mechanic || !mechanic.active) {
        return res.status(400).json({
          success: false,
          message: 'Mecânico não encontrado ou inativo'
        });
      }
    }

    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Prioridade inválida',
        valid_priorities: validPriorities
      });
    }

    if (items && !validateItems(items)) {
      return res.status(400).json({
        success: false,
        message: 'Itens inválidos'
      });
    }

    // Atualizar campos fornecidos
    const updatedOrder = { ...currentOrder };

    if (client_id) {
      const client = clients.find(c => c.id === client_id);
      updatedOrder.client_id = client_id;
      updatedOrder.client_name = client.name;
    }

    if (vehicle_id) {
      const vehicle = vehicles.find(v => v.id === vehicle_id);
      updatedOrder.vehicle_id = vehicle_id;
      updatedOrder.vehicle_plate = vehicle.plate;
      updatedOrder.vehicle_info = `${vehicle.brand} ${vehicle.model} - ${vehicle.year}`;
    }

    if (mechanic_id) {
      const mechanic = mechanics.find(m => m.id === mechanic_id);
      updatedOrder.mechanic_id = mechanic_id;
      updatedOrder.mechanic_name = mechanic.name;
    }

    // Atualizar descrições
    if (description_line_1 !== undefined) updatedOrder.description_line_1 = description_line_1;
    if (description_line_2 !== undefined) updatedOrder.description_line_2 = description_line_2;
    if (description_line_3 !== undefined) updatedOrder.description_line_3 = description_line_3;
    if (description_line_4 !== undefined) updatedOrder.description_line_4 = description_line_4;
    if (description_line_5 !== undefined) updatedOrder.description_line_5 = description_line_5;
    if (description_line_6 !== undefined) updatedOrder.description_line_6 = description_line_6;
    if (description_line_7 !== undefined) updatedOrder.description_line_7 = description_line_7;
    if (description_line_8 !== undefined) updatedOrder.description_line_8 = description_line_8;
    if (description_line_9 !== undefined) updatedOrder.description_line_9 = description_line_9;

    if (priority) updatedOrder.priority = priority;
    if (estimated_completion) updatedOrder.estimated_completion = estimated_completion;

    // Atualizar itens e recalcular totais
    if (items) {
      const processedItems = items.map((item, index) => {
        const product = products.find(p => p.id === item.product_id);
        return {
          id: (index + 1).toString(),
          product_id: item.product_id,
          product_name: product ? product.name : 'Produto não encontrado',
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price
        };
      });

      updatedOrder.items = processedItems;
      const totals = calculateTotals(processedItems, labor_cost || updatedOrder.labor_cost);
      updatedOrder.parts_cost = totals.parts_cost;
      updatedOrder.total_amount = totals.total_amount;
    }

    if (labor_cost !== undefined) {
      updatedOrder.labor_cost = labor_cost;
      const totals = calculateTotals(updatedOrder.items, labor_cost);
      updatedOrder.total_amount = totals.total_amount;
    }

    updatedOrder.updated_at = new Date().toISOString();

    serviceOrders[orderIndex] = updatedOrder;

    res.json({
      success: true,
      message: 'Ordem de serviço atualizada com sucesso',
      data: updatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// PATCH /api/service-orders/:id/status - Atualizar apenas status da OS
app.patch('/api/service-orders/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const orderIndex = serviceOrders.findIndex(o => o.id === id);
    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Ordem de serviço não encontrada'
      });
    }

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status inválido',
        valid_statuses: validStatuses
      });
    }

    const currentOrder = serviceOrders[orderIndex];
    const oldStatus = currentOrder.status;

    // Regras de transição de status
    const statusTransitions = {
      'pending': ['in_progress', 'cancelled'],
      'in_progress': ['waiting_parts', 'waiting_approval', 'completed', 'cancelled'],
      'waiting_parts': ['in_progress', 'cancelled'],
      'waiting_approval': ['in_progress', 'completed', 'cancelled'],
      'completed': ['delivered'],
      'delivered': [], // Status final
      'cancelled': []  // Status final
    };

    if (!statusTransitions[oldStatus].includes(status)) {
      return res.status(409).json({
        success: false,
        message: `Transição de status inválida: ${oldStatus} -> ${status}`,
        allowed_transitions: statusTransitions[oldStatus]
      });
    }

    // Atualizar status
    serviceOrders[orderIndex].status = status;
    serviceOrders[orderIndex].updated_at = new Date().toISOString();

    // Se completada, registrar data de conclusão
    if (status === 'completed' && !serviceOrders[orderIndex].actual_completion) {
      serviceOrders[orderIndex].actual_completion = new Date().toISOString();
    }

    // TODO: Implementar baixa automática no estoque quando status = 'completed'
    if (status === 'completed') {
      // Simular baixa no estoque
      serviceOrders[orderIndex].items.forEach(item => {
        const product = products.find(p => p.id === item.product_id);
        if (product) {
          product.stock -= item.quantity;
        }
      });
    }

    res.json({
      success: true,
      message: `Status alterado de ${oldStatus} para ${status}`,
      data: {
        id: serviceOrders[orderIndex].id,
        number: serviceOrders[orderIndex].number,
        old_status: oldStatus,
        new_status: status,
        updated_at: serviceOrders[orderIndex].updated_at,
        notes
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

// DELETE /api/service-orders/:id - Excluir OS
app.delete('/api/service-orders/:id', (req, res) => {
  try {
    const { id } = req.params;
    const orderIndex = serviceOrders.findIndex(o => o.id === id);

    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Ordem de serviço não encontrada'
      });
    }

    const order = serviceOrders[orderIndex];

    // Não permitir exclusão de OS em andamento ou concluídas
    if (['in_progress', 'completed', 'delivered'].includes(order.status)) {
      return res.status(409).json({
        success: false,
        message: 'Não é possível excluir ordem de serviço em andamento, concluída ou entregue'
      });
    }

    serviceOrders.splice(orderIndex, 1);

    res.json({
      success: true,
      message: 'Ordem de serviço excluída com sucesso',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// GET /api/service-orders/reports/summary - Relatório resumo de OS
app.get('/api/service-orders/reports/summary', (req, res) => {
  try {
    const { period = '30' } = req.query; // Período em dias
    const periodDays = parseInt(period);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - periodDays);

    const recentOrders = serviceOrders.filter(order => 
      new Date(order.created_at) >= cutoffDate
    );

    // Estatísticas por status
    const statusStats = {};
    validStatuses.forEach(status => {
      statusStats[status] = serviceOrders.filter(o => o.status === status).length;
    });

    // Estatísticas por mecânico
    const mechanicStats = {};
    serviceOrders.forEach(order => {
      mechanicStats[order.mechanic_name] = (mechanicStats[order.mechanic_name] || 0) + 1;
    });

    // Estatísticas por prioridade
    const priorityStats = {};
    validPriorities.forEach(priority => {
      priorityStats[priority] = serviceOrders.filter(o => o.priority === priority).length;
    });

    // Receita total
    const totalRevenue = serviceOrders
      .filter(o => o.status === 'completed' || o.status === 'delivered')
      .reduce((sum, o) => sum + o.total_amount, 0);

    // OS em atraso (estimativa passou e não foi concluída)
    const overdueOrders = serviceOrders.filter(order => 
      order.estimated_completion &&
      new Date(order.estimated_completion) < new Date() &&
      !['completed', 'delivered', 'cancelled'].includes(order.status)
    );

    // Tempo médio de conclusão
    const completedOrders = serviceOrders.filter(o => 
      o.status === 'completed' && o.actual_completion
    );
    
    let averageCompletionTime = 0;
    if (completedOrders.length > 0) {
      const totalTime = completedOrders.reduce((sum, order) => {
        const start = new Date(order.created_at);
        const end = new Date(order.actual_completion);
        return sum + (end - start);
      }, 0);
      averageCompletionTime = Math.round(totalTime / completedOrders.length / (1000 * 60 * 60)); // em horas
    }

    res.json({
      success: true,
      data: {
        period_days: periodDays,
        total_orders: serviceOrders.length,
        recent_orders: recentOrders.length,
        status_distribution: statusStats,
        mechanic_distribution: mechanicStats,
        priority_distribution: priorityStats,
        total_revenue: totalRevenue,
        overdue_orders: {
          count: overdueOrders.length,
          orders: overdueOrders.map(o => ({
            id: o.id,
            number: o.number,
            client_name: o.client_name,
            estimated_completion: o.estimated_completion,
            days_overdue: Math.ceil((new Date() - new Date(o.estimated_completion)) / (1000 * 60 * 60 * 24))
          }))
        },
        average_completion_time_hours: averageCompletionTime,
        completed_orders_count: completedOrders.length
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

// GET /api/vehicles - Endpoint para listar veículos
app.get('/api/vehicles', (req, res) => {
  try {
    const { client_id } = req.query;
    let filteredVehicles = vehicles;
    
    if (client_id) {
      filteredVehicles = vehicles.filter(v => v.client_id === client_id);
    }
    
    res.json({
      success: true,
      data: filteredVehicles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// GET /api/mechanics - Endpoint para listar mecânicos
app.get('/api/mechanics', (req, res) => {
  try {
    const activeMechanics = mechanics.filter(m => m.active);
    res.json({
      success: true,
      data: activeMechanics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// GET /api/products - Endpoint para listar produtos
app.get('/api/products', (req, res) => {
  try {
    res.json({
      success: true,
      data: products
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
  console.log(`🔧 Servidor de Ordens de Serviço rodando na porta ${PORT}`);
  console.log(`📋 Endpoints disponíveis:`);
  console.log(`   GET    /api/service-orders - Listar OS`);
  console.log(`   GET    /api/service-orders/:id - Buscar OS por ID`);
  console.log(`   GET    /api/service-orders/number/:number - Buscar OS por número`);
  console.log(`   POST   /api/service-orders - Criar OS`);
  console.log(`   PUT    /api/service-orders/:id - Atualizar OS`);
  console.log(`   PATCH  /api/service-orders/:id/status - Atualizar status`);
  console.log(`   DELETE /api/service-orders/:id - Excluir OS`);
  console.log(`   GET    /api/service-orders/reports/summary - Relatório resumo`);
  console.log(`   GET    /api/clients - Listar clientes`);
  console.log(`   GET    /api/vehicles - Listar veículos`);
  console.log(`   GET    /api/mechanics - Listar mecânicos`);
  console.log(`   GET    /api/products - Listar produtos`);
});

module.exports = app;