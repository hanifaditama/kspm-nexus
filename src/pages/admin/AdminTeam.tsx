import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AdminCrudShell from "@/components/admin/AdminCrudShell";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface TeamRow {
  id: string;
  name: string;
  role: string;
  division: string | null;
  bio: string | null;
  linkedin: string | null;
  photo: string | null;
  display_order: number;
}

const empty: Partial<TeamRow> = { name: "", role: "", division: "", bio: "", linkedin: "", photo: null, display_order: 0 };

const AdminTeam = () => {
  const [items, setItems] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<TeamRow>>(empty);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from("team_members").select("*").order("display_order").order("name");
    setItems((data as TeamRow[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { fetchItems(); }, []);

  const openNew = () => { setForm(empty); setOpen(true); };
  const openEdit = (item: TeamRow) => { setForm(item); setOpen(true); };

  const save = async () => {
    if (!form.name || !form.role) return;
    setSaving(true);
    const payload = {
      name: form.name,
      role: form.role,
      division: form.division || null,
      bio: form.bio || null,
      linkedin: form.linkedin || null,
      photo: form.photo || null,
      display_order: form.display_order ?? 0,
    };
    const { error } = form.id
      ? await supabase.from("team_members").update(payload).eq("id", form.id)
      : await supabase.from("team_members").insert(payload);
    setSaving(false);
    if (error) return toast({ title: "Save failed", description: error.message, variant: "destructive" });
    toast({ title: form.id ? "Member updated" : "Member added" });
    setOpen(false);
    fetchItems();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this team member?")) return;
    const { error } = await supabase.from("team_members").delete().eq("id", id);
    if (error) return toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    toast({ title: "Member deleted" });
    fetchItems();
  };

  return (
    <AdminCrudShell title="Team" description="Manage team members shown on the public site." onAdd={openNew} addLabel="New member">
      {loading ? <p className="text-muted-foreground">Loading...</p> :
       items.length === 0 ? <p className="rounded-md border border-dashed border-border py-10 text-center text-muted-foreground">No team members yet.</p> : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50 text-left">
              <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
              <th className="hidden px-4 py-3 font-medium text-muted-foreground md:table-cell">Role</th>
              <th className="hidden px-4 py-3 font-medium text-muted-foreground sm:table-cell">Division</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr></thead>
            <tbody>
              {items.map((m) => (
                <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="flex items-center gap-3 px-4 py-3 font-medium text-foreground">
                    {m.photo && <img src={m.photo} alt="" className="h-8 w-8 rounded-full object-cover" />}
                    {m.name}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{m.role}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{m.division ?? "—"}</td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-1">
                    <button onClick={() => openEdit(m)} className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(m.id)} className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader><DialogTitle>{form.id ? "Edit member" : "New member"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Name</Label><Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Role</Label><Input value={form.role ?? ""} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Division</Label><Input value={form.division ?? ""} onChange={(e) => setForm({ ...form, division: e.target.value })} /></div>
              <div><Label>Display order</Label><Input type="number" value={form.display_order ?? 0} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} /></div>
            </div>
            <div><Label>LinkedIn URL</Label><Input value={form.linkedin ?? ""} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} /></div>
            <div><Label>Bio</Label><Textarea rows={3} value={form.bio ?? ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
            <div><Label>Photo</Label><ImageUploadField folder="team" value={form.photo} onChange={(url) => setForm({ ...form, photo: url })} /></div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving || !form.name || !form.role}>{saving ? "Saving..." : "Save"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminCrudShell>
  );
};

export default AdminTeam;
