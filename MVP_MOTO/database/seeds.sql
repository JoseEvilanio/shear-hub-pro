-- Seeds - Dados iniciais do sistema
-- Sistema de Gestão de Oficina Mecânica de Motos

-- Inserir usuário administrador padrão
INSERT INTO users (email, password_hash, name, role) VALUES 
('admin@oficina.com', '$2b$10$rQZ8kHWKtGOuGjB5qJ5qKOX8kHWKtGOuGjB5qJ5qKOX8kHWKtGOuGj', 'Administrador', 'admin'),
('gerente@oficina.com', '$2b$10$rQZ8kHWKtGOuGjB5qJ5qKOX8kHWKtGOuGjB5qJ5qKOX8kHWKtGOuGj', 'Gerente', 'manager'),
('operador@oficina.com', '$2b$10$rQZ8kHWKtGOuGjB5qJ5qKOX8kHWKtGOuGjB5qJ5qKOX8kHWKtGOuGj', 'Operador', 'operator');

-- Configurações iniciais do sistema
SELECT set_config('company_name', 'Oficina de Motos', 'Nome da empresa', 'string', 'company', true);
SELECT set_config('company_cnpj', '', 'CNPJ da empresa', 'string', 'company', true);
SELECT set_config('company_address', '', 'Endereço da empresa', 'string', 'company', true);
SELECT set_config('company_phone', '', 'Telefone da empresa', 'string', 'company', true);
SELECT set_config('company_email', '', 'Email da empresa', 'string', 'company', true);
SELECT set_config('company_logo_url', '', 'URL do logotipo da empresa', 'string', 'company', true);

-- Configurações de sistema
SELECT set_config('system_timezone', 'America/Sao_Paulo', 'Fuso horário do sistema', 'string', 'system', false);
SELECT set_config('currency_symbol', 'R$', 'Símbolo da moeda', 'string', 'system', true);
SELECT set_config('currency_decimal_places', '2', 'Casas decimais da moeda', 'number', 'system', true);
SELECT set_config('date_format', 'DD/MM/YYYY', 'Formato de data', 'string', 'system', true);
SELECT set_config('time_format', 'HH:mm', 'Formato de hora', 'string', 'system', true);

-- Configurações de estoque
SELECT set_config('stock_alert_enabled', 'true', 'Alertas de estoque baixo habilitados', 'boolean', 'inventory', true);
SELECT set_config('stock_alert_days_before', '7', 'Dias de antecedência para alertas', 'number', 'inventory', false);
SELECT set_config('auto_stock_update', 'true', 'Atualização automática de estoque', 'boolean', 'inventory', false);

-- Configurações de vendas
SELECT set_config('sale_number_prefix', 'VD', 'Prefixo do número de venda', 'string', 'sales', false);
SELECT set_config('quote_number_prefix', 'OR', 'Prefixo do número de orçamento', 'string', 'sales', false);
SELECT set_config('default_payment_terms', '30', 'Prazo padrão de pagamento (dias)', 'number', 'sales', false);
SELECT set_config('max_discount_percent', '20', 'Desconto máximo permitido (%)', 'number', 'sales', false);

-- Configurações de OS
SELECT set_config('os_number_prefix', 'OS', 'Prefixo do número de OS', 'string', 'service_orders', false);
SELECT set_config('os_default_priority', '3', 'Prioridade padrão de OS (1-3)', 'number', 'service_orders', false);
SELECT set_config('os_auto_status_update', 'true', 'Atualização automática de status', 'boolean', 'service_orders', false);

-- Configurações de impressão
SELECT set_config('print_company_logo', 'true', 'Imprimir logotipo da empresa', 'boolean', 'printing', false);
SELECT set_config('print_footer_text', 'Obrigado pela preferência!', 'Texto do rodapé', 'string', 'printing', false);
SELECT set_config('receipt_printer_type', 'matrix', 'Tipo de impressora de recibo', 'string', 'printing', false);
SELECT set_config('report_printer_type', 'laser', 'Tipo de impressora de relatórios', 'string', 'printing', false);

-- Inserir categorias padrão de produtos
INSERT INTO products (code, name, type, category, price, active) VALUES
('SERV001', 'Troca de Óleo', 'service', 'Manutenção', 50.00, true),
('SERV002', 'Revisão Geral', 'service', 'Manutenção', 150.00, true),
('SERV003', 'Regulagem de Motor', 'service', 'Motor', 80.00, true),
('SERV004', 'Troca de Pastilha de Freio', 'service', 'Freios', 60.00, true),
('SERV005', 'Alinhamento e Balanceamento', 'service', 'Suspensão', 40.00, true);

-- Inserir alguns produtos de exemplo
INSERT INTO products (code, barcode, name, type, category, brand, price, cost, stock_quantity, min_stock, unit, active) VALUES
('PROD001', '7891234567890', 'Óleo Motor 20W50 1L', 'product', 'Lubrificantes', 'Castrol', 25.90, 18.50, 50, 10, 'UN', true),
('PROD002', '7891234567891', 'Filtro de Óleo', 'product', 'Filtros', 'Tecfil', 15.90, 12.00, 30, 5, 'UN', true),
('PROD003', '7891234567892', 'Pastilha de Freio Dianteira', 'product', 'Freios', 'Cobreq', 45.90, 32.00, 20, 3, 'JG', true),
('PROD004', '7891234567893', 'Vela de Ignição', 'product', 'Motor', 'NGK', 12.90, 8.50, 40, 8, 'UN', true),
('PROD005', '7891234567894', 'Corrente 428H', 'product', 'Transmissão', 'DID', 89.90, 65.00, 15, 3, 'UN', true);

-- Inserir fornecedores de exemplo
INSERT INTO suppliers (name, cnpj, phone, email, category, payment_terms, active) VALUES
('Distribuidora de Peças Ltda', '12.345.678/0001-90', '(11) 3456-7890', 'vendas@distribuidora.com', 'Peças', '30 dias', true),
('Lubrificantes e Filtros S/A', '98.765.432/0001-10', '(11) 2345-6789', 'comercial@lubrificantes.com', 'Lubrificantes', '45 dias', true),
('Ferramentas Profissionais', '11.222.333/0001-44', '(11) 4567-8901', 'atendimento@ferramentas.com', 'Ferramentas', '30 dias', true);

-- Inserir mecânicos de exemplo
INSERT INTO mechanics (name, phone, specialties, hourly_rate, commission_rate, active) VALUES
('João Silva', '(11) 99999-1111', ARRAY['Motor', 'Transmissão', 'Elétrica'], 45.00, 10.00, true),
('Maria Santos', '(11) 99999-2222', ARRAY['Freios', 'Suspensão', 'Direção'], 40.00, 8.00, true),
('Pedro Oliveira', '(11) 99999-3333', ARRAY['Carburação', 'Injeção', 'Motor'], 50.00, 12.00, true);

-- Inserir clientes de exemplo
INSERT INTO clients (name, cpf, phone, email, birth_date, address, active) VALUES
('Carlos Pereira', '123.456.789-09', '(11) 98765-4321', 'carlos@email.com', '1985-03-15', 'Rua das Flores, 123 - São Paulo/SP', true),
('Ana Costa', '987.654.321-00', '(11) 98765-1234', 'ana@email.com', '1990-07-22', 'Av. Paulista, 456 - São Paulo/SP', true),
('Roberto Lima', '456.789.123-45', '(11) 98765-5678', 'roberto@email.com', '1978-12-10', 'Rua do Comércio, 789 - São Paulo/SP', true);

-- Inserir veículos de exemplo
INSERT INTO vehicles (plate, brand, model, year, color, engine_size, fuel_type, client_id) VALUES
('ABC1234', 'Honda', 'CG 160', 2020, 'Vermelha', '160cc', 'flex', (SELECT id FROM clients WHERE cpf = '123.456.789-09')),
('DEF5678', 'Yamaha', 'Factor 125', 2019, 'Azul', '125cc', 'flex', (SELECT id FROM clients WHERE cpf = '987.654.321-00')),
('GHI9012', 'Suzuki', 'Intruder 125', 2021, 'Preta', '125cc', 'flex', (SELECT id FROM clients WHERE cpf = '456.789.123-45'));

-- Inserir movimentações iniciais de estoque
INSERT INTO inventory_movements (product_id, type, quantity, unit_cost, description, reference_type) VALUES
((SELECT id FROM products WHERE code = 'PROD001'), 'in', 50, 18.50, 'Estoque inicial', 'adjustment'),
((SELECT id FROM products WHERE code = 'PROD002'), 'in', 30, 12.00, 'Estoque inicial', 'adjustment'),
((SELECT id FROM products WHERE code = 'PROD003'), 'in', 20, 32.00, 'Estoque inicial', 'adjustment'),
((SELECT id FROM products WHERE code = 'PROD004'), 'in', 40, 8.50, 'Estoque inicial', 'adjustment'),
((SELECT id FROM products WHERE code = 'PROD005'), 'in', 15, 65.00, 'Estoque inicial', 'adjustment');

-- Comentários
COMMENT ON TABLE schema_migrations IS 'Controle de execução das migrations do banco de dados';

-- Mensagem de conclusão
DO $$
BEGIN
    RAISE NOTICE '✅ Seeds executadas com sucesso!';
    RAISE NOTICE '👤 Usuários criados:';
    RAISE NOTICE '   - admin@oficina.com (senha: admin123)';
    RAISE NOTICE '   - gerente@oficina.com (senha: admin123)';
    RAISE NOTICE '   - operador@oficina.com (senha: admin123)';
    RAISE NOTICE '🏢 Configurações básicas definidas';
    RAISE NOTICE '📦 Produtos e serviços de exemplo criados';
    RAISE NOTICE '👥 Clientes, mecânicos e fornecedores de exemplo criados';
    RAISE NOTICE '🏍️  Veículos de exemplo cadastrados';
    RAISE NOTICE '📊 Estoque inicial configurado';
END $$;