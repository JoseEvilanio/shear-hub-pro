const request = require('supertest');
const app = require('./clients-api-server');

describe('Clients API', () => {
  describe('GET /api/clients', () => {
    it('should return list of clients', async () => {
      const response = await request(app)
        .get('/api/clients')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.total).toBeDefined();
      expect(response.body.data[0].age).toBeDefined();
    });

    it('should filter clients by active status', async () => {
      const response = await request(app)
        .get('/api/clients?active_only=true')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(c => c.active === true)).toBe(true);
    });

    it('should search clients by text', async () => {
      const response = await request(app)
        .get('/api/clients?search=João')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].name).toContain('João');
    });

    it('should filter clients by birth month', async () => {
      const response = await request(app)
        .get('/api/clients?birth_month=3')
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data.length > 0) {
        expect(response.body.data.every(c => {
          const birthMonth = new Date(c.birth_date).getMonth() + 1;
          return birthMonth === 3;
        })).toBe(true);
      }
    });

    it('should sort clients by name', async () => {
      const response = await request(app)
        .get('/api/clients?sort_by=name&sort_order=asc')
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data.length > 1) {
        expect(response.body.data[0].name <= response.body.data[1].name).toBe(true);
      }
    });
  });

  describe('GET /api/clients/:id', () => {
    it('should return client by id', async () => {
      const response = await request(app)
        .get('/api/clients/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('1');
      expect(response.body.data.age).toBeDefined();
      expect(response.body.data.service_history).toBeDefined();
      expect(response.body.data.purchase_history).toBeDefined();
    });

    it('should return 404 for non-existent client', async () => {
      const response = await request(app)
        .get('/api/clients/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cliente não encontrado');
    });
  });

  describe('POST /api/clients', () => {
    it('should create new client with valid data', async () => {
      const newClient = {
        name: 'Ana Costa',
        cpf: '111.444.777-35',
        phone: '(11) 55555-5555',
        email: 'ana@email.com',
        birth_date: '1995-06-20',
        address: 'Rua das Palmeiras, 200',
        cep: '12345-678',
        notes: 'Cliente teste'
      };

      const response = await request(app)
        .post('/api/clients')
        .send(newClient)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Cliente cadastrado com sucesso');
      expect(response.body.data.name).toBe('Ana Costa');
      expect(response.body.data.cpf).toBe('111.444.777-35');
      expect(response.body.data.age).toBeDefined();
      expect(response.body.data.active).toBe(true);
    });

    it('should validate required fields', async () => {
      const incompleteClient = {
        name: 'Teste',
        cpf: '111.444.777-35'
        // Missing phone
      };

      const response = await request(app)
        .post('/api/clients')
        .send(incompleteClient)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Campos obrigatórios: name, cpf, phone');
      expect(response.body.required_fields).toEqual(['name', 'cpf', 'phone']);
    });

    it('should validate CPF format', async () => {
      const invalidCPFClient = {
        name: 'Teste',
        cpf: '123.456.789-00',
        phone: '(11) 99999-9999'
      };

      const response = await request(app)
        .post('/api/clients')
        .send(invalidCPFClient)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('CPF inválido');
    });

    it('should prevent duplicate CPF', async () => {
      const duplicateCPFClient = {
        name: 'Teste Duplicado',
        cpf: '123.456.789-01', // CPF já existente
        phone: '(11) 99999-9999'
      };

      const response = await request(app)
        .post('/api/clients')
        .send(duplicateCPFClient)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Já existe um cliente cadastrado com este CPF');
    });

    it('should validate phone format', async () => {
      const invalidPhoneClient = {
        name: 'Teste',
        cpf: '111.444.777-35',
        phone: '11999999999' // Formato inválido
      };

      const response = await request(app)
        .post('/api/clients')
        .send(invalidPhoneClient)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Formato de telefone inválido. Use (XX) XXXXX-XXXX');
    });

    it('should validate email format', async () => {
      const invalidEmailClient = {
        name: 'Teste',
        cpf: '222.333.444-55',
        phone: '(11) 99999-9999',
        email: 'email-inválido'
      };

      const response = await request(app)
        .post('/api/clients')
        .send(invalidEmailClient)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Formato de email inválido');
    });

    it('should prevent duplicate email', async () => {
      const duplicateEmailClient = {
        name: 'Teste Email',
        cpf: '333.444.555-66',
        phone: '(11) 99999-9999',
        email: 'joao.silva@email.com' // Email já existente
      };

      const response = await request(app)
        .post('/api/clients')
        .send(duplicateEmailClient)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Já existe um cliente cadastrado com este email');
    });

    it('should validate CEP format', async () => {
      const invalidCEPClient = {
        name: 'Teste',
        cpf: '444.555.666-77',
        phone: '(11) 99999-9999',
        cep: '12345678' // Formato inválido
      };

      const response = await request(app)
        .post('/api/clients')
        .send(invalidCEPClient)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Formato de CEP inválido. Use XXXXX-XXX');
    });

    it('should validate birth date', async () => {
      const futureBirthClient = {
        name: 'Teste',
        cpf: '555.666.777-88',
        phone: '(11) 99999-9999',
        birth_date: '2030-01-01' // Data futura
      };

      const response = await request(app)
        .post('/api/clients')
        .send(futureBirthClient)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Data de nascimento não pode ser futura');
    });

    it('should format CPF automatically', async () => {
      const clientWithUnformattedCPF = {
        name: 'Teste Formatação',
        cpf: '66677788899', // CPF sem formatação
        phone: '(11) 99999-9999'
      };

      const response = await request(app)
        .post('/api/clients')
        .send(clientWithUnformattedCPF)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cpf).toBe('666.777.888-99');
    });
  });

  describe('GET /api/clients/reports/birthdays', () => {
    it('should return birthday clients for specific month', async () => {
      const response = await request(app)
        .get('/api/clients/reports/birthdays?month=3')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.total).toBeDefined();
      expect(response.body.filters_applied.month).toBe('3');

      if (response.body.data.length > 0) {
        expect(response.body.data[0].birth_month).toBe(3);
        expect(response.body.data[0].age).toBeDefined();
        expect(response.body.data[0].days_until_birthday).toBeDefined();
      }
    });

    it('should return upcoming birthdays', async () => {
      const response = await request(app)
        .get('/api/clients/reports/birthdays?upcoming_days=30')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.filters_applied.upcoming_days).toBe('30');

      if (response.body.data.length > 0) {
        expect(response.body.data[0].days_until_birthday).toBeLessThanOrEqual(30);
      }
    });

    it('should sort birthdays by days until birthday', async () => {
      const response = await request(app)
        .get('/api/clients/reports/birthdays')
        .expect(200);

      expect(response.body.success).toBe(true);
      
      if (response.body.data.length > 1) {
        expect(response.body.data[0].days_until_birthday <= response.body.data[1].days_until_birthday).toBe(true);
      }
    });
  });

  describe('Business Logic', () => {
    it('should calculate age correctly', async () => {
      const response = await request(app)
        .get('/api/clients/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.age).toBeGreaterThan(0);
      expect(response.body.data.age).toBeLessThan(150);
    });

    it('should handle clients without birth date', async () => {
      const clientWithoutBirthDate = {
        name: 'Sem Data',
        cpf: '777.888.999-00',
        phone: '(11) 99999-9999'
      };

      const response = await request(app)
        .post('/api/clients')
        .send(clientWithoutBirthDate)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.age).toBeNull();
      expect(response.body.data.birth_date).toBeNull();
    });

    it('should trim whitespace from input fields', async () => {
      const clientWithWhitespace = {
        name: '  Nome com Espaços  ',
        cpf: '  888.999.000-11  ',
        phone: '  (11) 99999-9999  ',
        email: '  teste@email.com  ',
        address: '  Rua com espaços  ',
        notes: '  Notas com espaços  '
      };

      const response = await request(app)
        .post('/api/clients')
        .send(clientWithWhitespace)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Nome com Espaços');
      expect(response.body.data.phone).toBe('(11) 99999-9999');
      expect(response.body.data.email).toBe('teste@email.com');
      expect(response.body.data.address).toBe('Rua com espaços');
      expect(response.body.data.notes).toBe('Notas com espaços');
    });

    it('should convert email to lowercase', async () => {
      const clientWithUppercaseEmail = {
        name: 'Teste Email',
        cpf: '999.000.111-22',
        phone: '(11) 99999-9999',
        email: 'TESTE@EMAIL.COM'
      };

      const response = await request(app)
        .post('/api/clients')
        .send(clientWithUppercaseEmail)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('teste@email.com');
    });
  });
});

describe('Error Handling', () => {
  it('should handle server errors gracefully', async () => {
    const response = await request(app)
      .get('/api/clients')
      .expect(200);

    expect(response.body.success).toBe(true);
  });
});