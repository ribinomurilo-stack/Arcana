import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const ctx = {
  user: null,
  req: {} as TrpcContext["req"],
  res: {} as TrpcContext["res"],
} satisfies TrpcContext;

const validQuote = {
  name: "Pessoa Teste",
  email: "pessoa@example.com",
  phone: "11999999999",
  placement: "Braço",
  size: "12 cm",
  idea: "Uma composição de teste para validar o formulário.",
  preferredDate: "2026-09-15",
  references: [],
};

describe("quotes.create", () => {
  it("rejects unsupported reference formats", async () => {
    const caller = appRouter.createCaller(ctx);
    await expect(caller.quotes.create({
      ...validQuote,
      references: [{ name: "arquivo.pdf", type: "application/pdf", data: "data:application/pdf;base64,AAAA" }],
    })).rejects.toThrow();
  });

  it("rejects an invalid suggested date", async () => {
    const caller = appRouter.createCaller(ctx);
    await expect(caller.quotes.create({ ...validQuote, preferredDate: "15/09/2026" })).rejects.toThrow();
  });

  it("rejects an invalid phone with a friendly validation error", async () => {
    const caller = appRouter.createCaller(ctx);
    await expect(caller.quotes.create({ ...validQuote, phone: "123" })).rejects.toThrow("Digite um telefone com pelo menos 8 números.");
  });

  it("rejects more than five references", async () => {
    const caller = appRouter.createCaller(ctx);
    const references = Array.from({ length: 6 }, (_, index) => ({
      name: `referencia-${index}.jpg`,
      type: "image/jpeg",
      data: "data:image/jpeg;base64,AAAA",
    }));
    await expect(caller.quotes.create({ ...validQuote, references })).rejects.toThrow();
  });
});
