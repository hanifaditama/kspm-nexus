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
const validPermissions = new Set(["recruitment", "articles", "events", "team", "programs", "calendar"]);

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ message: "Method not allowed." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const authorization = request.headers.get("Authorization") ?? "";
  const token = authorization.replace(/^Bearer\s+/i, "");
  const admin = createClient(supabaseUrl, serviceRoleKey);
  const { data: callerData, error: callerError } = await admin.auth.getUser(token);
  if (callerError || !callerData.user) return json({ message: "Unauthorized." }, 401);

  const { data: primaryAdmin } = await admin
    .from("primary_administrator")
    .select("id")
    .eq("id", "main")
    .eq("user_id", callerData.user.id)
    .maybeSingle();
  if (!primaryAdmin) return json({ message: "Primary administrator access required." }, 403);

  const body = await request.json().catch(() => ({}));
  const displayName = clean(body.displayName);
  const loginEmail = clean(body.loginEmail).toLowerCase();
  const recoveryEmail = clean(body.recoveryEmail).toLowerCase();
  const temporaryPassword = clean(body.temporaryPassword);
  const permissions = Array.isArray(body.permissions)
    ? [...new Set(body.permissions.filter((item: unknown) => typeof item === "string" && validPermissions.has(item)))]
    : [];
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const domain = (Deno.env.get("KSPM_EMAIL_DOMAIN") ?? "kspm.uph.edu").toLowerCase();

  if (displayName.length < 2 || displayName.length > 100) return json({ message: "Please enter a valid name." }, 400);
  if (!emailPattern.test(loginEmail) || !loginEmail.endsWith(`@${domain}`)) {
    return json({ message: `Login email must use @${domain}.` }, 400);
  }
  if (!emailPattern.test(recoveryEmail) || recoveryEmail.length > 254) {
    return json({ message: "Please enter a valid recovery email." }, 400);
  }
  if (temporaryPassword.length < 8 || temporaryPassword.length > 72) {
    return json({ message: "Temporary password must contain 8 to 72 characters." }, 400);
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: loginEmail,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: { display_name: displayName, must_change_password: true },
  });
  if (createError || !created.user) return json({ message: createError?.message ?? "Could not create member." }, 400);

  const userId = created.user.id;
  const { error: profileError } = await admin
    .from("member_profiles")
    .update({ display_name: displayName, email: loginEmail, recovery_email: recoveryEmail })
    .eq("user_id", userId);
  const { error: permissionError } = permissions.length
    ? await admin.from("user_content_permissions").insert(
      permissions.map((permission) => ({ user_id: userId, permission })),
    )
    : { error: null };

  if (profileError || permissionError) {
    await admin.auth.admin.deleteUser(userId);
    return json({ message: profileError?.message ?? permissionError?.message ?? "Could not configure member." }, 500);
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("ACCOUNT_FROM_EMAIL") ?? Deno.env.get("CONTACT_FROM_EMAIL");
  const appUrl = Deno.env.get("APP_URL") ?? "";
  let emailSent = false;
  if (resendApiKey && from) {
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [recoveryEmail],
        subject: "Your KSPM Nexus account",
        text: [
          `Hello ${displayName},`,
          "",
          "Your KSPM Nexus account has been created.",
          `Login email: ${loginEmail}`,
          `Temporary password: ${temporaryPassword}`,
          appUrl ? `Sign in: ${appUrl}/login` : "",
          "",
          "You will be required to create a new password after signing in.",
        ].filter(Boolean).join("\n"),
      }),
    });
    emailSent = emailResponse.ok;
  }

  return json({
    created: true,
    emailSent,
    message: emailSent
      ? "Member created and login details sent to the recovery email."
      : "Member created. Email delivery is not configured, so share the temporary credentials securely.",
  });
});
