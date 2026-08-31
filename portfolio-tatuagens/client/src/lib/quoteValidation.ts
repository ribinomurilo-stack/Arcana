export const MIN_QUOTE_IDEA_LENGTH = 10;

export type QuoteFieldValues = {
  name: string;
  email: string;
  phone: string;
  placement: string;
  size: string;
  preferredDate: string;
  idea: string;
};

export type QuoteFieldErrors = Partial<Record<keyof QuoteFieldValues, string>>;

export function validateQuoteIdea(value: string) {
  return value.trim().length >= MIN_QUOTE_IDEA_LENGTH;
}

export function getQuoteIdeaCounterText(value: string) {
  const count = value.length;
  const remaining = Math.max(0, MIN_QUOTE_IDEA_LENGTH - count);
  return remaining > 0
    ? `${count}/${MIN_QUOTE_IDEA_LENGTH} caracteres — faltam ${remaining}.`
    : `${count} caracteres — mínimo de ${MIN_QUOTE_IDEA_LENGTH} atingido.`;
}

export function validateQuoteFields(values: QuoteFieldValues): QuoteFieldErrors {
  const errors: QuoteFieldErrors = {};
  if (values.name.trim().length < 2) errors.name = "Digite seu nome completo.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Confira o formato do seu e-mail.";
  if (values.phone.replace(/\D/g, "").length < 8) errors.phone = "Digite um telefone com pelo menos 8 números.";
  if (values.placement.trim().length < 2) errors.placement = "Informe onde a tatuagem será feita.";
  if (values.size.trim().length < 1) errors.size = "Informe um tamanho aproximado.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.preferredDate)) errors.preferredDate = "Escolha uma data sugerida.";
  if (!validateQuoteIdea(values.idea)) errors.idea = "Descreva sua ideia com pelo menos 10 caracteres.";
  return errors;
}
