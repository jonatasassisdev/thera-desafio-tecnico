# OVGS — Sistema de Gestão de Ordens de Venda

Solução Full Stack para o desafio técnico de gestão do ciclo de vida de Ordens de Venda (OVs): cadastros, criação e acompanhamento de OVs, agendamento de entregas e auditoria das principais alterações.

> Este repositório contempla os requisitos de **Back-end** e **Front-end** do desafio. A vaga em avaliação é de Frontend Sênior, mas o enunciado técnico exige explicitamente tecnologias de backend (NestJS, banco relacional, Docker Compose) — optou-se por entregar a solução completa para cobrir os dois perfis e demonstrar capacidade de transitar entre as camadas.

## Sumário

- [Tecnologias utilizadas](#tecnologias-utilizadas)
- [Como executar](#como-executar)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Decisões arquiteturais](#decisões-arquiteturais)
- [Design system e componentes do frontend](#design-system-e-componentes-do-frontend)
- [Estratégia de modelagem do domínio](#estratégia-de-modelagem-do-domínio)
- [Estratégia de persistência](#estratégia-de-persistência)
- [Testes](#testes)
- [Considerações sobre escalabilidade](#considerações-sobre-escalabilidade)
- [Considerações sobre performance](#considerações-sobre-performance)
- [Trade-offs assumidos](#trade-offs-assumidos)
- [Diferenciais implementados](#diferenciais-implementados)
- [Responsividade](#responsividade)
- [Uso de IA no desenvolvimento](#uso-de-ia-no-desenvolvimento)

## Tecnologias utilizadas

**Backend**
- Node.js + TypeScript + NestJS
- Prisma ORM (v5) + PostgreSQL
- class-validator / class-transformer para validação de DTOs
- Swagger (OpenAPI) para documentação da API
- Jest + Supertest para testes unitários e de integração

**Frontend**
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 (design system próprio, sem UI kit de terceiros)
- React Query (`@tanstack/react-query`) para estado de servidor (fetch, cache, invalidação, indicador global de carregamento)
- Redux Toolkit + Redux Saga para estado de UI e orquestração de efeitos colaterais (fila de notificações)
- React Hook Form + Zod para formulários e validação
- lucide-react para iconografia

**Infraestrutura**
- Docker Compose (PostgreSQL + backend + frontend)

> Nota sobre idioma: todo o código (entidades, variáveis, rotas, mensagens de exceção da API) foi escrito em inglês, seguindo convenção usual de desenvolvimento. A interface do frontend (o que o usuário final lê) foi escrita em português, já que o desafio e o contexto de negócio são em português. As mensagens de erro da API (em inglês) são traduzidas na camada de apresentação do frontend (`frontend/src/lib/api/translate-error.ts`) antes de serem exibidas ao usuário.

## Como executar

### Opção 1 — Docker Compose (recomendado)

Pré-requisitos: Docker e Docker Compose.

```bash
docker compose up --build
```

Isso sobe três serviços:

| Serviço  | URL                          |
|----------|-------------------------------|
| Frontend | http://localhost:3000         |
| Backend  | http://localhost:3333         |
| Swagger  | http://localhost:3333/docs    |
| Postgres | localhost:5432 (ovgs/ovgs/ovgs)|

O backend roda `prisma migrate deploy` automaticamente na inicialização do container, então o banco já sobe com o schema aplicado. Não há seed automático — o banco inicia vazio (ver [Trade-offs](#trade-offs-assumidos)).

### Opção 2 — Execução local (sem Docker)

Backend:

```bash
cd backend
cp .env.example .env      # ajuste DATABASE_URL se necessário
npm install
npx prisma migrate dev
npm run start:dev          # http://localhost:3333
```

Frontend:

```bash
cd frontend
cp .env.example .env.local # ajuste NEXT_PUBLIC_API_URL se necessário
npm install
npm run dev                 # http://localhost:3000 (ou próxima porta livre)
```

Requer um PostgreSQL acessível (local ou em container) para o backend.

## Estrutura do repositório

```
ovgs/
├── backend/                    # API REST — NestJS + Prisma
│   ├── prisma/                  # schema e migrations
│   ├── src/
│   │   ├── customers/           # Cadastro de clientes (CRUD completo)
│   │   ├── transport-types/     # Cadastro de tipos de transporte (CRUD completo)
│   │   ├── items/                # Cadastro de itens (CRUD completo)
│   │   ├── sales-orders/         # Ordens de Venda + máquina de estados
│   │   │   └── domain/            # state machine e exceptions de domínio
│   │   ├── scheduling/            # Central de Agendamento
│   │   ├── audit/                 # Auditoria
│   │   ├── prisma/                # PrismaService/Module
│   │   └── common/
│   │       ├── filters/            # filtro global de exceções
│   │       ├── dto/                # PaginationQueryDto (reaproveitado nos módulos)
│   │       └── pagination/         # helper de paginação (skip/take + meta)
│   └── test/                    # testes de integração (e2e)
├── frontend/                   # Interface — Next.js
│   └── src/
│       ├── app/                  # rotas (App Router) — uma pasta por tela
│       ├── components/
│       │   ├── ui/                # design system: Button, Chip, Modal, SelectInput,
│       │   │                      # AutocompleteInput, DateInput, TimeInput, DocumentInput,
│       │   │                      # SearchInput, Pagination, GlobalLoader, ConfirmDialog...
│       │   ├── layout/             # Sidebar, AppShell
│       │   ├── providers/          # React Query + Redux providers
│       │   ├── scheduling/         # painel de agendamento reutilizado em 2 telas
│       │   └── customers|items|transport-types/  # modais de "cadastro rápido" inline
│       ├── hooks/                 # hooks de React Query por recurso
│       ├── lib/                    # api client, tipos, tradução de erros, máscaras,
│       │                          # utilitários de data/hora, formatação de auditoria
│       └── store/                  # Redux Toolkit + Saga (toasts)
└── docker-compose.yml
```

## Decisões arquiteturais

**Backend — arquitetura em camadas pragmática (Controller → Service → Prisma), não Clean Architecture.**
Cada módulo de domínio (customers, transport-types, items, sales-orders, scheduling, audit) segue a convenção padrão do NestJS: Controller (rotas/HTTP), Service (regras de negócio) e acesso a dados via Prisma diretamente no Service (sem uma camada de Repository adicional). A lógica de domínio mais sensível — a máquina de estados da Ordem de Venda — foi extraída para uma classe própria (`sales-orders/domain/sales-order-status.state-machine.ts`), testável isoladamente e sem dependência de infraestrutura.

Optou-se deliberadamente por **não** adotar Clean Architecture / Hexagonal com camadas de domain/application/infrastructure separadas. Trade-off: para o escopo e prazo do desafio, a estrutura em camadas do NestJS já garante separação de responsabilidades suficiente (controller não acessa banco, regra de negócio não depende de Express/Nest); introduzir portas/adaptadores adicionais aumentaria a quantidade de arquivos e indireção sem ganho proporcional de testabilidade ou manutenibilidade neste tamanho de aplicação.

**Auditoria via chamada explícita ao `AuditService`, não via interceptor/decorator global.**
Cada operação de mutação relevante (criação de OV, mudança de status, alteração de transporte, alteração de agendamento) chama `auditService.record(...)` explicitamente dentro da mesma transação Prisma (`$transaction`) que persiste a mudança de estado. Trade-off: um interceptor global seria mais "mágico" e exigiria menos linhas por endpoint, mas tornaria menos óbvio o que está sendo auditado e dificultaria capturar o estado anterior/posterior de forma precisa. A abordagem explícita é mais verbosa, porém mais fácil de auditar e testar — e permite enriquecer o payload (ex: gravar o **nome** do cliente/transporte além do ID, para a trilha de auditoria continuar legível mesmo que o registro original seja renomeado ou removido no futuro).

**Confirmação de agendamento avança o status da Ordem de Venda automaticamente.**
A regra de negócio já bloqueava a transição para `SCHEDULED` sem um agendamento `CONFIRMED`. Como esses dois fatos são, na prática, a mesma coisa do ponto de vista de negócio ("a OV tem uma entrega confirmada"), o `SchedulingService.confirm()` verifica se a OV está em `PLANNED` e, se estiver, chama o mesmo `SalesOrdersService.updateStatus()` usado pela transição manual — reaproveitando a state machine e gerando um evento de auditoria `STATUS_CHANGED` próprio, sem duplicar lógica. Isso elimina um clique manual redundante e evita o risco de uma OV ficar com agendamento confirmado mas status desatualizado.

**Tratamento de exceções centralizado.**
Um `AllExceptionsFilter` global traduz exceções do NestJS e códigos conhecidos do Prisma (`P2002`, `P2025`, `P2003`) em respostas HTTP padronizadas (`{ statusCode, message, path, timestamp }`), evitando vazamento de detalhes de infraestrutura para o cliente. O código `P2003` (violação de chave estrangeira) cobre tanto "referência inválida na criação" quanto "não é possível excluir, o registro ainda está em uso" — os dois cenários de integridade referencial que o sistema precisa proteger (ex: não se exclui um `TransportType` ou `Customer` referenciado por uma OV).

**Frontend — separação de responsabilidades entre React Query, Redux Toolkit e Redux Saga.**
O desafio técnico (voltado à vaga de Frontend Sênior) pede explicitamente React Query, Redux Toolkit e Redux Saga — três ferramentas que, na prática, se sobrepõem parcialmente em gerenciamento de estado. Para usar as três de forma coerente (e não apenas decorativa), a responsabilidade foi dividida assim:
- **React Query**: toda a comunicação com a API (fetch, cache, invalidação, retries, paginação) — é a fonte de verdade para dados de servidor (clientes, itens, ordens de venda, agendamentos), e também alimenta o indicador global de carregamento (`useIsFetching`/`useIsMutating`).
- **Redux Toolkit**: estado de UI local ao app (fila de notificações/toasts).
- **Redux Saga**: orquestração de efeitos colaterais assíncronos desacoplados da UI — uma saga (`toasts-saga.ts`) escuta a action `notify` disparada pelos hooks de mutation (sucesso/erro de qualquer operação) e controla a exibição e auto-dismissal (delay + dispatch) dos toasts, sem acoplar esse timing ao componente que disparou a notificação.

Essa divisão evita o anti-padrão comum de duplicar estado de servidor no Redux; cada ferramenta faz o que faz melhor.

**Máquina de estados no frontend espelha o backend, mas não o substitui.**
`frontend/src/lib/sales-order-transitions.ts` replica o mapa de transições válidas apenas para desabilitar/ocultar ações inválidas na UI (melhor UX — só mostra o próximo status possível). A validação real acontece sempre no backend — o frontend nunca é a fonte de verdade da regra de negócio.

## Design system e componentes do frontend

Todos os inputs "não triviais" da aplicação são **componentes próprios**, não widgets nativos do navegador — decisão tomada porque `<select>`, `<input type="date">` e `<input type="time">` nativos têm aparência inconsistente entre navegadores/SO e não podem ser restilizados para acompanhar o tema visual da aplicação:

- **`SelectInput`** — dropdown customizado para listas curtas e fixas (status, filtros booleanos). Não é backed por um cadastro que cresce.
- **`AutocompleteInput`** — combobox com busca (ignora acentuação) para campos que referenciam um cadastro que pode crescer (Cliente, Tipo de Transporte, Item) — onde um `<select>` simples deixaria de escalar. Suporta uma ação opcional de **"Cadastrar novo"** no rodapé do dropdown, que abre um modal de criação rápida sem sair da tela atual (usado na Nova Ordem de Venda para Cliente/Tipo de Transporte/Item).
- **`DateInput` / `TimeInput`** — calendário e seletor de horário customizados, com o mesmo padrão visual do restante do design system.
- **`DocumentInput`** — máscara progressiva de CPF/CNPJ (detecta o tipo pelo número de dígitos digitados).
- **`Chip`** — pill de status com exatamente 6 tons semânticos fixos (`success`, `error`, `warning`, `disabled`, `info`, `primary`), usado em todos os badges de status da aplicação (Ordem de Venda, Agendamento, Ativo/Inativo) — garante que qualquer novo status futuro tenha que se encaixar em um vocabulário visual consistente, em vez de cores ad-hoc.
- **`Modal` / `ConfirmDialog`** — modal renderizado via `createPortal` (React) diretamente no `<body>`, evitando bugs de posicionamento (`position: fixed` fica preso dentro de um ancestral com `transform` — CSS Cascade) e de z-index.
- **`Pagination`** — controle único reaproveitado em todas as listagens, client-side ou server-side.
- **`GlobalLoader`** — indicador de carregamento global, ver [Considerações sobre performance](#considerações-sobre-performance).

## Estratégia de modelagem do domínio

Entidades principais (ver `backend/prisma/schema.prisma`):

- **Customer** (Cliente) — possui uma lista de `TransportType` autorizados via tabela de junção explícita `CustomerTransportType` (N:N com atributo de data, permitindo evoluir futuramente para registrar quem autorizou/quando sem quebrar o schema).
- **TransportType** (Tipo de Transporte) — cadastro simples e extensível; novos tipos não exigem alteração de código (a regra de negócio não depende de valores fixos de tipo de transporte, apenas da relação de autorização).
- **Item** — cadastro simples com SKU único.
- **SalesOrder** (Ordem de Venda) — vinculada a exatamente um `Customer` e um `TransportType`; contém 1..N `SalesOrderItem` (tabela de junção com quantidade); possui um `status` (`SalesOrderStatus`) e um número sequencial amigável (`number`, autoincrement) para exibição.
- **Scheduling** (Agendamento) — 1:1 com `SalesOrder` (uma OV tem no máximo um agendamento ativo); guarda data de entrega, janela de atendimento e status (`PENDING` → `CONFIRMED` / `RESCHEDULED`).
- **AuditLog** — registro de eventos com ação, entidade afetada, estado anterior e posterior (JSON), desacoplado de qualquer entidade específica via `entity` + `entityId` genéricos. Eventos de criação de OV e de troca de transporte gravam também o **nome** do cliente/transporte no JSON, não apenas o ID — o frontend formata isso em texto legível (`lib/audit-format.ts`) em vez de exibir o JSON cru.

**Máquina de estados da Ordem de Venda:** `CREATED → PLANNED → SCHEDULED → IN_TRANSIT → DELIVERED`, estritamente sequencial (sem retrocesso, sem estados de cancelamento — não solicitados pelo enunciado, mantido escopo fiel à especificação). A transição para `SCHEDULED` é bloqueada caso não exista um `Scheduling` com status `CONFIRMED` para a OV, e — como descrito acima — confirmar o agendamento já dispara essa transição automaticamente quando aplicável.

## Estratégia de persistência

- **PostgreSQL** como banco relacional, adequado ao domínio fortemente relacional (clientes, transportes, itens, ordens e seus vínculos) com necessidade de integridade referencial (ex: não é possível excluir um `TransportType` referenciado por uma OV).
- **Prisma** como ORM, escolhido entre as opções permitidas (Prisma, TypeORM, Sequelize) pela tipagem gerada automaticamente a partir do schema (reduz divergência entre modelo de dados e código), migrations declarativas versionadas em `prisma/migrations`, e API de transações (`$transaction`) usada para garantir atomicidade entre a mutação de negócio e o registro de auditoria.
- **Fixado em Prisma v5.x** (não a v7, mais recente) — decisão deliberada: a v7 introduziu mudanças estruturais (client ESM-only por padrão, exigência de "driver adapters") que trariam risco e tempo de adaptação desnecessários dado o prazo do desafio, sem benefício direto para os requisitos pedidos. A v5 é madura, amplamente documentada e mantém compatibilidade direta com NestJS em CommonJS.
- Chaves primárias em UUID (evita previsibilidade de IDs sequenciais expostos via API), com um campo `number` autoincrement separado apenas para exibição amigável da Ordem de Venda.
- Índice composto em `AuditLog(entity, entityId)` para consultas eficientes da trilha de auditoria por entidade.
- **Paginação real no banco** para as entidades de maior volume operacional (`SalesOrder`, `Scheduling`): `skip`/`take` + `count` executados juntos em um único `$transaction`, retornando `{ data, meta: { page, pageSize, total, totalPages } }` — ver detalhes em [Considerações sobre escalabilidade](#considerações-sobre-escalabilidade).

## Testes

- **13 testes unitários** (`backend/src/sales-orders/domain/sales-order-status.state-machine.spec.ts` e `sales-orders.service.spec.ts`): cobrem todas as transições válidas/inválidas da máquina de estados, a rejeição de transporte não autorizado na criação de OV, e o bloqueio de transição para `SCHEDULED` sem agendamento confirmado — usando mocks do Prisma e dos serviços colaboradores.
- **1 teste de integração** (`backend/test/sales-orders.e2e-spec.ts`): sobe a aplicação NestJS completa com Postgres real e percorre o fluxo de ponta a ponta via HTTP (Supertest) — criação de cadastros, rejeição de transporte não autorizado, tentativa de transição inválida, definição e confirmação de agendamento (incluindo o avanço automático para `SCHEDULED`), e verificação da trilha de auditoria gerada.
- Validação manual adicional: fluxo completo testado via navegador real (Playwright) contra a stack em Docker Compose e em ambiente de desenvolvimento, cobrindo cadastros, cadastro rápido inline, criação de OV, ciclo de vida completo, agendamento, paginação e auditoria.

```bash
cd backend
npm test        # unitários
npm run test:e2e # integração (requer Postgres acessível via DATABASE_URL)
```

## Considerações sobre escalabilidade

- O backend é **stateless** (nenhuma sessão em memória), permitindo escalar horizontalmente atrás de um load balancer sem alterações.
- A separação em módulos NestJS coesos (customers, sales-orders, scheduling, audit...) facilita uma eventual extração para serviços independentes caso o domínio cresça, sem exigir reescrita do modelo.
- **Paginação implementada com estratégia híbrida, deliberadamente:**
  - `GET /sales-orders` e `GET /scheduling` — paginação **server-side** real (`page`/`pageSize` na query, `skip`/`take` no Prisma). São as entidades operacionais que crescem sem limite natural (uma Ordem de Venda por venda realizada), então a paginação precisa acontecer no banco, não na memória da aplicação.
  - `GET /customers`, `GET /transport-types`, `GET /items` — continuam retornando a lista completa; a paginação e a busca acontecem no frontend. Esses são cadastros de referência (tipicamente dezenas a centenas de registros, não milhões), então trazer tudo de uma vez e paginar/filtrar em memória no cliente é mais simples e evita uma requisição de rede a cada tecla digitada na busca ou a cada página virada. Se esses cadastros crescerem muito, a mesma abordagem server-side do `sales-orders` pode ser replicada sem quebrar a API pública (o `PaginationQueryDto` já existe e é reaproveitável).
- O uso de UUID como chave primária facilita estratégias futuras de sharding/particionamento por não depender de uma sequência centralizada.
- Para picos de escrita em auditoria (alto volume de mutações), a gravação síncrona dentro da transação é simples e consistente, mas um passo natural de evolução seria mover para um modelo assíncrono (fila/event bus) caso a auditoria se torne um gargalo de latência de escrita — trade-off consistência-imediata vs. throughput.

## Considerações sobre performance

**Backend**
- Consultas usam `include` do Prisma para buscar relações necessárias em uma única query (evitando N+1) ao montar respostas de Ordem de Venda (cliente, transporte, itens, agendamento).
- Índice em `AuditLog(entity, entityId)` evita full scan ao consultar a trilha de auditoria de uma entidade específica.
- Contagem (`count`) e busca paginada (`findMany` com `skip`/`take`) executadas juntas em um único `prisma.$transaction([...])` — uma única viagem lógica ao banco por requisição de listagem, em vez de duas consultas sequenciais desnecessárias.
- Transações Prisma (`$transaction`) usadas apenas onde há mais de uma escrita relacionada (criação de OV + auditoria; mudança de status + auditoria), evitando o overhead de transações para leituras simples.

**Frontend**
- React Query mantém cache client-side com `staleTime` de 15s e invalidação seletiva por chave de query após mutations (`invalidateQueries({ queryKey: [...] })` específico, nunca um refetch geral), evitando refetch desnecessário de listas inteiras a cada navegação.
- **Indicador global de carregamento (`GlobalLoader`) com custo zero quando ocioso**: em vez de instrumentar `isLoading` manualmente em cada tela, ele observa diretamente o cache do React Query (`useIsFetching`/`useIsMutating`) — nenhuma requisição extra, nenhum polling. Quando não há requisição em andamento, o componente retorna `null` (nenhum nó de DOM, nenhuma animação rodando). Uma duração mínima de exibição (400ms) evita "flash" em respostas muito rápidas sem bloquear a interface (`pointer-events-none`).
- Todas as animações (spinner, transições de modal/toast, dropdown) usam exclusivamente `transform`, `opacity` e propriedades compostas pelo GPU — nunca propriedades que disparam reflow (`left`, `width`, `top`) em elementos animados em loop.
- Busca client-side nos cadastros (Clientes, Tipos de Transporte, Itens) é apenas um filtro de substring em memória (normalizado, ignorando acentos) — sem debounce necessário porque não há requisição de rede por tecla digitada.
- `Modal` renderizado via portal evita que uma mudança de layout em qualquer tela precise levar em conta a presença de um modal sobreposto — eles vivem em subárvores DOM completamente separadas.

## Trade-offs assumidos

- **Full Stack em vez de apenas Frontend:** a vaga avaliada é Frontend Sênior, mas o desafio técnico enviado exige tecnologias de backend como obrigatórias. Optou-se por entregar os dois perfis para não deixar de atender a nenhum dos dois documentos recebidos.
- **Sem autenticação/autorização:** não solicitada no escopo mínimo do desafio; mencionada apenas como diferencial. Não implementada para manter o foco no core do domínio dentro do prazo.
- **Sem cancelamento de Ordem de Venda:** o enunciado define exatamente 5 estados sequenciais sem estado de cancelamento; manteve-se fiel à especificação em vez de adicionar um estado não pedido.
- **Agendamento como registro único por Ordem de Venda (não histórico):** cada reagendamento sobrescreve data/janela do registro atual (o histórico de mudanças fica preservado na trilha de auditoria, não em uma tabela de histórico de agendamentos dedicada). Trade-off: simplicidade de modelo vs. consulta direta ao histórico de reagendamentos sem cruzar com auditoria.
- **Mensagens de erro da API em inglês, traduzidas na camada de apresentação:** mantém o contrato da API consistente em inglês (reutilizável por qualquer cliente) enquanto garante que o usuário final do frontend nunca veja texto em inglês. A tradução cobre os cenários de negócio conhecidos (`translate-error.ts`); mensagens de validação genéricas não mapeadas caem no texto original em inglês como fallback.
- **Paginação híbrida (server-side para Ordens de Venda/Agendamento, client-side para os 3 cadastros de referência)** — ver justificativa completa em [Considerações sobre escalabilidade](#considerações-sobre-escalabilidade). Trade-off consciente entre simplicidade imediata e escalabilidade a longo prazo desses cadastros específicos.
- **Avanço automático de status ao confirmar agendamento:** reduz um clique manual e o risco de inconsistência (agendamento confirmado com OV ainda "Planejada"), mas remove um pouco do controle explícito passo-a-passo. Ambos os caminhos — automático e a transição manual via "Ciclo de vida" — continuam funcionando e gerando auditoria própria, então nenhuma governança foi perdida, apenas antecipada.
- **Modais de "cadastro rápido" (Cliente/Tipo de Transporte/Item) duplicam parcialmente os campos dos formulários das telas de cadastro completas**, em vez de compartilhar um único componente de formulário. Trade-off deliberado para entregar rápido dentro do prazo; a extração de um componente de formulário compartilhado (`<CustomerForm>`, etc.) é um refactor natural e de baixo risco caso o projeto continue evoluindo.
- **Sem seed de dados**: o banco sobe vazio tanto localmente quanto via Docker Compose. Optou-se por não incluir um script de seed para manter o escopo enxuto; toda a massa de dados para avaliação pode ser criada em minutos pela própria interface (inclusive via os atalhos de "cadastrar novo" durante a criação de uma Ordem de Venda) ou pelo Swagger.

## Diferenciais implementados

- OpenAPI/Swagger (`/docs`) com DTOs anotados.
- Testes além do mínimo solicitado (13 unitários + 1 integração, cobrindo os principais cenários de regra de negócio).
- Docker Compose completo (banco + backend + frontend), com `prisma migrate deploy` automático na subida do container.
- Tratamento de exceções centralizado com mapeamento de erros conhecidos do Prisma para respostas HTTP semânticas.
- **CRUD completo em todos os cadastros**, incluindo Itens (o enunciado pedia apenas criar/consultar) — editar e excluir também foram implementados, com confirmação antes de excluir e bloqueio quando o registro está em uso por uma Ordem de Venda.
- **Paginação em todas as telas de listagem** (server-side para Ordens de Venda/Agendamento, client-side para os cadastros de referência).
- **Filtros e busca em todas as telas de listagem** (por status, cliente, tipo de transporte, data, nome, documento ou SKU, conforme a tela).
- **Cadastro rápido inline**: é possível cadastrar um novo Cliente, Tipo de Transporte ou Item diretamente durante a criação de uma Ordem de Venda, sem perder o preenchimento em andamento — incluindo a autorização automática do novo tipo de transporte para o cliente selecionado, para que a OV possa ser criada imediatamente.
- **Avanço automático de status** da Ordem de Venda ao confirmar um agendamento.
- **Auditoria legível**: a trilha de auditoria é formatada em texto compreensível por tipo de evento (`lib/audit-format.ts`), não como JSON cru — inclusive resolvendo nomes de cliente/transporte em vez de exibir apenas IDs.
- **Design system próprio no frontend**: componentes de Select, Autocomplete, Date, Time e máscara de documento totalmente customizados (sem depender de widgets nativos do navegador ou bibliotecas de UI de terceiros), com um sistema de cores semânticas (`Chip`) de 6 tons fixos reaproveitado em toda a aplicação.
- **Indicador global de carregamento** reativo ao estado de rede do React Query, sem instrumentação manual por tela.
- Interface completa (não apenas os requisitos mínimos de tela): monitoramento operacional com filtros combinados, central de agendamento com ações inline, trilha de auditoria visível por Ordem de Venda.
- **Interface responsiva**, adaptada para uso em desktop, tablet e mobile (ver [Responsividade](#responsividade)).

## Responsividade

A interface foi adaptada para uso completo em desktop, tablet e mobile — não apenas testada em uma única resolução:

- **Navegação**: em telas menores que `md` (768px), a barra lateral vira um menu do tipo *drawer*, acionado por um cabeçalho compacto com botão de menu (ícone hambúrguer), em vez de ocupar espaço fixo da tela. Em `md` e acima, ela volta a ser fixa, exatamente como no desktop.
- **Tabelas**: todas as listagens (Clientes, Itens, Tipos de Transporte, Ordens de Venda, Central de Agendamento) têm scroll horizontal isolado ao próprio container em telas estreitas, em vez de forçar a página inteira a rolar na largura ou quebrar o layout — um padrão consolidado em produtos como GitHub, Linear e Notion para tabelas densas em mobile. Colunas de texto livre (nome, descrição) continuam quebrando linha normalmente para reduzir a necessidade de rolagem.
- **Formulários e modais**: grids que eram fixos em várias colunas (ex: o formulário de agendamento, a linha de item da Ordem de Venda) passaram a colapsar para uma única coluna em telas pequenas e se expandir a partir do breakpoint `sm`/`md`. O padding interno dos modais também se ajusta à largura disponível.
- **Verificação**: a adaptação foi validada visualmente com Playwright em viewport de 375×812 (iPhone-like) em todas as telas principais — incluindo a abertura do menu mobile, o formulário de nova Ordem de Venda, o painel de agendamento expandido e os modais de cadastro — confirmando ausência de overflow horizontal indesejado na página e comportamento consistente com a versão desktop.

## Uso de IA no desenvolvimento

Parte da construção deste projeto contou com o **Claude Code** (Anthropic) como par de desenvolvimento. Vale deixar explícito como essa ferramenta foi usada, porque o "como" importa mais que o "se":

- **O que foi meu**: todas as decisões de arquitetura e modelagem (separação de camadas, desenho da máquina de estados da Ordem de Venda, estratégia de auditoria, escolha entre paginação server-side vs. client-side, divisão de responsabilidades entre React Query/Redux Toolkit/Redux Saga, os componentes visuais e a identidade do design system) partiram de mim e foram revisadas e ajustadas por mim ao longo de várias iterações — inclusive corrigindo o próprio Claude Code quando o resultado não estava alinhado ao que eu queria (idioma incorreto em código, componentes nativos do navegador em vez de customizados, cores fora do padrão, bugs de layout, etc.).
- **O que a IA acelerou**: geração do boilerplate inicial dos módulos NestJS e das telas Next.js seguindo os padrões que eu defini, refatorações mecânicas, a formatação e redação deste README, e a configuração do Docker Compose (Dockerfiles multi-stage, variáveis de ambiente, healthchecks).
- **Por que uso assim**: no dia a dia como desenvolvedor sênior, uso ferramentas de IA da mesma forma que uso um bom editor, um linter ou um copiloto de código — para ganhar velocidade na execução, não para terceirizar as decisões técnicas. Acho importante ser transparente sobre isso em um desafio técnico, já que faz parte do meu fluxo de trabalho real e é uma competência que considero relevante para a vaga.
