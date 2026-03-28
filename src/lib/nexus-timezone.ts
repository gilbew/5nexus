/** IANA timezone from the browser (e.g. Asia/Jakarta). */
export function getDeviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function isValidIanaTimeZone(tz: string): boolean {
  if (!tz || typeof tz !== "string") {
    return false;
  }
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Calendar date YYYY-MM-DD in the given IANA zone (for daily reset / “today”). */
export function getDateKeyInTimeZone(date: Date, timeZone: string): string {
  const tz = isValidIanaTimeZone(timeZone) ? timeZone : getDeviceTimeZone();
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = dtf.formatToParts(date);
  const y = parts.find((x) => x.type === "year")?.value;
  const m = parts.find((x) => x.type === "month")?.value;
  const d = parts.find((x) => x.type === "day")?.value;
  if (y && m && d) {
    return `${y}-${m}-${d}`;
  }
  const y2 = date.getFullYear();
  const m2 = `${date.getMonth() + 1}`.padStart(2, "0");
  const d2 = `${date.getDate()}`.padStart(2, "0");
  return `${y2}-${m2}-${d2}`;
}

const CLOCK_HM = /^([01]?\d|2[0-3]):([0-5]\d)$/;

/** Parse "H:mm" or "HH:mm" 24h; returns null if invalid. */
export function parseClockHm(raw: string): { h: number; m: number } | null {
  const t = raw.trim();
  const m = CLOCK_HM.exec(t);
  if (!m) {
    return null;
  }
  const h = Number(m[1]);
  const min = Number(m[2]);
  return { h, m: min };
}

/** Normalize for `<input type="time" />` (HH:mm). */
export function normalizeClockHm(raw: string): string {
  const p = parseClockHm(raw);
  if (!p) {
    return "00:00";
  }
  return `${String(p.h).padStart(2, "0")}:${String(p.m).padStart(2, "0")}`;
}

/** First instant (going backward from `now`) where the calendar date in `tz` changes. */
export function previousDateKeyInTimeZone(now: Date, timeZone: string): string {
  const tz = isValidIanaTimeZone(timeZone) ? timeZone : getDeviceTimeZone();
  const today = getDateKeyInTimeZone(now, tz);
  let t = now.getTime();
  for (let i = 0; i < 72; i++) {
    t -= 3_600_000;
    const k = getDateKeyInTimeZone(new Date(t), tz);
    if (k !== today) {
      return k;
    }
  }
  return today;
}

/**
 * Logical “app day” in IANA zone: rolls when wall clock crosses `resetHm` (24h).
 * Interval [reset, next day reset) maps to that calendar date’s key.
 */
export function getLogicalDayKey(now: Date, timeZone: string, resetHm: string): string {
  const tz = isValidIanaTimeZone(timeZone) ? timeZone : getDeviceTimeZone();
  const hm = parseClockHm(resetHm) ?? { h: 0, m: 0 };
  const todayKey = getDateKeyInTimeZone(now, tz);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const ch = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const cmin = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  const nowMins = ch * 60 + cmin;
  const resetMins = hm.h * 60 + hm.m;
  if (nowMins < resetMins) {
    return previousDateKeyInTimeZone(now, tz);
  }
  return todayKey;
}

/**
 * Key used for daily rollover + hydrate: logical boundary when auto reset on, else calendar midnight in zone.
 */
export function getEffectiveDashboardDayKey(
  now: Date,
  timeZone: string,
  resetHm: string,
  autoDayResetEnabled: boolean
): string {
  const tz = isValidIanaTimeZone(timeZone) ? timeZone : getDeviceTimeZone();
  if (!autoDayResetEnabled) {
    return getDateKeyInTimeZone(now, tz);
  }
  return getLogicalDayKey(now, tz, resetHm);
}
