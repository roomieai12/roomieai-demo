import { fill, formatActivityTime } from "../../i18n/format";
import { ja } from "../../i18n/ja";
import { priorityLabel, reasonLabel } from "../../i18n/labels";
import { useApp } from "../../state/AppContext";

export function StaffQueue() {
  const { state } = useApp();
  const t = ja.dashboard.queue;
  const items = [...state.staffQueue].sort((a, b) => (a.priority === b.priority ? 0 : a.priority === "high" ? -1 : 1));

  return (
    <section className="card p-5" aria-labelledby="queue-title">
      <h3 id="queue-title" className="card-title mb-3">
        {t.title}
        <span className="rounded-full bg-navy/10 px-2 text-xs tabular-nums">{items.length}</span>
      </h3>
      {items.length === 0 ? (
        <p className="rounded-xl bg-paper/60 p-4 text-center text-sm text-ink/55">{t.empty}</p>
      ) : (
        <ul className="flex flex-col gap-2" data-testid="staff-queue">
          {items.map((item) => {
            const high = item.priority === "high";
            return (
              <li
                key={`${item.leadId}-${item.at}`}
                className={`rounded-xl border-l-4 p-3 ${high ? "border-red-600 bg-red-50" : "border-amber bg-amber/10"}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm">
                    <span className="text-ink/60">{t.reason}</span>
                    <strong data-testid="queue-reason">{reasonLabel(item.reasonKey)}</strong>
                  </p>
                  <span
                    data-testid="queue-priority"
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                      high ? "bg-red-600 text-white" : "bg-white text-ink"
                    }`}
                  >
                    <span aria-hidden="true">{high ? "▲" : "●"}</span>
                    {fill(t.priorityLine, { label: priorityLabel(item.priority) })}
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink/60">
                  {fill(t.meta, { time: formatActivityTime(item.at), id: item.leadId.slice(5, 13) })}
                </p>
                {high && <p className="mt-1.5 text-xs font-medium text-red-800">{t.highNote}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
