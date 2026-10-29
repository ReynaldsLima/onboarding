import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const ALLOWED_ADMIN_EMAIL = "riguettilima.tech@gmail.com";

export function isAllowedAdmin(email: string | undefined | null): boolean {
  return email === ALLOWED_ADMIN_EMAIL;
}

// Defense in depth: called from admin pages and the admin Server Action so
// they stay protected even if the middleware matcher ever regresses.
export async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAllowedAdmin(user?.email)) {
    redirect("/admin/login");
  }

  return user;
}
