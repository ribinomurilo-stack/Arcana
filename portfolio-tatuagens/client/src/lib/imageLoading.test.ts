import { describe, expect, it } from "vitest";
import { getImageLoadingClass } from "./imageLoading";

describe("imageLoading", () => {
  it("mantém o skeleton visível no estado inicial", () => {
    expect(getImageLoadingClass(false)).toBe("image-loading-shell");
  });

  it("ativa a classe de imagem carregada após onLoad", () => {
    expect(getImageLoadingClass(true)).toBe("image-loading-shell is-loaded");
  });
});
