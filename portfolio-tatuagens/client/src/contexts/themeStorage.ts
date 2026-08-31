export type ThemeValue = "light" | "dark";

type ThemeStorage = Pick<Storage, "getItem" | "setItem">;

export function readStoredTheme(storage: ThemeStorage | undefined, defaultTheme: ThemeValue = "light"): ThemeValue {
  const stored = storage?.getItem("theme");
  return stored === "dark" || stored === "light" ? stored : defaultTheme;
}

export function nextTheme(theme: ThemeValue): ThemeValue {
  return theme === "light" ? "dark" : "light";
}

export function persistTheme(storage: ThemeStorage | undefined, theme: ThemeValue) {
  storage?.setItem("theme", theme);
}
