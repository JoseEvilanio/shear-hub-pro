const bcrypt = require('bcryptjs');

async function testPassword() {
  const password = '123456';
  const hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
  
  console.log('🔍 Testando senha...');
  console.log('Senha:', password);
  console.log('Hash:', hash);
  
  const isValid = await bcrypt.compare(password, hash);
  console.log('✅ Senha válida:', isValid);
  
  // Gerar novo hash para teste
  const newHash = await bcrypt.hash(password, 10);
  console.log('🔑 Novo hash:', newHash);
  
  const isNewValid = await bcrypt.compare(password, newHash);
  console.log('✅ Novo hash válido:', isNewValid);
}

testPassword();