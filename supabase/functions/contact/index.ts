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

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ message: "Method not allowed." }, 405);

  const body = await request.json().catch(() => ({}));
  const name = clean(body.name);
  const email = clean(body.email).toLowerCase();
  const subject = clean(body.subject).replace(/\s+/g, " ");
  const message = clean(body.message);
  const website = clean(body.website);

  if (website) return json({ sent: true, message: "Thank you. Your message was received." });
  if (
    name.length < 2 ||
    name.length > 100 ||
    subject.length < 3 ||
    subject.length > 160 ||
    message.length < 10 ||
    message.length > 5000
  ) {
    return json({ message: "Please check the submitted fields." }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return json({ message: "Please enter a valid email address." }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const salt = Deno.env.get("CONTACT_HASH_SALT");
  if (!salt) return json({ message: "Contact service is not configured." }, 503);

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = await sha256(`${salt}:${ip}`);
  const cutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("contact_submissions")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", cutoff);

  if ((count ?? 0) >= 3) {
    return json({ message: "Too many messages. Please try again later." }, 429);
  }

  const { data: submission, error: insertError } = await admin
    .from("contact_submissions")
    .insert({ name, email, subject, message, ip_hash: ipHash })
    .select("id")
    .single();

  if (insertError) return json({ message: "Unable to store the message." }, 500);

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("CONTACT_FROM_EMAIL");
  if (!resendApiKey || !from) {
    return json({
      sent: false,
      message: "Your message was saved. Email delivery is awaiting administrator configuration.",
    }, 202);
  }

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: ["investment.club@uph.edu"],
      reply_to: email,
      subject: `[KSPM Nexus] ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
    }),
  });

  if (!emailResponse.ok) {
    const deliveryError = (await emailResponse.text()).slice(0, 500);
    await admin.from("contact_submissions").update({ delivery_error: deliveryError }).eq("id", submission.id);
    return json({
      sent: false,
      message: "Your message was saved, but email delivery is temporarily unavailable.",
    }, 202);
  }

  await admin.from("contact_submissions").update({ email_sent: true }).eq("id", submission.id);
  return json({ sent: true, message: "Thank you. Your message was sent successfully." });
});
