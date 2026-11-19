import type { BudgetBand, Unit } from "../types";

export function totalRentYen(unit: Unit): number {
  return unit.rentYen + unit.managementFeeYen;
}

export function matchUnit(units: Unit[], band: BudgetBand, hasPets: boolean): Unit | null {
  const fits = units.filter((unit) => {
    if (!unit.available) return false;
    const total = totalRentYen(unit);
    if (total < band.minTotalYen || total > band.maxTotalYen) return false;
    if (hasPets && !unit.petsAllowed) return false;
    return true;
  });
  fits.sort((a, b) => {
    const byRent = totalRentYen(a) - totalRentYen(b);
    if (byRent !== 0) return byRent;
    return a.availableFrom.localeCompare(b.availableFrom);
  });
  return fits[0] ?? null;
}
