-- Atualizar senha do usuário admin para funcionar com bcrypt
UPDATE users 
SET password_hash = '$2a$10$ppvD5CTXe8uM8QB9sEbmheRGgpNtZ6b8lKPdUznI3D1tyHec6Ce5O'
WHERE email = 'admin@oficina.com';

-- Verificar se foi atualizado
SELECT id, email, name, role, password_hash 
FROM users 
WHERE email = 'admin@oficina.com';