import {
  corsHeaders,
  enforceRateLimit,
  getAdminClient,
  json,
  rejectInvalidRequest,
  requirePrimaryAdministrator,
  writeAuditLog,
} from "../_shared/security.ts";

const clean = (value: unknown) => (typeof value === "string" ? value.trim() : "");

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(request) });
  if (request.method !== "POST") return json(request, { message: "Method not allowed." }, 405);
  const invalid = rejectInvalidRequest(request, 4_096);
  if (invalid) return invalid;

  const admin = getAdminClient();
  const authorization = await requirePrimaryAdministrator(request, admin);
  if (authorization.error || !authorization.user) return authorization.error;

  try {
    const allowed = await enforceRateLimit(admin, "remove-member", authorization.user.id, 10, 15 * 60 * 1000);
    if (!allowed) return json(request, { message: "Too many member removal requests. Try again later." }, 429);
  } catch (error) {
    console.error("Remove-member rate limit failed", error);
    return json(request, { message: "Could not verify request security." }, 503);
  }

  const { data: primaryAdmin, error: primaryError } = await admin
    .from("primary_administrator")
    .select("user_id")
    .eq("id", "main")
    .maybeSingle();
  if (primaryError || !primaryAdmin) return json(request, { message: "Could not verify primary administrator." }, 500);

  const body = await request.json().catch(() => ({}));
  const userId = clean(body.userId);
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return json(request, { message: "Invalid member account." }, 400);
  if (userId === primaryAdmin.user_id) return json(request, { message: "The primary administrator cannot be removed." }, 400);

  const { data: target, error: targetError } = await admin.auth.admin.getUserById(userId);
  if (targetError || !target.user) return json(request, { message: "Member account not found." }, 404);

  const { data: fileRows, error: fileRowsError } = await admin
    .from("member_files")
    .select("file_path")
    .eq("uploaded_by", userId);
  if (fileRowsError) {
    console.error("Could not list member files", fileRowsError.message);
    return json(request, { message: "Could not safely remove member files." }, 500);
  }
  if (fileRows?.length) {
    const { error: storageError } = await admin.storage.from("member-files").remove(fileRows.map((file) => file.file_path));
    if (storageError) {
      console.error("Could not remove member storage", storageError.message);
      return json(request, { message: "Could not safely remove member files." }, 500);
    }
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) {
    console.error("Could not remove member", deleteError.message);
    return json(request, { message: "Could not remove member account." }, 500);
  }

  await writeAuditLog(admin, authorization.user.id, "member.removed", userId);
  return json(request, { removed: true, message: "Member account removed." });
});
