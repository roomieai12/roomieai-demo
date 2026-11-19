import { BUSINESS_HOURS, type BusinessHours } from "../config/rules";
import { addJstDays, getJstParts, jstToDate } from "./jst";

export type OpenPoint = {
  year: number;
  month: number;
  day: number;
  weekday: number;
  hour: number;
  minute: number;
};

export function isOpen(date: Date, hours: BusinessHours = BUSINESS_HOURS): boolean {
  const parts = getJstParts(date);
  if (!hours.days.includes(parts.weekday)) return false;
  if (parts.hour < hours.startHour) return false;
  if (parts.hour >= hours.endHour) return false;
  return true;
}

/** Next 9:00 (or configured start) that is strictly in the future, in Asia/Tokyo. */
export function nextOpen(date: Date, hours: BusinessHours = BUSINESS_HOURS): OpenPoint {
  const today = getJstParts(date);
  for (let offset = 0; offset < 8; offset += 1) {
    const day = addJstDays(today, offset);
    if (!hours.days.includes(day.weekday)) continue;
    const opens = jstToDate(day.year, day.month, day.day, hours.startHour, 0);
    if (opens.getTime() > date.getTime()) {
      return { ...day, hour: hours.startHour, minute: 0 };
    }
  }
  const fallback = addJstDays(today, 8);
  return { ...fallback, hour: hours.startHour, minute: 0 };
}
