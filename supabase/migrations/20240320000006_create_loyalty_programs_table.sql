-- Create loyalty_programs table
create table if not exists public.loyalty_programs (
  id uuid default gen_random_uuid() primary key,
  barbershop_id uuid references public.barbershops on delete cascade not null,
  name text not null,
  description text,
  points_per_real numeric default 0 check (points_per_real >= 0),
  -- Define how points are earned (e.g., points per R$ spent, points per service)
  -- Example: points_per_service_id uuid references public.services on delete set null,
  -- points_earned_per_service integer,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.loyalty_programs enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Proprietários de barbearia podem gerenciar seus programas de fidelidade" on public.loyalty_programs;
drop policy if exists "Clientes podem ver programas de fidelidade ativos de barbearias ativas" on public.loyalty_programs;

-- Create policies
create policy "Proprietários de barbearia podem gerenciar seus programas de fidelidade"
  on public.loyalty_programs for all
  using (
    exists (
      select 1 from public.barbershops
      where barbershops.id = loyalty_programs.barbershop_id
      and barbershops.owner_id = auth.uid()
    )
  );

create policy "Clientes podem ver programas de fidelidade ativos de barbearias ativas"
  on public.loyalty_programs for select
  using (
    is_active = true
    and exists (
      select 1 from public.barbershops
      where barbershops.id = loyalty_programs.barbershop_id
      and barbershops.status = 'active'
    )
  );

-- Create index for faster queries
create index if not exists loyalty_programs_barbershop_id_idx on public.loyalty_programs(barbershop_id);
create index if not exists loyalty_programs_is_active_idx on public.loyalty_programs(is_active); 