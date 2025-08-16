console.log('🔍 Testando se o servidor está acessível...');

// Usar fetch nativo do Node.js (versão 18+)
fetch('http://127.0.0.1:5000/health')
  .then(response => {
    console.log('✅ Resposta recebida, status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('📊 Dados:', data);
    
    // Testar login
    return fetch('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@oficina.com',
        password: '123456'
      })
    });
  })
  .then(response => {
    console.log('🔐 Login status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('🎉 Login resultado:', data);
    if (data.success) {
      console.log('✅ Autenticação funcionando!');
      console.log('👤 Usuário:', data.data.user.name);
      console.log('🔑 Role:', data.data.user.role);
    }
  })
  .catch(error => {
    console.error('❌ Erro:', error.message);
    console.log('💡 Certifique-se de que o servidor está rodando na porta 5000');
  });