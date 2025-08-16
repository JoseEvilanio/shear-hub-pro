-- Migration: 010_create_sale_items_table.sql
-- Criação da tabela de itens das vendas

CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT sale_items_quantity_positive CHECK (quantity > 0),
    CONSTRAINT sale_items_unit_price_positive CHECK (unit_price >= 0),
    CONSTRAINT sale_items_discount_positive CHECK (discount_amount >= 0),
    CONSTRAINT sale_items_total_price_positive CHECK (total_price >= 0),
    CONSTRAINT sale_items_discount_not_greater_than_subtotal CHECK (
        discount_amount <= (quantity * unit_price)
    )
);

-- Índices
CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product_id ON sale_items(product_id);

-- Trigger para atualizar total da venda automaticamente
CREATE OR REPLACE FUNCTION update_sale_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualiza os totais da venda
    UPDATE sales 
    SET 
        subtotal = (
            SELECT COALESCE(SUM(quantity * unit_price), 0) 
            FROM sale_items 
            WHERE sale_id = COALESCE(NEW.sale_id, OLD.sale_id)
        ),
        total_amount = (
            SELECT COALESCE(SUM(total_price), 0) 
            FROM sale_items 
            WHERE sale_id = COALESCE(NEW.sale_id, OLD.sale_id)
        ) - discount_amount
    WHERE id = COALESCE(NEW.sale_id, OLD.sale_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sale_items_update_totals
    AFTER INSERT OR UPDATE OR DELETE ON sale_items
    FOR EACH ROW
    EXECUTE FUNCTION update_sale_totals();

-- Comentários
COMMENT ON TABLE sale_items IS 'Itens das vendas e orçamentos';
COMMENT ON COLUMN sale_items.notes IS 'Observações específicas do item na venda';