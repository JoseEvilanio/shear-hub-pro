const express = require('express');
const app = express();

// Middleware básico
app.use(express.json());

// Rota de teste
app.get('/health', (req, res) => {
  console.log('📥 Health check requisitado');
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Servidor Express funcionando'
  });
});

app.get('/test', (req, res) => {
  console.log('📥 Test requisitado');
  res.json({
    message: 'Teste OK',
    timestamp: new Date().toISOString()
  });
});

const PORT = 8080;

const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Servidor Express rodando na porta ${PORT}`);
  console.log(`📊 Health: http://127.0.0.1:${PORT}/health`);
  console.log(`🧪 Test: http://127.0.0.1:${PORT}/test`);
  console.log('⏳ Aguardando requisições...');
});

server.on('error', (err) => {
  console.error('❌ Erro no servidor:', err);
});

server.on('connection', (socket) => {
  console.log('🔗 Nova conexão TCP estabelecida');
  socket.on('close', () => {
    console.log('🔌 Conexão TCP fechada');
  });
});

// Manter processo vivo
process.on('SIGINT', () => {
  console.log('\n🛑 Recebido SIGINT, parando servidor...');
  server.close(() => {
    console.log('✅ Servidor parado graciosamente');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Recebido SIGTERM, parando servidor...');
  server.close(() => {
    console.log('✅ Servidor parado graciosamente');
    process.exit(0);
  });
});

// Log de debug
console.log('🔍 Processo PID:', process.pid);
console.log('🔍 Node.js versão:', process.version);
console.log('🔍 Plataforma:', process.platform);

// Verificar se a porta está disponível
const net = require('net');
const testSocket = new net.Socket();

testSocket.setTimeout(1000);
testSocket.on('connect', () => {
  console.log('⚠️  Porta 8080 já está em uso!');
  testSocket.destroy();
});

testSocket.on('timeout', () => {
  console.log('✅ Porta 8080 disponível');
  testSocket.destroy();
});

testSocket.on('error', (err) => {
  if (err.code === 'ECONNREFUSED') {
    console.log('✅ Porta 8080 disponível (ECONNREFUSED)');
  } else {
    console.log('❌ Erro ao testar porta:', err.message);
  }
});

testSocket.connect(8080, '127.0.0.1');