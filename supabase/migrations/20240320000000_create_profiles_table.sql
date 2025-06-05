-- Drop existing table if it exists (with CASCADE to handle dependencies)
drop table if exists public.profiles cascade;

-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  role text not null check (role in ('client', 'owner')),
  first_name text,
  last_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Usuários podem ver seus próprios perfis" on public.profiles;
drop policy if exists "Usuários podem atualizar seus próprios perfis" on public.profiles;
drop policy if exists "Usuários podem inserir seus próprios perfis" on public.profiles;

-- Create policies
create policy "Usuários podem ver seus próprios perfis"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuários podem atualizar seus próprios perfis"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Usuários podem inserir seus próprios perfis"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Drop existing function and trigger if they exist
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Create function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_role text;
  error_message text;
begin
  -- Log the start of the function
  raise notice 'Starting handle_new_user for user: %', new.id;
  
  -- Get user role from metadata or default to 'client'
  user_role := coalesce(new.raw_user_meta_data->>'role', 'client');
  raise notice 'User role determined as: %', user_role;

  begin
    -- Insert into profiles table with the user's id
    insert into public.profiles (id, email, role, first_name, last_name)
    values (
      new.id,  -- Explicitly set the id to match auth.users
      new.email,
      user_role,
      coalesce(new.raw_user_meta_data->>'first_name', ''),
      coalesce(new.raw_user_meta_data->>'last_name', '')
    );
    
    raise notice 'Successfully created profile for user: %', new.id;
  exception when others then
    -- Get the error message
    error_message := SQLERRM;
    raise notice 'Error creating profile: %', error_message;
    
    -- Re-raise the error to ensure the transaction is rolled back
    raise exception 'Failed to create profile: %', error_message;
  end;

  -- If user is a client, also insert into clients table
  if user_role = 'client' then
    -- We need the barbershop_id for the clients table.
    -- This assumes the client is registering *through* a specific barbershop's flow.
    -- If a client can register independently, this logic needs adjustment.
    -- For now, we'll assume a default or require barbershop_id in metadata if needed.
    -- Let's assume for now that barbershop_id will be handled when the client interacts with a barbershop.
    -- Or, we can link a client to a barbershop upon their first booking/interaction.
    -- Leaving insertion into clients table out for now until we define that flow.
    null; -- Placeholder
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Drop the trigger if it exists (explicitly)
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 