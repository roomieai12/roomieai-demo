import { loadState, saveState } from "../storage/localStore";
import { STORAGE_KEY, type AppState } from "../types";
import { deriveStats } from "./derive";
import { createInitialState } from "./initialState";
import { reducer, type Action } from "./reducer";

const t = "2026-11-19T03:00:00.000Z"; // Thu 12:00 JST

function apply(state: AppState, ...actions: Action[]): AppState {
  return actions.reduce(reducer, state);
}

const send = (text: string): Action => ({ type: "RENTER_SEND", text, now: t });

describe("reducer", () => {
  it("ignores renter input until consent is given", () => {
    const state = createInitialState(new Date(t));
    expect(apply(state, send("7〜10万円"))).toBe(state);
  });

  it("consent starts the chat with the greeting and logs the notice version", () => {
    const state = apply(createInitialState(new Date(t)), { type: "CONSENT_ACCEPT", now: t });
    expect(state.step).toBe("budget");
    expect(state.lead.consentAt).toBe(t);
    expect(state.messages[0]?.quickReplies).toEqual(["〜7万円", "7〜10万円", "10万円以上"]);
    expect(state.activity[0]?.text).toContain("利用目的");
  });

  it("decline closes the chat", () => {
    const state = apply(createInitialState(new Date(t)), { type: "CONSENT_DECLINE", now: t }, send("こんにちは"));
    expect(state.step).toBe("declined");
    expect(state.messages).toHaveLength(0);
  });

  it("updates stats and the staff queue after each step", () => {
    const base = apply(createInitialState(new Date(t)), { type: "CONSENT_ACCEPT", now: t });
    const booked = apply(base, send("7〜10万円"), send("すぐに"), send("飼っていない"), send("来店して見学"), send("土曜 11:00"));
    expect(deriveStats(booked)).toMatchObject({ inquiries: 1, tentativeBookings: 1, handoffs: 0 });

    const handed = apply(base, send("外国人は入居できますか"), send("弁護士に相談したい"));
    expect(handed.staffQueue).toHaveLength(1);
    expect(handed.staffQueue[0]?.priority).toBe("high"); // high is not downgraded
  });

  it("business-hours toggle is logged and kept across scenario switches", () => {
    const state = apply(
      createInitialState(new Date(t)),
      { type: "SET_HOURS", mode: "closed", now: t },
      { type: "SET_SCENARIO", scenarioId: "limited", now: t },
    );
    expect(state.businessHoursMode).toBe("closed");
    expect(state.units.map((unit) => unit.id)).toEqual(["C"]);
    expect(state.step).toBe("consent");
  });

  it("reset returns to the consent gate", () => {
    const state = apply(createInitialState(new Date(t)), { type: "CONSENT_ACCEPT", now: t }, send("7〜10万円"), { type: "RESET", now: t });
    expect(state.step).toBe("consent");
    expect(state.messages).toHaveLength(0);
    expect(state.activity).toHaveLength(0);
  });
});

describe("storage", () => {
  it("round-trips state through localStorage", () => {
    const state = apply(createInitialState(new Date(t)), { type: "CONSENT_ACCEPT", now: t }, send("7〜10万円"));
    saveState(state);
    const loaded = loadState(new Date(t));
    expect(loaded.step).toBe("moveIn");
    expect(loaded.lead.budget?.id).toBe("70to100k");
    expect(loaded.messages).toHaveLength(state.messages.length);
  });

  it("discards corrupt or old-schema data", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 0 }));
    expect(loadState(new Date(t)).step).toBe("consent");
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    localStorage.setItem(STORAGE_KEY, "{not json");
    expect(loadState(new Date(t)).step).toBe("consent");
  });

  it("does not throw when storage is unavailable", () => {
    const broken = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    } as unknown as Storage;
    expect(() => saveState(createInitialState(new Date(t)), broken)).not.toThrow();
    expect(loadState(new Date(t), broken).step).toBe("consent");
  });
});
