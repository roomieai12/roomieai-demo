import { isOpen } from "../domain/businessHours";
import { buildTourSlots } from "../domain/slots";
import { unitsForScenario } from "../config/seed";
import type { AppState, Lead, ScenarioId } from "../types";
import { SCHEMA_VERSION } from "../types";

export function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function createLead(nowIso: string): Lead {
  return {
    id: newId("lead"),
    createdAt: nowIso,
    consentAt: null,
    budget: null,
    moveIn: null,
    hasPets: null,
    matchedUnitId: null,
    tourMethod: null,
    tourSlotId: null,
    status: "consent_pending",
  };
}

export function createInitialState(now: Date, scenarioId: ScenarioId = "default"): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    scenarioId,
    units: unitsForScenario(scenarioId),
    slots: buildTourSlots(now),
    lead: createLead(now.toISOString()),
    step: "consent",
    messages: [],
    activity: [],
    staffQueue: [],
    // Start from the real JST clock; the demo toggle overrides it for presentations.
    businessHoursMode: isOpen(now) ? "open" : "closed",
  };
}
