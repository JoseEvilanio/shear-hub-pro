-- Criação da tabela profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  first_name text,
  last_name text,
  email text,
  phone text,
  data jsonb default '{}'::jsonb,
  genero text,
  biografia text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Configuração de RLS
alter table public.profiles enable row level security;

-- Remover políticas existentes
drop policy if exists "Usuários podem ver seus próprios perfis" on public.profiles;
drop policy if exists "Usuários podem atualizar seus próprios perfis" on public.profiles;
drop policy if exists "Usuários podem inserir seus próprios perfis" on public.profiles;

-- Políticas de segurança
create policy "Usuários podem ver seus próprios perfis"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuários podem atualizar seus próprios perfis"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Usuários podem inserir seus próprios perfis"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Função para criar perfil automaticamente
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    split_part(new.raw_user_meta_data->>'full_name', ' ', 1),
    split_part(new.raw_user_meta_data->>'full_name', ' ', 2)
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger para criar perfil automaticamente
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 