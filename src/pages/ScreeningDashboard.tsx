import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowDownUp, CheckCircle2, Clock3, ExternalLink, FileCheck2, Loader2, MessageSquare, Pencil, Plus, Settings2, ShieldCheck, Trash2, UserPlus, X, type LucideIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import MemberShell from "@/components/dashboard/MemberShell";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type Division = "BPH" | "CMP" | "EVENT" | "RESEARCH";
type ScreeningStatus = "SCREENING BY INVESTMENT CLUB" | "MINOR REVISION" | "APPROVED BY INVESTMENT CLUB";

interface ScreeningItem {
  id: string;
  division: Division;
  sequence_no: number;
  material: string;
  submitted_at: string | null;
  due_at: string | null;
  link: string | null;
  status: ScreeningStatus;
  notes: string | null;
}

interface Evaluator {
  id: string;
  division: Division;
  display_name: string;
  display_order: number;
  user_id: string | null;
}

interface ScreeningCheck {
  screening_item_id: string;
  evaluator_id: string;
  checked: boolean;
}

interface ScreeningNote {
  id: string;
  screening_item_id: string;
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
const statuses: ScreeningStatus[] = ["SCREENING BY INVESTMENT CLUB", "MINOR REVISION", "APPROVED BY INVESTMENT CLUB"];
const blankForm = { material: "", submitted_at: "", due_at: "", link: "" };
type SummaryCard = [string, number, string, LucideIcon];

const divisionMeta: Record<Division, { label: string; description: string; accent: string }> = {
  BPH: { label: "BPH", description: "Board-level screening and internal organization review.", accent: "from-sky-500 to-blue-700" },
  CMP: { label: "CMP", description: "Creative, media, publication, and content readiness checks.", accent: "from-fuchsia-500 to-rose-600" },
  EVENT: { label: "Event", description: "Program, logistics, and event execution review flow.", accent: "from-amber-400 to-orange-600" },
  RESEARCH: { label: "Research", description: "Market report, equity research, and analytical output review.", accent: "from-emerald-400 to-teal-700" },
};

const statusStyle: Record<ScreeningStatus, string> = {
  "SCREENING BY INVESTMENT CLUB": "border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-100",
  "MINOR REVISION": "border-orange-300 bg-orange-100 text-orange-900 hover:bg-orange-100",
  "APPROVED BY INVESTMENT CLUB": "border-emerald-300 bg-emerald-100 text-emerald-900 hover:bg-emerald-100",
};

const formatDate = (value: string | null) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .format(new Date(`${value}T00:00:00`));
};

const ScreeningDashboard = () => {
  const { user, isPrimaryAdmin } = useAuth();
  const { toast } = useToast();
  const [division, setDivision] = useState<Division>("CMP");
  const [items, setItems] = useState<ScreeningItem[]>([]);
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [checks, setChecks] = useState<ScreeningCheck[]>([]);
  const [notes, setNotes] = useState<ScreeningNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [createAccess, setCreateAccess] = useState<Record<Division, boolean>>({ BPH: false, CMP: false, EVENT: false, RESEARCH: false });
  const [manageAccess, setManageAccess] = useState<Record<Division, boolean>>({ BPH: false, CMP: false, EVENT: false, RESEARCH: false });
  const [editingItem, setEditingItem] = useState<ScreeningItem | null>(null);
  const [form, setForm] = useState(blankForm);
  const [noteMessage, setNoteMessage] = useState("");
  const [editingNoteId, setEditingNoteId] = useState("");
  const [editingNoteMessage, setEditingNoteMessage] = useState("");
  const [evaluatorToAdd, setEvaluatorToAdd] = useState("");
  const [newestFirst, setNewestFirst] = useState(true);

  const loadScreening = useCallback(async () => {
    setLoading(true);
    const [itemsResult, evaluatorsResult, checksResult, notesResult] = await Promise.all([
      supabase.from("screening_items").select("id,division,sequence_no,material,submitted_at,due_at,link,status,notes").order("sequence_no", { ascending: false }),
      supabase.from("screening_evaluators").select("id,division,display_name,display_order,user_id").order("display_order"),
      supabase.from("screening_checks").select("screening_item_id,evaluator_id,checked"),
      supabase.from("screening_notes").select("id,screening_item_id,user_id,author_name,message,created_at").order("created_at"),
    ]);
    const error = itemsResult.error ?? evaluatorsResult.error ?? checksResult.error ?? notesResult.error;
    if (error) {
      toast({ title: "Could not load screening dashboard", description: error.message, variant: "destructive" });
    } else {
      setItems((itemsResult.data ?? []) as ScreeningItem[]);
      setEvaluators((evaluatorsResult.data ?? []) as Evaluator[]);
      setChecks((checksResult.data ?? []) as ScreeningCheck[]);
      setNotes((notesResult.data ?? []) as ScreeningNote[]);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    void loadScreening();
  }, [loadScreening]);

  useEffect(() => {
    if (!user) return;
    void Promise.all(divisions.map(async (item) => {
      const [createResult, manageResult] = await Promise.all([
        supabase.rpc("can_create_screening_item", { _user_id: user.id, _division: item }),
        supabase.rpc("can_manage_screening_item", { _user_id: user.id, _division: item }),
      ]);
      return { item, canCreate: createResult.data ?? false, canManage: manageResult.data ?? false };
    })).then((access) => {
      setCreateAccess(Object.fromEntries(access.map((entry) => [entry.item, entry.canCreate])) as Record<Division, boolean>);
      setManageAccess(Object.fromEntries(access.map((entry) => [entry.item, entry.canManage])) as Record<Division, boolean>);
    });
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

  const divisionItems = useMemo(
    () => items
      .filter((item) => item.division === division)
      .sort((a, b) => newestFirst ? b.sequence_no - a.sequence_no : a.sequence_no - b.sequence_no),
    [division, items, newestFirst],
  );
  const divisionEvaluators = useMemo(
    () => evaluators.filter((evaluator) => evaluator.division === division),
    [division, evaluators],
  );
  const visibleEvaluators = useMemo(
    () => divisionEvaluators.filter((evaluator) => evaluator.user_id),
    [divisionEvaluators],
  );
  const checkMap = useMemo(
    () => new Map(checks.map((check) => [`${check.screening_item_id}:${check.evaluator_id}`, check.checked])),
    [checks],
  );
  const assignedColumns = divisionEvaluators.filter((evaluator) => evaluator.user_id === user?.id);
  const canCreateCurrent = createAccess[division];
  const canManageCurrent = manageAccess[division];
  const latestNoteByItem = useMemo(() => {
    const latest = new Map<string, ScreeningNote>();
    for (const note of notes) latest.set(note.screening_item_id, note);
    return latest;
  }, [notes]);

  const summary = useMemo(() => ({
    total: divisionItems.length,
    screening: divisionItems.filter((item) => item.status === "SCREENING BY INVESTMENT CLUB").length,
    revision: divisionItems.filter((item) => item.status === "MINOR REVISION").length,
    approved: divisionItems.filter((item) => item.status === "APPROVED BY INVESTMENT CLUB").length,
    overdue: divisionItems.filter((item) => item.due_at && item.status !== "APPROVED BY INVESTMENT CLUB" && item.due_at < new Date().toISOString().slice(0, 10)).length,
  }), [divisionItems]);

  const updateStatus = async (item: ScreeningItem, status: ScreeningStatus) => {
    setSavingKey(`status:${item.id}`);
    const { error } = await supabase.from("screening_items").update({ status }).eq("id", item.id);
    setSavingKey("");
    if (error) {
      toast({ title: "Could not update status", description: error.message, variant: "destructive" });
      return;
    }
    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status } : entry));
  };

  const toggleCheck = async (item: ScreeningItem, evaluator: Evaluator, checked: boolean) => {
    const key = `${item.id}:${evaluator.id}`;
    setSavingKey(key);
    const { error } = await supabase.from("screening_checks").upsert({
      screening_item_id: item.id,
      evaluator_id: evaluator.id,
      checked,
      checked_at: checked ? new Date().toISOString() : null,
    });
    setSavingKey("");
    if (error) {
      toast({ title: "Could not update checklist", description: error.message, variant: "destructive" });
      return;
    }
    setChecks((current) => [
      ...current.filter((entry) => !(entry.screening_item_id === item.id && entry.evaluator_id === evaluator.id)),
      { screening_item_id: item.id, evaluator_id: evaluator.id, checked },
    ]);
  };

  const addEvaluator = async (userId: string) => {
    const member = members.find((entry) => entry.user_id === userId);
    if (!member) return;
    const key = "add-evaluator";
    setSavingKey(key);
    const { error } = await supabase
      .from("screening_evaluators")
      .insert({
        division,
        user_id: userId,
        display_name: member.display_name.trim().split(/\s+/)[0],
        display_order: Math.max(0, ...divisionEvaluators.map((entry) => entry.display_order)) + 1,
      });
    setSavingKey("");
    if (error) {
      toast({ title: "Could not add evaluator", description: error.message, variant: "destructive" });
      return;
    }
    setEvaluatorToAdd("");
    toast({ title: `${member.display_name} added as evaluator` });
    void loadScreening();
  };

  const removeEvaluator = async (evaluator: Evaluator) => {
    if (!confirm(`Remove ${evaluator.display_name} from ${division} evaluators?`)) return;
    setSavingKey(`remove:${evaluator.id}`);
    const { error } = await supabase.from("screening_evaluators").delete().eq("id", evaluator.id);
    setSavingKey("");
    if (error) {
      toast({ title: "Could not remove evaluator", description: error.message, variant: "destructive" });
      return;
    }
    setEvaluators((current) => current.filter((entry) => entry.id !== evaluator.id));
    toast({ title: "Evaluator removed" });
  };

  const openCreate = () => {
    setEditingItem(null);
    setForm(blankForm);
    setDialogOpen(true);
  };

  const openEdit = (item: ScreeningItem) => {
    setEditingItem(item);
    setForm({
      material: item.material,
      submitted_at: item.submitted_at ?? "",
      due_at: item.due_at ?? "",
      link: item.link ?? "",
    });
    setNoteMessage("");
    setDialogOpen(true);
  };

  const updateSubmittedDate = (submittedAt: string) => {
    if (!submittedAt) {
      setForm({ ...form, submitted_at: "", due_at: "" });
      return;
    }
    const dueDate = new Date(`${submittedAt}T00:00:00`);
    dueDate.setDate(dueDate.getDate() + 3);
    setForm({ ...form, submitted_at: submittedAt, due_at: dueDate.toISOString().slice(0, 10) });
  };

  const saveItem = async () => {
    if (!form.material.trim() || !user) return;
    setSavingKey("item");
    const payload = {
      material: form.material.trim(),
      submitted_at: form.submitted_at || null,
      due_at: form.due_at || null,
      link: form.link.trim() || null,
    };
    const result = editingItem
      ? await supabase.from("screening_items").update(payload).eq("id", editingItem.id)
      : await supabase.from("screening_items").insert({
          ...payload,
          division,
          sequence_no: Math.max(0, ...divisionItems.map((item) => item.sequence_no)) + 1,
          created_by: user.id,
        });
    setSavingKey("");
    if (result.error) {
      toast({ title: "Could not save screening item", description: result.error.message, variant: "destructive" });
      return;
    }
    setDialogOpen(false);
    toast({ title: editingItem ? "Screening item updated" : "Screening item added" });
    void loadScreening();
  };

  const addNote = async () => {
    if (!editingItem || !user || !noteMessage.trim()) return;
    setSavingKey("note");
    const { data, error } = await supabase
      .from("screening_notes")
      .insert({ screening_item_id: editingItem.id, user_id: user.id, message: noteMessage.trim() })
      .select("id,screening_item_id,user_id,author_name,message,created_at")
      .single();
    setSavingKey("");
    if (error) {
      toast({ title: "Could not add note", description: error.message, variant: "destructive" });
      return;
    }
    setNotes((current) => [...current, data as ScreeningNote]);
    setNoteMessage("");
    toast({ title: "Note added" });
  };

  const updateNote = async (note: ScreeningNote) => {
    if (!editingNoteMessage.trim()) return;
    setSavingKey(`note:${note.id}`);
    const { error } = await supabase
      .from("screening_notes")
      .update({ message: editingNoteMessage.trim() })
      .eq("id", note.id);
    setSavingKey("");
    if (error) {
      toast({ title: "Could not update note", description: error.message, variant: "destructive" });
      return;
    }
    setNotes((current) => current.map((entry) => entry.id === note.id ? { ...entry, message: editingNoteMessage.trim() } : entry));
    setEditingNoteId("");
    setEditingNoteMessage("");
    toast({ title: "Note updated" });
  };

  const deleteNote = async (note: ScreeningNote) => {
    if (!confirm("Delete this note?")) return;
    setSavingKey(`note:${note.id}`);
    const { error } = await supabase.from("screening_notes").delete().eq("id", note.id);
    setSavingKey("");
    if (error) {
      toast({ title: "Could not delete note", description: error.message, variant: "destructive" });
      return;
    }
    setNotes((current) => current.filter((entry) => entry.id !== note.id));
    toast({ title: "Note deleted" });
  };

  const deleteItem = async (item: ScreeningItem) => {
    if (!confirm(`Delete "${item.material}"?`)) return;
    const { error } = await supabase.from("screening_items").delete().eq("id", item.id);
    if (error) {
      toast({ title: "Could not delete screening item", description: error.message, variant: "destructive" });
      return;
    }
    setItems((current) => current.filter((entry) => entry.id !== item.id));
  };

  return (
    <MemberShell
      title="Screening Dashboard"
      eyebrow="Screening Flow"
      icon={FileCheck2}
      description="Track material review, evaluator checklist progress, notes, and approval status across divisions."
      actions={
        <>
          {isPrimaryAdmin && <Button variant="outline" className="rounded-full border-black/10 bg-white" onClick={() => setAssignmentOpen(true)}><Settings2 className="h-4 w-4" /> Manage Evaluators</Button>}
          {canCreateCurrent && <Button className="rounded-full bg-[#1d1c18] text-white hover:bg-[#34322d]" onClick={openCreate}><Plus className="h-4 w-4" /> Add Screening</Button>}
        </>
      }
    >
      <div className="grid gap-5">
        <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(260px,360px)_1fr]">
          <div className={`bg-gradient-to-br ${divisionMeta[division].accent} p-6 text-white`}>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Active Division</p>
            <h2 className="mt-3 text-3xl font-bold">{divisionMeta[division].label}</h2>
            <p className="mt-3 text-sm leading-6 text-white/80">{divisionMeta[division].description}</p>
            <p className="mt-6 text-xs text-white/70">
              Your checklist column: <span className="font-semibold text-white">{assignedColumns.map((evaluator) => evaluator.display_name).join(", ") || "Not assigned"}</span>
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <Tabs value={division} onValueChange={(value) => setDivision(value as Division)}>
                <TabsList className="grid h-auto w-full grid-cols-2 bg-white lg:w-auto lg:grid-cols-4">
                  {divisions.map((item) => <TabsTrigger key={item} value={item}>{item}</TabsTrigger>)}
                </TabsList>
              </Tabs>
              <Button variant="outline" size="sm" onClick={() => setNewestFirst((current) => !current)}>
                <ArrowDownUp className="h-4 w-4" />
                {newestFirst ? "Newest first" : "Oldest first"}
              </Button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {([
                ["Total", summary.total, "border-sky-200 bg-sky-50 text-sky-900", FileCheck2],
                ["Screening", summary.screening, "border-amber-200 bg-amber-50 text-amber-900", Clock3],
                ["Revision", summary.revision, "border-orange-200 bg-orange-50 text-orange-900", MessageSquare],
                ["Approved", summary.approved, "border-emerald-200 bg-emerald-50 text-emerald-900", ShieldCheck],
                ["Overdue", summary.overdue, "border-rose-200 bg-rose-50 text-rose-900", AlertTriangle],
              ] satisfies SummaryCard[]).map(([label, value, style, Icon]) => (
                <div key={label} className={`rounded-md border px-4 py-3 ${style}`}>
                  <Icon className="mb-2 h-4 w-4 opacity-75" />
                  <p className="text-xs font-semibold uppercase opacity-70">{label}</p>
                  <p className="mt-1 text-2xl font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          {loading ? (
            <div className="flex min-h-52 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading screening data...
            </div>
          ) : (
            <table className="w-full min-w-[1180px] text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50 text-left">
                  <th className="sticky left-0 z-20 w-14 bg-slate-50 px-3 py-3 text-center font-medium text-muted-foreground">No.</th>
                  <th className="sticky left-14 z-20 min-w-64 bg-slate-50 px-4 py-3 font-medium text-muted-foreground">Screening Material</th>
                  <th className="min-w-32 px-3 py-3 font-medium text-muted-foreground">Submitted</th>
                  <th className="min-w-32 px-3 py-3 font-medium text-muted-foreground">Due Date</th>
                  <th className="min-w-20 px-3 py-3 font-medium text-muted-foreground">Link</th>
                  <th className="min-w-52 px-3 py-3 font-medium text-muted-foreground">Status</th>
                  {visibleEvaluators.map((evaluator) => (
                    <th key={evaluator.id} className="min-w-24 px-3 py-3 text-center font-medium text-muted-foreground">
                      {evaluator.display_name}
                    </th>
                  ))}
                  <th className="min-w-72 px-4 py-3 font-medium text-muted-foreground">Notes</th>
                  {canManageCurrent && <th className="w-24 px-3 py-3 text-right font-medium text-muted-foreground">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {divisionItems.map((item) => (
                  <tr key={item.id} className="border-b border-border transition-colors last:border-0 hover:bg-[#f1f1ef]">
                    <td className="sticky left-0 z-10 bg-card px-3 py-4 text-center text-muted-foreground">{item.sequence_no}</td>
                    <td className="sticky left-14 z-10 bg-card px-4 py-4 font-semibold text-foreground">{item.material}</td>
                    <td className="px-3 py-4 text-muted-foreground">{formatDate(item.submitted_at)}</td>
                    <td className="px-3 py-4 text-muted-foreground">{formatDate(item.due_at)}</td>
                    <td className="px-3 py-4">
                      {item.link ? (
                        <Button variant="ghost" size="icon" asChild title="Open link">
                          <a href={item.link} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a>
                        </Button>
                      ) : "-"}
                    </td>
                    <td className="px-3 py-4">
                      {canManageCurrent ? (
                        <Select value={item.status} disabled={savingKey === `status:${item.id}`} onValueChange={(value) => void updateStatus(item, value as ScreeningStatus)}>
                          <SelectTrigger className={`h-9 font-medium ${statusStyle[item.status]}`}><SelectValue /></SelectTrigger>
                          <SelectContent>{statuses.map((status) => <SelectItem key={status} value={status}><span className={`rounded px-2 py-1 text-xs font-medium ${statusStyle[status]}`}>{status}</span></SelectItem>)}</SelectContent>
                        </Select>
                      ) : <Badge variant="outline" className={statusStyle[item.status]}>{item.status}</Badge>}
                    </td>
                    {visibleEvaluators.map((evaluator) => {
                      const key = `${item.id}:${evaluator.id}`;
                      const ownsColumn = evaluator.user_id === user?.id;
                      return (
                        <td key={evaluator.id} className="px-3 py-4 text-center">
                          <Checkbox
                            aria-label={`${evaluator.display_name} checklist for ${item.material}`}
                            checked={checkMap.get(key) ?? false}
                            disabled={!ownsColumn || savingKey === key}
                            onCheckedChange={(checked) => void toggleCheck(item, evaluator, checked === true)}
                          />
                        </td>
                      );
                    })}
                    <td className="max-w-80 px-4 py-4 text-xs leading-relaxed text-muted-foreground">
                      {latestNoteByItem.get(item.id)
                        ? <><span className="font-semibold text-foreground">{latestNoteByItem.get(item.id)?.author_name}:</span> {latestNoteByItem.get(item.id)?.message}</>
                        : item.notes || "-"}
                    </td>
                    {canManageCurrent && (
                      <td className="px-3 py-4">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" title="Edit item" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" title="Delete item" onClick={() => void deleteItem(item)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && divisionItems.length === 0 && (
            <div className="flex min-h-52 flex-col items-center justify-center text-center">
              <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium text-foreground">No {division} screening items yet</p>
              <p className="mt-1 text-xs text-muted-foreground">New screening materials will appear here.</p>
            </div>
          )}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Only explicitly assigned checklist columns can be changed.</p>
        {!canCreateCurrent && (
          <p className="mt-1 text-xs text-muted-foreground">Adding screening items is available to members of this division and the President/Vice President.</p>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editingItem ? "Edit Screening" : `Add ${division} Screening`}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label htmlFor="screening-material">Screening Material</Label><Input id="screening-material" value={form.material} onChange={(event) => setForm({ ...form, material: event.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2"><Label htmlFor="submitted-at">Submitted Date</Label><Input id="submitted-at" type="date" value={form.submitted_at} onChange={(event) => updateSubmittedDate(event.target.value)} /></div>
              <div className="grid gap-2"><Label htmlFor="due-at">Due Date</Label><Input id="due-at" type="date" value={form.due_at} onChange={(event) => setForm({ ...form, due_at: event.target.value })} /></div>
            </div>
            <div className="grid gap-2"><Label htmlFor="screening-link">Document Link</Label><Input id="screening-link" type="url" placeholder="https://..." value={form.link} onChange={(event) => setForm({ ...form, link: event.target.value })} /></div>
            {editingItem && (
              <div className="grid gap-3 border-t border-border pt-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[#1d1c18]" />
                  <Label>Notes</Label>
                </div>
                {editingItem.notes && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    <p className="text-xs font-semibold uppercase opacity-70">Imported note</p>
                    <p className="mt-1">{editingItem.notes}</p>
                  </div>
                )}
                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {notes.filter((note) => note.screening_item_id === editingItem.id).map((note) => (
                    <div key={note.id} className="rounded-md border border-border bg-muted/30 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-foreground">{note.author_name}</p>
                        <div className="flex items-center gap-1">
                          <p className="mr-1 text-xs text-muted-foreground">{new Date(note.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
                          {note.user_id === user?.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              title="Edit note"
                              onClick={() => {
                                setEditingNoteId(note.id);
                                setEditingNoteMessage(note.message);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {note.user_id === user?.id && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" title="Delete note" disabled={savingKey === `note:${note.id}`} onClick={() => void deleteNote(note)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {editingNoteId === note.id ? (
                        <div className="mt-2 grid gap-2">
                          <Textarea rows={2} value={editingNoteMessage} onChange={(event) => setEditingNoteMessage(event.target.value)} />
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingNoteId(""); setEditingNoteMessage(""); }}>Cancel</Button>
                            <Button size="sm" disabled={!editingNoteMessage.trim() || savingKey === `note:${note.id}`} onClick={() => void updateNote(note)}>Save note</Button>
                          </div>
                        </div>
                      ) : <p className="mt-1 text-sm text-muted-foreground">{note.message}</p>}
                    </div>
                  ))}
                </div>
                <div className="flex items-end gap-2">
                  <div className="grid flex-1 gap-2">
                    <Label htmlFor="new-note">Add note</Label>
                    <Textarea id="new-note" rows={2} placeholder="Write your feedback..." value={noteMessage} onChange={(event) => setNoteMessage(event.target.value)} />
                  </div>
                  <Button variant="outline" disabled={!noteMessage.trim() || savingKey === "note"} onClick={() => void addNote()}>
                    {savingKey === "note" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Add
                  </Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button disabled={!form.material.trim() || savingKey === "item"} onClick={() => void saveItem()}>{savingKey === "item" && <Loader2 className="h-4 w-4 animate-spin" />} Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assignmentOpen} onOpenChange={setAssignmentOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle>{division} Evaluators</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Add members who can review, add notes, and manage screening items for this division. Dashboard columns use their first name.
          </p>
          <div className="flex items-end gap-2 rounded-md border border-dashed border-border bg-muted/20 p-3">
            <div className="grid flex-1 gap-2">
              <Label>Add evaluator</Label>
              <Select value={evaluatorToAdd} onValueChange={setEvaluatorToAdd}>
                <SelectTrigger><SelectValue placeholder="Choose member by name or email" /></SelectTrigger>
                <SelectContent>
                  {members.filter((member) => !divisionEvaluators.some((evaluator) => evaluator.user_id === member.user_id)).map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {member.display_name}{member.email ? ` (${member.email})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button disabled={!evaluatorToAdd || savingKey === "add-evaluator"} onClick={() => void addEvaluator(evaluatorToAdd)}>
              <UserPlus className="h-4 w-4" /> Add
            </Button>
          </div>
          <div className="grid max-h-[45vh] gap-2 overflow-y-auto py-2">
            {divisionEvaluators.map((evaluator) => (
              <div key={evaluator.id} className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
                <div>
                  <p className="font-medium text-foreground">{members.find((member) => member.user_id === evaluator.user_id)?.display_name ?? evaluator.display_name}</p>
                  <p className="text-xs text-muted-foreground">{members.find((member) => member.user_id === evaluator.user_id)?.email ?? "No email"}</p>
                </div>
                <Button variant="ghost" size="icon" title="Remove evaluator" disabled={savingKey === `remove:${evaluator.id}`} onClick={() => void removeEvaluator(evaluator)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {divisionEvaluators.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No evaluators added yet.</p>}
          </div>
          <DialogFooter><Button onClick={() => setAssignmentOpen(false)}>Done</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </MemberShell>
  );
};

export default ScreeningDashboard;
