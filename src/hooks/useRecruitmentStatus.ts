import { useEffect, useState } from "react";
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
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [settings, setSettings] = useState<RecruitmentSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("recruitment_open,recruitment_eyebrow,recruitment_title,recruitment_description,recruitment_deadline,recruitment_requirements,recruitment_application_url")
      .eq("id", "main")
      .maybeSingle();
    if (data) {
      setIsOpen(data.recruitment_open);
      setSettings(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const channel = supabase
      .channel(`site_settings_changes_${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings" },
        () => refresh()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { isOpen, settings, loading, refresh };
};
