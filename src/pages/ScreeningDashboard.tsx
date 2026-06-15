import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ExternalLink, FileCheck2, Loader2, Pencil, Plus, Settings2, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type Division = "BPH" | "CMP" | "EVENT" | "RESEARCH";
type ScreeningStatus = "SCREENING BY KSPM" | "MINOR REVISION" | "APPROVED BY KSPM";

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

interface MemberProfile {
  user_id: string;
  display_name: string;
  email: string | null;
}

const divisions: Division[] = ["BPH", "CMP", "EVENT", "RESEARCH"];
const statuses: ScreeningStatus[] = ["SCREENING BY KSPM", "MINOR REVISION", "APPROVED BY KSPM"];
const blankForm = { material: "", submitted_at: "", due_at: "", link: "", notes: "" };

const statusStyle: Record<ScreeningStatus, string> = {
  "SCREENING BY KSPM": "border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-100",
  "MINOR REVISION": "border-orange-300 bg-orange-100 text-orange-900 hover:bg-orange-100",
  "APPROVED BY KSPM": "border-emerald-300 bg-emerald-100 text-emerald-900 hover:bg-emerald-100",
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
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [createAccess, setCreateAccess] = useState<Record<Division, boolean>>({ BPH: false, CMP: false, EVENT: false, RESEARCH: false });
  const [manageAccess, setManageAccess] = useState<Record<Division, boolean>>({ BPH: false, CMP: false, EVENT: false, RESEARCH: false });
  const [editingItem, setEditingItem] = useState<ScreeningItem | null>(null);
  const [form, setForm] = useState(blankForm);

  const loadScreening = useCallback(async () => {
    setLoading(true);
    const [itemsResult, evaluatorsResult, checksResult] = await Promise.all([
      supabase.from("screening_items").select("id,division,sequence_no,material,submitted_at,due_at,link,status,notes").order("sequence_no", { ascending: false }),
      supabase.from("screening_evaluators").select("id,division,display_name,display_order,user_id").order("display_order"),
      supabase.from("screening_checks").select("screening_item_id,evaluator_id,checked"),
    ]);
    const error = itemsResult.error ?? evaluatorsResult.error ?? checksResult.error;
    if (error) {
      toast({ title: "Could not load screening dashboard", description: error.message, variant: "destructive" });
    } else {
      setItems((itemsResult.data ?? []) as ScreeningItem[]);
      setEvaluators((evaluatorsResult.data ?? []) as Evaluator[]);
      setChecks((checksResult.data ?? []) as ScreeningCheck[]);
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
    () => items.filter((item) => item.division === division),
    [division, items],
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

  const summary = useMemo(() => ({
    total: divisionItems.length,
    screening: divisionItems.filter((item) => item.status === "SCREENING BY KSPM").length,
    revision: divisionItems.filter((item) => item.status === "MINOR REVISION").length,
    approved: divisionItems.filter((item) => item.status === "APPROVED BY KSPM").length,
    overdue: divisionItems.filter((item) => item.due_at && item.status !== "APPROVED BY KSPM" && item.due_at < new Date().toISOString().slice(0, 10)).length,
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

  const assignEvaluator = async (evaluator: Evaluator, userId: string) => {
    const key = `assignment:${evaluator.id}`;
    setSavingKey(key);
    const { error } = await supabase
      .from("screening_evaluators")
      .update({ user_id: userId === "unassigned" ? null : userId })
      .eq("id", evaluator.id);
    setSavingKey("");
    if (error) {
      toast({ title: "Could not assign evaluator", description: error.message, variant: "destructive" });
      return;
    }
    setEvaluators((current) => current.map((entry) => (
      entry.id === evaluator.id ? { ...entry, user_id: userId === "unassigned" ? null : userId } : entry
    )));
    toast({ title: "Evaluator assignment updated" });
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
      notes: item.notes ?? "",
    });
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
      notes: form.notes.trim() || null,
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
    <section className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="border-b border-primary/15 bg-primary/[0.035]">
        <div className="container flex flex-col justify-between gap-4 py-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-accent" />
              <h1 className="text-xl font-semibold text-foreground">Screening Dashboard</h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Track material review and complete the checklist assigned to your name.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild><Link to="/member">File Manager</Link></Button>
            {isPrimaryAdmin && <Button variant="outline" onClick={() => setAssignmentOpen(true)}><Settings2 className="h-4 w-4" /> Assign Evaluators</Button>}
            {canCreateCurrent && <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Screening</Button>}
          </div>
        </div>
      </div>

      <div className="container py-8">
        <Tabs value={division} onValueChange={(value) => setDivision(value as Division)}>
          <TabsList className="bg-primary/5">
            {divisions.map((item) => <TabsTrigger key={item} value={item}>{item}</TabsTrigger>)}
          </TabsList>
        </Tabs>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            ["Total", summary.total, "border-sky-200 bg-sky-50 text-sky-900"],
            ["Screening", summary.screening, "border-amber-200 bg-amber-50 text-amber-900"],
            ["Revision", summary.revision, "border-orange-200 bg-orange-50 text-orange-900"],
            ["Approved", summary.approved, "border-emerald-200 bg-emerald-50 text-emerald-900"],
            ["Overdue", summary.overdue, "border-rose-200 bg-rose-50 text-rose-900"],
          ].map(([label, value, style]) => (
            <div key={label} className={`rounded-md border px-4 py-3 ${style}`}>
              <p className="text-xs font-semibold uppercase opacity-70">{label}</p>
              <p className="mt-1 text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 overflow-x-auto rounded-md border border-border bg-card shadow-sm">
          {loading ? (
            <div className="flex min-h-52 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading screening data...
            </div>
          ) : (
            <table className="w-full min-w-[1180px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left">
                  <th className="sticky left-0 z-20 w-14 bg-muted px-3 py-3 text-center font-medium text-muted-foreground">No.</th>
                  <th className="sticky left-14 z-20 min-w-64 bg-muted px-4 py-3 font-medium text-muted-foreground">Screening Material</th>
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
                  <tr key={item.id} className="border-b border-border transition-colors last:border-0 hover:bg-primary/[0.025]">
                    <td className="sticky left-0 z-10 bg-card px-3 py-4 text-center text-muted-foreground">{item.sequence_no}</td>
                    <td className="sticky left-14 z-10 bg-card px-4 py-4 font-medium text-foreground">{item.material}</td>
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
                    <td className="max-w-80 px-4 py-4 text-xs leading-relaxed text-muted-foreground">{item.notes || "-"}</td>
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
        <p className="mt-3 text-xs text-muted-foreground">
          Your checklist column in {division}: <span className="font-medium text-foreground">
            {assignedColumns.map((evaluator) => evaluator.display_name).join(", ") || "Not assigned"}
          </span>. Only explicitly assigned columns can be changed.
        </p>
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
            <div className="grid gap-2"><Label htmlFor="screening-notes">Notes</Label><Textarea id="screening-notes" rows={4} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button disabled={!form.material.trim() || savingKey === "item"} onClick={() => void saveItem()}>{savingKey === "item" && <Loader2 className="h-4 w-4 animate-spin" />} Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assignmentOpen} onOpenChange={setAssignmentOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle>Assign {division} Evaluators</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Connect each checklist column to one member account. The displayed column name can stay short and does not need to match the account name.
          </p>
          <div className="grid max-h-[55vh] gap-3 overflow-y-auto py-2">
            {divisionEvaluators.map((evaluator) => (
              <div key={evaluator.id} className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-[140px_1fr] sm:items-center">
                <Label>{evaluator.display_name}</Label>
                <Select
                  value={evaluator.user_id ?? "unassigned"}
                  disabled={savingKey === `assignment:${evaluator.id}`}
                  onValueChange={(value) => void assignEvaluator(evaluator, value)}
                >
                  <SelectTrigger><SelectValue placeholder="Choose member" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Not assigned</SelectItem>
                    {members.map((member) => (
                      <SelectItem key={member.user_id} value={member.user_id}>
                        {member.display_name}{member.email ? ` (${member.email})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <DialogFooter><Button onClick={() => setAssignmentOpen(false)}>Done</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ScreeningDashboard;
