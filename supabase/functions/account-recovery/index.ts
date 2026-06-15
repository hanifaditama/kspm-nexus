import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const clean = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const genericMessage = "If the account exists, a password reset link has been sent to its recovery email.";

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ message: "Method not allowed." }, 405);

  const body = await request.json().catch(() => ({}));
  const identifier = clean(body.identifier).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier) || identifier.length > 254) {
    return json({ message: genericMessage });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("ACCOUNT_FROM_EMAIL") ?? Deno.env.get("CONTACT_FROM_EMAIL");
  const appUrl = Deno.env.get("APP_URL");
  const salt = Deno.env.get("ACCOUNT_HASH_SALT") ?? Deno.env.get("CONTACT_HASH_SALT");
  if (!resendApiKey || !from || !appUrl || !salt) return json({ message: "Account recovery is not configured." }, 503);

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const [identifierHash, ipHash] = await Promise.all([sha256(`${salt}:${identifier}`), sha256(`${salt}:${ip}`)]);
  const cutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const [identifierCount, ipCount] = await Promise.all([
    admin.from("account_recovery_requests").select("id", { count: "exact", head: true }).eq("identifier_hash", identifierHash).gte("created_at", cutoff),
    admin.from("account_recovery_requests").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", cutoff),
  ]);
  if ((identifierCount.count ?? 0) >= 3 || (ipCount.count ?? 0) >= 10) {
    return json({ message: "Too many recovery requests. Please try again later." }, 429);
  }
  await admin.from("account_recovery_requests").insert({ identifier_hash: identifierHash, ip_hash: ipHash });

  const { data: loginProfile } = await admin
    .from("member_profiles")
    .select("display_name,email,recovery_email")
    .eq("email", identifier)
    .maybeSingle();
  const { data: recoveryProfile } = loginProfile
    ? { data: null }
    : await admin
      .from("member_profiles")
      .select("display_name,email,recovery_email")
      .eq("recovery_email", identifier)
      .maybeSingle();
  const profile = loginProfile ?? recoveryProfile;
  if (!profile?.email || !profile.recovery_email) return json({ message: genericMessage });

  const redirectTo = `${appUrl.replace(/\/$/, "")}/reset-password`;
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "recovery",
    email: profile.email,
    options: { redirectTo },
  });
  if (linkError || !linkData.properties.action_link) return json({ message: genericMessage });

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [profile.recovery_email],
      subject: "Reset your UPH Investment Club password",
      text: [
        `Hello ${profile.display_name},`,
        "",
        "Use the link below to create a new UPH Investment Club password:",
        linkData.properties.action_link,
        "",
        "If you did not request this reset, you can ignore this email.",
      ].join("\n"),
    }),
  });

  return json({ message: genericMessage });
});
