-- Migration: 006_create_products_table.sql
-- Criação da tabela de produtos e serviços

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    barcode VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type product_type NOT NULL DEFAULT 'product',
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    cost DECIMAL(10,2) DEFAULT 0,
    stock_quantity INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    max_stock INTEGER,
    unit VARCHAR(20) DEFAULT 'UN',
    category VARCHAR(100),
    brand VARCHAR(100),
    supplier_id UUID REFERENCES suppliers(id),
    image_url TEXT,
    weight DECIMAL(8,3),
    dimensions VARCHAR(50),
    warranty_months INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT products_code_not_empty CHECK (LENGTH(TRIM(code)) > 0),
    CONSTRAINT products_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT products_price_positive CHECK (price >= 0),
    CONSTRAINT products_cost_positive CHECK (cost IS NULL OR cost >= 0),
    CONSTRAINT products_stock_quantity_positive CHECK (stock_quantity >= 0),
    CONSTRAINT products_min_stock_positive CHECK (min_stock >= 0),
    CONSTRAINT products_max_stock_valid CHECK (max_stock IS NULL OR max_stock >= min_stock),
    CONSTRAINT products_warranty_positive CHECK (warranty_months >= 0),
    CONSTRAINT products_weight_positive CHECK (weight IS NULL OR weight > 0)
);

-- Índices
CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_supplier_id ON products(supplier_id);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_stock_low ON products(stock_quantity, min_stock) WHERE stock_quantity <= min_stock;

-- Índice para busca de texto
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('portuguese', 
    name || ' ' || COALESCE(description, '') || ' ' || COALESCE(code, '') || ' ' || COALESCE(barcode, '') || ' ' || COALESCE(brand, '')
));

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE products IS 'Produtos e serviços da oficina';
COMMENT ON COLUMN products.type IS 'Tipo: product (produto físico) ou service (serviço)';
COMMENT ON COLUMN products.stock_quantity IS 'Quantidade atual em estoque';
COMMENT ON COLUMN products.min_stock IS 'Estoque mínimo para alerta';
COMMENT ON COLUMN products.unit IS 'Unidade de medida (UN, KG, L, M, etc.)';
COMMENT ON COLUMN products.warranty_months IS 'Garantia em meses';