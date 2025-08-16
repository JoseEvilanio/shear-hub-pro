-- Migration: 009_create_sales_table.sql
-- Criação da tabela de vendas

CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number VARCHAR(20) UNIQUE NOT NULL DEFAULT generate_sale_number(),
    client_id UUID REFERENCES clients(id),
    user_id UUID NOT NULL REFERENCES users(id),
    type sale_type NOT NULL DEFAULT 'sale',
    status sale_status DEFAULT 'pending',
    
    -- Valores
    subtotal DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Pagamento
    payment_method payment_method,
    installments INTEGER DEFAULT 1,
    paid BOOLEAN DEFAULT false,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Datas
    sale_date TIMESTAMP DEFAULT NOW(),
    due_date DATE,
    
    -- Observações
    notes TEXT,
    internal_notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT sales_subtotal_positive CHECK (subtotal >= 0),
    CONSTRAINT sales_discount_positive CHECK (discount_amount >= 0),
    CONSTRAINT sales_total_positive CHECK (total_amount >= 0),
    CONSTRAINT sales_paid_amount_positive CHECK (paid_amount >= 0),
    CONSTRAINT sales_installments_positive CHECK (installments > 0),
    CONSTRAINT sales_discount_not_greater_than_subtotal CHECK (discount_amount <= subtotal),
    CONSTRAINT sales_paid_amount_not_greater_than_total CHECK (paid_amount <= total_amount),
    CONSTRAINT sales_installment_payment_method CHECK (
        (installments = 1) OR (payment_method = 'installment')
    )
);

-- Índices
CREATE INDEX idx_sales_number ON sales(number);
CREATE INDEX idx_sales_client_id ON sales(client_id);
CREATE INDEX idx_sales_user_id ON sales(user_id);
CREATE INDEX idx_sales_type ON sales(type);
CREATE INDEX idx_sales_status ON sales(status);
CREATE INDEX idx_sales_payment_method ON sales(payment_method);
CREATE INDEX idx_sales_sale_date ON sales(sale_date);
CREATE INDEX idx_sales_due_date ON sales(due_date);
CREATE INDEX idx_sales_paid ON sales(paid);

-- Índice composto para relatórios
CREATE INDEX idx_sales_reports ON sales(sale_date, type, status, user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_sales_updated_at
    BEFORE UPDATE ON sales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar status de pagamento automaticamente
CREATE OR REPLACE FUNCTION update_sale_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualiza status de pagamento baseado no valor pago
    IF NEW.paid_amount >= NEW.total_amount THEN
        NEW.paid = true;
    ELSE
        NEW.paid = false;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sales_payment_status
    BEFORE UPDATE ON sales
    FOR EACH ROW
    EXECUTE FUNCTION update_sale_payment_status();

-- Comentários
COMMENT ON TABLE sales IS 'Vendas e orçamentos da oficina';
COMMENT ON COLUMN sales.type IS 'Tipo: sale (venda) ou quote (orçamento)';
COMMENT ON COLUMN sales.installments IS 'Número de parcelas (1 para à vista)';
COMMENT ON COLUMN sales.internal_notes IS 'Observações internas (não aparecem para o cliente)';