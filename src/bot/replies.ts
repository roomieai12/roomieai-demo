import type { OpenPoint } from "../domain/businessHours";
import { totalRentYen } from "../domain/matching";
import type { TourSlot, Unit } from "../types";
import { fill, formatDateJst, formatDeposit, formatKeyMoney, formatOpenPoint, formatYen } from "../i18n/format";
import { ja } from "../i18n/ja";
import { tourMethodLabel } from "../i18n/labels";

export type ReplyDraft = {
  from: "bot";
  text: string;
  quickReplies?: string[];
};

export function budgetLabels(): string[] {
  return [ja.options.budget.under70k, ja.options.budget.mid, ja.options.budget.high];
}

export function moveInLabels(): string[] {
  return [ja.options.moveIn.immediate, ja.options.moveIn.within1m, ja.options.moveIn.within3m];
}

export function petLabels(): string[] {
  return [ja.options.pets.yes, ja.options.pets.no];
}

export function tourLabels(): string[] {
  return [ja.options.tour.meetOnSite, ja.options.tour.visitOffice];
}

export function bookedLabels(): string[] {
  return [ja.options.booked.reschedule, ja.options.booked.question];
}

export function openingReply(): ReplyDraft {
  return { from: "bot", text: ja.replies.greeting, quickReplies: budgetLabels() };
}

export function moveInReply(): ReplyDraft {
  return { from: "bot", text: ja.replies.moveIn, quickReplies: moveInLabels() };
}

export function petsReply(): ReplyDraft {
  return { from: "bot", text: ja.replies.pets, quickReplies: petLabels() };
}

export function tourIntroReply(unit: Unit): ReplyDraft {
  const total = totalRentYen(unit);
  return {
    from: "bot",
    text: fill(ja.replies.tourIntro, {
      name: unit.name,
      plan: unit.floorPlan,
      area: unit.areaSqm,
      total: formatYen(total),
      rent: formatYen(unit.rentYen),
      fee: formatYen(unit.managementFeeYen),
      keyMoney: formatKeyMoney(unit.keyMoneyMonths),
      deposit: formatDeposit(unit.depositMonths),
    }),
    quickReplies: tourLabels(),
  };
}

export function tourMethodReply(): ReplyDraft {
  return { from: "bot", text: ja.replies.tourMethod, quickReplies: tourLabels() };
}

export function slotReply(slots: TourSlot[]): ReplyDraft {
  return { from: "bot", text: ja.replies.slot, quickReplies: slots.map((slot) => slot.label) };
}

export function bookedReply(unit: Unit, slot: TourSlot, methodLabel: string, open: boolean, next: OpenPoint): ReplyDraft {
  const vars = {
    name: unit.name,
    when: formatDateJst(slot.startsAt),
    method: methodLabel,
    nextOpen: formatOpenPoint(next),
  };
  return {
    from: "bot",
    text: fill(open ? ja.replies.bookedOpen : ja.replies.bookedClosed, vars),
    quickReplies: bookedLabels(),
  };
}

export function handoffReply(kind: "standard" | "fair-housing" | "no_match", open: boolean, next: OpenPoint): ReplyDraft {
  const nextOpen = formatOpenPoint(next);
  const template = open
    ? kind === "fair-housing"
      ? ja.replies.fairHousingOpen
      : kind === "no_match"
        ? ja.replies.noMatchOpen
        : ja.replies.handoffOpen
    : kind === "fair-housing"
      ? ja.replies.fairHousingClosed
      : kind === "no_match"
        ? ja.replies.noMatchClosed
        : ja.replies.handoffClosed;
  return { from: "bot", text: fill(template, { nextOpen }) };
}

export function bookedChoicesReply(): ReplyDraft {
  return { from: "bot", text: ja.replies.bookedChoices, quickReplies: bookedLabels() };
}

export function methodLabel(method: "meetOnSite" | "visitOffice"): string {
  return tourMethodLabel(method);
}
