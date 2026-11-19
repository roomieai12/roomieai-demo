import { ja } from "../../i18n/ja";

type Props = {
  options: string[];
  onPick: (label: string) => void;
};

export function QuickReplies({ options, onPick }: Props) {
  if (options.length === 0) return null;
  return (
    <div role="group" aria-label={ja.chat.quickReplies} className="flex flex-wrap gap-2 border-t border-navy/10 bg-white/80 px-3 py-2.5">
      {options.map((label) => (
        <button
          key={label}
          type="button"
          onClick={() => onPick(label)}
          className="rounded-full border-2 border-line bg-white px-3.5 py-1.5 text-sm font-medium text-ink transition hover:bg-line/15 active:scale-[0.97]"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
