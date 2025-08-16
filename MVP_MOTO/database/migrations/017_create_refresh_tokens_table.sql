-- Migration: 017_create_refresh_tokens_table.sql
-- Criação da tabela de refresh tokens

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(128) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT false,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT refresh_tokens_expires_at_future CHECK (expires_at > created_at)
);

-- Índices
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_revoked ON refresh_tokens(revoked);

-- Índice composto para limpeza de tokens expirados
CREATE INDEX idx_refresh_tokens_cleanup ON refresh_tokens(expires_at, revoked) 
WHERE expires_at < NOW() OR revoked = true;

-- Função para limpar tokens expirados automaticamente
CREATE OR REPLACE FUNCTION cleanup_expired_refresh_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM refresh_tokens 
    WHERE expires_at < NOW() OR revoked = true;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Comentários
COMMENT ON TABLE refresh_tokens IS 'Tokens de renovação para autenticação JWT';
COMMENT ON COLUMN refresh_tokens.token IS 'Token de renovação (hash seguro)';
COMMENT ON COLUMN refresh_tokens.revoked IS 'Se o token foi revogado (logout)';
COMMENT ON COLUMN refresh_tokens.ip_address IS 'Endereço IP do cliente';
COMMENT ON COLUMN refresh_tokens.user_agent IS 'User agent do navegador/app';