import { HANDOFF_KEYWORD_GROUPS } from "../config/rules";
import type { HandoffReasonKey, Priority } from "../types";
import { normalizeInput } from "./normalize";

export type HandoffHit = {
  reasonKey: Exclude<HandoffReasonKey, "no_match" | "question">;
  priority: Priority;
};

export function shouldHandoff(text: string): HandoffHit | null {
  const normalized = normalizeInput(text);
  if (!normalized) return null;
  for (const group of HANDOFF_KEYWORD_GROUPS) {
    const hit = group.keywords.some((keyword) => normalized.includes(normalizeInput(keyword)));
    if (hit) return { reasonKey: group.reasonKey, priority: group.priority };
  }
  return null;
}
