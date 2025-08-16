import dotenv from 'dotenv';
import { supabaseAdmin } from '../config/database';
import { readFileSync } from 'fs';
import { join } from 'path';

dotenv.config();

async function runMigrations() {
  console.log('🚀 Executando migrations no Supabase...\n');
  
  try {
    // Ler o arquivo de setup rápido
    const setupPath = join(__dirname, '../../..', 'database', 'quick_setup.sql');
    const setupSQL = readFileSync(setupPath, 'utf8');
    
    // Dividir o SQL em comandos individuais
    const commands = setupSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Encontrados ${commands.length} comandos SQL para executar\n`);
    
    // Executar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      if (command.toLowerCase().includes('create') || 
          command.toLowerCase().includes('insert') ||
          command.toLowerCase().includes('alter')) {
        
        console.log(`⏳ Executando comando ${i + 1}/${commands.length}...`);
        console.log(`   ${command.substring(0, 50)}...`);
        
        try {
          const { error } = await supabaseAdmin.rpc('exec_sql', {
            query: command + ';'
          });
          
          if (error) {
            console.error(`❌ Erro no comando ${i + 1}:`, error.message);
            // Continuar com próximo comando
          } else {
            console.log(`✅ Comando ${i + 1} executado com sucesso`);
          }
        } catch (cmdError) {
          console.error(`❌ Erro ao executar comando ${i + 1}:`, cmdError);
        }
      }
    }
    
    console.log('\n🎉 Migrations concluídas!');
    
    // Testar se as tabelas foram criadas
    console.log('\n🔍 Verificando tabelas criadas...');
    await testTables();
    
  } catch (error) {
    console.error('❌ Erro ao executar migrations:', error);
    process.exit(1);
  }
}

async function testTables() {
  const tablesToTest = ['users', 'clients', 'products', 'system_config'];
  
  for (const table of tablesToTest) {
    try {
      const { data, error } = await supabaseAdmin
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Tabela ${table}: ${error.message}`);
      } else {
        console.log(`✅ Tabela ${table}: OK (${data?.length || 0} registros encontrados)`);
      }
    } catch (error) {
      console.log(`❌ Tabela ${table}: Erro ao testar`);
    }
  }
}

// Executar migrations
runMigrations();