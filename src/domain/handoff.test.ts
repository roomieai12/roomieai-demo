import { shouldHandoff } from "./handoff";

describe("shouldHandoff", () => {
  it("flags legal keywords as normal priority", () => {
    expect(shouldHandoff("弁護士に相談したい")).toEqual({ reasonKey: "legal", priority: "normal" });
  });

  it("flags fair-housing keywords as high priority", () => {
    expect(shouldHandoff("外国人は入居できますか")).toEqual({ reasonKey: "fair-housing", priority: "high" });
    expect(shouldHandoff("生活保護を受けています")?.priority).toBe("high");
  });

  it("keeps high priority when a message mixes topics", () => {
    expect(shouldHandoff("国籍で断られたので弁護士に相談します")?.reasonKey).toBe("fair-housing");
  });

  it("detects deposit, contract, and complaint topics", () => {
    expect(shouldHandoff("敷金は返ってきますか")?.reasonKey).toBe("deposit");
    expect(shouldHandoff("契約の更新について")?.reasonKey).toBe("contract");
    expect(shouldHandoff("隣の騒音がひどい")?.reasonKey).toBe("complaint");
  });

  it("matches substrings after NFKC normalization (no word boundaries in Japanese)", () => {
    expect(shouldHandoff("　ベンゴシ？いえ、弁護士　です")?.reasonKey).toBe("legal");
  });

  it("ignores normal answers", () => {
    expect(shouldHandoff("7〜10万円")).toBeNull();
    expect(shouldHandoff("")).toBeNull();
  });
});
