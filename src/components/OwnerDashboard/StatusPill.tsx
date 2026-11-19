import { statusLabel } from "../../i18n/labels";
import type { LeadStatus } from "../../types";

const STYLE: Record<LeadStatus, { icon: string; className: string }> = {
  consent_pending: { icon: "○", className: "bg-navy/5 text-ink/70 border-navy/15" },
  qualifying: { icon: "…", className: "bg-sky-50 text-sky-900 border-sky-200" },
  matched: { icon: "◎", className: "bg-sky-50 text-sky-900 border-sky-200" },
  no_match: { icon: "!", className: "bg-amber/20 text-ink border-amber" },
  tentative_booked: { icon: "✓", className: "bg-line/15 text-[#03652B] border-line" },
  handed_off: { icon: "!", className: "bg-amber/20 text-ink border-amber" },
};

/** Status shows an icon and text, never color alone. */
export function StatusPill({ status }: { status: LeadStatus }) {
  const style = STYLE[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${style.className}`}
      data-testid="lead-status"
    >
      <span aria-hidden="true">{style.icon}</span>
      {statusLabel(status)}
    </span>
  );
}
