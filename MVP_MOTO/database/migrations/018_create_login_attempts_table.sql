-- Migration: 018_create_login_attempts_table.sql
-- Criação da tabela de tentativas de login

CREATE TABLE login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    success BOOLEAN NOT NULL,
    ip_address INET,
    user_agent TEXT,
    attempted_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT login_attempts_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Índices
CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_success ON login_attempts(success);
CREATE INDEX idx_login_attempts_attempted_at ON login_attempts(attempted_at);
CREATE INDEX idx_login_attempts_ip_address ON login_attempts(ip_address);

-- Índice composto para verificação de tentativas suspeitas
CREATE INDEX idx_login_attempts_suspicious ON login_attempts(email, success, attempted_at, ip_address);

-- Índice para limpeza de logs antigos
CREATE INDEX idx_login_attempts_cleanup ON login_attempts(attempted_at) 
WHERE attempted_at < NOW() - INTERVAL '30 days';

-- Função para limpar tentativas antigas (manter apenas últimos 30 dias)
CREATE OR REPLACE FUNCTION cleanup_old_login_attempts()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM login_attempts 
    WHERE attempted_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- View para relatório de tentativas de login
CREATE VIEW login_attempts_summary AS
SELECT 
    DATE(attempted_at) as date,
    COUNT(*) as total_attempts,
    COUNT(*) FILTER (WHERE success = true) as successful_attempts,
    COUNT(*) FILTER (WHERE success = false) as failed_attempts,
    COUNT(DISTINCT email) as unique_emails,
    COUNT(DISTINCT ip_address) as unique_ips
FROM login_attempts
WHERE attempted_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(attempted_at)
ORDER BY DATE(attempted_at) DESC;

-- Função para obter tentativas suspeitas por email
CREATE OR REPLACE FUNCTION get_suspicious_attempts(
    p_email VARCHAR,
    p_minutes INTEGER DEFAULT 15,
    p_ip_address INET DEFAULT NULL
)
RETURNS TABLE(
    attempts_count BIGINT,
    last_attempt TIMESTAMP,
    ip_addresses TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as attempts_count,
        MAX(attempted_at) as last_attempt,
        ARRAY_AGG(DISTINCT ip_address::TEXT) as ip_addresses
    FROM login_attempts 
    WHERE email = p_email 
    AND success = false 
    AND attempted_at > NOW() - (p_minutes || ' minutes')::INTERVAL
    AND (p_ip_address IS NULL OR ip_address = p_ip_address);
END;
$$ LANGUAGE plpgsql;

-- Comentários
COMMENT ON TABLE login_attempts IS 'Log de tentativas de login (sucessos e falhas)';
COMMENT ON COLUMN login_attempts.success IS 'Se a tentativa de login foi bem-sucedida';
COMMENT ON VIEW login_attempts_summary IS 'Resumo diário de tentativas de login';
COMMENT ON FUNCTION get_suspicious_attempts IS 'Obtém tentativas suspeitas de login por email';