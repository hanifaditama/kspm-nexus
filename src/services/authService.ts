import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { ContentPermission } from "@/lib/contentAccess";

export interface AuthState {
  session: Session | null;
  user: User | null;
  profile: { display_name: string; can_upload: boolean; email: string | null } | null;
  isAdmin: boolean;
  isPrimaryAdmin: boolean;
  permissions: ContentPermission[];
  mustChangePassword: boolean;
}

export async function loadAuthState(session: Session | null): Promise<AuthState> {
  const user = session?.user ?? null;

  if (!user) {
    return { session: null, user: null, profile: null, isAdmin: false, isPrimaryAdmin: false, permissions: [], mustChangePassword: false };
  }

  const [profileResult, roleResult, primaryAdminResult, permissionsResult] = await Promise.all([
    supabase
      .from("member_profiles")
      .select("display_name, can_upload, email")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle(),
    supabase.rpc("is_primary_administrator", { _user_id: user.id }),
    supabase
      .from("user_content_permissions")
      .select("permission")
      .eq("user_id", user.id),
  ]);

  return {
    session,
    user,
    profile: profileResult.data,
    isAdmin: Boolean(roleResult.data),
    isPrimaryAdmin: primaryAdminResult.data === true,
    permissions: (permissionsResult.data ?? []).map((item) => item.permission as ContentPermission),
    mustChangePassword: user.user_metadata?.must_change_password === true,
  };
}

export async function signInWithPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
}

export async function signOutCurrentUser() {
  return supabase.auth.signOut({ scope: "local" });
}
