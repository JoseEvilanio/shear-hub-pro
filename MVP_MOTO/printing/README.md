# Sistema de Impressão - Oficina de Motos

Sistema completo de impressão para o Sistema de Gestão de Oficina Mecânica de Motos, suportando diferentes tipos de impressoras e formatos de documentos.

## 🖨️ Funcionalidades

### 📄 Tipos de Documentos
- **Ordens de Serviço (OS)** - Documentos completos em PDF
- **Vendas e Orçamentos** - Notas de venda em PDF
- **Cupons Não Fiscais** - Recibos para impressora matricial/térmica
- **Recibos de Pagamento** - Comprovantes de recebimento

### 🖨️ Tipos de Impressoras Suportadas
- **Laser/Jato de Tinta** - Documentos A4 em alta qualidade
- **Matricial** - Cupons em papel contínuo (80 colunas)
- **Térmica** - Cupons térmicos (58mm/80mm)

### 🎨 Recursos Avançados
- Templates personalizáveis
- Múltiplos formatos de saída
- Gestão automática de arquivos
- Estatísticas de impressão
- Limpeza automática de arquivos antigos

## 🏗️ Arquitetura

```
printing/
├── services/
│   └── PrintingService.js     # Lógica de geração de documentos
├── controllers/
│   └── PrintingController.js  # Endpoints da API
├── routes/
│   └── printingRoutes.js      # Rotas HTTP
├── templates/                 # Templates personalizados
├── output/                    # Arquivos gerados
├── tests/
│   ├── PrintingService.test.js
│   └── PrintingController.test.js
└── index.js                   # Ponto de entrada
```

## 🚀 Instalação e Uso

### 1. Instalar Dependências

```bash
cd printing
npm install
```

### 2. Integrar com a Aplicação

```javascript
const { initializePrinting, printingRoutes } = require('./printing');

// Inicializar sistema de impressão
await initializePrinting();

// Adicionar rotas à aplicação Express
app.use('/api/printing', printingRoutes);
```

## 📚 API de Impressão

### Imprimir Ordem de Serviço

```http
POST /api/printing/service-orders/{id}?format=pdf&printerType=laser
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "message": "Ordem de serviço gerada com sucesso",
  "data": {
    "filename": "OS_0012024_1642678901234.pdf",
    "filepath": "/path/to/output/OS_0012024_1642678901234.pdf",
    "type": "service_order",
    "format": "pdf"
  }
}
```

### Imprimir Venda/Orçamento

```http
POST /api/printing/sales/{id}?format=pdf&printerType=laser
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "message": "Documento de venda gerado com sucesso",
  "data": {
    "filename": "VENDA_0012024_1642678901234.pdf",
    "filepath": "/path/to/output/VENDA_0012024_1642678901234.pdf",
    "type": "sale",
    "format": "pdf"
  }
}
```

### Gerar Cupom Não Fiscal

```http
POST /api/printing/receipts/{id}?printerType=matrix&preview=true
Authorization: Bearer {token}
```

**Resposta (preview=true):**
```
================================================
              OFICINA DE MOTOS
           CNPJ: 12.345.678/0001-90
         Rua das Flores, 123 - São Paulo
              Tel: (11) 99999-9999
================================================
              CUPOM NAO FISCAL
                 Nº VD001
================================================
Data: 15/01/2024
Vendedor: João Silva
Cliente: Maria Santos
------------------------------------------------
ITEM                     QTD  VL.UNIT   TOTAL
------------------------------------------------
Oleo Motor 20W50           2    25.90   51.80
Filtro de Oleo             1    15.90   15.90
------------------------------------------------
Subtotal:                              67.70
Desconto:                               5.00
TOTAL:                                 62.70
------------------------------------------------
Pagamento: Dinheiro
================================================
         Obrigado pela preferencia!
================================================
```

### Gerar Recibo de Pagamento

```http
POST /api/printing/payment-receipts
Authorization: Bearer {token}
Content-Type: application/json

{
  "id": "REC001",
  "clientName": "João Silva",
  "amount": 150.00,
  "description": "Pagamento de serviços de manutenção",
  "date": "2024-01-15",
  "paymentMethod": "cash"
}
```

### Download de Arquivo

```http
GET /api/printing/files/{filename}/download
Authorization: Bearer {token}
```

### Visualizar Arquivo

```http
GET /api/printing/files/{filename}/view
Authorization: Bearer {token}
```

### Listar Arquivos Gerados

```http
GET /api/printing/files?limit=50&type=OS
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "message": "Arquivos listados com sucesso",
  "data": {
    "files": [
      {
        "filename": "OS_0012024_1642678901234.pdf",
        "filepath": "/path/to/file.pdf",
        "size": 245760,
        "createdAt": "2024-01-15T10:30:00Z",
        "modifiedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 1
  }
}
```

## 🎨 Personalização de Templates

### Estrutura de Template de OS

```json
{
  "type": "service_order",
  "sections": {
    "header": {
      "showLogo": true,
      "showCompanyInfo": true,
      "titleColor": "#2563eb"
    },
    "client": {
      "showAddress": true,
      "showEmail": true
    },
    "vehicle": {
      "showColor": true,
      "showYear": true
    },
    "description": {
      "maxLines": 9,
      "fontSize": 10
    },
    "items": {
      "showImages": false,
      "showDiscount": true
    },
    "footer": {
      "showSignature": true,
      "customText": "Obrigado pela preferência!"
    }
  }
}
```

### Criar Template Personalizado

```javascript
const { createCustomTemplate } = require('./printing');

const customTemplate = {
  type: "service_order",
  name: "Template Personalizado",
  sections: {
    header: { titleColor: "#ff0000" },
    footer: { customText: "Sua oficina de confiança!" }
  }
};

const result = createCustomTemplate('service_order', customTemplate);
```

## 🔧 Configuração Avançada

### Configurações de Impressora

```javascript
const config = {
  laser: {
    paperSize: 'A4',
    orientation: 'portrait',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    quality: 'high'
  },
  matrix: {
    columns: 80,
    lineHeight: 1.2,
    charset: 'cp850'
  },
  thermal: {
    width: 58, // mm
    density: 8,
    speed: 4
  }
};
```

### Impressão Rápida

```javascript
const { quickPrint } = require('./printing');

// Imprimir OS em PDF
const result = await quickPrint('service_order', 'os-123', {
  format: 'pdf',
  printerType: 'laser'
});

// Gerar cupom matricial
const receipt = await quickPrint('sale', 'sale-456', {
  format: 'receipt',
  printerType: 'matrix'
});
```

## 📊 Estatísticas e Monitoramento

### Obter Estatísticas

```http
GET /api/printing/stats
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "message": "Estatísticas obtidas com sucesso",
  "data": {
    "totalFiles": 150,
    "totalSize": 15728640,
    "byType": {
      "OS": { "count": 75, "size": 7864320 },
      "VD": { "count": 60, "size": 6291456 },
      "CUPOM": { "count": 15, "size": 1572864 }
    },
    "byDate": {
      "2024-01-15": { "count": 25, "size": 2621440 }
    },
    "recentFiles": [
      {
        "filename": "OS_0012024_latest.pdf",
        "size": 245760,
        "createdAt": "2024-01-15T14:30:00Z"
      }
    ]
  }
}
```

### Limpeza de Arquivos

```http
DELETE /api/printing/files/cleanup?days=30
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "message": "Limpeza de arquivos concluída",
  "data": {
    "deletedCount": 25,
    "cutoffDate": "2023-12-16T00:00:00Z"
  }
}
```

## 🧪 Testes

### Executar Testes

```bash
# Todos os testes
npm test

# Testes em modo watch
npm run test:watch

# Cobertura de testes
npm run test:coverage
```

### Teste de Impressão

```http
POST /api/printing/test
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "receipt",
  "printerType": "matrix"
}
```

## 🔒 Segurança e Permissões

### Controle de Acesso

- **Operator+** - Acesso a todas as funcionalidades de impressão
- **Mechanic** - Apenas impressão de suas próprias OS

### Validações

- Verificação de existência de documentos
- Validação de formatos suportados
- Controle de tamanho de arquivos
- Rate limiting para prevenção de abuso

## 📈 Performance

### Otimizações

- Geração assíncrona de PDFs
- Cache de configurações da empresa
- Limpeza automática de arquivos antigos
- Compressão de PDFs

### Limites

- **Tamanho máximo de arquivo**: 10MB
- **Idade máxima de arquivo**: 30 dias
- **Máximo de arquivos por dia**: 1000

## 🔧 Manutenção

### Limpeza Automática

O sistema executa limpeza automática diariamente às 3h:
- Remove arquivos com mais de 30 dias
- Limpa arquivos temporários
- Otimiza uso de disco

### Monitoramento

```javascript
const { getPrintingSystemStats } = require('./printing');

const stats = await getPrintingSystemStats();
console.log('Uso de disco:', stats.disk.used);
console.log('Arquivos gerados:', stats.disk.files);
```

## 🔄 Integração

### Com Sistema de Vendas

```javascript
// Após finalizar venda
const saleId = 'sale-123';
const printResult = await quickPrint('sale', saleId, {
  format: 'receipt',
  printerType: 'matrix'
});

// Enviar para impressora
sendToPrinter(printResult.filepath);
```

### Com Sistema de OS

```javascript
// Após completar OS
const osId = 'os-456';
const printResult = await quickPrint('service_order', osId, {
  format: 'pdf',
  printerType: 'laser'
});

// Disponibilizar para download
res.json({ downloadUrl: `/api/printing/files/${printResult.filename}/download` });
```

## 📝 Changelog

### v1.0.0
- Sistema completo de impressão
- Suporte a 3 tipos de impressoras
- Geração de PDFs e cupons
- Templates personalizáveis
- Limpeza automática
- Estatísticas detalhadas
- Testes unitários completos

## 🚀 Roadmap

### v1.1.0
- Suporte a impressão em lote
- Templates visuais (drag & drop)
- Integração com impressoras de rede
- Assinatura digital em PDFs

### v1.2.0
- Impressão de códigos de barras/QR
- Templates responsivos
- API de webhooks para impressão
- Dashboard de monitoramento

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.