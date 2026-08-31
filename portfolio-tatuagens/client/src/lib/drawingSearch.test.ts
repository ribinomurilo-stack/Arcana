import { describe, expect, it } from "vitest";
import { matchesDrawingSearch } from "./drawingSearch";

const drawing = { id: "flash-peculiares-01", category: "OS PECULIARES", status: "Disponível" };
const labels = { category: "Os Peculiares", descriptor: "personagem / estranho", title: "Os que escapam" };

describe("drawingSearch", () => {
  it("encontra o título editorial e o nome da coleção", () => {
    expect(matchesDrawingSearch(drawing, "os que escapam", labels)).toBe(true);
    expect(matchesDrawingSearch(drawing, "peculiares", labels)).toBe(true);
  });

  it("encontra o ID e retorna falso para termos sem correspondência", () => {
    expect(matchesDrawingSearch(drawing, "flash-peculiares-01", labels)).toBe(true);
    expect(matchesDrawingSearch(drawing, "dragão", labels)).toBe(false);
  });
});
