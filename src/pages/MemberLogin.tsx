import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, Mail, KeyRound, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";

type View = "login" | "forgot" | "change";
const SAVED_LOGIN_EMAIL_KEY = "kspm-saved-login-email";
const SAVE_LOGIN_PREFERENCE_KEY = "kspm-save-login-preference";

const MemberLogin = () => {
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState(() => localStorage.getItem(SAVED_LOGIN_EMAIL_KEY) ?? "");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveLogin, setSaveLogin] = useState(() => localStorage.getItem(SAVE_LOGIN_PREFERENCE_KEY) !== "false");
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError("Invalid credentials. Please try again.");
    } else if (saveLogin) {
      localStorage.setItem(SAVED_LOGIN_EMAIL_KEY, email.trim().toLowerCase());
      localStorage.setItem(SAVE_LOGIN_PREFERENCE_KEY, "true");
    } else {
      localStorage.removeItem(SAVED_LOGIN_EMAIL_KEY);
      localStorage.setItem(SAVE_LOGIN_PREFERENCE_KEY, "false");
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const { data, error } = await supabase.functions.invoke<{ message: string }>("account-recovery", {
      body: { identifier: email },
    });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(data?.message ?? "If the account exists, a reset link has been sent to its recovery email.");
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
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
      data: { must_change_password: false },
    });
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
      <SEO title="Member Login" path="/login" noIndex />
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
            {view === "forgot" && "Enter your KSPM login email or recovery email"}
            {view === "change" && "Sign in and set a new password"}
          </p>
        </div>

        {/* LOGIN */}
        {view === "login" && (
          <form onSubmit={handleLogin} autoComplete="on" className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" name="username" type="email" autoComplete="username" placeholder="member@kspm.org" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="save-login"
                checked={saveLogin}
                onCheckedChange={(checked) => setSaveLogin(checked === true)}
              />
              <Label htmlFor="save-login" className="cursor-pointer text-xs font-normal text-muted-foreground">
                Save login in browser
              </Label>
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
              <Label htmlFor="reset-email">KSPM or recovery email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="reset-email" type="email" placeholder="name@kspm.uph or Gmail" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
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
