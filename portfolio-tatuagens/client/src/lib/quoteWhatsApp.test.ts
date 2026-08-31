import { describe, expect, it } from "vitest";
import { buildQuoteWhatsAppMessage, buildWhatsAppUrl } from "./quoteWhatsApp";

describe("quote WhatsApp briefing", () => {
  it("formats the client description and references", () => {
    const message = buildQuoteWhatsAppMessage({
      name: "Ana",
      email: "ana@example.com",
      phone: "11999999999",
      placement: "Braço",
      size: "12 cm",
      preferredDate: "2026-09-10",
      idea: "Uma criatura botânica em traço fino.",
      referenceNames: ["folha.png"],
      referenceNotes: ["Preferir composição vertical."],
      selectedDrawingTitle: "Ritual suspenso — Místicos",
    });
    expect(message).toContain("Cliente: Ana");
    expect(message).toContain("Telefone: 11999999999");
    expect(message).toContain("Descrição / briefing:\nUma criatura botânica em traço fino.");
    expect(message).toContain("- folha.png — Preferir composição vertical.");
    expect(message).toContain("Desenho escolhido: Ritual suspenso — Místicos");
  });

  it("encodes the message in the studio WhatsApp URL", () => {
    const url = buildWhatsAppUrl("5511984564012", "Olá, Atlas!");
    expect(url).toContain("phone=5511984564012");
    expect(url).toContain("text=Ol%C3%A1%2C%20Atlas!");
    expect(url).toContain("type=phone_number&app_absent=0&utm_source=ig");
  });
});
