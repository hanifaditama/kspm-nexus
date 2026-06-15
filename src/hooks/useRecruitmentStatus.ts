import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RecruitmentSettings {
  recruitment_open: boolean;
  recruitment_eyebrow: string;
  recruitment_title: string;
  recruitment_description: string;
  recruitment_deadline: string | null;
  recruitment_requirements: string[];
  recruitment_application_url: string | null;
}

export const useRecruitmentStatus = () => {
  const query = useQuery({
    queryKey: ["site-settings", "recruitment"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("recruitment_open,recruitment_eyebrow,recruitment_title,recruitment_description,recruitment_deadline,recruitment_requirements,recruitment_application_url")
        .eq("id", "main")
        .maybeSingle();
      if (error) throw error;
      return data as RecruitmentSettings | null;
    },
    staleTime: 5 * 60_000,
  });

  return {
    isOpen: query.data?.recruitment_open ?? false,
    settings: query.data ?? null,
    loading: query.isLoading,
    refresh: query.refetch,
  };
};
