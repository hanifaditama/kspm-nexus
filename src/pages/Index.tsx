import { Link } from "react-router-dom";
import Section from "@/components/layout/Section";
import SectionHeader from "@/components/layout/SectionHeader";
import ArticleCard from "@/components/cards/ArticleCard";
import EventCard from "@/components/cards/EventCard";
import ProgramCard from "@/components/cards/ProgramCard";
import { articles, events, programs } from "@/data/mock";
import { ArrowRight, TrendingUp, Users, Lightbulb, BriefcaseBusiness, GraduationCap, Network } from "lucide-react";

const benefits = [
  {
    icon: TrendingUp,
    title: "Practical Investment Skills",
    description: "Gain hands-on experience with real market analysis and simulated trading platforms.",
  },
  {
    icon: Network,
    title: "Professional Network",
    description: "Connect with industry professionals, alumni, and like-minded peers in finance.",
  },
  {
    icon: GraduationCap,
    title: "Academic Excellence",
    description: "Strengthen your understanding of financial theory through research and publication.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Career Readiness",
    description: "Build a competitive edge for careers in banking, asset management, and securities.",
  },
  {
    icon: Lightbulb,
    title: "Financial Literacy",
    description: "Develop strong personal finance habits and investment decision-making skills.",
  },
  {
    icon: Users,
    title: "Leadership Development",
    description: "Grow your leadership and organizational skills through event and project management.",
  },
];

const Index = () => (
  <>
    {/* Hero */}
    <section className="relative overflow-hidden bg-primary py-28 text-primary-foreground md:py-40">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(200_80%_45%/0.08),_transparent_50%)]" />
      <div className="container relative">
        <div className="max-w-2xl">
          <p className="animate-fade-up mb-4 text-sm font-medium uppercase tracking-widest text-primary-foreground/60">
            Capital Market Study Group
          </p>
          <h1 className="animate-fade-up-delay-1 text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
            Building Future
            <br />
            Market Leaders
          </h1>
          <p className="animate-fade-up-delay-2 mt-6 max-w-lg text-lg leading-relaxed text-primary-foreground/70">
            Empowering students with capital market knowledge, investment skills, and financial literacy through education, research, and practice.
          </p>
          <div className="animate-fade-up-delay-3 mt-10 flex flex-wrap gap-4">
            <Link
              to="/programs"
              className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
            >
              Explore Programs
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-md border border-primary-foreground/20 px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* Key Benefits */}
    <Section>
      <SectionHeader
        label="Why Join Us"
        title="Key Benefits"
        description="Discover what makes KSPM the premier capital market study group for aspiring finance professionals."
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((benefit) => (
          <div
            key={benefit.title}
            className="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-accent/40 hover:bg-muted/50"
          >
            <benefit.icon className="mb-4 h-6 w-6 text-accent" />
            <h3 className="mb-2 text-base font-semibold text-foreground">{benefit.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{benefit.description}</p>
          </div>
        ))}
      </div>
    </Section>

    {/* About Preview */}
    <Section variant="muted">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <SectionHeader
            label="About Us"
            title="Bridging Academia and Capital Markets"
            description="KSPM is a student-led organization dedicated to advancing financial knowledge and practical investment skills among university students."
            align="left"
          />
          <Link
            to="/about"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-accent/80"
          >
            Read our story
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="rounded-lg bg-background p-12 text-center">
          <p className="font-heading text-5xl font-semibold text-foreground">KSPM</p>
          <p className="mt-2 text-sm text-muted-foreground">Est. 2012</p>
        </div>
      </div>
    </Section>

    {/* Programs */}
    <Section>
      <SectionHeader
        label="Programs"
        title="What We Offer"
        description="Comprehensive programs designed to develop well-rounded capital market professionals."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {programs.map((p) => (
          <ProgramCard key={p._id} program={p} />
        ))}
      </div>
    </Section>

    {/* Articles */}
    <Section variant="muted">
      <div className="mb-12 flex items-end justify-between">
        <SectionHeader label="Articles" title="Latest Insights" className="mb-0" align="left" />
        <Link
          to="/articles"
          className="hidden items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent/80 md:flex"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {articles.map((a) => (
          <ArticleCard key={a._id} article={a} />
        ))}
      </div>
    </Section>

    {/* Events */}
    <Section>
      <div className="mb-12 flex items-end justify-between">
        <SectionHeader label="Events" title="Upcoming Events" className="mb-0" align="left" />
        <Link
          to="/events"
          className="hidden items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent/80 md:flex"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {events.map((e) => (
          <EventCard key={e._id} event={e} />
        ))}
      </div>
    </Section>

    {/* CTA */}
    <Section variant="primary">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Ready to Start Your Journey?</h2>
        <p className="mt-4 text-lg text-primary-foreground/70">
          Join KSPM and gain the knowledge and network to excel in capital markets.
        </p>
        <Link
          to="/contact"
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-accent px-8 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
        >
          Get in Touch
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Section>
  </>
);

export default Index;
