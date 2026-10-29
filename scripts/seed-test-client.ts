import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const match = line.match(/^([A-Z_]+)=(.*)$/);
  if (match) process.env[match[1]] = match[2];
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function main() {
  const { data: client, error } = await supabase
    .from("clients")
    .upsert({ slug: "test-co", company_name: "Test Co" }, { onConflict: "slug" })
    .select("id")
    .single();

  if (error) throw error;

  await supabase
    .from("responses")
    .upsert({ client_id: client.id, answers: {} }, { onConflict: "client_id" });

  console.log("seeded test-co");
}

main();
