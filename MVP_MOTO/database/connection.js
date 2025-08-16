// Configuração de conexão com PostgreSQL
// Sistema de Gestão de Oficina Mecânica de Motos

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuração do pool de conexões
const poolConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'oficina_motos',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
    
    // Configurações do pool
    max: parseInt(process.env.DB_POOL_MAX) || 20, // Máximo de conexões
    min: parseInt(process.env.DB_POOL_MIN) || 2,  // Mínimo de conexões
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000, // 30 segundos
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 10000, // 10 segundos
    
    // SSL configuration (para produção)
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false
};

// Criar pool de conexões
const pool = new Pool(poolConfig);

// Event listeners para monitoramento
pool.on('connect', (client) => {
    console.log('Nova conexão estabelecida com o banco de dados');
});

pool.on('error', (err, client) => {
    console.error('Erro inesperado no cliente do banco:', err);
    process.exit(-1);
});

pool.on('acquire', (client) => {
    console.log('Cliente adquirido do pool');
});

pool.on('remove', (client) => {
    console.log('Cliente removido do pool');
});

// Função para testar conexão
async function testConnection() {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW() as current_time, version() as version');
        console.log('✅ Conexão com banco de dados estabelecida com sucesso');
        console.log('⏰ Hora do servidor:', result.rows[0].current_time);
        console.log('🗄️  Versão PostgreSQL:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]);
        client.release();
        return true;
    } catch (err) {
        console.error('❌ Erro ao conectar com o banco de dados:', err.message);
        return false;
    }
}

// Função para executar query com retry
async function query(text, params = []) {
    const maxRetries = 3;
    let retries = 0;
    
    while (retries < maxRetries) {
        try {
            const start = Date.now();
            const result = await pool.query(text, params);
            const duration = Date.now() - start;
            
            // Log de queries lentas (> 1 segundo)
            if (duration > 1000) {
                console.warn(`⚠️  Query lenta executada em ${duration}ms:`, text.substring(0, 100) + '...');
            }
            
            return result;
        } catch (err) {
            retries++;
            console.error(`❌ Erro na query (tentativa ${retries}/${maxRetries}):`, err.message);
            
            if (retries >= maxRetries) {
                throw err;
            }
            
            // Aguarda antes de tentar novamente
            await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
    }
}

// Função para executar transação
async function transaction(callback) {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

// Função para executar migrations
async function runMigrations() {
    const migrationsDir = path.join(__dirname, 'migrations');
    
    try {
        // Criar tabela de controle de migrations se não existir
        await query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id SERIAL PRIMARY KEY,
                filename VARCHAR(255) UNIQUE NOT NULL,
                executed_at TIMESTAMP DEFAULT NOW()
            )
        `);
        
        // Listar arquivos de migration
        const migrationFiles = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();
        
        console.log(`📋 Encontradas ${migrationFiles.length} migrations`);
        
        for (const file of migrationFiles) {
            // Verificar se migration já foi executada
            const existingMigration = await query(
                'SELECT filename FROM schema_migrations WHERE filename = $1',
                [file]
            );
            
            if (existingMigration.rows.length > 0) {
                console.log(`⏭️  Migration ${file} já executada`);
                continue;
            }
            
            // Executar migration
            console.log(`🔄 Executando migration: ${file}`);
            const migrationSQL = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
            
            await transaction(async (client) => {
                await client.query(migrationSQL);
                await client.query(
                    'INSERT INTO schema_migrations (filename) VALUES ($1)',
                    [file]
                );
            });
            
            console.log(`✅ Migration ${file} executada com sucesso`);
        }
        
        console.log('🎉 Todas as migrations foram executadas com sucesso');
        return true;
    } catch (err) {
        console.error('❌ Erro ao executar migrations:', err.message);
        throw err;
    }
}

// Função para executar seeds (dados iniciais)
async function runSeeds() {
    try {
        console.log('🌱 Executando seeds...');
        
        // Verificar se já existem dados
        const userCount = await query('SELECT COUNT(*) FROM users');
        if (parseInt(userCount.rows[0].count) > 0) {
            console.log('⏭️  Seeds já executadas (usuários existem)');
            return;
        }
        
        // Executar arquivo de seeds
        const seedsPath = path.join(__dirname, 'seeds.sql');
        if (fs.existsSync(seedsPath)) {
            const seedsSQL = fs.readFileSync(seedsPath, 'utf8');
            await query(seedsSQL);
            console.log('✅ Seeds executadas com sucesso');
        } else {
            console.log('⚠️  Arquivo de seeds não encontrado');
        }
    } catch (err) {
        console.error('❌ Erro ao executar seeds:', err.message);
        throw err;
    }
}

// Função para inicializar banco de dados
async function initializeDatabase() {
    try {
        console.log('🚀 Inicializando banco de dados...');
        
        // Testar conexão
        const connected = await testConnection();
        if (!connected) {
            throw new Error('Não foi possível conectar ao banco de dados');
        }
        
        // Executar script de inicialização
        const initPath = path.join(__dirname, 'init.sql');
        if (fs.existsSync(initPath)) {
            console.log('🔧 Executando script de inicialização...');
            const initSQL = fs.readFileSync(initPath, 'utf8');
            await query(initSQL);
            console.log('✅ Script de inicialização executado');
        }
        
        // Executar migrations
        await runMigrations();
        
        // Executar seeds
        await runSeeds();
        
        console.log('🎉 Banco de dados inicializado com sucesso!');
        return true;
    } catch (err) {
        console.error('❌ Erro ao inicializar banco de dados:', err.message);
        throw err;
    }
}

// Função para obter estatísticas do pool
function getPoolStats() {
    return {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount
    };
}

// Função para fechar todas as conexões
async function closePool() {
    try {
        await pool.end();
        console.log('🔌 Pool de conexões fechado');
    } catch (err) {
        console.error('❌ Erro ao fechar pool:', err.message);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('🛑 Recebido SIGINT, fechando conexões...');
    await closePool();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('🛑 Recebido SIGTERM, fechando conexões...');
    await closePool();
    process.exit(0);
});

module.exports = {
    pool,
    query,
    transaction,
    testConnection,
    runMigrations,
    runSeeds,
    initializeDatabase,
    getPoolStats,
    closePool
};