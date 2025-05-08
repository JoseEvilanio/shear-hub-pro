const WhatsAppBot = require('./bot');
const config = require('./config');

class LovableIntegration {
    constructor() {
        this.bot = new WhatsAppBot(config);
    }

    async handleWebhook(req, res) {
        try {
            const { message, from, name } = req.body;
            
            // Formatar mensagem no padrão do nosso bot
            const formattedMessage = {
                from: from,
                body: message,
                senderName: name
            };

            // Processar mensagem com nosso bot
            const response = await this.bot.handleMessage(formattedMessage);

            // Enviar resposta de volta para o WhatsApp
            // Aqui você precisará implementar a lógica de envio usando a API da Lovable
            // Exemplo de como seria:
            // await lovableAPI.sendMessage(from, response);

            res.status(200).json({ success: true, response });
        } catch (error) {
            console.error('Erro ao processar webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = LovableIntegration; 