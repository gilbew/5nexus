"use client";

import { useRef, useState } from "react";

export type ChecklistItem = {
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
  /** Session borrowed time via auto-borrow (show warning styling on countdown). */
  overspentAuto?: boolean;
  /** This slot’s allocation was reduced by auto-borrow feeding the runner (same alert styling). */
  donorAutoBorrow?: boolean;
};

type NexusCardProps = {
  slot: NexusSlot;
  variant: "support" | "focus";
  theme: "dark" | "light";
  /** PC/tablet landscape: show tasks between note and timer (Main Focus only). */
  wideInlineChecklist?: boolean;
  /** Narrow phone in landscape: shorten titles so the row doesn’t collide with countdown. */
  truncateTitle?: boolean;
  isActive: boolean;
  isEditing: boolean;
  canStart: boolean;
  editDraft: { title: string; note: string };
  priorityRank: number;
  onStartPause: () => void;
  onStartEdit: () => void;
  onEditDraftChange: (next: { title: string; note: string }) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onToggleChecklist: (itemId: string) => void;
  onAddChecklist: (text: string) => void;
  onUpdateChecklist: (itemId: string, text: string) => void;
  onDeleteChecklist: (itemId: string) => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  /** Parked-item drops need preventDefault on the actual element under cursor. */
  onOuterDragOver?: (e: React.DragEvent) => void;
  onOuterDrop?: (e: React.DragEvent) => void;
  /** Press-and-hold on this card as donor opens transfer dialog (not on buttons/tasks/drag). */
  onRequestTransfer?: () => void;
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

/** Clicks on interactive nodes must not toggle counter/tasks mode. */
function isInteractiveTarget(target: EventTarget | null) {
  return Boolean((target as HTMLElement | null)?.closest(
    "button, input, textarea, a, [data-no-toggle]"
  ));
}

/** In-card progress fill matches allocator segment hues by priority # (1–5). */
function priorityProgressFillClass(rank: number, isDark: boolean) {
  const light = [
    "bg-emerald-800",
    "bg-emerald-600",
    "bg-teal-700",
    "bg-emerald-500",
    "bg-green-800",
  ];
  const dark = [
    "bg-emerald-600",
    "bg-teal-500",
    "bg-cyan-400",
    "bg-lime-400",
    "bg-emerald-800",
  ];
  const i = Math.max(0, Math.min(rank - 1, 4));
  return (isDark ? dark : light)[i];
}

export function NexusCard({
  slot,
  variant,
  theme,
  wideInlineChecklist = false,
  truncateTitle = false,
  isActive,
  isEditing,
  canStart,
  editDraft,
  priorityRank,
  onStartPause,
  onStartEdit,
  onEditDraftChange,
  onSaveEdit,
  onCancelEdit,
  onToggleChecklist,
  onAddChecklist,
  onUpdateChecklist,
  onDeleteChecklist,
  onDragStart,
  onDragEnd,
  onOuterDragOver,
  onOuterDrop,
  onRequestTransfer,
}: NexusCardProps) {
  /** Parked with no slice budget but elapsed kept for “already ran today” + energy accounting. */
  const isParkedRunHold = slot.durationSeconds <= 0 && slot.elapsedSeconds > 0;
  const remaining = Math.max(0, slot.durationSeconds - slot.elapsedSeconds);
  const denom = Math.max(slot.durationSeconds, 1);
  const completion =
    slot.durationSeconds > 0
      ? Math.min((slot.elapsedSeconds / denom) * 100, 100)
      : 0;
  const isSupport = variant === "support";
  const isDark = theme === "dark";
  /** No time left / no allocation → Start disabled; shell + timer read visually “parked”. */
  const isInactiveNoTime = !isActive && !canStart && !isParkedRunHold;

  const [cardMode, setCardMode] = useState<"counter" | "tasks">("counter");
  const [tasksEdit, setTasksEdit] = useState(false);
  const [taskDraft, setTaskDraft] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState("");

  const isTasksMode = cardMode === "tasks";

  /** Long-press to open manual transfer; cancelled if user scrolls or uses controls. */
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired = useRef(false);

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleShellClick = (event: React.MouseEvent) => {
    if (isInteractiveTarget(event.target)) {
      return;
    }
    setCardMode((prev) => (prev === "counter" ? "tasks" : "counter"));
    setTasksEdit(false);
    setEditingTaskId(null);
  };

  const enterTaskRowEdit = (itemId: string, text: string) => {
    setEditingTaskId(itemId);
    setEditingTaskText(text);
  };

  // Dark: opaque surface on zinc-950 canvas; inactive = flatter/muted so “can’t run” reads at a glance.
  const borderArticle = isInactiveNoTime
    ? isDark
      ? "border-zinc-800/70 bg-zinc-950/70 hover:border-zinc-700/80 hover:bg-zinc-950/75"
      : "border-zinc-200 bg-zinc-100/85 hover:border-zinc-300 hover:bg-zinc-100"
    : isDark
      ? "border-zinc-700/75 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-900"
      : "border-zinc-300 bg-white/90 hover:border-zinc-400 hover:bg-white";

  return (
    <article
      onDragOver={(e) => {
        onOuterDragOver?.(e);
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        onOuterDrop?.(e);
      }}
      onPointerDown={(e) => {
        longPressFired.current = false;
        if (!onRequestTransfer || isEditing || e.button !== 0) {
          return;
        }
        if (isInteractiveTarget(e.target)) {
          return;
        }
        clearLongPress();
        longPressTimer.current = setTimeout(() => {
          longPressFired.current = true;
          longPressTimer.current = null;
          onRequestTransfer();
        }, 550);
      }}
      onPointerUp={clearLongPress}
      onPointerCancel={clearLongPress}
      onPointerLeave={clearLongPress}
      onClick={(e) => {
        if (longPressFired.current) {
          longPressFired.current = false;
          return;
        }
        handleShellClick(e);
      }}
      className={[
        "group flex h-auto min-h-0 w-full max-w-none flex-col rounded-xl border p-2 transition-all duration-300 sm:rounded-2xl sm:p-3.5 md:p-4",
        isDark ? "" : "backdrop-blur",
        borderArticle,
        isInactiveNoTime ? "opacity-[0.92]" : "",
        // Inset ring stays inside the card so parent overflow won’t clip the active stroke.
        isActive ? "ring-2 ring-inset ring-emerald-500/80 dark:ring-emerald-400/75" : "",
        !isSupport
          ? isInactiveNoTime
            ? "shadow-sm ring-1 ring-zinc-400/20 dark:ring-zinc-600/25"
            : "shadow-md ring-1 ring-emerald-500/15 dark:ring-emerald-400/20"
          : "",
      ].join(" ")}
    >
      {/* Support: full-width rows so Run time can align with the card’s right edge (same column as Drag). */}
      {isSupport ? (
        <div className="mb-1.5 flex w-full min-w-0 shrink-0 flex-col gap-1 text-left sm:mb-2">
          {isEditing ? (
            <div className="flex items-start justify-between gap-2">
              <div
                className="min-w-0 flex-1 space-y-1.5"
                data-no-toggle
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  value={editDraft.title}
                  onChange={(event) =>
                    onEditDraftChange({ ...editDraft, title: event.target.value })
                  }
                  className={[
                    "w-full rounded-lg border px-2 py-1 text-xs outline-none sm:text-sm",
                    isDark
                      ? "border-zinc-700 bg-zinc-950 text-zinc-100 focus:border-emerald-500"
                      : "border-zinc-300 bg-zinc-100 text-zinc-900 focus:border-emerald-500",
                  ].join(" ")}
                />
                <textarea
                  value={editDraft.note}
                  onChange={(event) =>
                    onEditDraftChange({ ...editDraft, note: event.target.value })
                  }
                  rows={2}
                  className={[
                    "w-full resize-none rounded-lg border px-2 py-1 text-xs outline-none sm:text-sm",
                    isDark
                      ? "border-zinc-700 bg-zinc-950 text-zinc-100 focus:border-emerald-500"
                      : "border-zinc-300 bg-zinc-100 text-zinc-900 focus:border-emerald-500",
                  ].join(" ")}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onSaveEdit}
                    className="rounded-md border border-emerald-500/50 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-500 sm:text-xs"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={onCancelEdit}
                    className={[
                      "rounded-md border px-2 py-0.5 text-[10px] sm:text-xs",
                      isDark
                        ? "border-zinc-700 text-zinc-300"
                        : "border-zinc-300 text-zinc-700",
                    ].join(" ")}
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <span
                data-no-toggle
                draggable
                onDragStart={(e) => {
                  e.stopPropagation();
                  onDragStart?.(e);
                }}
                onDragEnd={() => onDragEnd?.()}
                className={[
                  "shrink-0 cursor-grab rounded-md border px-1.5 py-0.5 text-[10px] active:cursor-grabbing sm:text-xs",
                  isDark
                    ? "border-zinc-700 text-zinc-400"
                    : "border-zinc-300 text-zinc-600",
                ].join(" ")}
              >
                Drag
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  data-no-toggle
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartEdit();
                  }}
                  className={[
                    "min-w-0 flex-1 text-left font-semibold transition-colors",
                    truncateTitle ? "truncate" : "",
                    "text-base leading-snug sm:text-lg md:text-xl lg:text-2xl xl:text-[1.65rem]",
                    isDark
                      ? "text-zinc-100 hover:text-emerald-300"
                      : "text-zinc-900 hover:text-emerald-700",
                  ].join(" ")}
                >
                  {slot.title}
                </button>
                <span
                  data-no-toggle
                  draggable
                  onDragStart={(e) => {
                    e.stopPropagation();
                    onDragStart?.(e);
                  }}
                  onDragEnd={() => onDragEnd?.()}
                  className={[
                    "shrink-0 cursor-grab rounded-md border px-1.5 py-0.5 text-[10px] active:cursor-grabbing sm:text-xs",
                    isDark
                      ? "border-zinc-700 text-zinc-400"
                      : "border-zinc-300 text-zinc-600",
                  ].join(" ")}
                >
                  Drag
                </span>
              </div>
              <div className="flex w-full min-w-0 items-baseline justify-between gap-2">
                <p
                  className={[
                    "min-w-0 shrink text-[10px] uppercase leading-normal tracking-[0.18em] sm:text-xs",
                    isDark ? "text-emerald-400" : "text-emerald-700",
                  ].join(" ")}
                >
                  Priority #{priorityRank}
                </p>
                {isTasksMode ? (
                  <p
                    className={[
                      "shrink-0 text-right text-[10px] font-medium tabular-nums leading-tight sm:text-[11px]",
                      isDark ? "text-emerald-300/95" : "text-emerald-800",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "mr-1 font-sans font-semibold uppercase tracking-wider",
                        isDark ? "text-zinc-400" : "text-zinc-600",
                      ].join(" ")}
                    >
                      Run time
                    </span>
                    {formatSeconds(slot.elapsedSeconds)}
                  </p>
                ) : null}
              </div>
              {!isTasksMode ? (
                <p
                  className={[
                    "mt-0 line-clamp-2 text-[11px] leading-snug sm:line-clamp-3 sm:text-sm md:text-[15px]",
                    isDark ? "text-zinc-400" : "text-zinc-600",
                  ].join(" ")}
                >
                  {slot.note}
                </p>
              ) : null}
            </>
          )}
        </div>
      ) : (
        <div className="mb-1.5 flex shrink-0 items-start justify-between gap-2 text-left sm:mb-2">
          <div className="min-w-0 flex-1 overflow-hidden">
            {!isEditing ? (
              <div className="flex items-start justify-between gap-2">
                <p
                  className={[
                    "text-[10px] font-semibold uppercase tracking-[0.2em] sm:text-[11px]",
                    isDark ? "text-zinc-500" : "text-zinc-600",
                  ].join(" ")}
                >
                  Main Focus
                </p>
                {isTasksMode || (wideInlineChecklist && !isTasksMode) ? (
                  <p
                    className={[
                      "shrink-0 text-right text-[10px] font-medium tabular-nums leading-tight sm:text-[11px]",
                      isDark ? "text-emerald-300/95" : "text-emerald-800",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "mr-1 font-sans font-semibold uppercase tracking-wider",
                        isDark ? "text-zinc-400" : "text-zinc-600",
                      ].join(" ")}
                    >
                      Run time
                    </span>
                    {formatSeconds(slot.elapsedSeconds)}
                  </p>
                ) : null}
              </div>
            ) : (
              <p
                className={[
                  "text-[10px] font-semibold uppercase tracking-[0.2em] sm:text-[11px]",
                  isDark ? "text-zinc-500" : "text-zinc-600",
                ].join(" ")}
              >
                Main Focus
              </p>
            )}
            {isEditing ? (
              <div
                className="mt-1.5 space-y-1.5"
                data-no-toggle
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  value={editDraft.title}
                  onChange={(event) =>
                    onEditDraftChange({ ...editDraft, title: event.target.value })
                  }
                  className={[
                    "w-full rounded-lg border px-2 py-1 text-xs outline-none sm:text-sm",
                    isDark
                      ? "border-zinc-700 bg-zinc-950 text-zinc-100 focus:border-emerald-500"
                      : "border-zinc-300 bg-zinc-100 text-zinc-900 focus:border-emerald-500",
                  ].join(" ")}
                />
                <textarea
                  value={editDraft.note}
                  onChange={(event) =>
                    onEditDraftChange({ ...editDraft, note: event.target.value })
                  }
                  rows={2}
                  className={[
                    "w-full resize-none rounded-lg border px-2 py-1 text-xs outline-none sm:text-sm",
                    isDark
                      ? "border-zinc-700 bg-zinc-950 text-zinc-100 focus:border-emerald-500"
                      : "border-zinc-300 bg-zinc-100 text-zinc-900 focus:border-emerald-500",
                  ].join(" ")}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onSaveEdit}
                    className="rounded-md border border-emerald-500/50 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-500 sm:text-xs"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={onCancelEdit}
                    className={[
                      "rounded-md border px-2 py-0.5 text-[10px] sm:text-xs",
                      isDark
                        ? "border-zinc-700 text-zinc-300"
                        : "border-zinc-300 text-zinc-700",
                    ].join(" ")}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  data-no-toggle
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartEdit();
                  }}
                  className={[
                    "block w-full text-left font-semibold transition-colors",
                    "mt-0.5 sm:mt-1",
                    truncateTitle ? "truncate" : "",
                    "text-base leading-snug sm:text-lg md:text-xl lg:text-2xl xl:text-[1.65rem]",
                    isDark
                      ? "text-zinc-100 hover:text-emerald-300"
                      : "text-zinc-900 hover:text-emerald-700",
                  ].join(" ")}
                >
                  {slot.title}
                </button>
                <div className="mt-0.5 flex flex-wrap items-baseline justify-between gap-2">
                  <p
                    className={[
                      "text-[10px] uppercase leading-normal tracking-[0.18em] sm:text-[11px]",
                      isDark ? "text-emerald-400" : "text-emerald-700",
                      "min-w-0 shrink",
                    ].join(" ")}
                  >
                    Priority #{priorityRank}
                  </p>
                </div>
                <p
                  className={[
                    "mt-0.5 line-clamp-2 text-[11px] leading-snug sm:line-clamp-3 sm:text-sm",
                    isDark ? "text-zinc-400" : "text-zinc-600",
                    "md:text-[15px] lg:line-clamp-4 lg:text-base xl:text-lg",
                  ].join(" ")}
                >
                  {slot.note}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main focus, wide landscape: compact task list between copy and timer (fills dead space). */}
      {wideInlineChecklist && !isSupport && !isEditing && !isTasksMode ? (
        <div
          data-no-toggle
          className={[
            "mt-2 min-h-0 max-h-32 overflow-y-auto rounded-lg border px-2 py-1.5 sm:mt-3 sm:max-h-36 sm:px-3 sm:py-2",
            isDark ? "border-zinc-700/80 bg-zinc-950/50" : "border-zinc-300/90 bg-zinc-50/90",
          ].join(" ")}
        >
          <p
            className={[
              "mb-1 text-[9px] font-semibold uppercase tracking-wider",
              isDark ? "text-zinc-500" : "text-zinc-600",
            ].join(" ")}
          >
            Tasks · tap card for full editor
          </p>
          <ul className="space-y-1">
            {slot.checklist.map((item) => (
              <li key={item.id} className="flex items-start gap-2 text-[11px] sm:text-xs">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => onToggleChecklist(item.id)}
                  className={[
                    "mt-0.5 h-3.5 w-3.5 shrink-0 rounded sm:h-4 sm:w-4",
                    isDark ? "border-zinc-600 bg-zinc-900" : "border-zinc-300 bg-white",
                  ].join(" ")}
                />
                <span
                  className={[
                    "min-w-0 leading-snug",
                    item.done
                      ? isDark
                        ? "text-zinc-500 line-through"
                        : "text-zinc-400 line-through"
                      : isDark
                        ? "text-zinc-200"
                        : "text-zinc-800",
                  ].join(" ")}
                >
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Counter mode body */}
      {!isTasksMode ? (
        <div
          className={[
            "flex min-h-0 flex-col gap-1.5 sm:gap-2",
            isSupport
              ? "mt-2 sm:mt-2.5"
              : wideInlineChecklist
                ? "mt-2 sm:mt-3"
                : "mt-2 sm:mt-3 lg:mt-auto lg:pt-1",
          ].join(" ")}
        >
          {/* Timer only (label sr-only) — avoids cram/overlap on narrow support cards. */}
          <div
            className={[
              "flex min-w-0 justify-center rounded-xl border text-center font-mono tabular-nums tracking-tight transition-colors duration-300",
              isSupport
                ? "px-2 py-1.5 text-xs sm:px-2.5 sm:py-2 sm:text-sm"
                : "px-3 py-2 text-base sm:py-2.5 sm:text-lg md:text-xl",
              slot.overspentAuto || slot.donorAutoBorrow
                ? isDark
                  ? "border-rose-500/60 bg-rose-950/35 text-rose-100 shadow-[inset_0_0_0_1px_rgba(244,63,94,0.2)]"
                  : "border-rose-500/70 bg-rose-50 text-rose-950 shadow-[inset_0_0_0_1px_rgba(244,63,94,0.12)]"
                : isInactiveNoTime
                  ? isDark
                    ? "border-dashed border-zinc-700/55 bg-zinc-900/40 text-zinc-500 shadow-none"
                    : "border-dashed border-zinc-300/80 bg-zinc-100/60 text-zinc-500 shadow-none"
                  : isActive
                    ? isDark
                      ? "border-amber-500/55 bg-amber-500/12 text-amber-100 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.12)]"
                      : "border-amber-400/80 bg-amber-50 text-amber-950 shadow-[inset_0_0_0_1px_rgba(217,119,6,0.08)]"
                    : isDark
                      ? "border-zinc-600/50 bg-zinc-800/90 text-zinc-100"
                      : "border-zinc-400/60 bg-zinc-100 text-zinc-900",
            ].join(" ")}
          >
            <span className="sr-only">Countdown</span>
            {slot.durationSeconds <= 0
              ? isParkedRunHold
                ? `Today ${formatSeconds(slot.elapsedSeconds)}`
                : "—"
              : formatSeconds(remaining)}
          </div>

          <div
            className={[
              "h-2 overflow-hidden rounded-full ring-1 ring-black/5 dark:ring-white/10 sm:h-2.5",
              isInactiveNoTime
                ? isDark
                  ? "bg-zinc-800/80"
                  : "bg-zinc-300/70"
                : isDark
                  ? "bg-zinc-700"
                  : "bg-zinc-400",
            ].join(" ")}
          >
            <div
              className={[
                "h-full rounded-full transition-all duration-500",
                isInactiveNoTime
                  ? isDark
                    ? "bg-zinc-600/55"
                    : "bg-zinc-400/70"
                  : priorityProgressFillClass(priorityRank, isDark),
              ].join(" ")}
              style={{ width: `${completion}%` }}
            />
          </div>

          <button
            type="button"
            data-no-toggle
            onClick={(e) => {
              e.stopPropagation();
              onStartPause();
            }}
            disabled={
              !isActive && (!canStart || slot.durationSeconds <= 0)
            }
            className={[
              "w-full rounded-xl border px-2 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45 sm:py-2 sm:text-sm",
              // Done (overspent) pakai warna sama Pause — kuning/amber = slot sedang running.
              isActive
                ? "border-amber-600/60 bg-amber-500/15 text-amber-800 hover:bg-amber-500/25 dark:border-amber-500/50 dark:bg-amber-500/15 dark:text-amber-200"
                : isDark
                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25"
                  : "border-emerald-700 bg-emerald-200 text-emerald-950 hover:bg-emerald-300",
            ].join(" ")}
          >
            {isActive && slot.overspentAuto ? "Done" : isActive ? "Pause" : "Start"}
          </button>
        </div>
      ) : null}

      {/* Tasks mode — mockup: no countdown; checklist display vs edit */}
      {isTasksMode ? (
        <div
          className={[
            "mt-1 flex max-h-[min(20rem,42dvh)] flex-col overflow-hidden rounded-xl border p-2 sm:max-h-[min(22rem,45dvh)] sm:p-3",
            isDark ? "border-zinc-800 bg-zinc-950/40" : "border-zinc-300 bg-zinc-50",
          ].join(" ")}
          data-no-toggle
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <p
              className={[
                "text-[10px] font-medium uppercase tracking-wider sm:text-xs",
                isDark ? "text-zinc-500" : "text-zinc-600",
              ].join(" ")}
            >
              Checklist ({slot.checklist.length}/5)
            </p>
            {!tasksEdit ? (
              <button
                type="button"
                onClick={() => setTasksEdit(true)}
                className={[
                  "rounded-md border px-2 py-0.5 text-[10px] sm:text-xs",
                  isDark
                    ? "border-zinc-600 text-zinc-300"
                    : "border-zinc-300 text-zinc-700",
                ].join(" ")}
              >
                Edit
              </button>
            ) : null}
          </div>

          <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain">
            {slot.checklist.map((item) => (
              <div
                key={item.id}
                className={[
                  "flex items-center gap-2 rounded-md px-0.5 py-0.5 text-[11px] sm:text-sm",
                  isDark ? "text-zinc-300" : "text-zinc-700",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => onToggleChecklist(item.id)}
                  disabled={tasksEdit}
                  className={[
                    "h-3.5 w-3.5 shrink-0 rounded sm:h-4 sm:w-4",
                    isDark ? "border-zinc-600 bg-zinc-900" : "border-zinc-300 bg-white",
                  ].join(" ")}
                />
                {tasksEdit && editingTaskId === item.id ? (
                  <input
                    value={editingTaskText}
                    onChange={(e) => setEditingTaskText(e.target.value)}
                    className={[
                      "min-w-0 flex-1 rounded border px-1 py-0.5 text-[11px] outline-none sm:text-xs",
                      isDark
                        ? "border-zinc-600 bg-zinc-900 text-zinc-100"
                        : "border-zinc-300 bg-white",
                    ].join(" ")}
                  />
                ) : (
                  <span
                    className={[
                      "min-w-0 flex-1 truncate",
                      item.done
                        ? isDark
                          ? "text-zinc-500 line-through"
                          : "text-zinc-400 line-through"
                        : "",
                    ].join(" ")}
                  >
                    {item.text}
                  </span>
                )}
                {tasksEdit ? (
                  editingTaskId === item.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          const clean = editingTaskText.trim();
                          if (clean) {
                            onUpdateChecklist(item.id, clean);
                          }
                          setEditingTaskId(null);
                        }}
                        className="shrink-0 rounded border border-emerald-500/50 px-1.5 py-0.5 text-[10px] text-emerald-500"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingTaskId(null)}
                        className="shrink-0 rounded border border-zinc-500/40 px-1.5 py-0.5 text-[10px]"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => enterTaskRowEdit(item.id, item.text)}
                        className="shrink-0 rounded border border-zinc-500/40 px-1.5 py-0.5 text-[10px]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteChecklist(item.id)}
                        className="shrink-0 rounded border border-rose-500/50 px-1.5 py-0.5 text-[10px] text-rose-500"
                      >
                        Del
                      </button>
                    </>
                  )
                ) : null}
              </div>
            ))}
          </div>

          {tasksEdit ? (
            <>
              <div className="mt-2 flex gap-1.5">
                <input
                  value={taskDraft}
                  maxLength={80}
                  onChange={(e) => setTaskDraft(e.target.value)}
                  placeholder="Add checklist item..."
                  className={[
                    "min-w-0 flex-1 rounded-md border px-2 py-1 text-[11px] outline-none sm:text-xs",
                    isDark
                      ? "border-zinc-700 bg-zinc-900 text-zinc-100"
                      : "border-zinc-300 bg-white",
                  ].join(" ")}
                />
                <button
                  type="button"
                  disabled={slot.checklist.length >= 5}
                  onClick={() => {
                    const clean = taskDraft.trim();
                    if (!clean) {
                      return;
                    }
                    onAddChecklist(clean);
                    setTaskDraft("");
                  }}
                  className="shrink-0 rounded-md border border-emerald-500/50 bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-500 disabled:opacity-40"
                >
                  Add
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTasksEdit(false);
                  setEditingTaskId(null);
                  setTaskDraft("");
                }}
                className={[
                  "mt-3 w-full rounded-lg border py-1.5 text-[10px] font-semibold uppercase tracking-wide sm:text-xs",
                  isDark
                    ? "border-zinc-600 text-zinc-200"
                    : "border-zinc-400 text-zinc-800",
                ].join(" ")}
              >
                Save
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
