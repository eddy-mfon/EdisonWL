import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { applySiteTheme, nextTheme, normalizeTheme, THEME_STORAGE_KEY, type SiteTheme } from "@/lib/siteTheme";

function getInitialTheme(): SiteTheme {
  if (typeof window === "undefined") return "light";
  return normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY)) ?? "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<SiteTheme>(getInitialTheme);
  const isDark = theme === "dark";

  useEffect(() => {
    applySiteTheme(theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      onClick={() => setTheme(nextTheme)}
    >
      <Sun size={16} aria-hidden="true" />
      <span className="theme-toggle-track" aria-hidden="true"><span /></span>
      <Moon size={16} aria-hidden="true" />
      <span className="sr-only">{isDark ? "Dark mode is active" : "Light mode is active"}</span>
    </button>
  );
}
