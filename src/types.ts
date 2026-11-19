export type FloorPlan = "1K" | "1DK" | "1LDK" | "2LDK";

export type Unit = {
  id: string;
  name: string;
  floorPlan: FloorPlan;
  areaSqm: number;
  rentYen: number;
  managementFeeYen: number;
  keyMoneyMonths: number;
  depositMonths: number;
  petsAllowed: boolean;
  availableFrom: string;
  available: boolean;
};

export type BudgetBandId = "under70k" | "70to100k" | "over100k";

export type BudgetBand = {
  id: BudgetBandId;
  label: string;
  /** Inclusive lower bound. Bands do not overlap, so each budget button maps to one sample unit. */
  minTotalYen: number;
  /** Inclusive upper bound of 家賃 + 管理費. */
  maxTotalYen: number;
};

export type MoveIn = "immediate" | "within1m" | "within3m";
export type TourMethod = "meetOnSite" | "visitOffice";

export type TourSlot = {
  id: string;
  label: string;
  startsAt: string;
};

export type LeadStatus =
  | "consent_pending"
  | "qualifying"
  | "matched"
  | "no_match"
  | "tentative_booked"
  | "handed_off";

export type Lead = {
  id: string;
  createdAt: string;
  consentAt: string | null;
  budget: BudgetBand | null;
  moveIn: MoveIn | null;
  hasPets: boolean | null;
  matchedUnitId: string | null;
  tourMethod: TourMethod | null;
  tourSlotId: string | null;
  status: LeadStatus;
};

export type ChatAuthor = "bot" | "renter" | "staff" | "system";

export type ChatMessage = {
  id: string;
  leadId: string;
  from: ChatAuthor;
  text: string;
  createdAt: string;
  quickReplies?: string[];
};

export type ActivityEvent = {
  id: string;
  at: string;
  text: string;
};

export type HandoffReasonKey =
  | "legal"
  | "deposit"
  | "contract"
  | "fair-housing"
  | "complaint"
  | "no_match"
  | "question";

export type Priority = "high" | "normal";

export type StaffQueueItem = {
  leadId: string;
  reasonKey: HandoffReasonKey;
  priority: Priority;
  at: string;
};

export type BotStep =
  | "consent"
  | "declined"
  | "budget"
  | "moveIn"
  | "pets"
  | "tourMethod"
  | "slot"
  | "tentativeBooked"
  | "handoff";

export type ScenarioId = "default" | "limited";

export type BusinessHoursMode = "open" | "closed";

export type AppState = {
  schemaVersion: 1;
  scenarioId: ScenarioId;
  units: Unit[];
  slots: TourSlot[];
  lead: Lead;
  step: BotStep;
  messages: ChatMessage[];
  activity: ActivityEvent[];
  staffQueue: StaffQueueItem[];
  businessHoursMode: BusinessHoursMode;
};

export const SCHEMA_VERSION = 1 as const;
export const STORAGE_KEY = "roomie-demo-jp:v1";
