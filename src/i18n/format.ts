import type { OpenPoint } from "../domain/businessHours";
import { getJstParts } from "../domain/jst";
import { ja } from "./ja";

export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = vars[key];
    return value === undefined ? match : String(value);
  });
}

export function formatYen(yen: number): string {
  return `${new Intl.NumberFormat("ja-JP").format(yen)}円`;
}

export function formatManYen(yen: number): string {
  const man = yen / 10_000;
  const rounded = Math.round(man * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : String(rounded);
  return `${text}万円`;
}

export function formatKeyMoney(months: number): string {
  if (months === 0) return ja.money.noKeyMoney;
  return fill(ja.money.keyMoney, { n: months });
}

export function formatDeposit(months: number): string {
  return fill(ja.money.deposit, { n: months });
}

/** "礼金1ヶ月・敷金1ヶ月" */
export function formatInitialCosts(keyMoneyMonths: number, depositMonths: number): string {
  return fill(ja.money.initial, { keyMoney: formatKeyMoney(keyMoneyMonths), deposit: formatDeposit(depositMonths) });
}

/** "（家賃65,000円＋管理費5,000円）" */
export function formatRentBreakdown(rentYen: number, feeYen: number): string {
  return fill(ja.money.breakdown, { rent: formatYen(rentYen), fee: formatYen(feeYen) });
}

export function formatDateJst(iso: string): string {
  const parts = getJstParts(new Date(iso));
  const minute = String(parts.minute).padStart(2, "0");
  const weekday = ja.weekday[parts.weekday] ?? "";
  return `${parts.year}年${parts.month}月${parts.day}日（${weekday}）${parts.hour}:${minute}`;
}

/** "2026-12-01" (a JST calendar date) → "2026年12月1日". */
export function formatDateOnly(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return `${year}年${month}月${day}日`;
}

export function formatTimeJst(iso: string): string {
  const parts = getJstParts(new Date(iso));
  return `${parts.hour}:${String(parts.minute).padStart(2, "0")}`;
}

export function formatActivityTime(iso: string): string {
  const parts = getJstParts(new Date(iso));
  return `${parts.month}/${parts.day} ${parts.hour}:${String(parts.minute).padStart(2, "0")}`;
}

export function formatOpenPoint(point: OpenPoint): string {
  const minute = String(point.minute).padStart(2, "0");
  const weekday = ja.weekday[point.weekday] ?? "";
  return `${point.month}月${point.day}日（${weekday}）${point.hour}:${minute}`;
}

export function formatWeekdaySlot(month: number, day: number, weekday: number, hour: number, minute: number): string {
  const padded = String(minute).padStart(2, "0");
  const dayName = ja.weekday[weekday] ?? "";
  return `${month}月${day}日（${dayName}）${hour}:${padded}`;
}
