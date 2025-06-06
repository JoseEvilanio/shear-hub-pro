-- Criação da tabela activity_logs
create table if not exists public.activity_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete set null,
  action text not null,
  target_type text not null,
  target_id uuid,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index para buscas por usuário e data
create index if not exists activity_logs_user_id_idx on public.activity_logs(user_id);
create index if not exists activity_logs_created_at_idx on public.activity_logs(created_at desc);

-- Configuração de RLS
alter table public.activity_logs enable row level security;

-- Políticas de segurança
-- Apenas administradores podem ver os logs
create policy "Admins podem ver logs de atividade"
  on public.activity_logs for select
  using (is_superuser()); -- Reutilizando a função is_superuser

-- Usuários autenticados podem inserir logs (por exemplo, para ações que eles mesmos realizam)
create policy "Usuários autenticados podem inserir logs"
  on public.activity_logs for insert
  with check (auth.role() = 'authenticated'); 