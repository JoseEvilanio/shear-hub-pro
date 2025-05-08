const axios = require('axios');

class WhatsAppBot {
    constructor(config) {
        this.config = config;
        this.n8nWebhookUrl = config.n8nWebhookUrl;
    }

    getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return "Bom dia";
        if (hour < 18) return "Boa tarde";
        return "Boa noite";
    }

    async handleMessage(message) {
        const { from, body, senderName } = message;
        
        // Initial greeting
        if (!this.hasStartedConversation(from)) {
            const greeting = this.getGreeting();
            const welcomeMessage = `${greeting}, ${senderName}! 👋\n\nSou o assistente virtual da ${this.config.storeName}. Estou aqui para te ajudar a fazer seu pedido de forma rápida e fácil.`;
            
            this.saveConversationState(from, { stage: 'waiting_for_option' });
            return welcomeMessage;
        }

        const state = this.getConversationState(from);

        // Handle button options
        if (state.stage === 'waiting_for_option') {
            switch (body) {
                case '1': // Fazer Pedido
                    this.saveConversationState(from, { stage: 'waiting_for_product' });
                    return "Ótimo! Por favor, me diga qual produto você gostaria de pedir hoje.";
                
                case '2': // Falar com Atendente
                    this.saveConversationState(from, { stage: 'completed' });
                    return "Claro! Encaminhando você agora mesmo para um de nossos atendentes humanos. Aguarde um momento, por favor.";
                
                case '3': // Ver Cardápio
                    this.saveConversationState(from, { stage: 'showing_menu' });
                    return "Aqui está nosso cardápio:\n\n🍕 Pizzas:\n- Margherita: R$ 45,00\n- Pepperoni: R$ 50,00\n- Frango com Catupiry: R$ 55,00\n\n🍔 Lanches:\n- X-Burger: R$ 25,00\n- X-Bacon: R$ 30,00\n- X-Tudo: R$ 35,00\n\nPara fazer seu pedido, escolha a opção 'Fazer Pedido' no menu.";
                
                default:
                    return "Por favor, escolha uma das opções disponíveis no menu.";
            }
        }

        // Handle product selection
        if (state.stage === 'waiting_for_product') {
            const orderData = {
                nome: senderName,
                horario: new Date().toLocaleTimeString(),
                produto: body,
                telefone: from,
                origem: 'WhatsApp'
            };

            // Send to n8n
            try {
                await axios.post(this.n8nWebhookUrl, orderData);
                this.saveConversationState(from, { stage: 'completed' });
                return "Obrigado pelo seu pedido! Em breve entraremos em contato para confirmar os detalhes. Posso ajudar com mais alguma coisa?";
            } catch (error) {
                console.error('Error sending to n8n:', error);
                return "Desculpe, tivemos um problema ao processar seu pedido. Por favor, tente novamente em alguns minutos.";
            }
        }

        // Handle human support request
        if (body.toLowerCase().includes('atendente') || body.toLowerCase().includes('humano')) {
            this.saveConversationState(from, { stage: 'completed' });
            return "Claro! Encaminhando você agora mesmo para um de nossos atendentes humanos. Aguarde um momento, por favor.";
        }

        return "Desculpe, não entendi. Pode reformular sua mensagem?";
    }

    // Conversation state management
    conversationStates = new Map();

    hasStartedConversation(userId) {
        return this.conversationStates.has(userId);
    }

    getConversationState(userId) {
        return this.conversationStates.get(userId) || { stage: 'initial' };
    }

    saveConversationState(userId, state) {
        this.conversationStates.set(userId, state);
    }
}

module.exports = WhatsAppBot; 