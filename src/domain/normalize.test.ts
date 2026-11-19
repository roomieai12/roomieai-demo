import { normalizeInput } from "./normalize";
import { parseBudgetBand } from "./validation";

describe("normalizeInput", () => {
  it("converts full-width digits to half-width (６万 → 6万)", () => {
    expect(normalizeInput("６万")).toBe("6万");
  });

  it("trims and removes full-width and half-width spaces", () => {
    expect(normalizeInput("　土曜　11:00 ")).toBe("土曜11:00");
  });

  it("converts full-width Latin and lowercases", () => {
    expect(normalizeInput("ＲＯＯＭＩＥ")).toBe("roomie");
  });

  it("unifies tilde variants so typed 〜/～/~ all match a label", () => {
    expect(parseBudgetBand("～7万円")?.id).toBe("under70k");
    expect(parseBudgetBand("~7万円")?.id).toBe("under70k");
    expect(parseBudgetBand("７〜１０万円")?.id).toBe("70to100k");
  });
});
