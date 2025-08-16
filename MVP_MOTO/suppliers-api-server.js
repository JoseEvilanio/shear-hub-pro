const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3005;

// Middleware
app.use(cors());
app.use(express.json());

// Dados simulados para demonstração
let suppliers = [
  {
    id: '1',
    name: 'Fornecedor ABC Ltda',
    cnpj: '12.345.678/0001-90',
    phone: '(11) 3333-1111',
    email: 'contato@fornecedorabc.com.br',
    contact_person: 'Carlos Vendas',
    address: 'Rua Industrial, 500 - Distrito Industrial - São Paulo/SP',
    cep: '08500-000',
    category: 'pecas',
    payment_terms: '30 dias',
    notes: 'Fornecedor principal de peças Honda',
    active: true,
    created_at: '2024-01-05T09:00:00Z',
    updated_at: '2024-01-05T09:00:00Z'
  },
  {
    id: '2',
    name: 'Distribuidora Moto Parts',
    cnpj: '98.765.432/0001-10',
    phone: '(11) 4444-2222',
    email: 'vendas@motoparts.com.br',
    contact_person: 'Ana Comercial',
    address: 'Av. das Nações, 1200 - Centro - São Paulo/SP',
    cep: '01000-000',
    category: 'pecas',
    payment_terms: '45 dias',
    notes: 'Especializada em peças Yamaha e Suzuki',
    active: true,
    created_at: '2024-01-08T11:30:00Z',
    updated_at: '2024-01-08T11:30:00Z'
  },
  {
    id: '3',
    name: 'Óleos e Lubrificantes Premium',
    cnpj: '11.222.333/0001-44',
    phone: '(11) 5555-3333',
    email: 'comercial@oleospremium.com.br',
    contact_person: 'Roberto Técnico',
    address: 'Rua dos Químicos, 800 - Vila Industrial - São Paulo/SP',
    cep: '05000-000',
    category: 'oleos',
    payment_terms: '15 dias',
    notes: 'Fornecedor de óleos e lubrificantes de alta qualidade',
    active: true,
    created_at: '2024-01-10T15:45:00Z',
    updated_at: '2024-01-10T15:45:00Z'
  }
];

// Categorias válidas
const validCategories = [
  'pecas',        // Peças e componentes
  'oleos',        // Óleos e lubrificantes
  'ferramentas',  // Ferramentas e equipamentos
  'acessorios',   // Acessórios
  'servicos',     // Serviços terceirizados
  'outros'        // Outros
];

let nextId = 4;// Função 
para validar CNPJ
function validateCNPJ(cnpj) {
  cnpj = cnpj.replace(/[^\d]/g, '');
  
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  let weight = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(cnpj.charAt(12))) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  weight = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== parseInt(cnpj.charAt(13))) return false;
  
  return true;
}

// Função para formatar CNPJ
function formatCNPJ(cnpj) {
  cnpj = cnpj.replace(/[^\d]/g, '');
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

// Função para validar email
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Função para validar telefone brasileiro
function validatePhone(phone) {
  const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  return phoneRegex.test(phone);
}

// Função para validar CEP
function validateCEP(cep) {
  const cepRegex = /^\d{5}-\d{3}$/;
  return cepRegex.test(cep);
}//
 GET /api/suppliers - Listar todos os fornecedores
app.get('/api/suppliers', (req, res) => {
  try {
    const { 
      active_only = 'true',
      search,
      category,
      city,
      sort_by = 'name',
      sort_order = 'asc'
    } = req.query;
    
    let filteredSuppliers = [...suppliers];

    // Filtro por status ativo
    if (active_only === 'true') {
      filteredSuppliers = filteredSuppliers.filter(supplier => supplier.active);
    }

    // Busca geral
    if (search) {
      const searchLower = search.toLowerCase();
      filteredSuppliers = filteredSuppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchLower) ||
        supplier.cnpj.includes(search) ||
        supplier.phone.includes(search) ||
        (supplier.email && supplier.email.toLowerCase().includes(searchLower)) ||
        (supplier.contact_person && supplier.contact_person.toLowerCase().includes(searchLower)) ||
        (supplier.address && supplier.address.toLowerCase().includes(searchLower))
      );
    }

    // Filtro por categoria
    if (category && validCategories.includes(category)) {
      filteredSuppliers = filteredSuppliers.filter(supplier => supplier.category === category);
    }

    // Filtro por cidade
    if (city) {
      filteredSuppliers = filteredSuppliers.filter(supplier =>
        supplier.address && supplier.address.toLowerCase().includes(city.toLowerCase())
      );
    }

    // Ordenação
    filteredSuppliers.sort((a, b) => {
      let aValue = a[sort_by] || '';
      let bValue = b[sort_by] || '';
      
      aValue = aValue.toString().toLowerCase();
      bValue = bValue.toString().toLowerCase();
      
      if (sort_order === 'desc') {
        return aValue < bValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    res.json({
      success: true,
      data: filteredSuppliers,
      total: filteredSuppliers.length,
      filters_applied: {
        active_only, search, category, city, sort_by, sort_order
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

// GET /api/suppliers/:id - Buscar fornecedor por ID
app.get('/api/suppliers/:id', (req, res) => {
  try {
    const { id } = req.params;
    const supplier = suppliers.find(s => s.id === id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Fornecedor não encontrado'
      });
    }

    // Adicionar informações extras
    const supplierWithExtras = {
      ...supplier,
      // TODO: Adicionar histórico de compras quando integrado
      purchase_history: [],
      total_purchased: 0,
      last_purchase_date: null,
      pending_accounts: 0
    };

    res.json({
      success: true,
      data: supplierWithExtras
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});//
 GET /api/suppliers/cnpj/:cnpj - Buscar fornecedor por CNPJ
app.get('/api/suppliers/cnpj/:cnpj', (req, res) => {
  try {
    const { cnpj } = req.params;
    const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
    
    const supplier = suppliers.find(s => 
      s.cnpj.replace(/[^\d]/g, '') === cleanCNPJ
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Fornecedor não encontrado'
      });
    }

    res.json({
      success: true,
      data: supplier
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// POST /api/suppliers - Criar novo fornecedor
app.post('/api/suppliers', (req, res) => {
  try {
    const {
      name,
      cnpj,
      phone,
      email,
      contact_person,
      address,
      cep,
      category = 'outros',
      payment_terms,
      notes
    } = req.body;

    // Validações obrigatórias
    if (!name || !cnpj || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: name, cnpj, phone',
        required_fields: ['name', 'cnpj', 'phone']
      });
    }

    // Validar CNPJ
    if (!validateCNPJ(cnpj)) {
      return res.status(400).json({
        success: false,
        message: 'CNPJ inválido'
      });
    }

    // Verificar se CNPJ já existe
    const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
    const existingSupplier = suppliers.find(s => 
      s.cnpj.replace(/[^\d]/g, '') === cleanCNPJ
    );
    if (existingSupplier) {
      return res.status(409).json({
        success: false,
        message: 'Já existe um fornecedor cadastrado com este CNPJ'
      });
    }

    // Validar telefone
    if (!validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de telefone inválido. Use (XX) XXXX-XXXX'
      });
    }

    // Validar email se fornecido
    if (email && !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de email inválido'
      });
    }

    // Verificar se email já existe
    if (email) {
      const existingEmail = suppliers.find(s => 
        s.email && s.email.toLowerCase() === email.toLowerCase()
      );
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'Já existe um fornecedor cadastrado com este email'
        });
      }
    }

    // Validar categoria
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Categoria inválida',
        valid_categories: validCategories
      });
    }

    // Validar CEP se fornecido
    if (cep && !validateCEP(cep)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de CEP inválido. Use XXXXX-XXX'
      });
    }

    // Criar novo fornecedor
    const newSupplier = {
      id: (++nextId).toString(),
      name: name.trim(),
      cnpj: formatCNPJ(cnpj),
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : null,
      contact_person: contact_person ? contact_person.trim() : null,
      address: address ? address.trim() : null,
      cep: cep ? cep.trim() : null,
      category,
      payment_terms: payment_terms ? payment_terms.trim() : null,
      notes: notes ? notes.trim() : '',
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    suppliers.push(newSupplier);

    res.status(201).json({
      success: true,
      message: 'Fornecedor cadastrado com sucesso',
      data: newSupplier
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});//
 PUT /api/suppliers/:id - Atualizar fornecedor
app.put('/api/suppliers/:id', (req, res) => {
  try {
    const { id } = req.params;
    const supplierIndex = suppliers.findIndex(s => s.id === id);

    if (supplierIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Fornecedor não encontrado'
      });
    }

    const {
      name,
      cnpj,
      phone,
      email,
      contact_person,
      address,
      cep,
      category,
      payment_terms,
      notes
    } = req.body;

    // Validações obrigatórias
    if (!name || !cnpj || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: name, cnpj, phone',
        required_fields: ['name', 'cnpj', 'phone']
      });
    }

    // Validar CNPJ
    if (!validateCNPJ(cnpj)) {
      return res.status(400).json({
        success: false,
        message: 'CNPJ inválido'
      });
    }

    // Verificar se CNPJ já existe (exceto no próprio fornecedor)
    const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
    const existingSupplier = suppliers.find(s => 
      s.cnpj.replace(/[^\d]/g, '') === cleanCNPJ && s.id !== id
    );
    if (existingSupplier) {
      return res.status(409).json({
        success: false,
        message: 'Já existe outro fornecedor cadastrado com este CNPJ'
      });
    }

    // Validar telefone
    if (!validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de telefone inválido. Use (XX) XXXX-XXXX'
      });
    }

    // Validar email se fornecido
    if (email && !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de email inválido'
      });
    }

    // Verificar se email já existe (exceto no próprio fornecedor)
    if (email) {
      const existingEmail = suppliers.find(s => 
        s.email && s.email.toLowerCase() === email.toLowerCase() && s.id !== id
      );
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'Já existe outro fornecedor cadastrado com este email'
        });
      }
    }

    // Validar categoria
    if (category && !validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Categoria inválida',
        valid_categories: validCategories
      });
    }

    // Validar CEP se fornecido
    if (cep && !validateCEP(cep)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de CEP inválido. Use XXXXX-XXX'
      });
    }

    // Atualizar fornecedor
    suppliers[supplierIndex] = {
      ...suppliers[supplierIndex],
      name: name.trim(),
      cnpj: formatCNPJ(cnpj),
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : null,
      contact_person: contact_person ? contact_person.trim() : null,
      address: address ? address.trim() : null,
      cep: cep ? cep.trim() : null,
      category: category || suppliers[supplierIndex].category,
      payment_terms: payment_terms ? payment_terms.trim() : suppliers[supplierIndex].payment_terms,
      notes: notes !== undefined ? notes.trim() : suppliers[supplierIndex].notes,
      updated_at: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Fornecedor atualizado com sucesso',
      data: suppliers[supplierIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});