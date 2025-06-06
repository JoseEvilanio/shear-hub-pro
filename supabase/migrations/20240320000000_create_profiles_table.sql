-- Drop existing table if it exists (with CASCADE to handle dependencies)
drop table if exists public.profiles cascade;

-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  role text not null check (role in ('client', 'owner', 'admin', 'superuser')),
  first_name text,
  last_name text,
  phone text,
  data jsonb default '{}'::jsonb,
  genero text,
  biografia text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Usuários podem ver seus próprios perfis" on public.profiles;
drop policy if exists "Usuários podem atualizar seus próprios perfis" on public.profiles;
drop policy if exists "Usuários podem inserir seus próprios perfis" on public.profiles;
drop policy if exists "Admins podem ver todos os perfis" on public.profiles;
drop policy if exists "Admins podem atualizar todos os perfis" on public.profiles;

-- Create policies
create policy "Usuários podem ver seus próprios perfis"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuários podem atualizar seus próprios perfis"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Usuários podem inserir seus próprios perfis"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Política para admins verem todos os perfis
create policy "Admins podem ver todos os perfis"
  on public.profiles for select
  using (
    (select role from public.profiles where id = auth.uid()) in ('admin', 'superuser')
  );

-- Política para admins atualizarem todos os perfis
create policy "Admins podem atualizar todos os perfis"
  on public.profiles for update
  using (
    (select role from public.profiles where id = auth.uid()) in ('admin', 'superuser')
  );

-- Drop existing function and trigger if they exist
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Create function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_role text;
  error_message text;
begin
  -- Log the start of the function
  raise notice 'Starting handle_new_user for user: %', new.id;
  
  -- Get user role from metadata or default to 'client'
  user_role := coalesce(new.raw_user_meta_data->>'role', 'client');
  raise notice 'User role determined as: %', user_role;

  begin
    -- Insert into profiles table with the user's id
    insert into public.profiles (id, email, role, first_name, last_name, phone, data, genero, biografia)
    values (
      new.id,  -- Explicitly set the id to match auth.users
      new.email,
      user_role,
      coalesce(new.raw_user_meta_data->>'first_name', ''),
      coalesce(new.raw_user_meta_data->>'last_name', ''),
      coalesce(new.raw_user_meta_data->>'phone', ''),
      coalesce(new.raw_user_meta_data->'data', '{}'::jsonb),
      coalesce(new.raw_user_meta_data->>'genero', ''),
      coalesce(new.raw_user_meta_data->>'biografia', '')
    );
    
    raise notice 'Successfully created profile for user: %', new.id;
  exception when others then
    -- Get the error message
    error_message := SQLERRM;
    raise notice 'Error creating profile: %', error_message;
    
    -- Re-raise the error to ensure the transaction is rolled back
    raise exception 'Failed to create profile: %', error_message;
  end;

  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 