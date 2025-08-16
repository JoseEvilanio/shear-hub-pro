import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Configuração do Supabase
const supabaseUrl = process.env['SUPABASE_URL']!;
const supabaseAnonKey = process.env['SUPABASE_ANON_KEY']!;
const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas');
}

// Cliente público (para operações com RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente administrativo (para operações sem RLS)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase;

// Configuração do Knex para migrations (se necessário)
export const knexConfig = {
  client: 'postgresql',
  connection: process.env['DATABASE_URL'] || {
    host: process.env['DB_HOST'] || 'localhost',
    port: parseInt(process.env['DB_PORT'] || '5432'),
    user: process.env['DB_USER'] || 'postgres',
    password: process.env['DB_PASSWORD'] || '',
    database: process.env['DB_NAME'] || 'oficina_motos',
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: '../database/migrations',
  },
  seeds: {
    directory: '../database/seeds',
  },
};

// Teste de conexão
export const testConnection = async () => {
  try {
    // Testar conexão tentando acessar a tabela de usuários
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão com Supabase:', error.message);
      console.log('💡 Dica: Verifique se as migrations foram executadas no Supabase');
      return false;
    }
    
    console.log('✅ Conexão com Supabase estabelecida com sucesso');
    console.log('📊 Tabelas acessíveis, encontrados', data?.length || 0, 'usuários');
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar conexão:', error);
    return false;
  }
};