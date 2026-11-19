import { buildTourSlots } from "../domain/slots";
import { isScenarioId } from "../config/seed";
import type { AppState, BotStep, BusinessHoursMode } from "../types";
import { SCHEMA_VERSION, STORAGE_KEY } from "../types";
import { createInitialState } from "../state/initialState";

const STEPS: readonly BotStep[] = [
  "consent",
  "declined",
  "budget",
  "moveIn",
  "pets",
  "tourMethod",
  "slot",
  "tentativeBooked",
  "handoff",
];

function isMode(value: unknown): value is BusinessHoursMode {
  return value === "open" || value === "closed";
}

export function isAppState(value: unknown): value is AppState {
  if (!value || typeof value !== "object") return false;
  const state = value as AppState;
  return (
    state.schemaVersion === SCHEMA_VERSION &&
    typeof state.scenarioId === "string" &&
    isScenarioId(state.scenarioId) &&
    isMode(state.businessHoursMode) &&
    STEPS.includes(state.step) &&
    Array.isArray(state.units) &&
    Array.isArray(state.slots) &&
    Array.isArray(state.messages) &&
    Array.isArray(state.activity) &&
    Array.isArray(state.staffQueue) &&
    !!state.lead &&
    typeof state.lead === "object"
  );
}

function syncSlotPrompt(state: AppState): AppState {
  if (state.lead.tourSlotId) return state;
  const slots = state.slots;
  if (state.step !== "slot") return { ...state, slots };
  const index = state.messages.length - 1;
  const last = state.messages[index];
  if (!last || last.from !== "bot" || !last.quickReplies) return { ...state, slots };
  const messages = state.messages.slice();
  messages[index] = { ...last, quickReplies: slots.map((slot) => slot.label) };
  return { ...state, slots, messages };
}

export function loadState(now: Date, storage: Storage = localStorage): AppState {
  const fresh = () => createInitialState(now, "default");
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return fresh();
    const parsed: unknown = JSON.parse(raw);
    if (!isAppState(parsed)) {
      storage.removeItem(STORAGE_KEY);
      return fresh();
    }
    if (parsed.lead.tourSlotId) return parsed;
    return syncSlotPrompt({ ...parsed, slots: buildTourSlots(now) });
  } catch {
    return fresh();
  }
}

/** Storage can throw (private mode, quota, blocked site data). The demo still works without it. */
export function saveState(state: AppState, storage: Storage = localStorage): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function clearState(storage: Storage = localStorage): void {
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
