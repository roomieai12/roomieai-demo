import { ja } from "../i18n/ja";
import { BUDGET_LIMITS } from "../config/rules";
import type { BudgetBand, MoveIn, TourMethod, TourSlot } from "../types";
import { normalizeInput } from "./normalize";

export function budgetBands(): BudgetBand[] {
  return [
    { id: "under70k", label: ja.options.budget.under70k, ...BUDGET_LIMITS.under70k },
    { id: "70to100k", label: ja.options.budget.mid, ...BUDGET_LIMITS["70to100k"] },
    { id: "over100k", label: ja.options.budget.high, ...BUDGET_LIMITS.over100k },
  ];
}

export function bandForTotal(totalYen: number): BudgetBand | null {
  return budgetBands().find((band) => totalYen >= band.minTotalYen && totalYen <= band.maxTotalYen) ?? null;
}

export function parseBudgetBand(text: string): BudgetBand | null {
  const normalized = normalizeInput(text);
  return budgetBands().find((band) => normalizeInput(band.label) === normalized || band.id === normalized) ?? null;
}

export function parseMoveIn(text: string): MoveIn | null {
  const normalized = normalizeInput(text);
  const table: Record<string, MoveIn> = {
    [normalizeInput(ja.options.moveIn.immediate)]: "immediate",
    [normalizeInput(ja.options.moveIn.within1m)]: "within1m",
    [normalizeInput(ja.options.moveIn.within3m)]: "within3m",
  };
  return table[normalized] ?? null;
}

export function parsePets(text: string): boolean | null {
  const normalized = normalizeInput(text);
  if (normalized === normalizeInput(ja.options.pets.yes)) return true;
  if (normalized === normalizeInput(ja.options.pets.no)) return false;
  return null;
}

export function parseTourMethod(text: string): TourMethod | null {
  const normalized = normalizeInput(text);
  if (normalized === normalizeInput(ja.options.tour.meetOnSite)) return "meetOnSite";
  if (normalized === normalizeInput(ja.options.tour.visitOffice)) return "visitOffice";
  return null;
}

export function parseTourSlot(text: string, slots: TourSlot[]): TourSlot | null {
  const normalized = normalizeInput(text);
  return slots.find((slot) => normalizeInput(slot.label) === normalized || slot.id === normalized) ?? null;
}
