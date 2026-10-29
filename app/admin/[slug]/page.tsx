import { notFound } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { FORM_SECTIONS } from "@/lib/form-config";
import { AnswerValue } from "@/components/AnswerValue";

export default async function AdminClientPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireAdmin();

  const { slug } = await params;
  const supabase = createAdminSupabaseClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, company_name")
    .eq("slug", slug)
    .maybeSingle();

  if (!client) {
    notFound();
  }

  const { data: response } = await supabase
    .from("responses")
    .select("answers")
    .eq("client_id", client.id)
    .maybeSingle();

  const answers = (response?.answers as Record<string, unknown>) ?? {};

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-10 px-6 py-16">
      <header>
        <p className="text-sm font-medium text-accent">Respostas</p>
        <h1 className="text-2xl font-semibold text-text">
          {client.company_name}
        </h1>
      </header>

      {FORM_SECTIONS.map((section) => (
        <section key={section.id} className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-text">{section.title}</h2>
          {section.fields.map((field) => (
            <div key={field.id} className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted">
                {field.label}
              </span>
              <div className="text-text">
                <AnswerValue field={field} value={answers[field.id]} />
              </div>
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}
