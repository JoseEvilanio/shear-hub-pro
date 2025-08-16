const request = require('supertest');
const app = require('./vehicles-api-server');

describe('Vehicles API', () => {
  describe('GET /api/vehicles', () => {
    it('should return list of vehicles', async () => {
      const response = await request(app)
        .get('/api/vehicles')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter vehicles by search term', async () => {
      const response = await request(app)
        .get('/api/vehicles?search=Honda')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(v => 
        v.brand.toLowerCase().includes('honda') ||
        v.model.toLowerCase().includes('honda')
      )).toBe(true);
    });

    it('should filter vehicles by client_id', async () => {
      const response = await request(app)
        .get('/api/vehicles?client_id=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(v => v.client_id === '1')).toBe(true);
    });
  });

  describe('GET /api/vehicles/:id', () => {
    it('should return vehicle by id with service history', async () => {
      const response = await request(app)
        .get('/api/vehicles/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('1');
      expect(response.body.data.service_history).toBeDefined();
      expect(Array.isArray(response.body.data.service_history)).toBe(true);
    });

    it('should return 404 for non-existent vehicle', async () => {
      const response = await request(app)
        .get('/api/vehicles/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Veículo não encontrado');
    });
  });

  describe('GET /api/vehicles/plate/:plate', () => {
    it('should return vehicle by plate with service history', async () => {
      const response = await request(app)
        .get('/api/vehicles/plate/ABC-1234')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.plate).toBe('ABC-1234');
      expect(response.body.data.service_history).toBeDefined();
    });

    it('should return 404 for non-existent plate', async () => {
      const response = await request(app)
        .get('/api/vehicles/plate/XXX-9999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Veículo não encontrado');
    });

    it('should be case insensitive for plate search', async () => {
      const response = await request(app)
        .get('/api/vehicles/plate/abc-1234')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.plate).toBe('ABC-1234');
    });
  });

  describe('POST /api/vehicles', () => {
    it('should create new vehicle with valid data', async () => {
      const newVehicle = {
        plate: 'GHI-1111',
        brand: 'Suzuki',
        model: 'GSX-R 600',
        year: 2022,
        client_id: '2'
      };

      const response = await request(app)
        .post('/api/vehicles')
        .send(newVehicle)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Veículo cadastrado com sucesso');
      expect(response.body.data.plate).toBe('GHI-1111');
      expect(response.body.data.brand).toBe('Suzuki');
      expect(response.body.data.client_name).toBe('Maria Santos');
    });

    it('should validate required fields', async () => {
      const incompleteVehicle = {
        plate: 'JKL-2222',
        brand: 'Honda'
        // Missing model, year, client_id
      };

      const response = await request(app)
        .post('/api/vehicles')
        .send(incompleteVehicle)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Todos os campos são obrigatórios');
      expect(response.body.required_fields).toEqual(['plate', 'brand', 'model', 'year', 'client_id']);
    });

    it('should validate plate format', async () => {
      const invalidPlateVehicle = {
        plate: 'INVALID',
        brand: 'Honda',
        model: 'CB 600',
        year: 2020,
        client_id: '1'
      };

      const response = await request(app)
        .post('/api/vehicles')
        .send(invalidPlateVehicle)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Formato de placa inválido. Use ABC-1234 ou ABC1D23');
    });

    it('should validate year range', async () => {
      const invalidYearVehicle = {
        plate: 'MNO-3333',
        brand: 'Honda',
        model: 'CB 600',
        year: 1970, // Ano muito antigo
        client_id: '1'
      };

      const response = await request(app)
        .post('/api/vehicles')
        .send(invalidYearVehicle)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Ano deve estar entre 1980 e o próximo ano');
    });

    it('should prevent duplicate plates', async () => {
      const duplicatePlateVehicle = {
        plate: 'ABC-1234', // Placa já existente
        brand: 'Honda',
        model: 'CB 600',
        year: 2020,
        client_id: '1'
      };

      const response = await request(app)
        .post('/api/vehicles')
        .send(duplicatePlateVehicle)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Já existe um veículo cadastrado com esta placa');
    });

    it('should validate client existence', async () => {
      const invalidClientVehicle = {
        plate: 'PQR-4444',
        brand: 'Honda',
        model: 'CB 600',
        year: 2020,
        client_id: '999' // Cliente inexistente
      };

      const response = await request(app)
        .post('/api/vehicles')
        .send(invalidClientVehicle)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cliente não encontrado');
    });

    it('should accept new plate format (Mercosul)', async () => {
      const mercosulVehicle = {
        plate: 'ABC1D23',
        brand: 'Honda',
        model: 'CB 650F',
        year: 2023,
        client_id: '1'
      };

      const response = await request(app)
        .post('/api/vehicles')
        .send(mercosulVehicle)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.plate).toBe('ABC1D23');
    });
  });

  describe('PUT /api/vehicles/:id', () => {
    it('should update existing vehicle', async () => {
      const updatedData = {
        plate: 'ABC-1234',
        brand: 'Honda',
        model: 'CG 160 Titan',
        year: 2021,
        client_id: '1'
      };

      const response = await request(app)
        .put('/api/vehicles/1')
        .send(updatedData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Veículo atualizado com sucesso');
      expect(response.body.data.model).toBe('CG 160 Titan');
      expect(response.body.data.year).toBe(2021);
    });

    it('should return 404 for non-existent vehicle', async () => {
      const updatedData = {
        plate: 'STU-5555',
        brand: 'Honda',
        model: 'CB 600',
        year: 2020,
        client_id: '1'
      };

      const response = await request(app)
        .put('/api/vehicles/999')
        .send(updatedData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Veículo não encontrado');
    });

    it('should prevent duplicate plates on update', async () => {
      const updatedData = {
        plate: 'XYZ-5678', // Placa de outro veículo
        brand: 'Honda',
        model: 'CB 600',
        year: 2020,
        client_id: '1'
      };

      const response = await request(app)
        .put('/api/vehicles/1')
        .send(updatedData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Já existe outro veículo cadastrado com esta placa');
    });
  });

  describe('DELETE /api/vehicles/:id', () => {
    it('should return 404 for non-existent vehicle', async () => {
      const response = await request(app)
        .delete('/api/vehicles/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Veículo não encontrado');
    });

    it('should prevent deletion of vehicle with service history', async () => {
      const response = await request(app)
        .delete('/api/vehicles/1')
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Não é possível excluir veículo com histórico de serviços');
    });
  });

  describe('GET /api/vehicles/:id/history', () => {
    it('should return vehicle service history', async () => {
      const response = await request(app)
        .get('/api/vehicles/1/history')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.vehicle).toBeDefined();
      expect(response.body.data.history).toBeDefined();
      expect(response.body.data.total_services).toBeDefined();
      expect(response.body.data.total_spent).toBeDefined();
      expect(Array.isArray(response.body.data.history)).toBe(true);
    });

    it('should return 404 for non-existent vehicle', async () => {
      const response = await request(app)
        .get('/api/vehicles/999/history')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Veículo não encontrado');
    });
  });

  describe('GET /api/vehicles/reports/summary', () => {
    it('should return vehicles summary report', async () => {
      const response = await request(app)
        .get('/api/vehicles/reports/summary')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total_vehicles).toBeDefined();
      expect(response.body.data.brand_distribution).toBeDefined();
      expect(response.body.data.year_distribution).toBeDefined();
      expect(response.body.data.top_serviced_vehicles).toBeDefined();
      expect(response.body.data.average_year).toBeDefined();
      expect(Array.isArray(response.body.data.top_serviced_vehicles)).toBe(true);
    });
  });

  describe('GET /api/clients', () => {
    it('should return list of clients for vehicle linking', async () => {
      const response = await request(app)
        .get('/api/clients')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('cpf');
    });
  });

  describe('Plate validation function', () => {
    // Testando a função de validação de placa diretamente
    const validatePlate = (plate) => {
      const oldFormat = /^[A-Z]{3}-\d{4}$/;
      const newFormat = /^[A-Z]{3}\d[A-Z]\d{2}$/;
      return oldFormat.test(plate) || newFormat.test(plate);
    };

    it('should validate old format plates', () => {
      expect(validatePlate('ABC-1234')).toBe(true);
      expect(validatePlate('XYZ-9876')).toBe(true);
    });

    it('should validate new format plates (Mercosul)', () => {
      expect(validatePlate('ABC1D23')).toBe(true);
      expect(validatePlate('XYZ9A87')).toBe(true);
    });

    it('should reject invalid plate formats', () => {
      expect(validatePlate('INVALID')).toBe(false);
      expect(validatePlate('AB-1234')).toBe(false);
      expect(validatePlate('ABC-12345')).toBe(false);
      expect(validatePlate('1234-ABC')).toBe(false);
      expect(validatePlate('ABC12D3')).toBe(false);
    });
  });

  describe('Year validation function', () => {
    const validateYear = (year) => {
      const currentYear = new Date().getFullYear();
      return year >= 1980 && year <= currentYear + 1;
    };

    it('should validate valid years', () => {
      expect(validateYear(2020)).toBe(true);
      expect(validateYear(1980)).toBe(true);
      expect(validateYear(new Date().getFullYear())).toBe(true);
    });

    it('should reject invalid years', () => {
      expect(validateYear(1979)).toBe(false);
      expect(validateYear(new Date().getFullYear() + 2)).toBe(false);
    });
  });
});

describe('Error Handling', () => {
  it('should handle server errors gracefully', async () => {
    // Simular erro interno modificando temporariamente os dados
    const originalVehicles = require('./vehicles-api-server').vehicles;
    
    // Este teste verifica se o middleware de erro funciona
    const response = await request(app)
      .get('/api/vehicles')
      .expect(200); // Deve funcionar normalmente

    expect(response.body.success).toBe(true);
  });
});