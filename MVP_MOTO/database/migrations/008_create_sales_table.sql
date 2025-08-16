-- Criar enums para vendas
CREATE TYPE sale_type AS ENUM ('order', 'quote');
CREATE TYPE sale_status AS ENUM ('pending', 'completed', 'cancelled');
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'pix', 'installment');

-- Criar tabela de vendas
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number VARCHAR(20) UNIQUE NOT NULL,
    client_id UUID REFERENCES clients(id),
    user_id UUID NOT NULL REFERENCES users(id),
    type sale_type NOT NULL DEFAULT 'order',
    status sale_status NOT NULL DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_method payment_method,
    paid BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de itens da venda
CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para sales
CREATE INDEX idx_sales_number ON sales(number);
CREATE INDEX idx_sales_client_id ON sales(client_id);
CREATE INDEX idx_sales_user_id ON sales(user_id);
CREATE INDEX idx_sales_type ON sales(type);
CREATE INDEX idx_sales_status ON sales(status);
CREATE INDEX idx_sales_payment_method ON sales(payment_method);
CREATE INDEX idx_sales_created_at ON sales(created_at);
CREATE INDEX idx_sales_paid ON sales(paid);

-- Criar índices para sale_items
CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product_id ON sale_items(product_id);

-- Criar triggers para atualizar updated_at
CREATE TRIGGER update_sales_updated_at 
    BEFORE UPDATE ON sales 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Adicionar constraints
ALTER TABLE sales ADD CONSTRAINT check_subtotal_positive 
    CHECK (subtotal >= 0);

ALTER TABLE sales ADD CONSTRAINT check_discount_amount_positive 
    CHECK (discount_amount >= 0);

ALTER TABLE sales ADD CONSTRAINT check_total_amount_positive 
    CHECK (total_amount >= 0);

ALTER TABLE sale_items ADD CONSTRAINT check_sale_quantity_positive 
    CHECK (quantity > 0);

ALTER TABLE sale_items ADD CONSTRAINT check_sale_unit_price_positive 
    CHECK (unit_price >= 0);

ALTER TABLE sale_items ADD CONSTRAINT check_sale_discount_amount_positive 
    CHECK (discount_amount >= 0);

ALTER TABLE sale_items ADD CONSTRAINT check_sale_total_price_positive 
    CHECK (total_price >= 0);

-- Função para gerar número sequencial da venda
CREATE OR REPLACE FUNCTION generate_sale_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    formatted_number TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(number FROM 2) AS INTEGER)), 0) + 1
    INTO next_number
    FROM sales
    WHERE number ~ '^V\d+$';
    
    formatted_number := 'V' || LPAD(next_number::TEXT, 6, '0');
    RETURN formatted_number;
END;
$$ LANGUAGE plpgsql;

-- Comentários
COMMENT ON TABLE sales IS 'Tabela de vendas';
COMMENT ON COLUMN sales.number IS 'Número sequencial da venda (ex: V000001)';
COMMENT ON COLUMN sales.type IS 'Tipo: pedido ou orçamento';
COMMENT ON COLUMN sales.discount_amount IS 'Valor do desconto aplicado';
COMMENT ON TABLE sale_items IS 'Itens da venda';