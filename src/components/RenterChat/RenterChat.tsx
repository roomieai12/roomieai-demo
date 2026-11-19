import { useEffect, useRef } from "react";
import { nextOpen } from "../../domain/businessHours";
import { fill, formatOpenPoint } from "../../i18n/format";
import { ja } from "../../i18n/ja";
import { useApp } from "../../state/AppContext";
import { ConsentGate } from "../ConsentGate/ConsentGate";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";
import { QuickReplies } from "./QuickReplies";

/** Phone-style renter chat. The chat style is an internal mockup, not a LINE product. */
export function RenterChat() {
  const { state, actions } = useApp();
  const endRef = useRef<HTMLDivElement>(null);
  const open = state.businessHoursMode === "open";
  const inConsent = state.step === "consent";
  const declined = state.step === "declined";

  const last = state.messages[state.messages.length - 1];
  const quickReplies = last && last.from === "bot" && last.quickReplies ? last.quickReplies : [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [state.messages.length]);

  return (
    <div
      aria-label={ja.a11y.phone}
      role="region"
      className="mx-auto flex h-[calc(100dvh-11rem)] max-h-[760px] min-h-[520px] w-full max-w-[380px] flex-col overflow-hidden rounded-[2rem] border-[6px] border-navy bg-navy shadow-phone"
    >
      <div className="flex items-center gap-3 bg-navy px-4 pb-3 pt-2 text-white">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold">{ja.chat.company}</p>
          <p className="flex items-center gap-1.5 text-[11px] text-white/75">
            <span
              aria-hidden="true"
              className={`inline-block h-2 w-2 rounded-full ${open ? "bg-line" : "bg-amber"}`}
            />
            {fill(ja.chat.headerStatus, {
              assistant: ja.chat.assistant,
              status: open ? ja.chat.statusOpen : ja.chat.statusClosed,
            })}
          </p>
        </div>
      </div>

      <div className="chat-bg relative flex min-h-0 flex-1 flex-col rounded-t-[1.4rem]">
        {!open && !inConsent && (
          <p role="status" className="mx-3 mt-3 rounded-xl bg-amber/25 px-3 py-2 text-xs leading-relaxed text-ink">
            <span aria-hidden="true">● </span>
            {fill(ja.chat.closedBanner, { nextOpen: formatOpenPoint(nextOpen(new Date())) })}
          </p>
        )}

        {inConsent ? (
          <ConsentGate onAccept={actions.acceptConsent} onDecline={actions.declineConsent} />
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
            <ul role="log" aria-live="polite" aria-label={ja.a11y.chatLog} className="flex flex-col gap-3">
              {state.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </ul>
            {declined && (
              <div className="mt-2 rounded-2xl bg-white p-4 text-sm leading-relaxed shadow-sm">
                <p>{ja.consent.declined}</p>
                <button
                  type="button"
                  onClick={actions.reset}
                  className="mt-3 rounded-full bg-navy px-4 py-2 text-sm font-bold text-white hover:bg-navy/90"
                >
                  {ja.consent.restart}
                </button>
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      {!inConsent && <QuickReplies options={quickReplies} onPick={actions.send} />}
      <ChatInput onSend={actions.send} disabled={inConsent || declined} />
    </div>
  );
}
