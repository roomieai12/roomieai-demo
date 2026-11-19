import { nextOpen } from "../domain/businessHours";
import { shouldHandoff } from "../domain/handoff";
import { matchUnit, totalRentYen } from "../domain/matching";
import { normalizeInput } from "../domain/normalize";
import { parseBudgetBand, parseMoveIn, parsePets, parseTourMethod, parseTourSlot } from "../domain/validation";
import { fill, formatDateJst, formatYen } from "../i18n/format";
import { ja } from "../i18n/ja";
import { moveInLabel, priorityLabel, reasonLabel } from "../i18n/labels";
import { PRIVACY_NOTICE_VERSION } from "../config/privacy";
import type { BotStep, HandoffReasonKey, Lead, Priority, TourSlot, Unit } from "../types";
import {
  bookedChoicesReply,
  bookedReply,
  handoffReply,
  methodLabel,
  moveInReply,
  openingReply,
  petsReply,
  slotReply,
  tourIntroReply,
  tourMethodReply,
  type ReplyDraft,
} from "./replies";

export type Conversation = {
  step: BotStep;
  lead: Lead;
  units: Unit[];
  slots: TourSlot[];
};

export type FlowContext = {
  open: boolean;
  now: Date;
};

export type FlowResult = {
  step: BotStep;
  lead: Lead;
  replies: ReplyDraft[];
  activity: string[];
  handoff: { reasonKey: HandoffReasonKey; priority: Priority } | null;
};

function same(conv: Conversation, replies: ReplyDraft[] = [], activity: string[] = []): FlowResult {
  return { step: conv.step, lead: conv.lead, replies, activity, handoff: null };
}

function handoffActivity(reasonKey: HandoffReasonKey, priority: Priority): string {
  return fill(ja.activity.handoff, {
    reason: reasonLabel(reasonKey),
    priority: priorityLabel(priority),
  });
}

function toHandoff(
  lead: Lead,
  reasonKey: HandoffReasonKey,
  priority: Priority,
  kind: "standard" | "fair-housing" | "no_match",
  ctx: FlowContext,
  earlier: string[] = [],
): FlowResult {
  const status = reasonKey === "no_match" ? "no_match" : "handed_off";
  return {
    step: "handoff",
    lead: { ...lead, status },
    replies: [handoffReply(kind, ctx.open, nextOpen(ctx.now))],
    activity: [...earlier, handoffActivity(reasonKey, priority)],
    handoff: { reasonKey, priority },
  };
}

function promptFor(conv: Conversation): ReplyDraft {
  switch (conv.step) {
    case "budget":
      return openingReply();
    case "moveIn":
      return moveInReply();
    case "pets":
      return petsReply();
    case "tourMethod":
      return tourMethodReply();
    case "slot":
      return slotReply(conv.slots);
    case "tentativeBooked":
      return bookedChoicesReply();
    default:
      return { from: "bot", text: ja.replies.reprompt };
  }
}

function reprompt(conv: Conversation): FlowResult {
  return same(conv, [{ from: "bot", text: ja.replies.reprompt }, promptFor(conv)]);
}

export function nextStep(conv: Conversation, input: string, ctx: FlowContext): FlowResult {
  const text = normalizeInput(input);
  if (!text) return same(conv);

  const keyword = shouldHandoff(input);
  if (keyword && conv.step !== "handoff") {
    const kind = keyword.reasonKey === "fair-housing" ? "fair-housing" : "standard";
    return toHandoff(conv.lead, keyword.reasonKey, keyword.priority, kind, ctx);
  }

  if (conv.step === "handoff") {
    if (keyword) {
      return {
        step: "handoff",
        lead: { ...conv.lead, status: "handed_off" },
        replies: [{ from: "bot", text: ja.replies.alreadyHandedOff }],
        activity: [handoffActivity(keyword.reasonKey, keyword.priority)],
        handoff: keyword,
      };
    }
    return same(conv, [{ from: "bot", text: ja.replies.alreadyHandedOff }]);
  }

  switch (conv.step) {
    case "budget": {
      const band = parseBudgetBand(text);
      if (!band) return reprompt(conv);
      return {
        step: "moveIn",
        lead: { ...conv.lead, budget: band, status: "qualifying" },
        replies: [moveInReply()],
        activity: [fill(ja.activity.budget, { label: band.label })],
        handoff: null,
      };
    }
    case "moveIn": {
      const moveIn = parseMoveIn(text);
      if (!moveIn) return reprompt(conv);
      return {
        step: "pets",
        lead: { ...conv.lead, moveIn },
        replies: [petsReply()],
        activity: [fill(ja.activity.moveIn, { label: moveInLabel(moveIn) })],
        handoff: null,
      };
    }
    case "pets": {
      const hasPets = parsePets(text);
      if (hasPets === null || !conv.lead.budget) return reprompt(conv);
      const lead = { ...conv.lead, hasPets };
      const petLine = hasPets ? ja.activity.petsYes : ja.activity.petsNo;
      const unit = matchUnit(conv.units, conv.lead.budget, hasPets);
      if (!unit) {
        return toHandoff(lead, "no_match", "normal", "no_match", ctx, [petLine]);
      }
      return {
        step: "tourMethod",
        lead: { ...lead, matchedUnitId: unit.id, status: "matched" },
        replies: [tourIntroReply(unit)],
        activity: [petLine, fill(ja.activity.matched, { name: unit.name, total: formatYen(totalRentYen(unit)) })],
        handoff: null,
      };
    }
    case "tourMethod": {
      const tourMethod = parseTourMethod(text);
      if (!tourMethod) return reprompt(conv);
      return {
        step: "slot",
        lead: { ...conv.lead, tourMethod },
        replies: [slotReply(conv.slots)],
        activity: [fill(ja.activity.tour, { label: methodLabel(tourMethod) })],
        handoff: null,
      };
    }
    case "slot": {
      const slot = parseTourSlot(text, conv.slots);
      const unit = conv.units.find((item) => item.id === conv.lead.matchedUnitId);
      if (!slot || !unit || !conv.lead.tourMethod) return reprompt(conv);
      return {
        step: "tentativeBooked",
        lead: { ...conv.lead, tourSlotId: slot.id, status: "tentative_booked" },
        replies: [bookedReply(unit, slot, methodLabel(conv.lead.tourMethod), ctx.open, nextOpen(ctx.now))],
        activity: [fill(ja.activity.booked, { when: formatDateJst(slot.startsAt) })],
        handoff: null,
      };
    }
    case "tentativeBooked": {
      if (text === normalizeInput(ja.options.booked.reschedule)) {
        return {
          step: "slot",
          lead: { ...conv.lead, tourSlotId: null, status: "matched" },
          replies: [slotReply(conv.slots)],
          activity: [ja.activity.reschedule],
          handoff: null,
        };
      }
      return toHandoff(conv.lead, "question", "normal", "standard", ctx);
    }
    default:
      return same(conv);
  }
}

export function consentActivity(): string {
  return fill(ja.activity.consent, { version: PRIVACY_NOTICE_VERSION });
}
