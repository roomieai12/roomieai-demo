import type { HandoffReasonKey, LeadStatus, MoveIn, Priority, ScenarioId, TourMethod } from "../types";
import { ja } from "./ja";

export function reasonLabel(key: HandoffReasonKey): string {
  return ja.dashboard.reasons[key];
}

export function priorityLabel(priority: Priority): string {
  return priority === "high" ? ja.dashboard.queue.high : ja.dashboard.queue.normal;
}

export function moveInLabel(value: MoveIn): string {
  return ja.options.moveIn[value];
}

export function tourMethodLabel(value: TourMethod): string {
  return value === "meetOnSite" ? ja.options.tour.meetOnSite : ja.options.tour.visitOffice;
}

export function petsLabel(hasPets: boolean): string {
  return hasPets ? ja.options.pets.yes : ja.options.pets.no;
}

export function statusLabel(status: LeadStatus): string {
  return ja.dashboard.status[status];
}

export function scenarioLabel(id: ScenarioId): string {
  return ja.scenarios[id];
}

export function hoursModeLabel(mode: "open" | "closed"): string {
  return mode === "open" ? ja.controls.hoursOpen : ja.controls.hoursClosed;
}
