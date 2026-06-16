import { supabase } from "@/integrations/supabase/client";

function assertNoError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export async function getArticles(limit?: number) {
  let query = supabase
    .from("articles")
    .select("id,title,slug,excerpt,category,published_at,author_name,cover_image")
    .order("published_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  assertNoError(error);
  return (data ?? []).map((article) => ({
    _id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt ?? "",
    category: article.category?.trim() || "General",
    publishedAt: article.published_at,
    author: { name: article.author_name ?? "UPH Investment Club" },
    mainImage: article.cover_image,
    content: null as string | null,
  }));
}

export async function getArticleBySlug(slug: string) {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  assertNoError(error);
  if (!data) return null;
  return {
    _id: data.id,
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt ?? "",
    category: data.category?.trim() || "General",
    publishedAt: data.published_at,
    author: { name: data.author_name ?? "UPH Investment Club" },
    mainImage: data.cover_image,
    content: data.content,
  };
}

export async function getEvents(limit?: number) {
  let query = supabase
    .from("events")
    .select("id,title,slug,type,event_date,event_time,location,description,image,registration_url")
    .order("event_date", { ascending: true });
  if (limit) query = query.gte("event_date", new Date().toISOString()).limit(limit);
  const { data, error } = await query;
  assertNoError(error);
  return (data ?? []).map((event) => ({
    _id: event.id,
    title: event.title,
    slug: event.slug,
    type: event.type as "seminar" | "workshop" | "competition" | "webinar",
    date: event.event_date,
    time: event.event_time ?? "",
    location: event.location ?? "",
    description: event.description ?? "",
    image: event.image,
    registrationUrl: event.registration_url ?? undefined,
  }));
}

export async function getTeam(limit?: number) {
  let query = supabase
    .from("team_members")
    .select("id,name,role,division,linkedin,bio,photo")
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  assertNoError(error);
  return (data ?? []).map((member) => ({
    _id: member.id,
    name: member.name,
    role: member.role,
    division: member.division ?? "General",
    linkedin: member.linkedin,
    bio: member.bio,
    image: member.photo,
  }));
}

export async function getPrograms(limit?: number) {
  let query = supabase
    .from("programs")
    .select("id,title,description,icon,features,image")
    .order("display_order", { ascending: true });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  assertNoError(error);
  return (data ?? []).map((program) => ({
    _id: program.id,
    title: program.title,
    description: program.description ?? "",
    icon: program.icon ?? "BookOpen",
    features: program.features ?? [],
    image: program.image,
  }));
}
