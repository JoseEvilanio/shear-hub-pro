#!/usr/bin/env node

// Script de configuração do banco de dados
// Sistema de Gestão de Oficina Mecânica de Motos

const { initializeDatabase, testConnection, runMigrations, runSeeds, closePool } = require('./connection');
const readline = require('readline');

// Interface para input do usuário
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Função para fazer pergunta ao usuário
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.toLowerCase().trim());
        });
    });
}

// Função principal
async function main() {
    console.log('🚀 Setup do Banco de Dados - Sistema de Gestão de Oficina de Motos');
    console.log('=' .repeat(70));
    
    try {
        // Verificar variáveis de ambiente
        console.log('\n📋 Configurações do banco:');
        console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
        console.log(`   Porta: ${process.env.DB_PORT || '5432'}`);
        console.log(`   Database: ${process.env.DB_NAME || 'oficina_motos'}`);
        console.log(`   Usuário: ${process.env.DB_USER || 'postgres'}`);
        
        const proceed = await askQuestion('\n❓ Deseja continuar com essas configurações? (s/n): ');
        if (proceed !== 's' && proceed !== 'sim' && proceed !== 'y' && proceed !== 'yes') {
            console.log('❌ Operação cancelada pelo usuário');
            process.exit(0);
        }
        
        // Menu de opções
        console.log('\n📋 Opções disponíveis:');
        console.log('1. Inicialização completa (recomendado para primeira vez)');
        console.log('2. Apenas testar conexão');
        console.log('3. Executar apenas migrations');
        console.log('4. Executar apenas seeds');
        console.log('5. Resetar banco (CUIDADO: apaga todos os dados)');
        
        const option = await askQuestion('\n❓ Escolha uma opção (1-5): ');
        
        switch (option) {
            case '1':
                await fullSetup();
                break;
            case '2':
                await testConnectionOnly();
                break;
            case '3':
                await runMigrationsOnly();
                break;
            case '4':
                await runSeedsOnly();
                break;
            case '5':
                await resetDatabase();
                break;
            default:
                console.log('❌ Opção inválida');
                process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ Erro durante a execução:', error.message);
        process.exit(1);
    } finally {
        rl.close();
        await closePool();
    }
}

// Inicialização completa
async function fullSetup() {
    console.log('\n🚀 Iniciando configuração completa do banco de dados...');
    await initializeDatabase();
    console.log('\n🎉 Configuração completa finalizada com sucesso!');
    console.log('\n📝 Próximos passos:');
    console.log('   1. Configure as variáveis de ambiente no arquivo .env');
    console.log('   2. Inicie o servidor da aplicação');
    console.log('   3. Acesse o sistema com: admin@oficina.com / admin123');
}

// Apenas testar conexão
async function testConnectionOnly() {
    console.log('\n🔍 Testando conexão com o banco de dados...');
    const connected = await testConnection();
    if (connected) {
        console.log('✅ Conexão estabelecida com sucesso!');
    } else {
        console.log('❌ Falha na conexão');
        process.exit(1);
    }
}

// Executar apenas migrations
async function runMigrationsOnly() {
    console.log('\n📋 Executando migrations...');
    await testConnection();
    await runMigrations();
    console.log('✅ Migrations executadas com sucesso!');
}

// Executar apenas seeds
async function runSeedsOnly() {
    console.log('\n🌱 Executando seeds...');
    await testConnection();
    await runSeeds();
    console.log('✅ Seeds executadas com sucesso!');
}

// Resetar banco de dados
async function resetDatabase() {
    console.log('\n⚠️  ATENÇÃO: Esta operação irá apagar TODOS os dados do banco!');
    const confirm1 = await askQuestion('❓ Tem certeza que deseja continuar? (digite "CONFIRMO"): ');
    
    if (confirm1 !== 'CONFIRMO') {
        console.log('❌ Operação cancelada');
        return;
    }
    
    const confirm2 = await askQuestion('❓ Esta ação é IRREVERSÍVEL. Digite "SIM APAGAR TUDO": ');
    
    if (confirm2 !== 'SIM APAGAR TUDO') {
        console.log('❌ Operação cancelada');
        return;
    }
    
    console.log('\n🗑️  Resetando banco de dados...');
    
    const { query } = require('./connection');
    
    try {
        // Desabilitar constraints temporariamente
        await query('SET session_replication_role = replica;');
        
        // Listar todas as tabelas
        const tablesResult = await query(`
            SELECT tablename FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename != 'schema_migrations'
        `);
        
        // Apagar todas as tabelas
        for (const row of tablesResult.rows) {
            console.log(`🗑️  Apagando tabela: ${row.tablename}`);
            await query(`DROP TABLE IF EXISTS ${row.tablename} CASCADE`);
        }
        
        // Apagar tipos enumerados
        const enumsResult = await query(`
            SELECT typname FROM pg_type 
            WHERE typtype = 'e'
        `);
        
        for (const row of enumsResult.rows) {
            console.log(`🗑️  Apagando enum: ${row.typname}`);
            await query(`DROP TYPE IF EXISTS ${row.typname} CASCADE`);
        }
        
        // Apagar funções customizadas
        const functionsResult = await query(`
            SELECT proname FROM pg_proc 
            WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
            AND proname NOT LIKE 'pg_%'
        `);
        
        for (const row of functionsResult.rows) {
            console.log(`🗑️  Apagando função: ${row.proname}`);
            await query(`DROP FUNCTION IF EXISTS ${row.proname} CASCADE`);
        }
        
        // Reabilitar constraints
        await query('SET session_replication_role = DEFAULT;');
        
        console.log('✅ Banco de dados resetado com sucesso!');
        
        const reinitialize = await askQuestion('❓ Deseja reinicializar o banco agora? (s/n): ');
        if (reinitialize === 's' || reinitialize === 'sim') {
            await fullSetup();
        }
        
    } catch (error) {
        console.error('❌ Erro ao resetar banco:', error.message);
        throw error;
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    fullSetup,
    testConnectionOnly,
    runMigrationsOnly,
    runSeedsOnly,
    resetDatabase
};