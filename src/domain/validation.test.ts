import { ja } from "../i18n/ja";
import { buildTourSlots } from "./slots";
import { parseBudgetBand, parseMoveIn, parsePets, parseTourMethod, parseTourSlot } from "./validation";

describe("validation parsers", () => {
  it("parses budget band labels into integer-yen limits", () => {
    expect(parseBudgetBand("〜7万円")).toMatchObject({ id: "under70k", maxTotalYen: 70_000 });
    expect(parseBudgetBand("7〜10万円")).toMatchObject({ id: "70to100k", maxTotalYen: 100_000 });
    expect(parseBudgetBand("10万円以上")).toMatchObject({ id: "over100k", maxTotalYen: 150_000 });
    expect(parseBudgetBand("安いところ")).toBeNull();
  });

  it("parses move-in labels", () => {
    expect(parseMoveIn("すぐに")).toBe("immediate");
    expect(parseMoveIn("１ヶ月以内")).toBe("within1m");
    expect(parseMoveIn("2〜3ヶ月以内")).toBe("within3m");
    expect(parseMoveIn("来年")).toBeNull();
  });

  it("parses pets", () => {
    expect(parsePets(ja.options.pets.yes)).toBe(true);
    expect(parsePets(ja.options.pets.no)).toBe(false);
    expect(parsePets("猫")).toBeNull();
  });

  it("parses tour method", () => {
    expect(parseTourMethod("現地で待ち合わせ")).toBe("meetOnSite");
    expect(parseTourMethod("来店して見学")).toBe("visitOffice");
    expect(parseTourMethod("オンライン")).toBeNull();
  });

  it("parses tour slots by label, including full-width input", () => {
    const slots = buildTourSlots(new Date("2026-11-19T03:00:00Z"));
    expect(parseTourSlot("土曜 11:00", slots)?.id).toBe("sat-11");
    expect(parseTourSlot("土曜　１４:００", slots)?.id).toBe("sat-14");
    expect(parseTourSlot("日曜 10:00", slots)).toBeNull();
  });
});
