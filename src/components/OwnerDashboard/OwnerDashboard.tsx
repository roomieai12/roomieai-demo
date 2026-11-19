import { ja } from "../../i18n/ja";
import { ActivityLog } from "./ActivityLog";
import { LeadCard } from "./LeadCard";
import { ListingsPanel } from "./ListingsPanel";
import { StaffQueue } from "./StaffQueue";
import { StatsPanel } from "./StatsPanel";

export function OwnerDashboard() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-navy">{ja.dashboard.title}</h2>
        <p className="mt-1 text-xs leading-relaxed text-ink/65">{ja.dashboard.note}</p>
      </div>
      <StatsPanel />
      <div className="grid gap-5 xl:grid-cols-2">
        <LeadCard />
        <StaffQueue />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <ListingsPanel />
        <ActivityLog />
      </div>
    </div>
  );
}
