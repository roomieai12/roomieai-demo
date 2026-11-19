import { isOpen, nextOpen } from "./businessHours";
import { buildTourSlots } from "./slots";

// 2026-11-19 is a Thursday. JST = UTC+9.
const jst = (iso: string) => new Date(`${iso}+09:00`);

describe("isOpen (Asia/Tokyo)", () => {
  it("is open at 9:00 exactly", () => {
    expect(isOpen(jst("2026-11-19T09:00:00"))).toBe(true);
  });

  it("is closed at 8:59", () => {
    expect(isOpen(jst("2026-11-19T08:59:00"))).toBe(false);
  });

  it("is closed at 18:00 exactly", () => {
    expect(isOpen(jst("2026-11-19T18:00:00"))).toBe(false);
    expect(isOpen(jst("2026-11-19T17:59:00"))).toBe(true);
  });

  it("is closed on Saturday and Sunday", () => {
    expect(isOpen(jst("2026-11-21T11:00:00"))).toBe(false);
    expect(isOpen(jst("2026-11-22T11:00:00"))).toBe(false);
  });

  it("uses JST even when the UTC date is different", () => {
    // Fri 2026-11-20 08:30 JST is still Thursday 23:30 in UTC.
    expect(isOpen(new Date("2026-11-19T23:30:00Z"))).toBe(false);
    // Fri 10:00 JST = Fri 01:00 UTC.
    expect(isOpen(new Date("2026-11-20T01:00:00Z"))).toBe(true);
  });
});

describe("nextOpen", () => {
  it("returns next weekday 9:00 after closing time", () => {
    expect(nextOpen(jst("2026-11-19T19:00:00"))).toMatchObject({ month: 11, day: 20, hour: 9, weekday: 5 });
  });

  it("skips the weekend from Friday evening to Monday", () => {
    expect(nextOpen(jst("2026-11-20T18:30:00"))).toMatchObject({ month: 11, day: 23, weekday: 1 });
  });

  it("returns today 9:00 before opening", () => {
    expect(nextOpen(jst("2026-11-19T07:00:00"))).toMatchObject({ day: 19, hour: 9 });
  });
});

describe("buildTourSlots", () => {
  it("labels the next business day evening as 明日 when tomorrow is a weekday", () => {
    const slots = buildTourSlots(jst("2026-11-19T12:00:00"));
    expect(slots.map((slot) => slot.label)).toEqual(["明日 17:00", "土曜 11:00", "土曜 14:00"]);
    expect(slots[0]?.startsAt).toBe("2026-11-20T17:00:00+09:00");
    expect(slots[1]?.startsAt).toBe("2026-11-21T11:00:00+09:00");
  });

  it("uses a dated label when the next business day is not tomorrow", () => {
    const slots = buildTourSlots(jst("2026-11-20T12:00:00")); // Friday → Monday
    expect(slots[0]?.label).toBe("11月23日（月）17:00");
  });
});
