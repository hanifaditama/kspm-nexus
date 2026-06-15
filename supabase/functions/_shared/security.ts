import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

const clean = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const allowedOrigins = () => {
  const configured = (Deno.env.get("ALLOWED_ORIGINS") ?? Deno.env.get("APP_URL") ?? "")
    .split(",")
    .map((value) => value.trim().replace(/\/$/, ""))
    .filter(Boolean);
  return new Set(configured);
};

const isTrustedOrigin = (origin: string) =>
  allowedOrigins().has(origin) || /^http:\/\/(?:localhost|127\.0\.0\.1):\d+$/.test(origin);

export const isAllowedOrigin = (request: Request) => {
  const origin = request.headers.get("origin");
  return !origin || isTrustedOrigin(origin.replace(/\/$/, ""));
};

export const corsHeaders = (request: Request) => {
  const origin = request.headers.get("origin")?.replace(/\/$/, "");
  return {
    "Access-Control-Allow-Origin": origin && isTrustedOrigin(origin) ? origin : "null",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
};

export const json = (request: Request, body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(request), "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export const rejectInvalidRequest = (request: Request, maxBytes = 16_384) => {
  if (!isAllowedOrigin(request)) return json(request, { message: "Origin not allowed." }, 403);
  const length = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(length) && length > maxBytes) return json(request, { message: "Request is too large." }, 413);
  return null;
};

export const getAdminClient = () =>
  createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

export async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export const requestIp = (request: Request) =>
  clean(request.headers.get("cf-connecting-ip"))
  || clean(request.headers.get("x-real-ip"))
  || clean(request.headers.get("x-forwarded-for")?.split(",")[0])
  || "unknown";

export async function enforceRateLimit(
  admin: SupabaseClient,
  action: string,
  subject: string,
  limit: number,
  windowMs: number,
) {
  const salt = Deno.env.get("RATE_LIMIT_SALT") ?? Deno.env.get("ACCOUNT_HASH_SALT");
  if (!salt) throw new Error("Rate limiting is not configured.");
  const keyHash = await sha256(`${salt}:${subject}`);
  const cutoff = new Date(Date.now() - windowMs).toISOString();
  const { count, error } = await admin
    .from("security_rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("action", action)
    .eq("key_hash", keyHash)
    .gte("created_at", cutoff);
  if (error) throw error;
  if ((count ?? 0) >= limit) return false;
  const { error: insertError } = await admin.from("security_rate_limits").insert({ action, key_hash: keyHash });
  if (insertError) throw insertError;
  if (Math.random() < 0.02) {
    const retention = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { error: cleanupError } = await admin.from("security_rate_limits").delete().lt("created_at", retention);
    if (cleanupError) console.error("Could not clean old rate-limit rows", cleanupError.message);
  }
  return true;
}

export async function requirePrimaryAdministrator(request: Request, admin: SupabaseClient) {
  const token = (request.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return { error: json(request, { message: "Unauthorized." }, 401), user: null };

  const { data: primary, error: primaryError } = await admin
    .from("primary_administrator")
    .select("id")
    .eq("id", "main")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (primaryError || !primary) {
    return { error: json(request, { message: "Primary administrator access required." }, 403), user: null };
  }

  if (Deno.env.get("REQUIRE_ADMIN_AAL2") === "true") {
    try {
      const encoded = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const padded = encoded.padEnd(Math.ceil(encoded.length / 4) * 4, "=");
      const payload = JSON.parse(atob(padded));
      if (payload.aal !== "aal2") {
        return { error: json(request, { message: "Multi-factor authentication is required." }, 403), user: null };
      }
    } catch {
      return { error: json(request, { message: "Multi-factor authentication is required." }, 403), user: null };
    }
  }

  return { error: null, user: data.user };
}

export async function writeAuditLog(
  admin: SupabaseClient,
  actorId: string | null,
  action: string,
  targetUserId: string | null,
  metadata: Record<string, unknown> = {},
) {
  const { error } = await admin.from("security_audit_logs").insert({
    actor_id: actorId,
    action,
    target_user_id: targetUserId,
    metadata,
  });
  if (error) console.error("Could not write security audit log", error.message);
}

export function randomInternalCredential(length = 32) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
  const values = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
}
