import { useCallback, useEffect, useMemo, useState } from "react";
import { Crown, Search, ShieldCheck, Trash2 } from "lucide-react";
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
  const [removingId, setRemovingId] = useState("");
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

  const toggleAdministrator = async (member: MemberProfile, enabled: boolean) => {
    const key = `${member.user_id}:administrator`;
    setSavingKey(key);
    const { error } = enabled
      ? await supabase.from("user_roles").insert({ user_id: member.user_id, role: "admin" })
      : await supabase.from("user_roles").delete().eq("user_id", member.user_id).eq("role", "admin");
    setSavingKey("");
    if (error) {
      toast({ title: "Could not update administrator", description: error.message, variant: "destructive" });
      return;
    }
    setAdminIds((current) => {
      const next = new Set(current);
      if (enabled) next.add(member.user_id);
      else next.delete(member.user_id);
      return next;
    });
    toast({
      title: enabled ? "Administrator added" : "Administrator revoked",
      description: enabled
        ? `${member.display_name} now has full content management access.`
        : `${member.display_name} no longer has administrator access.`,
    });
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

  const removeMember = async (member: MemberProfile) => {
    setRemovingId(member.user_id);
    const { data, error } = await supabase.functions.invoke<{ message: string }>("remove-member", {
      body: { userId: member.user_id },
    });
    setRemovingId("");
    if (error) {
      toast({ title: "Could not remove member", description: error.message, variant: "destructive" });
      return;
    }
    setMembers((current) => current.filter((item) => item.user_id !== member.user_id));
    setPermissions((current) => {
      const next = { ...current };
      delete next[member.user_id];
      return next;
    });
    setAdminIds((current) => {
      const next = new Set(current);
      next.delete(member.user_id);
      return next;
    });
    toast({ title: "Member removed", description: data?.message ?? `${member.display_name}'s account was removed.` });
  };

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#1d1c18] shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-normal text-[#191916]">Access Control</h1>
            <p className="mt-1 text-sm text-[#686760]">Create or remove accounts, assign content access, manage secondary administrators, and transfer primary ownership.</p>
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
        <div className="mt-6 overflow-x-auto rounded-xl border border-black/5 bg-white shadow-sm">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-black/5 bg-[#f6f6f4] text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">Member</th>
                {contentPermissions.map((permission) => (
                  <th key={permission} className="px-3 py-3 text-center font-medium text-muted-foreground">
                    {contentPermissionLabels[permission]}
                  </th>
                ))}
                <th className="px-3 py-3 text-center font-medium text-muted-foreground">Administrator</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Primary administrator</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
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
                      {fullAccess && <p className="mt-1 text-xs font-medium text-[#1d1c18]">Administrator - Full access</p>}
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
                    <td className="px-3 py-4 text-center">
                      <Switch
                        aria-label={`Administrator access for ${member.display_name}`}
                        checked={fullAccess}
                        disabled={member.user_id === primaryAdminId || savingKey === `${member.user_id}:administrator`}
                        onCheckedChange={(checked) => void toggleAdministrator(member, checked)}
                      />
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {member.user_id === primaryAdminId ? "Primary" : fullAccess ? "Full access" : "Member"}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-right">
                      {member.user_id === primaryAdminId ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1d1c18]">
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
                    <td className="px-4 py-4 text-right">
                      {member.user_id !== primaryAdminId && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" title={`Remove ${member.display_name}`} disabled={removingId === member.user_id}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove member account?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This permanently removes {member.display_name} ({member.email ?? "no login email"}) from authentication,
                                access control, and member resources. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => void removeMember(member)}
                              >
                                Remove member
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
