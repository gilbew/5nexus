"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(() => supabase !== null);

  useEffect(() => {
    if (!supabase) {
      return;
    }
    let cancelled = false;
    let subscription: { unsubscribe: () => void } | null = null;
    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) {
        return;
      }
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setIsLoading(false);
    })();

    const sub = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setIsLoading(false);
    });
    subscription = sub.data.subscription;

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, [supabase]);

  const signOut = useCallback(async () => {
    if (!supabase) {
      return;
    }
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  }, [supabase]);

  const value = useMemo(
    () => ({
      user,
      session,
      isLoading,
      signOut,
    }),
    [user, session, isLoading, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return ctx;
}
