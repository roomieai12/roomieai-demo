import { fill, formatTimeJst } from "../../i18n/format";
import { ja } from "../../i18n/ja";
import type { ChatMessage } from "../../types";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const time = formatTimeJst(message.createdAt);

  if (message.from === "system") {
    return (
      <li className="msg-in flex justify-center">
        <span className="bubble-text rounded-full bg-navy/10 px-3 py-1 text-xs text-ink/70">{message.text}</span>
      </li>
    );
  }

  if (message.from === "renter") {
    return (
      <li className="msg-in flex items-end justify-end gap-1.5">
        <time className="mb-0.5 shrink-0 text-[10px] text-ink/50" dateTime={message.createdAt}>
          <span className="sr-only">{ja.chat.sentAt}</span>
          {time}
        </time>
        <p className="bubble-text max-w-[78%] rounded-2xl rounded-br-md bg-[#B8EFCB] px-3.5 py-2 text-[15px] text-ink shadow-sm">
          <span className="sr-only">{fill(ja.chat.speaker, { name: ja.chat.you })}</span>
          {message.text}
        </p>
      </li>
    );
  }

  const name = message.from === "staff" ? ja.chat.staff : ja.chat.bot;
  return (
    <li className="msg-in flex items-start gap-2">
      <Avatar />
      <div className="min-w-0 max-w-[80%]">
        <div className="mb-0.5 flex items-center gap-1.5 text-[11px] text-ink/60">
          <span>{name}</span>
          <span className="rounded bg-white/70 px-1 text-[10px]">{ja.chat.demoReply}</span>
        </div>
        <div className="flex items-end gap-1.5">
          <p className="bubble-text rounded-2xl rounded-tl-md bg-white px-3.5 py-2 text-[15px] text-ink shadow-sm">
            <span className="sr-only">{fill(ja.chat.speaker, { name })}</span>
            {message.text}
          </p>
          <time className="mb-0.5 shrink-0 text-[10px] text-ink/50" dateTime={message.createdAt}>
            <span className="sr-only">{ja.chat.sentAt}</span>
            {time}
          </time>
        </div>
      </div>
    </li>
  );
}

function Avatar() {
  return (
    <span aria-hidden="true" className="mt-4 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy">
      <svg viewBox="0 0 32 32" className="h-5 w-5">
        <path d="M6 15 L16 7 L26 15 V16 H6 Z" fill="#06C755" />
        <rect x="8" y="16" width="16" height="9" rx="1" fill="#F2B705" />
      </svg>
    </span>
  );
}
