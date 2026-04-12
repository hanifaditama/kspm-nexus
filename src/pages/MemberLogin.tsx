import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, KeyRound, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type View = "login" | "forgot" | "change";

const MemberLogin = () => {
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError("Invalid credentials. Please try again.");
    } else {
      navigate("/member");
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Password reset link has been sent to your email.");
    }
    setLoading(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError("Current credentials are invalid.");
      setLoading(false);
      return;
    }
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      setError(updateError.message);
    } else {
      toast({ title: "Password updated successfully" });
      setView("login");
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setLoading(false);
  };

  const resetForm = (newView: View) => {
    setError("");
    setSuccess("");
    setView(newView);
  };

  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            {view === "change" ? (
              <KeyRound className="h-6 w-6 text-primary-foreground" />
            ) : (
              <Lock className="h-6 w-6 text-primary-foreground" />
            )}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {view === "login" && "Member Login"}
            {view === "forgot" && "Forgot Password"}
            {view === "change" && "Change Password"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {view === "login" && "Sign in to access member resources"}
            {view === "forgot" && "Enter your email to receive a reset link"}
            {view === "change" && "Sign in and set a new password"}
          </p>
        </div>

        {/* LOGIN */}
        {view === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" placeholder="member@kspm.org" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <div className="flex items-center justify-between text-xs">
              <button type="button" onClick={() => resetForm("forgot")} className="text-accent hover:underline">
                Forgot password?
              </button>
              <button type="button" onClick={() => resetForm("change")} className="text-accent hover:underline">
                Change password
              </button>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD */}
        {view === "forgot" && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
            )}
            {success && (
              <div className="rounded-md bg-accent/10 px-4 py-3 text-sm text-accent">{success}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="reset-email" type="email" placeholder="member@kspm.org" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
            <button type="button" onClick={() => resetForm("login")} className="flex items-center gap-1 text-xs text-accent hover:underline">
              <ArrowLeft className="h-3 w-3" /> Back to login
            </button>
          </form>
        )}

        {/* CHANGE PASSWORD */}
        {view === "change" && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="cp-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="cp-email" type="email" placeholder="member@kspm.org" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cp-current">Current Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="cp-current" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cp-new">New Password</Label>
              <Input id="cp-new" type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cp-confirm">Confirm New Password</Label>
              <Input id="cp-confirm" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
            <button type="button" onClick={() => resetForm("login")} className="flex items-center gap-1 text-xs text-accent hover:underline">
              <ArrowLeft className="h-3 w-3" /> Back to login
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Access is restricted to KSPM members only.
        </p>
      </div>
    </section>
  );
};

export default MemberLogin;
