-- Migration: 011_create_inventory_movements_table.sql
-- Criação da tabela de movimentações de estoque

CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id),
    type inventory_movement_type NOT NULL,
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    reference_type VARCHAR(50), -- 'sale', 'service_order', 'purchase', 'adjustment'
    reference_id UUID,
    reference_number VARCHAR(50),
    description TEXT,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT inventory_movements_quantity_not_zero CHECK (quantity != 0),
    CONSTRAINT inventory_movements_unit_cost_positive CHECK (unit_cost IS NULL OR unit_cost >= 0),
    CONSTRAINT inventory_movements_total_cost_positive CHECK (total_cost IS NULL OR total_cost >= 0),
    CONSTRAINT inventory_movements_quantity_type_consistency CHECK (
        (type = 'in' AND quantity > 0) OR 
        (type = 'out' AND quantity < 0) OR 
        (type = 'adjustment')
    )
);

-- Índices
CREATE INDEX idx_inventory_movements_product_id ON inventory_movements(product_id);
CREATE INDEX idx_inventory_movements_type ON inventory_movements(type);
CREATE INDEX idx_inventory_movements_reference ON inventory_movements(reference_type, reference_id);
CREATE INDEX idx_inventory_movements_created_at ON inventory_movements(created_at);
CREATE INDEX idx_inventory_movements_user_id ON inventory_movements(user_id);

-- Índice composto para relatórios
CREATE INDEX idx_inventory_movements_reports ON inventory_movements(product_id, created_at, type);

-- Trigger para atualizar estoque do produto automaticamente
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Adiciona/remove do estoque baseado no tipo de movimento
        UPDATE products 
        SET stock_quantity = stock_quantity + NEW.quantity
        WHERE id = NEW.product_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Reverte o movimento no estoque
        UPDATE products 
        SET stock_quantity = stock_quantity - OLD.quantity
        WHERE id = OLD.product_id;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_inventory_movements_update_stock
    AFTER INSERT OR DELETE ON inventory_movements
    FOR EACH ROW
    EXECUTE FUNCTION update_product_stock();

-- Função para criar movimento de estoque automaticamente
CREATE OR REPLACE FUNCTION create_inventory_movement(
    p_product_id UUID,
    p_type inventory_movement_type,
    p_quantity INTEGER,
    p_unit_cost DECIMAL DEFAULT NULL,
    p_reference_type VARCHAR DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL,
    p_reference_number VARCHAR DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    movement_id UUID;
    calculated_total_cost DECIMAL;
BEGIN
    -- Calcula custo total se unit_cost foi fornecido
    IF p_unit_cost IS NOT NULL THEN
        calculated_total_cost = ABS(p_quantity) * p_unit_cost;
    END IF;
    
    -- Insere o movimento
    INSERT INTO inventory_movements (
        product_id, type, quantity, unit_cost, total_cost,
        reference_type, reference_id, reference_number,
        description, user_id
    ) VALUES (
        p_product_id, p_type, p_quantity, p_unit_cost, calculated_total_cost,
        p_reference_type, p_reference_id, p_reference_number,
        p_description, p_user_id
    ) RETURNING id INTO movement_id;
    
    RETURN movement_id;
END;
$$ LANGUAGE plpgsql;

-- Comentários
COMMENT ON TABLE inventory_movements IS 'Movimentações de estoque (entradas, saídas e ajustes)';
COMMENT ON COLUMN inventory_movements.quantity IS 'Quantidade (positiva para entrada, negativa para saída)';
COMMENT ON COLUMN inventory_movements.reference_type IS 'Tipo de referência que gerou o movimento';
COMMENT ON COLUMN inventory_movements.reference_id IS 'ID da referência que gerou o movimento';
COMMENT ON COLUMN inventory_movements.reference_number IS 'Número da referência (ex: número da venda)';