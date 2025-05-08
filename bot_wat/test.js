const WhatsAppBot = require('./bot');
const config = require('./config');

// Criar instância do bot
const bot = new WhatsAppBot(config);

// Função para simular mensagens
async function testarBot() {
    console.log('=== Iniciando testes do bot ===\n');

    // Teste 1: Primeira mensagem (saudação)
    console.log('Teste 1: Primeira mensagem');
    const mensagem1 = {
        from: '5511999999999',
        body: 'oi',
        senderName: 'João Silva'
    };
    const resposta1 = await bot.handleMessage(mensagem1);
    console.log('Resposta:', resposta1);
    console.log('---\n');

    // Teste 2: Pedido de produto
    console.log('Teste 2: Pedido de produto');
    const mensagem2 = {
        from: '5511999999999',
        body: 'Quero um bolo de chocolate',
        senderName: 'João Silva'
    };
    const resposta2 = await bot.handleMessage(mensagem2);
    console.log('Resposta:', resposta2);
    console.log('---\n');

    // Teste 3: Solicitação de atendente humano
    console.log('Teste 3: Solicitação de atendente humano');
    const mensagem3 = {
        from: '5511999999999',
        body: 'Quero falar com um atendente',
        senderName: 'João Silva'
    };
    const resposta3 = await bot.handleMessage(mensagem3);
    console.log('Resposta:', resposta3);
    console.log('---\n');

    // Teste 4: Nova conversa com outro número
    console.log('Teste 4: Nova conversa com outro número');
    const mensagem4 = {
        from: '5511988888888',
        body: 'olá',
        senderName: 'Maria Santos'
    };
    const resposta4 = await bot.handleMessage(mensagem4);
    console.log('Resposta:', resposta4);
}

// Executar testes
testarBot().catch(console.error); 