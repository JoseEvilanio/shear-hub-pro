-- Script de Inicialização do Banco de Dados
-- Sistema de Gestão de Oficina Mecânica de Motos

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Criar tipos enumerados
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'operator', 'mechanic');
CREATE TYPE service_order_status AS ENUM ('pending', 'in_progress', 'waiting_parts', 'completed', 'delivered', 'cancelled');
CREATE TYPE sale_type AS ENUM ('sale', 'quote');
CREATE TYPE sale_status AS ENUM ('pending', 'completed', 'cancelled');
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'pix', 'installment');
CREATE TYPE product_type AS ENUM ('product', 'service');
CREATE TYPE inventory_movement_type AS ENUM ('in', 'out', 'adjustment');
CREATE TYPE cash_movement_type AS ENUM ('in', 'out');

-- Função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Função para validar CPF
CREATE OR REPLACE FUNCTION validate_cpf(cpf_input TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    cpf TEXT;
    sum1 INTEGER := 0;
    sum2 INTEGER := 0;
    i INTEGER;
    digit1 INTEGER;
    digit2 INTEGER;
BEGIN
    -- Remove caracteres não numéricos
    cpf := regexp_replace(cpf_input, '[^0-9]', '', 'g');
    
    -- Verifica se tem 11 dígitos
    IF length(cpf) != 11 THEN
        RETURN FALSE;
    END IF;
    
    -- Verifica se todos os dígitos são iguais
    IF cpf ~ '^(\d)\1{10}$' THEN
        RETURN FALSE;
    END IF;
    
    -- Calcula primeiro dígito verificador
    FOR i IN 1..9 LOOP
        sum1 := sum1 + (substring(cpf, i, 1)::INTEGER * (11 - i));
    END LOOP;
    
    digit1 := 11 - (sum1 % 11);
    IF digit1 >= 10 THEN
        digit1 := 0;
    END IF;
    
    -- Calcula segundo dígito verificador
    FOR i IN 1..10 LOOP
        sum2 := sum2 + (substring(cpf, i, 1)::INTEGER * (12 - i));
    END LOOP;
    
    digit2 := 11 - (sum2 % 11);
    IF digit2 >= 10 THEN
        digit2 := 0;
    END IF;
    
    -- Verifica se os dígitos calculados conferem
    RETURN (substring(cpf, 10, 1)::INTEGER = digit1 AND substring(cpf, 11, 1)::INTEGER = digit2);
END;
$$ LANGUAGE plpgsql;

-- Função para validar CNPJ
CREATE OR REPLACE FUNCTION validate_cnpj(cnpj_input TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    cnpj TEXT;
    sum1 INTEGER := 0;
    sum2 INTEGER := 0;
    i INTEGER;
    digit1 INTEGER;
    digit2 INTEGER;
    weights1 INTEGER[] := ARRAY[5,4,3,2,9,8,7,6,5,4,3,2];
    weights2 INTEGER[] := ARRAY[6,5,4,3,2,9,8,7,6,5,4,3,2];
BEGIN
    -- Remove caracteres não numéricos
    cnpj := regexp_replace(cnpj_input, '[^0-9]', '', 'g');
    
    -- Verifica se tem 14 dígitos
    IF length(cnpj) != 14 THEN
        RETURN FALSE;
    END IF;
    
    -- Verifica se todos os dígitos são iguais
    IF cnpj ~ '^(\d)\1{13}$' THEN
        RETURN FALSE;
    END IF;
    
    -- Calcula primeiro dígito verificador
    FOR i IN 1..12 LOOP
        sum1 := sum1 + (substring(cnpj, i, 1)::INTEGER * weights1[i]);
    END LOOP;
    
    digit1 := sum1 % 11;
    IF digit1 < 2 THEN
        digit1 := 0;
    ELSE
        digit1 := 11 - digit1;
    END IF;
    
    -- Calcula segundo dígito verificador
    FOR i IN 1..13 LOOP
        sum2 := sum2 + (substring(cnpj, i, 1)::INTEGER * weights2[i]);
    END LOOP;
    
    digit2 := sum2 % 11;
    IF digit2 < 2 THEN
        digit2 := 0;
    ELSE
        digit2 := 11 - digit2;
    END IF;
    
    -- Verifica se os dígitos calculados conferem
    RETURN (substring(cnpj, 13, 1)::INTEGER = digit1 AND substring(cnpj, 14, 1)::INTEGER = digit2);
END;
$$ LANGUAGE plpgsql;

-- Função para gerar próximo número de OS
CREATE OR REPLACE FUNCTION generate_service_order_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    year_suffix TEXT;
BEGIN
    year_suffix := EXTRACT(YEAR FROM NOW())::TEXT;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(number FROM 1 FOR LENGTH(number) - 4) AS INTEGER)), 0) + 1
    INTO next_number
    FROM service_orders
    WHERE number LIKE '%' || year_suffix;
    
    RETURN LPAD(next_number::TEXT, 6, '0') || year_suffix;
END;
$$ LANGUAGE plpgsql;

-- Função para gerar próximo número de venda
CREATE OR REPLACE FUNCTION generate_sale_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    year_suffix TEXT;
BEGIN
    year_suffix := EXTRACT(YEAR FROM NOW())::TEXT;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(number FROM 1 FOR LENGTH(number) - 4) AS INTEGER)), 0) + 1
    INTO next_number
    FROM sales
    WHERE number LIKE '%' || year_suffix;
    
    RETURN LPAD(next_number::TEXT, 6, '0') || year_suffix;
END;
$$ LANGUAGE plpgsql;

-- Configurações iniciais
INSERT INTO pg_settings (name, setting) VALUES ('timezone', 'America/Sao_Paulo') ON CONFLICT DO NOTHING;