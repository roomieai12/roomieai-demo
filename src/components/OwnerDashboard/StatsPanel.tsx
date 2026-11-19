import { ja } from "../../i18n/ja";
import { useApp } from "../../state/AppContext";
import { deriveStats } from "../../state/derive";

export function StatsPanel() {
  const { state } = useApp();
  const stats = deriveStats(state);
  const tiles = [
    { key: "inquiries", label: ja.dashboard.stats.inquiries, value: stats.inquiries, accent: "bg-navy" },
    { key: "tentative", label: ja.dashboard.stats.tentative, value: stats.tentativeBookings, accent: "bg-line" },
    { key: "handoff", label: ja.dashboard.stats.handoff, value: stats.handoffs, accent: "bg-amber" },
    { key: "answers", label: ja.dashboard.stats.answers, value: stats.botReplies, accent: "bg-navy/30" },
  ];
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {tiles.map((tile) => (
        <li key={tile.key} className="card relative overflow-hidden p-4">
          <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${tile.accent}`} />
          <p className="text-xs font-medium text-ink/65">{tile.label}</p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-navy" data-testid={`stat-${tile.key}`}>
            {tile.value}
          </p>
        </li>
      ))}
    </ul>
  );
}
