import { useState } from "react";
import { KeyRound, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  contentPermissionLabels,
  contentPermissions,
  type ContentPermission,
} from "@/lib/contentAccess";

interface Props {
  onCreated: () => void;
}

const makePassword = () => {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const values = crypto.getRandomValues(new Uint32Array(14));
  return Array.from(values, (value) => characters[value % characters.length]).join("");
};

const CreateMemberDialog = ({ onCreated }: Props) => {
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [permissions, setPermissions] = useState<ContentPermission[]>([]);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const reset = () => {
    setDisplayName("");
    setLoginEmail("");
    setRecoveryEmail("");
    setTemporaryPassword("");
    setPermissions([]);
  };

  const togglePermission = (permission: ContentPermission, enabled: boolean) => {
    setPermissions((current) => enabled
      ? [...current, permission]
      : current.filter((item) => item !== permission));
  };

  const createMember = async () => {
    setSaving(true);
    const { data, error } = await supabase.functions.invoke<{ message: string; emailSent: boolean }>("create-member", {
      body: { displayName, loginEmail, recoveryEmail, temporaryPassword, permissions },
    });
    setSaving(false);
    if (error) {
      toast({ title: "Could not create member", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: "Member created",
      description: data?.message,
    });
    reset();
    setOpen(false);
    onCreated();
  };

  const valid =
    displayName.trim().length >= 2 &&
    loginEmail.includes("@") &&
    recoveryEmail.includes("@") &&
    temporaryPassword.length >= 8;

  return (
    <Dialog open={open} onOpenChange={(next) => {
      setOpen(next);
      if (!next) reset();
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Create Member
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Member Account</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="new-member-name">Name</Label>
            <Input id="new-member-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-member-login">Investment Club login email</Label>
            <Input
              id="new-member-login"
              type="email"
              placeholder="member login email"
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-member-recovery">Recovery email</Label>
            <Input
              id="new-member-recovery"
              type="email"
              placeholder="personal@gmail.com"
              value={recoveryEmail}
              onChange={(event) => setRecoveryEmail(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-member-password">Temporary password</Label>
            <div className="flex gap-2">
              <Input
                id="new-member-password"
                value={temporaryPassword}
                onChange={(event) => setTemporaryPassword(event.target.value)}
              />
              <Button type="button" variant="outline" size="icon" title="Generate password" onClick={() => setTemporaryPassword(makePassword())}>
                <KeyRound className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Initial content access</Label>
            <div className="divide-y divide-border rounded-md border border-border">
              {contentPermissions.map((permission) => (
                <div key={permission} className="flex items-center justify-between gap-4 px-3 py-2.5">
                  <span className="text-sm text-foreground">{contentPermissionLabels[permission]}</span>
                  <Switch
                    checked={permissions.includes(permission)}
                    onCheckedChange={(checked) => togglePermission(permission, checked)}
                    aria-label={`${contentPermissionLabels[permission]} initial access`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={createMember} disabled={!valid || saving}>
            {saving ? "Creating..." : "Create Member"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMemberDialog;
