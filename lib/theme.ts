export type ThemeMode = "light" | "dark";

export const THEME_STORAGE_KEY = "damia-theme";

export function readStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    return v === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

/** Apply theme to the document. */
export function applyTheme(mode: ThemeMode, persist = true) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", mode);
  if (!persist) return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}

export function toggleTheme(current: ThemeMode): ThemeMode {
  const next: ThemeMode = current === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}
