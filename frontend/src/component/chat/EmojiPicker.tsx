import React from "react";

const EMOJIS = ["😀", "😂", "😍", "😎", "🥳", "🤝", "🙏", "🔥", "✨", "💯"];

export default function EmojiPicker({
  onSelect,
  className,
}: {
  onSelect: (emoji: string) => void;
  className?: string;
}) {
  return (
    <div
      className={
        className ??
        "absolute bottom-12 left-0 z-30 rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl p-3 shadow-lg"
      }
    >
      <div className="grid grid-cols-5 gap-2">
        {EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-xl"
            onClick={() => onSelect(e)}
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}

