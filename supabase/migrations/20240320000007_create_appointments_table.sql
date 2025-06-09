-- Create appointments table
create table if not exists public.appointments (
  id uuid default gen_random_uuid() primary key,
  barbershop_id uuid references public.barbershops on delete cascade not null,
  barber_id uuid references public.barbers on delete cascade not null,
  client_id uuid references auth.users on delete set null,
  service_id uuid references public.services on delete cascade not null,
  appointment_date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'refunded')),
  price decimal(10,2) not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.appointments enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Proprietários de barbearia podem gerenciar agendamentos" on public.appointments;
drop policy if exists "Barbeiros podem ver seus agendamentos" on public.appointments;
drop policy if exists "Clientes podem ver seus agendamentos" on public.appointments;

-- Create policies
create policy "Proprietários de barbearia podem gerenciar agendamentos"
  on public.appointments for all
  using (
    exists (
      select 1 from public.barbershops
      where barbershops.id = appointments.barbershop_id
      and barbershops.owner_id = auth.uid()
    )
  );

create policy "Barbeiros podem ver seus agendamentos"
  on public.appointments for select
  using (
    exists (
      select 1 from public.barbers
      where barbers.id = appointments.barber_id
      and barbers.barbershop_id = appointments.barbershop_id
    )
  );

create policy "Clientes podem ver seus agendamentos"
  on public.appointments for select
  using (
    client_id = auth.uid()
  );

-- Create indexes for faster queries
create index if not exists appointments_barbershop_id_idx on public.appointments(barbershop_id);
create index if not exists appointments_barber_id_idx on public.appointments(barber_id);
create index if not exists appointments_client_id_idx on public.appointments(client_id);
create index if not exists appointments_service_id_idx on public.appointments(service_id);
create index if not exists appointments_date_idx on public.appointments(appointment_date);
create index if not exists appointments_status_idx on public.appointments(status);
create index if not exists appointments_payment_status_idx on public.appointments(payment_status);

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger set_updated_at
  before update on public.appointments
  for each row
  execute function public.handle_updated_at(); 