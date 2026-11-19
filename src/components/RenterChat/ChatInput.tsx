import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ja } from "../../i18n/ja";

type Props = {
  onSend: (text: string) => void;
  disabled?: boolean;
};

/**
 * IME-safe input. Japanese users press Enter to confirm a 変換; that Enter must not send.
 * We guard three ways because browsers differ:
 *  - our own composition flag (compositionstart / compositionend)
 *  - KeyboardEvent.isComposing
 *  - keyCode 229 (Safari fires compositionend before the confirming keydown)
 */
export function ChatInput({ onSend, disabled = false }: Props) {
  const [value, setValue] = useState("");
  const composing = useRef(false);

  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (composing.current || event.nativeEvent.isComposing || event.keyCode === 229) return;
    submit();
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit();
  };

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-navy/10 bg-white p-2.5">
      <label className="sr-only" htmlFor="chat-input">
        {ja.a11y.messageInput}
      </label>
      <input
        id="chat-input"
        type="text"
        value={value}
        disabled={disabled}
        autoComplete="off"
        enterKeyHint="send"
        placeholder={ja.chat.placeholder}
        aria-describedby="chat-input-hint"
        onChange={(event) => setValue(event.target.value)}
        onCompositionStart={() => {
          composing.current = true;
        }}
        onCompositionEnd={() => {
          composing.current = false;
        }}
        onKeyDown={onKeyDown}
        className="min-w-0 flex-1 rounded-full border border-navy/15 bg-paper/60 px-4 py-2 text-[15px] placeholder:text-ink/40 focus:border-line focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      />
      <span id="chat-input-hint" className="sr-only">
        {ja.chat.imeHint}
      </span>
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label={ja.a11y.send}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-line text-navy transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-navy/10 disabled:text-navy/30"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="currentColor">
          <path d="M3.4 20.4 21 12 3.4 3.6l-.01 6.53L15 12 3.39 13.87z" />
        </svg>
      </button>
    </form>
  );
}
