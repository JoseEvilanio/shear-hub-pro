-- Migration: 015_create_system_config_table.sql
-- Criação da tabela de configurações do sistema

CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    type VARCHAR(20) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    category VARCHAR(50) DEFAULT 'general',
    is_public BOOLEAN DEFAULT false, -- Se pode ser acessado pelo frontend
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT system_config_key_not_empty CHECK (LENGTH(TRIM(key)) > 0),
    CONSTRAINT system_config_type_valid CHECK (type IN ('string', 'number', 'boolean', 'json'))
);

-- Índices
CREATE INDEX idx_system_config_key ON system_config(key);
CREATE INDEX idx_system_config_category ON system_config(category);
CREATE INDEX idx_system_config_is_public ON system_config(is_public);

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_system_config_updated_at
    BEFORE UPDATE ON system_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Função para obter configuração
CREATE OR REPLACE FUNCTION get_config(config_key VARCHAR)
RETURNS TEXT AS $$
DECLARE
    config_value TEXT;
BEGIN
    SELECT value INTO config_value FROM system_config WHERE key = config_key;
    RETURN config_value;
END;
$$ LANGUAGE plpgsql;

-- Função para definir configuração
CREATE OR REPLACE FUNCTION set_config(
    config_key VARCHAR,
    config_value TEXT,
    config_description TEXT DEFAULT NULL,
    config_type VARCHAR DEFAULT 'string',
    config_category VARCHAR DEFAULT 'general',
    config_is_public BOOLEAN DEFAULT false,
    user_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO system_config (key, value, description, type, category, is_public, updated_by)
    VALUES (config_key, config_value, config_description, config_type, config_category, config_is_public, user_id)
    ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        description = COALESCE(EXCLUDED.description, system_config.description),
        type = EXCLUDED.type,
        category = EXCLUDED.category,
        is_public = EXCLUDED.is_public,
        updated_by = EXCLUDED.updated_by,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Comentários
COMMENT ON TABLE system_config IS 'Configurações gerais do sistema';
COMMENT ON COLUMN system_config.key IS 'Chave única da configuração';
COMMENT ON COLUMN system_config.type IS 'Tipo do valor: string, number, boolean, json';
COMMENT ON COLUMN system_config.is_public IS 'Se a configuração pode ser acessada pelo frontend';