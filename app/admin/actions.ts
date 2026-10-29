"use server";

import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { generateUniqueSlug } from "@/lib/slug";

export async function createClient(formData: FormData) {
  await requireAdmin();

  const companyName = String(formData.get("companyName") ?? "").trim();
  if (!companyName) return;

  const supabase = createAdminSupabaseClient();

  const { data: existing } = await supabase.from("clients").select("slug");
  const existingSlugs = (existing ?? []).map((row) => row.slug as string);
  const slug = generateUniqueSlug(companyName, existingSlugs);

  const { data: client, error } = await supabase
    .from("clients")
    .insert({ slug, company_name: companyName })
    .select("id")
    .single();

  if (error) throw error;

  const { error: responseError } = await supabase
    .from("responses")
    .insert({ client_id: client.id, answers: {} });

  if (responseError) throw responseError;

  revalidatePath("/admin");
}
