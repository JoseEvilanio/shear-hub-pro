import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

async function testAPI() {
  console.log('🔍 Testando API do servidor...\n');
  
  try {
    // Teste 1: Health Check
    console.log('1. Testando Health Check...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data);
    
    // Teste 2: Info da API
    console.log('\n2. Testando Info da API...');
    const apiResponse = await axios.get(`${API_BASE_URL}/api`);
    console.log('✅ API Info:', apiResponse.data);
    
    // Teste 3: Login com usuário admin
    console.log('\n3. Testando Login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'admin@oficina.com',
      password: '123456'
    });
    console.log('✅ Login bem-sucedido!');
    console.log('   Token:', loginResponse.data.data.token.substring(0, 50) + '...');
    console.log('   Usuário:', loginResponse.data.data.user.name);
    console.log('   Role:', loginResponse.data.data.user.role);
    
    // Teste 4: Verificar Token
    console.log('\n4. Testando Verificação de Token...');
    const token = loginResponse.data.data.token;
    const verifyResponse = await axios.post(`${API_BASE_URL}/api/auth/verify`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Token válido:', verifyResponse.data.data);
    
    console.log('\n🎉 Todos os testes da API passaram com sucesso!');
    
  } catch (error: any) {
    if (error.response) {
      console.error('❌ Erro na API:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('❌ Erro de conexão:', error.message);
      console.log('💡 Certifique-se de que o servidor está rodando na porta 5000');
    } else {
      console.error('❌ Erro:', error.message);
    }
  }
}

// Executar teste
testAPI();