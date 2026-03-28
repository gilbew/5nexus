"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/ThemeProvider";

export function LoginForm() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const [pending, setPending] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  const signInWithGoogle = useCallback(async () => {
    setPending(true);
    setConfigError(null);
    try {
      const supabase = createClient();
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (oauthError) {
        setConfigError(oauthError.message);
        setPending(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      setConfigError(e instanceof Error ? e.message : "Sign-in failed");
      setPending(false);
    }
  }, []);

  const panel = isDark
    ? "border-zinc-700 bg-zinc-900 text-zinc-100"
    : "border-zinc-300 bg-white text-zinc-900";
  const muted = isDark ? "text-zinc-400" : "text-zinc-600";

  return (
    <div
      className={[
        "flex min-h-dvh flex-col items-center justify-center p-4",
        isDark ? "bg-zinc-950" : "bg-gradient-to-b from-zinc-100 to-slate-100",
      ].join(" ")}
    >
      <div className={`w-full max-w-sm rounded-2xl border p-5 shadow-lg ${panel}`}>
        <h1 className="text-lg font-semibold tracking-tight">5Nexus</h1>
        <p className={`mt-1 text-xs ${muted}`}>
          Links your Google account for upcoming cloud sync. The dashboard still works without
          signing in.
        </p>

        {(error || configError) && (
          <p
            className="mt-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-2 py-1.5 text-xs text-rose-600 dark:text-rose-300"
            role="alert"
          >
            {configError ?? decodeURIComponent(error ?? "")}
          </p>
        )}

        <button
          type="button"
          disabled={pending}
          onClick={() => void signInWithGoogle()}
          className={[
            "mt-4 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-opacity",
            pending ? "cursor-wait opacity-60" : "",
            isDark
              ? "border-zinc-600 bg-zinc-800 hover:bg-zinc-700/80"
              : "border-zinc-300 bg-zinc-50 hover:bg-zinc-100",
          ].join(" ")}
        >
          {pending ? "Redirecting…" : "Continue with Google"}
        </button>

        <Link
          href="/"
          className={`mt-4 block text-center text-xs font-medium underline-offset-2 hover:underline ${muted}`}
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
