import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CalendarClock, CheckCircle2, ClipboardList, ExternalLink, FilePenLine, Hourglass, MessageSquare, Pencil, Plus, Search, Settings2, Trash2, UserPlus, X, type LucideIcon } from "lucide-react";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MemberShell from "@/components/dashboard/MemberShell";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import useAccessDeniedToast from "@/hooks/useAccessDeniedToast";

type Division = "BPH" | "CMP" | "EVENT" | "RESEARCH";
type WorkStatus = "Submitted" | "On Progress" | "Upscreening" | "Needs Revision" | "Completed" | "Cancelled";

interface WorkRequest {
  id: string;
  target_division: Division;
  requesting_division: string;
  task: string;
  details: string | null;
  work_link: string | null;
  submission_date: string;
  due_date: string;
  status: WorkStatus;
  responsible_person: string | null;
  responsible_user_id: string | null;
  requested_by: string;
  created_at: string;
}

interface WorkAssignee {
  id: string;
  division: Division;
  user_id: string;
  display_name: string;
  display_order: number;
}

interface WorkComment {
  id: string;
  work_request_id: string;
  user_id: string;
  author_name: string;
  message: string;
  created_at: string;
}

interface MemberProfile {
  user_id: string;
  display_name: string;
  email: string | null;
}

const divisions: Division[] = ["BPH", "CMP", "EVENT", "RESEARCH"];
const statuses: WorkStatus[] = ["Submitted", "On Progress", "Upscreening", "Needs Revision", "Completed", "Cancelled"];
type SummaryCard = [string, number, LucideIcon];

const divisionMeta: Record<Division, { label: string; description: string }> = {
  BPH: { label: "BPH", description: "Internal board, planning, and organization support." },
  CMP: { label: "CMP", description: "Creative, media, publication, and design requests." },
  EVENT: { label: "Event", description: "Program, rundown, logistics, and event operations." },
  RESEARCH: { label: "Research", description: "Market work, reports, investment notes, and analysis." },
};
const requestingDivisionOptions: Division[] = ["BPH", "RESEARCH", "EVENT", "CMP"];

const statusStyle: Record<WorkStatus, string> = {
  Submitted: "border-sky-200 bg-sky-50 text-sky-800",
  "On Progress": "border-amber-200 bg-amber-50 text-amber-900",
  Upscreening: "border-violet-200 bg-violet-50 text-violet-800",
  "Needs Revision": "border-orange-200 bg-orange-50 text-orange-900",
  Completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  Cancelled: "border-slate-200 bg-slate-100 text-slate-700",
};

const blankForm = {
  target_division: "CMP" as Division,
  requesting_division: "RESEARCH" as Division,
  task: "",
  details: "",
  submission_date: new Date().toISOString().slice(0, 10),
};

const normalizeDivision = (value: string): Division => {
  const normalized = value.trim().toUpperCase();
  if (normalized.includes("BPH") || normalized.includes("BOARD")) return "BPH";
  if (normalized.includes("RESEARCH")) return "RESEARCH";
  if (normalized.includes("EVENT")) return "EVENT";
  if (normalized.includes("CMP") || normalized.includes("CREATIVE") || normalized.includes("MEDIA") || normalized.includes("PUBLICATION")) return "CMP";
  return "CMP";
};

const addBusinessDays = (dateValue: string, days: number) => {
  const date = new Date(`${dateValue}T00:00:00`);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) added += 1;
  }
  return date.toISOString().slice(0, 10);
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`));

const isOverdue = (request: WorkRequest) =>
  request.status !== "Completed" && request.status !== "Cancelled" && request.due_date < new Date().toISOString().slice(0, 10);

const WorkRequests = () => {
  const { user, isAdmin, isPrimaryAdmin } = useAuth();
  const { toast } = useToast();
  const denyAccess = useAccessDeniedToast();
  const [requests, setRequests] = useState<WorkRequest[]>([]);
  const [assignees, setAssignees] = useState<WorkAssignee[]>([]);
  const [comments, setComments] = useState<WorkComment[]>([]);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [manageAccess, setManageAccess] = useState<Record<Division, boolean>>({ BPH: false, CMP: false, EVENT: false, RESEARCH: false });
  const [activeDivision, setActiveDivision] = useState<Division>("CMP");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingKey, setSavingKey] = useState("");
  const [form, setForm] = useState(blankForm);
  const [editing, setEditing] = useState<WorkRequest | null>(null);
  const [assigneeToAdd, setAssigneeToAdd] = useState("");
  const [commentMessage, setCommentMessage] = useState("");
  const [editingCommentId, setEditingCommentId] = useState("");
  const [editingCommentMessage, setEditingCommentMessage] = useState("");
  const [editForm, setEditForm] = useState({
    requesting_division: "RESEARCH" as Division,
    task: "",
    details: "",
    submission_date: "",
    status: "Submitted" as WorkStatus,
    responsible_user_id: "",
    work_link: "",
  });

  const loadRequests = useCallback(async () => {
    setLoading(true);
    const [requestsResult, assigneesResult, commentsResult] = await Promise.all([
      supabase
        .from("work_requests")
        .select("id,target_division,requesting_division,task,details,work_link,submission_date,due_date,status,responsible_person,responsible_user_id,requested_by,created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("work_request_assignees")
        .select("id,division,user_id,display_name,display_order")
        .order("display_order", { ascending: true }),
      supabase
        .from("work_request_comments")
        .select("id,work_request_id,user_id,author_name,message,created_at")
        .order("created_at", { ascending: true }),
    ]);

    setLoading(false);
    const error = requestsResult.error ?? assigneesResult.error ?? commentsResult.error;
    if (error) {
      toast({ title: "Could not load work requests", description: error.message, variant: "destructive" });
      return;
    }
    setRequests((requestsResult.data ?? []) as WorkRequest[]);
    setAssignees((assigneesResult.data ?? []) as WorkAssignee[]);
    setComments((commentsResult.data ?? []) as WorkComment[]);
  }, [toast]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    if (!user) return;
    void Promise.all(divisions.map(async (division) => {
      const { data } = await supabase.rpc("can_manage_work_request", { _user_id: user.id, _division: division });
      return [division, data ?? false] as const;
    })).then((entries) => setManageAccess(Object.fromEntries(entries) as Record<Division, boolean>));
  }, [user]);

  useEffect(() => {
    if (!isPrimaryAdmin) return;
    void supabase
      .from("member_profiles")
      .select("user_id,display_name,email")
      .order("display_name")
      .then(({ data, error }) => {
        if (error) {
          toast({ title: "Could not load members", description: error.message, variant: "destructive" });
          return;
        }
        setMembers(data ?? []);
      });
  }, [isPrimaryAdmin, toast]);

  const divisionRequests = useMemo(() => {
    const query = search.trim().toLowerCase();
    return requests
      .filter((request) => request.target_division === activeDivision)
      .filter((request) => !query
        || request.task.toLowerCase().includes(query)
        || request.requesting_division.toLowerCase().includes(query)
        || request.details?.toLowerCase().includes(query)
        || request.responsible_person?.toLowerCase().includes(query));
  }, [activeDivision, requests, search]);

  const summary = useMemo(() => ({
    total: requests.length,
    active: requests.filter((request) => !["Completed", "Cancelled"].includes(request.status)).length,
    completed: requests.filter((request) => request.status === "Completed").length,
    overdue: requests.filter(isOverdue).length,
  }), [requests]);

  const currentSummary = useMemo(() => ({
    total: divisionRequests.length,
    progress: divisionRequests.filter((request) => request.status === "On Progress").length,
    completed: divisionRequests.filter((request) => request.status === "Completed").length,
    overdue: divisionRequests.filter(isOverdue).length,
  }), [divisionRequests]);

  const divisionAssignees = useMemo(
    () => assignees.filter((assignee) => assignee.division === activeDivision),
    [activeDivision, assignees],
  );

  const commentsByRequest = useMemo(() => {
    const grouped = new Map<string, WorkComment[]>();
    for (const comment of comments) {
      grouped.set(comment.work_request_id, [...(grouped.get(comment.work_request_id) ?? []), comment]);
    }
    return grouped;
  }, [comments]);

  const latestCommentByRequest = useMemo(() => {
    const latest = new Map<string, WorkComment>();
    for (const comment of comments) latest.set(comment.work_request_id, comment);
    return latest;
  }, [comments]);

  const openCreate = (division = activeDivision) => {
    setForm({ ...blankForm, target_division: division });
    setDialogOpen(true);
  };

  const createRequest = async () => {
    if (!user || !form.requesting_division || !form.task.trim()) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("work_requests")
      .insert({
        target_division: form.target_division,
        requesting_division: divisionMeta[form.requesting_division].label,
        task: form.task.trim(),
        details: form.details.trim() || null,
        submission_date: form.submission_date,
        requested_by: user.id,
      })
      .select("id,target_division,requesting_division,task,details,work_link,submission_date,due_date,status,responsible_person,responsible_user_id,requested_by,created_at")
      .single();
    setSaving(false);
    if (error) {
      toast({ title: "Could not submit request", description: error.message, variant: "destructive" });
      return;
    }
    setRequests((current) => [data as WorkRequest, ...current]);
    setDialogOpen(false);
    toast({ title: "Work request submitted", description: `${divisionMeta[form.target_division].label} will receive this request.` });
  };

  const openEdit = (request: WorkRequest) => {
    const canManage = manageAccess[request.target_division] || isAdmin;
    const isOwner = request.requested_by === user?.id;
    if (!canManage && !isOwner) return denyAccess("You don't have access to edit this work request.");
    setEditing(request);
    setEditForm({
      requesting_division: normalizeDivision(request.requesting_division),
      task: request.task,
      details: request.details ?? "",
      submission_date: request.submission_date,
      status: request.status,
      responsible_user_id: request.responsible_user_id ?? "",
      work_link: request.work_link ?? "",
    });
    setCommentMessage("");
    setEditingCommentId("");
    setEditingCommentMessage("");
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editing || !user) return;
    const canManage = manageAccess[editing.target_division] || isAdmin;
    const isOwner = editing.requested_by === user.id;
    if (!canManage && !isOwner) return denyAccess("You don't have access to save this work request.");
    const selectedAssignee = assignees.find((assignee) => assignee.user_id === editForm.responsible_user_id && assignee.division === editing.target_division);

    const payload = canManage
      ? {
        requesting_division: divisionMeta[editForm.requesting_division].label,
        task: editForm.task.trim(),
        details: editForm.details.trim() || null,
        submission_date: editForm.submission_date,
        status: editForm.status,
        responsible_user_id: selectedAssignee?.user_id ?? null,
        responsible_person: selectedAssignee?.display_name ?? null,
        work_link: editForm.work_link.trim() || null,
      }
      : {
        requesting_division: divisionMeta[editForm.requesting_division].label,
        task: editForm.task.trim(),
        details: editForm.details.trim() || null,
        submission_date: editForm.submission_date,
      };

    setSaving(true);
    const { data, error } = await supabase
      .from("work_requests")
      .update(payload)
      .eq("id", editing.id)
      .select("id,target_division,requesting_division,task,details,work_link,submission_date,due_date,status,responsible_person,responsible_user_id,requested_by,created_at")
      .single();
    setSaving(false);
    if (error) {
      toast({ title: "Could not update request", description: error.message, variant: "destructive" });
      return;
    }
    setRequests((current) => current.map((item) => item.id === editing.id ? data as WorkRequest : item));
    setEditOpen(false);
    toast({ title: "Work request updated" });
  };

  const updateStatus = async (request: WorkRequest, status: WorkStatus) => {
    if (!(manageAccess[request.target_division] || isAdmin)) return denyAccess("You don't have access to update this work request status.");
    const { data, error } = await supabase
      .from("work_requests")
      .update({ status })
      .eq("id", request.id)
      .select("id,target_division,requesting_division,task,details,work_link,submission_date,due_date,status,responsible_person,responsible_user_id,requested_by,created_at")
      .single();
    if (error) {
      toast({ title: "Could not update status", description: error.message, variant: "destructive" });
      return;
    }
    setRequests((current) => current.map((item) => item.id === request.id ? data as WorkRequest : item));
  };

  const deleteRequest = async (request: WorkRequest) => {
    const canManage = manageAccess[request.target_division] || isAdmin;
    const isOwner = request.requested_by === user?.id;
    if (!canManage && !isOwner) return denyAccess("You don't have access to delete this work request.");
    if (!confirm(`Delete "${request.task}"?`)) return;
    const { error } = await supabase.from("work_requests").delete().eq("id", request.id);
    if (error) {
      toast({ title: "Could not delete request", description: error.message, variant: "destructive" });
      return;
    }
    setRequests((current) => current.filter((item) => item.id !== request.id));
    toast({ title: "Work request deleted" });
  };

  const addAssignee = async (userId: string) => {
    const member = members.find((entry) => entry.user_id === userId);
    if (!member) return;
    setSavingKey("add-assignee");
    const { error } = await supabase
      .from("work_request_assignees")
      .insert({
        division: activeDivision,
        user_id: userId,
        display_name: member.display_name.trim().split(/\s+/)[0],
        display_order: Math.max(0, ...divisionAssignees.map((entry) => entry.display_order)) + 1,
      });
    setSavingKey("");
    if (error) {
      toast({ title: "Could not add person in charge", description: error.message, variant: "destructive" });
      return;
    }
    setAssigneeToAdd("");
    toast({ title: `${member.display_name} added as Person in Charge` });
    void loadRequests();
  };

  const removeAssignee = async (assignee: WorkAssignee) => {
    if (!confirm(`Remove ${assignee.display_name} from ${activeDivision} Person in Charge options?`)) return;
    setSavingKey(`remove-assignee:${assignee.id}`);
    const { error } = await supabase.from("work_request_assignees").delete().eq("id", assignee.id);
    setSavingKey("");
    if (error) {
      toast({ title: "Could not remove person in charge", description: error.message, variant: "destructive" });
      return;
    }
    setAssignees((current) => current.filter((entry) => entry.id !== assignee.id));
    toast({ title: "Person in Charge removed" });
  };

  const addComment = async () => {
    if (!editing || !user || !commentMessage.trim()) return;
    setSavingKey("comment");
    const { data, error } = await supabase
      .from("work_request_comments")
      .insert({ work_request_id: editing.id, user_id: user.id, message: commentMessage.trim() })
      .select("id,work_request_id,user_id,author_name,message,created_at")
      .single();
    setSavingKey("");
    if (error) {
      toast({ title: "Could not add comment", description: error.message, variant: "destructive" });
      return;
    }
    setComments((current) => [...current, data as WorkComment]);
    setCommentMessage("");
    toast({ title: "Comment added" });
  };

  const updateComment = async (comment: WorkComment) => {
    if (!editingCommentMessage.trim()) return;
    setSavingKey(`comment:${comment.id}`);
    const { error } = await supabase
      .from("work_request_comments")
      .update({ message: editingCommentMessage.trim() })
      .eq("id", comment.id);
    setSavingKey("");
    if (error) {
      toast({ title: "Could not update comment", description: error.message, variant: "destructive" });
      return;
    }
    setComments((current) => current.map((entry) => entry.id === comment.id ? { ...entry, message: editingCommentMessage.trim() } : entry));
    setEditingCommentId("");
    setEditingCommentMessage("");
    toast({ title: "Comment updated" });
  };

  const deleteComment = async (comment: WorkComment) => {
    if (!confirm("Delete this comment?")) return;
    setSavingKey(`comment:${comment.id}`);
    const { error } = await supabase.from("work_request_comments").delete().eq("id", comment.id);
    setSavingKey("");
    if (error) {
      toast({ title: "Could not delete comment", description: error.message, variant: "destructive" });
      return;
    }
    setComments((current) => current.filter((entry) => entry.id !== comment.id));
    toast({ title: "Comment deleted" });
  };

  const activeMeta = divisionMeta[activeDivision];
  const duePreview = addBusinessDays(form.submission_date, 5);

  return (
    <MemberShell
      title="Work Request Form"
      eyebrow="Internal Operations"
      icon={ClipboardList}
      description="Submit design, event, research, or board requests in one shared dashboard. Each request gets a five-workday target deadline automatically."
      actions={
        <>
          <Button className="rounded-full bg-[#1d1c18] text-white hover:bg-[#34322d]" onClick={() => openCreate()}>
            <Plus className="h-4 w-4" /> New Request
          </Button>
          {isPrimaryAdmin && (
            <Button variant="outline" className="rounded-full border-black/10 bg-white dark:border-white/10 dark:bg-[#1c1b18]" onClick={() => setAssignmentOpen(true)}>
              <Settings2 className="h-4 w-4" /> Manage PICs
            </Button>
          )}
        </>
      }
    >
      <SEO title="Work Requests" path="/member/work-requests" noIndex />
      <div className="grid gap-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {([
            ["Total", summary.total, ClipboardList],
            ["Active", summary.active, Hourglass],
            ["Completed", summary.completed, CheckCircle2],
            ["Overdue", summary.overdue, CalendarClock],
          ] satisfies SummaryCard[]).map(([label, value, Icon]) => (
            <div key={label} className="rounded-lg border border-black/5 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1c1b18]">
              <Icon className="mb-3 h-4 w-4 text-[#1d1c18] dark:text-white" />
              <p className="text-2xl font-semibold text-[#191916] dark:text-white">{value}</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#585956] dark:text-[#b6b3aa]">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Tabs value={activeDivision} onValueChange={(value) => setActiveDivision(value as Division)}>
            <TabsList className="grid h-auto w-full grid-cols-2 bg-white dark:bg-white/5 lg:w-auto lg:grid-cols-4">
              {divisions.map((division) => <TabsTrigger key={division} value={division}>{divisionMeta[division].label}</TabsTrigger>)}
            </TabsList>
          </Tabs>
        </div>

        <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(260px,360px)_1fr]">
          <div className="rounded-lg border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1c1b18]">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#7a7972] dark:text-[#b6b3aa]">Receiving Division</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#191916] dark:text-white">{activeMeta.label}</h2>
            <p className="mt-3 text-sm leading-6 text-[#686760] dark:text-[#b6b3aa]">{activeMeta.description}</p>
            <div className="mt-6 grid grid-cols-4 gap-2 text-center">
              {[
                ["All", currentSummary.total],
                ["Doing", currentSummary.progress],
                ["Done", currentSummary.completed],
                ["Late", currentSummary.overdue],
              ].map(([label, value]) => (
                <div key={label as string} className="rounded-md border border-black/5 bg-[#f6f7f5] px-2 py-3 dark:border-white/10 dark:bg-white/5">
                  <p className="text-lg font-semibold text-[#191916] dark:text-white">{value as number}</p>
                  <p className="text-[11px] text-[#7a7972] dark:text-[#b6b3aa]">{label as string}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 dark:border-white/10 dark:bg-[#1c1b18]">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{activeMeta.label} Requests</h2>
                <p className="text-sm text-muted-foreground">Sorted by latest submission and ready for follow-up.</p>
              </div>
              <div className="relative sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search request..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
              </div>
            </div>

            {loading ? (
              <div className="grid gap-3">
                {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-md bg-muted" />)}
              </div>
            ) : divisionRequests.length === 0 ? (
              <div className="rounded-md border border-dashed border-border py-14 text-center">
                <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground/60" />
                <p className="mt-3 font-medium text-foreground">No requests for {activeMeta.label} yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Create a new request to start the workflow.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {divisionRequests.map((request) => {
                  const canManage = manageAccess[request.target_division] || isAdmin;
                  const overdue = isOverdue(request);
                  const latestComment = latestCommentByRequest.get(request.id);
                  const commentCount = commentsByRequest.get(request.id)?.length ?? 0;
                  return (
                    <article key={request.id} className="rounded-lg border border-border bg-background p-4 transition-colors hover:border-black/20 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/25">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className={statusStyle[request.status]}>{request.status}</Badge>
                            {overdue && <Badge variant="outline" className="border-red-200 bg-red-50 text-red-800">Overdue</Badge>}
                            <span className="text-xs text-muted-foreground">{request.requesting_division} request</span>
                          </div>
                          <h3 className="text-base font-semibold text-foreground">{request.task}</h3>
                          {request.details && <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{request.details}</p>}
                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                            <span>Submitted {formatDate(request.submission_date)}</span>
                            <span>Due {formatDate(request.due_date)}</span>
                            <span>Person in Charge: {request.responsible_person || "-"}</span>
                            <span className="inline-flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {commentCount}</span>
                          </div>
                          {latestComment && (
                            <div className="mt-3 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                              <span className="font-semibold text-foreground">{latestComment.author_name}:</span> {latestComment.message}
                            </div>
                          )}
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          {request.work_link && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={request.work_link} target="_blank" rel="noopener noreferrer">
                                Work Link <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </Button>
                          )}
                          {canManage && (
                            <Select value={request.status} onValueChange={(value) => void updateStatus(request, value as WorkStatus)}>
                              <SelectTrigger className="h-9 w-[150px]"><SelectValue /></SelectTrigger>
                              <SelectContent>{statuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
                            </Select>
                          )}
                          <Button variant="outline" size="sm" onClick={() => openEdit(request)}>
                            <FilePenLine className="h-3.5 w-3.5" /> Edit
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => void deleteRequest(request)} aria-label={`Delete ${request.task}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>New Work Request</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Send to</Label>
                <Select value={form.target_division} onValueChange={(value) => setForm({ ...form, target_division: value as Division })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{divisions.map((division) => <SelectItem key={division} value={division}>{divisionMeta[division].label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Your division</Label>
                <Select value={form.requesting_division} onValueChange={(value) => setForm({ ...form, requesting_division: value as Division })}>
                  <SelectTrigger><SelectValue placeholder="Choose your division" /></SelectTrigger>
                  <SelectContent>
                    {requestingDivisionOptions.map((division) => (
                      <SelectItem key={division} value={division}>{divisionMeta[division].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Task</Label>
              <Input placeholder="Poster Open Recruitment, Smartbook Acara, Equity Research Report..." value={form.task} onChange={(event) => setForm({ ...form, task: event.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Keterangan tambahan</Label>
              <Textarea rows={4} placeholder="Format, moodboard, required output, references, or notes for the receiving division." value={form.details} onChange={(event) => setForm({ ...form, details: event.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Submission date</Label>
                <Input type="date" value={form.submission_date} onChange={(event) => setForm({ ...form, submission_date: event.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Due date preview</Label>
                <div className="flex h-10 items-center justify-between border border-border bg-muted/50 px-3 text-sm">
                  <span>{formatDate(duePreview)}</span>
                  <span className="text-xs text-muted-foreground">+5 workdays</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => void createRequest()} disabled={saving || !form.requesting_division || !form.task.trim()}>
              {saving ? "Submitting..." : "Submit Request"} <ArrowUpRight className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Work Request</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid gap-4 py-2">
              <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                Request to <span className="font-medium text-foreground">{divisionMeta[editing.target_division].label}</span>. Due date updates automatically when submission date changes.
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Your division</Label>
                  <Select value={editForm.requesting_division} onValueChange={(value) => setEditForm({ ...editForm, requesting_division: value as Division })}>
                    <SelectTrigger><SelectValue placeholder="Choose your division" /></SelectTrigger>
                    <SelectContent>
                      {requestingDivisionOptions.map((division) => (
                        <SelectItem key={division} value={division}>{divisionMeta[division].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Submission date</Label>
                  <Input type="date" value={editForm.submission_date} onChange={(event) => setEditForm({ ...editForm, submission_date: event.target.value })} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Task</Label>
                <Input value={editForm.task} onChange={(event) => setEditForm({ ...editForm, task: event.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Keterangan tambahan</Label>
                <Textarea rows={4} value={editForm.details} onChange={(event) => setEditForm({ ...editForm, details: event.target.value })} />
              </div>
              {(manageAccess[editing.target_division] || isAdmin) && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Status</Label>
                      <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value as WorkStatus })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{statuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Person in Charge</Label>
                      <Select value={editForm.responsible_user_id || "none"} onValueChange={(value) => setEditForm({ ...editForm, responsible_user_id: value === "none" ? "" : value })}>
                        <SelectTrigger><SelectValue placeholder="Choose person" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Not assigned</SelectItem>
                          {assignees.filter((assignee) => assignee.division === editing.target_division).map((assignee) => (
                            <SelectItem key={assignee.id} value={assignee.user_id}>
                              {members.find((member) => member.user_id === assignee.user_id)?.display_name ?? assignee.display_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Link pengerjaan</Label>
                    <Input type="url" placeholder="https://docs.google.com/..." value={editForm.work_link} onChange={(event) => setEditForm({ ...editForm, work_link: event.target.value })} />
                  </div>
                </>
              )}
              <div className="grid gap-3 border-t border-border pt-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[#1d1c18]" />
                  <Label>Comments</Label>
                </div>
                <div className="max-h-52 space-y-2 overflow-y-auto">
                  {(commentsByRequest.get(editing.id) ?? []).map((comment) => (
                    <div key={comment.id} className="rounded-md border border-border bg-muted/30 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-foreground">{comment.author_name}</p>
                        <div className="flex items-center gap-1">
                          <p className="mr-1 text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
                          {comment.user_id === user?.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              title="Edit comment"
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setEditingCommentMessage(comment.message);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {comment.user_id === user?.id && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" title="Delete comment" disabled={savingKey === `comment:${comment.id}`} onClick={() => void deleteComment(comment)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {editingCommentId === comment.id ? (
                        <div className="mt-2 grid gap-2">
                          <Textarea rows={2} value={editingCommentMessage} onChange={(event) => setEditingCommentMessage(event.target.value)} />
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingCommentId(""); setEditingCommentMessage(""); }}>Cancel</Button>
                            <Button size="sm" disabled={!editingCommentMessage.trim() || savingKey === `comment:${comment.id}`} onClick={() => void updateComment(comment)}>Save comment</Button>
                          </div>
                        </div>
                      ) : <p className="mt-1 text-sm text-muted-foreground">{comment.message}</p>}
                    </div>
                  ))}
                  {(commentsByRequest.get(editing.id) ?? []).length === 0 && (
                    <p className="rounded-md border border-dashed border-border py-6 text-center text-sm text-muted-foreground">No comments yet.</p>
                  )}
                </div>
                <div className="flex items-end gap-2">
                  <div className="grid flex-1 gap-2">
                    <Label htmlFor="work-request-comment">Add comment</Label>
                    <Textarea id="work-request-comment" rows={2} placeholder="Write an update, question, or revision note..." value={commentMessage} onChange={(event) => setCommentMessage(event.target.value)} />
                  </div>
                  <Button variant="outline" disabled={!commentMessage.trim() || savingKey === "comment"} onClick={() => void addComment()}>
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={() => void saveEdit()} disabled={saving || !editForm.requesting_division || !editForm.task.trim()}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assignmentOpen} onOpenChange={setAssignmentOpen}>
        <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto">
          <DialogHeader><DialogTitle>{activeDivision} Person in Charge</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Add members who can be assigned as Person in Charge for {divisionMeta[activeDivision].label} requests. The dashboard displays their first name.
          </p>
          <div className="flex items-end gap-2 rounded-md border border-dashed border-border bg-muted/20 p-3">
            <div className="grid flex-1 gap-2">
              <Label>Add Person in Charge</Label>
              <Select value={assigneeToAdd} onValueChange={setAssigneeToAdd}>
                <SelectTrigger><SelectValue placeholder="Choose member by name or email" /></SelectTrigger>
                <SelectContent>
                  {members.filter((member) => !divisionAssignees.some((assignee) => assignee.user_id === member.user_id)).map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {member.display_name}{member.email ? ` (${member.email})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button disabled={!assigneeToAdd || savingKey === "add-assignee"} onClick={() => void addAssignee(assigneeToAdd)}>
              <UserPlus className="h-4 w-4" /> Add
            </Button>
          </div>
          <div className="grid gap-2 py-2">
            {divisionAssignees.map((assignee) => (
              <div key={assignee.id} className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
                <div>
                  <p className="font-medium text-foreground">{members.find((member) => member.user_id === assignee.user_id)?.display_name ?? assignee.display_name}</p>
                  <p className="text-xs text-muted-foreground">{members.find((member) => member.user_id === assignee.user_id)?.email ?? "No email"}</p>
                </div>
                <Button variant="ghost" size="icon" title="Remove Person in Charge" disabled={savingKey === `remove-assignee:${assignee.id}`} onClick={() => void removeAssignee(assignee)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {divisionAssignees.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No Person in Charge options added yet.</p>}
          </div>
          <DialogFooter><Button onClick={() => setAssignmentOpen(false)}>Done</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </MemberShell>
  );
};

export default WorkRequests;
