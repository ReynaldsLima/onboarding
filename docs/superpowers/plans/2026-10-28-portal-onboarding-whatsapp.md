# Portal de Onboarding para Agentes de WhatsApp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js + Supabase portal where an internal admin (single
authorized Google account) creates a per-client onboarding link, the client
fills a structured 8-section form with autosave, and the admin reviews
answers in a read-only dashboard.

**Architecture:** Next.js App Router (TypeScript, Tailwind) on Vercel.
Supabase Postgres stores `clients` + `responses` (answers as JSONB keyed by
field id). Supabase Auth (Google provider) gates `/admin/**` via middleware
that also checks the authenticated email against a single allow-listed
address. The public form at `/onboarding/[slug]` has no auth and autosaves
each field via a PATCH API route.

**Tech Stack:** Next.js (App Router, TypeScript), Tailwind CSS, Supabase
(`@supabase/supabase-js`, `@supabase/ssr`), Vercel (deploy via MCP tools).

**Spec:** `docs/superpowers/specs/2026-10-28-portal-onboarding-whatsapp-design.md`

## Global Constraints

- Admin auth allow-list: only `riguettilima.tech@gmail.com` may access
  `/admin/**`; any other authenticated Google account is signed out and
  shown "acesso negado".
- No automated test suite for this version (spec: "Sem testes
  automatizados nesta primeira versão") — every task's verification step
  is a manual/CLI check, not a unit test runner.
- Font stack: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro
  Text", "Helvetica Neue", Arial, sans-serif`.
- Color tokens (exact hex from spec): `--color-bg: #F5F5F7`,
  `--color-surface: #FFFFFF`, `--color-text: #1D1D1F`,
  `--color-muted: #AAAAAA`, `--color-accent: #007AFF`,
  `--color-accent-hover: #0066CC`, `--color-success: #34C759`,
  `--color-error: #FF3B30`.
- `answers` is stored as a single JSONB column (no per-field migration) —
  see Task 2 for the exact field config and Task 5 for the answer shapes.
- Provisioning (Supabase project, Vercel project/env vars) happens via the
  already-connected MCP tools, not the Vercel CLI (not installed).

## Review Focus

- **Client opens an onboarding link for a `slug` that doesn't exist** —
  the public page should show a clear "link inválido" message, not a
  crash or a blank form. Covered in Task 6.
- **Two clients created with the same company name** — slug generation
  must not silently collide and overwrite another client's data. Covered
  in Task 8 (uniqueness-suffix test).
- **A non-authorized Google account logs in** — must be rejected and
  signed out server-side, not just hidden in the UI (someone could hit
  `/admin` directly after a client-side-only check). Covered in Task 7.
- **Client reloads the form mid-fill** — previously saved answers (across
  all field types, including `other` free text and weekday-schedule) must
  reload correctly, not reset. Covered in Task 6.
- **"Outro" selected on a single/multi-select without typing the free
  text** — saving must not crash the PATCH route or produce a malformed
  `answers` object; an empty `other` string is acceptable, a missing key
  is not. Covered in Task 5.

---

### Task 1: Scaffold Next.js project with design tokens

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts` (via
  `create-next-app`)
- Create: `app/globals.css` — CSS variables for the palette + font stack
- Modify: `tailwind.config.ts` — map palette variables to Tailwind theme
  colors (`bg`, `surface`, `text`, `muted`, `accent`, `accent-hover`,
  `success`, `error`)
- Create: `app/layout.tsx` — root layout applying `bg`/`text` colors and
  the font stack to `<body>`

**Interfaces:**
- Produces: Tailwind color classes `bg-bg`, `bg-surface`, `text-text`,
  `text-muted`, `bg-accent`, `hover:bg-accent-hover`, `text-success`,
  `text-error`, available to every later UI task.

- [ ] **Step 1: Scaffold the app**

Run: `npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --eslint --use-npm --yes`

- [ ] **Step 2: Define CSS variables in `app/globals.css`**

```css
:root {
  --color-bg: #F5F5F7;
  --color-surface: #FFFFFF;
  --color-text: #1D1D1F;
  --color-muted: #AAAAAA;
  --color-accent: #007AFF;
  --color-accent-hover: #0066CC;
  --color-success: #34C759;
  --color-error: #FF3B30;
  --font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
}
```

- [ ] **Step 3: Wire the variables into `tailwind.config.ts`** under
  `theme.extend.colors` (`bg`, `surface`, `text`, `muted`, `accent`,
  `"accent-hover"`, `success`, `error`) and `theme.extend.fontFamily.sans`
  pointing at `var(--font-sans)`.

- [ ] **Step 4: Apply tokens in `app/layout.tsx`** — `<body className="bg-bg text-text font-sans">`.

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with Apple-style design tokens"
```

---

### Task 2: Form field configuration module

**Files:**
- Create: `lib/form-config.ts`
- Test: none (pure data reviewed by inspection; consumed by Tasks 5, 6, 9)

**Interfaces:**
- Produces:
  - `type FieldType = 'text' | 'text-repeatable' | 'yes-no' | 'single-select' | 'multi-select' | 'weekday-schedule'`
  - `interface FieldOption { value: string; label: string }`
  - `interface FormField { id: string; label: string; type: FieldType; required?: boolean; options?: FieldOption[] }`
  - `interface FormSection { id: string; title: string; fields: FormField[] }`
  - `const FORM_SECTIONS: FormSection[]`
  - `const REQUIRED_FIELD_IDS: string[]` (flattened list of every field id
    with `required: true`, derived from `FORM_SECTIONS`)

- [ ] **Step 1: Write `lib/form-config.ts`** with the types above and
  `FORM_SECTIONS` containing exactly these 8 sections/fields (every
  `single-select`/`multi-select` field's `options` array ends with
  `{ value: 'other', label: 'Outro' }`, omitted below for brevity but
  required in the file):

  1. `empresa` — "Empresa": `company_name` (text, required),
     `segment` (single-select, required; options: retail "Varejo",
     health "Saúde", real_estate "Imobiliário", education "Educação",
     professional_services "Serviços profissionais", food "Alimentação",
     beauty "Beleza/Estética"), `website` (text), `contact` (text,
     required, label "Contato responsável (nome, e-mail, telefone)"),
     `business_hours` (weekday-schedule, label "Horário de atendimento
     humano").
  2. `persona` — "Persona do agente": `agent_name` (text), `tone`
     (single-select; options: formal "Formal", friendly_informal
     "Informal e amigável", technical "Técnico", casual "Descontraído"),
     `greeting_example` (text), `languages` (multi-select; options: pt
     "Português", en "Inglês", es "Espanhol").
  3. `atendimento` — "Atendimento": `products_services`
     (text-repeatable), `faqs` (text-repeatable, label "Dúvidas
     frequentes"), `can_quote_price` (yes-no, required, label "Pode
     informar preço"), `human_handoff_triggers` (multi-select, label
     "Quando transferir para humano"; options: customer_request "Cliente
     pede", complaint "Reclamação/insatisfação", out_of_scope "Pergunta
     fora do escopo", price_negotiation "Negociação de valor").
  4. `agendamento` — "Agendamento": `uses_scheduling` (yes-no, required,
     label "Usa agendamento"), `scheduling_tool` (single-select; options:
     google_calendar "Google Calendar", calendly "Calendly",
     custom_system "Sistema próprio", none_yet "Ainda não tem"),
     `schedulable_services` (text-repeatable, label "Serviços agendáveis
     + duração"), `min_notice` (single-select, label "Antecedência
     mínima"; options: "30min", "1h", "2h", "1day" label "1 dia"),
     `auto_confirmation` (yes-no, label "Confirmação automática").
  5. `qualificacao` — "Qualificação de leads e Segmentação":
     `qualification_criteria` (multi-select; options: min_budget
     "Orçamento/ticket mínimo", urgency "Urgência/prazo", location
     "Localização", product_type "Tipo de produto/serviço",
     decision_maker "Decisor presente"), `size_segmentation` (text, label
     "Critérios de segmentação por porte/tamanho"), `location_segmentation`
     (text, label "Critérios de segmentação por localização"),
     `client_type_segmentation` (text, label "Critérios de segmentação
     por tipo de cliente/projeto"), `qualified_action` (text, label "O
     que fazer com lead qualificado vs não qualificado").
  6. `followup` — "Follow-up": `needs_followup` (yes-no, required),
     `followup_delay` (single-select, label "Disparar follow-up após";
     options: "1day" "1 dia", "2days" "2 dias", "3days" "3 dias", "7days"
     "7 dias"), `followup_attempts` (single-select, label "Número de
     tentativas"; options: "1", "2", "3"), `reengagement_message` (text).
  7. `integracoes` — "Integrações e restrições": `crm` (single-select;
     options: rd_station "RD Station", hubspot "HubSpot", pipedrive
     "Pipedrive", spreadsheet "Planilha", none_yet "Nenhum ainda"),
     `has_whatsapp_business_api` (yes-no, required, label "Já tem número
     de WhatsApp Business API ativo"), `never_say` (text, label "O que o
     agente nunca deve dizer"), `final_notes` (text, label "Observações
     finais").
  8. `equipe` — "Equipe e Roteamento": `default_attendants`
     (text-repeatable, required, label "Atendentes/vendedores padrão
     (nome + WhatsApp/usuário do CRM)"), `specialist_attendants`
     (text-repeatable, label "Atendente(s) especialista(s) para segmento
     diferenciado"), `attendant_availability` (text-repeatable, label
     "Disponibilidade de cada atendente (dias/horário, almoço, folgas)"),
     `fallback_rule` (text, label "Regra de fallback").

- [ ] **Step 2: Derive and export `REQUIRED_FIELD_IDS`** by flat-mapping
  `FORM_SECTIONS` and filtering `field.required`.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: no type errors.

- [ ] **Step 4: Commit**

```bash
git add lib/form-config.ts
git commit -m "feat: add form field configuration (8 sections)"
```

---

### Task 3: Provision Supabase project and schema

**Files:**
- Create: `.env.local` (populated with Supabase URL/keys — not committed)
- Create: `.gitignore` entry for `.env.local` (already default in
  create-next-app; verify present)
- Create: `supabase/schema.sql` (checked in, for reference/reproducibility)

**Interfaces:**
- Produces: a live Supabase project with `clients` and `responses` tables
  and Row Level Security policies; `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` available
  in `.env.local` for Task 4.

- [ ] **Step 1: List organizations** via the Supabase MCP
  (`list_organizations`) and ask the user which org to create the
  project under if more than one exists.

- [ ] **Step 2: Create the project** via `create_project` (name:
  `cowork-onboarding`, pick the org from Step 1, cheapest/default
  region and plan).

- [ ] **Step 3: Write `supabase/schema.sql`**

```sql
create table clients (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  company_name text not null,
  status text not null default 'not_started',
  created_at timestamptz not null default now()
);

create table responses (
  client_id uuid primary key references clients(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table clients enable row level security;
alter table responses enable row level security;
-- No public policies: all access goes through server-side code using the
-- service role key (API routes / server components), never the browser
-- anon key directly against these tables.
```

- [ ] **Step 4: Apply the migration** via `apply_migration` with the SQL
  from Step 3.

- [ ] **Step 5: Fetch keys** via `get_project_url` and
  `get_publishable_keys`; also retrieve the service role key from the
  project's API settings. Write all three into `.env.local`:
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`.

- [ ] **Step 6: Verify** via `list_tables` — confirm `clients` and
  `responses` both appear.

- [ ] **Step 7: Commit** (schema file only; `.env.local` stays untracked)

```bash
git add supabase/schema.sql
git commit -m "feat: add Supabase schema for clients and responses"
```

---

### Task 4: Supabase client helpers

**Files:**
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/browser.ts`
- Create: `lib/supabase/admin.ts` (service-role client, server-only)

**Interfaces:**
- Consumes: env vars from Task 3 (`.env.local`)
- Produces:
  - `createServerSupabaseClient(): Promise<SupabaseClient>` in
    `lib/supabase/server.ts` (cookie-based, for use in Server
    Components/Route Handlers, per `@supabase/ssr`'s Next.js App Router
    pattern)
  - `createBrowserSupabaseClient(): SupabaseClient` in
    `lib/supabase/browser.ts` (for the login button's client component)
  - `createAdminSupabaseClient(): SupabaseClient` in
    `lib/supabase/admin.ts` (service role key, bypasses RLS, used only in
    Route Handlers/Server Actions — never imported into client code)

- [ ] **Step 1: Install dependencies**

Run: `npm install @supabase/supabase-js @supabase/ssr`

- [ ] **Step 2: Implement the three client factory functions** above
  using the standard `@supabase/ssr` `createServerClient`/
  `createBrowserClient` setup, and `createClient` from
  `@supabase/supabase-js` with the service role key for
  `createAdminSupabaseClient`.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: no type errors.

- [ ] **Step 4: Commit**

```bash
git add lib/supabase
git commit -m "feat: add Supabase client helpers"
```

---

### Task 5: Public onboarding API route

**Files:**
- Create: `app/api/onboarding/[slug]/route.ts`
- Create: `lib/status.ts`

**Interfaces:**
- Consumes: `createAdminSupabaseClient()` (Task 4), `REQUIRED_FIELD_IDS`
  (Task 2)
- Produces:
  - `computeStatus(answers: Record<string, unknown>): 'not_started' | 'in_progress' | 'completed'`
    in `lib/status.ts` — `not_started` if `answers` is empty,
    `completed` if every id in `REQUIRED_FIELD_IDS` has a non-empty
    value in `answers`, else `in_progress`.
  - `GET` handler returning `{ companyName, status, answers }` for a
    given `slug`, 404 JSON `{ error: 'not_found' }` if no matching
    client.
  - `PATCH` handler accepting `{ fieldId: string, value: unknown }`,
    merging into `responses.answers` for that client, recomputing and
    persisting `clients.status` via `computeStatus`, returning
    `{ status }`. 404 JSON `{ error: 'not_found' }` if slug doesn't
    exist.

- [ ] **Step 1: Write `lib/status.ts`** implementing `computeStatus` as
  specified above ("non-empty" means: not `undefined`, not `null`, not
  `''`, and not an empty array).

- [ ] **Step 2: Write a throwaway verification script**
  `scripts/verify-status.ts` that asserts: empty answers → `not_started`;
  all `REQUIRED_FIELD_IDS` filled → `completed`; some but not all filled
  → `in_progress`. Run with `npx tsx scripts/verify-status.ts` and print
  `OK` on success, throw on mismatch.

- [ ] **Step 3: Run the verification script**

Run: `npx tsx scripts/verify-status.ts`
Expected: prints `OK`, exit code 0.

- [ ] **Step 4: Implement `app/api/onboarding/[slug]/route.ts`** with
  `GET` and `PATCH` as specified. On `PATCH`, store `{ [fieldId]: value }`
  merged into the existing `answers` JSONB (read-modify-write); when
  `value` is an object shaped like `{ value, other }` (the "Outro" case
  from Task 6), store it as-is — no special-casing needed since
  `answers` is schemaless JSONB.

- [ ] **Step 5: Manual verification** — with the dev server running
  (`npm run dev`) and one client row inserted manually via the Supabase
  MCP (`execute_sql`) for a test slug `test-co`:

Run: `curl -X PATCH http://localhost:3000/api/onboarding/test-co -H "Content-Type: application/json" -d "{\"fieldId\":\"company_name\",\"value\":\"Test Co\"}"`
Expected: `{"status":"in_progress"}`

Run: `curl http://localhost:3000/api/onboarding/test-co`
Expected: JSON body includes `"answers":{"company_name":"Test Co"}`

Run: `curl http://localhost:3000/api/onboarding/does-not-exist`
Expected: 404 status, `{"error":"not_found"}`

Run: `curl -X PATCH http://localhost:3000/api/onboarding/test-co -H "Content-Type: application/json" -d "{\"fieldId\":\"segment\",\"value\":{\"value\":\"other\"}}"`
Expected: `{"status":"in_progress"}` (no crash when "Outro" is chosen without a free-text value)

- [ ] **Step 6: Delete the throwaway script**

```bash
rm scripts/verify-status.ts
```

- [ ] **Step 7: Commit**

```bash
git add app/api/onboarding lib/status.ts
git commit -m "feat: add public onboarding API route with status computation"
```

---

### Task 6: Public onboarding form page

**Files:**
- Create: `app/onboarding/[slug]/page.tsx` (server component: fetches
  initial data, 404s via `notFound()` if `GET` returns `not_found`)
- Create: `app/onboarding/[slug]/form.tsx` (client component: renders
  sections/fields, autosaves)
- Create: `components/fields/TextField.tsx`,
  `components/fields/TextRepeatableField.tsx`,
  `components/fields/YesNoField.tsx`,
  `components/fields/SingleSelectField.tsx`,
  `components/fields/MultiSelectField.tsx`,
  `components/fields/WeekdayScheduleField.tsx`

**Interfaces:**
- Consumes: `FORM_SECTIONS` (Task 2), the `GET`/`PATCH` route (Task 5)
- Produces: each field component takes
  `{ field: FormField; value: unknown; onChange: (value: unknown) => void }`
  and is otherwise self-contained; `form.tsx` owns the per-field debounce
  and PATCH call.

- [ ] **Step 1: Implement the six field components** per the shared
  props above:
  - `TextField`: single `<input>` or `<textarea>`.
  - `TextRepeatableField`: list of text inputs + "Adicionar outro"
    button + remove button per row; `value: string[]`.
  - `YesNoField`: two toggle buttons ("Sim"/"Não"); `value: boolean | null`.
  - `SingleSelectField`: radio/button group from `field.options`; when
    `value.value === 'other'`, render a text input bound to
    `value.other`; `value: { value: string; other?: string } | null`.
  - `MultiSelectField`: checkbox group from `field.options`; same
    `other` text-input behavior as `SingleSelectField`; `value: { value: string[]; other?: string }`.
  - `WeekdayScheduleField`: 7 day-toggle chips (Seg–Dom) + two time
    `<input type="time">` (início/fim); `value: { days: string[]; start: string | null; end: string | null }`.

- [ ] **Step 2: Implement `app/onboarding/[slug]/page.tsx`** — `fetch`
  the `GET` route (or call the DB helper directly server-side), call
  Next's `notFound()` on `not_found`, otherwise render a page header
  (company name) and `<OnboardingForm slug={slug} sections={FORM_SECTIONS} initialAnswers={answers} initialStatus={status} />`.

- [ ] **Step 3: Implement `app/onboarding/[slug]/form.tsx`** —
  one `answers` state object keyed by field id; on any field's
  `onChange`, update local state immediately and PATCH the single
  changed field (debounced ~500ms) to `/api/onboarding/[slug]`; show a
  small "Salvo" / "Salvando..." indicator (success-colored) near the
  last-edited field. Render sections in order with section titles as
  `<h2>`.

- [ ] **Step 4: Manual verification** — with `npm run dev` running and
  the `test-co` client from Task 5:
  1. Open `http://localhost:3000/onboarding/test-co`.
  2. Fill a `text` field, a `yes-no` field, a `single-select` field
     choosing "Outro" with custom text, and the `weekday-schedule`
     field.
  3. Reload the page — confirm all four values reappear exactly as
     entered.
  4. Open `http://localhost:3000/onboarding/does-not-exist` — confirm a
     "link inválido" message renders (not a crash/blank page).

- [ ] **Step 5: Commit**

```bash
git add app/onboarding components/fields
git commit -m "feat: add public onboarding form with autosave"
```

---

### Task 7: Google OAuth admin authentication

**Files:**
- Create: `app/admin/login/page.tsx`
- Create: `app/auth/callback/route.ts`
- Create: `middleware.ts`
- Create: `lib/auth.ts`

**Interfaces:**
- Consumes: `createServerSupabaseClient` / `createBrowserSupabaseClient`
  (Task 4)
- Produces: `const ALLOWED_ADMIN_EMAIL = 'riguettilima.tech@gmail.com'`
  exported from `lib/auth.ts`; middleware redirects unauthenticated or
  non-allow-listed requests to `/admin/login`.

- [ ] **Step 1: Manual external setup (user action required)** — the
  user creates an OAuth client in Google Cloud Console (type: Web
  application; authorized redirect URI:
  `https://<project-ref>.supabase.co/auth/v1/callback`) and enters the
  resulting Client ID/Secret into the Supabase Dashboard under
  Authentication → Providers → Google. Also set the Supabase Auth
  "Site URL" / additional redirect URL to
  `http://localhost:3000/auth/callback` (and the production URL once
  Task 10 deploys). **Stop and wait for the user to confirm this is
  done before continuing — it cannot be done via the MCP tools
  available in this session.**

- [ ] **Step 2: Write `lib/auth.ts`** exporting `ALLOWED_ADMIN_EMAIL` and
  `isAllowedAdmin(email: string | undefined | null): boolean`.

- [ ] **Step 3: Implement `app/admin/login/page.tsx`** — a client
  component with a single "Entrar com Google" button that calls
  `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${origin}/auth/callback` } })`.

- [ ] **Step 4: Implement `app/auth/callback/route.ts`** — exchanges the
  OAuth `code` for a session (`supabase.auth.exchangeCodeForSession`),
  then checks `isAllowedAdmin(session.user.email)`; if false, calls
  `supabase.auth.signOut()` and redirects to
  `/admin/login?error=unauthorized`; if true, redirects to `/admin`.

- [ ] **Step 5: Implement `middleware.ts`** — matcher `/admin/:path*`
  (excluding `/admin/login`); reads the Supabase session from cookies,
  redirects to `/admin/login` if no session or
  `!isAllowedAdmin(session.user.email)`.

- [ ] **Step 6: Manual verification**
  1. Visit `http://localhost:3000/admin` while logged out — confirm
     redirect to `/admin/login`.
  2. Click "Entrar com Google" and sign in with
     `riguettilima.tech@gmail.com` — confirm redirect to `/admin` and
     that the page loads (even if `/admin` is still a stub at this
     point).
  3. Sign out, sign in with a different Google account — confirm
     redirect back to `/admin/login?error=unauthorized` and that
     `/admin` is still inaccessible.

- [ ] **Step 7: Commit**

```bash
git add app/admin/login app/auth middleware.ts lib/auth.ts
git commit -m "feat: add Google OAuth admin auth restricted to one email"
```

---

### Task 8: Admin dashboard — client list and creation

**Files:**
- Create: `app/admin/page.tsx`
- Create: `app/admin/actions.ts` (Server Actions)
- Create: `lib/slug.ts`

**Interfaces:**
- Consumes: `createAdminSupabaseClient` (Task 4). Access control for
  this whole route tree is already enforced by Task 7's middleware; this
  task does not call any auth function itself.
- Produces: `slugify(name: string): string` and
  `generateUniqueSlug(name: string, existingSlugs: string[]): string`
  in `lib/slug.ts` (appends `-2`, `-3`, ... on collision);
  `createClient(formData: FormData): Promise<void>` Server Action in
  `app/admin/actions.ts` that inserts into `clients` (status
  `not_started`) and an empty-`answers` row into `responses`.

- [ ] **Step 1: Write `lib/slug.ts`**: `slugify` lowercases, strips
  accents, replaces non-alphanumeric runs with single hyphens, trims
  leading/trailing hyphens; `generateUniqueSlug` returns `slugify(name)`
  unless it's in `existingSlugs`, in which case it tries `${base}-2`,
  `${base}-3`, ... until free.

- [ ] **Step 2: Write a throwaway verification script**
  `scripts/verify-slug.ts` asserting: `slugify('Café Ação 123!')` has no
  accents/special chars; `generateUniqueSlug('Acme', ['acme'])` returns
  `'acme-2'`; `generateUniqueSlug('Acme', ['acme', 'acme-2'])` returns
  `'acme-3'`. Prints `OK` or throws.

- [ ] **Step 3: Run it**

Run: `npx tsx scripts/verify-slug.ts`
Expected: prints `OK`

- [ ] **Step 4: Implement `createClient` Server Action** in
  `app/admin/actions.ts`: reads `companyName` from `FormData`, fetches
  existing slugs via the admin Supabase client, calls
  `generateUniqueSlug`, inserts the `clients` row and the matching empty
  `responses` row, then `revalidatePath('/admin')`.

- [ ] **Step 5: Implement `app/admin/page.tsx`** — server component:
  fetches all `clients` ordered by `created_at desc`, renders a table
  (company name, status badge using `success`/`muted`/`accent` colors,
  the full onboarding link `/onboarding/[slug]` with a copy-link button,
  a link to `/admin/[slug]`), plus a form (company name input + submit)
  bound to the `createClient` Server Action.

- [ ] **Step 6: Delete the throwaway script**

```bash
rm scripts/verify-slug.ts
```

- [ ] **Step 7: Manual verification** — as the authorized admin, create
  two clients named "Acme" and "Acme" again; confirm the dashboard lists
  both with distinct links (`/onboarding/acme` and `/onboarding/acme-2`)
  and status `not_started`.

- [ ] **Step 8: Commit**

```bash
git add app/admin/page.tsx app/admin/actions.ts lib/slug.ts
git commit -m "feat: add admin dashboard with client creation and unique slugs"
```

---

### Task 9: Admin client detail (read-only)

**Files:**
- Create: `app/admin/[slug]/page.tsx`
- Create: `components/AnswerValue.tsx`

**Interfaces:**
- Consumes: `FORM_SECTIONS` (Task 2), `createAdminSupabaseClient`
  (Task 4)
- Produces: `AnswerValue({ field, value }: { field: FormField; value: unknown })`
  — renders any stored answer shape (plain text, string array, boolean,
  select-with-other object, weekday-schedule object) as readable text/
  badges; used only in this read-only view.

- [ ] **Step 1: Implement `AnswerValue`** handling every shape produced
  by Task 6's field components, falling back to "Não respondido" (muted
  color) when the value is empty/undefined.

- [ ] **Step 2: Implement `app/admin/[slug]/page.tsx`** — fetches the
  client + its `responses.answers`, calls `notFound()` if the slug
  doesn't exist, then renders each of `FORM_SECTIONS` as a titled block
  listing every field's label and `<AnswerValue>`.

- [ ] **Step 3: Manual verification** — open `/admin/test-co` (from
  Task 5/6's manual testing) and confirm the fields filled during Task
  6's manual verification display with their human-readable labels and
  values, and unfilled fields show "Não respondido".

- [ ] **Step 4: Commit**

```bash
git add app/admin/[slug] components/AnswerValue.tsx
git commit -m "feat: add read-only admin client detail view"
```

---

### Task 10: Deploy to Vercel

**Files:** none (infra-only task)

**Interfaces:**
- Consumes: the full app from Tasks 1–9, Supabase env vars from Task 3

- [ ] **Step 1: Confirm with the user** before any production deploy or
  shared-infra change: which Vercel team/account to deploy under, and
  that they're ready to go live.

- [ ] **Step 2: Create the Vercel project** via the Vercel MCP tools
  (`create_project`, or `create_git_project` if the user wants GitHub
  auto-deploys — ask which).

- [ ] **Step 3: Set environment variables** via `create_project_env` for
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY` (Production + Preview).

- [ ] **Step 4: Deploy** via `create_deployment`.

- [ ] **Step 5: Update Supabase Auth redirect URLs** — remind the user
  to add the production `https://<domain>/auth/callback` URL in the
  Supabase Dashboard's Auth settings (same place as Task 7 Step 1),
  since this can't be done via the MCP tools in this session.

- [ ] **Step 6: Manual verification** — repeat Task 7 Step 6's login
  flow and Task 6 Step 4's form flow against the production URL.

- [ ] **Step 7: Commit** (only if any config file changed, e.g.
  `vercel.json`/`vercel.ts`; otherwise skip — this task is
  infra-provisioning, not code)
