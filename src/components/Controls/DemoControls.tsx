import { ja } from "../../i18n/ja";
import { scenarioLabel } from "../../i18n/labels";
import { useApp } from "../../state/AppContext";
import type { BusinessHoursMode, ScenarioId } from "../../types";

const SCENARIOS: ScenarioId[] = ["default", "limited"];
const MODES: BusinessHoursMode[] = ["open", "closed"];

export function DemoControls() {
  const { state, actions } = useApp();
  const t = ja.controls;

  return (
    <div role="group" aria-label={t.title} className="flex flex-wrap items-center gap-2 text-sm">
      <label className="flex items-center gap-1.5">
        <span className="sr-only">{t.scenario}</span>
        <span aria-hidden="true" className="hidden text-xs text-white/70 md:inline">
          {t.scenario}
        </span>
        <select
          value={state.scenarioId}
          onChange={(event) => actions.setScenario(event.target.value as ScenarioId)}
          title={t.scenarioHint}
          className="rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-sm text-white focus:bg-navy"
        >
          {SCENARIOS.map((id) => (
            <option key={id} value={id} className="text-ink">
              {scenarioLabel(id)}
            </option>
          ))}
        </select>
      </label>

      <div role="radiogroup" aria-label={t.hoursGroup} className="flex rounded-lg bg-white/10 p-0.5">
        {MODES.map((mode) => {
          const selected = state.businessHoursMode === mode;
          return (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => actions.setHours(mode)}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold transition ${
                selected ? "bg-white text-navy" : "text-white/75 hover:text-white"
              }`}
            >
              <span aria-hidden="true">{mode === "open" ? "☀" : "☾"}</span>
              {mode === "open" ? t.hoursOpen : t.hoursClosed}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={actions.reset}
        className="flex items-center gap-1 rounded-lg border border-amber/70 px-3 py-1.5 text-xs font-bold text-amber transition hover:bg-amber hover:text-navy"
      >
        <span aria-hidden="true">↺</span>
        {t.reset}
      </button>
    </div>
  );
}
