-- Migration: 016_create_audit_log_table.sql
-- Criação da tabela de auditoria

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(50) NOT NULL,
    operation VARCHAR(10) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT audit_log_operation_valid CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    CONSTRAINT audit_log_table_name_not_empty CHECK (LENGTH(TRIM(table_name)) > 0)
);

-- Índices
CREATE INDEX idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX idx_audit_log_record_id ON audit_log(record_id);
CREATE INDEX idx_audit_log_operation ON audit_log(operation);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- Índice composto para consultas por tabela e registro
CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id, created_at);

-- Função genérica de auditoria
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    changed_fields TEXT[] := '{}';
    field_name TEXT;
BEGIN
    -- Prepara dados antigos e novos
    IF TG_OP = 'DELETE' THEN
        old_data = to_jsonb(OLD);
        new_data = NULL;
    ELSIF TG_OP = 'INSERT' THEN
        old_data = NULL;
        new_data = to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        old_data = to_jsonb(OLD);
        new_data = to_jsonb(NEW);
        
        -- Identifica campos alterados
        FOR field_name IN SELECT jsonb_object_keys(new_data) LOOP
            IF old_data->field_name IS DISTINCT FROM new_data->field_name THEN
                changed_fields := array_append(changed_fields, field_name);
            END IF;
        END LOOP;
    END IF;
    
    -- Insere registro de auditoria
    INSERT INTO audit_log (
        table_name,
        operation,
        record_id,
        old_values,
        new_values,
        changed_fields,
        user_id
    ) VALUES (
        TG_TABLE_NAME,
        TG_OP,
        COALESCE((new_data->>'id')::UUID, (old_data->>'id')::UUID),
        old_data,
        new_data,
        changed_fields,
        COALESCE(
            (new_data->>'user_id')::UUID,
            (old_data->>'user_id')::UUID,
            current_setting('app.current_user_id', true)::UUID
        )
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Função para limpar logs antigos (manter apenas últimos 6 meses)
CREATE OR REPLACE FUNCTION cleanup_audit_log()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM audit_log 
    WHERE created_at < NOW() - INTERVAL '6 months';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- View para relatório de auditoria
CREATE VIEW audit_summary AS
SELECT 
    table_name,
    operation,
    COUNT(*) as total_operations,
    COUNT(DISTINCT user_id) as unique_users,
    MIN(created_at) as first_operation,
    MAX(created_at) as last_operation
FROM audit_log
GROUP BY table_name, operation
ORDER BY table_name, operation;

-- Comentários
COMMENT ON TABLE audit_log IS 'Log de auditoria de todas as operações no banco';
COMMENT ON COLUMN audit_log.changed_fields IS 'Array com nomes dos campos alterados (apenas para UPDATE)';
COMMENT ON COLUMN audit_log.ip_address IS 'Endereço IP do usuário que fez a operação';
COMMENT ON VIEW audit_summary IS 'Resumo das operações de auditoria por tabela';