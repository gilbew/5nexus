"use client";

type ChecklistItem = {
  id: string;
  text: string;
  done: boolean;
};

export type NexusSlot = {
  id: string;
  title: string;
  note: string;
  durationSeconds: number;
  elapsedSeconds: number;
  checklist: ChecklistItem[];
};

type NexusCardProps = {
  slot: NexusSlot;
  variant: "support" | "focus";
  isActive: boolean;
  isExpanded: boolean;
  onStartPause: () => void;
  onToggleExpand: () => void;
  onToggleChecklist: (itemId: string) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
};

const formatSeconds = (value: number) => {
  const safeValue = Math.max(0, value);
  const hours = Math.floor(safeValue / 3600);
  const minutes = Math.floor((safeValue % 3600) / 60);
  const seconds = safeValue % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export function NexusCard({
  slot,
  variant,
  isActive,
  isExpanded,
  onStartPause,
  onToggleExpand,
  onToggleChecklist,
  onDragStart,
  onDragEnd,
}: NexusCardProps) {
  const remaining = Math.max(0, slot.durationSeconds - slot.elapsedSeconds);
  const completion = Math.min((slot.elapsedSeconds / slot.durationSeconds) * 100, 100);
  const isSupport = variant === "support";

  return (
    <article
      draggable={isSupport}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={[
        "group rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 backdrop-blur transition-all duration-300",
        "hover:border-zinc-700 hover:bg-zinc-900",
        isActive ? "ring-1 ring-emerald-500/70" : "",
        isSupport ? "h-full" : "h-full min-h-[480px]",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onToggleExpand}
        className="mb-4 flex w-full items-start justify-between gap-3 text-left"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            {isSupport ? "Support Pillar" : "Main Focus"}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-zinc-100">{slot.title}</h3>
          <p className="mt-1 text-sm text-zinc-400">{slot.note}</p>
        </div>
        {isSupport ? (
          <span className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-400 transition-colors group-hover:border-zinc-600 group-hover:text-zinc-300">
            Drag
          </span>
        ) : null}
      </button>

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2">
          <span className="text-xs uppercase tracking-wider text-zinc-500">Countdown</span>
          <span className="font-mono text-lg text-zinc-100">{formatSeconds(remaining)}</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-emerald-500/90 transition-all duration-500"
            style={{ width: `${completion}%` }}
          />
        </div>

        <button
          type="button"
          onClick={onStartPause}
          className={[
            "w-full rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
            isActive
              ? "border-amber-500/50 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
              : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20",
          ].join(" ")}
        >
          {isActive ? "Pause" : "Start"}
        </button>
      </div>

      {isExpanded ? (
        <div className="mt-4 space-y-2 rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
          <p className="text-xs uppercase tracking-wider text-zinc-500">
            Checklist ({slot.checklist.length}/5)
          </p>
          {slot.checklist.map((item) => (
            <label
              key={item.id}
              className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm text-zinc-300 transition-colors hover:bg-zinc-800/40"
            >
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => onToggleChecklist(item.id)}
                className="h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-emerald-500 focus:ring-emerald-400"
              />
              <span className={item.done ? "text-zinc-500 line-through" : ""}>{item.text}</span>
            </label>
          ))}
        </div>
      ) : null}
    </article>
  );
}
