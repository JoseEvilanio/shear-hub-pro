-- Migration: 008_create_service_order_items_table.sql
-- Criação da tabela de itens das ordens de serviço

CREATE TABLE service_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_order_id UUID NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT service_order_items_quantity_positive CHECK (quantity > 0),
    CONSTRAINT service_order_items_unit_price_positive CHECK (unit_price >= 0),
    CONSTRAINT service_order_items_discount_positive CHECK (discount_amount >= 0),
    CONSTRAINT service_order_items_total_price_positive CHECK (total_price >= 0),
    CONSTRAINT service_order_items_discount_not_greater_than_subtotal CHECK (
        discount_amount <= (quantity * unit_price)
    )
);

-- Índices
CREATE INDEX idx_service_order_items_service_order_id ON service_order_items(service_order_id);
CREATE INDEX idx_service_order_items_product_id ON service_order_items(product_id);

-- Trigger para atualizar total da OS automaticamente
CREATE OR REPLACE FUNCTION update_service_order_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualiza os totais da ordem de serviço
    UPDATE service_orders 
    SET 
        parts_amount = (
            SELECT COALESCE(SUM(total_price), 0) 
            FROM service_order_items 
            WHERE service_order_id = COALESCE(NEW.service_order_id, OLD.service_order_id)
        ),
        total_amount = labor_amount + (
            SELECT COALESCE(SUM(total_price), 0) 
            FROM service_order_items 
            WHERE service_order_id = COALESCE(NEW.service_order_id, OLD.service_order_id)
        ) - discount_amount
    WHERE id = COALESCE(NEW.service_order_id, OLD.service_order_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_service_order_items_update_totals
    AFTER INSERT OR UPDATE OR DELETE ON service_order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_service_order_totals();

-- Comentários
COMMENT ON TABLE service_order_items IS 'Itens (produtos/serviços) utilizados nas ordens de serviço';
COMMENT ON COLUMN service_order_items.notes IS 'Observações específicas do item na OS';