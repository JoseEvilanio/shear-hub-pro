-- Create payments table
create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  barbershop_id uuid references public.barbershops on delete cascade not null,
  client_id uuid references auth.users on delete cascade not null,
  booking_id uuid references public.bookings on delete set null, -- Link to a specific booking
  amount numeric not null check (amount >= 0),
  currency text not null default 'BRL',
  payment_method text, -- e.g., 'credit_card', 'pix', 'cash'
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  transaction_id text unique, -- ID from payment gateway
  processed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.payments enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Proprietários de barbearia podem ver e gerenciar pagamentos de sua barbearia" on public.payments;
drop policy if exists "Clientes podem ver seus próprios pagamentos" on public.payments;

-- Create policies
-- Policy for barbershop owners
create policy "Proprietários de barbearia podem ver e gerenciar pagamentos de sua barbearia"
  on public.payments for all
  using (
    exists (
      select 1 from public.barbershops
      where barbershops.id = payments.barbershop_id
      and barbershops.owner_id = auth.uid()
    )
  );

-- Policy for clients
create policy "Clientes podem ver seus próprios pagamentos"
  on public.payments for select
  using (auth.uid() = client_id);

-- Create index for faster queries
create index if not exists payments_barbershop_id_idx on public.payments(barbershop_id);
create index if not exists payments_client_id_idx on public.payments(client_id);
create index if not exists payments_booking_id_idx on public.payments(booking_id);
create index if not exists payments_status_idx on public.payments(status); 