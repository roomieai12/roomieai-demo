import { UNIT_A, UNIT_B, UNIT_C } from "../config/seed";
import type { BudgetBand, Unit } from "../types";
import { matchUnit, totalRentYen } from "./matching";
import { budgetBands } from "./validation";

const band = (id: BudgetBand["id"]): BudgetBand => {
  const found = budgetBands().find((item) => item.id === id);
  if (!found) throw new Error(id);
  return found;
};

const all: Unit[] = [UNIT_A, UNIT_B, UNIT_C];

describe("matchUnit", () => {
  it("uses total rent (家賃 + 管理費), not rent alone", () => {
    expect(totalRentYen(UNIT_A)).toBe(70_000);
    expect(totalRentYen(UNIT_B)).toBe(86_000);
    expect(totalRentYen(UNIT_C)).toBe(120_000);
  });

  it("includes a unit whose total exactly equals the band limit", () => {
    expect(matchUnit(all, band("under70k"), false)?.id).toBe("A");
  });

  it("excludes a unit when 管理費 pushes the total over the limit", () => {
    const pricey: Unit = { ...UNIT_A, id: "X", rentYen: 66_000 }; // 66,000 + 5,000 = 71,000
    expect(matchUnit([pricey], band("under70k"), false)).toBeNull();
  });

  it("matches each budget band to the Section 9 sample", () => {
    expect(matchUnit(all, band("70to100k"), false)?.id).toBe("B");
    expect(matchUnit(all, band("over100k"), false)?.id).toBe("C");
  });

  it("filters to ペット可 units when the renter has pets", () => {
    expect(matchUnit(all, band("under70k"), true)).toBeNull();
    expect(matchUnit(all, band("70to100k"), true)?.id).toBe("B");
  });

  it("skips unavailable units", () => {
    expect(matchUnit([{ ...UNIT_B, available: false }], band("70to100k"), false)).toBeNull();
  });

  it("returns null when there are no units", () => {
    expect(matchUnit([], band("70to100k"), false)).toBeNull();
  });

  it("breaks ties on total rent by earliest availableFrom", () => {
    const later: Unit = { ...UNIT_B, id: "late", availableFrom: "2027-03-01" };
    const sooner: Unit = { ...UNIT_B, id: "soon", availableFrom: "2026-12-01" };
    expect(matchUnit([later, sooner], band("70to100k"), false)?.id).toBe("soon");
  });

  it("prefers the lowest total rent", () => {
    const cheaper: Unit = { ...UNIT_B, id: "cheap", rentYen: 72_000 };
    expect(matchUnit([UNIT_B, cheaper], band("70to100k"), false)?.id).toBe("cheap");
  });
});
