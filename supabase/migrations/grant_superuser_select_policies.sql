-- Grant SELECT permissions to superusers on various tables

-- barbershops table
drop policy if exists "Superusers can view all barbershops" on public.barbershops;
create policy "Superusers can view all barbershops"
  on public.barbershops for select
  using (is_superuser());

-- barbers table
drop policy if exists "Superusers can view all barbers" on public.barbers;
create policy "Superusers can view all barbers"
  on public.barbers for select
  using (is_superuser());

-- bookings table
drop policy if exists "Superusers can view all bookings" on public.bookings;
create policy "Superusers can view all bookings"
  on public.bookings for select
  using (is_superuser());

-- clients table
drop policy if exists "Superusers can view all clients" on public.clients;
create policy "Superusers can view all clients"
  on public.clients for select
  using (is_superuser());

-- loyalty_points table
drop policy if exists "Superusers can view all loyalty points" on public.loyalty_points;
create policy "Superusers can view all loyalty points"
  on public.loyalty_points for select
  using (is_superuser());

-- loyalty_programs table
drop policy if exists "Superusers can view all loyalty programs" on public.loyalty_programs;
create policy "Superusers can view all loyalty programs"
  on public.loyalty_programs for select
  using (is_superuser());

-- payments table
drop policy if exists "Superusers can view all payments" on public.payments;
create policy "Superusers can view all payments"
  on public.payments for select
  using (is_superuser());

-- services table
drop policy if exists "Superusers can view all services" on public.services;
create policy "Superusers can view all services"
  on public.services for select
  using (is_superuser());

-- activity_logs table
-- Assuming activity_logs was created in a previous step
drop policy if exists "Superusers can view all activity logs" on public.activity_logs;
create policy "Superusers can view all activity logs"
  on public.activity_logs for select
  using (is_superuser()); 