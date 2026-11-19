import type { ReactNode } from "react";
import { totalRentYen } from "../../domain/matching";
import { formatDateJst, formatInitialCosts, formatYen } from "../../i18n/format";
import { ja } from "../../i18n/ja";
import { moveInLabel, petsLabel, tourMethodLabel } from "../../i18n/labels";
import { useApp } from "../../state/AppContext";
import { StatusPill } from "./StatusPill";

export function LeadCard() {
  const { state } = useApp();
  const { lead } = state;
  const t = ja.dashboard.lead;
  const unit = state.units.find((item) => item.id === lead.matchedUnitId) ?? null;
  const slot = state.slots.find((item) => item.id === lead.tourSlotId) ?? null;
  const empty = <span className="text-ink/40">{t.empty}</span>;

  return (
    <section className="card p-5" aria-labelledby="lead-title">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 id="lead-title" className="card-title">
          {t.title}
        </h3>
        <StatusPill status={lead.status} />
      </div>
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
        <Row label={t.leadId}>
          <span className="font-mono text-xs text-ink/70">{lead.id.slice(5, 13)}</span>
        </Row>
        <Row label={t.consentAt}>{lead.consentAt ? formatDateJst(lead.consentAt) : <span className="text-ink/40">{t.notConsented}</span>}</Row>
        <Row label={t.budget}>{lead.budget ? lead.budget.label : empty}</Row>
        <Row label={t.moveIn}>{lead.moveIn ? moveInLabel(lead.moveIn) : empty}</Row>
        <Row label={t.pets}>{lead.hasPets === null ? empty : petsLabel(lead.hasPets)}</Row>
        <Row label={t.unit}>{unit ? unit.name : empty}</Row>
        <Row label={t.total}>
          {unit ? (
            <span>
              <strong className="text-base text-navy" data-testid="lead-total">
                {formatYen(totalRentYen(unit))}
              </strong>
              <span className="ml-1.5 text-xs text-ink/60">{t.totalHint}</span>
            </span>
          ) : (
            empty
          )}
        </Row>
        <Row label={t.initial}>
          {unit ? formatInitialCosts(unit.keyMoneyMonths, unit.depositMonths) : empty}
        </Row>
        <Row label={t.method}>{lead.tourMethod ? tourMethodLabel(lead.tourMethod) : empty}</Row>
        <Row label={t.when}>{slot ? formatDateJst(slot.startsAt) : empty}</Row>
      </dl>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="whitespace-nowrap text-ink/60">{label}</dt>
      <dd className="min-w-0 font-medium">{children}</dd>
    </>
  );
}
