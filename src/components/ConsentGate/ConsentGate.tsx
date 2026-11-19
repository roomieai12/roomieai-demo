import { useId, useState } from "react";
import { PRIVACY_NOTICE_VERSION } from "../../config/privacy";
import { ja } from "../../i18n/ja";

type Props = {
  onAccept: () => void;
  onDecline: () => void;
};

/** Blocks the chat until the renter explicitly agrees to the 利用目的 (APPI). */
export function ConsentGate({ onAccept, onDecline }: Props) {
  const [checked, setChecked] = useState(false);
  const [showPurpose, setShowPurpose] = useState(false);
  const purposeId = useId();
  const checkboxId = useId();

  return (
    <div role="dialog" aria-modal="false" aria-labelledby="consent-title" className="flex h-full flex-col overflow-y-auto p-4">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 id="consent-title" className="mb-2 flex items-center gap-2 text-base font-bold text-navy">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-line" fill="currentColor" aria-hidden="true">
            <path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3zm-1.2 14.2-3.5-3.5 1.4-1.4 2.1 2.1 4.8-4.8 1.4 1.4-6.2 6.2z" />
          </svg>
          {ja.consent.title}
        </h2>
        <p className="text-[15px] leading-relaxed">{ja.consent.intro}</p>

        <button
          type="button"
          aria-expanded={showPurpose}
          aria-controls={purposeId}
          onClick={() => setShowPurpose((open) => !open)}
          className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-navy underline decoration-line decoration-2 underline-offset-4"
        >
          {showPurpose ? ja.consent.hidePurpose : ja.consent.viewPurpose}
          <span aria-hidden="true">{showPurpose ? "▲" : "▼"}</span>
        </button>

        <div id={purposeId} hidden={!showPurpose} className="mt-3 rounded-xl bg-paper/70 p-3">
          <h3 className="mb-1.5 text-sm font-bold text-navy">
            {ja.consent.purposeTitle}
            <span className="ml-2 text-xs font-normal text-ink/60">v{PRIVACY_NOTICE_VERSION}</span>
          </h3>
          <ol className="list-decimal space-y-1.5 pl-5 text-[13px] leading-relaxed text-ink/85">
            {ja.privacy.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
        </div>

        <label htmlFor={checkboxId} className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-xl border border-navy/15 p-3">
          <input
            id={checkboxId}
            type="checkbox"
            checked={checked}
            onChange={(event) => setChecked(event.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-[#06C755]"
          />
          <span className="text-sm font-medium">{ja.consent.checkbox}</span>
        </label>

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            disabled={!checked}
            onClick={onAccept}
            aria-describedby={checked ? undefined : `${checkboxId}-hint`}
            className="rounded-full bg-line px-4 py-2.5 text-sm font-bold text-navy transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-navy/10 disabled:text-navy/40"
          >
            {ja.consent.start}
          </button>
          {!checked && (
            <p id={`${checkboxId}-hint`} className="text-center text-xs text-ink/60">
              {ja.consent.checkboxHint}
            </p>
          )}
          <button
            type="button"
            onClick={onDecline}
            className="rounded-full px-4 py-2 text-sm text-ink/70 underline-offset-4 hover:underline"
          >
            {ja.consent.decline}
          </button>
        </div>
      </div>
    </div>
  );
}
