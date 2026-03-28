import { NextResponse } from "next/server";
import {
  USER_DASHBOARD_TABLE,
  isServerNewerThanClientAck,
} from "@/lib/nexus-cloud-sync";
import { createClient } from "@/lib/supabase/server";

/** Minimal v5 shape check (full Zod optional later). */
function isPersistedV5Payload(p: unknown): p is Record<string, unknown> {
  if (!p || typeof p !== "object") {
    return false;
  }
  const o = p as Record<string, unknown>;
  return (
    o.v === 5 &&
    typeof o.autoBorrow === "boolean" &&
    Array.isArray(o.entities) &&
    Array.isArray(o.fullOrder)
  );
}

/**
 * Best-effort dashboard upsert on tab close (`fetch` + `keepalive` from the client).
 * Auth via Supabase cookies — same session as the rest of the app.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const payload = (body as Record<string, unknown>).payload;
  if (!isPersistedV5Payload(payload)) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }
  const knownRaw = (body as Record<string, unknown>).knownServerUpdatedAt;
  const knownServerUpdatedAt = typeof knownRaw === "string" ? knownRaw : null;

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: meta } = await supabase
    .from(USER_DASHBOARD_TABLE)
    .select("updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (isServerNewerThanClientAck(meta?.updated_at ?? null, knownServerUpdatedAt)) {
    return NextResponse.json({ ok: false, stale: true }, { status: 409 });
  }

  const iso = new Date().toISOString();
  const { error } = await supabase
    .from(USER_DASHBOARD_TABLE)
    .upsert({ user_id: user.id, payload, updated_at: iso }, { onConflict: "user_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, updated_at: iso });
}
