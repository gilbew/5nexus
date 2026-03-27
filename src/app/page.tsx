"use client";

import { useEffect, useMemo, useState } from "react";
import { NexusCard, type NexusSlot } from "@/components/NexusCard";

const ENERGY_BUDGET_SECONDS = 12 * 60 * 60;

const initialSlots: NexusSlot[] = [
  {
    id: "planning",
    title: "Planning",
    note: "Shape priorities and lock today outcomes.",
    durationSeconds: 90 * 60,
    elapsedSeconds: 0,
    checklist: [
      { id: "p1", text: "Review backlog", done: false },
      { id: "p2", text: "Define top 3 outcomes", done: false },
      { id: "p3", text: "Timebox each outcome", done: false },
    ],
  },
  {
    id: "deep-work",
    title: "Deep Work",
    note: "Execute focused blocks with no context switching.",
    durationSeconds: 120 * 60,
    elapsedSeconds: 0,
    checklist: [
      { id: "d1", text: "Mute notifications", done: false },
      { id: "d2", text: "Open only required tabs", done: false },
      { id: "d3", text: "Complete key milestone", done: false },
    ],
  },
  {
    id: "learning",
    title: "Learning",
    note: "Sharpen one key skill for leverage.",
    durationSeconds: 75 * 60,
    elapsedSeconds: 0,
    checklist: [
      { id: "l1", text: "Read one focused article", done: false },
      { id: "l2", text: "Capture 3 notes", done: false },
      { id: "l3", text: "Apply one insight", done: false },
    ],
  },
  {
    id: "admin",
    title: "Admin",
    note: "Handle low-cognitive operational tasks.",
    durationSeconds: 60 * 60,
    elapsedSeconds: 0,
    checklist: [
      { id: "a1", text: "Process inbox", done: false },
      { id: "a2", text: "Update trackers", done: false },
      { id: "a3", text: "Close loose ends", done: false },
    ],
  },
  {
    id: "main-focus",
    title: "Main Focus",
    note: "Highest-value mission for this day.",
    durationSeconds: 180 * 60,
    elapsedSeconds: 0,
    checklist: [
      { id: "m1", text: "Define success metric", done: false },
      { id: "m2", text: "Execute core build", done: false },
      { id: "m3", text: "Ship first iteration", done: false },
    ],
  },
];

const formatSeconds = (value: number) => {
  const safeValue = Math.max(0, value);
  const hours = Math.floor(safeValue / 3600);
  const minutes = Math.floor((safeValue % 3600) / 60);
  const seconds = safeValue % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

const formatClock = (value: Date) =>
  value.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

export default function Home() {
  const [slots, setSlots] = useState<NexusSlot[]>(initialSlots);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [mainSlotId, setMainSlotId] = useState<string>("main-focus");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [clock, setClock] = useState<Date>(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClock(new Date());
      setSlots((prev) =>
        prev.map((slot) =>
          slot.id === activeId && slot.elapsedSeconds < slot.durationSeconds
            ? { ...slot, elapsedSeconds: slot.elapsedSeconds + 1 }
            : slot
        )
      );
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activeId]);

  useEffect(() => {
    // Automatically stop a timer when it reaches 0.
    if (!activeId) {
      return;
    }

    const activeSlot = slots.find((slot) => slot.id === activeId);
    if (activeSlot && activeSlot.elapsedSeconds >= activeSlot.durationSeconds) {
      setActiveId(null);
    }
  }, [activeId, slots]);

  const slotById = useMemo(
    () => new Map(slots.map((slot) => [slot.id, slot])),
    [slots]
  );

  const mainSlot = slotById.get(mainSlotId) ?? slots[slots.length - 1];
  const supportSlots = slots.filter((slot) => slot.id !== mainSlot.id);

  const totals = useMemo(() => {
    const spent = slots.reduce((acc, slot) => acc + slot.elapsedSeconds, 0);
    const remainingEnergy = Math.max(0, ENERGY_BUDGET_SECONDS - spent);
    const progress = Math.min((spent / ENERGY_BUDGET_SECONDS) * 100, 100);
    return { spent, remainingEnergy, progress };
  }, [slots]);

  const toggleTimer = (slotId: string) => {
    const candidate = slotById.get(slotId);
    if (!candidate || candidate.elapsedSeconds >= candidate.durationSeconds) {
      return;
    }
    setActiveId((prev) => (prev === slotId ? null : slotId));
  };

  const toggleChecklistItem = (slotId: string, itemId: string) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId
          ? {
              ...slot,
              checklist: slot.checklist.map((item) =>
                item.id === itemId ? { ...item, done: !item.done } : item
              ),
            }
          : slot
      )
    );
  };

  const handleDropOnMain = () => {
    if (!draggingId || draggingId === mainSlot.id) {
      return;
    }
    setMainSlotId(draggingId);
    setDraggingId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-zinc-950 p-4 text-zinc-100 sm:p-6 lg:p-8">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 shadow-2xl shadow-black/30 backdrop-blur sm:p-5">
          <div className="grid gap-4 md:grid-cols-3 md:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">The 5-Slot Nexus</p>
              <h1 className="mt-1 text-xl font-semibold text-zinc-100 sm:text-2xl">
                Productivity Dashboard
              </h1>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Digital Clock</p>
              <p className="mt-1 font-mono text-2xl text-zinc-100">{formatClock(clock)}</p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Remaining Energy</p>
              <p className="mt-1 font-mono text-xl text-emerald-300">
                {formatSeconds(totals.remainingEnergy)}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
            <div className="mb-2 flex items-center justify-between text-sm text-zinc-400">
              <span>Today Progress</span>
              <span>{totals.progress.toFixed(1)}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${totals.progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              Total tracked time: {formatSeconds(totals.spent)} / 12:00:00
            </p>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[2fr_1.35fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {supportSlots.map((slot) => (
              <NexusCard
                key={slot.id}
                slot={slot}
                variant="support"
                isActive={activeId === slot.id}
                isExpanded={expandedId === slot.id}
                onStartPause={() => toggleTimer(slot.id)}
                onToggleExpand={() =>
                  setExpandedId((prev) => (prev === slot.id ? null : slot.id))
                }
                onToggleChecklist={(itemId) => toggleChecklistItem(slot.id, itemId)}
                onDragStart={() => setDraggingId(slot.id)}
                onDragEnd={() => setDraggingId(null)}
              />
            ))}
          </div>

          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDropOnMain}
            className={[
              "rounded-2xl border border-zinc-800 bg-zinc-900/40 p-1 transition-colors duration-300",
              draggingId ? "border-emerald-500/70 bg-emerald-500/5" : "",
            ].join(" ")}
          >
            <NexusCard
              slot={mainSlot}
              variant="focus"
              isActive={activeId === mainSlot.id}
              isExpanded={expandedId === mainSlot.id}
              onStartPause={() => toggleTimer(mainSlot.id)}
              onToggleExpand={() =>
                setExpandedId((prev) => (prev === mainSlot.id ? null : mainSlot.id))
              }
              onToggleChecklist={(itemId) => toggleChecklistItem(mainSlot.id, itemId)}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
