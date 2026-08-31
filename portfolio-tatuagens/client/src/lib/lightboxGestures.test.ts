import { describe, expect, it } from "vitest";
import { getLightboxSwipeAction } from "./lightboxGestures";

describe("lightbox gestures", () => {
  it("navega para a próxima arte ao deslizar para a esquerda", () => {
    expect(getLightboxSwipeAction(-80, 8)).toBe("next");
  });

  it("navega para a arte anterior ao deslizar para a direita", () => {
    expect(getLightboxSwipeAction(80, -8)).toBe("previous");
  });

  it("fecha ao deslizar verticalmente para baixo", () => {
    expect(getLightboxSwipeAction(9, 90)).toBe("close");
  });

  it("não navega enquanto a arte está ampliada para permitir pan", () => {
    expect(getLightboxSwipeAction(-120, 0, 2)).toBeNull();
  });
});
