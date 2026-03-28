/** Supabase table for per-user dashboard JSON (see supabase/migrations). */
export const USER_DASHBOARD_TABLE = "user_dashboard_state" as const;

/** localStorage keys for dashboard JSON (v5 current). */
export const NEXUS_DASHBOARD_STORAGE_V5 = "nexus-dashboard-state-v5";
export const NEXUS_DASHBOARD_STORAGE_V4 = "nexus-dashboard-state-v4";
export const NEXUS_DASHBOARD_STORAGE_V3 = "nexus-dashboard-state-v3";

/** ISO timestamp of last local edit — compared to `updated_at` from DB for LWW. */
export const LOCAL_WRITE_TS_KEY = "nexus-sync-local-write";

/**
 * After logout, guest UI persists to disk and bumps local write time → it becomes newer than the
 * server row from the pre-logout flush. Next login must prefer Supabase once, not LWW.
 * Intentionally NOT removed by `clearNexusDashboardLocalState`.
 */
export const PREFER_SERVER_AFTER_LOGOUT_KEY = "nexus-prefer-server-after-logout";

export function markPreferServerAfterLogout() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(PREFER_SERVER_AFTER_LOGOUT_KEY, "1");
}

export function shouldPreferServerAfterLogout(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.localStorage.getItem(PREFER_SERVER_AFTER_LOGOUT_KEY) === "1";
}

export function clearPreferServerAfterLogout() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(PREFER_SERVER_AFTER_LOGOUT_KEY);
}

export function bumpLocalDashboardWriteTs() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(LOCAL_WRITE_TS_KEY, new Date().toISOString());
}

export function getLocalDashboardWriteTs() {
  if (typeof window === "undefined") {
    return "1970-01-01T00:00:00.000Z";
  }
  return window.localStorage.getItem(LOCAL_WRITE_TS_KEY) ?? "1970-01-01T00:00:00.000Z";
}

export function setLocalDashboardWriteTs(iso: string) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(LOCAL_WRITE_TS_KEY, iso);
}

/**
 * Last `updated_at` we acknowledged from Supabase (pull or push). Per `userId` so account
 * switches do not compare the wrong row.
 */
export const LAST_SERVER_UPDATED_AT_KEY = "nexus-last-server-updated-at";

/**
 * Wipe dashboard + sync metadata (not `PREFER_SERVER_AFTER_LOGOUT_KEY`).
 */
export function clearNexusDashboardLocalState() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(NEXUS_DASHBOARD_STORAGE_V5);
  window.localStorage.removeItem(NEXUS_DASHBOARD_STORAGE_V4);
  window.localStorage.removeItem(NEXUS_DASHBOARD_STORAGE_V3);
  window.localStorage.removeItem(LOCAL_WRITE_TS_KEY);
  const prefix = `${LAST_SERVER_UPDATED_AT_KEY}:`;
  const toRemove: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (k?.startsWith(prefix)) {
      toRemove.push(k);
    }
  }
  toRemove.forEach((k) => window.localStorage.removeItem(k));
}

const serverAtKey = (userId: string) => `${LAST_SERVER_UPDATED_AT_KEY}:${userId}`;

/** Default until first successful pull/push for this user in this browser. */
export const NO_SERVER_ACK_ISO = "1970-01-01T00:00:00.000Z";

export function getLastServerUpdatedAt(userId: string) {
  if (typeof window === "undefined") {
    return NO_SERVER_ACK_ISO;
  }
  return window.localStorage.getItem(serverAtKey(userId)) ?? NO_SERVER_ACK_ISO;
}

export function setLastServerUpdatedAt(userId: string, iso: string) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(serverAtKey(userId), iso);
}

/**
 * True if DB `updated_at` is strictly newer than the client’s last-ack timestamp.
 * Used by push gate and `/api/dashboard-beacon` (same rule).
 */
export function isServerNewerThanClientAck(
  serverUpdatedAt: string | null | undefined,
  knownServerUpdatedAt: string | null | undefined
): boolean {
  if (serverUpdatedAt == null || typeof serverUpdatedAt !== "string") {
    return false;
  }
  const known =
    typeof knownServerUpdatedAt === "string" && knownServerUpdatedAt.trim() !== ""
      ? knownServerUpdatedAt.trim()
      : NO_SERVER_ACK_ISO;
  if (known === NO_SERVER_ACK_ISO) {
    return false;
  }
  const serverMs = new Date(serverUpdatedAt).getTime();
  const knownMs = new Date(known).getTime();
  if (!Number.isFinite(serverMs) || !Number.isFinite(knownMs)) {
    return false;
  }
  return serverMs > knownMs;
}

/**
 * True if Supabase row is newer than the last server version this client acknowledged.
 * Skips when we never ack’d (still rely on LWW local write vs server time on first sync).
 */
export function hasCloudVersionConflict(
  serverUpdatedAt: string | null | undefined,
  userId: string
): boolean {
  return isServerNewerThanClientAck(serverUpdatedAt, getLastServerUpdatedAt(userId));
}
