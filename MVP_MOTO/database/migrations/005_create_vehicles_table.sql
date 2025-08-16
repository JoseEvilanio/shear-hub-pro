-- Migration: 005_create_vehicles_table.sql
-- Criação da tabela de veículos

CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plate VARCHAR(10) UNIQUE NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER,
    color VARCHAR(50),
    engine_size VARCHAR(20),
    fuel_type VARCHAR(20),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    notes TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT vehicles_plate_format CHECK (
        plate ~ '^[A-Z]{3}[0-9]{4}$' OR  -- Formato antigo: ABC1234
        plate ~ '^[A-Z]{3}[0-9][A-Z][0-9]{2}$'  -- Formato Mercosul: ABC1D23
    ),
    CONSTRAINT vehicles_brand_not_empty CHECK (LENGTH(TRIM(brand)) > 0),
    CONSTRAINT vehicles_model_not_empty CHECK (LENGTH(TRIM(model)) > 0),
    CONSTRAINT vehicles_year_valid CHECK (year IS NULL OR (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 1)),
    CONSTRAINT vehicles_fuel_type_valid CHECK (fuel_type IS NULL OR fuel_type IN ('gasoline', 'ethanol', 'flex', 'diesel', 'electric'))
);

-- Índices
CREATE INDEX idx_vehicles_plate ON vehicles(plate);
CREATE INDEX idx_vehicles_client_id ON vehicles(client_id);
CREATE INDEX idx_vehicles_brand_model ON vehicles(brand, model);
CREATE INDEX idx_vehicles_year ON vehicles(year);
CREATE INDEX idx_vehicles_active ON vehicles(active);

-- Índice para busca de texto
CREATE INDEX idx_vehicles_search ON vehicles USING gin(to_tsvector('portuguese', plate || ' ' || brand || ' ' || model));

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_vehicles_updated_at
    BEFORE UPDATE ON vehicles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE vehicles IS 'Veículos dos clientes';
COMMENT ON COLUMN vehicles.plate IS 'Placa do veículo (formato antigo ou Mercosul)';
COMMENT ON COLUMN vehicles.engine_size IS 'Cilindrada do motor (ex: 150cc, 250cc)';
COMMENT ON COLUMN vehicles.fuel_type IS 'Tipo de combustível do veículo';