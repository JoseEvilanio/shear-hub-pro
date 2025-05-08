const venom = require('venom-bot');
const WhatsAppBot = require('./bot');
const config = require('./config');

// Criar instância do nosso bot
const bot = new WhatsAppBot(config);

// Inicializar o cliente Venom
venom
    .create({
        session: 'bot-teste',
        multidevice: true,
        headless: false,
        browserArgs: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    })
    .then((client) => {
        console.log('Cliente WhatsApp conectado!');
        
        // Escutar mensagens recebidas
        client.onMessage(async (message) => {
            try {
                // Obter informações do contato
                const contact = await client.getContact(message.from);
                const contactName = contact.pushname || contact.name || 'Cliente';
                const contactNumber = message.from;

                // Formatar mensagem no padrão do nosso bot
                const formattedMessage = {
                    from: contactNumber,
                    body: message.body,
                    senderName: contactName
                };

                // Processar mensagem com nosso bot
                const response = await bot.handleMessage(formattedMessage);

                // Se for a primeira mensagem, enviar botões
                if (!bot.hasStartedConversation(contactNumber)) {
                    const buttons = [
                        { buttonId: '1', buttonText: { displayText: 'Fazer Pedido' }, type: 1 },
                        { buttonId: '2', buttonText: { displayText: 'Falar com Atendente' }, type: 1 },
                        { buttonId: '3', buttonText: { displayText: 'Ver Cardápio' }, type: 1 }
                    ];

                    const buttonMessage = {
                        text: response,
                        footer: 'Escolha uma opção:',
                        buttons: buttons,
                        headerType: 1
                    };

                    await client.sendButtons(message.from, buttonMessage);
                } else {
                    // Enviar resposta normal
                    await client.sendText(message.from, response);
                }
            } catch (error) {
                console.error('Erro ao processar mensagem:', error);
                await client.sendText(message.from, 'Desculpe, ocorreu um erro ao processar sua mensagem.');
            }
        });

        // Função para enviar mensagem de teste
        async function enviarMensagemTeste(numero) {
            try {
                const buttons = [
                    { buttonId: '1', buttonText: { displayText: 'Fazer Pedido' }, type: 1 },
                    { buttonId: '2', buttonText: { displayText: 'Falar com Atendente' }, type: 1 },
                    { buttonId: '3', buttonText: { displayText: 'Ver Cardápio' }, type: 1 }
                ];

                const buttonMessage = {
                    text: 'Olá! Este é um teste do bot.',
                    footer: 'Escolha uma opção:',
                    buttons: buttons,
                    headerType: 1
                };

                await client.sendButtons(numero, buttonMessage);
                console.log('Mensagem de teste enviada com sucesso!');
            } catch (error) {
                console.error('Erro ao enviar mensagem de teste:', error);
            }
        }

        // Exemplo de como enviar uma mensagem de teste
        // Descomente a linha abaixo e substitua pelo número desejado
        // enviarMensagemTeste('5511999999999@c.us');

    })
    .catch((error) => {
        console.error('Erro ao inicializar o cliente:', error);
    }); 