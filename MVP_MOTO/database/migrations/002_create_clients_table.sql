-- Migration: 002_create_clients_table.sql
-- Criação da tabela de clientes

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    phone VARCHAR(20),
    email VARCHAR(255),
    birth_date DATE,
    address TEXT,
    notes TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT clients_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT clients_cpf_valid CHECK (cpf IS NULL OR validate_cpf(cpf)),
    CONSTRAINT clients_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT clients_phone_format CHECK (phone IS NULL OR phone ~ '^[\d\s\(\)\-\+]+$'),
    CONSTRAINT clients_birth_date_valid CHECK (birth_date IS NULL OR birth_date <= CURRENT_DATE)
);

-- Índices
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_cpf ON clients(cpf);
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_birth_date ON clients(birth_date);
CREATE INDEX idx_clients_active ON clients(active);

-- Índice para busca de texto
CREATE INDEX idx_clients_search ON clients USING gin(to_tsvector('portuguese', name || ' ' || COALESCE(cpf, '') || ' ' || COALESCE(phone, '')));

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE clients IS 'Clientes da oficina';
COMMENT ON COLUMN clients.cpf IS 'CPF do cliente (validado automaticamente)';
COMMENT ON COLUMN clients.notes IS 'Observações sobre o cliente';
COMMENT ON COLUMN clients.active IS 'Cliente ativo no sistema';