export const QUOTE_DRAFT_STORAGE_KEY = "atlas-quote-draft-v1";

export type QuoteReferenceDraft = {
  name: string;
  type: string;
  size: number;
  lastModified: number;
  dataUrl: string;
  note: string;
};

export type QuoteDraft = {
  name: string;
  email: string;
  phone: string;
  placement: string;
  size: string;
  preferredDate: string;
  idea: string;
  referenceDrafts?: QuoteReferenceDraft[];
};

export type QuoteTextField = Exclude<keyof QuoteDraft, "referenceDrafts">;

export function updateQuoteTextField(draft: QuoteDraft, field: QuoteTextField, value: string): QuoteDraft {
  return { ...draft, [field]: value };
}

export const EMPTY_QUOTE_DRAFT: QuoteDraft = {
  name: "",
  email: "",
  phone: "",
  placement: "",
  size: "",
  preferredDate: "",
  idea: "",
  referenceDrafts: [],
};

export function readQuoteDraft(): QuoteDraft {
  if (typeof window === "undefined") return EMPTY_QUOTE_DRAFT;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(QUOTE_DRAFT_STORAGE_KEY) ?? "null") as Partial<QuoteDraft> | null;
    const referenceDrafts = Array.isArray(parsed?.referenceDrafts) ? parsed.referenceDrafts.filter((reference) => reference && typeof reference.name === "string" && typeof reference.dataUrl === "string") : [];
    return { ...EMPTY_QUOTE_DRAFT, ...parsed, referenceDrafts };
  } catch {
    return EMPTY_QUOTE_DRAFT;
  }
}

export function hasQuoteDraft(draft: QuoteDraft) {
  return [draft.name, draft.email, draft.phone, draft.placement, draft.size, draft.preferredDate, draft.idea].some((value) => value.trim().length > 0);
}
