-- Create clients table
create table if not exists public.clients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  barbershop_id uuid references public.barbershops on delete cascade not null,
  -- You might add client-specific fields here relevant to a specific barbershop
  -- e.g., loyalty_points_balance, notes, etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, barbershop_id) -- Ensures a user can be a client of a barbershop only once
);

-- Enable Row Level Security
alter table public.clients enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Proprietários de barbearia podem ver e gerenciar seus clientes" on public.clients;
drop policy if exists "Clientes podem ver sua própria entrada nesta tabela" on public.clients;

-- Create policies
-- Policy for barbershop owners
create policy "Proprietários de barbearia podem ver e gerenciar seus clientes"
  on public.clients for all
  using (
    exists (
      select 1 from public.barbershops
      where barbershops.id = clients.barbershop_id
      and barbershops.owner_id = auth.uid()
    )
  );

-- Policy for clients
create policy "Clientes podem ver sua própria entrada nesta tabela"
  on public.clients for select
  using (auth.uid() = user_id);

-- Create index for faster queries
create index if not exists clients_user_id_idx on public.clients(user_id);
create index if not exists clients_barbershop_id_idx on public.clients(barbershop_id); 