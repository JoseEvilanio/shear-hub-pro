-- Criar tabela de contas a pagar
CREATE TABLE accounts_payable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id),
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    paid BOOLEAN DEFAULT false,
    paid_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de contas a receber
CREATE TABLE accounts_receivable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id),
    sale_id UUID REFERENCES sales(id),
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    received BOOLEAN DEFAULT false,
    received_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar enum para tipo de movimento de caixa
CREATE TYPE cash_movement_type AS ENUM ('in', 'out');

-- Criar tabela de movimentos de caixa
CREATE TABLE cash_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type cash_movement_type NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    reference_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para accounts_payable
CREATE INDEX idx_accounts_payable_supplier_id ON accounts_payable(supplier_id);
CREATE INDEX idx_accounts_payable_due_date ON accounts_payable(due_date);
CREATE INDEX idx_accounts_payable_paid ON accounts_payable(paid);
CREATE INDEX idx_accounts_payable_created_at ON accounts_payable(created_at);

-- Criar índices para accounts_receivable
CREATE INDEX idx_accounts_receivable_client_id ON accounts_receivable(client_id);
CREATE INDEX idx_accounts_receivable_sale_id ON accounts_receivable(sale_id);
CREATE INDEX idx_accounts_receivable_due_date ON accounts_receivable(due_date);
CREATE INDEX idx_accounts_receivable_received ON accounts_receivable(received);
CREATE INDEX idx_accounts_receivable_created_at ON accounts_receivable(created_at);

-- Criar índices para cash_movements
CREATE INDEX idx_cash_movements_type ON cash_movements(type);
CREATE INDEX idx_cash_movements_created_at ON cash_movements(created_at);
CREATE INDEX idx_cash_movements_reference_id ON cash_movements(reference_id);

-- Criar triggers para atualizar updated_at
CREATE TRIGGER update_accounts_payable_updated_at 
    BEFORE UPDATE ON accounts_payable 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_receivable_updated_at 
    BEFORE UPDATE ON accounts_receivable 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Adicionar constraints
ALTER TABLE accounts_payable ADD CONSTRAINT check_payable_amount_positive 
    CHECK (amount > 0);

ALTER TABLE accounts_receivable ADD CONSTRAINT check_receivable_amount_positive 
    CHECK (amount > 0);

ALTER TABLE cash_movements ADD CONSTRAINT check_cash_amount_positive 
    CHECK (amount > 0);

-- Trigger para atualizar data de pagamento
CREATE OR REPLACE FUNCTION update_payment_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.paid = true AND OLD.paid = false THEN
        NEW.paid_date = CURRENT_DATE;
    ELSIF NEW.paid = false THEN
        NEW.paid_date = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_accounts_payable_payment_date
    BEFORE UPDATE ON accounts_payable
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_date();

-- Trigger para atualizar data de recebimento
CREATE OR REPLACE FUNCTION update_received_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.received = true AND OLD.received = false THEN
        NEW.received_date = CURRENT_DATE;
    ELSIF NEW.received = false THEN
        NEW.received_date = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_accounts_receivable_received_date
    BEFORE UPDATE ON accounts_receivable
    FOR EACH ROW
    EXECUTE FUNCTION update_received_date();

-- View para resumo financeiro
CREATE VIEW financial_summary AS
SELECT 
    'accounts_payable' as type,
    COUNT(*) as total_count,
    SUM(amount) as total_amount,
    SUM(CASE WHEN paid THEN amount ELSE 0 END) as paid_amount,
    SUM(CASE WHEN NOT paid THEN amount ELSE 0 END) as pending_amount
FROM accounts_payable
UNION ALL
SELECT 
    'accounts_receivable' as type,
    COUNT(*) as total_count,
    SUM(amount) as total_amount,
    SUM(CASE WHEN received THEN amount ELSE 0 END) as received_amount,
    SUM(CASE WHEN NOT received THEN amount ELSE 0 END) as pending_amount
FROM accounts_receivable;

-- Comentários
COMMENT ON TABLE accounts_payable IS 'Tabela de contas a pagar';
COMMENT ON TABLE accounts_receivable IS 'Tabela de contas a receber';
COMMENT ON TABLE cash_movements IS 'Tabela de movimentos de caixa diários';
COMMENT ON VIEW financial_summary IS 'Resumo da situação financeira';