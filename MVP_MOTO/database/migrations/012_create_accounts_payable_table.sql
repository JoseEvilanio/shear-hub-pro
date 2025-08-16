-- Migration: 012_create_accounts_payable_table.sql
-- Criação da tabela de contas a pagar

CREATE TABLE accounts_payable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id),
    description TEXT NOT NULL,
    document_number VARCHAR(50),
    category VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    paid BOOLEAN DEFAULT false,
    paid_date DATE,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    interest_amount DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    reference_type VARCHAR(50), -- 'purchase', 'service', 'expense'
    reference_id UUID,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT accounts_payable_amount_positive CHECK (amount > 0),
    CONSTRAINT accounts_payable_paid_amount_positive CHECK (paid_amount >= 0),
    CONSTRAINT accounts_payable_discount_positive CHECK (discount_amount >= 0),
    CONSTRAINT accounts_payable_interest_positive CHECK (interest_amount >= 0),
    CONSTRAINT accounts_payable_paid_date_logic CHECK (
        (paid = false AND paid_date IS NULL) OR 
        (paid = true AND paid_date IS NOT NULL)
    ),
    CONSTRAINT accounts_payable_description_not_empty CHECK (LENGTH(TRIM(description)) > 0)
);

-- Índices
CREATE INDEX idx_accounts_payable_supplier_id ON accounts_payable(supplier_id);
CREATE INDEX idx_accounts_payable_due_date ON accounts_payable(due_date);
CREATE INDEX idx_accounts_payable_paid ON accounts_payable(paid);
CREATE INDEX idx_accounts_payable_category ON accounts_payable(category);
CREATE INDEX idx_accounts_payable_reference ON accounts_payable(reference_type, reference_id);
CREATE INDEX idx_accounts_payable_user_id ON accounts_payable(user_id);

-- Índice para contas vencidas
CREATE INDEX idx_accounts_payable_overdue ON accounts_payable(due_date, paid) 
WHERE paid = false AND due_date < CURRENT_DATE;

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_accounts_payable_updated_at
    BEFORE UPDATE ON accounts_payable
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar status de pagamento
CREATE OR REPLACE FUNCTION update_accounts_payable_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualiza status de pagamento baseado no valor pago
    IF NEW.paid_amount >= NEW.amount THEN
        NEW.paid = true;
        IF NEW.paid_date IS NULL THEN
            NEW.paid_date = CURRENT_DATE;
        END IF;
    ELSE
        NEW.paid = false;
        NEW.paid_date = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_accounts_payable_status
    BEFORE UPDATE ON accounts_payable
    FOR EACH ROW
    EXECUTE FUNCTION update_accounts_payable_status();

-- Comentários
COMMENT ON TABLE accounts_payable IS 'Contas a pagar da oficina';
COMMENT ON COLUMN accounts_payable.document_number IS 'Número do documento (nota fiscal, boleto, etc.)';
COMMENT ON COLUMN accounts_payable.category IS 'Categoria da despesa (fornecedores, serviços, etc.)';
COMMENT ON COLUMN accounts_payable.reference_type IS 'Tipo de referência que gerou a conta';
COMMENT ON COLUMN accounts_payable.interest_amount IS 'Valor de juros por atraso';