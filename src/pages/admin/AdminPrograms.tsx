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

interface ProgramRow {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  features: string[];
  image: string | null;
  display_order: number;
}

const empty: Partial<ProgramRow> = { title: "", description: "", icon: "BookOpen", features: [], image: null, display_order: 0 };

const AdminPrograms = () => {
  const [items, setItems] = useState<ProgramRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<ProgramRow>>(empty);
  const [featuresText, setFeaturesText] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from("programs").select("*").order("display_order");
    setItems((data as ProgramRow[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { fetchItems(); }, []);

  const openNew = () => { setForm(empty); setFeaturesText(""); setOpen(true); };
  const openEdit = (item: ProgramRow) => {
    setForm(item);
    setFeaturesText((item.features ?? []).join("\n"));
    setOpen(true);
  };

  const save = async () => {
    if (!form.title) return;
    setSaving(true);
    const features = featuresText.split("\n").map((s) => s.trim()).filter(Boolean);
    const payload = {
      title: form.title,
      description: form.description || null,
      icon: form.icon || null,
      features,
      image: form.image || null,
      display_order: form.display_order ?? 0,
    };
    const { error } = form.id
      ? await supabase.from("programs").update(payload).eq("id", form.id)
      : await supabase.from("programs").insert(payload);
    setSaving(false);
    if (error) return toast({ title: "Save failed", description: error.message, variant: "destructive" });
    toast({ title: form.id ? "Program updated" : "Program created" });
    setOpen(false);
    fetchItems();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this program?")) return;
    const { error } = await supabase.from("programs").delete().eq("id", id);
    if (error) return toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    toast({ title: "Program deleted" });
    fetchItems();
  };

  return (
    <AdminCrudShell title="Programs" description="Manage program offerings." onAdd={openNew} addLabel="New program">
      {loading ? <p className="text-muted-foreground">Loading...</p> :
       items.length === 0 ? <p className="rounded-md border border-dashed border-border py-10 text-center text-muted-foreground">No programs yet.</p> : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50 text-left">
              <th className="px-4 py-3 font-medium text-muted-foreground">Title</th>
              <th className="hidden px-4 py-3 font-medium text-muted-foreground sm:table-cell">Features</th>
              <th className="hidden px-4 py-3 font-medium text-muted-foreground md:table-cell">Order</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr></thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">{p.title}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{(p.features ?? []).length}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{p.display_order}</td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-1">
                    <button onClick={() => openEdit(p)} className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(p.id)} className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader><DialogTitle>{form.id ? "Edit program" : "New program"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div><Label>Title</Label><Input value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea rows={4} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Icon (lucide name)</Label><Input value={form.icon ?? ""} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></div>
              <div><Label>Display order</Label><Input type="number" value={form.display_order ?? 0} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} /></div>
            </div>
            <div><Label>Features (one per line)</Label><Textarea rows={4} value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} /></div>
            <div><Label>Image</Label><ImageUploadField folder="programs" value={form.image} onChange={(url) => setForm({ ...form, image: url })} /></div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving || !form.title}>{saving ? "Saving..." : "Save"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminCrudShell>
  );
};

export default AdminPrograms;
