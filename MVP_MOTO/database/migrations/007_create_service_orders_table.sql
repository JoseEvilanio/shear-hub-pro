-- Migration: 007_create_service_orders_table.sql
-- Criação da tabela de ordens de serviço

CREATE TABLE service_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number VARCHAR(20) UNIQUE NOT NULL DEFAULT generate_service_order_number(),
    client_id UUID NOT NULL REFERENCES clients(id),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    mechanic_id UUID REFERENCES mechanics(id),
    user_id UUID REFERENCES users(id),
    
    -- 9 linhas de descrição conforme requisito
    description_line_1 TEXT,
    description_line_2 TEXT,
    description_line_3 TEXT,
    description_line_4 TEXT,
    description_line_5 TEXT,
    description_line_6 TEXT,
    description_line_7 TEXT,
    description_line_8 TEXT,
    description_line_9 TEXT,
    
    status service_order_status DEFAULT 'pending',
    priority INTEGER DEFAULT 3, -- 1=Alta, 2=Média, 3=Baixa
    
    -- Valores
    labor_amount DECIMAL(10,2) DEFAULT 0,
    parts_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Datas
    scheduled_date TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    delivered_at TIMESTAMP,
    
    -- Observações
    internal_notes TEXT,
    customer_notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT service_orders_priority_valid CHECK (priority IN (1, 2, 3)),
    CONSTRAINT service_orders_labor_amount_positive CHECK (labor_amount >= 0),
    CONSTRAINT service_orders_parts_amount_positive CHECK (parts_amount >= 0),
    CONSTRAINT service_orders_discount_amount_positive CHECK (discount_amount >= 0),
    CONSTRAINT service_orders_total_amount_positive CHECK (total_amount >= 0),
    CONSTRAINT service_orders_dates_logical CHECK (
        (started_at IS NULL OR started_at >= created_at) AND
        (completed_at IS NULL OR started_at IS NULL OR completed_at >= started_at) AND
        (delivered_at IS NULL OR completed_at IS NULL OR delivered_at >= completed_at)
    )
);

-- Índices
CREATE INDEX idx_service_orders_number ON service_orders(number);
CREATE INDEX idx_service_orders_client_id ON service_orders(client_id);
CREATE INDEX idx_service_orders_vehicle_id ON service_orders(vehicle_id);
CREATE INDEX idx_service_orders_mechanic_id ON service_orders(mechanic_id);
CREATE INDEX idx_service_orders_user_id ON service_orders(user_id);
CREATE INDEX idx_service_orders_status ON service_orders(status);
CREATE INDEX idx_service_orders_priority ON service_orders(priority);
CREATE INDEX idx_service_orders_created_at ON service_orders(created_at);
CREATE INDEX idx_service_orders_scheduled_date ON service_orders(scheduled_date);

-- Índice composto para relatórios
CREATE INDEX idx_service_orders_reports ON service_orders(status, mechanic_id, created_at);

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_service_orders_updated_at
    BEFORE UPDATE ON service_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar datas de status automaticamente
CREATE OR REPLACE FUNCTION update_service_order_status_dates()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualiza started_at quando status muda para in_progress
    IF OLD.status != 'in_progress' AND NEW.status = 'in_progress' AND NEW.started_at IS NULL THEN
        NEW.started_at = NOW();
    END IF;
    
    -- Atualiza completed_at quando status muda para completed
    IF OLD.status != 'completed' AND NEW.status = 'completed' AND NEW.completed_at IS NULL THEN
        NEW.completed_at = NOW();
    END IF;
    
    -- Atualiza delivered_at quando status muda para delivered
    IF OLD.status != 'delivered' AND NEW.status = 'delivered' AND NEW.delivered_at IS NULL THEN
        NEW.delivered_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_service_orders_status_dates
    BEFORE UPDATE ON service_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_service_order_status_dates();

-- Comentários
COMMENT ON TABLE service_orders IS 'Ordens de serviço da oficina';
COMMENT ON COLUMN service_orders.number IS 'Número sequencial da OS (gerado automaticamente)';
COMMENT ON COLUMN service_orders.priority IS '1=Alta, 2=Média, 3=Baixa';
COMMENT ON COLUMN service_orders.internal_notes IS 'Observações internas (não aparecem para o cliente)';
COMMENT ON COLUMN service_orders.customer_notes IS 'Observações para o cliente';