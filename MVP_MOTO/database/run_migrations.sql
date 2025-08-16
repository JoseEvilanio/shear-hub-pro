-- Script para executar todas as migrations do Sistema de Gestão de Oficina Mecânica de Motos
-- Execute este script no SQL Editor do Supabase

-- 001 - Criar tabela de usuários
\i 001_create_users_table.sql

-- 002 - Criar tabela de clientes
\i 002_create_clients_table.sql

-- 003 - Criar tabela de fornecedores
\i 003_create_suppliers_table.sql

-- 004 - Criar tabela de mecânicos
\i 004_create_mechanics_table.sql

-- 005 - Criar tabela de veículos
\i 005_create_vehicles_table.sql

-- 006 - Criar tabela de produtos
\i 006_create_products_table.sql

-- 007 - Criar tabela de ordens de serviço
\i 007_create_service_orders_table.sql

-- 008 - Criar tabela de vendas
\i 008_create_sales_table.sql

-- 009 - Criar tabela de estoque
\i 009_create_inventory_table.sql

-- 010 - Criar tabelas financeiras
\i 010_create_financial_tables.sql

-- 011 - Criar tabela de configurações
\i 011_create_system_config_table.sql

-- Verificar se todas as tabelas foram criadas
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;