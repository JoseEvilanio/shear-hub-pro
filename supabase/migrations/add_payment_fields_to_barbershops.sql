-- Adicionar coluna payment_status à tabela barbershops
alter table public.barbershops
  add column if not exists payment_status text;

-- Adicionar coluna next_payment_date à tabela barbershops (se também for necessária)
alter table public.barbershops
  add column if not exists next_payment_date timestamp with time zone; 