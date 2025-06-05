-- Create loyalty_points table
create table if not exists public.loyalty_points (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.clients on delete cascade not null,
  loyalty_program_id uuid references public.loyalty_programs on delete cascade not null,
  points integer not null default 0 check (points >= 0),
  -- You might add fields to track point history (earned, spent, expired)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.loyalty_points enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Proprietários podem gerenciar pontos de fidelidade de seus clientes" on public.loyalty_points;
drop policy if exists "Clientes podem ver seus próprios pontos de fidelidade" on public.loyalty_points;

-- Create policies
-- Policy for barbershop owners
create policy "Proprietários podem gerenciar pontos de fidelidade de seus clientes"
  on public.loyalty_points for all
  using (
    exists (
      select 1 from public.clients
      where clients.id = loyalty_points.client_id
      and exists (
        select 1 from public.barbershops
        where barbershops.id = clients.barbershop_id
        and barbershops.owner_id = auth.uid()
      )
    )
  );

-- Policy for clients
create policy "Clientes podem ver seus próprios pontos de fidelidade"
  on public.loyalty_points for select
  using (
    exists (
      select 1 from public.clients
      where clients.id = loyalty_points.client_id
      and clients.user_id = auth.uid()
    )
  );

-- Create index for faster queries
create index if not exists loyalty_points_client_id_idx on public.loyalty_points(client_id);
create index if not exists loyalty_points_loyalty_program_id_idx on public.loyalty_points(loyalty_program_id); 