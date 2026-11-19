import type { ScenarioId, Unit } from "../types";

export const UNIT_A: Unit = {
  id: "A",
  name: "サンプルハイツ 201号室",
  floorPlan: "1K",
  areaSqm: 25,
  rentYen: 65_000,
  managementFeeYen: 5_000,
  keyMoneyMonths: 1,
  depositMonths: 1,
  petsAllowed: false,
  availableFrom: "2026-12-01",
  available: true,
};

export const UNIT_B: Unit = {
  id: "B",
  name: "サンプルコート 304号室",
  floorPlan: "1LDK",
  areaSqm: 40,
  rentYen: 78_000,
  managementFeeYen: 8_000,
  keyMoneyMonths: 1,
  depositMonths: 1,
  petsAllowed: true,
  availableFrom: "2026-12-15",
  available: true,
};

export const UNIT_C: Unit = {
  id: "C",
  name: "サンプルレジデンス 512号室",
  floorPlan: "2LDK",
  areaSqm: 55,
  rentYen: 110_000,
  managementFeeYen: 10_000,
  keyMoneyMonths: 0,
  depositMonths: 2,
  petsAllowed: true,
  availableFrom: "2027-01-10",
  available: true,
};

const DEFAULT_UNITS: readonly Unit[] = [UNIT_A, UNIT_B, UNIT_C];
const LIMITED_UNITS: readonly Unit[] = [UNIT_C];

export function isScenarioId(value: string): value is ScenarioId {
  return value === "default" || value === "limited";
}

export function unitsForScenario(id: ScenarioId): Unit[] {
  const source = id === "limited" ? LIMITED_UNITS : DEFAULT_UNITS;
  return source.map((unit) => ({ ...unit }));
}
