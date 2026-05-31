import Section from "@/components/layout/Section";
import SectionHeader from "@/components/layout/SectionHeader";
import { useRecruitmentStatus } from "@/hooks/useRecruitmentStatus";
import { Link } from "react-router-dom";
import {
  CalendarDays, CheckCircle2, ClipboardList, Users,
  TrendingUp, Network, GraduationCap, BriefcaseBusiness,
  Lightbulb, Award, Check, Lock,
} from "lucide-react";

const steps = [
  { icon: ClipboardList, title: "Submit Application", description: "Fill out the online registration form with your details and motivation." },
  { icon: Users, title: "Interview", description: "Selected candidates will be invited for a short interview with the board." },
  { icon: CheckCircle2, title: "Onboarding", description: "Accepted members join the onboarding program and begin their journey." },
];

const benefits = [
  { icon: TrendingUp, title: "Real Market Experience", description: "Practice trading and analysis with real market data and professional tools." },
  { icon: Network, title: "Industry Connections", description: "Access a network of finance professionals, alumni, and industry mentors." },
  { icon: GraduationCap, title: "Academic Growth", description: "Publish research papers and deepen your understanding of financial theory." },
  { icon: BriefcaseBusiness, title: "Career Advantage", description: "Stand out in job applications with hands-on capital market experience." },
  { icon: Lightbulb, title: "Financial Literacy", description: "Build strong personal finance skills and smart investment habits." },
  { icon: Award, title: "Certifications & Awards", description: "Earn certificates and compete in national-level finance competitions." },
];

const requirements = [
  "Active university student (any major welcome)",
  "Minimum GPA of 3.00 out of 4.00",
  "Strong interest in capital markets, finance, or economics",
  "Committed to attend programs and activities for at least one academic year",
  "Willing to learn, collaborate, and contribute to the organization",
  "No prior finance experience required — we'll teach you everything",
];

const Recruitment = () => {
  const { isOpen, loading } = useRecruitmentStatus();

  if (loading) {
    return <div className="container py-20 text-center text-muted-foreground">Loading...</div>;
  }

  if (!isOpen) {
    return (
      <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted/30 py-20">
        <div className="container max-w-xl text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Recruitment Closed
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            We are not accepting applications at this time. Please check back later or follow our social media for updates on the next recruitment cycle.
          </p>
          <Link
            to="/"
            className="mt-8 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Back to Home
          </Link>
        </div>
      </section>
    );
  }

  return (
  <>
    <section className="bg-primary py-20 text-primary-foreground">
      <div className="container">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary-foreground/60">
          Now Accepting Applications
        </p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
          Open Recruitment CMP Division 2026
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-primary-foreground/70">
          Join KSPM and kickstart your journey in capital markets. We're looking for passionate, curious students ready to learn and grow.
        </p>
        <div className="mt-8 flex items-center gap-3 text-sm text-primary-foreground/60">
          <CalendarDays className="h-4 w-4" />
          <span>Application Deadline: April 12, 2026</span>
        </div>
      </div>
    </section>

    {/* Benefits */}
    <Section>
      <SectionHeader
        label="Why Join"
        title="Benefits of Joining KSPM"
        description="Here's what you'll gain as a member of our capital market study group."
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((b) => (
          <div
            key={b.title}
            className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-accent/40 hover:bg-muted/50"
          >
            <b.icon className="mb-4 h-6 w-6 text-accent" />
            <h3 className="mb-2 text-base font-semibold text-foreground">{b.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{b.description}</p>
          </div>
        ))}
      </div>
    </Section>

    {/* Requirements */}
    <Section variant="muted">
      <SectionHeader
        label="Eligibility"
        title="Requirements"
        description="Make sure you meet the following criteria before applying."
      />
      <div className="mx-auto max-w-2xl">
        <ul className="space-y-4">
          {requirements.map((req) => (
            <li key={req} className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <span className="text-sm leading-relaxed text-foreground">{req}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>

    {/* Recruitment Process */}
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

    {/* CTA */}
    <Section variant="primary">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Ready to Apply?
        </h2>
        <p className="mt-3 text-primary-foreground/70">
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
