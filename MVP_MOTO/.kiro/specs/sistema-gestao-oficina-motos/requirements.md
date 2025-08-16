# Documento de Requisitos - Sistema de Gestão de Oficina Mecânica de Motos

## Introdução

O Sistema de Gestão de Oficina Mecânica de Motos é uma aplicação web completa que visa centralizar e automatizar todos os processos operacionais de uma oficina de motos. O sistema abrange desde o atendimento ao cliente (Ordens de Serviço e vendas) até o controle de estoque e gestão financeira, proporcionando uma solução integrada para pequenas e médias oficinas.

## Requisitos

### Requisito 1 - Gestão de Clientes

**User Story:** Como atendente da oficina, quero cadastrar e gerenciar informações dos clientes, para que eu possa manter um histórico completo e oferecer um atendimento personalizado.

#### Critérios de Aceitação

1. QUANDO o usuário acessar o módulo de clientes ENTÃO o sistema DEVE exibir uma lista de todos os clientes cadastrados
2. QUANDO o usuário clicar em "Novo Cliente" ENTÃO o sistema DEVE apresentar um formulário com campos para dados pessoais, contatos, data de aniversário
3. QUANDO o usuário salvar um cliente ENTÃO o sistema DEVE validar os campos obrigatórios e armazenar as informações
4. QUANDO o usuário visualizar um cliente ENTÃO o sistema DEVE mostrar o histórico completo de serviços e compras
5. QUANDO for o aniversário de um cliente ENTÃO o sistema DEVE incluí-lo no relatório de aniversariantes

### Requisito 2 - Gestão de Fornecedores

**User Story:** Como comprador da oficina, quero cadastrar e gerenciar fornecedores, para que eu possa controlar as compras e manter relacionamentos comerciais organizados.

#### Critérios de Aceitação

1. QUANDO o usuário acessar o módulo de fornecedores ENTÃO o sistema DEVE exibir uma lista de todos os fornecedores cadastrados
2. QUANDO o usuário cadastrar um fornecedor ENTÃO o sistema DEVE armazenar dados comerciais, contatos e condições de pagamento
3. QUANDO o usuário buscar um fornecedor ENTÃO o sistema DEVE permitir filtros por nome, CNPJ ou categoria

### Requisito 3 - Gestão de Mecânicos

**User Story:** Como gerente da oficina, quero cadastrar mecânicos com suas especialidades e agenda, para que eu possa alocar serviços adequadamente.

#### Critérios de Aceitação

1. QUANDO o usuário cadastrar um mecânico ENTÃO o sistema DEVE armazenar nome, especialidades e disponibilidade
2. QUANDO o usuário consultar mecânicos ENTÃO o sistema DEVE mostrar a agenda e serviços em andamento
3. QUANDO gerar relatórios ENTÃO o sistema DEVE permitir filtrar por mecânico específico

### Requisito 4 - Cadastro de Veículos (Placas)

**User Story:** Como atendente, quero cadastrar informações dos veículos dos clientes, para que eu possa identificar rapidamente as motos e seu histórico de manutenção.

#### Critérios de Aceitação

1. QUANDO o usuário cadastrar um veículo ENTÃO o sistema DEVE armazenar placa, marca, modelo, ano e proprietário
2. QUANDO o usuário buscar por placa ENTÃO o sistema DEVE retornar as informações do veículo e histórico de serviços
3. QUANDO vincular a uma OS ENTÃO o sistema DEVE associar automaticamente o veículo ao cliente proprietário

### Requisito 5 - Cadastro de Produtos e Serviços

**User Story:** Como vendedor, quero cadastrar produtos e serviços com fotos e códigos de barras, para que eu possa gerenciar o catálogo e agilizar as vendas.

#### Critérios de Aceitação

1. QUANDO o usuário cadastrar um produto ENTÃO o sistema DEVE permitir inserir código de barras, descrição, preço e foto
2. QUANDO o usuário cadastrar um serviço ENTÃO o sistema DEVE armazenar descrição, tempo estimado e valor da mão de obra
3. QUANDO buscar produtos ENTÃO o sistema DEVE permitir busca por código de barras ou descrição
4. QUANDO visualizar um produto ENTÃO o sistema DEVE exibir a foto cadastrada

### Requisito 6 - Ordens de Serviço (OS)

**User Story:** Como mecânico, quero criar e gerenciar ordens de serviço detalhadas, para que eu possa documentar todos os trabalhos realizados e manter o cliente informado.

#### Critérios de Aceitação

1. QUANDO o usuário criar uma OS ENTÃO o sistema DEVE permitir até 9 linhas de descrição detalhada
2. QUANDO o usuário alterar o status da OS ENTÃO o sistema DEVE registrar a mudança com data e hora
3. QUANDO o usuário imprimir uma OS ENTÃO o sistema DEVE gerar documento compatível com impressoras jato de tinta e laser
4. QUANDO gerar relatórios de OS ENTÃO o sistema DEVE permitir filtros por mecânico, cliente, período e status
5. QUANDO uma OS for finalizada ENTÃO o sistema DEVE permitir baixa automática no estoque dos produtos utilizados

### Requisito 7 - Sistema de Vendas

**User Story:** Como vendedor, quero registrar vendas rapidamente usando código de barras, para que eu possa atender clientes de forma ágil e precisa.

#### Critérios de Aceitação

1. QUANDO o usuário iniciar uma venda ENTÃO o sistema DEVE permitir alternar entre modo "Pedido" e "Orçamento" na mesma tela
2. QUANDO o usuário escanear um código de barras ENTÃO o sistema DEVE adicionar automaticamente o produto à venda
3. QUANDO o usuário aplicar desconto ENTÃO o sistema DEVE permitir desconto por item individual ou no total da venda
4. QUANDO finalizar uma venda ENTÃO o sistema DEVE dar baixa automática no estoque
5. QUANDO imprimir comprovante ENTÃO o sistema DEVE suportar cupom não fiscal, impressora matricial 80 colunas e jato de tinta/laser
6. QUANDO registrar pagamento ENTÃO o sistema DEVE permitir venda à vista ou a prazo com geração de contas a receber
7. QUANDO gerar relatórios de vendas ENTÃO o sistema DEVE permitir filtros por período, cliente, vendedor e status

### Requisito 8 - Controle de Estoque

**User Story:** Como responsável pelo estoque, quero controlar entradas e saídas de produtos automaticamente, para que eu possa manter níveis adequados e evitar rupturas.

#### Critérios de Aceitação

1. QUANDO registrar entrada de produtos ENTÃO o sistema DEVE atualizar automaticamente as quantidades em estoque
2. QUANDO uma venda ou OS for finalizada ENTÃO o sistema DEVE dar baixa automática no estoque
3. QUANDO consultar estoque ENTÃO o sistema DEVE exibir foto do produto, quantidade atual e movimentações
4. QUANDO gerar relatório de estoque ENTÃO o sistema DEVE mostrar posição atual, entradas e saídas por período

### Requisito 9 - Gestão Financeira

**User Story:** Como responsável financeiro, quero controlar contas a pagar, receber e movimento de caixa, para que eu possa manter a saúde financeira da oficina.

#### Critérios de Aceitação

1. QUANDO registrar uma conta a pagar ENTÃO o sistema DEVE armazenar fornecedor, valor, vencimento e status
2. QUANDO uma venda a prazo for realizada ENTÃO o sistema DEVE gerar automaticamente contas a receber
3. QUANDO registrar movimento de caixa ENTÃO o sistema DEVE manter controle diário de entradas e saídas
4. QUANDO gerar recibo ENTÃO o sistema DEVE criar documento imprimível com dados da transação
5. QUANDO consultar relatórios financeiros ENTÃO o sistema DEVE mostrar fluxo de caixa, contas em aberto e recebimentos

### Requisito 10 - Sistema de Relatórios

**User Story:** Como gerente, quero acessar relatórios detalhados de todas as operações, para que eu possa tomar decisões baseadas em dados precisos.

#### Critérios de Aceitação

1. QUANDO gerar relatório de aniversariantes ENTÃO o sistema DEVE listar clientes por mês de aniversário
2. QUANDO gerar relatório de serviços ENTÃO o sistema DEVE mostrar todos os serviços realizados por período
3. QUANDO gerar relatório de OS ENTÃO o sistema DEVE permitir filtros por período, status e mecânico
4. QUANDO gerar relatório de vendas ENTÃO o sistema DEVE permitir múltiplos filtros e visualizações
5. QUANDO gerar relatório de estoque ENTÃO o sistema DEVE mostrar posição atual e movimentações

### Requisito 11 - Configurações e Personalização

**User Story:** Como administrador do sistema, quero personalizar a interface e controlar acessos, para que eu possa adaptar o sistema às necessidades da oficina.

#### Critérios de Aceitação

1. QUANDO o administrador acessar configurações ENTÃO o sistema DEVE permitir upload de logotipo personalizado
2. QUANDO personalizar interface ENTÃO o sistema DEVE permitir alterar fundo de tela
3. QUANDO gerenciar usuários ENTÃO o sistema DEVE permitir diferentes níveis de acesso
4. QUANDO um usuário fazer login ENTÃO o sistema DEVE aplicar as permissões do seu nível de acesso

### Requisito 12 - Segurança e Performance

**User Story:** Como usuário do sistema, quero que minhas informações estejam seguras e o sistema seja rápido, para que eu possa trabalhar com confiança e eficiência.

#### Critérios de Aceitação

1. QUANDO um usuário criar senha ENTÃO o sistema DEVE criptografar usando bcrypt
2. QUANDO acessar o sistema ENTÃO a conexão DEVE ser segura via HTTPS
3. QUANDO fazer login ENTÃO o sistema DEVE controlar sessão com expiração automática
4. QUANDO carregar a aplicação ENTÃO o sistema DEVE carregar em menos de 3 segundos em conexão 4G
5. QUANDO exibir imagens ENTÃO o sistema DEVE usar lazy loading para otimização

### Requisito 13 - Integração e Impressão

**User Story:** Como operador, quero imprimir documentos em diferentes tipos de impressoras, para que eu possa atender às necessidades operacionais da oficina.

#### Critérios de Aceitação

1. QUANDO imprimir OS ou vendas ENTÃO o sistema DEVE suportar impressoras matriciais, jato de tinta e laser
2. QUANDO imprimir cupom ENTÃO o sistema DEVE formatar adequadamente para impressora matricial 80 colunas
3. QUANDO fazer upload de imagens ENTÃO o sistema DEVE integrar com Cloudinary ou AWS S3
4. QUANDO enviar recibos ENTÃO o sistema DEVE integrar com serviços de e-mail