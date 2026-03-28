"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { applyBorrowFromDonors } from "@/lib/nexus-borrow";
import { computeRunnerWallCatchUp } from "@/lib/nexus-runner-catchup";
import {
  distributeSeconds,
  getAllocationPresets,
  getDailyCount,
  presetLabel,
  type DayType,
  type FocusDailySlots,
  type HolidayDailySlots,
} from "@/lib/nexus-allocations";
import { useAuth } from "@/components/AuthProvider";
import { NexusCard, type ChecklistItem, type NexusSlot } from "@/components/NexusCard";
import { useTheme } from "@/components/ThemeProvider";
import { applyDashboardFromPersisted } from "@/lib/nexus-dashboard-hydrate";
import {
  NEXUS_DASHBOARD_STORAGE_V3,
  NEXUS_DASHBOARD_STORAGE_V4,
  NEXUS_DASHBOARD_STORAGE_V5,
  USER_DASHBOARD_TABLE,
  bumpLocalDashboardWriteTs,
  clearNexusDashboardLocalState,
  clearPreferServerAfterLogout,
  getLastServerUpdatedAt,
  getLocalDashboardWriteTs,
  hasCloudVersionConflict,
  NO_SERVER_ACK_ISO,
  setLastServerUpdatedAt,
  setLocalDashboardWriteTs,
  markPreferServerAfterLogout,
  shouldPreferServerAfterLogout,
} from "@/lib/nexus-cloud-sync";
import {
  getDateKeyInTimeZone,
  getDeviceTimeZone,
  getEffectiveDashboardDayKey,
  isValidIanaTimeZone,
  normalizeClockHm,
  parseClockHm,
} from "@/lib/nexus-timezone";
import { createClient } from "@/lib/supabase/client";

const STORAGE_KEY = NEXUS_DASHBOARD_STORAGE_V5;
const STORAGE_LEGACY_V4 = NEXUS_DASHBOARD_STORAGE_V4;
const STORAGE_LEGACY_V3 = NEXUS_DASHBOARD_STORAGE_V3;
const MAX_NEXUS = 10;
/** Backup cloud pull: slower when idle; faster while a nexus is running (multi-device, no Realtime). */
const CLOUD_PULL_INTERVAL_MS_IDLE = 120_000;
const CLOUD_PULL_INTERVAL_MS_RUNNING = 30_000;
/** Tailwind `md` default — used with JS viewport for orientation-aware UI. */
const MD_PX = 768;
/** Shared horizontal rhythm: dashboard island + nexus grid share one column width. */
const SHELL_X = "mx-auto w-full max-w-[1680px] px-3 sm:px-4 md:px-8 lg:px-12 xl:px-14";

type EnergyHoursConfig = {
  holiday: number;
  default: number;
  focus: number;
};

type PersistedV4 = {
  v: 4;
  entities: NexusSlot[];
  fullOrder: string[];
  mainSlotId: string;
  activeId: string | null;
  lastResetDate: string;
  dayType: DayType;
  holidayDaily: HolidayDailySlots;
  focusDaily: FocusDailySlots;
  allocatorIndex: number;
  energyHours: EnergyHoursConfig;
};

type PersistedV5 = Omit<PersistedV4, "v"> & {
  v: 5;
  autoBorrow: boolean;
  /** Wall seconds counted against today’s energy budget (independent of park/demote). */
  dayConsumedRunSeconds?: number;
  /** Monotonic per-tab write counter for cross-tab localStorage merge (not authoritative for LWW). */
  storageRevision?: number;
  /** Which day type shows “(default)” and is chosen for new users / long-press default. */
  preferredDefaultDayType?: DayType;
  /** IANA timezone for clock + calendar “today”. */
  appTimezone?: string;
  /** When true, advance “app day” at `dayResetClock` in `appTimezone`. */
  autoDayReset?: boolean;
  /** Local wall time HH:mm (24h) in app timezone when the day rolls. */
  dayResetClock?: string;
  /** `Date.now()` when runner state was last aligned — used to catch up elapsed after tab sleep/close. */
  runWallAnchorMs?: number | null;
};

function readStorageRevision(parsed: unknown): number {
  if (!parsed || typeof parsed !== "object") {
    return 0;
  }
  const n = Number((parsed as Record<string, unknown>).storageRevision);
  return Number.isFinite(n) ? n : 0;
}

/** Persisted fields only (no storageRevision) — same string means no need to re-apply or re-write (stops cross-tab revision ping-pong). */
function fingerprintPersistBody(parts: {
  v: number;
  entities: unknown;
  fullOrder: unknown;
  mainSlotId: unknown;
  activeId: unknown;
  lastResetDate: unknown;
  dayType: unknown;
  holidayDaily: unknown;
  focusDaily: unknown;
  allocatorIndex: unknown;
  energyHours: unknown;
  autoBorrow: unknown;
  preferredDefaultDayType: unknown;
  appTimezone: unknown;
  autoDayReset: unknown;
  dayResetClock: unknown;
  dayConsumedRunSeconds: unknown;
  runWallAnchorMs: unknown;
}): string {
  return JSON.stringify({
    v: parts.v,
    entities: parts.entities,
    fullOrder: parts.fullOrder,
    mainSlotId: parts.mainSlotId,
    activeId: parts.activeId,
    lastResetDate: parts.lastResetDate,
    dayType: parts.dayType,
    holidayDaily: parts.holidayDaily,
    focusDaily: parts.focusDaily,
    allocatorIndex: parts.allocatorIndex,
    energyHours: parts.energyHours,
    autoBorrow: parts.autoBorrow,
    preferredDefaultDayType: parts.preferredDefaultDayType,
    appTimezone: parts.appTimezone,
    autoDayReset: parts.autoDayReset,
    dayResetClock: parts.dayResetClock,
    dayConsumedRunSeconds: parts.dayConsumedRunSeconds,
    runWallAnchorMs: parts.runWallAnchorMs,
  });
}

/** Returns null for legacy / unknown shapes so we always hydrate instead of skipping. */
function fingerprintFromPersistedUnknown(parsed: unknown): string | null {
  if (!parsed || typeof parsed !== "object") {
    return null;
  }
  const r = parsed as Record<string, unknown>;
  if (r.v === 5 && typeof r.autoBorrow === "boolean") {
    const pref =
      r.preferredDefaultDayType === "holiday" ||
      r.preferredDefaultDayType === "focus" ||
      r.preferredDefaultDayType === "default"
        ? r.preferredDefaultDayType
        : "default";
    const tzRaw = typeof r.appTimezone === "string" ? r.appTimezone.trim() : "";
    const tz =
      tzRaw && isValidIanaTimeZone(tzRaw) ? tzRaw : null;
    const autoR = typeof r.autoDayReset === "boolean" ? r.autoDayReset : true;
    const drc =
      typeof r.dayResetClock === "string" ? normalizeClockHm(r.dayResetClock) : "00:00";
    return fingerprintPersistBody({
      v: 5,
      entities: r.entities,
      fullOrder: r.fullOrder,
      mainSlotId: r.mainSlotId,
      activeId: r.activeId,
      lastResetDate: r.lastResetDate,
      dayType: r.dayType,
      holidayDaily: r.holidayDaily,
      focusDaily: r.focusDaily,
      allocatorIndex: r.allocatorIndex,
      energyHours: r.energyHours,
      autoBorrow: r.autoBorrow,
      preferredDefaultDayType: pref,
      appTimezone: tz,
      autoDayReset: autoR,
      dayResetClock: drc,
      dayConsumedRunSeconds: r.dayConsumedRunSeconds,
      runWallAnchorMs: r.runWallAnchorMs,
    });
  }
  return null;
}

const defaultEnergyHours: EnergyHoursConfig = {
  holiday: 4,
  default: 12,
  focus: 10,
};

const seedIds = ["main-focus", "deep-work", "planning", "learning", "admin"] as const;

function seedEntities(): NexusSlot[] {
  const templates: Omit<NexusSlot, "durationSeconds" | "elapsedSeconds">[] = [
    {
      id: "main-focus",
      title: "Main Focus",
      note: "Highest-value mission for this day.",
      checklist: [
        { id: "m1", text: "Define success metric", done: false },
        { id: "m2", text: "Execute core build", done: false },
        { id: "m3", text: "Ship first iteration", done: false },
      ],
    },
    {
      id: "deep-work",
      title: "Deep Work",
      note: "Execute focused blocks with no context switching.",
      checklist: [
        { id: "d1", text: "Mute notifications", done: false },
        { id: "d2", text: "Open only required tabs", done: false },
        { id: "d3", text: "Complete key milestone", done: false },
      ],
    },
    {
      id: "planning",
      title: "Planning",
      note: "Shape priorities and lock today outcomes.",
      checklist: [
        { id: "p1", text: "Review backlog", done: false },
        { id: "p2", text: "Define top 3 outcomes", done: false },
        { id: "p3", text: "Timebox each outcome", done: false },
      ],
    },
    {
      id: "learning",
      title: "Learning",
      note: "Sharpen one key skill for leverage.",
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
      checklist: [
        { id: "a1", text: "Process inbox", done: false },
        { id: "a2", text: "Update trackers", done: false },
        { id: "a3", text: "Close loose ends", done: false },
      ],
    },
  ];
  return templates.map((t) => ({
    ...t,
    durationSeconds: 0,
    elapsedSeconds: 0,
  }));
}

const formatSeconds = (value: number) => {
  const safeValue = Math.max(0, value);
  const hours = Math.floor(safeValue / 3600);
  const minutes = Math.floor((safeValue % 3600) / 60);
  const seconds = safeValue % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

const formatClock = (value: Date, timeZone: string) =>
  value.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: isValidIanaTimeZone(timeZone) ? timeZone : getDeviceTimeZone(),
  });

/** UI label: internal `default` day type is shown as “Normal”. */
function dayTypeDisplayName(dt: DayType): string {
  if (dt === "default") {
    return "Normal";
  }
  if (dt === "focus") {
    return "Focus";
  }
  return "Holiday";
}

function dayTypeSubtitle(dt: DayType): string {
  if (dt === "default") {
    return "max 5 today";
  }
  if (dt === "focus") {
    return "max 3 today";
  }
  return "0–1 today";
}

/** Effective “app day” key when applying a stored/remote payload (uses that blob’s TZ + reset settings). */
function hydrateTodayKeyFromPayload(parsed: unknown): string {
  const pObj = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  const tzRaw = pObj && typeof pObj.appTimezone === "string" ? pObj.appTimezone.trim() : "";
  const tz = tzRaw && isValidIanaTimeZone(tzRaw) ? tzRaw : getDeviceTimeZone();
  const auto = pObj && typeof pObj.autoDayReset === "boolean" ? pObj.autoDayReset : true;
  const rawC = pObj && typeof pObj.dayResetClock === "string" ? pObj.dayResetClock.trim() : "00:00";
  const clock = parseClockHm(rawC) ? normalizeClockHm(rawC) : "00:00";
  return getEffectiveDashboardDayKey(new Date(), tz, clock, auto);
}

/** Per-slot daily reset: run timers + borrow flags only — keep titles, notes, checklist done (archive later). */
const resetEntityDay = (e: NexusSlot): NexusSlot => ({
  ...e,
  elapsedSeconds: 0,
  overspentAuto: false,
  donorAutoBorrow: false,
});

function migrateFromV3(raw: string): Partial<PersistedV4> | null {
  try {
    const p = JSON.parse(raw) as Record<string, unknown>;
    if (!Array.isArray(p.slots) || !Array.isArray(p.priorityOrder)) {
      return null;
    }
    const slots = p.slots as NexusSlot[];
    const order = p.priorityOrder as string[];
    const parkedRaw = p.parkedInterests;
    const parkedList = Array.isArray(parkedRaw) ? parkedRaw : [];
    const parkedEntities: NexusSlot[] = parkedList
      .map((row: unknown) => {
        if (!row || typeof row !== "object") {
          return null;
        }
        const r = row as Record<string, unknown>;
        const id = typeof r.id === "string" ? r.id : "";
        const title =
          typeof r.title === "string"
            ? r.title
            : typeof r.text === "string"
              ? r.text
              : "Parked";
        const note = typeof r.description === "string" ? r.description : "";
        if (!id) {
          return null;
        }
        return {
          id,
          title,
          note,
          durationSeconds: 0,
          elapsedSeconds: 0,
          checklist: [] as ChecklistItem[],
        } satisfies NexusSlot;
      })
      .filter((x): x is NexusSlot => Boolean(x));

    const fullOrder = [...order, ...parkedEntities.map((e) => e.id)];
    const entityById = new Map<string, NexusSlot>();
    slots.forEach((s) => entityById.set(s.id, s));
    parkedEntities.forEach((e) => entityById.set(e.id, e));

    const entities = fullOrder.map((id) => entityById.get(id)).filter(Boolean) as NexusSlot[];

    return {
      v: 4,
      entities,
      fullOrder,
      mainSlotId: typeof p.mainSlotId === "string" ? p.mainSlotId : "main-focus",
      activeId: typeof p.activeId === "string" ? p.activeId : null,
      lastResetDate:
        typeof p.lastResetDate === "string"
          ? p.lastResetDate
          : getDateKeyInTimeZone(new Date(), getDeviceTimeZone()),
      dayType: p.dayType === "holiday" || p.dayType === "focus" ? p.dayType : "default",
      holidayDaily: 1,
      focusDaily: 3,
      allocatorIndex: 0,
      energyHours: defaultEnergyHours,
    };
  } catch {
    return null;
  }
}

/** Samsung-style segmented bar for one preset row. */
function PresetMemoryBar({
  percentages,
  selected,
  onSelect,
  isDark,
}: {
  percentages: number[];
  selected: boolean;
  onSelect: () => void;
  isDark: boolean;
}) {
  /** Emerald / teal / green ramp — last slot is deep green (not zinc) so card progress stays visible. */
  const colorsLight = [
    "bg-emerald-800",
    "bg-emerald-600",
    "bg-teal-700",
    "bg-emerald-500",
    "bg-green-800",
  ];
  /** Dark mode: stronger separation (hue + luminance) than light ramp. */
  const colorsDark = [
    "bg-emerald-600",
    "bg-teal-500",
    "bg-cyan-400",
    "bg-lime-400",
    "bg-emerald-800",
  ];
  const seg = isDark ? colorsDark : colorsLight;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "flex w-full flex-col gap-0.5 rounded-lg border p-1.5 text-left transition-colors",
        selected
          ? isDark
            ? "border-emerald-400/70 bg-emerald-500/10"
            : "border-emerald-700 bg-emerald-100/80"
          : isDark
            ? "border-zinc-700 hover:border-zinc-600"
            : "border-zinc-200 hover:border-zinc-300",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-3.5 w-full overflow-hidden rounded-md ring-1 sm:h-4",
          isDark ? "ring-zinc-600" : "ring-black/15",
        ].join(" ")}
      >
        {percentages.map((pct, i) => (
          <div
            key={i}
            className={[
              seg[i % seg.length],
              "min-w-0 border-r last:border-r-0",
              isDark ? "border-black/40" : "border-emerald-950/25",
            ].join(" ")}
            style={{ width: `${pct}%` }}
            title={`P${i + 1}: ${pct}%`}
          />
        ))}
      </div>
      <span
        className={["text-[9px] sm:text-[10px]", isDark ? "text-zinc-300" : "text-zinc-600"].join(" ")}
      >
        {presetLabel(percentages)}
      </span>
    </button>
  );
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const isDark = theme === "dark";

  /** Portrait iff height > width (resizing desktop window matches user expectation). */
  // SSR + first client paint must match — never read window in useState init (hydration mismatch).
  const [viewport, setViewport] = useState({ w: 1280, h: 800, portrait: false });

  useLayoutEffect(() => {
    const sync = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setViewport({ w, h, portrait: h > w });
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  const isNarrowViewport = viewport.w < MD_PX;
  /** Phone-sized + tall viewport: extra-compact header chrome. */
  const tightPhonePortrait = isNarrowViewport && viewport.portrait;
  /** Short wide phone: slightly roomier header than portrait; title may truncate. */
  const narrowLandscape = isNarrowViewport && !viewport.portrait;
  /** PC / tablet landscape: show tasks between description and timer on Main Focus. */
  const wideInlineChecklist = !viewport.portrait && viewport.w >= MD_PX;

  const [entities, setEntities] = useState<NexusSlot[]>(seedEntities);
  const [fullOrder, setFullOrder] = useState<string[]>([...seedIds]);
  const [mainSlotId, setMainSlotId] = useState("main-focus");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [appTimezone, setAppTimezone] = useState(getDeviceTimeZone);
  /** When false, the 1s timer does not roll a new day (manual / toggle back on to resume). */
  const [autoDayReset, setAutoDayReset] = useState(true);
  /** 24h HH:mm in app timezone when the app day rolls (only if autoDayReset). Default midnight. */
  const [dayResetClock, setDayResetClock] = useState("00:00");
  const [lastResetDate, setLastResetDate] = useState(() =>
    getDateKeyInTimeZone(new Date(), getDeviceTimeZone())
  );
  const [dayType, setDayType] = useState<DayType>("default");
  /** App-only: which day type shows “(default)” — set via long-press under Settings → App. */
  const [preferredDefaultDayType, setPreferredDefaultDayType] = useState<DayType>("default");
  const [holidayDaily, setHolidayDaily] = useState<HolidayDailySlots>(1);
  const [focusDaily, setFocusDaily] = useState<FocusDailySlots>(3);
  const [allocatorIndex, setAllocatorIndex] = useState(0);
  const [energyHours, setEnergyHours] = useState<EnergyHoursConfig>(defaultEnergyHours);
  /** Draft for App → energy hours until user saves (confirm + 2s like allocation). */
  const [energyDraft, setEnergyDraft] = useState<EnergyHoursConfig>(defaultEnergyHours);

  const [settingsOpen, setSettingsOpen] = useState(false);
  /** Settings drawer: only one of Daily / App / Account expanded at a time (accordion). */
  const [settingsAccordion, setSettingsAccordion] = useState<
    "daily" | "app" | "account" | null
  >("daily");
  const [clock, setClock] = useState<Date | null>(null);
  /** Seconds already charged to today’s energy (ticks up while a today nexus runs; not reduced by parking). */
  const [dayConsumedRunSeconds, setDayConsumedRunSeconds] = useState(0);
  /** Wall clock anchor for runner catch-up when the tab was hidden or the app was closed. */
  const [runWallAnchorMs, setRunWallAnchorMs] = useState<number | null>(null);

  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({ title: "", note: "" });
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [reorderDragId, setReorderDragId] = useState<string | null>(null);

  const [showAddParkedForm, setShowAddParkedForm] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addNote, setAddNote] = useState("");

  const [parkedTasksForId, setParkedTasksForId] = useState<string | null>(null);

  const [swapModal, setSwapModal] = useState<{ sourceId: string } | null>(null);
  const [autoBorrow, setAutoBorrow] = useState(true);
  /** Long-press donor card → share its unused allocation with a chosen recipient. */
  const [transferDonorId, setTransferDonorId] = useState<string | null>(null);
  const [transferRecipientId, setTransferRecipientId] = useState<string | null>(null);
  const [transferH, setTransferH] = useState("0");
  const [transferM, setTransferM] = useState("0");
  const [transferS, setTransferS] = useState("0");

  /** First “Apply allocation” in this tab is instant; later ones need confirm + 2s cooldown (running nexus). */
  const hasAppliedAllocationOnceRef = useRef(false);
  const [allocationConfirmOpen, setAllocationConfirmOpen] = useState(false);
  const [allocationConfirmCooldown, setAllocationConfirmCooldown] = useState(0);
  const [energyHoursConfirmOpen, setEnergyHoursConfirmOpen] = useState(false);
  const [energyHoursConfirmCooldown, setEnergyHoursConfirmCooldown] = useState(0);
  const [timezoneEditOpen, setTimezoneEditOpen] = useState(false);
  const [timezoneDraft, setTimezoneDraft] = useState("");
  const [timezoneConfirmOpen, setTimezoneConfirmOpen] = useState(false);
  const [timezoneConfirmCooldown, setTimezoneConfirmCooldown] = useState(0);
  /** True while pushing latest dashboard to Supabase before ending session. */
  const [signOutFlushing, setSignOutFlushing] = useState(false);
  /** Server row newer than last ack — block push until user loads latest or dismisses. */
  const [cloudConflictOpen, setCloudConflictOpen] = useState(false);
  /** Logical day key pending user confirm (lembur / snooze) — does not change until they reset. */
  const [dayRollModal, setDayRollModal] = useState<null | { newDayKey: string }>(null);
  /** Wall-clock ms: while set and in the future, postpone day-roll prompt (timers keep running). */
  const [dayRollSnoozeUntil, setDayRollSnoozeUntil] = useState<number | null>(null);
  const dayRollSnoozeUntilRef = useRef<number | null>(null);
  const lastResetDateRef = useRef(lastResetDate);
  lastResetDateRef.current = lastResetDate;
  dayRollSnoozeUntilRef.current = dayRollSnoozeUntil;
  /** Avoid branching on `Notification` during SSR/first paint (hydration-safe). */
  const [clientUiReady, setClientUiReady] = useState(false);
  useEffect(() => setClientUiReady(true), []);
  const [dayRollNotifRev, setDayRollNotifRev] = useState(0);
  const dayTypeLongPressTimerRef = useRef<number | null>(null);
  /** After sign-out, keep last signed-in id so we only wipe local cache when a *different* account signs in. */
  const lastSignedInUserIdRef = useRef<string | null>(null);
  /** Tracks session user id to run guest reset on SIGNED_OUT in every tab (not only the tab that clicked Sign out). */
  const authSessionPrevUserRef = useRef<string | null | undefined>(undefined);

  /** Local storage hydrate finished — cloud sync waits so snapshot matches saved state. */
  const [localHydrated, setLocalHydrated] = useState(false);
  /** Initial compare/upsert to Supabase finished; debounced push waits for this. */
  const [cloudSyncReady, setCloudSyncReady] = useState(false);
  const persistSnapshotRef = useRef<PersistedV5 | null>(null);
  /** For `pagehide` keepalive upload — mirrors gates without re-subscribing on every state change. */
  const localHydratedRef = useRef(false);
  localHydratedRef.current = localHydrated;
  const userIdRef = useRef<string | null>(null);
  userIdRef.current = user?.id ?? null;
  const cloudQuietUntilRef = useRef(0);
  /** Cross-tab: higher revision wins when merging localStorage (see storage listener + focused timer). */
  const storageRevRef = useRef(0);
  /** Fingerprint of current React dashboard (layout) — redundant storage events skip setState when data already matches. */
  const currentPersistFingerprintRef = useRef("");
  /** Fingerprint last written to STORAGE_KEY — avoids re-writing the same blob (revision ping-pong between tabs). */
  const lastWrittenPersistFingerprintRef = useRef<string | null>(null);

  const energyBudgetSeconds = Math.max(60, Math.round(energyHours[dayType] * 3600));

  const k = useMemo(
    () => getDailyCount(dayType, holidayDaily, focusDaily, entities.length),
    [dayType, holidayDaily, focusDaily, entities.length]
  );

  const activeIds = useMemo(() => fullOrder.slice(0, k), [fullOrder, k]);
  const activeIdsKey = `${k}|${fullOrder.slice(0, k).join(",")}`;

  const entitiesRef = useRef(entities);
  entitiesRef.current = entities;
  const mainSlotIdRef = useRef(mainSlotId);
  mainSlotIdRef.current = mainSlotId;
  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;
  const kRef = useRef(k);
  kRef.current = k;
  const fullOrderRef = useRef(fullOrder);
  fullOrderRef.current = fullOrder;
  const autoBorrowRef = useRef(autoBorrow);
  autoBorrowRef.current = autoBorrow;
  const runWallAnchorMsRef = useRef<number | null>(null);
  runWallAnchorMsRef.current = runWallAnchorMs;
  /** Detect pause transitions so we clear wall anchor without clobbering hydrate/toggle start. */
  const prevActiveIdForRunnerAnchorRef = useRef<string | null | undefined>(undefined);

  /** Replay wall-time gap vs `runWallAnchorMs` (tab sleep / closed) using the same rules as the 1s tick. */
  const flushRunnerWallCatchUp = useCallback((opts?: { force?: boolean }) => {
    if (
      !opts?.force &&
      typeof document !== "undefined" &&
      document.visibilityState !== "visible"
    ) {
      return;
    }
    const fo = fullOrderRef.current;
    const k0 = kRef.current;
    const c = computeRunnerWallCatchUp(
      entitiesRef.current,
      activeIdRef.current,
      fo.slice(0, k0),
      autoBorrowRef.current,
      runWallAnchorMsRef.current,
      Date.now()
    );
    if (!c.dirty) {
      return;
    }
    runWallAnchorMsRef.current = c.runWallAnchorMs;
    setEntities(c.entities);
    if (c.consumedDelta > 0) {
      setDayConsumedRunSeconds((x) => x + c.consumedDelta);
    }
    setActiveId(c.activeId);
    setRunWallAnchorMs(c.runWallAnchorMs);
  }, []);

  const presets = useMemo(() => getAllocationPresets(dayType, k), [dayType, k]);

  useEffect(() => {
    setAllocatorIndex((i) => Math.min(i, Math.max(0, presets.length - 1)));
  }, [presets.length]);

  const safeAllocatorIndex = Math.min(allocatorIndex, Math.max(0, presets.length - 1));

  // Sync energy draft when opening App settings so edits are not live until Save.
  useEffect(() => {
    if (settingsAccordion === "app") {
      setEnergyDraft(energyHours);
    }
  }, [settingsAccordion, energyHours]);

  // Keep fingerprint in sync before paint so storage/catch-up handlers see the latest committed state.
  useLayoutEffect(() => {
    currentPersistFingerprintRef.current = fingerprintPersistBody({
      v: 5,
      entities,
      fullOrder,
      mainSlotId,
      activeId,
      lastResetDate,
      dayType,
      holidayDaily,
      focusDaily,
      allocatorIndex: safeAllocatorIndex,
      energyHours,
      autoBorrow,
      preferredDefaultDayType,
      appTimezone,
      autoDayReset,
      dayResetClock: normalizeClockHm(dayResetClock),
      dayConsumedRunSeconds,
      runWallAnchorMs,
    });
  }, [
    entities,
    fullOrder,
    mainSlotId,
    activeId,
    lastResetDate,
    dayType,
    holidayDaily,
    focusDaily,
    safeAllocatorIndex,
    energyHours,
    autoBorrow,
    preferredDefaultDayType,
    appTimezone,
    autoDayReset,
    dayResetClock,
    dayConsumedRunSeconds,
    runWallAnchorMs,
  ]);

  const entityById = useMemo(
    () => new Map(entities.map((e) => [e.id, e])),
    [entities]
  );

  /** Demoted nexus (not in first k of fullOrder): strip allocation but keep elapsed (today’s run log + energy already spent). */
  useEffect(() => {
    const active = new Set(fullOrder.slice(0, k));
    setEntities((prev) =>
      prev.map((e) =>
        active.has(e.id)
          ? e
          : { ...e, durationSeconds: 0, overspentAuto: false, donorAutoBorrow: false }
      )
    );
    setActiveId((cur) => (cur && active.has(cur) ? cur : null));
  }, [k, fullOrder.join("|")]);

  useEffect(() => {
    const active = fullOrder.slice(0, k);
    setMainSlotId((mid) => (active.includes(mid) ? mid : active[0] ?? mid));
  }, [activeIdsKey, fullOrder, k]);

  useEffect(() => {
    setClock(new Date());
  }, []);

  useEffect(() => {
    const raw =
      window.localStorage.getItem(STORAGE_KEY) ??
      window.localStorage.getItem(STORAGE_LEGACY_V4) ??
      (() => {
        const legacy = window.localStorage.getItem(STORAGE_LEGACY_V3);
        if (legacy) {
          const m = migrateFromV3(legacy);
          if (m?.entities?.length) {
            return JSON.stringify(m);
          }
        }
        return null;
      })();

    try {
      if (raw) {
        const p = JSON.parse(raw) as unknown;
        const ok = applyDashboardFromPersisted(p, {
          todayKey: hydrateTodayKeyFromPayload(p),
          resetEntityDay,
          defaultEnergyHours,
          setEntities,
          setFullOrder,
          setMainSlotId,
          setActiveId,
          setLastResetDate,
          setDayType,
          setHolidayDaily,
          setFocusDaily,
          setAllocatorIndex,
          setEnergyHours,
          setAutoBorrow,
          setPreferredDefaultDayType,
          setAppTimezone,
          setAutoDayReset,
          setDayResetClock,
          setDayConsumedRunSeconds,
          setRunWallAnchorMs,
        });
        if (ok) {
          bumpLocalDashboardWriteTs();
          storageRevRef.current = Math.max(storageRevRef.current, readStorageRevision(p));
          const fp0 = fingerprintFromPersistedUnknown(p);
          if (fp0 != null) {
            lastWrittenPersistFingerprintRef.current = fp0;
          }
        }
      }
    } catch {
      /* ignore */
    } finally {
      setLocalHydrated(true);
    }
  }, []);

  /** After local hydrate or tab visible again: apply wall-clock catch-up for an active runner. */
  useEffect(() => {
    if (!localHydrated) {
      return;
    }
    const onVis = () => {
      if (document.visibilityState === "visible") {
        flushRunnerWallCatchUp();
      }
    };
    onVis();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pageshow", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pageshow", onVis);
    };
  }, [localHydrated, flushRunnerWallCatchUp]);

  /**
   * Tab close / navigate away: one best-effort cloud save with catch-up merged in-memory.
   * Uses `fetch(..., { keepalive: true })` (cookies + JSON); Chromium caps body ~64KiB.
   */
  useEffect(() => {
    const KEEPALIVE_BODY_MAX = 55_000;

    const onPageHide = () => {
      const uid = userIdRef.current;
      if (!uid || !localHydratedRef.current) {
        return;
      }
      const base = persistSnapshotRef.current;
      if (!base || base.v !== 5) {
        return;
      }
      const fo = fullOrderRef.current;
      const k0 = kRef.current;
      const now = Date.now();
      const c = computeRunnerWallCatchUp(
        entitiesRef.current,
        activeIdRef.current,
        fo.slice(0, k0),
        autoBorrowRef.current,
        runWallAnchorMsRef.current,
        now
      );
      const consumedBase =
        typeof base.dayConsumedRunSeconds === "number" ? base.dayConsumedRunSeconds : 0;
      const payload: PersistedV5 = {
        ...base,
        entities: c.entities,
        fullOrder: fo,
        mainSlotId: mainSlotIdRef.current,
        activeId: c.activeId,
        dayConsumedRunSeconds: consumedBase + c.consumedDelta,
        runWallAnchorMs: c.runWallAnchorMs,
        storageRevision: storageRevRef.current,
      };
      const body = JSON.stringify({
        payload,
        knownServerUpdatedAt: getLastServerUpdatedAt(uid),
      });
      if (body.length > KEEPALIVE_BODY_MAX) {
        return;
      }
      void fetch(`${window.location.origin}/api/dashboard-beacon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
    };

    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refs + persist snapshot cover latest dashboard
  }, []);

  useEffect(() => {
    if (!localHydrated) {
      return;
    }
    const fp = fingerprintPersistBody({
      v: 5,
      entities,
      fullOrder,
      mainSlotId,
      activeId,
      lastResetDate,
      dayType,
      holidayDaily,
      focusDaily,
      allocatorIndex: safeAllocatorIndex,
      energyHours,
      autoBorrow,
      preferredDefaultDayType,
      appTimezone,
      autoDayReset,
      dayResetClock: normalizeClockHm(dayResetClock),
      dayConsumedRunSeconds,
      runWallAnchorMs,
    });
    // Same payload as last write: do not bump storageRevision (prevents infinite storage ↔ persist loops across tabs).
    if (fp === lastWrittenPersistFingerprintRef.current) {
      return;
    }
    lastWrittenPersistFingerprintRef.current = fp;
    storageRevRef.current += 1;
    const payload: PersistedV5 = {
      v: 5,
      entities,
      fullOrder,
      mainSlotId,
      activeId,
      lastResetDate,
      dayType,
      holidayDaily,
      focusDaily,
      allocatorIndex: safeAllocatorIndex,
      energyHours,
      autoBorrow,
      preferredDefaultDayType,
      appTimezone,
      autoDayReset,
      dayResetClock: normalizeClockHm(dayResetClock),
      dayConsumedRunSeconds,
      runWallAnchorMs,
      storageRevision: storageRevRef.current,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    bumpLocalDashboardWriteTs();
  }, [
    localHydrated,
    entities,
    fullOrder,
    mainSlotId,
    activeId,
    lastResetDate,
    dayType,
    holidayDaily,
    focusDaily,
    safeAllocatorIndex,
    energyHours,
    autoBorrow,
    preferredDefaultDayType,
    appTimezone,
    autoDayReset,
    dayResetClock,
    dayConsumedRunSeconds,
    runWallAnchorMs,
  ]);

  useEffect(() => {
    persistSnapshotRef.current = {
      v: 5,
      entities,
      fullOrder,
      mainSlotId,
      activeId,
      lastResetDate,
      dayType,
      holidayDaily,
      focusDaily,
      allocatorIndex: safeAllocatorIndex,
      energyHours,
      autoBorrow,
      preferredDefaultDayType,
      appTimezone,
      autoDayReset,
      dayResetClock: normalizeClockHm(dayResetClock),
      dayConsumedRunSeconds,
      runWallAnchorMs,
      storageRevision: storageRevRef.current,
    };
  });

  useEffect(() => {
    if (!user?.id) {
      setCloudSyncReady(false);
    }
  }, [user?.id]);

  /**
   * Supabase session ended (any tab): mark “prefer server on next login”, wipe local files, reset UI to guest.
   * Matches Tab B when Tab A signs out; avoids Tab B persisting stale user state back to localStorage.
   */
  useEffect(() => {
    if (!localHydrated || authLoading) {
      return;
    }
    const cur = user?.id ?? null;
    const prev = authSessionPrevUserRef.current;
    if (prev !== undefined && prev !== null && cur === null) {
      markPreferServerAfterLogout();
      clearNexusDashboardLocalState();
      const tz0 = getDeviceTimeZone();
      setAppTimezone(tz0);
      setAutoDayReset(true);
      setDayResetClock("00:00");
      setLastResetDate(getEffectiveDashboardDayKey(new Date(), tz0, "00:00", true));
      setEntities(seedEntities());
      setFullOrder([...seedIds]);
      setMainSlotId("main-focus");
      setActiveId(null);
      setDayType("default");
      setPreferredDefaultDayType("default");
      setHolidayDaily(1);
      setFocusDaily(3);
      setAllocatorIndex(0);
      setEnergyHours(defaultEnergyHours);
      setEnergyDraft(defaultEnergyHours);
      setAutoBorrow(true);
      setDayConsumedRunSeconds(0);
      setRunWallAnchorMs(null);
      storageRevRef.current = 0;
      lastWrittenPersistFingerprintRef.current = null;
      hasAppliedAllocationOnceRef.current = false;
      setCloudSyncReady(false);
    }
    authSessionPrevUserRef.current = cur;
  }, [user?.id, authLoading, localHydrated]);

  /**
   * If another Supabase user logs in, clear cached JSON + reload once to avoid mixing accounts.
   */
  useEffect(() => {
    const uid = user?.id ?? null;
    if (uid !== null) {
      const prev = lastSignedInUserIdRef.current;
      if (prev !== null && prev !== uid) {
        clearNexusDashboardLocalState();
        window.location.reload();
        return;
      }
      lastSignedInUserIdRef.current = uid;
    }
  }, [user?.id]);

  /**
   * Other tabs write the same STORAGE_KEY; `storage` fires only outside this tab.
   * Apply only if their revision is newer so a background tab cannot overwrite pause with stale “running”.
   */
  useEffect(() => {
    if (!localHydrated) {
      return;
    }

    const applyFromOtherTab = (raw: string) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw) as unknown;
      } catch {
        return;
      }
      const rev = readStorageRevision(parsed);
      if (rev <= storageRevRef.current) {
        return;
      }
      const incomingFp = fingerprintFromPersistedUnknown(parsed);
      const localFp = currentPersistFingerprintRef.current;
      if (incomingFp != null && incomingFp === localFp) {
        storageRevRef.current = rev;
        return;
      }
      const ok = applyDashboardFromPersisted(parsed, {
        todayKey: hydrateTodayKeyFromPayload(parsed),
        resetEntityDay,
        defaultEnergyHours,
        setEntities,
        setFullOrder,
        setMainSlotId,
        setActiveId,
        setLastResetDate,
        setDayType,
        setHolidayDaily,
        setFocusDaily,
        setAllocatorIndex,
        setEnergyHours,
        setAutoBorrow,
        setPreferredDefaultDayType,
        setAppTimezone,
        setAutoDayReset,
        setDayResetClock,
        setDayConsumedRunSeconds,
        setRunWallAnchorMs,
      });
      if (ok) {
        storageRevRef.current = rev;
        bumpLocalDashboardWriteTs();
        // After commit: wall-clock advance for payload anchor (multi-device / other tab).
        window.setTimeout(() => flushRunnerWallCatchUp({ force: true }), 0);
      }
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || e.newValue == null) {
        return;
      }
      applyFromOtherTab(e.newValue);
    };

    /** Same-tab: wall-clock runner catch-up, then merge localStorage when visible. */
    const catchUpFromLocalStorage = () => {
      if (document.visibilityState !== "visible") {
        return;
      }
      flushRunnerWallCatchUp();
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw == null) {
        return;
      }
      applyFromOtherTab(raw);
    };

    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", catchUpFromLocalStorage);
    window.addEventListener("focus", catchUpFromLocalStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", catchUpFromLocalStorage);
      window.removeEventListener("focus", catchUpFromLocalStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setters stable
  }, [localHydrated, flushRunnerWallCatchUp]);

  /** Logged in: pull remote row once (LWW vs local write time), then upsert if local is newer or row missing. */
  useEffect(() => {
    if (!localHydrated || authLoading || !user?.id) {
      return;
    }

    const uid = user.id;
    setCloudSyncReady(false);
    let cancelled = false;

    void (async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from(USER_DASHBOARD_TABLE)
          .select("payload, updated_at")
          .eq("user_id", uid)
          .maybeSingle();

        if (cancelled) {
          return;
        }

        if (error) {
          console.error("[nexus] cloud fetch:", error.message);
          return;
        }

        const preferServer = shouldPreferServerAfterLogout();
        const localTs = getLocalDashboardWriteTs();
        const localMs = new Date(localTs).getTime();
        /** Guest / new device bumps local write time constantly — must not beat server until we’ve ack’d this user once. */
        const neverAckedServerForUser =
          getLastServerUpdatedAt(uid) === NO_SERVER_ACK_ISO;
        const snap = persistSnapshotRef.current;
        if (!snap) {
          return;
        }

        const iso = new Date().toISOString();

        if (data?.payload && typeof data.updated_at === "string") {
          const serverMs = new Date(data.updated_at).getTime();
          if (preferServer || neverAckedServerForUser || serverMs > localMs) {
            const ok = applyDashboardFromPersisted(data.payload, {
              todayKey: hydrateTodayKeyFromPayload(data.payload),
              resetEntityDay,
              defaultEnergyHours,
              setEntities,
              setFullOrder,
              setMainSlotId,
              setActiveId,
              setLastResetDate,
              setDayType,
              setHolidayDaily,
              setFocusDaily,
              setAllocatorIndex,
              setEnergyHours,
              setAutoBorrow,
              setPreferredDefaultDayType,
              setAppTimezone,
              setAutoDayReset,
              setDayResetClock,
              setDayConsumedRunSeconds,
              setRunWallAnchorMs,
            });
            if (ok) {
              window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data.payload));
              storageRevRef.current = Math.max(
                storageRevRef.current,
                readStorageRevision(data.payload)
              );
              const fpPulled = fingerprintFromPersistedUnknown(data.payload);
              if (fpPulled != null) {
                lastWrittenPersistFingerprintRef.current = fpPulled;
              }
              setLocalDashboardWriteTs(data.updated_at);
              setLastServerUpdatedAt(uid, data.updated_at);
              cloudQuietUntilRef.current = Date.now() + 3000;
              clearPreferServerAfterLogout();
              setCloudConflictOpen(false);
              window.setTimeout(() => flushRunnerWallCatchUp({ force: true }), 0);
            }
          } else if (hasCloudVersionConflict(data.updated_at, uid)) {
            setCloudConflictOpen(true);
          } else {
            const { data: up, error: upErr } = await supabase
              .from(USER_DASHBOARD_TABLE)
              .upsert(
                { user_id: uid, payload: snap, updated_at: iso },
                { onConflict: "user_id" }
              )
              .select("updated_at")
              .single();
            if (!upErr && up?.updated_at) {
              setLocalDashboardWriteTs(up.updated_at);
              setLastServerUpdatedAt(uid, up.updated_at);
            } else if (upErr) {
              console.error("[nexus] cloud upsert:", upErr.message);
            }
            clearPreferServerAfterLogout();
          }
        } else {
          const { data: up, error: upErr } = await supabase
            .from(USER_DASHBOARD_TABLE)
            .upsert(
              { user_id: uid, payload: snap, updated_at: iso },
              { onConflict: "user_id" }
            )
            .select("updated_at")
            .single();
          if (!upErr && up?.updated_at) {
            setLocalDashboardWriteTs(up.updated_at);
            setLastServerUpdatedAt(uid, up.updated_at);
            clearPreferServerAfterLogout();
          } else if (upErr) {
            console.error("[nexus] cloud upsert (new row):", upErr.message);
          }
        }
      } catch (e) {
        console.error("[nexus] cloud sync:", e);
      } finally {
        if (!cancelled) {
          setCloudSyncReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate setters stable; re-run only when auth/local gate changes
  }, [localHydrated, user?.id, authLoading, flushRunnerWallCatchUp]);

  /** Debounced upload while logged in (after initial cloud compare). */
  useEffect(() => {
    if (!user?.id || !localHydrated || !cloudSyncReady) {
      return;
    }
    if (Date.now() < cloudQuietUntilRef.current) {
      return;
    }

    const snap: PersistedV5 = {
      v: 5,
      entities,
      fullOrder,
      mainSlotId,
      activeId,
      lastResetDate,
      dayType,
      holidayDaily,
      focusDaily,
      allocatorIndex: safeAllocatorIndex,
      energyHours,
      autoBorrow,
      preferredDefaultDayType,
      appTimezone,
      autoDayReset,
      dayResetClock: normalizeClockHm(dayResetClock),
      dayConsumedRunSeconds,
      runWallAnchorMs,
      storageRevision: storageRevRef.current,
    };

    const uid = user.id;
    const t = window.setTimeout(() => {
      if (Date.now() < cloudQuietUntilRef.current) {
        return;
      }
      void (async () => {
        try {
          const supabase = createClient();
          const { data: meta } = await supabase
            .from(USER_DASHBOARD_TABLE)
            .select("updated_at")
            .eq("user_id", uid)
            .maybeSingle();
          if (hasCloudVersionConflict(meta?.updated_at ?? null, uid)) {
            setCloudConflictOpen(true);
            return;
          }
          const iso = new Date().toISOString();
          const { data: up, error } = await supabase
            .from(USER_DASHBOARD_TABLE)
            .upsert(
              { user_id: uid, payload: snap, updated_at: iso },
              { onConflict: "user_id" }
            )
            .select("updated_at")
            .single();
          if (!error && up?.updated_at) {
            setLocalDashboardWriteTs(up.updated_at);
            setLastServerUpdatedAt(uid, up.updated_at);
          } else if (error) {
            console.error("[nexus] cloud push:", error.message);
          }
        } catch (e) {
          console.error("[nexus] cloud push:", e);
        }
      })();
    }, 2800);

    return () => window.clearTimeout(t);
  }, [
    user?.id,
    localHydrated,
    cloudSyncReady,
    entities,
    fullOrder,
    mainSlotId,
    activeId,
    lastResetDate,
    dayType,
    holidayDaily,
    focusDaily,
    safeAllocatorIndex,
    energyHours,
    autoBorrow,
    preferredDefaultDayType,
    appTimezone,
    autoDayReset,
    dayResetClock,
    dayConsumedRunSeconds,
    runWallAnchorMs,
  ]);

  /** No Realtime: pull on focus/pageshow + interval backup (tighter while `activeId` set). */
  useEffect(() => {
    if (!user?.id || !cloudSyncReady) {
      return;
    }

    const uid = user.id;
    const pollMs = activeId ? CLOUD_PULL_INTERVAL_MS_RUNNING : CLOUD_PULL_INTERVAL_MS_IDLE;

    const tryPullRemote = async () => {
      if (document.visibilityState !== "visible") {
        return;
      }
      if (Date.now() < cloudQuietUntilRef.current) {
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from(USER_DASHBOARD_TABLE)
          .select("payload, updated_at")
          .eq("user_id", uid)
          .maybeSingle();

        if (error) {
          console.error("[nexus] cloud pull:", error.message);
          return;
        }
        if (!data?.updated_at || data.payload === null || data.payload === undefined) {
          return;
        }

        const remoteMs = new Date(data.updated_at).getTime();
        const knownMs = new Date(getLastServerUpdatedAt(uid)).getTime();
        if (remoteMs <= knownMs) {
          return;
        }

        const ok = applyDashboardFromPersisted(data.payload, {
          todayKey: hydrateTodayKeyFromPayload(data.payload),
          resetEntityDay,
          defaultEnergyHours,
          setEntities,
          setFullOrder,
          setMainSlotId,
          setActiveId,
          setLastResetDate,
          setDayType,
          setHolidayDaily,
          setFocusDaily,
          setAllocatorIndex,
          setEnergyHours,
          setAutoBorrow,
          setPreferredDefaultDayType,
          setAppTimezone,
          setAutoDayReset,
          setDayResetClock,
          setDayConsumedRunSeconds,
          setRunWallAnchorMs,
        });
        if (ok) {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data.payload));
          storageRevRef.current = Math.max(
            storageRevRef.current,
            readStorageRevision(data.payload)
          );
          const fpPulled = fingerprintFromPersistedUnknown(data.payload);
          if (fpPulled != null) {
            lastWrittenPersistFingerprintRef.current = fpPulled;
          }
          setLocalDashboardWriteTs(data.updated_at);
          setLastServerUpdatedAt(uid, data.updated_at);
          cloudQuietUntilRef.current = Date.now() + 3000;
          setCloudConflictOpen(false);
          window.setTimeout(() => flushRunnerWallCatchUp({ force: true }), 0);
        }
      } catch (e) {
        console.error("[nexus] cloud pull:", e);
      }
    };

    const onVisible = () => {
      void tryPullRemote();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", onVisible);
    const pollId = window.setInterval(onVisible, pollMs);

    void tryPullRemote();

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onVisible);
      window.clearInterval(pollId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setters stable; activeId only changes poll period
  }, [user?.id, cloudSyncReady, flushRunnerWallCatchUp, activeId]);

  /** Apply newest Supabase row locally (after optimistic-lock conflict). */
  const loadLatestCloudDashboard = useCallback(async () => {
    const uid = user?.id;
    if (!uid) {
      setCloudConflictOpen(false);
      return;
    }
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from(USER_DASHBOARD_TABLE)
        .select("payload, updated_at")
        .eq("user_id", uid)
        .maybeSingle();
      if (error || !data?.updated_at || data.payload === null || data.payload === undefined) {
        console.error("[nexus] load latest:", error?.message ?? "no row");
        return;
      }
      const ok = applyDashboardFromPersisted(data.payload, {
        todayKey: hydrateTodayKeyFromPayload(data.payload),
        resetEntityDay,
        defaultEnergyHours,
        setEntities,
        setFullOrder,
        setMainSlotId,
        setActiveId,
        setLastResetDate,
        setDayType,
        setHolidayDaily,
        setFocusDaily,
        setAllocatorIndex,
        setEnergyHours,
        setAutoBorrow,
        setPreferredDefaultDayType,
        setAppTimezone,
        setAutoDayReset,
        setDayResetClock,
        setDayConsumedRunSeconds,
        setRunWallAnchorMs,
      });
      if (ok) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data.payload));
        storageRevRef.current = Math.max(
          storageRevRef.current,
          readStorageRevision(data.payload)
        );
        const fpPulled = fingerprintFromPersistedUnknown(data.payload);
        if (fpPulled != null) {
          lastWrittenPersistFingerprintRef.current = fpPulled;
        }
        setLocalDashboardWriteTs(data.updated_at);
        setLastServerUpdatedAt(uid, data.updated_at);
        cloudQuietUntilRef.current = Date.now() + 3000;
        setCloudConflictOpen(false);
        window.setTimeout(() => flushRunnerWallCatchUp({ force: true }), 0);
      }
    } catch (e) {
      console.error("[nexus] load latest:", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dashboard setters stable
  }, [user?.id, flushRunnerWallCatchUp]);

  const tryNotifyDayRoll = useCallback(() => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") {
      return;
    }
    if (document.visibilityState !== "visible" || !document.hasFocus()) {
      return;
    }
    try {
      new Notification("5Nexus — new app day", {
        body:
          "Daily run timers and energy counters reset. Your nexus list and checklist stay as they are.",
        tag: "nexus-day-roll",
      });
    } catch {
      /* ignore */
    }
  }, []);

  const confirmAppDayRoll = useCallback(
    (newDayKey: string) => {
      setEntities((e) => e.map(resetEntityDay));
      setActiveId(null);
      setDayConsumedRunSeconds(0);
      setRunWallAnchorMs(null);
      setLastResetDate(newDayKey);
      setDayRollModal(null);
      setDayRollSnoozeUntil(null);
      dayRollSnoozeUntilRef.current = null;
      tryNotifyDayRoll();
      // Fresh day: jump to Daily so user can set day type / slots without hunting Settings.
      setSettingsAccordion("daily");
      setSettingsOpen(true);
    },
    [tryNotifyDayRoll]
  );

  const snoozeDayRollMinutes = useCallback((minutes: number) => {
    const until = Date.now() + minutes * 60_000;
    dayRollSnoozeUntilRef.current = until;
    setDayRollSnoozeUntil(until);
    setDayRollModal(null);
  }, []);

  useEffect(() => {
    if (!autoDayReset) {
      setDayRollModal(null);
      setDayRollSnoozeUntil(null);
      dayRollSnoozeUntilRef.current = null;
    }
  }, [autoDayReset]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = new Date();
      setClock(now);
      const dk = getEffectiveDashboardDayKey(
        now,
        appTimezone,
        normalizeClockHm(dayResetClock),
        autoDayReset
      );
      const nowMs = Date.now();
      let snoozeUntil = dayRollSnoozeUntilRef.current;
      if (snoozeUntil !== null && nowMs >= snoozeUntil) {
        snoozeUntil = null;
        dayRollSnoozeUntilRef.current = null;
        setDayRollSnoozeUntil(null);
      }
      const lr = lastResetDateRef.current;
      if (autoDayReset) {
        if (lr === dk) {
          setDayRollModal((prev) => (prev ? null : prev));
        } else {
          const snoozing = snoozeUntil !== null && nowMs < snoozeUntil;
          if (!snoozing) {
            setDayRollModal((prev) => {
              if (prev?.newDayKey === dk) {
                return prev;
              }
              return { newDayKey: dk };
            });
          }
        }
      }

      // Advance run timer while this browser tab is selected (`visible`). `hasFocus()` is omitted so
      // switching to another app (IDE, chat) does not pause — only switching away in the browser does.
      // Inactive tabs are `hidden`, so they do not double-tick in one window.
      if (document.visibilityState !== "visible") {
        return;
      }

      if (!activeId || !fullOrder.slice(0, k).includes(activeId)) {
        return;
      }
      const activeSlice = fullOrder.slice(0, k);
      setEntities((prev) => {
        const slot = prev.find((s) => s.id === activeId);
        if (!slot || slot.durationSeconds <= 0 || !activeSlice.includes(activeId)) {
          return prev;
        }

        let next = prev.map((e) => ({ ...e }));
        const cur = () => next.find((s) => s.id === activeId)!;

        if (cur().elapsedSeconds >= cur().durationSeconds) {
          if (!autoBorrow) {
            // Clear run slot in same turn so payload + Supabase debounce see paused state.
            queueMicrotask(() => setActiveId(null));
            return prev;
          }
          const borrowed = applyBorrowFromDonors(next, activeId, activeSlice, 1, {
            markOverspent: true,
          });
          if (!borrowed) {
            queueMicrotask(() => setActiveId(null));
            return prev;
          }
          next = borrowed;
        }

        const s = cur();
        if (s.elapsedSeconds < s.durationSeconds) {
          setDayConsumedRunSeconds((c) => c + 1);
          const tickAt = Date.now();
          queueMicrotask(() => {
            setRunWallAnchorMs(tickAt);
            runWallAnchorMsRef.current = tickAt;
          });
          return next.map((x) =>
            x.id === activeId ? { ...x, elapsedSeconds: x.elapsedSeconds + 1 } : x
          );
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [
    activeId,
    k,
    fullOrder.join("|"),
    autoBorrow,
    appTimezone,
    autoDayReset,
    dayResetClock,
  ]);

  const totals = useMemo(() => {
    const spent = dayConsumedRunSeconds;
    const remainingEnergy = Math.max(0, energyBudgetSeconds - spent);
    const progress =
      energyBudgetSeconds <= 0 ? 0 : Math.min((spent / energyBudgetSeconds) * 100, 100);
    const energyDepletedWhileRunning = Boolean(
      activeId && spent >= energyBudgetSeconds
    );
    return { spent, remainingEnergy, progress, energyDepletedWhileRunning };
  }, [dayConsumedRunSeconds, energyBudgetSeconds, activeId]);

  const effectiveAppDayKey = useMemo(() => {
    if (!clock) {
      return lastResetDate;
    }
    return getEffectiveDashboardDayKey(
      clock,
      appTimezone,
      normalizeClockHm(dayResetClock),
      autoDayReset
    );
  }, [clock, lastResetDate, appTimezone, dayResetClock, autoDayReset]);

  const showDayRollSnoozeBanner =
    autoDayReset &&
    clock != null &&
    dayRollSnoozeUntil != null &&
    clock.getTime() < dayRollSnoozeUntil &&
    lastResetDate !== effectiveAppDayKey;

  useEffect(() => {
    if (!activeId) {
      return;
    }
    if (!activeIds.includes(activeId)) {
      setActiveId(null);
      return;
    }
    const slot = entityById.get(activeId);
    if (!slot || slot.durationSeconds <= 0) {
      setActiveId(null);
    }
  }, [activeId, entityById, activeIds]);

  /** Pause / cap-stop: drop wall anchor (start + hydrate set it explicitly). */
  useEffect(() => {
    const prev = prevActiveIdForRunnerAnchorRef.current;
    prevActiveIdForRunnerAnchorRef.current = activeId;
    if (prev !== undefined && prev !== null && activeId === null) {
      setRunWallAnchorMs(null);
      runWallAnchorMsRef.current = null;
    }
  }, [activeId]);

  /** Donor highlight only for the current run session; clear when switching/pausing timer. */
  useEffect(() => {
    setEntities((prev) => {
      if (!prev.some((e) => e.donorAutoBorrow)) {
        return prev;
      }
      return prev.map((e) => ({ ...e, donorAutoBorrow: false }));
    });
  }, [activeId]);

  const mainSlot = entityById.get(mainSlotId) ?? entities[0];
  const supportSlots = activeIds
    .filter((id) => id !== mainSlotId)
    .map((id) => entityById.get(id))
    .filter(Boolean) as NexusSlot[];

  const parkedIds = fullOrder.slice(k);

  const applyAllocation = useCallback(() => {
    if (k <= 0 || presets.length === 0) {
      return;
    }
    const pct = presets[safeAllocatorIndex];
    if (!pct || pct.length !== k) {
      return;
    }
    const seconds = distributeSeconds(energyBudgetSeconds, pct);
    const idToSec = new Map(activeIds.map((id, i) => [id, seconds[i] ?? 0]));
    const sliceIds = activeIds;
    setEntities((prev) => {
      const next = prev.map((e) => {
        const d = idToSec.get(e.id);
        if (d === undefined) {
          return {
            ...e,
            durationSeconds: 0,
            overspentAuto: false,
            donorAutoBorrow: false,
            elapsedSeconds: e.elapsedSeconds,
          };
        }
        return {
          ...e,
          durationSeconds: d,
          elapsedSeconds: e.elapsedSeconds,
          overspentAuto: false,
          donorAutoBorrow: false,
        };
      });
      let sumActive = 0;
      for (const id of sliceIds) {
        sumActive += next.find((x) => x.id === id)?.elapsedSeconds ?? 0;
      }
      queueMicrotask(() =>
        setDayConsumedRunSeconds((c) => Math.max(c, sumActive))
      );
      return next;
    });
  }, [k, presets, safeAllocatorIndex, energyBudgetSeconds, activeIds]);

  useEffect(() => {
    if (!allocationConfirmOpen) {
      return;
    }
    const id = window.setInterval(() => {
      setAllocationConfirmCooldown((t) => {
        if (t <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [allocationConfirmOpen]);

  useEffect(() => {
    if (!energyHoursConfirmOpen) {
      return;
    }
    const id = window.setInterval(() => {
      setEnergyHoursConfirmCooldown((t) => {
        if (t <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [energyHoursConfirmOpen]);

  useEffect(() => {
    if (!timezoneConfirmOpen) {
      return;
    }
    const id = window.setInterval(() => {
      setTimezoneConfirmCooldown((t) => {
        if (t <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timezoneConfirmOpen]);

  useEffect(() => {
    return () => {
      if (dayTypeLongPressTimerRef.current != null) {
        window.clearTimeout(dayTypeLongPressTimerRef.current);
      }
    };
  }, []);

  const requestApplyAllocation = useCallback(() => {
    if (k <= 0 || presets.length === 0) {
      return;
    }
    const pct = presets[safeAllocatorIndex];
    if (!pct || pct.length !== k) {
      return;
    }
    if (!hasAppliedAllocationOnceRef.current) {
      applyAllocation();
      hasAppliedAllocationOnceRef.current = true;
      return;
    }
    setAllocationConfirmCooldown(2);
    setAllocationConfirmOpen(true);
  }, [k, presets, safeAllocatorIndex, applyAllocation]);

  const commitEnergyHoursDraft = useCallback(() => {
    setEnergyHours(energyDraft);
    setEnergyHoursConfirmOpen(false);
  }, [energyDraft]);

  const requestSaveEnergyHours = useCallback(() => {
    if (JSON.stringify(energyDraft) === JSON.stringify(energyHours)) {
      return;
    }
    setEnergyHoursConfirmCooldown(2);
    setEnergyHoursConfirmOpen(true);
  }, [energyDraft, energyHours]);

  const clearDayTypeLongPressTimer = useCallback(() => {
    if (dayTypeLongPressTimerRef.current != null) {
      window.clearTimeout(dayTypeLongPressTimerRef.current);
      dayTypeLongPressTimerRef.current = null;
    }
  }, []);

  /** Settings → App only: hold 2s on a row to set `preferredDefaultDayType` (does not change today’s type). */
  const onPreferredDefaultPointerDown = useCallback(
    (dt: DayType) => {
      clearDayTypeLongPressTimer();
      dayTypeLongPressTimerRef.current = window.setTimeout(() => {
        dayTypeLongPressTimerRef.current = null;
        setPreferredDefaultDayType(dt);
      }, 2000);
    },
    [clearDayTypeLongPressTimer]
  );

  const onPreferredDefaultPointerEnd = useCallback(() => {
    clearDayTypeLongPressTimer();
  }, [clearDayTypeLongPressTimer]);

  const openTimezoneConfirmFromEdit = useCallback(() => {
    const t = timezoneDraft.trim();
    if (!isValidIanaTimeZone(t)) {
      return;
    }
    setTimezoneEditOpen(false);
    setTimezoneConfirmCooldown(2);
    setTimezoneConfirmOpen(true);
  }, [timezoneDraft]);

  const applyTimezoneDraft = useCallback(() => {
    const t = timezoneDraft.trim();
    if (!isValidIanaTimeZone(t)) {
      return;
    }
    setAppTimezone(t);
    setTimezoneConfirmOpen(false);
  }, [timezoneDraft]);

  /**
   * Push current dashboard to Supabase immediately (bypass debounce), then sign out.
   * Avoids losing the latest edits if the user re-signs in before the 2.8s delayed upsert runs.
   */
  const handleSignOut = useCallback(async () => {
    const uid = user?.id;
    let abortSignOut = false;
    if (uid && localHydrated) {
      setSignOutFlushing(true);
      try {
        const supabase = createClient();
        const { data: meta } = await supabase
          .from(USER_DASHBOARD_TABLE)
          .select("updated_at")
          .eq("user_id", uid)
          .maybeSingle();
        if (hasCloudVersionConflict(meta?.updated_at ?? null, uid)) {
          setCloudConflictOpen(true);
          abortSignOut = true;
        } else {
          const snap: PersistedV5 = {
            v: 5,
            entities,
            fullOrder,
            mainSlotId,
            activeId,
            lastResetDate,
            dayType,
            holidayDaily,
            focusDaily,
            allocatorIndex: safeAllocatorIndex,
            energyHours,
            autoBorrow,
            preferredDefaultDayType,
            appTimezone,
            autoDayReset,
            dayResetClock: normalizeClockHm(dayResetClock),
            dayConsumedRunSeconds,
            runWallAnchorMs,
            storageRevision: storageRevRef.current,
          };
          const iso = new Date().toISOString();
          const { data: up, error } = await supabase
            .from(USER_DASHBOARD_TABLE)
            .upsert(
              { user_id: uid, payload: snap, updated_at: iso },
              { onConflict: "user_id" }
            )
            .select("updated_at")
            .single();
          if (!error && up?.updated_at) {
            setLocalDashboardWriteTs(up.updated_at);
            setLastServerUpdatedAt(uid, up.updated_at);
            cloudQuietUntilRef.current = Date.now() + 3000;
          } else if (error) {
            console.error("[nexus] pre-sign-out upsert:", error.message);
          }
        }
      } catch (e) {
        console.error("[nexus] pre-sign-out upsert:", e);
      } finally {
        setSignOutFlushing(false);
      }
    }
    if (!abortSignOut) {
      await signOut();
    }
    // Guest reset + clear + prefer-server flag run in the auth `user` effect (all tabs).
  }, [
    user?.id,
    localHydrated,
    signOut,
    entities,
    fullOrder,
    mainSlotId,
    activeId,
    lastResetDate,
    dayType,
    holidayDaily,
    focusDaily,
    safeAllocatorIndex,
    energyHours,
    autoBorrow,
    preferredDefaultDayType,
    appTimezone,
    autoDayReset,
    dayResetClock,
    dayConsumedRunSeconds,
    runWallAnchorMs,
  ]);

  const toggleTimer = (slotId: string) => {
    if (!activeIds.includes(slotId)) {
      return;
    }
    const candidate = entityById.get(slotId);
    if (
      !candidate ||
      candidate.durationSeconds <= 0 ||
      candidate.elapsedSeconds >= candidate.durationSeconds
    ) {
      return;
    }
    setActiveId((prev) => {
      if (prev === slotId) {
        return null;
      }
      const t = Date.now();
      queueMicrotask(() => {
        setRunWallAnchorMs(t);
        runWallAnchorMsRef.current = t;
      });
      return slotId;
    });
  };

  /** End auto-borrow overspend session: pause + clear rose on recipient & donors (same as pause, plus flags). */
  const finishOverspendSession = () => {
    setActiveId(null);
    setEntities((prev) =>
      prev.map((e) => ({ ...e, overspentAuto: false, donorAutoBorrow: false }))
    );
  };

  const handleStartPauseForSlot = (slotId: string) => {
    if (activeId === slotId) {
      const slot = entityById.get(slotId);
      if (slot?.overspentAuto) {
        finishOverspendSession();
        return;
      }
    }
    toggleTimer(slotId);
  };

  /** Minutes & seconds 0–60 (inclusive) per UI; applied on blur and when moving time. */
  const clampHmsSegment = (raw: string, max: number) => {
    const n = Math.floor(Number(String(raw).replace(/\D/g, "")) || 0);
    return Math.max(0, Math.min(max, n));
  };

  const openTransferModal = (donorId: string) => {
    if (!activeIds.includes(donorId)) {
      return;
    }
    setTransferDonorId(donorId);
    setTransferRecipientId(
      activeIds.find((id) => id !== donorId) ?? null
    );
    setTransferH("0");
    setTransferM("00");
    setTransferS("00");
  };

  const applyManualTransfer = () => {
    if (!transferDonorId || !transferRecipientId || transferDonorId === transferRecipientId) {
      setTransferDonorId(null);
      return;
    }
    const hh = Math.max(0, Math.floor(Number(transferH.replace(/\D/g, "")) || 0));
    const mm = clampHmsSegment(transferM, 60);
    const ss = clampHmsSegment(transferS, 60);
    const requested = hh * 3600 + mm * 60 + ss;
    if (requested <= 0) {
      return;
    }
    setEntities((prev) => {
      const from = prev.find((e) => e.id === transferDonorId);
      const to = prev.find((e) => e.id === transferRecipientId);
      if (!from || !to) {
        return prev;
      }
      const avail = from.durationSeconds - from.elapsedSeconds;
      const amount = Math.min(requested, avail);
      if (amount <= 0) {
        return prev;
      }
      return prev.map((e) => {
        if (e.id === transferDonorId) {
          return { ...e, durationSeconds: e.durationSeconds - amount, donorAutoBorrow: false };
        }
        if (e.id === transferRecipientId) {
          return {
            ...e,
            durationSeconds: e.durationSeconds + amount,
            overspentAuto: false,
            donorAutoBorrow: false,
          };
        }
        return e;
      });
    });
    setTransferDonorId(null);
  };

  const slotCanStart = (slot: NexusSlot) =>
    slot.durationSeconds > 0 && slot.elapsedSeconds < slot.durationSeconds;

  const updateEntity = (id: string, fn: (e: NexusSlot) => NexusSlot) => {
    setEntities((prev) => prev.map((e) => (e.id === id ? fn(e) : e)));
  };

  const getPriorityRankForActive = (id: string) => {
    const idx = activeIds.indexOf(id);
    return idx >= 0 ? idx + 1 : 0;
  };

  const handleDropOnMain = () => {
    if (!draggingId || draggingId === mainSlotId || !activeIds.includes(draggingId)) {
      return;
    }
    setMainSlotId(draggingId);
    setDraggingId(null);
  };

  const onParkedDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const raw = event.dataTransfer.getData("application/x-nexus-parked");
    if (!raw) {
      return;
    }
    try {
      const { id } = JSON.parse(raw) as { id: string };
      if (id && parkedIds.includes(id)) {
        setSwapModal({ sourceId: id });
      }
    } catch {
      /* ignore */
    }
  };

  const onMainColumnDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const raw = event.dataTransfer.getData("application/x-nexus-parked");
    if (raw) {
      try {
        const { id } = JSON.parse(raw) as { id: string };
        if (id && parkedIds.includes(id)) {
          setSwapModal({ sourceId: id });
        }
      } catch {
        /* ignore */
      }
      return;
    }
    handleDropOnMain();
  };

  const applyParkedOntoDaily = (parkedEntityId: string, dailyEntityId: string) => {
    const parked = entityById.get(parkedEntityId);
    if (!parked || !parkedIds.includes(parkedEntityId)) {
      setSwapModal(null);
      return;
    }
    setEntities((prev) => {
      const next = prev
        .filter((e) => e.id !== parkedEntityId)
        .map((e) =>
          e.id === dailyEntityId
            ? {
                ...e,
                title: parked.title,
                note: parked.note,
                checklist: parked.checklist.map((c) => ({ ...c })),
              }
            : e
        );
      return next;
    });
    setFullOrder((o) => o.filter((id) => id !== parkedEntityId));
    if (mainSlotId === parkedEntityId) {
      setMainSlotId(dailyEntityId);
    }
    setActiveId((cur) => (cur === parkedEntityId ? null : cur));
    setSwapModal(null);
  };

  const startEditCard = (slot: NexusSlot) => {
    setEditingCardId(slot.id);
    setEditDraft({ title: slot.title, note: slot.note });
  };

  const saveEditCard = (slotId: string) => {
    const t = editDraft.title.trim();
    const n = editDraft.note.trim();
    updateEntity(slotId, (e) => ({
      ...e,
      title: t || e.title,
      note: n || e.note,
    }));
    setEditingCardId(null);
  };

  const moveReorder = (fromId: string, toId: string) => {
    if (fromId === toId) {
      return;
    }
    setFullOrder((order) => {
      const next = [...order];
      const fi = next.indexOf(fromId);
      const ti = next.indexOf(toId);
      if (fi < 0 || ti < 0) {
        return order;
      }
      next.splice(fi, 1);
      next.splice(ti, 0, fromId);
      return next;
    });
  };

  const addParkedNexus = () => {
    const title = addTitle.trim();
    if (!title || entities.length >= MAX_NEXUS) {
      return;
    }
    const id = `nx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setEntities((prev) => [
      ...prev,
      {
        id,
        title,
        note: addNote.trim(),
        durationSeconds: 0,
        elapsedSeconds: 0,
        checklist: [],
      },
    ]);
    setFullOrder((o) => [...o, id]);
    setAddTitle("");
    setAddNote("");
    setShowAddParkedForm(false);
  };

  const deleteParkedEntity = (id: string) => {
    if (!parkedIds.includes(id)) {
      return;
    }
    setEntities((prev) => prev.filter((e) => e.id !== id));
    setFullOrder((o) => o.filter((x) => x !== id));
    setActiveId((cur) => (cur === id ? null : cur));
  };

  const reorderDropOnRow = (targetId: string) => {
    if (reorderDragId) {
      moveReorder(reorderDragId, targetId);
      setReorderDragId(null);
    }
  };

  // Nested control strip: between page (zinc-950) and header face (zinc-900).
  const panelMuted = isDark ? "border-zinc-700/45 bg-zinc-800/65" : "border-zinc-300 bg-white/80";
  const inputCls = isDark
    ? "border-zinc-700 bg-zinc-900 text-zinc-100"
    : "border-zinc-300 bg-zinc-50 text-zinc-900";
  /** Accordion top-level rows: larger type than submenu; no color swap when open. */
  const settingsSectionHeaderCls = [
    "flex w-full items-center justify-between rounded-lg border px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide transition-colors sm:px-2.5 sm:py-2 sm:text-sm",
    panelMuted,
  ].join(" ");
  /** Submenu: right gutter + slight left inset so it reads one step below the section title. */
  const settingsSubPanelCls = "mt-2 space-y-2 pl-2 pr-4 sm:pl-2.5 sm:pr-5";

  const checklistFns = (slotId: string) => ({
    toggle: (itemId: string) =>
      updateEntity(slotId, (e) => ({
        ...e,
        checklist: e.checklist.map((item) =>
          item.id === itemId ? { ...item, done: !item.done } : item
        ),
      })),
    add: (text: string) =>
      updateEntity(slotId, (e) => {
        if (e.checklist.length >= 5) {
          return e;
        }
        return {
          ...e,
          checklist: [
            ...e.checklist,
            { id: `${Date.now()}-${Math.random()}`, text, done: false },
          ],
        };
      }),
    update: (itemId: string, text: string) =>
      updateEntity(slotId, (e) => ({
        ...e,
        checklist: e.checklist.map((item) =>
          item.id === itemId ? { ...item, text } : item
        ),
      })),
    del: (itemId: string) =>
      updateEntity(slotId, (e) => ({
        ...e,
        checklist: e.checklist.filter((item) => item.id !== itemId),
      })),
  });

  return (
    <div
      className={[
        "flex h-dvh max-h-dvh w-full flex-col overflow-hidden transition-colors",
        isDark
          ? "bg-zinc-950 text-zinc-100"
          : "bg-gradient-to-b from-zinc-100 to-slate-100 text-zinc-900",
      ].join(" ")}
    >
      {showDayRollSnoozeBanner ? (
        <div
          className={[
            "flex shrink-0 items-center justify-between gap-2 border-b px-2.5 py-1.5 sm:px-3",
            isDark ? "border-amber-900/50 bg-amber-950/40" : "border-amber-200 bg-amber-50",
          ].join(" ")}
          role="status"
        >
          <p className="min-w-0 text-[10px] leading-snug sm:text-[11px]">
            <span className="font-semibold text-amber-800 dark:text-amber-200">Overtime:</span>{" "}
            <span className="text-zinc-700 dark:text-zinc-300">
              Day roll snoozed — timers keep running. Open reset when you are done.
            </span>
          </p>
          <button
            type="button"
            onClick={() => {
              const dk = getEffectiveDashboardDayKey(
                new Date(),
                appTimezone,
                normalizeClockHm(dayResetClock),
                autoDayReset
              );
              setDayRollModal({ newDayKey: dk });
            }}
            className={[
              "shrink-0 rounded-lg border px-2 py-1 text-[10px] font-semibold sm:text-[11px]",
              isDark
                ? "border-amber-600/60 text-amber-200"
                : "border-amber-500 text-amber-900",
            ].join(" ")}
          >
            Reset day…
          </button>
        </div>
      ) : null}

      {settingsOpen ? (
        <button
          type="button"
          aria-label="Close settings"
          className="fixed inset-0 z-40 cursor-default bg-black/45 backdrop-blur-[1px]"
          onClick={() => setSettingsOpen(false)}
        />
      ) : null}

      <aside
        className={[
          "fixed z-50 flex flex-col overflow-hidden border shadow-2xl transition-transform duration-300",
          "inset-0 w-full md:inset-y-2 md:left-2 md:h-[calc(100dvh-1rem)] md:w-[min(100%,22rem)] md:rounded-2xl",
          isDark ? "border-zinc-800 bg-zinc-950" : "border-zinc-300 bg-white",
          settingsOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div
          className={[
            "flex shrink-0 items-center justify-between border-b px-2.5 py-2",
            isDark ? "border-zinc-800" : "border-zinc-200",
          ].join(" ")}
        >
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em]">Settings</h2>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleTheme}
              className={[
                "flex h-8 w-8 items-center justify-center rounded-lg border text-sm",
                isDark ? "border-zinc-700 bg-zinc-900" : "border-zinc-300 bg-zinc-50",
              ].join(" ")}
              title={isDark ? "Light" : "Dark"}
              aria-label="Toggle theme"
            >
              {isDark ? "☀" : "☾"}
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              className={["rounded-lg border px-2 py-1 text-[10px]", inputCls].join(" ")}
            >
              Close
            </button>
          </div>
        </div>

        <div className="hide-scrollbar min-h-0 flex-1 overflow-y-auto px-2.5 py-2">
          <div className="mb-1.5">
            <button
              type="button"
              aria-expanded={settingsAccordion === "daily"}
              onClick={() =>
                setSettingsAccordion((cur) => (cur === "daily" ? null : "daily"))
              }
              className={settingsSectionHeaderCls}
            >
              Daily
              <span className="tabular-nums">{settingsAccordion === "daily" ? "−" : "+"}</span>
            </button>
            {settingsAccordion === "daily" ? (
              <div className={settingsSubPanelCls}>
                <div>
                  <label className="text-[9px] uppercase text-zinc-500">Day type (today)</label>
                  <select
                    value={dayType}
                    onChange={(e) => setDayType(e.target.value as DayType)}
                    className={["mt-0.5 w-full rounded-lg border px-2 py-1 text-xs", inputCls].join(
                      " "
                    )}
                  >
                    <option value="default">Normal (max 5 today)</option>
                    <option value="focus">Focus (max 3 today)</option>
                    <option value="holiday">Holiday (0–1 today)</option>
                  </select>
                </div>

                {dayType === "holiday" ? (
                  <div>
                    <label className="text-[9px] uppercase text-zinc-500">Holiday · nexus today</label>
                    <select
                      value={holidayDaily}
                      onChange={(e) =>
                        setHolidayDaily(Number(e.target.value) as HolidayDailySlots)
                      }
                      className={["mt-0.5 w-full rounded-lg border px-2 py-1 text-xs", inputCls].join(
                        " "
                      )}
                    >
                      <option value={0}>0 — no nexus</option>
                      <option value={1}>1 — 100% allocation</option>
                    </select>
                  </div>
                ) : null}

                {dayType === "focus" ? (
                  <div>
                    <label className="text-[9px] uppercase text-zinc-500">Focus · slots today</label>
                    <select
                      value={focusDaily}
                      onChange={(e) =>
                        setFocusDaily(Number(e.target.value) as FocusDailySlots)
                      }
                      className={["mt-0.5 w-full rounded-lg border px-2 py-1 text-xs", inputCls].join(
                        " "
                      )}
                    >
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                    </select>
                  </div>
                ) : null}

                <p className="text-[9px] text-zinc-500">
                  Today <b>{k}</b> · Energy {energyHours[dayType]}h (
                  {formatSeconds(energyBudgetSeconds)})
                </p>

                {presets.length > 0 ? (
                  <div>
                    <label className="text-[9px] uppercase text-zinc-500">
                      Allocation (tap bar)
                    </label>
                    <div className="mt-1 space-y-1.5">
                      {presets.map((pct, idx) => (
                        <PresetMemoryBar
                          key={idx}
                          percentages={pct}
                          selected={idx === safeAllocatorIndex}
                          onSelect={() => setAllocatorIndex(idx)}
                          isDark={isDark}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={requestApplyAllocation}
                      className="mt-2 w-full rounded-lg border border-emerald-500/50 bg-emerald-500/10 py-1.5 text-[10px] text-emerald-500"
                    >
                      Apply allocation
                    </button>
                  </div>
                ) : (
                  <p className="text-[9px] text-zinc-500">No allocation for this day setup.</p>
                )}

                <div>
                  <label className="text-[9px] uppercase text-zinc-500">
                    Priority (drag ⋮⋮) · {entities.length}/{MAX_NEXUS} nexus
                  </label>
                  <ul className="mt-1 max-h-48 space-y-1 overflow-y-auto pr-0.5">
                    {fullOrder.map((id, idx) => {
                      const e = entityById.get(id);
                      if (!e) {
                        return null;
                      }
                      const isToday = idx < k;
                      return (
                        <li
                          key={id}
                          draggable
                          onDragStart={() => setReorderDragId(id)}
                          onDragEnd={() => setReorderDragId(null)}
                          onDragOver={(ev) => ev.preventDefault()}
                          onDrop={() => reorderDropOnRow(id)}
                          className={[
                            "flex items-center gap-1 rounded-lg border px-1.5 py-1 text-[10px]",
                            isToday
                              ? isDark
                                ? "border-emerald-800/50 bg-emerald-950/20"
                                : "border-emerald-200 bg-emerald-50/50"
                              : isDark
                                ? "border-zinc-800"
                                : "border-zinc-200",
                          ].join(" ")}
                        >
                          <span className="cursor-grab text-zinc-500" title="Drag">
                            ⋮⋮
                          </span>
                          <span className="w-4 shrink-0 text-zinc-500">#{idx + 1}</span>
                          <span className="min-w-0 flex-1 truncate font-medium">{e.title}</span>
                          <span
                            className={[
                              "shrink-0 rounded px-1 py-0.5 text-[8px] uppercase",
                              isToday ? "bg-emerald-500/20 text-emerald-500" : "bg-zinc-500/10",
                            ].join(" ")}
                          >
                            {isToday ? "today" : "parked"}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-[9px] uppercase text-zinc-500">Parked (extra)</label>
                    <button
                      type="button"
                      onClick={() => setShowAddParkedForm((s) => !s)}
                      className="text-[10px] text-emerald-500"
                    >
                      {showAddParkedForm ? "Cancel" : "+ Add nexus"}
                    </button>
                  </div>
                  {showAddParkedForm ? (
                    <div className="mt-1 space-y-1 rounded-lg border border-zinc-700/40 p-2">
                      <input
                        value={addTitle}
                        onChange={(e) => setAddTitle(e.target.value)}
                        placeholder="Title"
                        className={["w-full rounded border px-2 py-1 text-xs", inputCls].join(" ")}
                      />
                      <textarea
                        value={addNote}
                        onChange={(e) => setAddNote(e.target.value)}
                        placeholder="Description"
                        rows={2}
                        className={["w-full resize-none rounded border px-2 py-1 text-xs", inputCls].join(
                          " "
                        )}
                      />
                      <button
                        type="button"
                        disabled={entities.length >= MAX_NEXUS}
                        onClick={addParkedNexus}
                        className="w-full rounded border border-emerald-500/40 py-1 text-[10px] text-emerald-500 disabled:opacity-40"
                      >
                        Save nexus
                      </button>
                    </div>
                  ) : null}
                  <ul className="mt-1 max-h-40 space-y-1 overflow-y-auto">
                    {parkedIds.map((id) => {
                      const e = entityById.get(id);
                      if (!e) {
                        return null;
                      }
                      const fns = checklistFns(id);
                      return (
                        <li
                          key={id}
                          draggable
                          onDragStart={(ev) => {
                            ev.dataTransfer.setData(
                              "application/x-nexus-parked",
                              JSON.stringify({ id })
                            );
                            ev.dataTransfer.effectAllowed = "copyMove";
                          }}
                          className={[
                            "rounded-lg border p-1.5",
                            isDark ? "border-zinc-800" : "border-zinc-200",
                          ].join(" ")}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[10px] font-medium">{e.title}</p>
                              <p className="line-clamp-2 text-[9px] text-zinc-500">{e.note}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setParkedTasksForId((cur) => (cur === id ? null : id))
                              }
                              className="shrink-0 rounded border px-1.5 py-0.5 text-[9px]"
                            >
                              Tasks
                            </button>
                          </div>
                          {parkedTasksForId === id ? (
                            <div className="mt-1 space-y-0.5 border-t border-zinc-800/30 pt-1">
                              {e.checklist.map((item) => (
                                <label
                                  key={item.id}
                                  className="flex items-center gap-1 text-[9px]"
                                >
                                  <input
                                    type="checkbox"
                                    checked={item.done}
                                    onChange={() => fns.toggle(item.id)}
                                  />
                                  <span className={item.done ? "line-through opacity-60" : ""}>
                                    {item.text}
                                  </span>
                                </label>
                              ))}
                              <button
                                type="button"
                                onClick={() => deleteParkedEntity(id)}
                                className="mt-1 w-full text-[9px] text-rose-500"
                              >
                                Remove from pool
                              </button>
                            </div>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mb-1.5">
            <button
              type="button"
              aria-expanded={settingsAccordion === "app"}
              onClick={() => setSettingsAccordion((cur) => (cur === "app" ? null : "app"))}
              className={settingsSectionHeaderCls}
            >
              App
              <span className="tabular-nums">{settingsAccordion === "app" ? "−" : "+"}</span>
            </button>
            {settingsAccordion === "app" ? (
              <div className={`${settingsSubPanelCls} space-y-1.5 text-[10px]`}>
                {(["holiday", "default", "focus"] as const).map((key) => (
                  <label key={key} className="flex items-center justify-between gap-2">
                    <span className="text-zinc-500">
                      {key === "default" ? "Normal" : key === "focus" ? "Focus" : "Holiday"} hours
                    </span>
                    <input
                      type="number"
                      min={0.5}
                      step={0.5}
                      value={energyDraft[key]}
                      onChange={(e) =>
                        setEnergyDraft((prev) => ({
                          ...prev,
                          [key]: Number(e.target.value) || prev[key],
                        }))
                      }
                      className={["w-16 rounded border px-1 py-0.5 text-right", inputCls].join(" ")}
                    />
                  </label>
                ))}
                <button
                  type="button"
                  disabled={
                    JSON.stringify(energyDraft) === JSON.stringify(energyHours)
                  }
                  onClick={requestSaveEnergyHours}
                  className="w-full rounded-lg border border-emerald-500/50 bg-emerald-500/10 py-1.5 text-[10px] text-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Save energy hours
                </button>
                <p className="text-[8px] leading-snug text-zinc-500">
                  Changes apply after confirm (2s cooldown), like allocation.
                </p>

                <div>
                  <label className="text-[9px] uppercase text-zinc-500">Default day type</label>
                  <p className="mt-0.5 text-[8px] leading-snug text-zinc-500">
                    Hold 2s on a row to choose which type is your default — label shows “(default)”.
                    Daily → Day type sets today only.
                  </p>
                  <div className="mt-1 space-y-1">
                    {(["default", "focus", "holiday"] as const).map((dt) => (
                      <button
                        key={dt}
                        type="button"
                        onPointerDown={() => onPreferredDefaultPointerDown(dt)}
                        onPointerUp={onPreferredDefaultPointerEnd}
                        onPointerLeave={onPreferredDefaultPointerEnd}
                        onPointerCancel={onPreferredDefaultPointerEnd}
                        className={[
                          "w-full rounded-lg border px-2 py-1.5 text-left text-xs transition-colors",
                          preferredDefaultDayType === dt
                            ? isDark
                              ? "border-amber-600/50 bg-amber-950/25"
                              : "border-amber-400 bg-amber-50/80"
                            : inputCls,
                        ].join(" ")}
                      >
                        <span className="font-medium">
                          {dayTypeDisplayName(dt)}
                          {preferredDefaultDayType === dt ? " (default)" : ""}
                        </span>
                        <span className="mt-0.5 block text-[9px] font-normal text-zinc-500">
                          {dayTypeSubtitle(dt)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase text-zinc-500">Daily reset</label>
                  <label className="mt-1 flex cursor-pointer items-center justify-between gap-2">
                    <span className="text-zinc-500">Auto-start new day</span>
                    <input
                      type="checkbox"
                      checked={autoDayReset}
                      onChange={(e) => setAutoDayReset(e.target.checked)}
                      className="h-4 w-4 accent-emerald-600"
                    />
                  </label>
                  <p className="mt-0.5 text-[8px] leading-snug text-zinc-500">
                    On: at the chosen time you get a prompt to start the new app day (snooze if still in
                    overtime). Run timers and daily energy reset on confirm; nexus titles, notes, order, and
                    checklist stays until history archives done items. Off: no automatic roll from the clock.
                  </p>
                  {clientUiReady && typeof Notification !== "undefined" ? (
                    <div
                      className="mt-1.5 rounded-lg border border-zinc-600/25 px-2 py-1.5 dark:border-zinc-600/35"
                      data-notif-rev={dayRollNotifRev}
                    >
                      <p className="text-[9px] font-medium text-zinc-600 dark:text-zinc-400">
                        Day-roll alerts
                      </p>
                      <p className="mt-0.5 text-[8px] leading-snug text-zinc-500">
                        Browser notification when you confirm a new day (only if this tab is focused).
                      </p>
                      <button
                        type="button"
                        disabled={Notification.permission === "granted"}
                        onClick={async () => {
                          await Notification.requestPermission();
                          setDayRollNotifRev((n) => n + 1);
                        }}
                        className={[
                          "mt-1.5 w-full rounded-lg border py-1.5 text-[10px] font-semibold",
                          Notification.permission === "granted"
                            ? "cursor-default border-emerald-500/35 text-emerald-600 opacity-80 dark:text-emerald-400"
                            : "border-emerald-500/50 text-emerald-600 dark:text-emerald-400",
                        ].join(" ")}
                      >
                        {Notification.permission === "granted"
                          ? "Notifications allowed"
                          : "Allow notifications…"}
                      </button>
                    </div>
                  ) : null}
                  <label className="mt-1.5 block text-[9px] uppercase text-zinc-500">
                    Roll at (app time)
                  </label>
                  <input
                    type="time"
                    value={normalizeClockHm(dayResetClock)}
                    disabled={!autoDayReset}
                    onChange={(e) => setDayResetClock(e.target.value)}
                    className={[
                      "mt-0.5 w-full rounded-lg border px-2 py-1 text-xs disabled:opacity-45",
                      inputCls,
                    ].join(" ")}
                  />
                </div>

                <label className="flex cursor-pointer items-center justify-between gap-2">
                  <span className="text-zinc-500">Auto-borrow time</span>
                  <input
                    type="checkbox"
                    checked={autoBorrow}
                    onChange={(e) => setAutoBorrow(e.target.checked)}
                    className="h-4 w-4 accent-emerald-600"
                  />
                </label>
                <p className="text-[9px] text-zinc-500">
                  When a running nexus hits zero, take 1s at a time from lowest priority slots.
                  Long-press a donor card (giving nexus) to move unused time; never marks overspend.
                </p>
                {!user && !authLoading ? (
                  <div
                    className={[
                      "rounded-lg border px-2 py-1.5",
                      isDark ? "border-zinc-700/60" : "border-zinc-300",
                    ].join(" ")}
                  >
                    <p className="text-[9px] uppercase text-zinc-500">Time zone</p>
                    <p className="mt-0.5 font-mono text-[11px] text-zinc-800 dark:text-zinc-200">
                      {appTimezone}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setTimezoneDraft(appTimezone);
                        setTimezoneEditOpen(true);
                      }}
                      className="mt-1.5 w-full rounded border py-1 text-[10px] text-emerald-600 dark:text-emerald-400"
                    >
                      Edit time zone…
                    </button>
                  </div>
                ) : null}
                <p className="text-[9px] text-zinc-500">
                  Day type controls max nexus today + which allocation presets appear.
                </p>
              </div>
            ) : null}
          </div>

          <div>
            <button
              type="button"
              aria-expanded={settingsAccordion === "account"}
              onClick={() =>
                setSettingsAccordion((cur) => (cur === "account" ? null : "account"))
              }
              className={settingsSectionHeaderCls}
            >
              Account
              <span className="tabular-nums">{settingsAccordion === "account" ? "−" : "+"}</span>
            </button>
            {settingsAccordion === "account" ? (
              <div className={`${settingsSubPanelCls} space-y-1.5 text-[10px]`}>
                {authLoading ? (
                  <p className="text-zinc-500">Checking session…</p>
                ) : user ? (
                  <>
                    <p className="truncate text-xs font-medium text-zinc-700 dark:text-zinc-200">
                      {user.email ?? user.id}
                    </p>
                    <div className="rounded-lg border border-zinc-700/30 px-2 py-1.5 dark:border-zinc-600/40">
                      <p className="text-[9px] uppercase text-zinc-500">Time zone</p>
                      <p className="mt-0.5 font-mono text-[11px] text-zinc-800 dark:text-zinc-200">
                        {appTimezone}
                      </p>
                      <p className="mt-1 text-[8px] leading-snug text-zinc-500">
                        Clock and “today” use this zone. Default follows your device.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setTimezoneDraft(appTimezone);
                          setTimezoneEditOpen(true);
                        }}
                        className="mt-1.5 w-full rounded border py-1 text-[10px] text-emerald-600 dark:text-emerald-400"
                      >
                        Edit time zone…
                      </button>
                    </div>
                    <p className="text-[9px] leading-snug text-zinc-500">
                      Signed in — dashboard syncs to Supabase (last write wins). Open the same account
                      on another device after the table migration is applied in your project.
                    </p>
                    <p className="text-[9px] leading-snug text-zinc-500">
                      Sign out saves your dashboard to Supabase, clears this browser’s copy, and resets the
                      screen to the default guest layout. Sign in again loads your row from the database
                      (not the old in-memory session).
                    </p>
                    <p className="text-[9px] leading-snug text-zinc-500">
                      Signing in with a{" "}
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">different</span>{" "}
                      account clears local cache once so two accounts never share the same file.
                    </p>
                    <p className="text-[8px] leading-snug text-zinc-500">
                      Nexus slots, timers, energy budgets, day type, allocator index, and checklist items
                      are stored in the saved JSON (plus auto day-reset settings below). Daily reset clears
                      run times, not your nexus layout.
                    </p>
                    <button
                      type="button"
                      disabled={signOutFlushing}
                      className="w-full rounded-lg border border-rose-500/40 py-1.5 text-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => void handleSignOut()}
                    >
                      {signOutFlushing ? "Saving to cloud…" : "Sign out"}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-[9px] leading-snug text-zinc-500">
                      Optional: use the app without signing in. Sign in when you want your identity
                      ready for multi-device sync (coming soon).
                    </p>
                    <Link
                      href="/login"
                      className="flex w-full items-center justify-center rounded-lg border border-emerald-500/50 bg-emerald-500/10 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                    >
                      Sign in with Google
                    </Link>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </aside>

      {dayRollModal ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3">
          <div
            className={[
              "w-full max-w-sm rounded-2xl border p-3 sm:p-4",
              isDark ? "border-zinc-700 bg-zinc-900" : "border-zinc-300 bg-white",
            ].join(" ")}
            role="dialog"
            aria-modal="true"
            aria-labelledby="day-roll-title"
          >
            <p id="day-roll-title" className="text-sm font-semibold">
              Start a new app day?
            </p>
            <p className="mt-1.5 text-[10px] leading-snug text-zinc-500">
              Run timers and daily energy counters reset. Your nexus titles, notes, order, and checklist
              stay as they are (done items will archive when history ships).
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => confirmAppDayRoll(dayRollModal.newDayKey)}
                className="w-full rounded-lg border border-emerald-500/50 bg-emerald-500/15 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
              >
                Reset now
              </button>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-stretch">
                <button
                  type="button"
                  onClick={() => snoozeDayRollMinutes(30)}
                  className={[
                    "w-full rounded-lg border py-2 text-xs sm:flex-1",
                    isDark ? "border-zinc-600" : "border-zinc-300",
                  ].join(" ")}
                >
                  Snooze 30 min
                </button>
                <button
                  type="button"
                  onClick={() => snoozeDayRollMinutes(60)}
                  className={[
                    "w-full rounded-lg border py-2 text-xs sm:flex-1",
                    isDark ? "border-zinc-600" : "border-zinc-300",
                  ].join(" ")}
                >
                  Snooze 1 hour
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {cloudConflictOpen ? (
        <div className="fixed inset-0 z-[61] flex items-center justify-center bg-black/50 p-3">
          <div
            className={[
              "w-full max-w-sm rounded-2xl border p-3 sm:p-4",
              isDark ? "border-zinc-700 bg-zinc-900" : "border-zinc-300 bg-white",
            ].join(" ")}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cloud-conflict-title"
          >
            <p id="cloud-conflict-title" className="text-sm font-semibold">
              Perubahan di perangkat lain
            </p>
            <p className="mt-1.5 text-[10px] leading-snug text-zinc-500">
              Versi di cloud lebih baru dari yang terakhir disinkronkan di tab ini. Muat versi
              terbaru untuk menyamakan data, atau tutup dan lanjutkan mengedit lokal (simpan ke
              cloud akan ditunda sampai tidak bentrok).
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row-reverse sm:justify-end">
              <button
                type="button"
                onClick={() => void loadLatestCloudDashboard()}
                className="w-full rounded-lg border border-emerald-500/50 bg-emerald-500/15 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 sm:w-auto sm:min-w-[10rem]"
              >
                Muat versi terbaru
              </button>
              <button
                type="button"
                onClick={() => setCloudConflictOpen(false)}
                className={[
                  "w-full rounded-lg border py-2 text-xs sm:w-auto sm:min-w-[10rem]",
                  isDark ? "border-zinc-600" : "border-zinc-300",
                ].join(" ")}
              >
                Tutup — tetap lokal
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {allocationConfirmOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3">
          <div
            className={[
              "w-full max-w-sm rounded-2xl border p-3 sm:p-4",
              isDark ? "border-zinc-700 bg-zinc-900" : "border-zinc-300 bg-white",
            ].join(" ")}
            role="dialog"
            aria-modal="true"
            aria-labelledby="allocation-confirm-title"
          >
            <p id="allocation-confirm-title" className="text-sm font-semibold">
              Re-apply allocation?
            </p>
            <p className="mt-1.5 text-[10px] leading-snug text-zinc-500">
              Budgets for each today nexus will update. The same slot keeps running if a timer is
              on; elapsed time is capped to the new limit.
            </p>
            {activeId ? (
              <p
                className={[
                  "mt-2 rounded-lg border px-2 py-1.5 text-[10px]",
                  panelMuted,
                ].join(" ")}
              >
                Running: <span className="font-medium">{entityById.get(activeId)?.title}</span>
              </p>
            ) : null}
            <div className="mt-3 flex flex-col gap-2 sm:flex-row-reverse sm:justify-end">
              <button
                type="button"
                disabled={allocationConfirmCooldown > 0}
                onClick={() => {
                  applyAllocation();
                  setAllocationConfirmOpen(false);
                }}
                className="w-full rounded-lg border border-emerald-500/50 bg-emerald-500/15 py-2 text-xs font-semibold text-emerald-600 disabled:cursor-not-allowed disabled:opacity-45 dark:text-emerald-400 sm:w-auto sm:min-w-[8rem]"
              >
                {allocationConfirmCooldown > 0
                  ? `Apply (${allocationConfirmCooldown}s)`
                  : "Apply"}
              </button>
              <button
                type="button"
                onClick={() => setAllocationConfirmOpen(false)}
                className={[
                  "w-full rounded-lg border py-2 text-xs sm:w-auto sm:min-w-[8rem]",
                  isDark ? "border-zinc-600" : "border-zinc-300",
                ].join(" ")}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {energyHoursConfirmOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3">
          <div
            className={[
              "w-full max-w-sm rounded-2xl border p-3 sm:p-4",
              isDark ? "border-zinc-700 bg-zinc-900" : "border-zinc-300 bg-white",
            ].join(" ")}
            role="dialog"
            aria-modal="true"
            aria-labelledby="energy-hours-confirm-title"
          >
            <p id="energy-hours-confirm-title" className="text-sm font-semibold">
              Save energy hours?
            </p>
            <p className="mt-1.5 text-[10px] leading-snug text-zinc-500">
              Budgets use these values per day type (Normal / Focus / Holiday). The running nexus
              keeps its slot; remaining time is capped when you next apply allocation.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row-reverse sm:justify-end">
              <button
                type="button"
                disabled={energyHoursConfirmCooldown > 0}
                onClick={commitEnergyHoursDraft}
                className="w-full rounded-lg border border-emerald-500/50 bg-emerald-500/15 py-2 text-xs font-semibold text-emerald-600 disabled:cursor-not-allowed disabled:opacity-45 dark:text-emerald-400 sm:w-auto sm:min-w-[8rem]"
              >
                {energyHoursConfirmCooldown > 0
                  ? `Save (${energyHoursConfirmCooldown}s)`
                  : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setEnergyHoursConfirmOpen(false)}
                className={[
                  "w-full rounded-lg border py-2 text-xs sm:w-auto sm:min-w-[8rem]",
                  isDark ? "border-zinc-600" : "border-zinc-300",
                ].join(" ")}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {timezoneEditOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3">
          <div
            className={[
              "w-full max-w-sm rounded-2xl border p-3 sm:p-4",
              isDark ? "border-zinc-700 bg-zinc-900" : "border-zinc-300 bg-white",
            ].join(" ")}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tz-edit-title"
          >
            <p id="tz-edit-title" className="text-sm font-semibold">
              Edit time zone
            </p>
            <p className="mt-1.5 text-[10px] leading-snug text-zinc-500">
              IANA name (e.g. Asia/Jakarta, America/New_York). Used for the clock and daily reset.
            </p>
            <input
              value={timezoneDraft}
              onChange={(e) => setTimezoneDraft(e.target.value)}
              className={["mt-2 w-full rounded-lg border px-2 py-1.5 font-mono text-xs", inputCls].join(
                " "
              )}
              placeholder={getDeviceTimeZone()}
              autoComplete="off"
              spellCheck={false}
            />
            {timezoneDraft.trim() && !isValidIanaTimeZone(timezoneDraft.trim()) ? (
              <p className="mt-1 text-[9px] text-rose-500">Unrecognized time zone ID.</p>
            ) : null}
            <div className="mt-3 flex flex-col gap-2 sm:flex-row-reverse sm:justify-end">
              <button
                type="button"
                onClick={openTimezoneConfirmFromEdit}
                disabled={!timezoneDraft.trim() || !isValidIanaTimeZone(timezoneDraft.trim())}
                className="w-full rounded-lg border border-emerald-500/50 bg-emerald-500/15 py-2 text-xs font-semibold text-emerald-600 disabled:cursor-not-allowed disabled:opacity-45 dark:text-emerald-400 sm:w-auto sm:min-w-[8rem]"
              >
                Continue…
              </button>
              <button
                type="button"
                onClick={() => setTimezoneEditOpen(false)}
                className={[
                  "w-full rounded-lg border py-2 text-xs sm:w-auto sm:min-w-[8rem]",
                  isDark ? "border-zinc-600" : "border-zinc-300",
                ].join(" ")}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {timezoneConfirmOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3">
          <div
            className={[
              "w-full max-w-sm rounded-2xl border p-3 sm:p-4",
              isDark ? "border-zinc-700 bg-zinc-900" : "border-zinc-300 bg-white",
            ].join(" ")}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tz-confirm-title"
          >
            <p id="tz-confirm-title" className="text-sm font-semibold">
              Confirm time zone?
            </p>
            <p className="mt-1.5 rounded-lg border border-zinc-600/30 px-2 py-1.5 font-mono text-[11px]">
              {timezoneDraft.trim()}
            </p>
            <p className="mt-1.5 text-[10px] leading-snug text-zinc-500">
              “Today” and the clock will follow this zone. Wait 2s before confirming.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row-reverse sm:justify-end">
              <button
                type="button"
                disabled={timezoneConfirmCooldown > 0}
                onClick={applyTimezoneDraft}
                className="w-full rounded-lg border border-emerald-500/50 bg-emerald-500/15 py-2 text-xs font-semibold text-emerald-600 disabled:cursor-not-allowed disabled:opacity-45 dark:text-emerald-400 sm:w-auto sm:min-w-[8rem]"
              >
                {timezoneConfirmCooldown > 0
                  ? `Apply (${timezoneConfirmCooldown}s)`
                  : "Apply"}
              </button>
              <button
                type="button"
                onClick={() => setTimezoneConfirmOpen(false)}
                className={[
                  "w-full rounded-lg border py-2 text-xs sm:w-auto sm:min-w-[8rem]",
                  isDark ? "border-zinc-600" : "border-zinc-300",
                ].join(" ")}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {swapModal ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3">
          <div
            className={[
              "w-full max-w-sm rounded-2xl border p-3",
              isDark ? "border-zinc-700 bg-zinc-900" : "border-zinc-300 bg-white",
            ].join(" ")}
          >
            <p className="text-sm font-semibold">Replace which today nexus?</p>
            <p className="mt-0.5 text-[10px] text-zinc-500">
              Timers stay on that slot; title, note & tasks come from parked item. Parked entry is
              removed.
            </p>
            <div className="mt-2 max-h-40 space-y-1 overflow-y-auto">
              {activeIds.map((id) => {
                const s = entityById.get(id);
                if (!s) {
                  return null;
                }
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => applyParkedOntoDaily(swapModal.sourceId, id)}
                    className={[
                      "w-full rounded-lg border px-2 py-1.5 text-left text-xs",
                      isDark ? "border-zinc-700 hover:bg-zinc-800" : "border-zinc-200",
                    ].join(" ")}
                  >
                    {s.title}
                    <span className="block text-[9px] text-zinc-500">
                      {formatSeconds(s.elapsedSeconds)} / {formatSeconds(s.durationSeconds)}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setSwapModal(null)}
              className="mt-2 w-full rounded-lg border py-1.5 text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {transferDonorId ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3">
          <div
            className={[
              "hide-scrollbar w-full max-w-sm rounded-2xl border p-3",
              isDark ? "border-zinc-700 bg-zinc-900" : "border-zinc-300 bg-white",
            ].join(" ")}
          >
            <p className="text-sm font-semibold">Transfer time</p>
            <p className="mt-0.5 text-[10px] text-zinc-500">
              Give unused allocation from this nexus — the donor you long-pressed — to another
              slot. Amount is capped by what this donor still has left (down to the second).
            </p>
            <label className="mt-3 block text-[10px] font-semibold uppercase text-zinc-500">
              From (donor — this card)
            </label>
            <div
              className={[
                "mt-1 rounded-lg border px-2 py-1.5 text-sm font-medium",
                panelMuted,
              ].join(" ")}
            >
              {entityById.get(transferDonorId)?.title}
              <span className="mt-0.5 block text-[10px] font-normal tabular-nums text-zinc-500">
                unused:{" "}
                {(() => {
                  const s = entityById.get(transferDonorId);
                  if (!s) {
                    return "—";
                  }
                  return formatSeconds(Math.max(0, s.durationSeconds - s.elapsedSeconds));
                })()}
              </span>
            </div>
            <label className="mt-3 block text-[10px] font-semibold uppercase text-zinc-500">
              To
            </label>
            <select
              value={transferRecipientId ?? ""}
              onChange={(e) => setTransferRecipientId(e.target.value || null)}
              className={["mt-1 w-full rounded-lg border px-2 py-1.5 text-sm", inputCls].join(" ")}
            >
              {activeIds
                .filter((id) => id !== transferDonorId)
                .map((id) => {
                  const s = entityById.get(id);
                  if (!s) {
                    return null;
                  }
                  return (
                    <option key={id} value={id}>
                      {s.title}
                    </option>
                  );
                })}
            </select>
            <label className="mt-2 block text-[10px] font-semibold uppercase text-zinc-500">
              Time (h : min : sec, min/sec 0–60)
            </label>
            <div className="mt-1 flex items-center gap-1.5">
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={transferH}
                onChange={(e) => setTransferH(e.target.value.replace(/\D/g, ""))}
                placeholder="00"
                className={["min-w-0 flex-1 rounded-lg border px-2 py-1.5 text-center text-sm", inputCls].join(
                  " "
                )}
                aria-label="Hours"
              />
              <span className="text-zinc-400">:</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={transferM}
                onChange={(e) => setTransferM(e.target.value.replace(/\D/g, "").slice(0, 2))}
                onBlur={() =>
                  setTransferM(String(clampHmsSegment(transferM, 60)).padStart(2, "0"))
                }
                placeholder="00"
                className={["w-12 rounded-lg border px-1 py-1.5 text-center text-sm", inputCls].join(
                  " "
                )}
                aria-label="Minutes"
              />
              <span className="text-zinc-400">:</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={transferS}
                onChange={(e) => setTransferS(e.target.value.replace(/\D/g, "").slice(0, 2))}
                onBlur={() =>
                  setTransferS(String(clampHmsSegment(transferS, 60)).padStart(2, "0"))
                }
                placeholder="00"
                className={["w-12 rounded-lg border px-1 py-1.5 text-center text-sm", inputCls].join(
                  " "
                )}
                aria-label="Seconds"
              />
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setTransferDonorId(null)}
                className={["flex-1 rounded-lg border py-2 text-xs", inputCls].join(" ")}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyManualTransfer}
                className="flex-1 rounded-lg border border-emerald-500/50 bg-emerald-500/15 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
              >
                Move time
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden">
        <div className={[SHELL_X, "flex min-h-0 flex-1 flex-col"].join(" ")}>
          {/* Productivity header: own island; same width as nexus grid below (not merged into one mega-card). */}
          <header
            className={[
              "sticky top-2 z-30 mb-4 flex w-full shrink-0 flex-col rounded-2xl border md:mb-6",
              tightPhonePortrait ? "gap-0.5 px-2.5 py-1.5" : "gap-1 px-3 py-2 md:px-4 md:py-2.5",
              isDark
                ? "border-zinc-700/55 bg-zinc-900 shadow-xl shadow-black/35"
                : "border-zinc-300/90 bg-white/95 shadow-md backdrop-blur-md",
            ].join(" ")}
          >
        <div className="hidden items-center gap-3 md:flex md:gap-4 lg:gap-6">
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className={[
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-base lg:h-11 lg:w-11 lg:text-lg",
              isDark ? "border-zinc-600/50 bg-zinc-800 text-zinc-100" : "border-zinc-300 bg-white text-zinc-800",
            ].join(" ")}
            aria-label="Open menu"
            title="Menu"
          >
            <svg className="h-[1.1rem] w-[1.1rem] lg:h-5 lg:w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <p
              className={[
                "text-[11px] uppercase tracking-[0.14em] sm:text-xs lg:text-sm",
                isDark ? "text-zinc-400" : "text-zinc-500",
              ].join(" ")}
            >
              5Nexus
            </p>
            <h1
              className={[
                "truncate text-xl font-semibold leading-tight tracking-tight lg:text-2xl xl:text-3xl",
                isDark ? "text-zinc-50" : "text-zinc-900",
              ].join(" ")}
            >
              Productivity Dashboard
            </h1>
          </div>
          {/* Remaining energy = hero: label left of counter. */}
          <div className="flex shrink-0 items-stretch gap-3 md:gap-4 lg:gap-5">
            <div
              className={[
                "flex min-w-0 flex-row items-center gap-2 rounded-xl border-2 px-3 py-2 shadow-md md:gap-3 md:px-4 md:py-2.5",
                totals.energyDepletedWhileRunning
                  ? [
                      "border-rose-500/70 bg-rose-500/10 shadow-rose-950/20",
                      isDark ? "border-rose-400/55 bg-rose-600/15" : "",
                    ].join(" ")
                  : [
                      "border-emerald-500/70 bg-emerald-500/15 shadow-emerald-500/15",
                      isDark ? "border-emerald-400/45 bg-emerald-500/10 shadow-emerald-950/20" : "",
                    ].join(" "),
              ].join(" ")}
            >
              <span
                className={[
                  "max-w-[9rem] shrink text-left font-sans font-bold uppercase leading-none tracking-tight text-lg lg:max-w-[10rem] lg:text-xl xl:text-2xl",
                  totals.energyDepletedWhileRunning
                    ? isDark
                      ? "text-rose-100"
                      : "text-rose-800"
                    : isDark
                      ? "text-white"
                      : "text-emerald-950",
                ].join(" ")}
              >
                Remaining energy
              </span>
              <span
                className={[
                  "shrink-0 font-mono tabular-nums text-lg font-bold tracking-tight lg:text-xl xl:text-2xl",
                  totals.energyDepletedWhileRunning
                    ? isDark
                      ? "text-rose-100"
                      : "text-rose-800"
                    : isDark
                      ? "text-white"
                      : "text-emerald-950",
                ].join(" ")}
              >
                {formatSeconds(totals.remainingEnergy)}
              </span>
            </div>
            <div
              className={[
                "flex flex-col items-end justify-center border-l pl-3 font-mono leading-none opacity-90 md:pl-4 lg:pl-5",
              isDark ? "border-zinc-600/50" : "border-zinc-300",
            ].join(" ")}
          >
            <span
              className={[
                "text-[8px] font-sans uppercase tracking-wide lg:text-[9px]",
                isDark ? "text-zinc-400" : "text-zinc-500",
              ].join(" ")}
            >
              Clock
            </span>
              <span
                className={[
                  "tabular-nums text-[11px] font-medium lg:text-xs",
                  isDark ? "text-zinc-300" : "text-zinc-600",
                ].join(" ")}
              >
                {clock ? formatClock(clock, appTimezone) : "—"}
              </span>
            </div>
          </div>
        </div>

        <div
          className={[
            "flex items-center md:hidden",
            tightPhonePortrait ? "gap-1.5" : "gap-2",
          ].join(" ")}
        >
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className={[
              "flex shrink-0 items-center justify-center rounded-lg border",
              tightPhonePortrait ? "h-7 w-7 text-xs" : narrowLandscape ? "h-8 w-8 text-sm" : "h-8 w-8 text-sm",
              isDark ? "border-zinc-600/50 bg-zinc-800 text-zinc-100" : "border-zinc-300 bg-white text-zinc-800",
            ].join(" ")}
            aria-label="Open menu"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <h1
              className={[
                "truncate font-semibold leading-tight tracking-tight",
                tightPhonePortrait ? "text-lg" : "text-xl",
                isDark ? "text-zinc-50" : "text-zinc-800",
              ].join(" ")}
            >
              5Nexus
            </h1>
            <p
              className={[
                "truncate font-medium",
                tightPhonePortrait ? "hidden" : "text-sm sm:text-base",
                isDark ? "text-zinc-400" : "text-zinc-500",
              ].join(" ")}
            >
              Productivity Dashboard
            </p>
          </div>
          <div
            className={[
              "shrink-0 font-mono tabular-nums",
              tightPhonePortrait ? "flex gap-2 text-right" : "flex gap-2.5 text-right",
            ].join(" ")}
          >
            <div
              className={[
                "flex min-w-0 shrink items-center gap-1.5 rounded-lg border-2 px-2 py-1",
                totals.energyDepletedWhileRunning
                  ? isDark
                    ? "border-rose-400/55 bg-rose-600/15"
                    : "border-rose-500/70 bg-rose-100/80"
                  : isDark
                    ? "border-emerald-300/50 bg-emerald-400/12"
                    : "border-emerald-500/65 bg-emerald-500/12",
              ].join(" ")}
            >
              <span
                className={[
                  "max-w-[5.75rem] shrink text-left font-bold uppercase leading-none tracking-tight sm:max-w-[6.5rem]",
                  tightPhonePortrait ? "text-[11px]" : "text-xs",
                  totals.energyDepletedWhileRunning
                    ? isDark
                      ? "text-rose-100"
                      : "text-rose-900"
                    : isDark
                      ? "text-white"
                      : "text-emerald-950",
                ].join(" ")}
              >
                Remaining energy
              </span>
              <span
                className={[
                  "shrink-0 font-mono font-bold leading-none tabular-nums",
                  tightPhonePortrait ? "text-[11px]" : "text-xs",
                  totals.energyDepletedWhileRunning
                    ? isDark
                      ? "text-rose-100"
                      : "text-rose-900"
                    : isDark
                      ? "text-white"
                      : "text-emerald-950",
                ].join(" ")}
              >
                {formatSeconds(totals.remainingEnergy)}
              </span>
            </div>
            <div
              className={[
                "min-w-0 shrink border-l text-right opacity-80",
                isDark ? "border-zinc-600/50" : "border-zinc-300",
                "pl-2",
              ].join(" ")}
            >
              <div
                className={[
                  "text-[6px] uppercase tracking-wide",
                  isDark ? "text-zinc-400" : "text-zinc-500",
                ].join(" ")}
              >
                Clock
              </div>
              <div
                className={[
                  tightPhonePortrait ? "text-[10px] leading-tight" : "text-[11px] leading-tight",
                  isDark ? "text-zinc-300" : "text-zinc-600",
                ].join(" ")}
              >
                {clock ? formatClock(clock, appTimezone) : "—"}
              </div>
            </div>
          </div>
        </div>

        <div
          className={[
            "flex items-center rounded-md px-0.5 py-0.5 md:mt-1 md:gap-2 md:rounded-lg md:px-1 md:py-1.5",
            tightPhonePortrait ? "gap-1 py-0" : "gap-1.5",
            panelMuted,
          ].join(" ")}
        >
          <span
            className={[
              tightPhonePortrait ? "text-[8px]" : "text-[10px] md:text-xs",
              isDark ? "text-zinc-400" : "text-zinc-500",
            ].join(" ")}
          >
            Today
          </span>
          <div
            className={[
              "flex-1 overflow-hidden rounded-full",
              tightPhonePortrait ? "h-1" : "h-1.5 md:h-2.5 lg:h-3",
              isDark ? "bg-zinc-900/90 ring-1 ring-zinc-600/30" : "bg-zinc-400",
            ].join(" ")}
          >
            <div
              className={[
                "h-full rounded-full",
                isDark ? "bg-emerald-400" : "bg-emerald-600",
              ].join(" ")}
              style={{ width: `${totals.progress}%` }}
            />
          </div>
          <span
            className={[
              "tabular-nums",
              tightPhonePortrait ? "text-[8px]" : "text-[10px] md:text-xs",
              isDark ? "text-zinc-400" : "text-zinc-500",
            ].join(" ")}
          >
            {Math.round(totals.progress)}%
          </span>
        </div>
      </header>

            <div
              className={[
                "hide-scrollbar flex min-h-0 flex-1 flex-col gap-1.5 pb-2 pt-2 sm:gap-2 sm:pt-3 md:pb-3 md:pt-4 lg:pt-5",
                // Below lg: scroll the whole dashboard (main + supports) — avoids nested scroll + clipping.
                "max-lg:overflow-y-auto max-lg:overscroll-contain max-lg:pb-[max(2.5rem,env(safe-area-inset-bottom))]",
                "lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain",
              ].join(" ")}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onParkedDrop}
            >
        {k === 0 ? (
          <div
            className={[
              "flex flex-1 items-center justify-center rounded-xl border p-4 text-center text-xs",
              panelMuted,
            ].join(" ")}
          >
            No nexus today (holiday). Open Settings to change day type or add nexus.
          </div>
        ) : (
          <div
            className={[
              "hide-scrollbar flex flex-col gap-2 sm:gap-2",
              "max-lg:min-h-0 max-lg:flex-none",
              // items-start: columns don’t share one stretched height (no empty card bellies when Main Focus is tall).
              "lg:grid lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.65fr)] lg:grid-rows-1 lg:items-start lg:content-start lg:gap-3 lg:overflow-y-auto lg:overscroll-contain",
            ].join(" ")}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onParkedDrop}
          >
            {/* Main focus: full width stacked above supports; right column on lg */}
            <div
              className={[
                "order-1 flex w-full min-w-0 shrink-0 flex-col lg:order-2 lg:self-start lg:h-auto lg:min-h-0",
                "rounded-xl p-0.5 lg:p-1",
                isDark ? "bg-zinc-900/70 ring-1 ring-zinc-600/40" : "bg-white/40 ring-1 ring-zinc-300/50",
                draggingId ? "ring-emerald-500/50" : "",
              ].join(" ")}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onMainColumnDrop}
            >
              {mainSlot ? (
                <NexusCard
                  slot={mainSlot}
                  variant="focus"
                  theme={theme}
                  wideInlineChecklist={wideInlineChecklist}
                  truncateTitle={narrowLandscape}
                  isActive={activeId === mainSlot.id}
                  isEditing={editingCardId === mainSlot.id}
                  canStart={slotCanStart(mainSlot)}
                  editDraft={editDraft}
                  priorityRank={getPriorityRankForActive(mainSlot.id)}
                  onStartPause={() => handleStartPauseForSlot(mainSlot.id)}
                  onStartEdit={() => startEditCard(mainSlot)}
                  onEditDraftChange={setEditDraft}
                  onSaveEdit={() => saveEditCard(mainSlot.id)}
                  onCancelEdit={() => setEditingCardId(null)}
                  onToggleChecklist={(itemId) => checklistFns(mainSlot.id).toggle(itemId)}
                  onAddChecklist={(text) => checklistFns(mainSlot.id).add(text)}
                  onUpdateChecklist={(itemId, text) =>
                    checklistFns(mainSlot.id).update(itemId, text)
                  }
                  onDeleteChecklist={(itemId) => checklistFns(mainSlot.id).del(itemId)}
                  onOuterDrop={onMainColumnDrop}
                  onRequestTransfer={() => openTransferModal(mainSlot.id)}
                />
              ) : null}
            </div>

            <div
              className={[
                // Slight inset so active card ring never kisses the scroll viewport edge.
                "order-2 grid w-full min-w-0 auto-rows-auto items-start gap-2 px-0.5 sm:px-0 lg:order-1 lg:self-start lg:min-h-0",
                supportSlots.length <= 1 ? "grid-cols-1" : "grid-cols-2",
              ].join(" ")}
            >
              {supportSlots.map((slot) => (
                <div key={slot.id} className="min-h-0 self-start">
                  <NexusCard
                    slot={slot}
                    variant="support"
                    theme={theme}
                    truncateTitle={narrowLandscape}
                    isActive={activeId === slot.id}
                    isEditing={editingCardId === slot.id}
                    canStart={slotCanStart(slot)}
                    editDraft={editDraft}
                    priorityRank={getPriorityRankForActive(slot.id)}
                    onStartPause={() => handleStartPauseForSlot(slot.id)}
                    onStartEdit={() => startEditCard(slot)}
                    onEditDraftChange={setEditDraft}
                    onSaveEdit={() => saveEditCard(slot.id)}
                    onCancelEdit={() => setEditingCardId(null)}
                    onToggleChecklist={(itemId) => checklistFns(slot.id).toggle(itemId)}
                    onAddChecklist={(text) => checklistFns(slot.id).add(text)}
                    onUpdateChecklist={(itemId, text) =>
                      checklistFns(slot.id).update(itemId, text)
                    }
                    onDeleteChecklist={(itemId) => checklistFns(slot.id).del(itemId)}
                    onDragStart={() => setDraggingId(slot.id)}
                    onDragEnd={() => setDraggingId(null)}
                    onOuterDrop={onParkedDrop}
                    onRequestTransfer={() => openTransferModal(slot.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
            </div>
      </div>
      </div>
    </div>
  );
}
