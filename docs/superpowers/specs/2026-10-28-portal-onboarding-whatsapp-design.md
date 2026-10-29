# Portal de Onboarding para Agentes de WhatsApp — Design

## Contexto e objetivo

A ABVCAP/Cowork desenvolve agentes de atendimento via WhatsApp (atendimento,
agendamento, follow-up e qualificação) para clientes externos. Hoje a coleta
de informações de cada cliente é manual/ad-hoc. Este projeto cria um portal
web onde:

- O time interno (Reinaldo) cria um link de onboarding exclusivo por cliente.
- O cliente final preenche um formulário estruturado com as informações
  necessárias para configurar o agente dele.
- O time interno acompanha, num painel protegido, o status de cada cliente
  e lê as respostas completas.

Referência de inspiração: formulário da Prestor (pic.prestor.com.br), porém
com bem menos campos — só o essencial para configurar um agente de WhatsApp.

## Fora de escopo

- Múltiplos usuários/contas de admin (só um e-mail autorizado por enquanto).
- Edição de respostas pelo admin (só leitura).
- Geração automática do agente a partir das respostas (fica para depois).
- Internacionalização (só português).

## Arquitetura

- **Next.js (App Router, TypeScript, Tailwind)**, hospedado na Vercel.
- **Supabase** como Postgres (dados) e como provedor de autenticação do
  admin (Supabase Auth + OAuth do Google). Reaproveita a mesma integração
  para banco de dados e login, evitando um segundo serviço só para auth.
- Provisionamento de Supabase e deploy na Vercel via MCP tools já
  conectadas nesta sessão (sem depender da Vercel CLI, que não está
  instalada).

## Autenticação do admin

- Login via "Entrar com Google" (Supabase Auth, provider Google).
- Após o callback, o servidor verifica se `user.email === "riguettilima.tech@gmail.com"`.
  Qualquer outro e-mail autenticado é deslogado e recebe "acesso negado".
- Rotas `/admin/**` protegidas por middleware que exige sessão válida +
  e-mail autorizado.
- Rota pública: `/onboarding/[slug]` (sem autenticação — é o link enviado
  ao cliente).

## Dados (Supabase Postgres)

```
clients
  id            uuid primary key default gen_random_uuid()
  slug          text unique not null
  company_name  text not null
  status        text not null default 'not_started'  -- not_started | in_progress | completed
  created_at    timestamptz not null default now()

responses
  client_id     uuid primary key references clients(id) on delete cascade
  answers       jsonb not null default '{}'::jsonb   -- chave = id do campo
  updated_at    timestamptz not null default now()
```

`answers` é JSONB (não uma coluna por campo) para permitir ajustar as
perguntas do formulário sem migração de schema a cada mudança.

## Fluxo

1. Admin loga em `/admin` com Google (e-mail autorizado).
2. Admin clica "Novo cliente", informa o nome da empresa → sistema gera
   `slug` (kebab-case + sufixo curto se houver colisão) e cria a linha em
   `clients` com status `not_started`.
3. Admin copia o link `/onboarding/[slug]` e envia ao cliente.
4. Cliente abre o link (sem login), preenche o formulário em 8 seções.
   Cada campo salva sozinho ao perder o foco (PATCH para uma API route que
   faz upsert em `responses.answers` e atualiza `status` para
   `in_progress` no primeiro salvamento e `completed` quando todos os
   campos obrigatórios estiverem preenchidos).
5. Cliente pode fechar e voltar depois — o formulário recarrega os valores
   salvos.
6. Admin acompanha em `/admin` a lista de clientes com status e abre cada
   um para ver as respostas completas em modo leitura.

## Formulário — 8 seções

Tipos de campo usados: `texto` (texto livre), `texto-repetivel` (lista
dinâmica de itens de texto, botão "adicionar outro"), `sim-não`,
`seleção-única` (botões/radio, com opção "Outro" que revela um campo de
texto), `múltipla-escolha` (checkboxes, com opção "Outro" que revela um
campo de texto), `dias-da-semana` (checkboxes Seg–Dom + horário).

1. **Empresa**
   - Nome da empresa — `texto`
   - Segmento — `seleção-única`: Varejo, Saúde, Imobiliário, Educação,
     Serviços profissionais, Alimentação, Beleza/Estética, Outro
   - Site/Instagram — `texto`
   - Contato responsável (nome, e-mail, telefone) — `texto`
   - Horário de atendimento humano — `dias-da-semana`
2. **Persona do agente**
   - Nome do agente — `texto`
   - Tom de voz — `seleção-única`: Formal, Informal e amigável, Técnico,
     Descontraído, Outro
   - Saudação exemplo — `texto`
   - Idiomas — `múltipla-escolha`: Português, Inglês, Espanhol, Outro
3. **Atendimento**
   - Produtos/serviços principais — `texto-repetível`
   - Dúvidas frequentes — `texto-repetível`
   - Pode informar preço — `sim-não`
   - Quando transferir para humano — `múltipla-escolha`: cliente pede,
     reclamação/insatisfação, pergunta fora do escopo, negociação de
     valor, Outro
4. **Agendamento**
   - Usa agendamento — `sim-não`
   - Ferramenta usada — `seleção-única`: Google Calendar, Calendly,
     Sistema próprio, Ainda não tem, Outro
   - Serviços agendáveis + duração — `texto-repetível`
   - Antecedência mínima — `seleção-única`: 30min, 1h, 2h, 1 dia, Outro
   - Confirmação automática — `sim-não`
5. **Qualificação de leads e Segmentação**
   - Critérios de qualificação — `múltipla-escolha`: orçamento/ticket
     mínimo, urgência/prazo, localização, tipo de produto/serviço,
     decisor presente, Outro
   - Critérios de segmentação por porte/tamanho — `texto` (muito
     específico por negócio, ex: m², faturamento, ticket médio)
   - Critérios de segmentação por localização — `texto` (ex: bairros,
     regiões, condomínios atendidos, se aplicável)
   - Critérios de segmentação por tipo de cliente/projeto — `texto` (ex:
     residencial x corporativo, pessoa física x empresa)
   - O que fazer com lead qualificado vs não qualificado — `texto`
6. **Follow-up**
   - Precisa de follow-up automático — `sim-não`
   - Disparar follow-up após — `seleção-única`: 1 dia, 2 dias, 3 dias,
     7 dias, Outro
   - Número de tentativas — `seleção-única`: 1, 2, 3, Outro
   - Mensagem de reengajamento — `texto`
7. **Integrações e restrições**
   - CRM usado — `seleção-única`: RD Station, HubSpot, Pipedrive,
     Planilha, Nenhum ainda, Outro
   - Já tem número de WhatsApp Business API ativo — `sim-não`
   - O que o agente nunca deve dizer — `texto`
   - Observações finais — `texto`
8. **Equipe e Roteamento**
   - Atendentes/vendedores padrão (nome + WhatsApp/usuário do CRM) —
     `texto-repetível`
   - Atendente(s) especialista(s) para segmento diferenciado, se houver —
     `texto-repetível`
   - Disponibilidade de cada atendente (dias/horário, almoço, folgas) —
     `dias-da-semana` por atendente
   - Regra de fallback (para quem o lead vai se o responsável não estiver
     disponível) — `texto`

A lista de opções de cada campo `seleção-única`/`múltipla-escolha` fica
numa constante no código (não no banco), para facilitar ajustes futuros
sem migração. A resposta salva em `answers` guarda o valor escolhido (ou
array, para múltipla escolha) e, quando "Outro" é selecionado, o texto
complementar digitado.

## Componentes

- `app/onboarding/[slug]/page.tsx` — formulário público, client component
  por seção com autosave (debounce on blur/change).
- `app/api/onboarding/[slug]/route.ts` — GET (carrega respostas) / PATCH
  (upsert de um campo ou seção).
- `app/admin/page.tsx` — lista de clientes + status + botão "novo
  cliente".
- `app/admin/[slug]/page.tsx` — visão somente leitura das respostas de um
  cliente.
- `app/admin/login/page.tsx` — botão "Entrar com Google".
- `middleware.ts` — protege `/admin/**`, valida sessão + e-mail
  autorizado.
- `lib/supabase/` — clients server/browser do Supabase.

## Testes

- Testar localmente (`npm run dev`) o fluxo completo pelo navegador:
  login do admin (e bloqueio de e-mail não autorizado), criação de
  cliente, preenchimento do formulário público com autosave (recarregar
  página e confirmar que os valores persistem), e leitura das respostas
  no painel admin.
- Sem testes automatizados nesta primeira versão (escopo pequeno, uso
  interno) — pode ser adicionado depois se o portal crescer.
