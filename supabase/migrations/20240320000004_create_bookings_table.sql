-- Create bookings table
create table if not exists public.bookings (
  id uuid default gen_random_uuid() primary key,
  barbershop_id uuid references public.barbershops on delete cascade not null,
  client_id uuid references auth.users on delete cascade not null,
  barber_id uuid references public.barbers on delete set null,
  service_id uuid references public.services on delete set null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'no-show')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.bookings enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Proprietários de barbearia podem gerenciar todos os agendamentos de sua barbearia" on public.bookings;
drop policy if exists "Clientes podem ver e gerenciar seus próprios agendamentos" on public.bookings;
drop policy if exists "Barbeiros podem ver agendamentos em que estão envolvidos" on public.bookings;
drop policy if exists "Clientes podem inserir novos agendamentos" on public.bookings;

-- Create policies
-- Policy for barbershop owners (can see/update/delete all bookings in their barbershop)
create policy "Proprietários de barbearia podem gerenciar todos os agendamentos de sua barbearia"
  on public.bookings for all
  using (
    exists (
      select 1 from public.barbershops
      where barbershops.id = bookings.barbershop_id
      and barbershops.owner_id = auth.uid()
    )
  );

-- Policy for clients (can see/update/delete their own bookings)
create policy "Clientes podem ver e gerenciar seus próprios agendamentos"
  on public.bookings for all
  using (auth.uid() = client_id);

-- Policy for barbers (can see bookings they are assigned to)
create policy "Barbeiros podem ver agendamentos em que estão envolvidos"
  on public.bookings for select
  using (
    exists (
      select 1 from public.barbers
      where barbers.id = bookings.barber_id
      and exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'barber' -- assuming you add 'barber' role to profiles table
      )
    )
  );

-- Policy for inserting new bookings (clients can insert for themselves)
create policy "Clientes podem inserir novos agendamentos"
  on public.bookings for insert
  with check (auth.uid() = client_id);

-- Create index for faster queries
create index if not exists bookings_barbershop_id_idx on public.bookings(barbershop_id);
create index if not exists bookings_client_id_idx on public.bookings(client_id);
create index if not exists bookings_barber_id_idx on public.bookings(barber_id);
create index if not exists bookings_service_id_idx on public.bookings(service_id);
create index if not exists bookings_start_time_idx on public.bookings(start_time); 