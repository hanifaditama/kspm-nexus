import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { loadAuthState, signInWithPassword, signOutCurrentUser } from "@/services/authService";
import type { ContentPermission } from "@/lib/contentAccess";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: { display_name: string; can_upload: boolean; email: string | null } | null;
  isAdmin: boolean;
  isPrimaryAdmin: boolean;
  permissions: ContentPermission[];
  canManageContent: boolean;
  mustChangePassword: boolean;
  hasPermission: (permission: ContentPermission) => boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  isAdmin: false,
  isPrimaryAdmin: false,
  permissions: [],
  canManageContent: false,
  mustChangePassword: false,
  hasPermission: () => false,
  loading: true,
  signIn: async () => ({ error: null }),
  signOut: async () => ({ error: null }),
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPrimaryAdmin, setIsPrimaryAdmin] = useState(false);
  const [permissions, setPermissions] = useState<ContentPermission[]>([]);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [loading, setLoading] = useState(true);

  const syncSession = useCallback(async (nextSession: Session | null) => {
    setLoading(true);
    const next = await loadAuthState(nextSession);
    setSession(next.session);
    setUser(next.user);
    setProfile(next.profile);
    setIsAdmin(next.isAdmin);
    setIsPrimaryAdmin(next.isPrimaryAdmin);
    setPermissions(next.permissions);
    setMustChangePassword(next.mustChangePassword);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) void syncSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) void syncSession(nextSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [syncSession]);

  useEffect(() => {
    if (!session?.user) return;

    const channel = supabase
      .channel(`content_permissions_${session.user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_content_permissions",
          filter: `user_id=eq.${session.user.id}`,
        },
        () => {
          void loadAuthState(session).then((next) => {
            setIsAdmin(next.isAdmin);
            setIsPrimaryAdmin(next.isPrimaryAdmin);
            setPermissions(next.permissions);
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [session]);

  const signIn = async (email: string, password: string) => {
    const { error } = await signInWithPassword(email, password);
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    const { error } = await signOutCurrentUser();
    if (!error) {
      setSession(null);
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      setIsPrimaryAdmin(false);
      setPermissions([]);
      setMustChangePassword(false);
    }
    return { error: error?.message ?? null };
  };

  const hasPermission = useCallback(
    (permission: ContentPermission) => isAdmin || permissions.includes(permission),
    [isAdmin, permissions],
  );
  const canManageContent = isAdmin || permissions.length > 0;

  return (
    <AuthContext.Provider value={{ session, user, profile, isAdmin, isPrimaryAdmin, permissions, canManageContent, mustChangePassword, hasPermission, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
