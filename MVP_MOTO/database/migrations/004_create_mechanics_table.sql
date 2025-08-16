-- Migration: 004_create_mechanics_table.sql
-- Criação da tabela de mecânicos

CREATE TABLE mechanics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    specialties TEXT[],
    hourly_rate DECIMAL(10,2),
    commission_rate DECIMAL(5,2) DEFAULT 0,
    active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT mechanics_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT mechanics_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT mechanics_phone_format CHECK (phone IS NULL OR phone ~ '^[\d\s\(\)\-\+]+$'),
    CONSTRAINT mechanics_hourly_rate_positive CHECK (hourly_rate IS NULL OR hourly_rate >= 0),
    CONSTRAINT mechanics_commission_rate_valid CHECK (commission_rate >= 0 AND commission_rate <= 100)
);

-- Índices
CREATE INDEX idx_mechanics_name ON mechanics(name);
CREATE INDEX idx_mechanics_active ON mechanics(active);
CREATE INDEX idx_mechanics_specialties ON mechanics USING gin(specialties);

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_mechanics_updated_at
    BEFORE UPDATE ON mechanics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE mechanics IS 'Mecânicos da oficina';
COMMENT ON COLUMN mechanics.specialties IS 'Array de especialidades do mecânico';
COMMENT ON COLUMN mechanics.hourly_rate IS 'Valor da hora de trabalho';
COMMENT ON COLUMN mechanics.commission_rate IS 'Percentual de comissão sobre serviços';