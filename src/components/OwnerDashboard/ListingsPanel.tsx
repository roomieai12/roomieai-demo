import type { ReactNode } from "react";
import { totalRentYen } from "../../domain/matching";
import { fill, formatDateOnly, formatInitialCosts, formatManYen, formatRentBreakdown, formatYen } from "../../i18n/format";
import { ja } from "../../i18n/ja";
import { useApp } from "../../state/AppContext";

export function ListingsPanel() {
  const { state } = useApp();
  const t = ja.dashboard.listings;

  return (
    <section className="card p-5" aria-labelledby="listings-title">
      <h3 id="listings-title" className="card-title mb-3">
        {t.title}
      </h3>
      <ul className="flex flex-col gap-3">
        {state.units.map((unit) => {
          const guided = unit.id === state.lead.matchedUnitId;
          const total = totalRentYen(unit);
          return (
            <li
              key={unit.id}
              className={`rounded-xl border p-3.5 transition ${guided ? "border-line bg-line/5 ring-2 ring-line/30" : "border-navy/10"}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-navy px-1.5 py-0.5 text-[10px] font-bold text-white">{t.sample}</span>
                <p className="font-bold text-navy">{unit.name}</p>
                <span
                  className={`ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                    guided ? "bg-line text-navy" : unit.available ? "bg-navy/5 text-ink/70" : "bg-ink/10 text-ink/50"
                  }`}
                >
                  <span aria-hidden="true">{guided ? "◎" : unit.available ? "○" : "×"}</span>
                  {guided ? t.guided : unit.available ? t.listed : t.unavailable}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
                <span className="text-ink/70">{fill(t.planArea, { plan: unit.floorPlan, area: unit.areaSqm })}</span>
                <span>
                  <span className="text-ink/60">{t.total} </span>
                  <strong className="text-navy">{formatYen(total)}</strong>
                  <span className="ml-1 text-xs text-ink/55">
                    {formatRentBreakdown(unit.rentYen, unit.managementFeeYen)}
                  </span>
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                <Tag>{fill(ja.money.band, { man: formatManYen(total) })}</Tag>
                <Tag>{formatInitialCosts(unit.keyMoneyMonths, unit.depositMonths)}</Tag>
                <Tag strong={unit.petsAllowed}>
                  <span aria-hidden="true">{unit.petsAllowed ? "✓ " : "× "}</span>
                  {unit.petsAllowed ? t.petsOk : t.petsNo}
                </Tag>
                <Tag>{fill(ja.money.availableFrom, { date: formatDateOnly(unit.availableFrom) })}</Tag>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Tag({ children, strong = false }: { children: ReactNode; strong?: boolean }) {
  return (
    <span className={`rounded-md px-2 py-0.5 ${strong ? "bg-line/15 text-[#03652B]" : "bg-paper text-ink/75"}`}>
      {children}
    </span>
  );
}
