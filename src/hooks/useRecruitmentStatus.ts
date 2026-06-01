import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useRecruitmentStatus = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("recruitment_open")
      .eq("id", "main")
      .maybeSingle();
    if (data) setIsOpen(data.recruitment_open);
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

  return { isOpen, loading, refresh };
};
