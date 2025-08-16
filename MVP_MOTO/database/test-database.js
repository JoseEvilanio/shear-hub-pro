// Testes para validar configuração do banco de dados
// Sistema de Gestão de Oficina Mecânica de Motos

const { query, testConnection, getPoolStats, closePool } = require('./connection');

// Cores para output no console
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

// Função para log colorido
function log(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Testes de validação
const tests = [
    {
        name: 'Conexão com banco de dados',
        test: async () => {
            return await testConnection();
        }
    },
    {
        name: 'Verificar tabelas principais',
        test: async () => {
            const result = await query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_type = 'BASE TABLE'
                ORDER BY table_name
            `);
            
            const expectedTables = [
                'users', 'clients', 'suppliers', 'mechanics', 'vehicles',
                'products', 'service_orders', 'service_order_items',
                'sales', 'sale_items', 'inventory_movements',
                'accounts_payable', 'accounts_receivable', 'cash_movements',
                'system_config', 'audit_log'
            ];
            
            const actualTables = result.rows.map(row => row.table_name);
            const missingTables = expectedTables.filter(table => !actualTables.includes(table));
            
            if (missingTables.length > 0) {
                throw new Error(`Tabelas faltando: ${missingTables.join(', ')}`);
            }
            
            log('blue', `   ✓ ${actualTables.length} tabelas encontradas`);
            return true;
        }
    },
    {
        name: 'Verificar tipos enumerados',
        test: async () => {
            const result = await query(`
                SELECT typname 
                FROM pg_type 
                WHERE typtype = 'e'
                ORDER BY typname
            `);
            
            const expectedEnums = [
                'user_role', 'service_order_status', 'sale_type', 'sale_status',
                'payment_method', 'product_type', 'inventory_movement_type', 'cash_movement_type'
            ];
            
            const actualEnums = result.rows.map(row => row.typname);
            const missingEnums = expectedEnums.filter(enumType => !actualEnums.includes(enumType));
            
            if (missingEnums.length > 0) {
                throw new Error(`Enums faltando: ${missingEnums.join(', ')}`);
            }
            
            log('blue', `   ✓ ${actualEnums.length} tipos enumerados encontrados`);
            return true;
        }
    },
    {
        name: 'Verificar funções customizadas',
        test: async () => {
            const result = await query(`
                SELECT proname 
                FROM pg_proc 
                WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
                AND proname NOT LIKE 'pg_%'
                ORDER BY proname
            `);
            
            const expectedFunctions = [
                'validate_cpf', 'validate_cnpj', 'generate_service_order_number',
                'generate_sale_number', 'get_config', 'set_config',
                'create_inventory_movement', 'create_cash_movement',
                'get_cash_balance', 'get_cash_flow'
            ];
            
            const actualFunctions = result.rows.map(row => row.proname);
            const missingFunctions = expectedFunctions.filter(func => !actualFunctions.includes(func));
            
            if (missingFunctions.length > 0) {
                log('yellow', `   ⚠ Funções faltando: ${missingFunctions.join(', ')}`);
            }
            
            log('blue', `   ✓ ${actualFunctions.length} funções customizadas encontradas`);
            return true;
        }
    },
    {
        name: 'Testar validação de CPF',
        test: async () => {
            // CPF válido
            const validCpf = await query("SELECT validate_cpf('123.456.789-09') as valid");
            if (!validCpf.rows[0].valid) {
                throw new Error('CPF válido não foi reconhecido');
            }
            
            // CPF inválido
            const invalidCpf = await query("SELECT validate_cpf('123.456.789-00') as valid");
            if (invalidCpf.rows[0].valid) {
                throw new Error('CPF inválido foi aceito');
            }
            
            log('blue', '   ✓ Validação de CPF funcionando');
            return true;
        }
    },
    {
        name: 'Testar validação de CNPJ',
        test: async () => {
            // CNPJ válido
            const validCnpj = await query("SELECT validate_cnpj('12.345.678/0001-90') as valid");
            if (!validCnpj.rows[0].valid) {
                throw new Error('CNPJ válido não foi reconhecido');
            }
            
            // CNPJ inválido
            const invalidCnpj = await query("SELECT validate_cnpj('12.345.678/0001-00') as valid");
            if (invalidCnpj.rows[0].valid) {
                throw new Error('CNPJ inválido foi aceito');
            }
            
            log('blue', '   ✓ Validação de CNPJ funcionando');
            return true;
        }
    },
    {
        name: 'Verificar dados iniciais (seeds)',
        test: async () => {
            // Verificar usuários
            const users = await query('SELECT COUNT(*) as count FROM users');
            if (parseInt(users.rows[0].count) === 0) {
                throw new Error('Nenhum usuário encontrado - seeds não foram executadas');
            }
            
            // Verificar configurações
            const configs = await query('SELECT COUNT(*) as count FROM system_config');
            if (parseInt(configs.rows[0].count) === 0) {
                throw new Error('Nenhuma configuração encontrada - seeds não foram executadas');
            }
            
            // Verificar produtos de exemplo
            const products = await query('SELECT COUNT(*) as count FROM products');
            if (parseInt(products.rows[0].count) === 0) {
                log('yellow', '   ⚠ Nenhum produto encontrado - considere executar seeds');
            }
            
            log('blue', `   ✓ ${users.rows[0].count} usuários, ${configs.rows[0].count} configurações`);
            return true;
        }
    },
    {
        name: 'Testar geração de números automáticos',
        test: async () => {
            // Testar geração de número de OS
            const osNumber = await query('SELECT generate_service_order_number() as number');
            if (!osNumber.rows[0].number) {
                throw new Error('Falha na geração de número de OS');
            }
            
            // Testar geração de número de venda
            const saleNumber = await query('SELECT generate_sale_number() as number');
            if (!saleNumber.rows[0].number) {
                throw new Error('Falha na geração de número de venda');
            }
            
            log('blue', `   ✓ OS: ${osNumber.rows[0].number}, Venda: ${saleNumber.rows[0].number}`);
            return true;
        }
    },
    {
        name: 'Testar configurações do sistema',
        test: async () => {
            // Definir uma configuração de teste
            await query("SELECT set_config('test_key', 'test_value', 'Teste', 'string', 'test', false)");
            
            // Recuperar a configuração
            const config = await query("SELECT get_config('test_key') as value");
            if (config.rows[0].value !== 'test_value') {
                throw new Error('Falha no sistema de configurações');
            }
            
            // Limpar configuração de teste
            await query("DELETE FROM system_config WHERE key = 'test_key'");
            
            log('blue', '   ✓ Sistema de configurações funcionando');
            return true;
        }
    },
    {
        name: 'Verificar índices importantes',
        test: async () => {
            const result = await query(`
                SELECT schemaname, tablename, indexname 
                FROM pg_indexes 
                WHERE schemaname = 'public'
                AND indexname NOT LIKE '%_pkey'
                ORDER BY tablename, indexname
            `);
            
            const indexCount = result.rows.length;
            if (indexCount < 20) {
                log('yellow', `   ⚠ Apenas ${indexCount} índices encontrados - pode afetar performance`);
            } else {
                log('blue', `   ✓ ${indexCount} índices encontrados`);
            }
            
            return true;
        }
    },
    {
        name: 'Verificar constraints e triggers',
        test: async () => {
            // Verificar constraints
            const constraints = await query(`
                SELECT COUNT(*) as count 
                FROM information_schema.table_constraints 
                WHERE constraint_schema = 'public'
                AND constraint_type IN ('CHECK', 'FOREIGN KEY', 'UNIQUE')
            `);
            
            // Verificar triggers
            const triggers = await query(`
                SELECT COUNT(*) as count 
                FROM information_schema.triggers 
                WHERE trigger_schema = 'public'
            `);
            
            log('blue', `   ✓ ${constraints.rows[0].count} constraints, ${triggers.rows[0].count} triggers`);
            return true;
        }
    }
];

// Função principal de teste
async function runTests() {
    console.log('🧪 Executando testes de validação do banco de dados');
    console.log('=' .repeat(60));
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        try {
            console.log(`\n🔍 ${test.name}...`);
            await test.test();
            log('green', `✅ PASSOU: ${test.name}`);
            passed++;
        } catch (error) {
            log('red', `❌ FALHOU: ${test.name}`);
            log('red', `   Erro: ${error.message}`);
            failed++;
        }
    }
    
    // Estatísticas do pool
    console.log('\n📊 Estatísticas do Pool de Conexões:');
    const stats = getPoolStats();
    console.log(`   Total: ${stats.totalCount}`);
    console.log(`   Ociosas: ${stats.idleCount}`);
    console.log(`   Aguardando: ${stats.waitingCount}`);
    
    // Resumo final
    console.log('\n' + '=' .repeat(60));
    console.log(`📋 Resumo dos Testes:`);
    log('green', `   ✅ Passou: ${passed}`);
    if (failed > 0) {
        log('red', `   ❌ Falhou: ${failed}`);
    }
    console.log(`   📊 Total: ${passed + failed}`);
    
    if (failed === 0) {
        log('green', '\n🎉 Todos os testes passaram! Banco de dados está configurado corretamente.');
    } else {
        log('red', '\n⚠️  Alguns testes falharam. Verifique a configuração do banco.');
    }
    
    return failed === 0;
}

// Executar se chamado diretamente
if (require.main === module) {
    runTests()
        .then((success) => {
            process.exit(success ? 0 : 1);
        })
        .catch((error) => {
            console.error('❌ Erro durante os testes:', error);
            process.exit(1);
        })
        .finally(() => {
            closePool();
        });
}

module.exports = { runTests };