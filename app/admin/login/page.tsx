"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    setUnauthorized(
      new URLSearchParams(window.location.search).get("error") ===
        "unauthorized",
    );
  }, []);

  async function signIn() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <main className="mx-auto flex max-w-sm flex-col items-center gap-4 px-6 py-24 text-center">
      <h1 className="text-xl font-semibold text-text">Acesso restrito</h1>
      {unauthorized && (
        <p className="text-sm text-error">
          Essa conta Google não tem acesso ao painel.
        </p>
      )}
      <button
        type="button"
        onClick={signIn}
        className="rounded-full bg-accent px-6 py-2.5 font-medium text-white transition-colors hover:bg-accent-hover"
      >
        Entrar com Google
      </button>
    </main>
  );
}
