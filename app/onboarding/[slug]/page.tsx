import { notFound } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { FORM_SECTIONS } from "@/lib/form-config";
import { OnboardingForm } from "./form";

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
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

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-10 px-6 py-16">
      <header>
        <p className="text-sm font-medium text-accent">Onboarding</p>
        <h1 className="text-2xl font-semibold text-text">
          {client.company_name}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Suas respostas são salvas automaticamente.
        </p>
      </header>
      <OnboardingForm
        slug={slug}
        sections={FORM_SECTIONS}
        initialAnswers={(response?.answers as Record<string, unknown>) ?? {}}
      />
    </main>
  );
}
