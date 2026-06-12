import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Section from "@/components/layout/Section";
import SectionHeader from "@/components/layout/SectionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Send } from "lucide-react";
import { submitContactForm } from "@/services/contactService";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(100),
  email: z.string().trim().email("Please enter a valid email address.").max(254),
  subject: z.string().trim().min(3, "Please enter a subject.").max(160),
  message: z.string().trim().min(10, "Please include at least 10 characters.").max(5000),
  website: z.string().max(0).optional(),
});

type ContactFields = z.infer<typeof contactSchema>;

const Contact = () => {
  const [result, setResult] = useState<{ message: string; sent: boolean } | null>(null);
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFields>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "", website: "" },
  });

  const onSubmit = async (values: ContactFields) => {
    setSubmitError("");
    setResult(null);
    try {
      const response = await submitContactForm({
        name: values.name ?? "",
        email: values.email ?? "",
        subject: values.subject ?? "",
        message: values.message ?? "",
        website: values.website,
      });
      setResult(response);
      reset();
    } catch {
      setSubmitError("We could not send your message right now. Please email us directly.");
    }
  };

  return (
    <Section>
      <SectionHeader label="Contact" title="Get in Touch" description="Have questions about our programs or want to collaborate? Reach out to us." />
      <div className="grid gap-12 md:grid-cols-2">
        <div className="space-y-8">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Email</h3>
              <a className="text-sm text-muted-foreground hover:text-accent" href="mailto:investment.club@uph.edu">
                investment.club@uph.edu
              </a>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Location</h3>
              <p className="text-sm text-muted-foreground">Universitas Pelita Harapan<br />Tangerang, Indonesia</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-lg border border-border bg-card p-6 sm:p-8" noValidate>
          {result && (
            <div className="rounded-md border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-foreground" role="status">
              {result.message}
            </div>
          )}
          {submitError && (
            <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
              {submitError}{" "}
              <a className="font-medium underline" href="mailto:investment.club@uph.edu">investment.club@uph.edu</a>
            </div>
          )}
          <div className="hidden" aria-hidden="true">
            <Label htmlFor="website">Website</Label>
            <Input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact-name">Name</Label>
            <Input id="contact-name" autoComplete="name" {...register("name")} aria-invalid={Boolean(errors.name)} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact-email">Email</Label>
            <Input id="contact-email" type="email" autoComplete="email" {...register("email")} aria-invalid={Boolean(errors.email)} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact-subject">Subject</Label>
            <Input
              id="contact-subject"
              placeholder="What would you like to discuss?"
              {...register("subject")}
              aria-invalid={Boolean(errors.subject)}
            />
            {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact-message">Message</Label>
            <Textarea id="contact-message" rows={5} {...register("message")} aria-invalid={Boolean(errors.message)} />
            {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </div>
    </Section>
  );
};

export default Contact;
