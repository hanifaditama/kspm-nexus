import { supabase } from "@/integrations/supabase/client";

// Returned shapes mirror the previous Sanity queries so consumer components keep working.

export async function getArticles() {
  const { data } = await supabase
    .from("articles")
    .select("*")
    .order("published_at", { ascending: false });
  return (data ?? []).map((a) => ({
    _id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    category: a.category,
    publishedAt: a.published_at,
    author: { name: a.author_name },
    mainImage: a.cover_image,
    content: a.content,
  }));
}

export async function getArticleBySlug(slug: string) {
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return null;
  return {
    _id: data.id,
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    category: data.category,
    publishedAt: data.published_at,
    author: { name: data.author_name },
    mainImage: data.cover_image,
    content: data.content,
  };
}

export async function getEvents() {
  const { data } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });
  return (data ?? []).map((e) => ({
    _id: e.id,
    title: e.title,
    slug: e.slug,
    type: e.type,
    date: e.event_date,
    time: e.event_time,
    location: e.location,
    description: e.description,
    image: e.image,
  }));
}

export async function getTeam() {
  const { data } = await supabase
    .from("team_members")
    .select("*")
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });
  return (data ?? []).map((m) => ({
    _id: m.id,
    name: m.name,
    role: m.role,
    division: m.division,
    linkedin: m.linkedin,
    bio: m.bio,
    image: m.photo,
  }));
}

export async function getPrograms() {
  const { data } = await supabase
    .from("programs")
    .select("*")
    .order("display_order", { ascending: true });
  return (data ?? []).map((p) => ({
    _id: p.id,
    title: p.title,
    description: p.description,
    icon: p.icon,
    features: p.features ?? [],
    image: p.image,
  }));
}
