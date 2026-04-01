"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "dark" | "light";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (value: Theme) => void;
  toggleTheme: () => void;
};

const STORAGE_KEY = "nexus-theme";

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "dark";
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === "dark" || raw === "light") {
    return raw;
  }
  const preferredDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return preferredDark ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(resolveInitialTheme);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: (next) => setThemeState(next),
      toggleTheme: () => setThemeState((prev) => (prev === "dark" ? "light" : "dark")),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider.");
  }
  return context;
}
