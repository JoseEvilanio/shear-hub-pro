-- Create services table
create table if not exists public.services (
  id uuid default gen_random_uuid() primary key,
  barbershop_id uuid references public.barbershops on delete cascade not null,
  name text not null,
  description text,
  price numeric not null check (price >= 0),
  duration_minutes integer not null check (duration_minutes > 0),
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.services enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Proprietários de barbearia podem gerenciar seus serviços" on public.services;
drop policy if exists "Clientes podem ver serviços ativos de barbearias ativas" on public.services;

-- Create policies
create policy "Proprietários de barbearia podem gerenciar seus serviços"
  on public.services for all
  using (
    exists (
      select 1 from public.barbershops
      where barbershops.id = services.barbershop_id
      and barbershops.owner_id = auth.uid()
    )
  );

create policy "Clientes podem ver serviços ativos de barbearias ativas"
  on public.services for select
  using (
    is_active = true
    and exists (
      select 1 from public.barbershops
      where barbershops.id = services.barbershop_id
      and barbershops.status = 'active'
    )
  );

-- Create index for faster queries
create index if not exists services_barbershop_id_idx on public.services(barbershop_id);
create index if not exists services_is_active_idx on public.services(is_active); 