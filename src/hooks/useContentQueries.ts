import { useQuery } from "@tanstack/react-query";
import { getArticleBySlug, getArticles, getEvents, getPrograms, getTeam } from "@/lib/content";

export const useArticles = (limit?: number) =>
  useQuery({ queryKey: ["articles", limit ?? "all"], queryFn: () => getArticles(limit) });

export const useArticle = (slug?: string) =>
  useQuery({
    queryKey: ["article", slug],
    queryFn: () => getArticleBySlug(slug!),
    enabled: Boolean(slug),
  });

export const useEvents = (limit?: number) =>
  useQuery({ queryKey: ["events", limit ?? "all"], queryFn: () => getEvents(limit) });

export const useTeam = (limit?: number) =>
  useQuery({ queryKey: ["team", limit ?? "all"], queryFn: () => getTeam(limit) });

export const usePrograms = (limit?: number) =>
  useQuery({ queryKey: ["programs", limit ?? "all"], queryFn: () => getPrograms(limit) });
