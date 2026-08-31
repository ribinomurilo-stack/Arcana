import { describe, expect, it } from "vitest";
import { updateQuoteTextField, type QuoteDraft } from "./quoteDraft";

describe("updateQuoteTextField", () => {
  const draft: QuoteDraft = {
    name: "Pessoa Teste",
    email: "pessoa@example.com",
    phone: "(11) 99999-9999",
    placement: "Braço",
    size: "12 cm",
    preferredDate: "2026-09-15",
    idea: "Uma composição autoral.",
    referenceDrafts: [{ name: "referencia.jpg", type: "image/jpeg", size: 1200, lastModified: 1, dataUrl: "data:image/jpeg;base64,AAAA", note: "linhas mais finas" }],
  };

  it("edita somente o campo textual escolhido", () => {
    const updated = updateQuoteTextField(draft, "idea", "Uma composição mais orgânica.");

    expect(updated.idea).toBe("Uma composição mais orgânica.");
    expect(updated.name).toBe(draft.name);
    expect(updated.referenceDrafts).toEqual(draft.referenceDrafts);
  });

  it("preserva a ordem e as notas das referências ao editar dados do cliente", () => {
    const updated = updateQuoteTextField(draft, "name", "Outra Pessoa");

    expect(updated.name).toBe("Outra Pessoa");
    expect(updated.referenceDrafts?.[0].name).toBe("referencia.jpg");
    expect(updated.referenceDrafts?.[0].note).toBe("linhas mais finas");
  });
});
