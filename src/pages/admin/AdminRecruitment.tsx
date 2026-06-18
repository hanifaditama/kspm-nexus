import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import useAccessDeniedToast from "@/hooks/useAccessDeniedToast";

interface RecruitmentForm {
  recruitment_eyebrow: string;
  recruitment_title: string;
  recruitment_description: string;
  recruitment_deadline: string;
  recruitment_requirements: string[];
  recruitment_application_url: string;
}

const emptyForm: RecruitmentForm = {
  recruitment_eyebrow: "",
  recruitment_title: "",
  recruitment_description: "",
  recruitment_deadline: "",
  recruitment_requirements: [],
  recruitment_application_url: "",
};

const AdminRecruitment = () => {
  const [form, setForm] = useState<RecruitmentForm>(emptyForm);
  const [requirementsText, setRequirementsText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const denyAccess = useAccessDeniedToast();
  const canEdit = hasPermission("recruitment");

  useEffect(() => {
    void supabase
      .from("site_settings")
      .select("recruitment_eyebrow,recruitment_title,recruitment_description,recruitment_deadline,recruitment_requirements,recruitment_application_url")
      .eq("id", "main")
      .single()
      .then(({ data, error }) => {
        if (error) {
          toast({ title: "Could not load recruitment content", description: error.message, variant: "destructive" });
        } else if (data) {
          const next = {
            recruitment_eyebrow: data.recruitment_eyebrow,
            recruitment_title: data.recruitment_title,
            recruitment_description: data.recruitment_description,
            recruitment_deadline: data.recruitment_deadline ?? "",
            recruitment_requirements: data.recruitment_requirements,
            recruitment_application_url: data.recruitment_application_url ?? "",
          };
          setForm(next);
          setRequirementsText(next.recruitment_requirements.join("\n"));
        }
        setLoading(false);
      });
  }, [toast]);

  const save = async () => {
    if (!canEdit) return denyAccess("You don't have access to edit the recruitment page.");
    const requirements = requirementsText.split("\n").map((item) => item.trim()).filter(Boolean);
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .update({
        recruitment_eyebrow: form.recruitment_eyebrow.trim(),
        recruitment_title: form.recruitment_title.trim(),
        recruitment_description: form.recruitment_description.trim(),
        recruitment_deadline: form.recruitment_deadline || null,
        recruitment_requirements: requirements,
        recruitment_application_url: form.recruitment_application_url.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", "main");
    setSaving(false);
    if (error) {
      toast({ title: "Could not save recruitment content", description: error.message, variant: "destructive" });
      return;
    }
    setForm((current) => ({ ...current, recruitment_requirements: requirements }));
    toast({ title: "Recruitment page updated" });
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading recruitment content...</p>;

  return (
    <div className="max-w-3xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Recruitment Page</h1>
          <p className="mt-1 text-sm text-muted-foreground">Edit the public recruitment headline, deadline, requirements, and application link.</p>
        </div>
        <Button onClick={save} disabled={saving || !form.recruitment_title.trim()}>
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>

      <div className="mt-8 space-y-6">
        <section className="space-y-4 border-b border-border pb-8">
          <h2 className="text-base font-semibold text-foreground">Hero content</h2>
          <div className="space-y-1.5">
            <Label htmlFor="recruitment-eyebrow">Eyebrow</Label>
            <Input id="recruitment-eyebrow" value={form.recruitment_eyebrow} onChange={(event) => setForm({ ...form, recruitment_eyebrow: event.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="recruitment-title">Title</Label>
            <Input id="recruitment-title" value={form.recruitment_title} onChange={(event) => setForm({ ...form, recruitment_title: event.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="recruitment-description">Description</Label>
            <Textarea id="recruitment-description" rows={4} value={form.recruitment_description} onChange={(event) => setForm({ ...form, recruitment_description: event.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="recruitment-deadline">Application deadline</Label>
              <Input id="recruitment-deadline" type="date" value={form.recruitment_deadline} onChange={(event) => setForm({ ...form, recruitment_deadline: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="recruitment-url">Application form URL</Label>
              <Input id="recruitment-url" type="url" placeholder="https://forms.gle/..." value={form.recruitment_application_url} onChange={(event) => setForm({ ...form, recruitment_application_url: event.target.value })} />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Requirements</h2>
            <p className="mt-1 text-sm text-muted-foreground">Enter one requirement per line.</p>
          </div>
          <Textarea rows={9} value={requirementsText} onChange={(event) => setRequirementsText(event.target.value)} />
        </section>
      </div>
    </div>
  );
};

export default AdminRecruitment;
