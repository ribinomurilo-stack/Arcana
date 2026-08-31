import { describe, expect, it } from "vitest";
import { getCatalogParallaxOffset } from "./catalogParallax";

describe("getCatalogParallaxOffset", () => {
  it("retorna zero quando o centro da seção coincide com o centro da janela", () => {
    expect(getCatalogParallaxOffset(200, 400, 800)).toBe(0);
  });

  it("calcula um deslocamento proporcional à posição da galeria", () => {
    expect(getCatalogParallaxOffset(0, 400, 800)).toBe(5);
    expect(getCatalogParallaxOffset(400, 400, 800)).toBe(-5);
  });

  it("limita o deslocamento e ignora dimensões inválidas", () => {
    expect(getCatalogParallaxOffset(-2000, 400, 800, 8)).toBe(8);
    expect(getCatalogParallaxOffset(0, 0, 800)).toBe(0);
    expect(getCatalogParallaxOffset(0, 400, 800, 0)).toBe(0);
  });
});
