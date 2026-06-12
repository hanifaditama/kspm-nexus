import { useCallback, useEffect, useMemo, useState } from "react";
import { Crown, Search, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import CreateMemberDialog from "@/components/admin/CreateMemberDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  contentPermissionLabels,
  contentPermissions,
  type ContentPermission,
} from "@/lib/contentAccess";

interface MemberProfile {
  user_id: string;
  display_name: string;
  email: string | null;
  recovery_email: string | null;
}

const AdminAccess = () => {
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [permissions, setPermissions] = useState<Record<string, ContentPermission[]>>({});
  const [adminIds, setAdminIds] = useState<Set<string>>(new Set());
  const [primaryAdminId, setPrimaryAdminId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState("");
  const [transferringId, setTransferringId] = useState("");
  const { toast } = useToast();

  const loadAccess = useCallback(async () => {
    setLoading(true);
    const [profilesResult, permissionsResult, rolesResult, primaryAdminResult] = await Promise.all([
      supabase.from("member_profiles").select("user_id,display_name,email,recovery_email").order("display_name"),
      supabase.from("user_content_permissions").select("user_id,permission"),
      supabase.from("user_roles").select("user_id,role").eq("role", "admin"),
      supabase.from("primary_administrator").select("user_id").eq("id", "main").maybeSingle(),
    ]);
    const error = profilesResult.error ?? permissionsResult.error ?? rolesResult.error ?? primaryAdminResult.error;
    if (error) {
      toast({ title: "Could not load access settings", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const grouped: Record<string, ContentPermission[]> = {};
    for (const item of permissionsResult.data ?? []) {
      const permission = item.permission as ContentPermission;
      grouped[item.user_id] = [...(grouped[item.user_id] ?? []), permission];
    }
    setMembers(profilesResult.data ?? []);
    setPermissions(grouped);
    setAdminIds(new Set((rolesResult.data ?? []).map((role) => role.user_id)));
    setPrimaryAdminId(primaryAdminResult.data?.user_id ?? "");
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    void loadAccess();
  }, [loadAccess]);

  const filteredMembers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return members;
    return members.filter((member) =>
      `${member.display_name} ${member.email ?? ""} ${member.recovery_email ?? ""}`.toLowerCase().includes(term),
    );
  }, [members, search]);

  const togglePermission = async (userId: string, permission: ContentPermission, enabled: boolean) => {
    const key = `${userId}:${permission}`;
    setSavingKey(key);
    const { error } = enabled
      ? await supabase.from("user_content_permissions").insert({ user_id: userId, permission })
      : await supabase.from("user_content_permissions").delete().eq("user_id", userId).eq("permission", permission);
    setSavingKey("");
    if (error) {
      toast({ title: "Could not update access", description: error.message, variant: "destructive" });
      return;
    }
    setPermissions((current) => ({
      ...current,
      [userId]: enabled
        ? [...(current[userId] ?? []), permission]
        : (current[userId] ?? []).filter((item) => item !== permission),
    }));
    toast({ title: "Access updated" });
  };

  const transferPrimaryAdministrator = async (member: MemberProfile) => {
    setTransferringId(member.user_id);
    const { error } = await supabase.rpc("transfer_primary_administrator", {
      _target_user_id: member.user_id,
    });
    setTransferringId("");
    if (error) {
      toast({ title: "Could not transfer administrator", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Primary administrator transferred", description: `${member.display_name} now controls member access.` });
    window.location.assign("/member");
  };

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 text-accent">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Access Control</h1>
            <p className="mt-1 text-sm text-muted-foreground">Create accounts, assign content access, and transfer the primary administrator role.</p>
          </div>
        </div>
        <CreateMemberDialog onCreated={() => void loadAccess()} />
      </div>

      <div className="relative mt-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search member by name or email"
          className="pl-9"
        />
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading access settings...</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">Member</th>
                {contentPermissions.map((permission) => (
                  <th key={permission} className="px-3 py-3 text-center font-medium text-muted-foreground">
                    {contentPermissionLabels[permission]}
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Primary administrator</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => {
                const fullAccess = adminIds.has(member.user_id);
                return (
                  <tr key={member.user_id} className="border-b border-border last:border-0">
                    <td className="px-4 py-4">
                      <p className="font-medium text-foreground">{member.display_name}</p>
                      <p className="text-xs text-muted-foreground">{member.email ?? "No email available"}</p>
                      {member.recovery_email && (
                        <p className="mt-1 text-xs text-muted-foreground">Recovery: {member.recovery_email}</p>
                      )}
                      {fullAccess && <p className="mt-1 text-xs font-medium text-accent">Administrator - Full access</p>}
                    </td>
                    {contentPermissions.map((permission) => {
                      const key = `${member.user_id}:${permission}`;
                      return (
                        <td key={permission} className="px-3 py-4 text-center">
                          <Switch
                            aria-label={`${contentPermissionLabels[permission]} access for ${member.display_name}`}
                            checked={fullAccess || (permissions[member.user_id] ?? []).includes(permission)}
                            disabled={fullAccess || savingKey === key}
                            onCheckedChange={(checked) => void togglePermission(member.user_id, permission, checked)}
                          />
                        </td>
                      );
                    })}
                    <td className="px-4 py-4 text-right">
                      {member.user_id === primaryAdminId ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent">
                          <Crown className="h-3.5 w-3.5" />
                          Current
                        </span>
                      ) : (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" disabled={Boolean(transferringId)}>
                              <Crown className="h-4 w-4" />
                              Transfer
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Transfer primary administrator?</AlertDialogTitle>
                              <AlertDialogDescription>
                                {member.display_name} will gain full administrative access and control over Access Control.
                                Your current administrator role will be removed immediately.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => void transferPrimaryAdministrator(member)}>
                                Transfer access
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredMembers.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">No members found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminAccess;
