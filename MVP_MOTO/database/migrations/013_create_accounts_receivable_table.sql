-- Migration: 013_create_accounts_receivable_table.sql
-- Criação da tabela de contas a receber

CREATE TABLE accounts_receivable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id),
    sale_id UUID REFERENCES sales(id),
    description TEXT NOT NULL,
    installment_number INTEGER DEFAULT 1,
    total_installments INTEGER DEFAULT 1,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    received BOOLEAN DEFAULT false,
    received_date DATE,
    received_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    interest_amount DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT accounts_receivable_amount_positive CHECK (amount > 0),
    CONSTRAINT accounts_receivable_received_amount_positive CHECK (received_amount >= 0),
    CONSTRAINT accounts_receivable_discount_positive CHECK (discount_amount >= 0),
    CONSTRAINT accounts_receivable_interest_positive CHECK (interest_amount >= 0),
    CONSTRAINT accounts_receivable_installment_positive CHECK (installment_number > 0),
    CONSTRAINT accounts_receivable_total_installments_positive CHECK (total_installments > 0),
    CONSTRAINT accounts_receivable_installment_valid CHECK (installment_number <= total_installments),
    CONSTRAINT accounts_receivable_received_date_logic CHECK (
        (received = false AND received_date IS NULL) OR 
        (received = true AND received_date IS NOT NULL)
    ),
    CONSTRAINT accounts_receivable_description_not_empty CHECK (LENGTH(TRIM(description)) > 0)
);

-- Índices
CREATE INDEX idx_accounts_receivable_client_id ON accounts_receivable(client_id);
CREATE INDEX idx_accounts_receivable_sale_id ON accounts_receivable(sale_id);
CREATE INDEX idx_accounts_receivable_due_date ON accounts_receivable(due_date);
CREATE INDEX idx_accounts_receivable_received ON accounts_receivable(received);
CREATE INDEX idx_accounts_receivable_user_id ON accounts_receivable(user_id);

-- Índice para contas vencidas
CREATE INDEX idx_accounts_receivable_overdue ON accounts_receivable(due_date, received) 
WHERE received = false AND due_date < CURRENT_DATE;

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_accounts_receivable_updated_at
    BEFORE UPDATE ON accounts_receivable
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar status de recebimento
CREATE OR REPLACE FUNCTION update_accounts_receivable_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualiza status de recebimento baseado no valor recebido
    IF NEW.received_amount >= NEW.amount THEN
        NEW.received = true;
        IF NEW.received_date IS NULL THEN
            NEW.received_date = CURRENT_DATE;
        END IF;
    ELSE
        NEW.received = false;
        NEW.received_date = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_accounts_receivable_status
    BEFORE UPDATE ON accounts_receivable
    FOR EACH ROW
    EXECUTE FUNCTION update_accounts_receivable_status();

-- Função para gerar contas a receber automaticamente de uma venda
CREATE OR REPLACE FUNCTION generate_accounts_receivable_from_sale(
    p_sale_id UUID,
    p_installments INTEGER DEFAULT 1,
    p_first_due_date DATE DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    sale_record RECORD;
    installment_amount DECIMAL;
    current_due_date DATE;
    i INTEGER;
BEGIN
    -- Busca dados da venda
    SELECT * INTO sale_record FROM sales WHERE id = p_sale_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Venda não encontrada: %', p_sale_id;
    END IF;
    
    -- Define data de vencimento padrão se não fornecida
    IF p_first_due_date IS NULL THEN
        current_due_date = CURRENT_DATE + INTERVAL '30 days';
    ELSE
        current_due_date = p_first_due_date;
    END IF;
    
    -- Calcula valor da parcela
    installment_amount = sale_record.total_amount / p_installments;
    
    -- Gera as parcelas
    FOR i IN 1..p_installments LOOP
        INSERT INTO accounts_receivable (
            client_id,
            sale_id,
            description,
            installment_number,
            total_installments,
            amount,
            due_date,
            user_id
        ) VALUES (
            sale_record.client_id,
            p_sale_id,
            'Venda ' || sale_record.number || ' - Parcela ' || i || '/' || p_installments,
            i,
            p_installments,
            CASE 
                WHEN i = p_installments THEN 
                    -- Última parcela pega o resto da divisão
                    sale_record.total_amount - (installment_amount * (p_installments - 1))
                ELSE 
                    installment_amount
            END,
            current_due_date,
            sale_record.user_id
        );
        
        -- Próxima parcela vence 30 dias depois
        current_due_date = current_due_date + INTERVAL '30 days';
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Comentários
COMMENT ON TABLE accounts_receivable IS 'Contas a receber da oficina';
COMMENT ON COLUMN accounts_receivable.installment_number IS 'Número da parcela atual';
COMMENT ON COLUMN accounts_receivable.total_installments IS 'Total de parcelas';
COMMENT ON COLUMN accounts_receivable.interest_amount IS 'Valor de juros por atraso';