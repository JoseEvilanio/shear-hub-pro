# Configuração do Banco de Dados - Supabase

## Instruções para Executar as Migrations

1. Acesse o painel do Supabase: https://cgnkpnrzxptqcronhkmm.supabase.co
2. Vá para **SQL Editor**
3. Execute os scripts na ordem abaixo:

### 1. Criar Função de Update (Execute primeiro)

```sql
-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

### 2. Criar Tabela de Usuários

```sql
-- Criar enum para roles de usuário
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'operator', 'mechanic');

-- Criar tabela de usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'operator',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(active);

-- Criar trigger
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir usuário admin padrão (senha: 123456)
INSERT INTO users (email, password_hash, name, role) VALUES 
('admin@oficina.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 'admin');
```

### 3. Criar Tabela de Clientes

```sql
-- Criar tabela de clientes
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    phone VARCHAR(20),
    email VARCHAR(255),
    birth_date DATE,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_cpf ON clients(cpf);
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_birth_date ON clients(birth_date);

-- Criar trigger
CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 4. Criar Tabela de Fornecedores

```sql
-- Criar tabela de fornecedores
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    payment_terms TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_cnpj ON suppliers(cnpj);

-- Criar trigger
CREATE TRIGGER update_suppliers_updated_at 
    BEFORE UPDATE ON suppliers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 5. Criar Tabela de Mecânicos

```sql
-- Criar tabela de mecânicos
CREATE TABLE mechanics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    specialties TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX idx_mechanics_name ON mechanics(name);
CREATE INDEX idx_mechanics_active ON mechanics(active);

-- Criar trigger
CREATE TRIGGER update_mechanics_updated_at 
    BEFORE UPDATE ON mechanics 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 6. Criar Tabela de Veículos

```sql
-- Criar tabela de veículos
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plate VARCHAR(10) UNIQUE NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX idx_vehicles_plate ON vehicles(plate);
CREATE INDEX idx_vehicles_client_id ON vehicles(client_id);

-- Criar trigger
CREATE TRIGGER update_vehicles_updated_at 
    BEFORE UPDATE ON vehicles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 7. Criar Tabela de Produtos

```sql
-- Criar enum para tipo de produto
CREATE TYPE product_type AS ENUM ('product', 'service');

-- Criar tabela de produtos e serviços
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    barcode VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    image_url VARCHAR(500),
    type product_type NOT NULL DEFAULT 'product',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_type ON products(type);

-- Criar trigger
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 8. Criar Configurações do Sistema

```sql
-- Criar tabela de configurações do sistema
CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice
CREATE INDEX idx_system_config_key ON system_config(key);

-- Criar trigger
CREATE TRIGGER update_system_config_updated_at 
    BEFORE UPDATE ON system_config 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir configurações padrão
INSERT INTO system_config (key, value) VALUES 
('company_name', 'Oficina Mecânica de Motos'),
('company_logo', ''),
('company_address', ''),
('company_phone', ''),
('company_email', ''),
('background_image', ''),
('default_currency', 'BRL'),
('low_stock_threshold', '5');
```

## Verificação

Após executar todos os scripts, execute este comando para verificar se as tabelas foram criadas:

```sql
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

## Dados de Teste

Para inserir alguns dados de teste:

```sql
-- Inserir cliente de teste
INSERT INTO clients (name, cpf, phone, email, birth_date) VALUES 
('João Silva', '123.456.789-00', '(11) 99999-9999', 'joao@email.com', '1985-05-15');

-- Inserir mecânico de teste
INSERT INTO mechanics (name, phone, specialties) VALUES 
('Carlos Mecânico', '(11) 88888-8888', 'Motor, Freios, Suspensão');

-- Inserir produto de teste
INSERT INTO products (code, name, description, price, type) VALUES 
('OIL001', 'Óleo Motul 10W40', 'Óleo sintético para motores', 85.00, 'product'),
('SRV001', 'Troca de Óleo', 'Serviço de troca de óleo completa', 50.00, 'service');
```

## Próximos Passos

1. Execute as migrations na ordem apresentada
2. Verifique se todas as tabelas foram criadas
3. Insira os dados de teste
4. Configure as variáveis de ambiente no backend
5. Teste a conexão com o banco