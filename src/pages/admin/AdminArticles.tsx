import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AdminCrudShell from "@/components/admin/AdminCrudShell";
import ImageUploadField from "@/components/admin/ImageUploadField";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import useAccessDeniedToast from "@/hooks/useAccessDeniedToast";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  content: string | null;
  author_name: string | null;
  cover_image: string | null;
  published_at: string;
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const parseCategories = (value?: string | null) =>
  (value ?? "")
    .split(",")
    .map((category) => category.trim())
    .filter(Boolean);

const stringifyCategories = (categories: string[]) =>
  Array.from(new Map(categories.map((category) => [category.toLowerCase(), category])).values()).join(", ");

const empty: Partial<Article> = {
  title: "",
  slug: "",
  excerpt: "",
  category: "",
  content: "",
  author_name: "",
  cover_image: null,
};

const AdminArticles = () => {
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Article>>(empty);
  const [newCategory, setNewCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const denyAccess = useAccessDeniedToast();
  const canEdit = hasPermission("articles");
  const selectedCategories = useMemo(() => parseCategories(form.category), [form.category]);
  const categoryOptions = useMemo(() => {
    const unique = new Map<string, string>();
    items.forEach((item) => {
      parseCategories(item.category).forEach((category) => {
        unique.set(category.toLowerCase(), category);
      });
    });
    selectedCategories.forEach((category) => unique.set(category.toLowerCase(), category));
    return Array.from(unique.values()).sort((a, b) => a.localeCompare(b));
  }, [items, selectedCategories]);

  const toggleCategory = (category: string) => {
    const next = selectedCategories.some((item) => item.toLowerCase() === category.toLowerCase())
      ? selectedCategories.filter((item) => item.toLowerCase() !== category.toLowerCase())
      : [...selectedCategories, category];
    setForm({ ...form, category: stringifyCategories(next) });
  };

  const addCustomCategory = () => {
    const category = newCategory.trim();
    if (!category) return;
    setForm({ ...form, category: stringifyCategories([...selectedCategories, category]) });
    setNewCategory("");
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("articles").select("*").order("published_at", { ascending: false });
    setItems((data as Article[]) ?? []);
    setLoading(false);
    if (error) toast({ title: "Could not load articles", description: error.message, variant: "destructive" });
  }, [toast]);

  useEffect(() => { void fetchItems(); }, [fetchItems]);

  const openNew = () => {
    if (!canEdit) return denyAccess("You don't have access to create articles.");
    setForm(empty);
    setNewCategory("");
    setOpen(true);
  };
  const openEdit = (item: Article) => {
    if (!canEdit) return denyAccess("You don't have access to edit articles.");
    setForm(item);
    setNewCategory("");
    setOpen(true);
  };

  const save = async () => {
    if (!canEdit) return denyAccess("You don't have access to save articles.");
    if (!form.title) return;
    setSaving(true);
    const slug = form.slug || slugify(form.title);
    const payload = {
      title: form.title,
      slug,
      excerpt: form.excerpt || null,
      category: form.category?.trim() || null,
      content: form.content || null,
      author_name: form.author_name || null,
      cover_image: form.cover_image || null,
    };
    const { data, error } = form.id
      ? await supabase.from("articles").update(payload).eq("id", form.id).select("*").single()
      : await supabase.from("articles").insert(payload).select("*").single();
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: form.id ? "Article updated" : "Article created" });
    setItems((current) => form.id
      ? current.map((item) => item.id === data.id ? data as Article : item)
      : [data as Article, ...current]);
    setOpen(false);
  };

  const remove = async (id: string) => {
    if (!canEdit) return denyAccess("You don't have access to delete articles.");
    if (!confirm("Delete this article?")) return;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) return toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    toast({ title: "Article deleted" });
    setItems((current) => current.filter((item) => item.id !== id));
  };

  return (
    <AdminCrudShell title="Articles" description="Write, edit, and publish articles." onAdd={openNew} addLabel="New article">
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : items.length === 0 ? (
        <p className="rounded-md border border-dashed border-border py-10 text-center text-muted-foreground">No articles yet.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50 text-left">
              <th className="px-4 py-3 font-medium text-muted-foreground">Title</th>
              <th className="hidden px-4 py-3 font-medium text-muted-foreground md:table-cell">Category</th>
              <th className="hidden px-4 py-3 font-medium text-muted-foreground sm:table-cell">Published</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr></thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">{a.title}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{a.category ?? "—"}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{new Date(a.published_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(a)} className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground" title="Edit"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => remove(a.id)} className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" title="Delete"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[94vh] max-w-6xl overflow-y-auto">
          <DialogHeader><DialogTitle>{form.id ? "Edit article" : "New article"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div><Label>Title</Label><Input value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Slug</Label><Input placeholder="auto from title" value={form.slug ?? ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Category</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="mt-1 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-left text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <span className="truncate">
                        {selectedCategories.length > 0 ? selectedCategories.join(", ") : "Choose categories"}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-60" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="max-h-80 w-[min(34rem,calc(100vw-3rem))] overflow-y-auto">
                    {categoryOptions.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">No categories yet</div>
                    ) : categoryOptions.map((category) => (
                      <DropdownMenuCheckboxItem
                        key={category}
                        checked={selectedCategories.some((item) => item.toLowerCase() === category.toLowerCase())}
                        onCheckedChange={() => toggleCategory(category)}
                        onSelect={(event) => event.preventDefault()}
                      >
                        {category}
                      </DropdownMenuCheckboxItem>
                    ))}
                    <DropdownMenuSeparator />
                    <div className="flex gap-2 p-2">
                      <Input
                        placeholder="New category"
                        value={newCategory}
                        onChange={(event) => setNewCategory(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addCustomCategory();
                          }
                        }}
                      />
                      <Button type="button" size="sm" onClick={addCustomCategory}>
                        <Plus className="h-4 w-4" />
                        Add
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div><Label>Author</Label><Input value={form.author_name ?? ""} onChange={(e) => setForm({ ...form, author_name: e.target.value })} /></div>
            </div>
            <div><Label>Excerpt</Label><Textarea rows={2} value={form.excerpt ?? ""} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Content</Label>
              <RichTextEditor value={form.content ?? ""} onChange={(content) => setForm((current) => ({ ...current, content }))} />
            </div>
            <div><Label>Cover image</Label><ImageUploadField folder="articles" value={form.cover_image} onChange={(url) => setForm({ ...form, cover_image: url })} /></div>
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

export default AdminArticles;
