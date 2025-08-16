const http = require('http');

const server = http.createServer((req, res) => {
  console.log(`📥 Requisição recebida: ${req.method} ${req.url}`);
  
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  
  if (req.url === '/health') {
    res.end(JSON.stringify({
      status: 'OK',
      message: 'Servidor de teste funcionando',
      timestamp: new Date().toISOString()
    }));
  } else {
    res.end(JSON.stringify({
      message: 'Servidor de teste',
      url: req.url,
      method: req.method
    }));
  }
});

const PORT = 8080;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor de teste rodando na porta ${PORT}`);
  console.log(`📊 Teste: http://localhost:${PORT}/health`);
  console.log('⏳ Servidor rodando... Pressione Ctrl+C para parar');
});

server.on('error', (err) => {
  console.error('❌ Erro no servidor:', err);
});

server.on('connection', (socket) => {
  console.log('🔗 Nova conexão estabelecida');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Parando servidor...');
  server.close(() => {
    console.log('✅ Servidor parado');
    process.exit(0);
  });
});

// Manter o processo vivo
setInterval(() => {
  // Apenas para manter o processo rodando
}, 1000);