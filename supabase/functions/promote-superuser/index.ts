// index.ts - Função promote-superuser para Supabase Edge Functions
// ATENÇÃO: Certifique-se de definir variáveis de ambiente seguras em produção e NUNCA exponha chaves sensíveis!
import { createClient } from '@supabase/supabase-js'
import { serve } from "std/http/server.ts";

// Defina as origens permitidas para produção
const allowedOrigins = [
  'https://seu-dominio.com', // Altere para seu domínio de produção
  'http://localhost:3000'   // Permita localhost para desenvolvimento
];

const getCorsHeaders = (origin: string) => ({
  'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : 'null',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
});

serve(async (req) => {
  const origin = req.headers.get('origin') || '';
  const corsHeaders = getCorsHeaders(origin);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    
    let user_id, admin_key;
    try {
      const body = await req.json();
      user_id = body.user_id;
      admin_key = body.admin_key;
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Requisição inválida: corpo JSON malformado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validação da chave admin via variável de ambiente
    const ADMIN_KEY = process.env.ADMIN_KEY;
    if (!ADMIN_KEY) {
      return new Response(
        JSON.stringify({ error: 'Configuração inválida: ADMIN_KEY não definida no ambiente' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (!admin_key || typeof admin_key !== 'string' || admin_key.length < 12 || admin_key !== ADMIN_KEY) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado: admin key inválida' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validação do user_id
    if (!user_id || typeof user_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Requisição inválida: user_id é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Criação do cliente Supabase usando variáveis de ambiente
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Configuração inválida: SUPABASE_URL ou SUPABASE_SERVICE_KEY não definidas no ambiente' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verifica se o usuário existe
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Atualiza o papel do usuário para superuser
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: 'superuser' })
      .eq('id', user_id)
      .select();

    if (error) {
      console.error('Erro ao atualizar papel do usuário:', error)
      return new Response(
        JSON.stringify({ error: 'Falha ao promover usuário' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log da ação (não interrompe o fluxo em caso de erro)
    try {
      await supabase.rpc('log_activity', {
        action: 'promote_to_superuser',
        target_type: 'user',
        target_id: user_id,
        metadata: { previous_role: user.role }
      });
    } catch (e) {
      console.error('Erro ao registrar log de atividade:', e);
    }

    return new Response(
      JSON.stringify({ 
        message: 'Usuário promovido a superusuário com sucesso',
        user: data && data[0] ? data[0] : null
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Erro inesperado:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
});
// Fim da função promote-superuser
