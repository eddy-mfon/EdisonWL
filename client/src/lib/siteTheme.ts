export type SiteTheme = "dark" | "light";

export const THEME_STORAGE_KEY = "edison-site-theme-v2";

export function normalizeTheme(value: string | null | undefined): SiteTheme | null {
  return value === "dark" || value === "light" ? value : null;
}

export function nextTheme(theme: SiteTheme): SiteTheme {
  return theme === "dark" ? "light" : "dark";
}

export function applySiteTheme(theme: SiteTheme) {
  document.documentElement.dataset.theme = theme;
}
