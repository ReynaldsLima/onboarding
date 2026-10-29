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

1. **Empresa**: nome, segmento, site/Instagram, contato responsável
   (nome/e-mail/telefone), horário de atendimento humano.
2. **Persona do agente**: nome do agente, tom de voz, saudação exemplo,
   idiomas.
3. **Atendimento**: produtos/serviços principais, dúvidas frequentes, pode
   informar preço (sim/não), quando transferir para humano.
4. **Agendamento**: usa agendamento (sim/não), ferramenta usada, serviços
   agendáveis + duração, regras de horário/antecedência, confirmação
   automática.
5. **Qualificação de leads e Segmentação**: critérios gerais de
   qualificação, critérios de segmentação por porte/tamanho, por
   localização (regiões/bairros/condomínios atendidos, se aplicável), por
   tipo de cliente/projeto (ex: residencial x corporativo), o que fazer
   com lead qualificado vs não qualificado.
6. **Follow-up**: precisa de follow-up automático, regra de disparo (dias
   sem resposta), nº de tentativas, mensagem de reengajamento.
7. **Integrações e restrições**: CRM usado, número de WhatsApp (já tem
   Business API?), o que o agente nunca deve dizer, observações finais.
8. **Equipe e Roteamento**: lista de atendentes/vendedores padrão (nome +
   WhatsApp/usuário do CRM, campo repetível), atendente(s) especialista(s)
   para segmento diferenciado (se houver), regras de disponibilidade
   (horário de almoço, folgas, horário de cada um), regra de fallback
   (para quem o lead vai se o responsável não estiver disponível).

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
