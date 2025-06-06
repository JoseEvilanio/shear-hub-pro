-- Remover todas as políticas existentes
drop policy if exists "Usuários podem ver seus próprios perfis" on public.profiles;
drop policy if exists "Usuários podem atualizar seus próprios perfis" on public.profiles;
drop policy if exists "Usuários podem inserir seus próprios perfis" on public.profiles;
drop policy if exists "Admins podem ver todos os perfis" on public.profiles;
drop policy if exists "Admins podem atualizar todos os perfis" on public.profiles;

-- Atualizar a estrutura da tabela profiles
alter table public.profiles
  add column if not exists phone text,
  add column if not exists data jsonb default '{}'::jsonb,
  add column if not exists genero text,
  add column if not exists biografia text,
  add column if not exists role text;

-- Criar função is_superuser
create or replace function public.is_superuser()
returns boolean as $$
begin
  return exists (
    select 1
    from public.profiles
    where public.profiles.id = auth.uid()
    and public.profiles.role = 'superuser'
  );
end;
$$ language plpgsql security definer;

-- Criar novas políticas RLS
create policy "Usuários podem ver seus próprios perfis"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuários podem atualizar seus próprios perfis"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Usuários podem inserir seus próprios perfis"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Criar políticas para administradores (usando a função is_superuser)
create policy "Admins podem ver todos os perfis"
  on public.profiles for select
  using (is_superuser());

create policy "Admins podem atualizar todos os perfis"
  on public.profiles for update
  using (is_superuser()); 