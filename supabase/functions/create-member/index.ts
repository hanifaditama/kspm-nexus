import {
  corsHeaders,
  enforceRateLimit,
  getAdminClient,
  json,
  randomInternalCredential,
  rejectInvalidRequest,
  requirePrimaryAdministrator,
  writeAuditLog,
} from "../_shared/security.ts";
import { emailTemplate } from "../_shared/email.ts";

const clean = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const validPermissions = new Set(["recruitment", "articles", "events", "team", "programs", "calendar"]);

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(request) });
  if (request.method !== "POST") return json(request, { message: "Method not allowed." }, 405);
  const invalid = rejectInvalidRequest(request);
  if (invalid) return invalid;

  const admin = getAdminClient();
  const authorization = await requirePrimaryAdministrator(request, admin);
  if (authorization.error || !authorization.user) return authorization.error;

  try {
    const allowed = await enforceRateLimit(admin, "create-member", authorization.user.id, 10, 15 * 60 * 1000);
    if (!allowed) return json(request, { message: "Too many account creation requests. Try again later." }, 429);
  } catch (error) {
    console.error("Create-member rate limit failed", error);
    return json(request, { message: "Could not verify request security." }, 503);
  }

  const body = await request.json().catch(() => ({}));
  const displayName = clean(body.displayName);
  const loginEmail = clean(body.loginEmail).toLowerCase();
  const recoveryEmail = clean(body.recoveryEmail).toLowerCase();
  const permissions = Array.isArray(body.permissions)
    ? [...new Set(body.permissions.filter((item: unknown) => typeof item === "string" && validPermissions.has(item)))]
    : [];
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const domain = (Deno.env.get("KSPM_EMAIL_DOMAIN") ?? "kspm.uph.edu").toLowerCase();
  const appUrl = Deno.env.get("APP_URL")?.replace(/\/$/, "");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("ACCOUNT_FROM_EMAIL") ?? Deno.env.get("CONTACT_FROM_EMAIL");

  if (displayName.length < 2 || displayName.length > 100) return json(request, { message: "Please enter a valid name." }, 400);
  if (!emailPattern.test(loginEmail) || !loginEmail.endsWith(`@${domain}`)) {
    return json(request, { message: `Login email must use @${domain}.` }, 400);
  }
  if (!emailPattern.test(recoveryEmail) || recoveryEmail.length > 254) {
    return json(request, { message: "Please enter a valid recovery email." }, 400);
  }
  if (!appUrl || !resendApiKey || !from) return json(request, { message: "Account activation email is not configured." }, 503);

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: loginEmail,
    password: randomInternalCredential(),
    email_confirm: true,
    user_metadata: { display_name: displayName, must_change_password: true },
  });
  if (createError || !created.user) {
    console.error("Could not create member", createError?.message);
    return json(request, { message: "Could not create member account." }, 400);
  }

  const userId = created.user.id;
  const { error: profileError } = await admin
    .from("member_profiles")
    .update({ display_name: displayName, email: loginEmail, recovery_email: recoveryEmail })
    .eq("user_id", userId);
  const { error: permissionError } = permissions.length
    ? await admin.from("user_content_permissions").insert(permissions.map((permission) => ({ user_id: userId, permission })))
    : { error: null };

  if (profileError || permissionError) {
    console.error("Could not configure member", profileError?.message ?? permissionError?.message);
    await admin.auth.admin.deleteUser(userId);
    return json(request, { message: "Could not configure member account." }, 500);
  }

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "recovery",
    email: loginEmail,
    options: { redirectTo: `${appUrl}/reset-password` },
  });
  if (linkError || !linkData.properties.action_link) {
    console.error("Could not generate activation link", linkError?.message);
    await admin.auth.admin.deleteUser(userId);
    return json(request, { message: "Could not create account activation link." }, 500);
  }

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [recoveryEmail],
      subject: "Your UPH Investment Club account is ready",
      html: emailTemplate({
        eyebrow: "Member invitation",
        title: "Create your account password",
        greeting: `Hello ${displayName},`,
        intro: "You have been invited to join the UPH Investment Club member portal. Use the secure one-time link below to create your password and activate your account.",
        actionLabel: "Create Password",
        actionUrl: linkData.properties.action_link,
        details: [{ label: "Login email", value: loginEmail }],
        securityNote: "This link is intended only for you and can be used once. If you were not expecting this invitation, contact the primary administrator.",
      }),
      text: [
        `Hello ${displayName},`,
        "",
        "You have been invited to join the UPH Investment Club member portal.",
        `Login email: ${loginEmail}`,
        "Use this secure one-time link to create your password and activate your account:",
        linkData.properties.action_link,
        "",
        "This link can be used once. If you did not expect this invitation, contact the primary administrator.",
      ].join("\n"),
    }),
  });

  if (!emailResponse.ok) {
    console.error("Could not send activation email", emailResponse.status);
    await admin.auth.admin.deleteUser(userId);
    return json(request, { message: "Could not deliver account activation email. The account was not created." }, 502);
  }

  await writeAuditLog(admin, authorization.user.id, "member.created", userId, { permissions });
  return json(request, {
    created: true,
    emailSent: true,
    message: "Member created and a one-time activation link was sent to the recovery email.",
  });
});
