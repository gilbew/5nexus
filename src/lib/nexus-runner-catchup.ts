import type { NexusSlot } from "@/components/NexusCard";
import { applyBorrowFromDonors } from "@/lib/nexus-borrow";

/** Cap wall-time catch-up to avoid pathological loops (e.g. corrupt anchor). */
export const MAX_RUNNER_CATCHUP_SECONDS = 86400 * 2;

export type RunnerCatchUpResult = {
  entities: NexusSlot[];
  consumedDelta: number;
  activeId: string | null;
};

/** In-memory catch-up for unload beacons (must not rely on React commit). */
export type RunnerWallCatchUpCompute = {
  dirty: boolean;
  entities: NexusSlot[];
  consumedDelta: number;
  activeId: string | null;
  runWallAnchorMs: number | null;
};

/**
 * Wall-clock catch-up in one shot (same rules as `flushRunnerWallCatchUp` / 1s tick).
 * `dirty` is false when nothing would change React state.
 */
export function computeRunnerWallCatchUp(
  entities: NexusSlot[],
  activeId: string | null,
  activeSliceIds: string[],
  autoBorrow: boolean,
  anchorMs: number | null,
  nowMs: number
): RunnerWallCatchUpCompute {
  if (anchorMs == null || activeId == null || !Number.isFinite(anchorMs)) {
    return {
      dirty: false,
      entities,
      consumedDelta: 0,
      activeId,
      runWallAnchorMs: anchorMs,
    };
  }
  if (!activeSliceIds.includes(activeId)) {
    return {
      dirty: true,
      entities,
      consumedDelta: 0,
      activeId: null,
      runWallAnchorMs: null,
    };
  }
  const gap = Math.min(
    Math.max(0, Math.floor((nowMs - anchorMs) / 1000)),
    MAX_RUNNER_CATCHUP_SECONDS
  );
  if (gap <= 0) {
    return {
      dirty: false,
      entities,
      consumedDelta: 0,
      activeId,
      runWallAnchorMs: anchorMs,
    };
  }
  const result = simulateRunnerCatchUpSeconds(
    entities,
    activeId,
    activeSliceIds,
    autoBorrow,
    gap
  );
  const nextAnchor = result.activeId ? nowMs : null;
  return {
    dirty: true,
    entities: result.entities,
    consumedDelta: result.consumedDelta,
    activeId: result.activeId,
    runWallAnchorMs: nextAnchor,
  };
}

/**
 * Replays up to `seconds` of 1s runner ticks (same rules as the live interval: auto-borrow, pause at cap).
 */
export function simulateRunnerCatchUpSeconds(
  entities: NexusSlot[],
  activeId: string,
  activeSliceIds: string[],
  autoBorrow: boolean,
  seconds: number
): RunnerCatchUpResult {
  const n = Math.min(Math.max(0, Math.floor(seconds)), MAX_RUNNER_CATCHUP_SECONDS);
  let e = entities.map((x) => ({ ...x }));
  let cur: string | null = activeId;
  let consumed = 0;
  for (let i = 0; i < n && cur; i++) {
    const slot = e.find((s) => s.id === cur);
    if (!slot || slot.durationSeconds <= 0 || !activeSliceIds.includes(cur)) {
      cur = null;
      break;
    }
    if (slot.elapsedSeconds >= slot.durationSeconds) {
      if (!autoBorrow) {
        cur = null;
        break;
      }
      const borrowed = applyBorrowFromDonors(e, cur, activeSliceIds, 1, {
        markOverspent: true,
      });
      if (!borrowed) {
        cur = null;
        break;
      }
      e = borrowed;
    }
    const s = e.find((x) => x.id === cur)!;
    if (s.elapsedSeconds < s.durationSeconds) {
      e = e.map((x) =>
        x.id === cur ? { ...x, elapsedSeconds: x.elapsedSeconds + 1 } : x
      );
      consumed += 1;
    }
  }
  return { entities: e, consumedDelta: consumed, activeId: cur };
}
