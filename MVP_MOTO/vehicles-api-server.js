const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3007;

// Middleware
app.use(cors());
app.use(express.json());

// Dados simulados para demonstração
let vehicles = [
  {
    id: '1',
    plate: 'ABC-1234',
    brand: 'Honda',
    model: 'CG 160',
    year: 2020,
    client_id: '1',
    client_name: 'João Silva',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    plate: 'XYZ-5678',
    brand: 'Yamaha',
    model: 'Factor 125',
    year: 2019,
    client_id: '2',
    client_name: 'Maria Santos',
    created_at: '2024-01-16T11:30:00Z',
    updated_at: '2024-01-16T11:30:00Z'
  }
];

// Histórico de serviços simulado
let serviceHistory = [
  {
    id: '1',
    vehicle_id: '1',
    service_order_number: 'OS-001',
    date: '2024-01-20T09:00:00Z',
    description: 'Troca de óleo e filtro',
    mechanic: 'Carlos Mecânico',
    status: 'completed',
    total: 85.00
  },
  {
    id: '2',
    vehicle_id: '1',
    service_order_number: 'OS-015',
    date: '2024-02-15T14:30:00Z',
    description: 'Revisão geral - 10.000km',
    mechanic: 'Ana Técnica',
    status: 'completed',
    total: 150.00
  }
];

// Clientes simulados para vinculação
let clients = [
  { id: '1', name: 'João Silva', cpf: '123.456.789-01' },
  { id: '2', name: 'Maria Santos', cpf: '987.654.321-02' },
  { id: '3', name: 'Pedro Costa', cpf: '456.789.123-03' }
];

let nextId = 3;

// Função para validar placa brasileira
function validatePlate(plate) {
  // Formato antigo: ABC-1234 ou novo: ABC1D23
  const oldFormat = /^[A-Z]{3}-\d{4}$/;
  const newFormat = /^[A-Z]{3}\d[A-Z]\d{2}$/;
  return oldFormat.test(plate) || newFormat.test(plate);
}

// Função para validar ano
function validateYear(year) {
  const currentYear = new Date().getFullYear();
  return year >= 1980 && year <= currentYear + 1;
}

// GET /api/vehicles - Listar todos os veículos
app.get('/api/vehicles', (req, res) => {
  try {
    const { search, client_id, brand, year } = req.query;
    let filteredVehicles = [...vehicles];

    // Filtro por busca geral (placa, marca, modelo)
    if (search) {
      const searchLower = search.toLowerCase();
      filteredVehicles = filteredVehicles.filter(vehicle =>
        vehicle.plate.toLowerCase().includes(searchLower) ||
        vehicle.brand.toLowerCase().includes(searchLower) ||
        vehicle.model.toLowerCase().includes(searchLower) ||
        vehicle.client_name.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por cliente
    if (client_id) {
      filteredVehicles = filteredVehicles.filter(vehicle => 
        vehicle.client_id === client_id
      );
    }

    // Filtro por marca
    if (brand) {
      filteredVehicles = filteredVehicles.filter(vehicle => 
        vehicle.brand.toLowerCase().includes(brand.toLowerCase())
      );
    }

    // Filtro por ano
    if (year) {
      filteredVehicles = filteredVehicles.filter(vehicle => 
        vehicle.year.toString() === year.toString()
      );
    }

    res.json({
      success: true,
      data: filteredVehicles,
      total: filteredVehicles.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// GET /api/vehicles/:id - Buscar veículo por ID
app.get('/api/vehicles/:id', (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = vehicles.find(v => v.id === id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Veículo não encontrado'
      });
    }

    // Buscar histórico de serviços
    const history = serviceHistory.filter(h => h.vehicle_id === id);

    res.json({
      success: true,
      data: {
        ...vehicle,
        service_history: history
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

// GET /api/vehicles/plate/:plate - Buscar veículo por placa
app.get('/api/vehicles/plate/:plate', (req, res) => {
  try {
    const { plate } = req.params;
    const vehicle = vehicles.find(v => 
      v.plate.toLowerCase() === plate.toLowerCase()
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Veículo não encontrado'
      });
    }

    // Buscar histórico de serviços
    const history = serviceHistory.filter(h => h.vehicle_id === vehicle.id);

    res.json({
      success: true,
      data: {
        ...vehicle,
        service_history: history
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

// POST /api/vehicles - Criar novo veículo
app.post('/api/vehicles', (req, res) => {
  try {
    const { plate, brand, model, year, client_id } = req.body;

    // Validações
    if (!plate || !brand || !model || !year || !client_id) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos são obrigatórios',
        required_fields: ['plate', 'brand', 'model', 'year', 'client_id']
      });
    }

    // Validar formato da placa
    if (!validatePlate(plate.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Formato de placa inválido. Use ABC-1234 ou ABC1D23'
      });
    }

    // Validar ano
    if (!validateYear(year)) {
      return res.status(400).json({
        success: false,
        message: 'Ano deve estar entre 1980 e o próximo ano'
      });
    }

    // Verificar se placa já existe
    const existingVehicle = vehicles.find(v => 
      v.plate.toLowerCase() === plate.toLowerCase()
    );
    if (existingVehicle) {
      return res.status(409).json({
        success: false,
        message: 'Já existe um veículo cadastrado com esta placa'
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

    // Criar novo veículo
    const newVehicle = {
      id: (++nextId).toString(),
      plate: plate.toUpperCase(),
      brand: brand.trim(),
      model: model.trim(),
      year: parseInt(year),
      client_id,
      client_name: client.name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    vehicles.push(newVehicle);

    res.status(201).json({
      success: true,
      message: 'Veículo cadastrado com sucesso',
      data: newVehicle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// PUT /api/vehicles/:id - Atualizar veículo
app.put('/api/vehicles/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { plate, brand, model, year, client_id } = req.body;

    const vehicleIndex = vehicles.findIndex(v => v.id === id);
    if (vehicleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Veículo não encontrado'
      });
    }

    // Validações
    if (!plate || !brand || !model || !year || !client_id) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos são obrigatórios',
        required_fields: ['plate', 'brand', 'model', 'year', 'client_id']
      });
    }

    // Validar formato da placa
    if (!validatePlate(plate.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Formato de placa inválido. Use ABC-1234 ou ABC1D23'
      });
    }

    // Validar ano
    if (!validateYear(year)) {
      return res.status(400).json({
        success: false,
        message: 'Ano deve estar entre 1980 e o próximo ano'
      });
    }

    // Verificar se placa já existe (exceto no próprio veículo)
    const existingVehicle = vehicles.find(v => 
      v.plate.toLowerCase() === plate.toLowerCase() && v.id !== id
    );
    if (existingVehicle) {
      return res.status(409).json({
        success: false,
        message: 'Já existe outro veículo cadastrado com esta placa'
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

    // Atualizar veículo
    vehicles[vehicleIndex] = {
      ...vehicles[vehicleIndex],
      plate: plate.toUpperCase(),
      brand: brand.trim(),
      model: model.trim(),
      year: parseInt(year),
      client_id,
      client_name: client.name,
      updated_at: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Veículo atualizado com sucesso',
      data: vehicles[vehicleIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// DELETE /api/vehicles/:id - Excluir veículo
app.delete('/api/vehicles/:id', (req, res) => {
  try {
    const { id } = req.params;
    const vehicleIndex = vehicles.findIndex(v => v.id === id);

    if (vehicleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Veículo não encontrado'
      });
    }

    // Verificar se há ordens de serviço vinculadas
    const hasServiceOrders = serviceHistory.some(h => h.vehicle_id === id);
    if (hasServiceOrders) {
      return res.status(409).json({
        success: false,
        message: 'Não é possível excluir veículo com histórico de serviços'
      });
    }

    const deletedVehicle = vehicles[vehicleIndex];
    vehicles.splice(vehicleIndex, 1);

    res.json({
      success: true,
      message: 'Veículo excluído com sucesso',
      data: deletedVehicle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// GET /api/vehicles/:id/history - Histórico de serviços do veículo
app.get('/api/vehicles/:id/history', (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se veículo existe
    const vehicle = vehicles.find(v => v.id === id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Veículo não encontrado'
      });
    }

    const history = serviceHistory.filter(h => h.vehicle_id === id);

    res.json({
      success: true,
      data: {
        vehicle: vehicle,
        history: history,
        total_services: history.length,
        total_spent: history.reduce((sum, h) => sum + h.total, 0)
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

// GET /api/clients - Endpoint para listar clientes (para vinculação)
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

// GET /api/vehicles/reports/summary - Relatório resumo de veículos
app.get('/api/vehicles/reports/summary', (req, res) => {
  try {
    const totalVehicles = vehicles.length;
    const brandStats = {};
    const yearStats = {};

    vehicles.forEach(vehicle => {
      // Estatísticas por marca
      brandStats[vehicle.brand] = (brandStats[vehicle.brand] || 0) + 1;
      
      // Estatísticas por ano
      yearStats[vehicle.year] = (yearStats[vehicle.year] || 0) + 1;
    });

    // Veículos com mais serviços
    const vehicleServiceCount = {};
    serviceHistory.forEach(service => {
      vehicleServiceCount[service.vehicle_id] = 
        (vehicleServiceCount[service.vehicle_id] || 0) + 1;
    });

    const topServicedVehicles = Object.entries(vehicleServiceCount)
      .map(([vehicleId, count]) => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        return vehicle ? { ...vehicle, service_count: count } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.service_count - a.service_count)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        total_vehicles: totalVehicles,
        brand_distribution: brandStats,
        year_distribution: yearStats,
        top_serviced_vehicles: topServicedVehicles,
        average_year: Math.round(
          vehicles.reduce((sum, v) => sum + v.year, 0) / totalVehicles
        )
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
  console.log(`🚗 Servidor de Veículos rodando na porta ${PORT}`);
  console.log(`📋 Endpoints disponíveis:`);
  console.log(`   GET    /api/vehicles - Listar veículos`);
  console.log(`   GET    /api/vehicles/:id - Buscar por ID`);
  console.log(`   GET    /api/vehicles/plate/:plate - Buscar por placa`);
  console.log(`   POST   /api/vehicles - Criar veículo`);
  console.log(`   PUT    /api/vehicles/:id - Atualizar veículo`);
  console.log(`   DELETE /api/vehicles/:id - Excluir veículo`);
  console.log(`   GET    /api/vehicles/:id/history - Histórico de serviços`);
  console.log(`   GET    /api/vehicles/reports/summary - Relatório resumo`);
  console.log(`   GET    /api/clients - Listar clientes`);
});

module.exports = app;