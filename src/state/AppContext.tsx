import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { loadState, saveState } from "../storage/localStore";
import type { AppState, BusinessHoursMode, ScenarioId } from "../types";
import { reducer } from "./reducer";

type Actions = {
  acceptConsent: () => void;
  declineConsent: () => void;
  send: (text: string) => void;
  setScenario: (id: ScenarioId) => void;
  setHours: (mode: BusinessHoursMode) => void;
  reset: () => void;
};

type AppContextValue = { state: AppState; actions: Actions };

const AppContext = createContext<AppContextValue | null>(null);

const nowIso = () => new Date().toISOString();

export function AppProvider({ children, storage }: { children: ReactNode; storage?: Storage }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => loadState(new Date(), storage));

  useEffect(() => {
    saveState(state, storage);
  }, [state, storage]);

  const actions = useMemo<Actions>(
    () => ({
      acceptConsent: () => dispatch({ type: "CONSENT_ACCEPT", now: nowIso() }),
      declineConsent: () => dispatch({ type: "CONSENT_DECLINE", now: nowIso() }),
      send: (text) => dispatch({ type: "RENTER_SEND", text, now: nowIso() }),
      setScenario: (scenarioId) => dispatch({ type: "SET_SCENARIO", scenarioId, now: nowIso() }),
      setHours: (mode) => dispatch({ type: "SET_HOURS", mode, now: nowIso() }),
      reset: () => dispatch({ type: "RESET", now: nowIso() }),
    }),
    [],
  );

  const value = useMemo(() => ({ state, actions }), [state, actions]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used inside AppProvider");
  return value;
}
