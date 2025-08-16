-- SCRIPT DE CONFIGURAÇÃO RÁPIDA - Execute no SQL Editor do Supabase
-- https://cgnkpnrzxptqcronhkmm.supabase.co

-- 1. Criar função de trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Criar enums
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'operator', 'mechanic');
CREATE TYPE product_type AS ENUM ('product', 'service');

-- 3. Criar tabela de usuários
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

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(active);

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir usuário admin (senha: 123456)
INSERT INTO users (email, password_hash, name, role) VALUES 
('admin@oficina.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 'admin');

-- 4. Criar tabela de clientes
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

CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_cpf ON clients(cpf);

CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Criar tabela de fornecedores
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

CREATE INDEX idx_suppliers_name ON suppliers(name);

CREATE TRIGGER update_suppliers_updated_at 
    BEFORE UPDATE ON suppliers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Criar tabela de mecânicos
CREATE TABLE mechanics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    specialties TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_mechanics_name ON mechanics(name);

CREATE TRIGGER update_mechanics_updated_at 
    BEFORE UPDATE ON mechanics 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Criar tabela de veículos
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

CREATE INDEX idx_vehicles_plate ON vehicles(plate);
CREATE INDEX idx_vehicles_client_id ON vehicles(client_id);

CREATE TRIGGER update_vehicles_updated_at 
    BEFORE UPDATE ON vehicles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Criar tabela de produtos
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

CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_name ON products(name);

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Criar tabela de configurações
CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_system_config_key ON system_config(key);

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

-- 9. Criar tabela de estoque
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER DEFAULT 5,
    max_stock INTEGER DEFAULT 100,
    location VARCHAR(100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_inventory_quantity ON inventory(quantity);

CREATE TRIGGER update_inventory_updated_at 
    BEFORE UPDATE ON inventory 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Criar tabela de movimentações de estoque
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('entrada', 'saida', 'ajuste', 'transferencia')),
    quantity INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    reason VARCHAR(255),
    reference_type VARCHAR(50), -- 'venda', 'compra', 'ajuste', 'ordem_servico'
    reference_id UUID,
    user_id UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_inventory_movements_product_id ON inventory_movements(product_id);
CREATE INDEX idx_inventory_movements_type ON inventory_movements(movement_type);
CREATE INDEX idx_inventory_movements_date ON inventory_movements(created_at);
CREATE INDEX idx_inventory_movements_reference ON inventory_movements(reference_type, reference_id);

-- 11. Criar tabela de ordens de serviço
CREATE TABLE service_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(20) UNIQUE NOT NULL,
    client_id UUID NOT NULL REFERENCES clients(id),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    mechanic_id UUID REFERENCES mechanics(id),
    status VARCHAR(20) NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta', 'em_andamento', 'aguardando_pecas', 'finalizada', 'cancelada')),
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('baixa', 'normal', 'alta', 'urgente')),
    description_line_1 TEXT,
    description_line_2 TEXT,
    description_line_3 TEXT,
    description_line_4 TEXT,
    description_line_5 TEXT,
    description_line_6 TEXT,
    description_line_7 TEXT,
    description_line_8 TEXT,
    description_line_9 TEXT,
    labor_cost DECIMAL(10,2) DEFAULT 0,
    parts_cost DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(10,2) DEFAULT 0,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) DEFAULT 0,
    estimated_completion DATE,
    actual_completion TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_service_orders_number ON service_orders(order_number);
CREATE INDEX idx_service_orders_client ON service_orders(client_id);
CREATE INDEX idx_service_orders_vehicle ON service_orders(vehicle_id);
CREATE INDEX idx_service_orders_mechanic ON service_orders(mechanic_id);
CREATE INDEX idx_service_orders_status ON service_orders(status);
CREATE INDEX idx_service_orders_date ON service_orders(created_at);

CREATE TRIGGER update_service_orders_updated_at 
    BEFORE UPDATE ON service_orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 12. Criar tabela de itens da ordem de serviço
CREATE TABLE service_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_order_id UUID NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    item_type VARCHAR(10) NOT NULL CHECK (item_type IN ('product', 'service')),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_service_order_items_order ON service_order_items(service_order_id);
CREATE INDEX idx_service_order_items_product ON service_order_items(product_id);

-- 13. Inserir dados de teste
INSERT INTO clients (name, cpf, phone, email, birth_date) VALUES 
('João Silva', '123.456.789-00', '(11) 99999-9999', 'joao@email.com', '1985-05-15'),
('Maria Santos', '987.654.321-00', '(11) 88888-8888', 'maria@email.com', '1990-08-22');

INSERT INTO mechanics (name, phone, specialties) VALUES 
('Carlos Mecânico', '(11) 77777-7777', 'Motor, Freios, Suspensão'),
('Pedro Técnico', '(11) 66666-6666', 'Elétrica, Injeção');

INSERT INTO products (code, name, description, price, type) VALUES 
('OIL001', 'Óleo Motul 10W40', 'Óleo sintético para motores', 85.00, 'product'),
('OIL002', 'Óleo Castrol 20W50', 'Óleo mineral para motores', 45.00, 'product'),
('CHAIN001', 'Corrente 520H Premium', 'Corrente premium para motos de 250cc a 600cc - maior durabilidade', 145.90, 'product'),
('BRAKE001', 'Pastilha de Freio Dianteira', 'Pastilha de freio dianteira para motos esportivas', 89.90, 'product'),
('SRV001', 'Troca de Óleo', 'Serviço de troca de óleo completa', 50.00, 'service'),
('SRV002', 'Revisão Geral', 'Revisão completa da motocicleta', 150.00, 'service'),
('MAINT001', 'Manutenção Preventiva Completa', 'Manutenção preventiva completa da motocicleta', 180.00, 'service');

-- Inserir estoque inicial apenas para produtos (não serviços)
INSERT INTO inventory (product_id, quantity, min_stock, max_stock, location)
SELECT id, 
       CASE 
         WHEN code = 'OIL001' THEN 25
         WHEN code = 'OIL002' THEN 30
         WHEN code = 'CHAIN001' THEN 15
         WHEN code = 'BRAKE001' THEN 20
         ELSE 10
       END as quantity,
       5 as min_stock,
       100 as max_stock,
       'Estoque Principal' as location
FROM products 
WHERE type = 'product';

-- Verificar se tudo foi criado
SELECT 'Tabelas criadas:' as info;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;