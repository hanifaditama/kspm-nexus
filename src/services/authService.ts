import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface AuthState {
  session: Session | null;
  user: User | null;
  profile: { display_name: string; can_upload: boolean } | null;
  isAdmin: boolean;
}

export async function loadAuthState(session: Session | null): Promise<AuthState> {
  const user = session?.user ?? null;

  if (!user) {
    return { session: null, user: null, profile: null, isAdmin: false };
  }

  const [profileResult, roleResult] = await Promise.all([
    supabase
      .from("member_profiles")
      .select("display_name, can_upload")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle(),
  ]);

  return {
    session,
    user,
    profile: profileResult.data,
    isAdmin: Boolean(roleResult.data),
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
