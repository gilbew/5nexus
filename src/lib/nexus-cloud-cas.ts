import type { SupabaseClient } from "@supabase/supabase-js";
import { NO_SERVER_ACK_ISO, USER_DASHBOARD_TABLE } from "@/lib/nexus-cloud-sync";

type SupabaseLike = Pick<SupabaseClient, "from">;

export type DashboardCasWriteResult =
  | {
      kind: "written";
      updatedAt: string;
    }
  | {
      kind: "stale";
      updatedAt: string;
      payload: unknown;
    }
  | {
      kind: "error";
      message: string;
    };

function normalizeKnownServerUpdatedAt(value: string | null | undefined): string {
  if (typeof value !== "string" || value.trim() === "") {
    return NO_SERVER_ACK_ISO;
  }
  return value.trim();
}

async function readLatestRow(
  supabase: SupabaseLike,
  userId: string
): Promise<
  | { ok: true; row: { payload?: unknown; updated_at?: string | null } | null }
  | { ok: false; message: string }
> {
  const { data, error } = await supabase
    .from(USER_DASHBOARD_TABLE)
    .select("payload, updated_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    return { ok: false, message: error.message };
  }
  return { ok: true, row: data };
}

/**
 * Best-effort CAS write against `updated_at` to avoid read-then-upsert races.
 * - If client has last-known `updated_at`, update only when it still matches.
 * - If client has no ack yet, try insert first; on duplicate, return server row as stale.
 */
export async function writeDashboardPayloadWithCas(args: {
  supabase: SupabaseLike;
  userId: string;
  payload: unknown;
  knownServerUpdatedAt?: string | null;
  nowIso?: string;
}): Promise<DashboardCasWriteResult> {
  const { supabase, userId, payload } = args;
  const known = normalizeKnownServerUpdatedAt(args.knownServerUpdatedAt);
  const iso = args.nowIso ?? new Date().toISOString();

  if (known !== NO_SERVER_ACK_ISO) {
    const { data: updatedRows, error: updateError } = await supabase
      .from(USER_DASHBOARD_TABLE)
      .update({ payload, updated_at: iso })
      .eq("user_id", userId)
      .eq("updated_at", known)
      .select("updated_at");
    if (updateError) {
      return { kind: "error", message: updateError.message };
    }
    if (Array.isArray(updatedRows) && updatedRows.length > 0) {
      const updatedAtRaw = (updatedRows[0] as Record<string, unknown>).updated_at;
      const updatedAt = typeof updatedAtRaw === "string" && updatedAtRaw ? updatedAtRaw : iso;
      return { kind: "written", updatedAt };
    }
  }

  const { data: insertedRows, error: insertError } = await supabase
    .from(USER_DASHBOARD_TABLE)
    .insert({ user_id: userId, payload, updated_at: iso })
    .select("updated_at");
  if (!insertError && Array.isArray(insertedRows) && insertedRows.length > 0) {
    const updatedAtRaw = (insertedRows[0] as Record<string, unknown>).updated_at;
    const updatedAt = typeof updatedAtRaw === "string" && updatedAtRaw ? updatedAtRaw : iso;
    return { kind: "written", updatedAt };
  }

  const latest = await readLatestRow(supabase, userId);
  if (!latest.ok) {
    return { kind: "error", message: latest.message };
  }
  const updatedAt = latest.row?.updated_at;
  if (typeof updatedAt === "string" && updatedAt) {
    return {
      kind: "stale",
      updatedAt,
      payload: latest.row?.payload,
    };
  }
  return {
    kind: "error",
    message: insertError?.message ?? "cloud write failed",
  };
}
