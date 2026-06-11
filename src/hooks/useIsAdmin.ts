import { useAuth } from "@/contexts/AuthContext";

export function useIsAdmin() {
  const { isAdmin, loading } = useAuth();
  return { isAdmin, loading };
}
