import type { AppState } from "../types";

export type DerivedStats = {
  inquiries: number;
  tentativeBookings: number;
  handoffs: number;
  botReplies: number;
};

export function deriveStats(state: AppState): DerivedStats {
  return {
    inquiries: state.lead.consentAt ? 1 : 0,
    tentativeBookings: state.lead.status === "tentative_booked" ? 1 : 0,
    handoffs: state.staffQueue.length,
    botReplies: state.messages.filter((message) => message.from === "bot").length,
  };
}
