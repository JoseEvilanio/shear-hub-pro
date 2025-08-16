const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando servidor do Sistema de Gestão de Oficina...');

// Caminho para o ts-node
const tsNodePath = path.join(__dirname, 'node_modules', '.bin', 'ts-node');
const serverPath = path.join(__dirname, 'src', 'server.ts');

// Configurar variáveis de ambiente
const env = {
  ...process.env,
  NODE_ENV: 'development',
  PORT: '5000',
  SUPABASE_URL: 'https://cgnkpnrzxptqcronhkmm.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnbmtwbnJ6eHB0cWNyb25oa21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MzI0NDQsImV4cCI6MjA3MDQwODQ0NH0.j2-PJbweZslu3Mxi2GR__9dZKBFlJ7wDZP7m65eBpIo',
  SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnbmtwbnJ6eHB0cWNyb25oa21tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDgzMjQ0NCwiZXhwIjoyMDcwNDA4NDQ0fQ.vaW3pfTAjOAYHk_UUcD6ni6RuACvdQ45H1svQnt7v-4',
  JWT_SECRET: 'oficina-motos-super-secret-key-2024',
  JWT_EXPIRES_IN: '24h',
  JWT_REFRESH_SECRET: 'oficina-motos-refresh-secret-key-2024',
  JWT_REFRESH_EXPIRES_IN: '7d'
};

// Iniciar o processo
const serverProcess = spawn('node', [tsNodePath, serverPath], {
  env,
  cwd: __dirname,
  stdio: 'inherit'
});

serverProcess.on('error', (error) => {
  console.error('❌ Erro ao iniciar servidor:', error);
});

serverProcess.on('exit', (code) => {
  console.log(`🛑 Servidor parou com código: ${code}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Parando servidor...');
  serverProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Parando servidor...');
  serverProcess.kill('SIGTERM');
  process.exit(0);
});

console.log('✅ Processo do servidor iniciado');
console.log('📊 PID:', serverProcess.pid);
console.log('🌐 Aguarde alguns segundos para o servidor inicializar...');