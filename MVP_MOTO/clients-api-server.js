const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3004;

// Middleware
app.use(cors());
app.use(express.json());

// Dados simulados para demonstração
let clients = [
  {
    id: '1',
    name: 'João Silva',
    cpf: '123.456.789-01',
    phone: '(11) 99999-1111',
    email: 'joao.silva@email.com',
    birth_date: '1985-03-15',
    address: 'Rua das Flores, 123 - Centro - São Paulo/SP',
    cep: '01234-567',
    notes: 'Cliente preferencial, sempre pontual nos pagamentos',
    active: true,
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z'
  },
  {
    id: '2',
    name: 'Maria Santos',
    cpf: '987.654.321-02',
    phone: '(11) 88888-2222',
    email: 'maria.santos@email.com',
    birth_date: '1990-07-22',
    address: 'Av. Paulista, 456 - Bela Vista - São Paulo/SP',
    cep: '01310-100',
    notes: 'Possui 2 motos, faz revisões regulares',
    active: true,
    created_at: '2024-01-12T10:30:00Z',
    updated_at: '2024-01-12T10:30:00Z'
  },
  {
    id: '3',
    name: 'Pedro Costa',
    cpf: '456.789.123-03',
    phone: '(11) 77777-3333',
    email: 'pedro.costa@email.com',
    birth_date: '1978-12-05',
    address: 'Rua Augusta, 789 - Consolação - São Paulo/SP',
    cep: '01305-000',
    notes: 'Cliente antigo, conhece bem de motos',
    active: true,
    created_at: '2024-01-15T14:15:00Z',
    updated_at: '2024-01-15T14:15:00Z'
  }
];

let nextId = 4;

function validateCPF(cpf) {
  cpf = cpf.replace(/[^\d]/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) return false;
  
  return true;
}

function formatCPF(cpf) {
  cpf = cpf.replace(/[^\d]/g, '');
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone) {
  const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  return phoneRegex.test(phone);
}

function validateCEP(cep) {
  const cepRegex = /^\d{5}-\d{3}$/;
  return cepRegex.test(cep);
}

function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

app.get('/api/clients', (req, res) => {
  try {
    const { 
      active_only = 'true',
      search,
      birth_month,
      city,
      sort_by = 'name',
      sort_order = 'asc'
    } = req.query;
    
    let filteredClients = [...clients];

    if (active_only === 'true') {
      filteredClients = filteredClients.filter(client => client.active);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredClients = filteredClients.filter(client =>
        client.name.toLowerCase().includes(searchLower) ||
        client.cpf.includes(search) ||
        client.phone.includes(search) ||
        (client.email && client.email.toLowerCase().includes(searchLower)) ||
        (client.address && client.address.toLowerCase().includes(searchLower))
      );
    }

    if (birth_month) {
      const month = parseInt(birth_month);
      filteredClients = filteredClients.filter(client => {
        if (!client.birth_date) return false;
        const birthMonth = new Date(client.birth_date).getMonth() + 1;
        return birthMonth === month;
      });
    }

    if (city) {
      filteredClients = filteredClients.filter(client =>
        client.address && client.address.toLowerCase().includes(city.toLowerCase())
      );
    }

    filteredClients.sort((a, b) => {
      let aValue = a[sort_by] || '';
      let bValue = b[sort_by] || '';
      
      if (sort_by === 'birth_date') {
        aValue = new Date(aValue || '1900-01-01');
        bValue = new Date(bValue || '1900-01-01');
      } else {
        aValue = aValue.toString().toLowerCase();
        bValue = bValue.toString().toLowerCase();
      }
      
      if (sort_order === 'desc') {
        return aValue < bValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    const clientsWithAge = filteredClients.map(client => ({
      ...client,
      age: client.birth_date ? calculateAge(client.birth_date) : null
    }));

    res.json({
      success: true,
      data: clientsWithAge,
      total: clientsWithAge.length,
      filters_applied: {
        active_only, search, birth_month, city, sort_by, sort_order
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

app.get('/api/clients/:id', (req, res) => {
  try {
    const { id } = req.params;
    const client = clients.find(c => c.id === id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    const clientWithExtras = {
      ...client,
      age: client.birth_date ? calculateAge(client.birth_date) : null,
      service_history: [],
      purchase_history: [],
      total_spent: 0,
      last_service_date: null
    };

    res.json({
      success: true,
      data: clientWithExtras
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

app.post('/api/clients', (req, res) => {
  try {
    const {
      name,
      cpf,
      phone,
      email,
      birth_date,
      address,
      cep,
      notes
    } = req.body;

    if (!name || !cpf || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: name, cpf, phone',
        required_fields: ['name', 'cpf', 'phone']
      });
    }

    if (!validateCPF(cpf)) {
      return res.status(400).json({
        success: false,
        message: 'CPF inválido'
      });
    }

    const cleanCPF = cpf.replace(/[^\d]/g, '');
    const existingClient = clients.find(c => 
      c.cpf.replace(/[^\d]/g, '') === cleanCPF
    );
    if (existingClient) {
      return res.status(409).json({
        success: false,
        message: 'Já existe um cliente cadastrado com este CPF'
      });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de telefone inválido. Use (XX) XXXXX-XXXX'
      });
    }

    if (email && !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de email inválido'
      });
    }

    if (email) {
      const existingEmail = clients.find(c => 
        c.email && c.email.toLowerCase() === email.toLowerCase()
      );
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'Já existe um cliente cadastrado com este email'
        });
      }
    }

    if (cep && !validateCEP(cep)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de CEP inválido. Use XXXXX-XXX'
      });
    }

    if (birth_date) {
      const birthDate = new Date(birth_date);
      const today = new Date();
      const age = calculateAge(birth_date);
      
      if (birthDate > today) {
        return res.status(400).json({
          success: false,
          message: 'Data de nascimento não pode ser futura'
        });
      }
      
      if (age > 120) {
        return res.status(400).json({
          success: false,
          message: 'Data de nascimento inválida'
        });
      }
    }

    const newClient = {
      id: (++nextId).toString(),
      name: name.trim(),
      cpf: formatCPF(cpf),
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : null,
      birth_date: birth_date || null,
      address: address ? address.trim() : null,
      cep: cep ? cep.trim() : null,
      notes: notes ? notes.trim() : '',
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    clients.push(newClient);

    const clientWithAge = {
      ...newClient,
      age: newClient.birth_date ? calculateAge(newClient.birth_date) : null
    };

    res.status(201).json({
      success: true,
      message: 'Cliente cadastrado com sucesso',
      data: clientWithAge
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});app.
get('/api/clients/reports/birthdays', (req, res) => {
  try {
    const { month, upcoming_days = '30' } = req.query;
    
    let birthdayClients = [];
    
    if (month) {
      const targetMonth = parseInt(month);
      birthdayClients = clients.filter(client => {
        if (!client.birth_date || !client.active) return false;
        const birthMonth = new Date(client.birth_date).getMonth() + 1;
        return birthMonth === targetMonth;
      });
    } else {
      const days = parseInt(upcoming_days);
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + days);
      
      birthdayClients = clients.filter(client => {
        if (!client.birth_date || !client.active) return false;
        
        const birthDate = new Date(client.birth_date);
        const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        const nextYearBirthday = new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());
        
        return (thisYearBirthday >= today && thisYearBirthday <= futureDate) ||
               (nextYearBirthday >= today && nextYearBirthday <= futureDate);
      });
    }

    const birthdayClientsWithInfo = birthdayClients.map(client => {
      const birthDate = new Date(client.birth_date);
      const today = new Date();
      const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      const nextYearBirthday = new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());
      
      let nextBirthday = thisYearBirthday >= today ? thisYearBirthday : nextYearBirthday;
      let daysUntilBirthday = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
      
      return {
        id: client.id,
        name: client.name,
        phone: client.phone,
        email: client.email,
        birth_date: client.birth_date,
        age: calculateAge(client.birth_date),
        next_birthday: nextBirthday.toISOString().split('T')[0],
        days_until_birthday: daysUntilBirthday,
        birth_month: birthDate.getMonth() + 1,
        birth_day: birthDate.getDate()
      };
    });

    birthdayClientsWithInfo.sort((a, b) => a.days_until_birthday - b.days_until_birthday);

    res.json({
      success: true,
      data: birthdayClientsWithInfo,
      total: birthdayClientsWithInfo.length,
      filters_applied: { month, upcoming_days }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor'
  });
});

app.listen(PORT, () => {
  console.log(`👥 Servidor de Clientes rodando na porta ${PORT}`);
  console.log(`📋 Endpoints disponíveis:`);
  console.log(`   GET    /api/clients - Listar clientes`);
  console.log(`   GET    /api/clients/:id - Buscar cliente por ID`);
  console.log(`   POST   /api/clients - Criar cliente`);
  console.log(`   GET    /api/clients/reports/birthdays - Relatório de aniversariantes`);
});

module.exports = app;