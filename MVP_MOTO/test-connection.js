const http = require('http');

// Teste simples de conexão
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/health',
  method: 'GET'
};

console.log('🔍 Testando conexão com servidor...');

const req = http.request(options, (res) => {
  console.log(`✅ Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📊 Resposta:', JSON.parse(data));
    
    // Teste de login
    testLogin();
  });
});

req.on('error', (e) => {
  console.error('❌ Erro:', e.message);
});

req.end();

function testLogin() {
  console.log('\n🔐 Testando login...');
  
  const loginData = JSON.stringify({
    email: 'admin@oficina.com',
    password: '123456'
  });
  
  const loginOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };
  
  const loginReq = http.request(loginOptions, (res) => {
    console.log(`✅ Login Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        if (response.success) {
          console.log('🎉 Login bem-sucedido!');
          console.log('👤 Usuário:', response.data.user.name);
          console.log('🔑 Role:', response.data.user.role);
          console.log('🎫 Token:', response.data.token.substring(0, 50) + '...');
        } else {
          console.log('❌ Falha no login:', response);
        }
      } catch (e) {
        console.log('📄 Resposta raw:', data);
      }
    });
  });
  
  loginReq.on('error', (e) => {
    console.error('❌ Erro no login:', e.message);
  });
  
  loginReq.write(loginData);
  loginReq.end();
}