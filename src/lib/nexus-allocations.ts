/** Percentage rows (integers) summing to 100 — per day type & daily nexus count. */

export type DayType = "holiday" | "default" | "focus";

export type HolidayDailySlots = 0 | 1;
export type FocusDailySlots = 1 | 2 | 3;

export function getDailyCount(
  dayType: DayType,
  holidaySlots: HolidayDailySlots,
  focusSlots: FocusDailySlots,
  entityCount: number
): number {
  if (dayType === "holiday") {
    return Math.min(holidaySlots, entityCount);
  }
  if (dayType === "focus") {
    return Math.min(focusSlots, entityCount);
  }
  /** default */
  return Math.min(5, entityCount);
}

/** Allocation presets as % per priority P1..Pk (sum 100). */
export function getAllocationPresets(dayType: DayType, k: number): number[][] {
  if (k <= 0) {
    return [];
  }
  if (dayType === "holiday") {
    return [[100]];
  }
  if (dayType === "focus") {
    if (k === 1) {
      return [[100]];
    }
    if (k === 2) {
      return [
        [50, 50],
        [70, 30],
      ];
    }
    if (k === 3) {
      return [
        [33, 33, 34],
        [50, 25, 25],
        [45, 45, 10],
        [60, 30, 10],
      ];
    }
    return [];
  }
  /** default — full 5 presets; fewer entities → equal split (single option). */
  if (k === 5) {
    return [
      [20, 20, 20, 20, 20],
      [60, 10, 10, 10, 10],
      [40, 15, 15, 15, 15],
      [50, 20, 10, 10, 10],
      [35, 35, 10, 10, 10],
    ];
  }
  if (k > 0) {
    const base = Math.floor(100 / k);
    const row: number[] = [];
    let sum = 0;
    for (let i = 0; i < k - 1; i += 1) {
      row.push(base);
      sum += base;
    }
    row.push(100 - sum);
    return [row];
  }
  return [];
}

export function presetLabel(pct: number[]): string {
  return pct.map((p) => `${p}%`).join(" · ");
}

/** Distribute budget seconds; last slot absorbs rounding remainder. */
export function distributeSeconds(budgetSeconds: number, percentages: number[]): number[] {
  if (percentages.length === 0) {
    return [];
  }
  let used = 0;
  return percentages.map((p, iLast) => {
    if (iLast === percentages.length - 1) {
      return Math.max(0, budgetSeconds - used);
    }
    const chunk = Math.floor((budgetSeconds * p) / 100);
    used += chunk;
    return chunk;
  });
}
