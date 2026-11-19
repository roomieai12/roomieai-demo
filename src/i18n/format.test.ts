import { formatDateJst, formatInitialCosts, formatManYen, formatYen } from "./format";

describe("format", () => {
  it("formats integer yen", () => {
    expect(formatYen(86_000)).toBe("86,000円");
  });

  it("formats 万円 for display", () => {
    expect(formatManYen(70_000)).toBe("7万円");
    expect(formatManYen(65_000)).toBe("6.5万円");
  });

  it("formats initial costs in months", () => {
    expect(formatInitialCosts(1, 1)).toBe("礼金1ヶ月・敷金1ヶ月");
    expect(formatInitialCosts(0, 2)).toBe("礼金なし・敷金2ヶ月");
  });

  it("formats dates in JST regardless of device time zone", () => {
    expect(formatDateJst("2026-11-21T02:00:00Z")).toBe("2026年11月21日（土）11:00");
  });
});
