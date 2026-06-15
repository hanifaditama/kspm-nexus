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
    .select("user_id")
    .eq("id", "main")
    .maybeSingle();
  if (!primaryAdmin || primaryAdmin.user_id !== callerData.user.id) {
    return json({ message: "Primary administrator access required." }, 403);
  }

  const body = await request.json().catch(() => ({}));
  const userId = clean(body.userId);
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return json({ message: "Invalid member account." }, 400);
  if (userId === primaryAdmin.user_id) return json({ message: "The primary administrator cannot be removed." }, 400);

  const { data: target, error: targetError } = await admin.auth.admin.getUserById(userId);
  if (targetError || !target.user) return json({ message: "Member account not found." }, 404);

  const { data: storedFiles } = await admin.storage.from("member-files").list(userId, { limit: 1000 });
  if (storedFiles?.length) {
    const paths = storedFiles.filter((file) => file.name).map((file) => `${userId}/${file.name}`);
    if (paths.length) await admin.storage.from("member-files").remove(paths);
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) return json({ message: deleteError.message }, 500);

  return json({ removed: true, message: "Member account removed." });
});
