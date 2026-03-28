"use client";

import { useEffect, useState } from "react";
import type { ChecklistItem, NexusSlot } from "@/components/NexusCard";

type NexusMobileEditSheetProps = {
  slot: NexusSlot;
  isDark: boolean;
  /** Opened from card checklist “Edit” — land straight in task editing (same sheet as title edit). */
  startWithTasksEdit?: boolean;
  editDraft: { title: string; note: string };
  onEditDraftChange: (next: { title: string; note: string }) => void;
  onSave: () => void;
  onClose: () => void;
  onToggleChecklist: (itemId: string) => void;
  onAddChecklist: (text: string) => void;
  onUpdateChecklist: (itemId: string, text: string) => void;
  onDeleteChecklist: (itemId: string) => void;
};

/** Bottom sheet on narrow viewports — large inputs so typed text stays readable. */
export function NexusMobileEditSheet({
  slot,
  isDark,
  startWithTasksEdit = false,
  editDraft,
  onEditDraftChange,
  onSave,
  onClose,
  onToggleChecklist,
  onAddChecklist,
  onUpdateChecklist,
  onDeleteChecklist,
}: NexusMobileEditSheetProps) {
  const [tasksEdit, setTasksEdit] = useState(false);
  const [taskDraft, setTaskDraft] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState("");

  // Sync when opening from title vs checklist (same card id can open both ways).
  useEffect(() => {
    setTasksEdit(Boolean(startWithTasksEdit));
    setEditingTaskId(null);
    setTaskDraft("");
    setEditingTaskText("");
  }, [slot.id, startWithTasksEdit]);

  const inputBase =
    "w-full min-h-[44px] rounded-xl border px-3 py-2.5 text-base outline-none transition-colors";
  const inputCls = isDark
    ? `${inputBase} border-zinc-600 bg-zinc-900 text-zinc-100 focus:border-emerald-500`
    : `${inputBase} border-zinc-300 bg-white text-zinc-900 focus:border-emerald-500`;

  const labelCls = isDark ? "text-xs font-medium uppercase tracking-wide text-zinc-400" : "text-xs font-medium uppercase tracking-wide text-zinc-600";

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col justify-end bg-black/55 sm:items-center sm:justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nexus-mobile-edit-title"
    >
      <button
        type="button"
        className="min-h-[44px] flex-1 sm:hidden"
        aria-label="Close editor"
        onClick={onClose}
      />
      <div
        className={[
          "max-h-[min(92dvh,720px)] w-full overflow-y-auto overscroll-contain rounded-t-2xl border p-4 shadow-2xl sm:max-h-[85vh] sm:max-w-lg sm:rounded-2xl sm:p-5",
          isDark ? "border-zinc-700 bg-zinc-900" : "border-zinc-200 bg-white",
        ].join(" ")}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 id="nexus-mobile-edit-title" className="text-lg font-semibold">
            Edit nexus
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={[
              "min-h-[40px] min-w-[40px] rounded-lg border px-3 text-sm",
              isDark ? "border-zinc-600 text-zinc-300" : "border-zinc-300 text-zinc-700",
            ].join(" ")}
          >
            ✕
          </button>
        </div>

        <label className={labelCls}>Title</label>
        <input
          value={editDraft.title}
          onChange={(e) => onEditDraftChange({ ...editDraft, title: e.target.value })}
          className={`${inputCls} mt-1`}
          autoComplete="off"
          autoFocus
        />

        <label className={`${labelCls} mt-3 block`}>Description</label>
        <textarea
          value={editDraft.note}
          onChange={(e) => onEditDraftChange({ ...editDraft, note: e.target.value })}
          rows={4}
          className={`${inputCls} mt-1 resize-y`}
        />

        <div
          className={[
            "mt-4 border-t pt-4",
            isDark ? "border-zinc-700/50" : "border-zinc-200",
          ].join(" ")}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className={labelCls}>Tasks ({slot.checklist.length}/5)</span>
            {!tasksEdit ? (
              <button
                type="button"
                onClick={() => setTasksEdit(true)}
                className={[
                  "min-h-[40px] rounded-lg border px-3 text-sm",
                  isDark ? "border-zinc-600 text-zinc-200" : "border-zinc-300 text-zinc-800",
                ].join(" ")}
              >
                Edit tasks
              </button>
            ) : null}
          </div>
          <ul className="space-y-2">
            {slot.checklist.map((item: ChecklistItem) => (
              <li key={item.id} className="flex flex-wrap items-center gap-2">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => onToggleChecklist(item.id)}
                  disabled={tasksEdit}
                  className="h-5 w-5 shrink-0 rounded"
                />
                {tasksEdit && editingTaskId === item.id ? (
                  <input
                    value={editingTaskText}
                    onChange={(e) => setEditingTaskText(e.target.value)}
                    className={inputCls}
                  />
                ) : (
                  <span
                    className={[
                      "min-w-0 flex-1 text-base leading-snug",
                      item.done ? (isDark ? "text-zinc-500 line-through" : "text-zinc-400 line-through") : "",
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
                        className="min-h-[40px] rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400"
                        onClick={() => {
                          const t = editingTaskText.trim();
                          if (t) onUpdateChecklist(item.id, t);
                          setEditingTaskId(null);
                        }}
                      >
                        Done
                      </button>
                      <button
                        type="button"
                        className="min-h-[40px] rounded-lg border px-3 text-sm"
                        onClick={() => setEditingTaskId(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="min-h-[40px] rounded-lg border px-2 text-sm"
                        onClick={() => {
                          setEditingTaskId(item.id);
                          setEditingTaskText(item.text);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="min-h-[40px] rounded-lg border border-rose-500/40 px-2 text-sm text-rose-500"
                        onClick={() => onDeleteChecklist(item.id)}
                      >
                        Del
                      </button>
                    </>
                  )
                ) : null}
              </li>
            ))}
          </ul>
          {tasksEdit ? (
            <div className="mt-3 flex gap-2">
              <input
                value={taskDraft}
                maxLength={80}
                onChange={(e) => setTaskDraft(e.target.value)}
                placeholder="New task…"
                className={inputCls}
              />
              <button
                type="button"
                disabled={slot.checklist.length >= 5}
                className="min-h-[44px] shrink-0 rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-4 text-sm text-emerald-600 disabled:opacity-40 dark:text-emerald-400"
                onClick={() => {
                  const t = taskDraft.trim();
                  if (!t) return;
                  onAddChecklist(t);
                  setTaskDraft("");
                }}
              >
                Add
              </button>
            </div>
          ) : null}
          {tasksEdit ? (
            <button
              type="button"
              className="mt-3 w-full min-h-[44px] rounded-xl border border-emerald-500/50 bg-emerald-500/15 py-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400"
              onClick={() => {
                setTasksEdit(false);
                setEditingTaskId(null);
                setTaskDraft("");
              }}
            >
              Done
            </button>
          ) : null}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onSave}
            className="min-h-[48px] flex-1 rounded-xl border border-emerald-500/50 bg-emerald-500/15 py-3 text-base font-semibold text-emerald-600 dark:text-emerald-400"
          >
            Save nexus
          </button>
          <button
            type="button"
            onClick={onClose}
            className={[
              "min-h-[48px] flex-1 rounded-xl border py-3 text-base font-medium",
              isDark ? "border-zinc-600 text-zinc-200" : "border-zinc-300 text-zinc-800",
            ].join(" ")}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
