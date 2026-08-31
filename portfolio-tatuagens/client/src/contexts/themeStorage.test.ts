import { describe, expect, it } from "vitest";
import { nextTheme, persistTheme, readStoredTheme } from "./themeStorage";

describe("theme storage helpers", () => {
  it("reads only supported stored themes and falls back safely", () => {
    const values = new Map<string, string>([["theme", "dark"]]);
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };

    expect(readStoredTheme(storage)).toBe("dark");
    values.set("theme", "unexpected");
    expect(readStoredTheme(storage)).toBe("light");
  });

  it("toggles and persists the selected theme", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };

    expect(nextTheme("light")).toBe("dark");
    expect(nextTheme("dark")).toBe("light");
    persistTheme(storage, "dark");
    expect(values.get("theme")).toBe("dark");
  });
});
