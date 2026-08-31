import { describe, expect, it } from "vitest";
import { getQuoteIdeaCounterText, validateQuoteIdea } from "./quoteValidation";

describe("quote idea validation", () => {
  it("rejects empty and short descriptions", () => {
    expect(validateQuoteIdea("")).toBe(false);
    expect(validateQuoteIdea("curto")).toBe(false);
  });

  it("accepts a trimmed description with at least ten characters", () => {
    expect(validateQuoteIdea("  Uma ideia válida  ")).toBe(true);
  });

  it("shows remaining characters before the minimum is reached", () => {
    expect(getQuoteIdeaCounterText("abc")).toBe("3/10 caracteres — faltam 7.");
  });

  it("confirms the minimum after the idea is long enough", () => {
    expect(getQuoteIdeaCounterText("Uma ideia válida")).toBe("16 caracteres — mínimo de 10 atingido.");
  });
});
