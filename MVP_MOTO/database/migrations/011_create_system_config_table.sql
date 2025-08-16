-- Criar tabela de configurações do sistema
CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice
CREATE INDEX idx_system_config_key ON system_config(key);

-- Criar trigger para atualizar updated_at
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
('tax_rate', '0'),
('low_stock_threshold', '5'),
('backup_frequency', 'daily'),
('email_notifications', 'true'),
('print_logo_on_documents', 'true'),
('auto_generate_numbers', 'true');

-- Função para obter configuração
CREATE OR REPLACE FUNCTION get_config(config_key VARCHAR)
RETURNS TEXT AS $$
DECLARE
    config_value TEXT;
BEGIN
    SELECT value INTO config_value
    FROM system_config
    WHERE key = config_key;
    
    RETURN config_value;
END;
$$ LANGUAGE plpgsql;

-- Função para definir configuração
CREATE OR REPLACE FUNCTION set_config(config_key VARCHAR, config_value TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO system_config (key, value)
    VALUES (config_key, config_value)
    ON CONFLICT (key) 
    DO UPDATE SET value = config_value, updated_at = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Comentários
COMMENT ON TABLE system_config IS 'Tabela de configurações do sistema';
COMMENT ON COLUMN system_config.key IS 'Chave única da configuração';
COMMENT ON COLUMN system_config.value IS 'Valor da configuração (JSON ou texto)';