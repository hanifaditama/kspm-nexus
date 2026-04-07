import { useState } from "react";
import Section from "@/components/layout/Section";
import SectionHeader from "@/components/layout/SectionHeader";
import { Mail, MapPin, Phone } from "lucide-react";

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
              <p className="text-sm text-muted-foreground">kspm@university.ac.id</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Phone</h3>
              <p className="text-sm text-muted-foreground">+62 812 3456 7890</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Location</h3>
              <p className="text-sm text-muted-foreground">Faculty of Economics & Business<br />Room 305, 3rd Floor</p>
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="flex items-center justify-center rounded-lg border border-border bg-card p-12 text-center">
            <div>
              <p className="text-lg font-semibold text-foreground">Thank you!</p>
              <p className="mt-2 text-sm text-muted-foreground">We'll get back to you soon.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-border bg-card p-8">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
              <input required className="w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" placeholder="Your name" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
              <input required type="email" className="w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" placeholder="you@example.com" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Message</label>
              <textarea required rows={4} className="w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" placeholder="Your message..." />
            </div>
            <button type="submit" className="w-full rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              Send Message
            </button>
          </form>
        )}
      </div>
    </Section>
  );
};

export default Contact;
