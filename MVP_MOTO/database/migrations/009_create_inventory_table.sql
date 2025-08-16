-- Criar enum para tipo de movimentação
CREATE TYPE inventory_movement_type AS ENUM ('in', 'out', 'adjustment');

-- Criar tabela de movimentações de estoque
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id),
    type inventory_movement_type NOT NULL,
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2),
    reference VARCHAR(100),
    reference_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar view para estoque atual
CREATE VIEW current_inventory AS
SELECT 
    p.id as product_id,
    p.code,
    p.name,
    p.image_url,
    p.price,
    COALESCE(SUM(
        CASE 
            WHEN im.type = 'in' THEN im.quantity
            WHEN im.type = 'out' THEN -im.quantity
            WHEN im.type = 'adjustment' THEN im.quantity
        END
    ), 0) as current_stock
FROM products p
LEFT JOIN inventory_movements im ON p.id = im.product_id
WHERE p.type = 'product' AND p.active = true
GROUP BY p.id, p.code, p.name, p.image_url, p.price;

-- Criar índices
CREATE INDEX idx_inventory_movements_product_id ON inventory_movements(product_id);
CREATE INDEX idx_inventory_movements_type ON inventory_movements(type);
CREATE INDEX idx_inventory_movements_created_at ON inventory_movements(created_at);
CREATE INDEX idx_inventory_movements_reference ON inventory_movements(reference);
CREATE INDEX idx_inventory_movements_reference_id ON inventory_movements(reference_id);

-- Adicionar constraints
ALTER TABLE inventory_movements ADD CONSTRAINT check_inventory_quantity_not_zero 
    CHECK (quantity != 0);

ALTER TABLE inventory_movements ADD CONSTRAINT check_inventory_unit_cost_positive 
    CHECK (unit_cost IS NULL OR unit_cost >= 0);

-- Função para registrar movimentação de estoque
CREATE OR REPLACE FUNCTION register_inventory_movement(
    p_product_id UUID,
    p_type inventory_movement_type,
    p_quantity INTEGER,
    p_unit_cost DECIMAL DEFAULT NULL,
    p_reference VARCHAR DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    movement_id UUID;
BEGIN
    INSERT INTO inventory_movements (
        product_id, type, quantity, unit_cost, reference, reference_id
    ) VALUES (
        p_product_id, p_type, p_quantity, p_unit_cost, p_reference, p_reference_id
    ) RETURNING id INTO movement_id;
    
    RETURN movement_id;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar estoque disponível
CREATE OR REPLACE FUNCTION get_available_stock(p_product_id UUID)
RETURNS INTEGER AS $$
DECLARE
    available_stock INTEGER;
BEGIN
    SELECT COALESCE(current_stock, 0)
    INTO available_stock
    FROM current_inventory
    WHERE product_id = p_product_id;
    
    RETURN COALESCE(available_stock, 0);
END;
$$ LANGUAGE plpgsql;

-- Comentários
COMMENT ON TABLE inventory_movements IS 'Tabela de movimentações de estoque';
COMMENT ON COLUMN inventory_movements.type IS 'Tipo de movimentação: entrada, saída ou ajuste';
COMMENT ON COLUMN inventory_movements.reference IS 'Referência da movimentação (ex: Venda, OS, Compra)';
COMMENT ON COLUMN inventory_movements.reference_id IS 'ID da referência (sale_id, service_order_id, etc)';
COMMENT ON VIEW current_inventory IS 'View com estoque atual de todos os produtos';