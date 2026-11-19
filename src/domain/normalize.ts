/** NFKC, unify tildes, and remove whitespace so full-width input matches labels. */
export function normalizeInput(text: string): string {
  return text.normalize("NFKC").replace(/~/g, "〜").replace(/\s+/g, "").toLowerCase();
}
