import {
  corsHeaders,
  enforceRateLimit,
  getAdminClient,
  json,
  rejectInvalidRequest,
  requestIp,
  writeAuditLog,
} from "../_shared/security.ts";
import { emailTemplate } from "../_shared/email.ts";

const clean = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const genericMessage = "If the account exists, a password reset link has been sent to its recovery email.";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(request) });
  if (request.method !== "POST") return json(request, { message: "Method not allowed." }, 405);
  const invalid = rejectInvalidRequest(request, 4_096);
  if (invalid) return invalid;

  const body = await request.json().catch(() => ({}));
  const identifier = clean(body.identifier).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier) || identifier.length > 254) {
    return json(request, { message: genericMessage });
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("ACCOUNT_FROM_EMAIL") ?? Deno.env.get("CONTACT_FROM_EMAIL");
  const appUrl = Deno.env.get("APP_URL");
  if (!resendApiKey || !from || !appUrl) return json(request, { message: "Account recovery is not configured." }, 503);

  const admin = getAdminClient();
  try {
    const [identifierAllowed, ipAllowed] = await Promise.all([
      enforceRateLimit(admin, "account-recovery-identifier", identifier, 3, 15 * 60 * 1000),
      enforceRateLimit(admin, "account-recovery-ip", requestIp(request), 10, 15 * 60 * 1000),
    ]);
    if (!identifierAllowed || !ipAllowed) return json(request, { message: genericMessage });
  } catch (error) {
    console.error("Recovery rate limit failed", error);
    return json(request, { message: genericMessage });
  }

  const { data: loginProfile, error: loginError } = await admin
    .from("member_profiles")
    .select("user_id,display_name,email,recovery_email")
    .eq("email", identifier)
    .maybeSingle();
  const { data: recoveryProfile, error: recoveryError } = loginProfile
    ? { data: null, error: null }
    : await admin
      .from("member_profiles")
      .select("user_id,display_name,email,recovery_email")
      .eq("recovery_email", identifier)
      .maybeSingle();
  if (loginError || recoveryError) {
    console.error("Recovery profile lookup failed", loginError?.message ?? recoveryError?.message);
    return json(request, { message: genericMessage });
  }

  const profile = loginProfile ?? recoveryProfile;
  if (!profile?.email || !profile.recovery_email) return json(request, { message: genericMessage });

  const redirectTo = `${appUrl.replace(/\/$/, "")}/reset-password`;
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "recovery",
    email: profile.email,
    options: { redirectTo },
  });
  if (linkError || !linkData.properties.action_link) {
    console.error("Recovery link generation failed", linkError?.message);
    return json(request, { message: genericMessage });
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [profile.recovery_email],
      subject: "Reset your UPH Investment Club password",
      html: emailTemplate({
        eyebrow: "Account security",
        title: "Reset your password",
        greeting: `Hello ${profile.display_name},`,
        intro: "We received a request to reset your UPH Investment Club member portal password. Use the secure one-time link below to create a new password.",
        actionLabel: "Reset Password",
        actionUrl: linkData.properties.action_link,
        details: [{ label: "Login email", value: profile.email }],
        securityNote: "This link is intended only for you and can be used once. If you did not request a password reset, you can safely ignore this email.",
      }),
      text: [
        `Hello ${profile.display_name},`,
        "",
        "We received a request to reset your UPH Investment Club password.",
        "Use this secure one-time link to create a new password:",
        linkData.properties.action_link,
        "",
        "This link can be used once. If you did not request this reset, you can safely ignore this email.",
      ].join("\n"),
    }),
  });
  if (!response.ok) console.error("Recovery email delivery failed", response.status);

  await writeAuditLog(admin, null, "account.recovery_requested", profile.user_id, {
    delivered: response.ok,
  });
  return json(request, { message: genericMessage });
});
