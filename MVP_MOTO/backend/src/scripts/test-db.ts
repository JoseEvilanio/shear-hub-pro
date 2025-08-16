import dotenv from 'dotenv';
import { supabase, testConnection } from '../config/database';

dotenv.config();

async function testDatabase() {
  console.log('🔍 Testando conexão com Supabase...\n');
  
  // Teste de conexão básica
  const connectionTest = await testConnection();
  
  if (!connectionTest) {
    console.log('❌ Falha na conexão com Supabase');
    process.exit(1);
  }
  
  try {
    console.log('📋 Testando tabelas criadas...');
    
    // Testar consulta na tabela users
    console.log('\n👤 Testando tabela de usuários...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name, role')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Erro ao consultar usuários:', usersError.message);
    } else {
      console.log('✅ Usuários encontrados:');
      users?.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
      });
    }
    
    // Testar consulta na tabela clients
    console.log('\n👥 Testando tabela de clientes...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, name, phone, email')
      .limit(5);
    
    if (clientsError) {
      console.error('❌ Erro ao consultar clientes:', clientsError.message);
    } else {
      console.log('✅ Clientes encontrados:');
      clients?.forEach(client => {
        console.log(`   - ${client.name} (${client.phone})`);
      });
    }
    
    // Testar consulta na tabela products
    console.log('\n📦 Testando tabela de produtos...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, code, name, price, type')
      .limit(5);
    
    if (productsError) {
      console.error('❌ Erro ao consultar produtos:', productsError.message);
    } else {
      console.log('✅ Produtos encontrados:');
      products?.forEach(product => {
        console.log(`   - ${product.code}: ${product.name} - R$ ${product.price} (${product.type})`);
      });
    }
    
    console.log('\n🎉 Teste de banco de dados concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    process.exit(1);
  }
}

// Executar teste
testDatabase();