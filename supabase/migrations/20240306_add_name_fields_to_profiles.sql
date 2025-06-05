-- Adiciona campos de nome à tabela profiles
ALTER TABLE profiles
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT;

-- Atualiza a política RLS para permitir acesso aos novos campos
ALTER POLICY "Users can view their own profile" ON profiles
USING (auth.uid() = id);

-- Atualiza a política RLS para permitir atualização dos novos campos
ALTER POLICY "Users can update their own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

-- Comentários para documentação
COMMENT ON COLUMN profiles.first_name IS 'Primeiro nome do usuário';
COMMENT ON COLUMN profiles.last_name IS 'Sobrenome do usuário'; 