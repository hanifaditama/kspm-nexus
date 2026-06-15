import { Link } from "react-router-dom";
import { FileText, Calendar, Users, BookOpen, Loader2, ShieldCheck, UserPlus, FileCheck2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useRecruitmentStatus } from "@/hooks/useRecruitmentStatus";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { ContentPermission } from "@/lib/contentAccess";

const cards = [
  { to: "/admin/articles", label: "Articles", description: "Publish and edit articles", icon: FileText, permission: "articles" as ContentPermission },
  { to: "/admin/events", label: "Events", description: "Schedule and manage events", icon: Calendar, permission: "events" as ContentPermission },
  { to: "/admin/team", label: "Team", description: "Manage team member profiles", icon: Users, permission: "team" as ContentPermission },
  { to: "/admin/programs", label: "Programs", description: "Curate program offerings", icon: BookOpen, permission: "programs" as ContentPermission },
  { to: "/admin/recruitment", label: "Recruitment Page", description: "Edit recruitment content and application link", icon: UserPlus, permission: "recruitment" as ContentPermission },
  { to: "/member/screening", label: "Screening Dashboard", description: "Manage screening materials, status, and notes", icon: FileCheck2, permission: "screening" as ContentPermission },
];

const AdminHome = () => {
  const { isOpen, loading, refresh } = useRecruitmentStatus();
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { isPrimaryAdmin, hasPermission } = useAuth();
  const canEditRecruitment = hasPermission("recruitment");
  const visibleCards = cards.filter((card) => hasPermission(card.permission));

  const toggleRecruitment = async (next: boolean) => {
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .update({ recruitment_open: next, updated_at: new Date().toISOString() })
      .eq("id", "main");
    setSaving(false);
    if (error) {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: next ? "Recruitment opened" : "Recruitment closed" });
    refresh();
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Content Management</h1>
      <p className="mt-1 text-sm text-muted-foreground">Create, edit, and delete content displayed on the public site.</p>

      {canEditRecruitment && <div className="mt-8 rounded-lg border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Recruitment Status</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              When closed, the recruitment landing page is hidden and the "Open Recruitment" badge is replaced with "Recruitment Closed".
            </p>
          </div>
          <div className="flex items-center gap-3">
            {(loading || saving) && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            <Label htmlFor="recruitment-toggle" className="text-sm font-medium">
              {isOpen ? "Open" : "Closed"}
            </Label>
            <Switch
              id="recruitment-toggle"
              checked={isOpen}
              disabled={loading || saving}
              onCheckedChange={toggleRecruitment}
            />
          </div>
        </div>
      </div>}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {visibleCards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.to}
              to={c.to}
              className="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-accent/40"
            >
              <Icon className="h-6 w-6 text-accent" />
              <h3 className="mt-3 text-base font-semibold text-foreground group-hover:text-accent">{c.label}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
            </Link>
          );
        })}
      </div>
      {isPrimaryAdmin && (
        <Link
          to="/admin/access"
          className="mt-4 flex items-center gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:border-accent/40"
        >
          <ShieldCheck className="h-6 w-6 shrink-0 text-accent" />
          <div>
            <h3 className="text-base font-semibold text-foreground">Access Control</h3>
            <p className="mt-1 text-sm text-muted-foreground">Choose which members can manage each content area.</p>
          </div>
        </Link>
      )}
      {!canEditRecruitment && visibleCards.length === 0 && (
        <p className="mt-8 rounded-md border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          No content access has been assigned to this account.
        </p>
      )}
    </div>
  );
};

export default AdminHome;
