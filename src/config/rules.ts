import type { HandoffReasonKey, Priority } from "../types";

export type BusinessHours = {
  startHour: number;
  endHour: number;
  days: readonly number[];
};

/** Monday–Friday, 9:00 inclusive, 18:00 exclusive. Interpreted in Asia/Tokyo. */
export const BUSINESS_HOURS: BusinessHours = {
  startHour: 9,
  endHour: 18,
  days: [1, 2, 3, 4, 5],
};

/**
 * Non-overlapping totals (家賃 + 管理費), in integer yen.
 * 〜7万円 includes the 70,000円 sample. 7〜10万円 starts above that,
 * so the acceptance path resolves to the 86,000円 sample. 10万円以上
 * is the band above 100,000円, up to 150,000円.
 */
export const BUDGET_LIMITS = {
  under70k: { minTotalYen: 0, maxTotalYen: 70_000 },
  "70to100k": { minTotalYen: 70_001, maxTotalYen: 100_000 },
  over100k: { minTotalYen: 100_001, maxTotalYen: 150_000 },
} as const;

export type HandoffKeywordGroup = {
  reasonKey: Exclude<HandoffReasonKey, "no_match" | "question">;
  priority: Priority;
  keywords: readonly string[];
};

/** Fair-housing is first so a mixed message stays high priority. */
export const HANDOFF_KEYWORD_GROUPS: readonly HandoffKeywordGroup[] = [
  {
    reasonKey: "fair-housing",
    priority: "high",
    keywords: ["差別", "外国人お断り", "国籍", "生活保護", "外国人"],
  },
  {
    reasonKey: "legal",
    priority: "normal",
    keywords: ["弁護士", "訴える", "裁判", "消費者センター"],
  },
  {
    reasonKey: "deposit",
    priority: "normal",
    keywords: ["敷金", "返金", "退去費用", "原状回復"],
  },
  {
    reasonKey: "contract",
    priority: "normal",
    keywords: ["契約", "解約", "更新", "違約金", "重要事項説明", "審査"],
  },
  {
    reasonKey: "complaint",
    priority: "normal",
    keywords: ["騒音", "トラブル", "事故物件", "近隣"],
  },
];
