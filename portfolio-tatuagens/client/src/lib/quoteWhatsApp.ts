export type QuoteWhatsAppInput = {
  name: string;
  email: string;
  phone: string;
  placement: string;
  size: string;
  preferredDate: string;
  idea: string;
  referenceNames: string[];
  referenceNotes?: string[];
  selectedDrawingTitle?: string;
};

export function buildQuoteWhatsAppMessage(input: QuoteWhatsAppInput) {
  const references = input.referenceNames.length > 0
    ? input.referenceNames.map((name, index) => {
      const note = input.referenceNotes?.[index]?.trim();
      return note ? `- ${name} — ${note}` : `- ${name}`;
    }).join("\n")
    : "Nenhuma referência anexada";

  return [
    "Olá! Recebi um novo briefing pela Arcana.",
    "",
    `Cliente: ${input.name}`,
    `E-mail: ${input.email}`,
    `Telefone: ${input.phone}`,
    `Local no corpo: ${input.placement}`,
    `Tamanho aproximado: ${input.size}`,
    `Data sugerida: ${input.preferredDate}`,
    ...(input.selectedDrawingTitle ? [`Desenho escolhido: ${input.selectedDrawingTitle}`] : []),
    "",
    "Descrição / briefing:",
    input.idea,
    "",
    "Referências anexadas:",
    references,
    "",
    "Pode me retornar com disponibilidade e valor?",
  ].join("\n");
}

export function buildWhatsAppUrl(phone: string, message: string) {
  return `https://api.whatsapp.com/send/?phone=${phone}&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0&utm_source=ig`;
}
