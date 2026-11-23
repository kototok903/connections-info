import { useEffect } from "react";

import type { Theme } from "@/features/settings/settings-store";

// Browser UI (address bar) colors; keep in sync with index.html.
const THEME_COLORS = { light: "#efefe6", dark: "#1a1a1a" } as const;

const DARK_QUERY = "(prefers-color-scheme: dark)";

export type ResolvedTheme = "light" | "dark";

export function resolveTheme(
  theme: Theme,
  prefersDark: boolean
): ResolvedTheme {
  if (theme === "system") {
    return prefersDark ? "dark" : "light";
  }

  return theme;
}

export function applyTheme(resolved: ResolvedTheme): void {
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLORS[resolved]);
}

export function useApplyTheme(theme: Theme): void {
  useEffect(() => {
    const media = window.matchMedia?.(DARK_QUERY);
    const update = () =>
      applyTheme(resolveTheme(theme, media?.matches ?? false));

    update();

    if (theme !== "system" || !media) {
      return;
    }

    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [theme]);
}
