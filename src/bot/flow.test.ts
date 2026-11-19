import { unitsForScenario } from "../config/seed";
import { buildTourSlots } from "../domain/slots";
import { createLead } from "../state/initialState";
import type { BotStep } from "../types";
import { nextStep, type Conversation, type FlowContext, type FlowResult } from "./flow";

const now = new Date("2026-11-19T12:00:00+09:00");
const open: FlowContext = { open: true, now };
const closed: FlowContext = { open: false, now: new Date("2026-11-19T20:00:00+09:00") };

function start(step: BotStep = "budget", scenario: "default" | "limited" = "default"): Conversation {
  return {
    step,
    lead: { ...createLead(now.toISOString()), consentAt: now.toISOString(), status: "qualifying" },
    units: unitsForScenario(scenario),
    slots: buildTourSlots(now),
  };
}

function run(inputs: string[], ctx: FlowContext = open, conv: Conversation = start()) {
  let current = conv;
  let result: FlowResult | null = null;
  for (const input of inputs) {
    result = nextStep(current, input, ctx);
    current = { ...current, step: result.step, lead: result.lead };
  }
  if (!result) throw new Error("no inputs");
  return { result, conv: current };
}

describe("nextStep", () => {
  it("happy path ends at 仮予約, never 予約確定", () => {
    const { result } = run(["7〜10万円", "すぐに", "飼っていない", "来店して見学", "土曜 11:00"]);
    expect(result.step).toBe("tentativeBooked");
    expect(result.lead.status).toBe("tentative_booked");
    expect(result.lead.matchedUnitId).toBe("B");
    expect(result.lead.tourMethod).toBe("visitOffice");
    expect(result.lead.tourSlotId).toBe("sat-11");
    const text = result.replies[0]?.text ?? "";
    expect(text).toContain("仮予約を承りました");
    expect(text).toContain("サンプルコート 304号室");
    expect(text).not.toContain("予約確定");
    expect(result.replies[0]?.quickReplies).toEqual(["変更する", "質問する"]);
  });

  it("shows the matched unit with total rent and 礼金・敷金 before the tour question", () => {
    const { result } = run(["7〜10万円", "すぐに", "飼っていない"]);
    expect(result.step).toBe("tourMethod");
    expect(result.replies[0]?.text).toContain("86,000円");
    expect(result.replies[0]?.text).toContain("礼金1ヶ月");
    expect(result.replies[0]?.text).toContain("担当者が確認");
  });

  it("pets with no matching unit hands off as no_match", () => {
    const { result } = run(["〜7万円", "1ヶ月以内", "飼っている"]);
    expect(result.step).toBe("handoff");
    expect(result.lead.status).toBe("no_match");
    expect(result.handoff).toEqual({ reasonKey: "no_match", priority: "normal" });
    expect(result.replies[0]?.text).toContain("担当者におつなぎします");
  });

  it("legal keyword at any step hands off with normal priority", () => {
    const { result } = run(["7〜10万円", "弁護士に相談したい"]);
    expect(result.step).toBe("handoff");
    expect(result.handoff).toEqual({ reasonKey: "legal", priority: "normal" });
  });

  it("fair-housing question hands off with high priority and does not answer it", () => {
    const { result } = run(["外国人は入居できますか"]);
    expect(result.handoff).toEqual({ reasonKey: "fair-housing", priority: "high" });
    const text = result.replies[0]?.text ?? "";
    expect(text).toContain("担当者からご案内");
    expect(text).not.toMatch(/できます。|できません/);
  });

  it("outside business hours, booking says staff confirms on the next business day", () => {
    const { result } = run(["7〜10万円", "すぐに", "飼っていない", "現地で待ち合わせ", "土曜 14:00"], closed);
    expect(result.step).toBe("tentativeBooked");
    expect(result.replies[0]?.text).toContain("翌営業日");
    expect(result.replies[0]?.text).toContain("11月20日（金）9:00");
  });

  it("re-prompts on unrecognised input without changing step", () => {
    const { result } = run(["よろしく"]);
    expect(result.step).toBe("budget");
    expect(result.replies).toHaveLength(2);
    expect(result.replies[1]?.quickReplies).toEqual(["〜7万円", "7〜10万円", "10万円以上"]);
  });

  it("変更する after booking returns to slot selection", () => {
    const { result } = run(["7〜10万円", "すぐに", "飼っていない", "来店して見学", "土曜 11:00", "変更する"]);
    expect(result.step).toBe("slot");
    expect(result.lead.tourSlotId).toBeNull();
    expect(result.lead.status).toBe("matched");
  });

  it("質問する after booking hands off as a question", () => {
    const { result } = run(["7〜10万円", "すぐに", "飼っていない", "来店して見学", "土曜 11:00", "質問する"]);
    expect(result.step).toBe("handoff");
    expect(result.handoff?.reasonKey).toBe("question");
  });

  it("limited scenario: a mid budget has no match", () => {
    const { result } = run(["7〜10万円", "すぐに", "飼っていない"], open, start("budget", "limited"));
    expect(result.lead.status).toBe("no_match");
  });
});
