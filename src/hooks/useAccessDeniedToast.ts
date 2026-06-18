import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

const useAccessDeniedToast = () => {
  const { toast } = useToast();

  return useCallback((description = "You don't have access to change this section.") => {
    toast({
      title: "You don't have access",
      description,
      variant: "destructive",
    });
  }, [toast]);
};

export default useAccessDeniedToast;
