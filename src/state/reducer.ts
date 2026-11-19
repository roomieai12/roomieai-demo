import { consentActivity, nextStep } from "../bot/flow";
import { openingReply, type ReplyDraft } from "../bot/replies";
import { ja } from "../i18n/ja";
import { fill } from "../i18n/format";
import { hoursModeLabel, scenarioLabel } from "../i18n/labels";
import type {
  ActivityEvent,
  AppState,
  BusinessHoursMode,
  ChatMessage,
  ScenarioId,
  StaffQueueItem,
} from "../types";
import { createInitialState, newId } from "./initialState";

export type Action =
  | { type: "CONSENT_ACCEPT"; now: string }
  | { type: "CONSENT_DECLINE"; now: string }
  | { type: "RENTER_SEND"; text: string; now: string }
  | { type: "SET_SCENARIO"; scenarioId: ScenarioId; now: string }
  | { type: "SET_HOURS"; mode: BusinessHoursMode; now: string }
  | { type: "RESET"; now: string };

function pushActivity(events: ActivityEvent[], texts: string[], at: string): ActivityEvent[] {
  if (texts.length === 0) return events;
  const added = texts.map((text) => ({ id: newId("act"), at, text }));
  return [...events, ...added].slice(-50);
}

function toMessages(leadId: string, drafts: ReplyDraft[], at: string): ChatMessage[] {
  return drafts.map((draft) => ({
    id: newId("msg"),
    leadId,
    from: draft.from,
    text: draft.text,
    createdAt: at,
    ...(draft.quickReplies ? { quickReplies: draft.quickReplies } : {}),
  }));
}

function upsertQueue(
  queue: StaffQueueItem[],
  leadId: string,
  hit: { reasonKey: StaffQueueItem["reasonKey"]; priority: StaffQueueItem["priority"] },
  at: string,
): StaffQueueItem[] {
  const item: StaffQueueItem = { leadId, reasonKey: hit.reasonKey, priority: hit.priority, at };
  const index = queue.findIndex((entry) => entry.leadId === leadId);
  if (index < 0) return [...queue, item];
  const current = queue[index];
  if (!current) return [...queue, item];
  if (current.priority === "high" && hit.priority !== "high") return queue;
  const next = queue.slice();
  next[index] = item;
  return next;
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "CONSENT_ACCEPT": {
      if (state.step !== "consent") return state;
      return {
        ...state,
        step: "budget",
        lead: { ...state.lead, consentAt: action.now, status: "qualifying" },
        messages: toMessages(state.lead.id, [openingReply()], action.now),
        activity: pushActivity(state.activity, [consentActivity()], action.now),
      };
    }
    case "CONSENT_DECLINE": {
      if (state.step !== "consent") return state;
      return {
        ...state,
        step: "declined",
        activity: pushActivity(state.activity, [ja.activity.decline], action.now),
      };
    }
    case "RENTER_SEND": {
      const text = action.text.trim();
      if (!text) return state;
      if (state.step === "consent" || state.step === "declined") return state;
      const result = nextStep(
        { step: state.step, lead: state.lead, units: state.units, slots: state.slots },
        text,
        { open: state.businessHoursMode === "open", now: new Date(action.now) },
      );
      const renter: ChatMessage = {
        id: newId("msg"),
        leadId: state.lead.id,
        from: "renter",
        text,
        createdAt: action.now,
      };
      return {
        ...state,
        step: result.step,
        lead: result.lead,
        messages: [...state.messages, renter, ...toMessages(state.lead.id, result.replies, action.now)],
        activity: pushActivity(state.activity, result.activity, action.now),
        staffQueue: result.handoff
          ? upsertQueue(state.staffQueue, state.lead.id, result.handoff, action.now)
          : state.staffQueue,
      };
    }
    case "SET_SCENARIO": {
      if (action.scenarioId === state.scenarioId && state.step === "consent" && state.messages.length === 0) {
        return state;
      }
      const next = createInitialState(new Date(action.now), action.scenarioId);
      return {
        ...next,
        businessHoursMode: state.businessHoursMode,
        activity: pushActivity(
          [],
          [fill(ja.activity.scenario, { label: scenarioLabel(action.scenarioId) })],
          action.now,
        ),
      };
    }
    case "SET_HOURS": {
      if (action.mode === state.businessHoursMode) return state;
      return {
        ...state,
        businessHoursMode: action.mode,
        activity: pushActivity(
          state.activity,
          [fill(ja.activity.hours, { label: hoursModeLabel(action.mode) })],
          action.now,
        ),
      };
    }
    case "RESET":
      return createInitialState(new Date(action.now), "default");
    default:
      return state;
  }
}
