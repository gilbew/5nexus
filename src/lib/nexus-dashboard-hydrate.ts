import type { Dispatch, SetStateAction } from "react";
import type { NexusSlot } from "@/components/NexusCard";
import {
  getDailyCount,
  type DayType,
  type FocusDailySlots,
  type HolidayDailySlots,
} from "@/lib/nexus-allocations";
import {
  getDeviceTimeZone,
  isValidIanaTimeZone,
  normalizeClockHm,
} from "@/lib/nexus-timezone";

export type EnergyHoursConfig = {
  holiday: number;
  default: number;
  focus: number;
};

/** Setter bundle so localStorage + Supabase hydrate share one code path. */
export type DashboardHydrateSetters = {
  setEntities: Dispatch<SetStateAction<NexusSlot[]>>;
  setFullOrder: Dispatch<SetStateAction<string[]>>;
  setMainSlotId: Dispatch<SetStateAction<string>>;
  setActiveId: Dispatch<SetStateAction<string | null>>;
  setLastResetDate: Dispatch<SetStateAction<string>>;
  setDayType: Dispatch<SetStateAction<DayType>>;
  setHolidayDaily: Dispatch<SetStateAction<HolidayDailySlots>>;
  setFocusDaily: Dispatch<SetStateAction<FocusDailySlots>>;
  setAllocatorIndex: Dispatch<SetStateAction<number>>;
  setEnergyHours: Dispatch<SetStateAction<EnergyHoursConfig>>;
  setAutoBorrow: Dispatch<SetStateAction<boolean>>;
  setPreferredDefaultDayType: Dispatch<SetStateAction<DayType>>;
  setAppTimezone: Dispatch<SetStateAction<string>>;
  setAutoDayReset: Dispatch<SetStateAction<boolean>>;
  setDayResetClock: Dispatch<SetStateAction<string>>;
  setDayConsumedRunSeconds: Dispatch<SetStateAction<number>>;
  setRunWallAnchorMs: Dispatch<SetStateAction<number | null>>;
};

/**
 * Apply persisted dashboard JSON into React state (local file or Supabase `payload`).
 * Returns false if shape is invalid.
 */
export function applyDashboardFromPersisted(
  parsed: unknown,
  options: {
    todayKey: string;
    resetEntityDay: (e: NexusSlot) => NexusSlot;
    defaultEnergyHours: EnergyHoursConfig;
  } & DashboardHydrateSetters
): boolean {
  if (!parsed || typeof parsed !== "object") {
    return false;
  }
  const p = parsed as Record<string, unknown>;
  if (!Array.isArray(p.entities) || p.entities.length === 0 || !Array.isArray(p.fullOrder)) {
    return false;
  }

  const entities = p.entities as NexusSlot[];
  const fullOrder = p.fullOrder as string[];
  const shouldReset = p.lastResetDate !== options.todayKey;

  const outEntities = shouldReset ? entities.map(options.resetEntityDay) : entities;
  options.setEntities(outEntities);
  options.setFullOrder(fullOrder);
  options.setMainSlotId(typeof p.mainSlotId === "string" ? p.mainSlotId : "main-focus");
  options.setActiveId(shouldReset ? null : typeof p.activeId === "string" ? p.activeId : null);
  options.setLastResetDate(options.todayKey);

  options.setDayType(
    p.dayType === "holiday" || p.dayType === "focus" ? p.dayType : "default"
  );
  options.setHolidayDaily(p.holidayDaily === 0 || p.holidayDaily === 1 ? p.holidayDaily : 1);
  options.setFocusDaily(
    p.focusDaily === 1 || p.focusDaily === 2 || p.focusDaily === 3 ? p.focusDaily : 3
  );
  options.setAllocatorIndex(typeof p.allocatorIndex === "number" ? p.allocatorIndex : 0);

  const eh = p.energyHours;
  if (eh && typeof eh === "object") {
    const o = eh as Record<string, unknown>;
    options.setEnergyHours({
      holiday: Number(o.holiday) || options.defaultEnergyHours.holiday,
      default: Number(o.default) || options.defaultEnergyHours.default,
      focus: Number(o.focus) || options.defaultEnergyHours.focus,
    });
  }

  if (typeof p.autoBorrow === "boolean") {
    options.setAutoBorrow(p.autoBorrow);
  }

  const pref =
    p.preferredDefaultDayType === "holiday" ||
    p.preferredDefaultDayType === "focus" ||
    p.preferredDefaultDayType === "default"
      ? p.preferredDefaultDayType
      : "default";
  options.setPreferredDefaultDayType(pref);

  const rawTz = typeof p.appTimezone === "string" ? p.appTimezone.trim() : "";
  options.setAppTimezone(
    rawTz && isValidIanaTimeZone(rawTz) ? rawTz : getDeviceTimeZone()
  );

  options.setAutoDayReset(
    typeof p.autoDayReset === "boolean" ? p.autoDayReset : true
  );
  const dc = typeof p.dayResetClock === "string" ? p.dayResetClock.trim() : "";
  options.setDayResetClock(dc ? normalizeClockHm(dc) : "00:00");

  const k0 = hydrateDailyK(p, outEntities.length);
  options.setDayConsumedRunSeconds(
    shouldReset ? 0 : resolveDayConsumedRunSeconds(p, fullOrder, outEntities, k0)
  );

  const activeFromPayload = shouldReset
    ? null
    : typeof p.activeId === "string"
      ? p.activeId
      : null;
  const rawAnchor = p.runWallAnchorMs;
  const anchorMs =
    activeFromPayload &&
    typeof rawAnchor === "number" &&
    Number.isFinite(rawAnchor) &&
    rawAnchor > 1
      ? rawAnchor
      : activeFromPayload
        ? Date.now()
        : null;
  options.setRunWallAnchorMs(anchorMs);

  return true;
}

/** k “today” slots from persisted day-type fields (same rules as dashboard). */
function hydrateDailyK(p: Record<string, unknown>, entityCount: number): number {
  const dt: DayType =
    p.dayType === "holiday" || p.dayType === "focus" || p.dayType === "default"
      ? p.dayType
      : "default";
  const hd: HolidayDailySlots =
    p.holidayDaily === 0 || p.holidayDaily === 1 ? p.holidayDaily : 1;
  const fd: FocusDailySlots =
    p.focusDaily === 1 || p.focusDaily === 2 || p.focusDaily === 3 ? p.focusDaily : 3;
  return getDailyCount(dt, hd, fd, entityCount);
}

function sumElapsedOnActiveSlice(
  entities: NexusSlot[],
  fullOrder: string[],
  k: number
): number {
  const active = new Set(fullOrder.slice(0, k));
  return entities.reduce((acc, e) => acc + (active.has(e.id) ? e.elapsedSeconds : 0), 0);
}

/** Persisted seconds counted against daily energy (monotone; survives parking a runner). */
function resolveDayConsumedRunSeconds(
  p: Record<string, unknown>,
  fullOrder: string[],
  entities: NexusSlot[],
  k: number
): number {
  const raw = p.dayConsumedRunSeconds;
  const fromField =
    typeof raw === "number" && Number.isFinite(raw) && raw >= 0
      ? Math.min(Math.floor(raw), 86400 * 7)
      : sumElapsedOnActiveSlice(entities, fullOrder, k);
  const floor = sumElapsedOnActiveSlice(entities, fullOrder, k);
  return Math.max(fromField, floor);
}
