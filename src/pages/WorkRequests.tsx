import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, CalendarClock, CheckCircle2, ClipboardList, ExternalLink, FilePenLine, Hourglass, Plus, Search, Sparkles, Trash2, type LucideIcon } from "lucide-react";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

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
  requested_by: string;
  created_at: string;
}

const divisions: Division[] = ["BPH", "CMP", "EVENT", "RESEARCH"];
const statuses: WorkStatus[] = ["Submitted", "On Progress", "Upscreening", "Needs Revision", "Completed", "Cancelled"];
type SummaryCard = [string, number, LucideIcon];

const divisionMeta: Record<Division, { label: string; description: string; accent: string }> = {
  BPH: { label: "BPH", description: "Internal board, planning, and organization support.", accent: "from-sky-500 to-blue-700" },
  CMP: { label: "CMP", description: "Creative, media, publication, and design requests.", accent: "from-fuchsia-500 to-rose-600" },
  EVENT: { label: "Event", description: "Program, rundown, logistics, and event operations.", accent: "from-amber-400 to-orange-600" },
  RESEARCH: { label: "Research", description: "Market work, reports, investment notes, and analysis.", accent: "from-emerald-400 to-teal-700" },
};

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
  requesting_division: "",
  task: "",
  details: "",
  submission_date: new Date().toISOString().slice(0, 10),
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
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<WorkRequest[]>([]);
  const [manageAccess, setManageAccess] = useState<Record<Division, boolean>>({ BPH: false, CMP: false, EVENT: false, RESEARCH: false });
  const [activeDivision, setActiveDivision] = useState<Division>("CMP");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(blankForm);
  const [editing, setEditing] = useState<WorkRequest | null>(null);
  const [editForm, setEditForm] = useState({
    requesting_division: "",
    task: "",
    details: "",
    submission_date: "",
    status: "Submitted" as WorkStatus,
    responsible_person: "",
    work_link: "",
  });

  const loadRequests = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("work_requests")
      .select("id,target_division,requesting_division,task,details,work_link,submission_date,due_date,status,responsible_person,requested_by,created_at")
      .order("created_at", { ascending: false });

    setLoading(false);
    if (error) {
      toast({ title: "Could not load work requests", description: error.message, variant: "destructive" });
      return;
    }
    setRequests((data ?? []) as WorkRequest[]);
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

  const openCreate = (division = activeDivision) => {
    setForm({ ...blankForm, target_division: division });
    setDialogOpen(true);
  };

  const createRequest = async () => {
    if (!user || !form.requesting_division.trim() || !form.task.trim()) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("work_requests")
      .insert({
        target_division: form.target_division,
        requesting_division: form.requesting_division.trim(),
        task: form.task.trim(),
        details: form.details.trim() || null,
        submission_date: form.submission_date,
        requested_by: user.id,
      })
      .select("id,target_division,requesting_division,task,details,work_link,submission_date,due_date,status,responsible_person,requested_by,created_at")
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
    setEditing(request);
    setEditForm({
      requesting_division: request.requesting_division,
      task: request.task,
      details: request.details ?? "",
      submission_date: request.submission_date,
      status: request.status,
      responsible_person: request.responsible_person ?? "",
      work_link: request.work_link ?? "",
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editing || !user) return;
    const canManage = manageAccess[editing.target_division] || isAdmin;
    const isOwner = editing.requested_by === user.id;
    if (!canManage && !isOwner) return;

    const payload = canManage
      ? {
        requesting_division: editForm.requesting_division.trim(),
        task: editForm.task.trim(),
        details: editForm.details.trim() || null,
        submission_date: editForm.submission_date,
        status: editForm.status,
        responsible_person: editForm.responsible_person.trim() || null,
        work_link: editForm.work_link.trim() || null,
      }
      : {
        requesting_division: editForm.requesting_division.trim(),
        task: editForm.task.trim(),
        details: editForm.details.trim() || null,
        submission_date: editForm.submission_date,
      };

    setSaving(true);
    const { data, error } = await supabase
      .from("work_requests")
      .update(payload)
      .eq("id", editing.id)
      .select("id,target_division,requesting_division,task,details,work_link,submission_date,due_date,status,responsible_person,requested_by,created_at")
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
    const { data, error } = await supabase
      .from("work_requests")
      .update({ status })
      .eq("id", request.id)
      .select("id,target_division,requesting_division,task,details,work_link,submission_date,due_date,status,responsible_person,requested_by,created_at")
      .single();
    if (error) {
      toast({ title: "Could not update status", description: error.message, variant: "destructive" });
      return;
    }
    setRequests((current) => current.map((item) => item.id === request.id ? data as WorkRequest : item));
  };

  const deleteRequest = async (request: WorkRequest) => {
    if (!confirm(`Delete "${request.task}"?`)) return;
    const { error } = await supabase.from("work_requests").delete().eq("id", request.id);
    if (error) {
      toast({ title: "Could not delete request", description: error.message, variant: "destructive" });
      return;
    }
    setRequests((current) => current.filter((item) => item.id !== request.id));
    toast({ title: "Work request deleted" });
  };

  const activeMeta = divisionMeta[activeDivision];
  const duePreview = addBusinessDays(form.submission_date, 5);

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-background">
      <SEO title="Work Requests" path="/member/work-requests" noIndex />
      <div className="border-b border-border bg-[linear-gradient(135deg,hsl(var(--primary))_0%,#1f4778_58%,#168ac5_100%)] text-primary-foreground">
        <div className="container py-8">
          <Link to="/member" className="mb-5 inline-flex items-center gap-2 text-sm text-primary-foreground/75 hover:text-primary-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
          <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
                <Sparkles className="h-3.5 w-3.5" /> Internal Operations
              </div>
              <h1 className="max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">Work Request Form</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-primary-foreground/80 md:text-base">
                Submit design, event, research, or board requests in one shared dashboard. Each request gets a five-workday target deadline automatically.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([
                ["Total", summary.total, ClipboardList],
                ["Active", summary.active, Hourglass],
                ["Completed", summary.completed, CheckCircle2],
                ["Overdue", summary.overdue, CalendarClock],
              ] satisfies SummaryCard[]).map(([label, value, Icon]) => (
                <div key={label} className="border border-primary-foreground/15 bg-primary-foreground/10 p-4">
                  <Icon className="mb-3 h-4 w-4 text-primary-foreground/70" />
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-primary-foreground/70">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <Tabs value={activeDivision} onValueChange={(value) => setActiveDivision(value as Division)}>
            <TabsList className="grid h-auto w-full grid-cols-2 lg:w-auto lg:grid-cols-4">
              {divisions.map((division) => <TabsTrigger key={division} value={division}>{divisionMeta[division].label}</TabsTrigger>)}
            </TabsList>
          </Tabs>
          <Button onClick={() => openCreate()}>
            <Plus className="h-4 w-4" /> New Request
          </Button>
        </div>

        <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(260px,360px)_1fr]">
          <div className={`bg-gradient-to-br ${activeMeta.accent} p-6 text-white`}>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Receiving Division</p>
            <h2 className="mt-3 text-3xl font-bold">{activeMeta.label}</h2>
            <p className="mt-3 text-sm leading-6 text-white/80">{activeMeta.description}</p>
            <div className="mt-6 grid grid-cols-4 gap-2 text-center">
              {[
                ["All", currentSummary.total],
                ["Doing", currentSummary.progress],
                ["Done", currentSummary.completed],
                ["Late", currentSummary.overdue],
              ].map(([label, value]) => (
                <div key={label as string} className="bg-white/15 px-2 py-3">
                  <p className="text-lg font-bold">{value as number}</p>
                  <p className="text-[11px] text-white/70">{label as string}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
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
                  const canEdit = canManage || request.requested_by === user?.id;
                  const overdue = isOverdue(request);
                  return (
                    <article key={request.id} className="rounded-lg border border-border bg-background p-4 transition-colors hover:border-accent/50">
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
                            <span>PIC: {request.responsible_person || "-"}</span>
                          </div>
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
                          {canEdit && (
                            <Button variant="outline" size="sm" onClick={() => openEdit(request)}>
                              <FilePenLine className="h-3.5 w-3.5" /> Edit
                            </Button>
                          )}
                          {canEdit && (
                            <Button variant="outline" size="icon" onClick={() => void deleteRequest(request)} aria-label={`Delete ${request.task}`}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
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
                <Input placeholder="Research, BPH, Event..." value={form.requesting_division} onChange={(event) => setForm({ ...form, requesting_division: event.target.value })} />
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
            <Button onClick={() => void createRequest()} disabled={saving || !form.requesting_division.trim() || !form.task.trim()}>
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
                  <Input value={editForm.requesting_division} onChange={(event) => setEditForm({ ...editForm, requesting_division: event.target.value })} />
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
                      <Label>Penanggung jawab</Label>
                      <Input placeholder="Name" value={editForm.responsible_person} onChange={(event) => setEditForm({ ...editForm, responsible_person: event.target.value })} />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Link pengerjaan</Label>
                    <Input type="url" placeholder="https://docs.google.com/..." value={editForm.work_link} onChange={(event) => setEditForm({ ...editForm, work_link: event.target.value })} />
                  </div>
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={() => void saveEdit()} disabled={saving || !editForm.requesting_division.trim() || !editForm.task.trim()}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default WorkRequests;
