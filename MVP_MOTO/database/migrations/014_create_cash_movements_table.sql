-- Migration: 014_create_cash_movements_table.sql
-- Criação da tabela de movimentações de caixa

CREATE TABLE cash_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type cash_movement_type NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    reference_type VARCHAR(50), -- 'sale', 'accounts_receivable', 'accounts_payable', 'expense', 'other'
    reference_id UUID,
    reference_number VARCHAR(50),
    payment_method payment_method,
    user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT cash_movements_amount_positive CHECK (amount > 0),
    CONSTRAINT cash_movements_description_not_empty CHECK (LENGTH(TRIM(description)) > 0)
);

-- Índices
CREATE INDEX idx_cash_movements_type ON cash_movements(type);
CREATE INDEX idx_cash_movements_created_at ON cash_movements(created_at);
CREATE INDEX idx_cash_movements_category ON cash_movements(category);
CREATE INDEX idx_cash_movements_reference ON cash_movements(reference_type, reference_id);
CREATE INDEX idx_cash_movements_user_id ON cash_movements(user_id);
CREATE INDEX idx_cash_movements_payment_method ON cash_movements(payment_method);

-- Índice composto para relatórios de caixa
CREATE INDEX idx_cash_movements_daily ON cash_movements(DATE(created_at), type);

-- Função para obter saldo do caixa
CREATE OR REPLACE FUNCTION get_cash_balance(p_date DATE DEFAULT CURRENT_DATE)
RETURNS DECIMAL AS $$
DECLARE
    balance DECIMAL := 0;
BEGIN
    SELECT 
        COALESCE(SUM(CASE WHEN type = 'in' THEN amount ELSE -amount END), 0)
    INTO balance
    FROM cash_movements
    WHERE DATE(created_at) <= p_date;
    
    RETURN balance;
END;
$$ LANGUAGE plpgsql;

-- Função para obter movimentação do caixa por período
CREATE OR REPLACE FUNCTION get_cash_flow(
    p_start_date DATE DEFAULT CURRENT_DATE,
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
    total_in DECIMAL,
    total_out DECIMAL,
    net_flow DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN type = 'in' THEN amount ELSE 0 END), 0) as total_in,
        COALESCE(SUM(CASE WHEN type = 'out' THEN amount ELSE 0 END), 0) as total_out,
        COALESCE(SUM(CASE WHEN type = 'in' THEN amount ELSE -amount END), 0) as net_flow
    FROM cash_movements
    WHERE DATE(created_at) BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql;

-- Função para registrar movimento de caixa automaticamente
CREATE OR REPLACE FUNCTION create_cash_movement(
    p_type cash_movement_type,
    p_amount DECIMAL,
    p_description TEXT,
    p_category VARCHAR DEFAULT NULL,
    p_reference_type VARCHAR DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL,
    p_reference_number VARCHAR DEFAULT NULL,
    p_payment_method payment_method DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    movement_id UUID;
BEGIN
    INSERT INTO cash_movements (
        type, amount, description, category,
        reference_type, reference_id, reference_number,
        payment_method, user_id
    ) VALUES (
        p_type, p_amount, p_description, p_category,
        p_reference_type, p_reference_id, p_reference_number,
        p_payment_method, p_user_id
    ) RETURNING id INTO movement_id;
    
    RETURN movement_id;
END;
$$ LANGUAGE plpgsql;

-- View para relatório de caixa diário
CREATE VIEW daily_cash_report AS
SELECT 
    DATE(created_at) as date,
    SUM(CASE WHEN type = 'in' THEN amount ELSE 0 END) as total_in,
    SUM(CASE WHEN type = 'out' THEN amount ELSE 0 END) as total_out,
    SUM(CASE WHEN type = 'in' THEN amount ELSE -amount END) as net_flow,
    COUNT(*) as total_movements
FROM cash_movements
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) DESC;

-- Comentários
COMMENT ON TABLE cash_movements IS 'Movimentações de caixa (entradas e saídas)';
COMMENT ON COLUMN cash_movements.reference_type IS 'Tipo de referência que gerou o movimento';
COMMENT ON COLUMN cash_movements.reference_number IS 'Número da referência (ex: número da venda)';
COMMENT ON VIEW daily_cash_report IS 'Relatório diário de movimentações de caixa';