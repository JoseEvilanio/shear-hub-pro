-- Create barbershops table
create table if not exists public.barbershops (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  owner_id uuid references auth.users on delete cascade not null,
  status text not null check (status in ('pending', 'active', 'inactive')) default 'pending',
  address text,
  city text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.barbershops enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Proprietários podem ver suas próprias barbearias" on public.barbershops;
drop policy if exists "Proprietários podem atualizar suas próprias barbearias" on public.barbershops;
drop policy if exists "Proprietários podem inserir suas próprias barbearias" on public.barbershops;
drop policy if exists "Clientes podem ver barbearias ativas" on public.barbershops;
drop policy if exists "Permitir inserção inicial de barbearia" on public.barbershops;

-- Drop existing function if it exists
drop function if exists public.is_owner();

-- Create function to check if user is owner
create or replace function public.is_owner()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  user_role text;
begin
  user_role := (auth.jwt() ->> 'user_metadata')::jsonb->>'role';
  return user_role = 'owner';
end;
$$;

-- Create policies
create policy "Proprietários podem ver suas próprias barbearias"
  on public.barbershops for select
  using (auth.uid() = owner_id);

create policy "Proprietários podem atualizar suas próprias barbearias"
  on public.barbershops for update
  using (auth.uid() = owner_id);

create policy "Proprietários podem inserir suas próprias barbearias"
  on public.barbershops for insert
  with check (auth.uid() = owner_id);

create policy "Clientes podem ver barbearias ativas"
  on public.barbershops for select
  using (status = 'active');

-- Política especial para permitir a inserção inicial durante o registro
create policy "Permitir inserção inicial de barbearia"
  on public.barbershops for insert
  with check (public.is_owner());

-- Create index for faster queries
create index if not exists barbershops_owner_id_idx on public.barbershops(owner_id);
create index if not exists barbershops_status_idx on public.barbershops(status); 