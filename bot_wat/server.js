const express = require('express');
const LovableIntegration = require('./lovable-integration');

const app = express();
const port = process.env.PORT || 3000;

// Middleware para processar JSON
app.use(express.json());

// Instância da integração
const lovableIntegration = new LovableIntegration();

// Rota para receber webhooks do WhatsApp
app.post('/webhook', (req, res) => {
    lovableIntegration.handleWebhook(req, res);
});

// Rota de teste
app.get('/', (req, res) => {
    res.send('Bot WhatsApp está funcionando!');
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
}); 