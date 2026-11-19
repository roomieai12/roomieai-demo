import { BUSINESS_HOURS } from "../config/rules";
import { formatWeekdaySlot } from "../i18n/format";
import { ja } from "../i18n/ja";
import type { TourSlot } from "../types";
import { addJstDays, getJstParts, jstToDate, toJstIso } from "./jst";

function eveningLabel(now: Date, slot: { year: number; month: number; day: number; weekday: number }): string {
  const today = getJstParts(now);
  const tomorrow = addJstDays(today, 1);
  const isTomorrow =
    slot.year === tomorrow.year && slot.month === tomorrow.month && slot.day === tomorrow.day;
  if (isTomorrow) return ja.slots.tomorrowEvening;
  return formatWeekdaySlot(slot.month, slot.day, slot.weekday, 17, 0);
}

function nextEvening(now: Date): { year: number; month: number; day: number; weekday: number } {
  const today = getJstParts(now);
  for (let offset = 1; offset <= 8; offset += 1) {
    const day = addJstDays(today, offset);
    if (BUSINESS_HOURS.days.includes(day.weekday)) return day;
  }
  return addJstDays(today, 1);
}

function nextSaturday(now: Date): { year: number; month: number; day: number; weekday: number } {
  const today = getJstParts(now);
  for (let offset = 0; offset <= 7; offset += 1) {
    const day = addJstDays(today, offset);
    if (day.weekday !== 6) continue;
    const atEleven = jstToDate(day.year, day.month, day.day, 11, 0);
    if (atEleven.getTime() > now.getTime()) return day;
  }
  return addJstDays(today, 7);
}

export function buildTourSlots(now: Date): TourSlot[] {
  const evening = nextEvening(now);
  const saturday = nextSaturday(now);
  return [
    {
      id: "evening-17",
      label: eveningLabel(now, evening),
      startsAt: toJstIso(evening.year, evening.month, evening.day, 17, 0),
    },
    {
      id: "sat-11",
      label: ja.slots.saturday11,
      startsAt: toJstIso(saturday.year, saturday.month, saturday.day, 11, 0),
    },
    {
      id: "sat-14",
      label: ja.slots.saturday14,
      startsAt: toJstIso(saturday.year, saturday.month, saturday.day, 14, 0),
    },
  ];
}
