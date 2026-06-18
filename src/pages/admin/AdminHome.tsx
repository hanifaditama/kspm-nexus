import { Link } from "react-router-dom";
import { FileText, Calendar, Users, BookOpen, Loader2, ShieldCheck, UserPlus, CalendarDays } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useRecruitmentStatus } from "@/hooks/useRecruitmentStatus";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { ContentPermission } from "@/lib/contentAccess";
import useAccessDeniedToast from "@/hooks/useAccessDeniedToast";

const cards = [
  { to: "/admin/articles", label: "Articles", description: "Publish and edit articles", icon: FileText, permission: "articles" as ContentPermission },
  { to: "/admin/events", label: "Events", description: "Schedule and manage events", icon: Calendar, permission: "events" as ContentPermission },
  { to: "/admin/team", label: "Team", description: "Manage team member profiles", icon: Users, permission: "team" as ContentPermission },
  { to: "/admin/programs", label: "Programs", description: "Curate program offerings", icon: BookOpen, permission: "programs" as ContentPermission },
  { to: "/admin/recruitment", label: "Recruitment Page", description: "Edit recruitment content and application link", icon: UserPlus, permission: "recruitment" as ContentPermission },
  { to: "/member/calendar", label: "Member Calendar", description: "Manage internal member schedule and calendar colors", icon: CalendarDays, permission: "calendar" as ContentPermission },
];

const AdminHome = () => {
  const { isOpen, loading, refresh } = useRecruitmentStatus();
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { isAdmin, hasPermission } = useAuth();
  const denyAccess = useAccessDeniedToast();
  const canEditRecruitment = hasPermission("recruitment");

  const toggleRecruitment = async (next: boolean) => {
    if (!canEditRecruitment) return denyAccess("You don't have access to update recruitment status.");
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
      <h1 className="text-3xl font-semibold tracking-normal text-[#191916] dark:text-white">Content Management</h1>
      <p className="mt-1 text-sm text-[#686760] dark:text-[#b6b3aa]">Create, edit, and delete content displayed on the public site.</p>

      <div className="mt-8 rounded-xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1c1b18]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-[#191916] dark:text-white">Recruitment Status</h2>
            <p className="mt-1 text-sm text-[#686760] dark:text-[#b6b3aa]">
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
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.to}
              to={c.to}
              className="group rounded-xl border border-black/5 bg-white p-6 shadow-sm transition-colors hover:border-black/15 dark:border-white/10 dark:bg-[#1c1b18] dark:hover:border-white/20"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#f1f1ef] dark:bg-white/10">
                <Icon className="h-5 w-5 text-[#191916] dark:text-white" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-[#191916] dark:text-white">{c.label}</h3>
              <p className="mt-1 text-sm text-[#686760] dark:text-[#b6b3aa]">{c.description}</p>
            </Link>
          );
        })}
      </div>
      {isAdmin && (
        <Link
          to="/admin/access"
          className="mt-4 flex items-center gap-4 rounded-xl border border-black/5 bg-white p-5 shadow-sm transition-colors hover:border-black/15 dark:border-white/10 dark:bg-[#1c1b18] dark:hover:border-white/20"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f1f1ef] dark:bg-white/10">
            <ShieldCheck className="h-5 w-5 text-[#191916] dark:text-white" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-[#191916] dark:text-white">Access Control</h3>
            <p className="mt-1 text-sm text-[#686760] dark:text-[#b6b3aa]">Choose which members can manage each content area.</p>
          </div>
        </Link>
      )}
    </div>
  );
};

export default AdminHome;
