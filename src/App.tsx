import { useState } from "react";
import { DemoControls } from "./components/Controls/DemoControls";
import { OwnerDashboard } from "./components/OwnerDashboard/OwnerDashboard";
import { RenterChat } from "./components/RenterChat/RenterChat";
import { ja } from "./i18n/ja";
import { useApp } from "./state/AppContext";

type Tab = "renter" | "owner";

export function App() {
  const { state } = useApp();
  const [tab, setTab] = useState<Tab>("renter");
  const queueCount = state.staffQueue.length;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-navy text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Logo />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold tracking-wide">{ja.app.name}</h1>
                <span className="rounded-full bg-amber px-2.5 py-0.5 text-xs font-bold text-navy">
                  {ja.app.badge}
                </span>
              </div>
              <p className="truncate text-xs text-white/70">{ja.app.subtitle}</p>
            </div>
          </div>
          <div className="ml-auto w-full sm:w-auto">
            <DemoControls />
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-20 border-b border-navy/10 bg-paper/95 backdrop-blur lg:hidden">
        <div role="tablist" aria-label={ja.a11y.tabs} className="mx-auto flex max-w-md gap-1 p-2">
          <TabButton id="renter" current={tab} onSelect={setTab} label={ja.tabs.renter} />
          <TabButton id="owner" current={tab} onSelect={setTab} label={ja.tabs.owner} badge={queueCount} />
        </div>
      </div>

      <main className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:py-8">
        <section
          id="panel-renter"
          role="tabpanel"
          aria-labelledby="tab-renter"
          className={`${tab === "renter" ? "block" : "hidden"} lg:block`}
        >
          <div className="lg:sticky lg:top-6">
            <RenterChat />
          </div>
        </section>
        <section
          id="panel-owner"
          role="tabpanel"
          aria-labelledby="tab-owner"
          className={`${tab === "owner" ? "block" : "hidden"} min-w-0 lg:block`}
        >
          <OwnerDashboard />
        </section>
      </main>

      <footer className="border-t border-navy/10 bg-white/60">
        <p className="mx-auto max-w-7xl px-4 py-4 text-xs leading-relaxed text-ink/70 sm:px-6">{ja.footer}</p>
      </footer>
    </div>
  );
}

function TabButton({
  id,
  current,
  onSelect,
  label,
  badge = 0,
}: {
  id: Tab;
  current: Tab;
  onSelect: (tab: Tab) => void;
  label: string;
  badge?: number;
}) {
  const selected = id === current;
  return (
    <button
      type="button"
      role="tab"
      id={`tab-${id}`}
      aria-selected={selected}
      aria-controls={`panel-${id}`}
      onClick={() => onSelect(id)}
      className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
        selected ? "bg-navy text-white shadow" : "text-navy hover:bg-navy/5"
      }`}
    >
      {label}
      {badge > 0 && (
        <span className="min-w-5 rounded-full bg-amber px-1.5 text-xs leading-5 text-navy">{badge}</span>
      )}
    </button>
  );
}

function Logo() {
  return (
    <svg viewBox="0 0 32 32" className="h-9 w-9 shrink-0" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#ffffff" fillOpacity="0.1" />
      <path d="M6 15 L16 7 L26 15 V16 H6 Z" fill="#06C755" />
      <rect x="8" y="16" width="16" height="9" rx="1" fill="#F2B705" />
      <rect x="14" y="19" width="4" height="6" fill="#0B1D33" />
    </svg>
  );
}
