import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { computeStatus } from "@/lib/status";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const supabase = createAdminSupabaseClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, company_name, status")
    .eq("slug", slug)
    .maybeSingle();

  if (!client) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { data: response } = await supabase
    .from("responses")
    .select("answers")
    .eq("client_id", client.id)
    .maybeSingle();

  return NextResponse.json({
    companyName: client.company_name,
    status: client.status,
    answers: response?.answers ?? {},
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { fieldId, value } = (await request.json()) as {
    fieldId: string;
    value: unknown;
  };

  const supabase = createAdminSupabaseClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (!client) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { data: response } = await supabase
    .from("responses")
    .select("answers")
    .eq("client_id", client.id)
    .maybeSingle();

  const answers = { ...(response?.answers ?? {}), [fieldId]: value };
  const status = computeStatus(answers);

  await supabase
    .from("responses")
    .update({ answers, updated_at: new Date().toISOString() })
    .eq("client_id", client.id);

  await supabase.from("clients").update({ status }).eq("id", client.id);

  return NextResponse.json({ status });
}
