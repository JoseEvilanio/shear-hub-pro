# WhatsApp Bot para Atendimento Automatizado

Este é um bot de atendimento automatizado para WhatsApp, desenvolvido para a plataforma Lovable IA, que gerencia pedidos e integra com n8n para automações.

## Funcionalidades

- Saudação personalizada baseada no horário local
- Coleta de pedidos de produtos
- Integração com n8n para automações
- Encaminhamento para atendente humano quando solicitado

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure o arquivo `config.js`:
- Substitua `Sua Loja` pelo nome da sua loja
- Adicione a URL do webhook do n8n em `n8nWebhookUrl`

3. Integração com Lovable IA:
- Importe o código do bot na plataforma Lovable IA
- Configure as variáveis de ambiente necessárias
- Ative o bot no seu número de WhatsApp

## Estrutura do Projeto

- `bot.js`: Código principal do bot
- `config.js`: Configurações do bot
- `README.md`: Documentação

## Formato dos Dados

Os dados são enviados para o n8n no seguinte formato JSON:

```json
{
  "nome": "nome_do_cliente",
  "horario": "horario_local",
  "produto": "produto_pedido",
  "telefone": "numero_telefone",
  "origem": "WhatsApp"
}
```

## Fluxo de Conversação

1. O bot verifica o horário local e envia uma saudação apropriada
2. Solicita o produto desejado
3. Processa o pedido e envia para o n8n
4. Aguarda confirmação do cliente
5. Encaminha para atendente humano quando solicitado 