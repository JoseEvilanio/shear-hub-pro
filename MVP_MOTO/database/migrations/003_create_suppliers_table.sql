-- Migration: 003_create_suppliers_table.sql
-- Criação da tabela de fornecedores

CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    contact_person VARCHAR(255),
    payment_terms TEXT,
    category VARCHAR(100),
    notes TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT suppliers_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT suppliers_cnpj_valid CHECK (cnpj IS NULL OR validate_cnpj(cnpj)),
    CONSTRAINT suppliers_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT suppliers_phone_format CHECK (phone IS NULL OR phone ~ '^[\d\s\(\)\-\+]+$')
);

-- Índices
CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_cnpj ON suppliers(cnpj);
CREATE INDEX idx_suppliers_category ON suppliers(category);
CREATE INDEX idx_suppliers_active ON suppliers(active);

-- Índice para busca de texto
CREATE INDEX idx_suppliers_search ON suppliers USING gin(to_tsvector('portuguese', name || ' ' || COALESCE(cnpj, '') || ' ' || COALESCE(category, '')));

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_suppliers_updated_at
    BEFORE UPDATE ON suppliers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE suppliers IS 'Fornecedores de produtos e serviços';
COMMENT ON COLUMN suppliers.cnpj IS 'CNPJ do fornecedor (validado automaticamente)';
COMMENT ON COLUMN suppliers.payment_terms IS 'Condições de pagamento do fornecedor';
COMMENT ON COLUMN suppliers.category IS 'Categoria do fornecedor (peças, ferramentas, etc.)';