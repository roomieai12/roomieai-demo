import { formatActivityTime } from "../../i18n/format";
import { ja } from "../../i18n/ja";
import { useApp } from "../../state/AppContext";

export function ActivityLog() {
  const { state } = useApp();
  const t = ja.dashboard.log;
  const events = [...state.activity].reverse();

  return (
    <section className="card flex max-h-[460px] flex-col p-5" aria-labelledby="log-title">
      <h3 id="log-title" className="card-title mb-3">
        {t.title}
      </h3>
      {events.length === 0 ? (
        <p className="rounded-xl bg-paper/60 p-4 text-center text-sm text-ink/55">{t.empty}</p>
      ) : (
        <ol className="-mr-2 flex-1 overflow-y-auto pr-2" data-testid="activity-log">
          {events.map((event, index) => (
            <li key={event.id} className="relative flex gap-3 pb-3 pl-4 text-sm">
              <span
                aria-hidden="true"
                className={`absolute left-0 top-2 h-2 w-2 rounded-full ${index === 0 ? "bg-line" : "bg-navy/25"}`}
              />
              <time dateTime={event.at} className="w-[4.5rem] shrink-0 tabular-nums text-xs leading-6 text-ink/55">
                {formatActivityTime(event.at)}
              </time>
              <span className="min-w-0 break-words">{event.text}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
