import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, BookOpen, Eye, Handshake, Lightbulb, Target, Users } from "lucide-react";
import SEO from "@/components/SEO";
import Section from "@/components/layout/Section";
import SectionHeader from "@/components/layout/SectionHeader";

const values = [
  { icon: Target, title: "Excellence", description: "We pursue high standards in every analysis, program, and collaboration." },
  { icon: Eye, title: "Integrity", description: "We value ethical judgment, transparency, and responsible market participation." },
  { icon: BookOpen, title: "Continuous Learning", description: "We encourage curiosity, thoughtful discussion, and evidence-based decisions." },
  { icon: Users, title: "Community", description: "We grow by supporting one another and sharing knowledge across disciplines." },
];

const focusAreas = [
  { icon: BarChart3, title: "Equity Research", description: "Members learn to study industries, analyze companies, build investment theses, and communicate ideas clearly.", href: "/articles", link: "Explore Research" },
  { icon: Lightbulb, title: "Financial Education", description: "Internal classes and discussions turn financial concepts into practical knowledge for students at every level.", href: "/programs", link: "View Programs" },
  { icon: Handshake, title: "Industry Connection", description: "Events and collaborations connect members with professionals, alumni, and the wider capital market community.", href: "/events", link: "Discover Events" },
];

const About = () => (
  <>
    <SEO
      title="About"
      path="/about"
      description="Learn more about UPH Investment Club, our mission, vision, values, and role in developing future capital market leaders."
    />

    <section className="bg-primary py-20 text-primary-foreground md:py-28">
      <div className="container">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">About UPHIC</p>
        <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          Developing thoughtful and capable future capital market leaders.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-primary-foreground/75">
          UPH Investment Club is a student-led community where curiosity about finance becomes practical knowledge, meaningful research, and lasting professional relationships.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link to="/programs" className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90">
            Explore Our Programs <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/recruitment" className="inline-flex items-center rounded-md border border-primary-foreground/30 px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10">
            Join UPHIC
          </Link>
        </div>
      </div>
    </section>

    <Section>
      <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">Who We Are</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">A place to learn markets by doing the work.</h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              UPH Investment Club brings together students from different academic backgrounds who share an interest in investment, business, economics, and capital markets.
            </p>
            <p>
              Through equity research, market discussions, educational programs, events, competitions, and external collaborations, members develop the analytical and organizational skills needed to contribute with confidence.
            </p>
            <p>
              Our goal is not only to understand financial markets, but also to build responsible professionals who can communicate ideas, work across teams, and keep learning as markets evolve.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 border-y border-border">
          {[
            ["Student-led", "Community"],
            ["Cross-major", "Membership"],
            ["Research-driven", "Learning"],
            ["Industry-connected", "Programs"],
          ].map(([value, label]) => (
            <div key={label} className="border-b border-r border-border p-5 last:border-b-0 even:border-r-0 md:p-6">
              <p className="text-lg font-bold text-foreground">{value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>

    <Section variant="muted">
      <div className="grid gap-12 md:grid-cols-2">
        <article>
          <span className="text-sm font-semibold uppercase tracking-widest text-accent">Our Mission</span>
          <h2 className="mt-3 text-2xl font-bold text-foreground">Turn interest into capability.</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            To empower UPH students with the knowledge, practical experience, ethical foundation, and collaborative environment needed to participate meaningfully in finance and capital markets.
          </p>
        </article>
        <article>
          <span className="text-sm font-semibold uppercase tracking-widest text-accent">Our Vision</span>
          <h2 className="mt-3 text-2xl font-bold text-foreground">Build a lasting community of market leaders.</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            To become a respected student investment community known for thoughtful research, relevant education, strong partnerships, and members who create positive impact.
          </p>
        </article>
      </div>
    </Section>

    <Section>
      <SectionHeader label="What We Do" title="From Learning to Real Experience" description="Our activities are designed to help members build knowledge, apply it, and share it." />
      <div className="grid gap-6 md:grid-cols-3">
        {focusAreas.map((area) => (
          <article key={area.title} className="flex flex-col rounded-lg border border-border bg-card p-7">
            <area.icon className="h-6 w-6 text-accent" />
            <h3 className="mt-5 text-xl font-bold text-foreground">{area.title}</h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{area.description}</p>
            <Link to={area.href} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline">
              {area.link} <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </div>
    </Section>

    <Section variant="muted">
      <SectionHeader label="Our Values" title="How We Work and Grow" />
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {values.map((value) => (
          <div key={value.title}>
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-accent/10 text-accent">
              <value.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-foreground">{value.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{value.description}</p>
          </div>
        ))}
      </div>
    </Section>

    <Section variant="primary">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Grow with a community that takes learning seriously.</h2>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-primary-foreground/70">
          Meet the people behind UPHIC or explore how you can become part of the next chapter.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/team" className="rounded-md bg-accent px-7 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90">Meet the Team</Link>
          <Link to="/recruitment" className="rounded-md border border-primary-foreground/30 px-7 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10">Join Us</Link>
        </div>
      </div>
    </Section>
  </>
);

export default About;
