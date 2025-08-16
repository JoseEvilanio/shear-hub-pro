const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = 'https://cgnkpnrzxptqcronhkmm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnbmtwbnJ6eHB0cWNyb25oa21tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDgzMjQ0NCwiZXhwIjoyMDcwNDA4NDQ0fQ.vaW3pfTAjOAYHk_UUcD6ni6RuACvdQ45H1svQnt7v-4';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function updateAdminPassword() {
  console.log('🔐 Atualizando senha do usuário admin...');
  
  try {
    // Gerar novo hash da senha
    const password = '123456';
    const newHash = await bcrypt.hash(password, 10);
    console.log('🔑 Novo hash gerado:', newHash);
    
    // Atualizar no banco
    const { data, error } = await supabase
      .from('users')
      .update({ password_hash: newHash })
      .eq('email', 'admin@oficina.com')
      .select();
    
    if (error) {
      console.error('❌ Erro ao atualizar senha:', error);
      return;
    }
    
    console.log('✅ Senha atualizada com sucesso!');
    console.log('👤 Usuário:', data[0]?.name);
    console.log('📧 Email:', data[0]?.email);
    
    // Testar a nova senha
    console.log('\n🧪 Testando nova senha...');
    const isValid = await bcrypt.compare(password, newHash);
    console.log('✅ Senha válida:', isValid);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

updateAdminPassword();