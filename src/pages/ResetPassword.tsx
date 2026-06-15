import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound } from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [recoverySession, setRecoverySession] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, mustChangePassword, canManageContent } = useAuth();

  useEffect(() => {
    const hashIsRecovery = window.location.hash.includes("type=recovery");
    if (hashIsRecovery) {
      setRecoverySession(true);
      setReady(true);
    } else if (user) {
      setReady(true);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setRecoverySession(true);
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [user]);

  const requiresCurrentPassword = Boolean(user && !mustChangePassword && !recoverySession);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    if (requiresCurrentPassword) {
      if (!user?.email) {
        setError("Your account email could not be verified.");
        setLoading(false);
        return;
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (signInError) {
        setError("Current password is incorrect.");
        setLoading(false);
        return;
      }
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password,
      data: { ...user?.user_metadata, must_change_password: false },
    });
    if (updateError) {
      setError(updateError.message);
    } else {
      await supabase.auth.signOut({ scope: "others" });
      toast({ title: "Password updated successfully" });
      navigate(canManageContent ? "/admin" : "/member");
    }
    setLoading(false);
  };

  if (!ready) {
    return (
      <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-4">
        <SEO title="Change Password" path="/reset-password" noIndex />
        <p className="text-muted-foreground">Verifying password session...</p>
      </section>
    );
  }

  const title = mustChangePassword ? "Create Your Password" : recoverySession ? "Reset Password" : "Change Password";
  const description = mustChangePassword
    ? "Create a secure password before continuing"
    : recoverySession
      ? "Create a new password for your account"
      : "Confirm your current password before creating a new one";

  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-4">
      <SEO title={title} path="/reset-password" noIndex />
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <KeyRound className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
          {requiresCurrentPassword && (
            <div className="space-y-2">
              <Label htmlFor="current-pw">Current Password</Label>
              <Input
                id="current-pw"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="new-pw">New Password</Label>
            <Input
              id="new-pw"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-pw">Confirm Password</Label>
            <Input
              id="confirm-pw"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat new password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Updating..." : mustChangePassword ? "Create Password" : recoverySession ? "Reset Password" : "Update Password"}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default ResetPassword;
