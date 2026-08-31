import { describe, expect, it } from "vitest";
import { formatReferenceFileSize, formatReferenceFileType, reorderReferenceFiles } from "./referenceFiles";

describe("referenceFiles helpers", () => {
  it("reordena uma referência sem mutar a lista original", () => {
    const files = ["primeira", "segunda", "terceira"];
    expect(reorderReferenceFiles(files, 0, 2)).toEqual(["segunda", "terceira", "primeira"]);
    expect(files).toEqual(["primeira", "segunda", "terceira"]);
  });

  it("preserva a lista quando os índices são inválidos ou iguais", () => {
    const files = ["primeira", "segunda"];
    expect(reorderReferenceFiles(files, 1, 1)).toBe(files);
    expect(reorderReferenceFiles(files, -1, 0)).toBe(files);
    expect(reorderReferenceFiles(files, 0, 3)).toBe(files);
  });

  it("formata tamanho e extensão em rótulos curtos", () => {
    expect(formatReferenceFileSize(1536)).toBe("1.5 KB");
    expect(formatReferenceFileSize(2 * 1024 * 1024)).toBe("2.0 MB");
    expect(formatReferenceFileType({ name: "referencia.jpeg", type: "image/jpeg", size: 10 })).toBe("JPG");
    expect(formatReferenceFileType({ name: "referencia.webp", type: "image/webp", size: 10 })).toBe("WEBP");
  });
});
