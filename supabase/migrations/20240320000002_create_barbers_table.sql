-- Create barbers table
create table if not exists public.barbers (
  id uuid default gen_random_uuid() primary key,
  barbershop_id uuid references public.barbershops on delete cascade not null,
  name text not null,
  email text unique,
  phone text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.barbers enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Proprietários de barbearia podem gerenciar seus barbeiros" on public.barbers;
drop policy if exists "Clientes podem ver barbeiros ativos de barbearias ativas" on public.barbers;

-- Create policies
create policy "Proprietários de barbearia podem gerenciar seus barbeiros"
  on public.barbers for all
  using (
    exists (
      select 1 from public.barbershops
      where barbershops.id = barbers.barbershop_id
      and barbershops.owner_id = auth.uid()
    )
  );

create policy "Clientes podem ver barbeiros ativos de barbearias ativas"
  on public.barbers for select
  using (
    is_active = true
    and exists (
      select 1 from public.barbershops
      where barbershops.id = barbers.barbershop_id
      and barbershops.status = 'active'
    )
  );

-- Create index for faster queries
create index if not exists barbers_barbershop_id_idx on public.barbers(barbershop_id);
create index if not exists barbers_is_active_idx on public.barbers(is_active); 