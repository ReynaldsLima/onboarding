import Link from "next/link";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { createClient } from "./actions";

const STATUS_LABELS: Record<string, string> = {
  not_started: "Não iniciado",
  in_progress: "Em andamento",
  completed: "Concluído",
};

const STATUS_CLASSES: Record<string, string> = {
  not_started: "bg-muted/20 text-muted",
  in_progress: "bg-accent/15 text-accent",
  completed: "bg-success/15 text-success",
};

export default async function AdminPage() {
  await requireAdmin();

  const supabase = createAdminSupabaseClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("slug, company_name, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-16">
      <header>
        <h1 className="text-2xl font-semibold text-text">Painel</h1>
        <p className="mt-1 text-muted">Clientes e status do onboarding.</p>
      </header>

      <form action={createClient} className="flex gap-2">
        <input
          type="text"
          name="companyName"
          placeholder="Nome da empresa"
          required
          className="w-full rounded-lg border border-muted/40 bg-surface px-4 py-2.5 text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-accent px-5 py-2.5 font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Novo cliente
        </button>
      </form>

      <div className="flex flex-col divide-y divide-muted/20 rounded-xl bg-surface shadow-sm">
        {(clients ?? []).map((client) => (
          <div
            key={client.slug}
            className="flex items-center justify-between gap-4 px-5 py-4"
          >
            <div>
              <Link
                href={`/admin/${client.slug}`}
                className="font-medium text-text hover:text-accent"
              >
                {client.company_name}
              </Link>
              <p className="text-sm text-muted">/onboarding/{client.slug}</p>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_CLASSES[client.status]}`}
              >
                {STATUS_LABELS[client.status] ?? client.status}
              </span>
              <CopyLinkButton path={`/onboarding/${client.slug}`} />
            </div>
          </div>
        ))}
        {(clients ?? []).length === 0 && (
          <p className="px-5 py-8 text-center text-muted">
            Nenhum cliente ainda.
          </p>
        )}
      </div>
    </main>
  );
}
