import Section from "@/components/layout/Section";
import SectionHeader from "@/components/layout/SectionHeader";
import { CalendarDays, CheckCircle2, ClipboardList, Users } from "lucide-react";

const steps = [
  { icon: ClipboardList, title: "Submit Application", description: "Fill out the online registration form with your details and motivation." },
  { icon: Users, title: "Interview", description: "Selected candidates will be invited for a short interview with the board." },
  { icon: CheckCircle2, title: "Onboarding", description: "Accepted members join the onboarding program and begin their journey." },
];

const Recruitment = () => (
  <>
    <section className="bg-primary py-20 text-primary-foreground">
      <div className="container">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary-foreground/60">
          Now Accepting Applications
        </p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
          Open Recruitment 2024
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-primary-foreground/70">
          Join KSPM and kickstart your journey in capital markets. We're looking for passionate, curious students ready to learn and grow.
        </p>
        <div className="mt-8 flex items-center gap-3 text-sm text-primary-foreground/60">
          <CalendarDays className="h-4 w-4" />
          <span>Application Deadline: May 30, 2024</span>
        </div>
      </div>
    </section>

    <Section>
      <SectionHeader
        label="How to Join"
        title="Recruitment Process"
        description="Our recruitment process is straightforward and designed to find motivated individuals."
      />
      <div className="grid gap-8 md:grid-cols-3">
        {steps.map((step, i) => (
          <div key={step.title} className="relative rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
              <step.icon className="h-5 w-5" />
            </div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Step {i + 1}
            </span>
            <h3 className="mb-2 text-base font-semibold text-foreground">{step.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </Section>

    <Section variant="muted">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Ready to Apply?
        </h2>
        <p className="mt-3 text-muted-foreground">
          Click below to fill out the application form. Make sure to submit before the deadline.
        </p>
        <a
          href="#"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-accent px-8 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
        >
          Apply Now
        </a>
      </div>
    </Section>
  </>
);

export default Recruitment;
