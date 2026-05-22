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

interface EventRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  type: string;
  image: string | null;
}

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const types = ["seminar", "workshop", "competition", "webinar"];

const empty: Partial<EventRow> = {
  title: "", slug: "", description: "", event_date: new Date().toISOString().slice(0, 16),
  event_time: "", location: "", type: "seminar", image: null,
};

const AdminEvents = () => {
  const [items, setItems] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<EventRow>>(empty);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from("events").select("*").order("event_date", { ascending: true });
    setItems((data as EventRow[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { fetchItems(); }, []);

  const openNew = () => { setForm(empty); setOpen(true); };
  const openEdit = (item: EventRow) => {
    setForm({ ...item, event_date: new Date(item.event_date).toISOString().slice(0, 16) });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title || !form.event_date) return;
    setSaving(true);
    const payload = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      description: form.description || null,
      event_date: new Date(form.event_date).toISOString(),
      event_time: form.event_time || null,
      location: form.location || null,
      type: form.type || "seminar",
      image: form.image || null,
    };
    const { error } = form.id
      ? await supabase.from("events").update(payload).eq("id", form.id)
      : await supabase.from("events").insert(payload);
    setSaving(false);
    if (error) return toast({ title: "Save failed", description: error.message, variant: "destructive" });
    toast({ title: form.id ? "Event updated" : "Event created" });
    setOpen(false);
    fetchItems();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) return toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    toast({ title: "Event deleted" });
    fetchItems();
  };

  return (
    <AdminCrudShell title="Events" description="Schedule events and workshops." onAdd={openNew} addLabel="New event">
      {loading ? <p className="text-muted-foreground">Loading...</p> :
       items.length === 0 ? <p className="rounded-md border border-dashed border-border py-10 text-center text-muted-foreground">No events yet.</p> : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50 text-left">
              <th className="px-4 py-3 font-medium text-muted-foreground">Title</th>
              <th className="hidden px-4 py-3 font-medium text-muted-foreground md:table-cell">Type</th>
              <th className="hidden px-4 py-3 font-medium text-muted-foreground sm:table-cell">Date</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr></thead>
            <tbody>
              {items.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">{e.title}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell capitalize">{e.type}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{new Date(e.event_date).toLocaleString()}</td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-1">
                    <button onClick={() => openEdit(e)} className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(e.id)} className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{form.id ? "Edit event" : "New event"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div><Label>Title</Label><Input value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Slug</Label><Input placeholder="auto from title" value={form.slug ?? ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Date & time</Label><Input type="datetime-local" value={form.event_date ?? ""} onChange={(e) => setForm({ ...form, event_date: e.target.value })} /></div>
              <div><Label>Time label (display)</Label><Input placeholder="09:00 - 17:00" value={form.event_time ?? ""} onChange={(e) => setForm({ ...form, event_time: e.target.value })} /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Type</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.type ?? "seminar"} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {types.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div><Label>Location</Label><Input value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            </div>
            <div><Label>Description</Label><Textarea rows={4} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label>Image</Label><ImageUploadField folder="events" value={form.image} onChange={(url) => setForm({ ...form, image: url })} /></div>
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

export default AdminEvents;
