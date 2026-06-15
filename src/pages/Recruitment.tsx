import { Link } from "react-router-dom";
import {
  ArrowRight, BarChart3, CalendarDays, Check, ClipboardCheck, FileText,
  Handshake, Lock, Megaphone, Network, Presentation, Search, Sparkles,
  Target, Trophy, Users, Waypoints,
} from "lucide-react";
import Section from "@/components/layout/Section";
import SectionHeader from "@/components/layout/SectionHeader";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useRecruitmentStatus } from "@/hooks/useRecruitmentStatus";
import SEO from "@/components/SEO";

const steps = [
  { icon: FileText, title: "Registration", description: "Submit your application through the official form." },
  { icon: Search, title: "Screening", description: "The committee will review your application and motivation." },
  { icon: Users, title: "Interview", description: "Selected applicants will be invited for an interview session." },
  { icon: ClipboardCheck, title: "Final Announcement", description: "Accepted applicants will be announced through official UPHIC communication channels." },
  { icon: Sparkles, title: "Onboarding", description: "New members will be introduced to the organization, divisions, programs, and working culture." },
];

const benefits = [
  { icon: BarChart3, title: "Learning Materials", description: "Access finance and investment learning materials." },
  { icon: Presentation, title: "Research Experience", description: "Build equity research and stock pitch experience." },
  { icon: Target, title: "Valuation Practice", description: "Practice financial modeling and valuation." },
  { icon: Network, title: "Professional Network", description: "Connect with professionals and alumni." },
  { icon: Trophy, title: "Competitions & Projects", description: "Join competitions, collaborations, and practical projects." },
  { icon: Waypoints, title: "Leadership Experience", description: "Develop leadership and organizational experience." },
  { icon: ClipboardCheck, title: "Participation Record", description: "Receive a certificate or participation record, if applicable." },
  { icon: Handshake, title: "Supportive Community", description: "Grow with students who share similar interests." },
];

const requirements = [
  "Active UPH student",
  "Interested in finance, investment, business, or capital markets",
  "Willing to learn and contribute actively",
  "Able to work in a team",
  "Responsible and committed to organizational activities",
  "No prior investing experience is required",
];

const divisions = [
  { icon: BarChart3, title: "Research", description: "Explore markets, analyze companies, and turn ideas into thoughtful investment research." },
  { icon: CalendarDays, title: "Event", description: "Plan and deliver programs, workshops, and experiences that connect our community." },
  { icon: Megaphone, title: "Creative, Media, and Publication", description: "Shape UPHIC's voice through visual communication, media, and publication." },
];

const faqs = [
  { question: "Do I need prior investing experience to join?", answer: "No. UPH Investment Club welcomes students from all experience levels. What matters most is your willingness to learn and contribute." },
  { question: "Can students from non-finance majors apply?", answer: "Yes. Students from any major can apply as long as they are interested in investment, finance, business, research, media, or organizational development." },
  { question: "What activities will members join?", answer: "Members may participate in research projects, internal classes, market discussions, workshops, events, competitions, and external collaborations." },
  { question: "Is the recruitment open every semester?", answer: "Recruitment timing depends on the organization's official schedule. Please check this page or UPHIC's official social media for updates." },
  { question: "How do I apply?", answer: "Click the Apply Now button and complete the official registration form." },
];

const Recruitment = () => {
  const { isOpen, settings, loading } = useRecruitmentStatus();

  if (loading) {
    return <div className="container py-20 text-center text-muted-foreground">Loading...</div>;
  }

  if (!isOpen) {
    return (
      <>
        <SEO title="Join Us" path="/recruitment" description="Join UPH Investment Club and grow your knowledge, network, and experience in finance, investment, research, and capital markets." />
        <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted/30 py-20">
          <div className="container max-w-xl text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Recruitment Closed</h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            We are not accepting applications at this time. Please check back later or follow our social media for updates on the next recruitment cycle.
          </p>
          <Link to="/" className="mt-8 inline-block rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
            Back to Home
          </Link>
          </div>
        </section>
      </>
    );
  }

  const deadline = settings?.recruitment_deadline
    ? new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })
      .format(new Date(`${settings.recruitment_deadline}T00:00:00Z`))
    : null;
  const displayRequirements = settings?.recruitment_requirements?.length ? settings.recruitment_requirements : requirements;
  const applicationUrl = settings?.recruitment_application_url;
  const applyHref = applicationUrl ?? "mailto:investment.club@uph.edu?subject=UPHIC%20Recruitment%20Application";

  return (
    <>
      <SEO title="Join Us" path="/recruitment" description="Join UPH Investment Club and grow your knowledge, network, and experience in finance, investment, research, and capital markets." />
      <section className="bg-primary py-20 text-primary-foreground md:py-28">
        <div className="container">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary-foreground/60">{settings?.recruitment_eyebrow}</p>
          <h1 className="max-w-4xl text-3xl font-bold tracking-tight md:text-5xl">{settings?.recruitment_title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-primary-foreground/70">{settings?.recruitment_description}</p>
          {deadline && (
            <div className="mt-8 flex items-center gap-3 text-sm text-primary-foreground/60">
              <CalendarDays className="h-4 w-4" />
              <span>Application Deadline: {deadline}</span>
            </div>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={applyHref} target={applicationUrl ? "_blank" : undefined} rel={applicationUrl ? "noreferrer" : undefined} className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90">
              Apply Now <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#divisions" className="inline-flex items-center rounded-md border border-primary-foreground/30 px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10">
              Explore Our Divisions
            </a>
          </div>
        </div>
      </section>

      <Section>
        <SectionHeader label="Member Benefits" title="What You Will Get" description="Build practical skills, meaningful connections, and the confidence to grow in capital markets." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-accent/40 hover:bg-muted/50">
              <benefit.icon className="mb-4 h-6 w-6 text-accent" />
              <h3 className="mb-2 text-base font-semibold text-foreground">{benefit.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="divisions" variant="muted" className="scroll-mt-16">
        <SectionHeader label="Divisions" title="Choose Your Path" description="Find the area where your strengths and interests can create the most impact." />
        <div className="grid gap-6 md:grid-cols-3">
          {divisions.map((division) => (
            <div key={division.title} className="rounded-lg border border-border bg-card p-7">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-accent/10 text-accent">
                <division.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{division.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{division.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/team" className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline">
            Meet the Team <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      <Section>
        <SectionHeader label="How to Join" title="Recruitment Timeline" description="A clear journey from your application to becoming part of UPH Investment Club." />
        <div className="mx-auto max-w-4xl">
          {steps.map((step, index) => (
            <div key={step.title} className="grid grid-cols-[3rem_1fr] gap-4 md:grid-cols-[4rem_1fr] md:gap-6">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <step.icon className="h-4 w-4" />
                </div>
                {index < steps.length - 1 && <div className="my-2 w-px flex-1 bg-border" />}
              </div>
              <div className="pb-10">
                <span className="text-xs font-semibold uppercase tracking-wider text-accent">Step {index + 1}</span>
                <h3 className="mt-1 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section variant="muted">
        <SectionHeader label="Requirements" title="Who Can Apply?" description="UPH Investment Club is open to UPH students who are interested in finance, investment, capital markets, research, business, economics, or organizational development." />
        <div className="mx-auto max-w-3xl rounded-lg border border-border bg-card p-6 md:p-8">
          <ul className="grid gap-4 md:grid-cols-2">
            {displayRequirements.map((requirement) => (
              <li key={requirement} className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <span className="text-sm leading-relaxed text-foreground">{requirement}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section>
        <SectionHeader label="FAQ" title="Frequently Asked Questions" description="Everything you need to know before submitting your application." />
        <Accordion type="single" collapsible className="mx-auto max-w-3xl border-t border-border">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.question} value={`faq-${index}`}>
              <AccordionTrigger className="py-5 text-left text-base hover:no-underline">{faq.question}</AccordionTrigger>
              <AccordionContent className="pb-5 pr-8 leading-relaxed text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      <Section variant="primary">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Ready to Grow with UPH Investment Club?</h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-primary-foreground/70">
            Take the first step toward building your knowledge, experience, and network in the world of investment and capital markets.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={applyHref} target={applicationUrl ? "_blank" : undefined} rel={applicationUrl ? "noreferrer" : undefined} className="inline-flex items-center gap-2 rounded-md bg-accent px-8 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90">
              Apply Now <ArrowRight className="h-4 w-4" />
            </a>
            <a href="mailto:investment.club@uph.edu" className="inline-flex items-center rounded-md border border-primary-foreground/30 px-8 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10">
              Contact Us
            </a>
          </div>
        </div>
      </Section>
    </>
  );
};

export default Recruitment;
